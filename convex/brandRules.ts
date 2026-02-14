import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./auth";

// ═══════════════════════════════════════════════════════════════════════════
// BRAND RULES - Voice & Tone Guidelines for AI-Generated Content
// ═══════════════════════════════════════════════════════════════════════════

// List all brand rules for the current user
export const list = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        return await ctx.db
            .query("emailBrandRules")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

// Get default brand rule
export const getDefault = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        const defaultRule = await ctx.db
            .query("emailBrandRules")
            .withIndex("by_user_default", (q) => q.eq("userId", userId).eq("isDefault", true))
            .first();

        if (defaultRule) return defaultRule;

        // Return first rule if no default set
        return await ctx.db
            .query("emailBrandRules")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();
    },
});

// Get a specific brand rule
export const get = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("emailBrandRules") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        const rule = await ctx.db.get(args.id);
        if (!rule || rule.userId !== userId) return null;

        return rule;
    },
});

// Create a new brand rule
export const create = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
       
        name: v.string(),
        isDefault: v.optional(v.boolean()),
        voiceDescription: v.optional(v.string()),
        voiceSamples: v.optional(v.array(v.string())),
        forbiddenPhrases: v.optional(v.array(v.string())),
        requiredPhrases: v.optional(v.array(v.string())),
        preferredPhrases: v.optional(v.array(v.string())),
        productFacts: v.optional(v.array(v.object({
            fact: v.string(),
            context: v.optional(v.string()),
        }))),
        maxParagraphs: v.optional(v.number()),
        maxSubjectLength: v.optional(v.number()),
        signatureTemplate: v.optional(v.string()),
        companyName: v.optional(v.string()),
        senderPersona: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        // If making this default, unset other defaults
        if (args.isDefault) {
            const existing = await ctx.db
                .query("emailBrandRules")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();

            for (const rule of existing) {
                if (rule.isDefault) {
                    await ctx.db.patch(rule._id, { isDefault: false });
                }
            }
        }

        return await ctx.db.insert("emailBrandRules", {
            userId,
            ...args,
            createdAt: Date.now(),
        });
    },
});

// Update a brand rule
export const update = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
       
        id: v.id("emailBrandRules"),
        name: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        voiceDescription: v.optional(v.string()),
        voiceSamples: v.optional(v.array(v.string())),
        forbiddenPhrases: v.optional(v.array(v.string())),
        requiredPhrases: v.optional(v.array(v.string())),
        preferredPhrases: v.optional(v.array(v.string())),
        productFacts: v.optional(v.array(v.object({
            fact: v.string(),
            context: v.optional(v.string()),
        }))),
        maxParagraphs: v.optional(v.number()),
        maxSubjectLength: v.optional(v.number()),
        signatureTemplate: v.optional(v.string()),
        companyName: v.optional(v.string()),
        senderPersona: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const rule = await ctx.db.get(args.id);
        if (!rule || rule.userId !== userId) throw new Error("Brand rule not found");

        // If making this default, unset other defaults
        if (args.isDefault) {
            const existing = await ctx.db
                .query("emailBrandRules")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();

            for (const r of existing) {
                if (r._id !== args.id && r.isDefault) {
                    await ctx.db.patch(r._id, { isDefault: false });
                }
            }
        }

        const { id, ...updates } = args;
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, {
            ...cleanUpdates,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

// Delete a brand rule
export const remove = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("emailBrandRules") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const rule = await ctx.db.get(args.id);
        if (!rule || rule.userId !== userId) throw new Error("Brand rule not found");

        await ctx.db.delete(args.id);
        return { success: true };
    },
});
