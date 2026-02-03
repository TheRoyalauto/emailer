import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all templates
export const list = query({
    args: {
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (args.category) {
            return await ctx.db
                .query("templates")
                .withIndex("by_category", (q) => q.eq("category", args.category!))
                .collect();
        }
        return await ctx.db.query("templates").order("desc").collect();
    },
});

// Get a single template
export const get = query({
    args: { id: v.id("templates") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Create a new template
export const create = mutation({
    args: {
        name: v.string(),
        subject: v.string(),
        htmlBody: v.string(),
        textBody: v.optional(v.string()),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("templates", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

// Update a template
export const update = mutation({
    args: {
        id: v.id("templates"),
        name: v.optional(v.string()),
        subject: v.optional(v.string()),
        htmlBody: v.optional(v.string()),
        textBody: v.optional(v.string()),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
        return await ctx.db.get(id);
    },
});

// Delete a template
export const remove = mutation({
    args: { id: v.id("templates") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// Duplicate a template
export const duplicate = mutation({
    args: { id: v.id("templates") },
    handler: async (ctx, args) => {
        const template = await ctx.db.get(args.id);
        if (!template) throw new Error("Template not found");

        const { _id, _creationTime, ...rest } = template;
        return await ctx.db.insert("templates", {
            ...rest,
            name: `${rest.name} (Copy)`,
        });
    },
});
