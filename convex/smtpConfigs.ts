import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// List all SMTP configs for user
export const list = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        return await ctx.db
            .query("smtpConfigs")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

// Get default SMTP config
export const getDefault = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        return await ctx.db
            .query("smtpConfigs")
            .withIndex("by_user_default", (q) => q.eq("userId", userId).eq("isDefault", true))
            .first();
    },
});

// Get a single SMTP config
export const get = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("smtpConfigs") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const config = await ctx.db.get(args.id);
        if (!config || config.userId !== userId) return null;
        return config;
    },
});

// Create SMTP config
export const create = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
       
        name: v.string(),
        provider: v.optional(v.union(
            v.literal("smtp"),
            v.literal("resend"),
            v.literal("sendgrid"),
            v.literal("mailgun")
        )),
        host: v.optional(v.string()),
        port: v.optional(v.number()),
        secure: v.optional(v.boolean()),
        username: v.optional(v.string()),
        password: v.optional(v.string()),
        apiKey: v.optional(v.string()),
        fromEmail: v.string(),
        fromName: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        // If setting as default, unset other defaults
        if (args.isDefault) {
            const existingDefaults = await ctx.db
                .query("smtpConfigs")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .filter((q) => q.eq(q.field("isDefault"), true))
                .collect();

            for (const config of existingDefaults) {
                await ctx.db.patch(config._id, { isDefault: false });
            }
        }

        return await ctx.db.insert("smtpConfigs", {
            userId,
            name: args.name,
            provider: args.provider || "smtp",
            host: args.host,
            port: args.port,
            secure: args.secure,
            username: args.username,
            password: args.password,
            apiKey: args.apiKey,
            fromEmail: args.fromEmail,
            fromName: args.fromName,
            isDefault: args.isDefault ?? false,
            createdAt: Date.now(),
        });
    },
});


// Update SMTP config
export const update = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
       
        id: v.id("smtpConfigs"),
        name: v.optional(v.string()),
        host: v.optional(v.string()),
        port: v.optional(v.number()),
        secure: v.optional(v.boolean()),
        username: v.optional(v.string()),
        password: v.optional(v.string()),
        fromEmail: v.optional(v.string()),
        fromName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const config = await ctx.db.get(args.id);
        if (!config || config.userId !== userId) {
            throw new Error("Config not found");
        }

        const { id, ...updates } = args;
        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(args.id, filteredUpdates);
        return { success: true };
    },
});

// Set as default
export const setDefault = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("smtpConfigs") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const config = await ctx.db.get(args.id);
        if (!config || config.userId !== userId) {
            throw new Error("Config not found");
        }

        // Unset all other defaults
        const allConfigs = await ctx.db
            .query("smtpConfigs")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        for (const c of allConfigs) {
            if (c._id !== args.id && c.isDefault) {
                await ctx.db.patch(c._id, { isDefault: false });
            }
        }

        await ctx.db.patch(args.id, { isDefault: true });
        return { success: true };
    },
});

// Delete SMTP config
export const remove = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("smtpConfigs") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const config = await ctx.db.get(args.id);
        if (!config || config.userId !== userId) {
            throw new Error("Config not found");
        }

        await ctx.db.delete(args.id);
        return { success: true };
    },
});

// Mark as used
export const markUsed = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("smtpConfigs") },
    handler: async (ctx, args) => {
        const config = await ctx.db.get(args.id);
        if (!config) return;
        await ctx.db.patch(args.id, { lastUsedAt: Date.now() });
    },
});

// Test SMTP connection (returns config for frontend to test)
export const getForTest = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("smtpConfigs") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const config = await ctx.db.get(args.id);
        if (!config || config.userId !== userId) return null;

        // Return full config for testing
        return {
            host: config.host,
            port: config.port,
            secure: config.secure,
            user: config.username,
            pass: config.password,
            from: config.fromEmail,
            fromName: config.fromName,
        };
    },
});
