import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

// Helper to get authenticated user
async function getAuthUserId(ctx: any) {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return userId;
}

// List all contacts for the current user
export const list = query({
    args: {
        status: v.optional(
            v.union(v.literal("active"), v.literal("unsubscribed"), v.literal("bounced"))
        ),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        let query = ctx.db
            .query("contacts")
            .withIndex("by_user", (q) => q.eq("userId", userId));

        const contacts = await query.order("desc").collect();

        if (args.status) {
            return contacts.filter(c => c.status === args.status);
        }
        return contacts;
    },
});

// Get a single contact
export const get = query({
    args: { id: v.id("contacts") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;
        const contact = await ctx.db.get(args.id);
        if (!contact || contact.userId !== userId) return null;
        return contact;
    },
});

// Create a new contact
export const create = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        company: v.optional(v.string()),
        location: v.optional(v.string()),
        phone: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        batchId: v.optional(v.id("batches")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

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
        contacts: v.array(
            v.object({
                email: v.string(),
                name: v.optional(v.string()),
                company: v.optional(v.string()),
                location: v.optional(v.string()),
                phone: v.optional(v.string()),
                tags: v.optional(v.array(v.string())),
            })
        ),
        listId: v.optional(v.id("lists")),
        batchId: v.optional(v.id("batches")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
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

// Update a contact
export const update = mutation({
    args: {
        id: v.id("contacts"),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        company: v.optional(v.string()),
        location: v.optional(v.string()),
        phone: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        status: v.optional(
            v.union(v.literal("active"), v.literal("unsubscribed"), v.literal("bounced"))
        ),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const contact = await ctx.db.get(args.id);
        if (!contact || contact.userId !== userId) {
            throw new Error("Contact not found");
        }
        const { id, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(id, filtered);
        return await ctx.db.get(id);
    },
});

// Delete a contact
export const remove = mutation({
    args: { id: v.id("contacts") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
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
