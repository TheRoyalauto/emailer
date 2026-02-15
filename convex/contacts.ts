import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

// Helper to get authenticated user
async function getAuthUserId(ctx: any, args: any) {
    const userId = await auth.getUserId(ctx, args);
    if (!userId) throw new Error("Not authenticated");
    return userId;
}

// ═══════════════════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════════════════

// List all contacts for the current user (enhanced with filters + sort)
export const list = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        status: v.optional(
            v.union(v.literal("active"), v.literal("unsubscribed"), v.literal("bounced"))
        ),
        salesStage: v.optional(v.string()),
        batchId: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        searchQuery: v.optional(v.string()),
        sortBy: v.optional(v.string()), // "name" | "email" | "company" | "lastEmailAt" | "leadScore"
        sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) return [];

        const allContacts = await ctx.db
            .query("contacts")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        let filtered = allContacts;

        // Status filter
        if (args.status) {
            filtered = filtered.filter(c => c.status === args.status);
        }

        // Sales stage filter
        if (args.salesStage) {
            filtered = filtered.filter(c => (c.salesStage || "new") === args.salesStage);
        }

        // Batch filter
        if (args.batchId) {
            filtered = filtered.filter(c => c.batchId === args.batchId);
        }

        // Tags filter (match contacts that have ALL specified tags)
        if (args.tags && args.tags.length > 0) {
            filtered = filtered.filter(c => {
                const contactTags = c.tags || [];
                return args.tags!.every(t => contactTags.includes(t));
            });
        }

        // Search across email, name, company
        if (args.searchQuery && args.searchQuery.trim()) {
            const q = args.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(c =>
                c.email?.toLowerCase().includes(q) ||
                c.name?.toLowerCase().includes(q) ||
                c.company?.toLowerCase().includes(q) ||
                c.location?.toLowerCase().includes(q)
            );
        }

        // Sort
        const sortBy = args.sortBy || "name";
        const sortOrder = args.sortOrder || "asc";
        filtered.sort((a, b) => {
            let aVal: any;
            let bVal: any;

            switch (sortBy) {
                case "email":
                    aVal = a.email?.toLowerCase() || "";
                    bVal = b.email?.toLowerCase() || "";
                    break;
                case "company":
                    aVal = a.company?.toLowerCase() || "";
                    bVal = b.company?.toLowerCase() || "";
                    break;
                case "lastEmailAt":
                    aVal = a.lastEmailAt || 0;
                    bVal = b.lastEmailAt || 0;
                    break;
                case "leadScore":
                    aVal = a.leadScore || 0;
                    bVal = b.leadScore || 0;
                    break;
                case "name":
                default:
                    aVal = a.name?.toLowerCase() || a.email?.toLowerCase() || "";
                    bVal = b.name?.toLowerCase() || b.email?.toLowerCase() || "";
                    break;
            }

            if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
            if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        return filtered;
    },
});

// Get a single contact
export const get = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("contacts")
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) return null;
        const contact = await ctx.db.get(args.id);
        if (!contact || contact.userId !== userId) return null;
        return contact;
    },
});

// Get all unique tags across all contacts
export const getAllTags = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) return [];

        const contacts = await ctx.db
            .query("contacts")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const tagSet = new Set<string>();
        for (const c of contacts) {
            if (c.tags) {
                for (const t of c.tags) {
                    tagSet.add(t);
                }
            }
        }
        return Array.from(tagSet).sort();
    },
});

// Find duplicate contacts by email
export const findDuplicates = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) return [];

        const contacts = await ctx.db
            .query("contacts")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        // Group by normalized email
        const emailGroups = new Map<string, typeof contacts>();
        for (const c of contacts) {
            const key = c.email.toLowerCase().trim();
            const group = emailGroups.get(key) || [];
            group.push(c);
            emailGroups.set(key, group);
        }

        // Return only groups with duplicates
        const duplicates: { email: string; contacts: typeof contacts }[] = [];
        for (const [email, group] of emailGroups) {
            if (group.length > 1) {
                duplicates.push({ email, contacts: group });
            }
        }

        return duplicates;
    },
});

