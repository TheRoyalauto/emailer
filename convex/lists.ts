import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all mailing lists
export const list = query({
    args: { sessionToken: v.optional(v.string()),},
    handler: async (ctx) => {
        return await ctx.db.query("lists").order("desc").collect();
    },
});

// Get a single list with members
export const get = query({
    args: { id: v.id("lists") },
    handler: async (ctx, args) => {
        const list = await ctx.db.get(args.id);
        if (!list) return null;

        const memberships = await ctx.db
            .query("listMembers")
            .withIndex("by_list", (q) => q.eq("listId", args.id))
            .collect();

        const contacts = await Promise.all(
            memberships.map((m) => ctx.db.get(m.contactId))
        );

        return {
            ...list,
            contacts: contacts.filter(Boolean),
        };
    },
});

// Create a new list
export const create = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        name: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("lists", {
            ...args,
            contactCount: 0,
        });
    },
});

// Update a list
export const update = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        id: v.id("lists"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(id, filtered);
        return await ctx.db.get(id);
    },
});

// Delete a list
export const remove = mutation({
    args: { id: v.id("lists") },
    handler: async (ctx, args) => {
        // Remove all memberships
        const memberships = await ctx.db
            .query("listMembers")
            .withIndex("by_list", (q) => q.eq("listId", args.id))
            .collect();

        for (const membership of memberships) {
            await ctx.db.delete(membership._id);
        }

        await ctx.db.delete(args.id);
    },
});

// Add contacts to list
export const addContacts = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        listId: v.id("lists"),
        contactIds: v.array(v.id("contacts")),
    },
    handler: async (ctx, args) => {
        let added = 0;

        for (const contactId of args.contactIds) {
            // Check if already in list
            const existing = await ctx.db
                .query("listMembers")
                .withIndex("by_list_and_contact", (q) =>
                    q.eq("listId", args.listId).eq("contactId", contactId)
                )
                .first();

            if (!existing) {
                await ctx.db.insert("listMembers", {
                    listId: args.listId,
                    contactId,
                });
                added++;
            }
        }

        // Update count
        const memberships = await ctx.db
            .query("listMembers")
            .withIndex("by_list", (q) => q.eq("listId", args.listId))
            .collect();
        await ctx.db.patch(args.listId, { contactCount: memberships.length });

        return { added };
    },
});

// Remove contact from list
export const removeContact = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        listId: v.id("lists"),
        contactId: v.id("contacts"),
    },
    handler: async (ctx, args) => {
        const membership = await ctx.db
            .query("listMembers")
            .withIndex("by_list_and_contact", (q) =>
                q.eq("listId", args.listId).eq("contactId", args.contactId)
            )
            .first();

        if (membership) {
            await ctx.db.delete(membership._id);
        }

        // Update count
        const memberships = await ctx.db
            .query("listMembers")
            .withIndex("by_list", (q) => q.eq("listId", args.listId))
            .collect();
        await ctx.db.patch(args.listId, { contactCount: memberships.length });
    },
});
