import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

// Helper to get authenticated user
async function getAuthUserId(ctx: any) {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return userId;
}

// List all senders for the current user
export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];
        return await ctx.db
            .query("senders")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

// Get a single sender
export const get = query({
    args: { id: v.id("senders") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;
        const sender = await ctx.db.get(args.id);
        if (!sender || sender.userId !== userId) return null;
        return sender;
    },
});

// Get default sender for the current user
export const getDefault = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const senders = await ctx.db
            .query("senders")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        return senders.find((s) => s.isDefault) || senders[0] || null;
    },
});

// Create a new sender
export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        replyTo: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        // If setting as default, unset others for this user
        if (args.isDefault) {
            const existing = await ctx.db
                .query("senders")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();
            for (const sender of existing) {
                if (sender.isDefault) {
                    await ctx.db.patch(sender._id, { isDefault: false });
                }
            }
        }

        return await ctx.db.insert("senders", {
            name: args.name,
            email: args.email,
            replyTo: args.replyTo,
            userId,
            isDefault: args.isDefault ?? false,
            verified: false,
        });
    },
});

// Update a sender
export const update = mutation({
    args: {
        id: v.id("senders"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        replyTo: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const sender = await ctx.db.get(args.id);
        if (!sender || sender.userId !== userId) {
            throw new Error("Sender not found");
        }

        const { id, isDefault, ...updates } = args;

        // If setting as default, unset others for this user
        if (isDefault) {
            const existing = await ctx.db
                .query("senders")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();
            for (const s of existing) {
                if (s.isDefault && s._id !== id) {
                    await ctx.db.patch(s._id, { isDefault: false });
                }
            }
        }

        const filtered = Object.fromEntries(
            Object.entries({ ...updates, isDefault }).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(id, filtered);
        return await ctx.db.get(id);
    },
});

// Delete a sender
export const remove = mutation({
    args: { id: v.id("senders") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const sender = await ctx.db.get(args.id);
        if (!sender || sender.userId !== userId) {
            throw new Error("Sender not found");
        }
        await ctx.db.delete(args.id);
    },
});