// Export contacts as flat data
export const exportData = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        contactIds: v.optional(v.array(v.id("contacts"))),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) return [];

        let contacts;
        if (args.contactIds && args.contactIds.length > 0) {
            // Export specific contacts
            const results = await Promise.all(
                args.contactIds.map(id => ctx.db.get(id))
            );
            contacts = results.filter(c => c && c.userId === userId);
        } else {
            // Export all
            contacts = await ctx.db
                .query("contacts")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();
        }

        return contacts.map(c => ({
            email: c!.email,
            name: c!.name || "",
            company: c!.company || "",
            phone: c!.phone || "",
            location: c!.location || "",
            website: c!.website || "",
            address: c!.address || "",
            status: c!.status || "active",
            salesStage: c!.salesStage || "new",
            tags: (c!.tags || []).join("; "),
            leadScore: c!.leadScore || "",
            emailCount: c!.emailCount || 0,
            callCount: c!.callCount || 0,
        }));
    },
});

// ═══════════════════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════

// Create a new contact
export const create = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        email: v.string(),
        name: v.optional(v.string()),
        company: v.optional(v.string()),
        location: v.optional(v.string()),
        phone: v.optional(v.string()),
        website: v.optional(v.string()),
        address: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        batchId: v.optional(v.id("batches")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);

        // Check for existing contact with same email for this user
        const existing = await ctx.db
            .query("contacts")
            .withIndex("by_user_email", (q) => q.eq("userId", userId).eq("email", args.email))
            .first();

        if (existing) {
            throw new Error("Contact with this email already exists");
        }

        return await ctx.db.insert("contacts", {
            ...args,
            userId,
            status: "active",
        });
    },
});

// Bulk create contacts
export const bulkCreate = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        contacts: v.array(
            v.object({
                email: v.string(),
                name: v.optional(v.string()),
                company: v.optional(v.string()),
                location: v.optional(v.string()),
                phone: v.optional(v.string()),
                website: v.optional(v.string()),
                address: v.optional(v.string()),
                tags: v.optional(v.array(v.string())),
            })
        ),
        listId: v.optional(v.id("lists")),
        batchId: v.optional(v.id("batches")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const created: string[] = [];
        const skipped: string[] = [];

        for (const contact of args.contacts) {
            const existing = await ctx.db
                .query("contacts")
                .withIndex("by_user_email", (q) => q.eq("userId", userId).eq("email", contact.email))
                .first();

            if (existing) {
                skipped.push(contact.email);
                // If batch provided, update existing contact to be in the batch
                if (args.batchId && existing.batchId !== args.batchId) {
                    await ctx.db.patch(existing._id, { batchId: args.batchId });
                }
                // If list provided, add existing contact to list
                if (args.listId) {
                    const membership = await ctx.db
                        .query("listMembers")
                        .withIndex("by_list_and_contact", (q) =>
                            q.eq("listId", args.listId!).eq("contactId", existing._id)
                        )
                        .first();
                    if (!membership) {
                        await ctx.db.insert("listMembers", {
                            listId: args.listId,
                            contactId: existing._id,
                        });
                    }
                }
                continue;
            }

            const contactId = await ctx.db.insert("contacts", {
                ...contact,
                userId,
                status: "active",
                batchId: args.batchId,
            });
            created.push(contact.email);

            // Add to list if provided
            if (args.listId) {
                await ctx.db.insert("listMembers", {
                    listId: args.listId,
                    contactId,
                });
            }
        }

        // Update list count if applicable
        if (args.listId) {
            const members = await ctx.db
                .query("listMembers")
                .withIndex("by_list", (q) => q.eq("listId", args.listId!))
                .collect();
            await ctx.db.patch(args.listId, { contactCount: members.length });
        }

        // Update batch count if applicable
        if (args.batchId) {
            const batchContacts = await ctx.db
                .query("contacts")
                .withIndex("by_batch", (q) => q.eq("batchId", args.batchId!))
                .collect();
            await ctx.db.patch(args.batchId, { contactCount: batchContacts.length });
        }

        return { created: created.length, skipped: skipped.length };
    },
});

