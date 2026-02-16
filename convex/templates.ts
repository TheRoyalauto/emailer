import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

// List all templates for the current user
export const list = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) return [];

        const allTemplates = await ctx.db
            .query("templates")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        if (args.category) {
            return allTemplates.filter(t => t.category === args.category);
        }
        return allTemplates;
    },
});

// Get a single template
export const get = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())), id: v.id("templates") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) return null;
        const template = await ctx.db.get(args.id);
        if (!template || template.userId !== userId) return null;
        return template;
    },
});

// Create a new template
export const create = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        name: v.string(),
        subject: v.string(),
        htmlBody: v.string(),
        textBody: v.optional(v.string()),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const { sessionToken, ...data } = args;
        const now = Date.now();
        return await ctx.db.insert("templates", {
            ...data,
            userId,
            createdAt: now,
            updatedAt: now,
        });
    },
});

// Update a template
export const update = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("templates"),
        name: v.optional(v.string()),
        subject: v.optional(v.string()),
        htmlBody: v.optional(v.string()),
        textBody: v.optional(v.string()),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const template = await ctx.db.get(args.id);
        if (!template || template.userId !== userId) throw new Error("Template not found");

        const { id, sessionToken: _st, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
        return await ctx.db.get(id);
    },
});

// Delete a template
export const remove = mutation({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())), id: v.id("templates") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const template = await ctx.db.get(args.id);
        if (!template || template.userId !== userId) throw new Error("Template not found");

        await ctx.db.delete(args.id);
    },
});

// Duplicate a template
export const duplicate = mutation({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())), id: v.id("templates") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const template = await ctx.db.get(args.id);
        if (!template || template.userId !== userId) throw new Error("Template not found");

        const { _id, _creationTime, ...rest } = template;
        return await ctx.db.insert("templates", {
            ...rest,
            userId,
            name: `${rest.name} (Copy)`,
        });
    },
});
