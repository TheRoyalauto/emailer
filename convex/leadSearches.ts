import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

// List recent searches for the current user
export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("leadSearches")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .take(20);
    },
});

// Save a new search
export const create = mutation({
    args: {
        prompt: v.string(),
        resultsCount: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        return await ctx.db.insert("leadSearches", {
            userId,
            prompt: args.prompt,
            resultsCount: args.resultsCount,
            createdAt: Date.now(),
        });
    },
});

// Delete a search
export const remove = mutation({
    args: { id: v.id("leadSearches") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const search = await ctx.db.get(args.id);
        if (!search || search.userId !== userId) {
            throw new Error("Search not found");
        }

        await ctx.db.delete(args.id);
    },
});

// Clear all searches for user
export const clearAll = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const searches = await ctx.db
            .query("leadSearches")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        for (const search of searches) {
            await ctx.db.delete(search._id);
        }
    },
});