// Update a contact (enhanced — accepts all schema fields)
export const update = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("contacts"),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        company: v.optional(v.string()),
        location: v.optional(v.string()),
        phone: v.optional(v.string()),
        website: v.optional(v.string()),
        address: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        status: v.optional(
            v.union(v.literal("active"), v.literal("unsubscribed"), v.literal("bounced"))
        ),
        salesStage: v.optional(v.union(
            v.literal("new"),
            v.literal("contacted"),
            v.literal("follow_up"),
            v.literal("qualified"),
            v.literal("closed_won"),
            v.literal("closed_lost")
        )),
        leadScore: v.optional(v.number()),
        nextFollowUpAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const contact = await ctx.db.get(args.id);
        if (!contact || contact.userId !== userId) {
            throw new Error("Contact not found");
        }
        const { id, sessionToken, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(id, filtered);
        return await ctx.db.get(id);
    },
});

// Delete a contact
export const remove = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("contacts")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const contact = await ctx.db.get(args.id);
        if (!contact || contact.userId !== userId) {
            throw new Error("Contact not found");
        }

        // Remove from all lists first
        const memberships = await ctx.db
            .query("listMembers")
            .withIndex("by_contact", (q) => q.eq("contactId", args.id))
            .collect();

        for (const membership of memberships) {
            await ctx.db.delete(membership._id);
        }

        await ctx.db.delete(args.id);
    },
});

// ═══════════════════════════════════════════════════════════════════════════
// BULK OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

// Bulk delete contacts
export const bulkDelete = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        ids: v.array(v.id("contacts")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        let deleted = 0;

        for (const id of args.ids) {
            const contact = await ctx.db.get(id);
            if (!contact || contact.userId !== userId) continue;

            // Remove list memberships
            const memberships = await ctx.db
                .query("listMembers")
                .withIndex("by_contact", (q) => q.eq("contactId", id))
                .collect();
            for (const m of memberships) {
                await ctx.db.delete(m._id);
            }

            await ctx.db.delete(id);
            deleted++;
        }

        return { deleted };
    },
});

// Bulk update sales stage
export const bulkUpdateStage = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        ids: v.array(v.id("contacts")),
        stage: v.union(
            v.literal("new"),
            v.literal("contacted"),
            v.literal("follow_up"),
            v.literal("qualified"),
            v.literal("closed_won"),
            v.literal("closed_lost")
        ),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        let updated = 0;

        for (const id of args.ids) {
            const contact = await ctx.db.get(id);
            if (!contact || contact.userId !== userId) continue;
            await ctx.db.patch(id, { salesStage: args.stage });
            updated++;
        }

        return { updated };
    },
});

// Bulk add tags
export const bulkAddTags = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        ids: v.array(v.id("contacts")),
        tags: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        let updated = 0;

        for (const id of args.ids) {
            const contact = await ctx.db.get(id);
            if (!contact || contact.userId !== userId) continue;

            const existingTags = contact.tags || [];
            const newTags = [...new Set([...existingTags, ...args.tags])];
            await ctx.db.patch(id, { tags: newTags });
            updated++;
        }

        return { updated };
    },
});

// Bulk remove tags
export const bulkRemoveTags = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        ids: v.array(v.id("contacts")),
        tags: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        let updated = 0;

        for (const id of args.ids) {
            const contact = await ctx.db.get(id);
            if (!contact || contact.userId !== userId) continue;

            const existingTags = contact.tags || [];
            const newTags = existingTags.filter(t => !args.tags.includes(t));
            await ctx.db.patch(id, { tags: newTags });
            updated++;
        }

        return { updated };
    },
});

