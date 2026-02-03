import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

// Helper to get authenticated user
async function getAuthUserId(ctx: any) {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return userId;
}

// List all batches for the current user
export const list = query({
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];
        return await ctx.db
            .query("batches")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

// List only top-level (parent) batches
export const listParentBatches = query({
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];
        const allBatches = await ctx.db
            .query("batches")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        // Filter to only those without a parent
        return allBatches.filter(b => !b.parentBatchId);
    },
});

// List child batches of a parent
export const listChildBatches = query({
    args: { parentBatchId: v.id("batches") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        const parent = await ctx.db.get(args.parentBatchId);
        if (!parent || parent.userId !== userId) return [];

        return await ctx.db
            .query("batches")
            .withIndex("by_parent", (q) => q.eq("parentBatchId", args.parentBatchId))
            .collect();
    },
});

// Get a single batch with contacts and child batches
export const get = query({
    args: { id: v.id("batches") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const batch = await ctx.db.get(args.id);
        if (!batch || batch.userId !== userId) return null;

        const contacts = await ctx.db
            .query("contacts")
            .withIndex("by_batch", (q) => q.eq("batchId", args.id))
            .collect();

        // Get child batches
        const childBatches = await ctx.db
            .query("batches")
            .withIndex("by_parent", (q) => q.eq("parentBatchId", args.id))
            .collect();

        return { ...batch, contacts, childBatches };
    },
});

// Create a new batch (optionally nested under a parent batch)
export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        color: v.optional(v.string()),
        parentBatchId: v.optional(v.id("batches")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        // If parent batch specified, verify ownership
        if (args.parentBatchId) {
            const parent = await ctx.db.get(args.parentBatchId);
            if (!parent || parent.userId !== userId) {
                throw new Error("Parent batch not found");
            }
        }

        return await ctx.db.insert("batches", {
            name: args.name,
            description: args.description,
            color: args.color,
            parentBatchId: args.parentBatchId,
            userId,
            contactCount: 0,
            createdAt: Date.now(),
        });
    },
});

// Update batch
export const update = mutation({
    args: {
        id: v.id("batches"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        color: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const batch = await ctx.db.get(args.id);
        if (!batch || batch.userId !== userId) {
            throw new Error("Batch not found");
        }
        const { id, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(id, filtered);
        return await ctx.db.get(id);
    },
});

// Delete batch (contacts remain, just unassigned)
export const remove = mutation({
    args: { id: v.id("batches") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const batch = await ctx.db.get(args.id);
        if (!batch || batch.userId !== userId) {
            throw new Error("Batch not found");
        }

        // Unassign contacts from this batch
        const contacts = await ctx.db
            .query("contacts")
            .withIndex("by_batch", (q) => q.eq("batchId", args.id))
            .collect();

        for (const contact of contacts) {
            await ctx.db.patch(contact._id, { batchId: undefined });
        }

        await ctx.db.delete(args.id);
    },
});

// Get contacts by batch
export const getContacts = query({
    args: { batchId: v.id("batches") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        const batch = await ctx.db.get(args.batchId);
        if (!batch || batch.userId !== userId) return [];

        return await ctx.db
            .query("contacts")
            .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
            .collect();
    },
});

// Update batch contact count
export const updateCount = mutation({
    args: { id: v.id("batches") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const batch = await ctx.db.get(args.id);
        if (!batch || batch.userId !== userId) {
            throw new Error("Batch not found");
        }

        const contacts = await ctx.db
            .query("contacts")
            .withIndex("by_batch", (q) => q.eq("batchId", args.id))
            .collect();
        await ctx.db.patch(args.id, { contactCount: contacts.length });
    },
});

// Create a new batch from selected contacts (optionally as child of parent)
export const createFromSelection = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        color: v.optional(v.string()),
        contactIds: v.array(v.id("contacts")),
        parentBatchId: v.optional(v.id("batches")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        // Verify parent batch ownership if specified
        if (args.parentBatchId) {
            const parent = await ctx.db.get(args.parentBatchId);
            if (!parent || parent.userId !== userId) {
                throw new Error("Parent batch not found");
            }
        }

        // Create the new batch
        const batchId = await ctx.db.insert("batches", {
            userId,
            parentBatchId: args.parentBatchId,
            name: args.name,
            description: args.description,
            color: args.color,
            contactCount: args.contactIds.length,
            createdAt: Date.now(),
        });

        // Update all selected contacts to belong to this batch
        for (const contactId of args.contactIds) {
            const contact = await ctx.db.get(contactId);
            // Verify ownership
            if (contact && contact.userId === userId) {
                await ctx.db.patch(contactId, { batchId });
            }
        }

        return batchId;
    },
});

// Add contacts to existing batch (for reusing contacts in multiple contexts)
export const addContactsToBatch = mutation({
    args: {
        batchId: v.id("batches"),
        contactIds: v.array(v.id("contacts")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        const batch = await ctx.db.get(args.batchId);
        if (!batch || batch.userId !== userId) {
            throw new Error("Batch not found");
        }

        // Update all selected contacts to belong to this batch
        let added = 0;
        for (const contactId of args.contactIds) {
            const contact = await ctx.db.get(contactId);
            if (contact && contact.userId === userId) {
                await ctx.db.patch(contactId, { batchId: args.batchId });
                added++;
            }
        }

        // Update batch count
        const allContacts = await ctx.db
            .query("contacts")
            .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
            .collect();
        await ctx.db.patch(args.batchId, { contactCount: allContacts.length });

        return { added };
    },
});