// Bulk assign to batch
export const bulkAssignBatch = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        ids: v.array(v.id("contacts")),
        batchId: v.id("batches"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        let updated = 0;

        for (const id of args.ids) {
            const contact = await ctx.db.get(id);
            if (!contact || contact.userId !== userId) continue;
            await ctx.db.patch(id, { batchId: args.batchId });
            updated++;
        }

        // Update batch count
        const batchContacts = await ctx.db
            .query("contacts")
            .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
            .collect();
        await ctx.db.patch(args.batchId, { contactCount: batchContacts.length });

        return { updated };
    },
});

// Merge contacts into a primary
export const merge = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        primaryId: v.id("contacts"),
        mergeIds: v.array(v.id("contacts")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);

        const primary = await ctx.db.get(args.primaryId);
        if (!primary || primary.userId !== userId) {
            throw new Error("Primary contact not found");
        }

        for (const mergeId of args.mergeIds) {
            const source = await ctx.db.get(mergeId);
            if (!source || source.userId !== userId) continue;

            // Merge fields — fill in blanks on primary from source
            const updates: Record<string, any> = {};
            if (!primary.name && source.name) updates.name = source.name;
            if (!primary.company && source.company) updates.company = source.company;
            if (!primary.phone && source.phone) updates.phone = source.phone;
            if (!primary.location && source.location) updates.location = source.location;
            if (!primary.website && source.website) updates.website = source.website;
            if (!primary.address && source.address) updates.address = source.address;

            // Merge tags
            const mergedTags = [...new Set([
                ...(primary.tags || []),
                ...(source.tags || []),
            ])];
            updates.tags = mergedTags;

            // Sum activity counts
            updates.emailCount = (primary.emailCount || 0) + (source.emailCount || 0);
            updates.callCount = (primary.callCount || 0) + (source.callCount || 0);

            // Keep most recent activity timestamps
            if (source.lastEmailAt && (!primary.lastEmailAt || source.lastEmailAt > primary.lastEmailAt)) {
                updates.lastEmailAt = source.lastEmailAt;
            }
            if (source.lastCallAt && (!primary.lastCallAt || source.lastCallAt > primary.lastCallAt)) {
                updates.lastCallAt = source.lastCallAt;
            }

            // Take higher lead score
            if (source.leadScore && (!primary.leadScore || source.leadScore > primary.leadScore)) {
                updates.leadScore = source.leadScore;
            }

            if (Object.keys(updates).length > 0) {
                await ctx.db.patch(args.primaryId, updates);
            }

            // Re-assign list memberships from source to primary
            const memberships = await ctx.db
                .query("listMembers")
                .withIndex("by_contact", (q) => q.eq("contactId", mergeId))
                .collect();

            for (const m of memberships) {
                // Check if primary already in this list
                const existing = await ctx.db
                    .query("listMembers")
                    .withIndex("by_list_and_contact", (q) =>
                        q.eq("listId", m.listId).eq("contactId", args.primaryId)
                    )
                    .first();
                if (!existing) {
                    await ctx.db.insert("listMembers", {
                        listId: m.listId,
                        contactId: args.primaryId,
                    });
                }
                await ctx.db.delete(m._id);
            }

            // Re-assign activities from source to primary
            const activities = await ctx.db
                .query("contactActivities")
                .withIndex("by_contact", (q) => q.eq("contactId", mergeId))
                .collect();
            for (const a of activities) {
                await ctx.db.patch(a._id, { contactId: args.primaryId });
            }

            // Re-assign sequence enrollments from source to primary
            const enrollments = await ctx.db
                .query("sequenceEnrollments")
                .withIndex("by_contact", (q) => q.eq("contactId", mergeId))
                .collect();
            for (const e of enrollments) {
                await ctx.db.patch(e._id, { contactId: args.primaryId });
            }

            // Delete the source contact
            await ctx.db.delete(mergeId);
        }

        return await ctx.db.get(args.primaryId);
    },
});
