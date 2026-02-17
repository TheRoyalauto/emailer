import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./auth";

// ═══════════════════════════════════════════════════════════════════════════
// SEND POLICIES - Sending Limits, Business Hours, Warmup Mode
// ═══════════════════════════════════════════════════════════════════════════

// List all send policies for the current user
export const list = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        const policies = await ctx.db
            .query("sendPolicies")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        // Enrich with sender info
        const enriched = await Promise.all(
            policies.map(async (policy) => {
                const smtpConfig = policy.smtpConfigId ? await ctx.db.get(policy.smtpConfigId) : null;
                return { ...policy, sender: smtpConfig };
            })
        );

        return enriched;
    },
});

// Get active policy for a sender (or global)
export const getActive = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),

        smtpConfigId: v.optional(v.id("smtpConfigs")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        // First check for sender-specific policy
        if (args.smtpConfigId) {
            const senderPolicy = await ctx.db
                .query("sendPolicies")
                .withIndex("by_smtpConfig", (q) => q.eq("smtpConfigId", args.smtpConfigId))
                .filter((q) => q.and(
                    q.eq(q.field("userId"), userId),
                    q.eq(q.field("isActive"), true)
                ))
                .first();

            if (senderPolicy) return senderPolicy;
        }

        // Fall back to global policy
        return await ctx.db
            .query("sendPolicies")
            .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
            .filter((q) => q.eq(q.field("smtpConfigId"), undefined))
            .first();
    },
});

// Get a specific policy
export const get = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("sendPolicies")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        const policy = await ctx.db.get(args.id);
        if (!policy || policy.userId !== userId) return null;

        return policy;
    },
});

// Create a new send policy
export const create = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),

        smtpConfigId: v.optional(v.id("smtpConfigs")),
        name: v.string(),
        isActive: v.optional(v.boolean()),
        dailySendLimit: v.number(),
        hourlySendLimit: v.optional(v.number()),
        cooldownMinutes: v.optional(v.number()),
        timezone: v.string(),
        businessHoursStart: v.optional(v.number()),
        businessHoursEnd: v.optional(v.number()),
        businessDays: v.optional(v.array(v.number())),
        isWarmupMode: v.optional(v.boolean()),
        warmupDailyIncrement: v.optional(v.number()),
        warmupStartDate: v.optional(v.number()),
        warmupMaxDaily: v.optional(v.number()),
        maxBounceRate: v.optional(v.number()),
        maxComplaintRate: v.optional(v.number()),
        autoPauseOnBounce: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        // If making this active and it's global, deactivate other global policies
        if (args.isActive && !args.smtpConfigId) {
            const existing = await ctx.db
                .query("sendPolicies")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .filter((q) => q.eq(q.field("smtpConfigId"), undefined))
                .collect();

            for (const policy of existing) {
                if (policy.isActive) {
                    await ctx.db.patch(policy._id, { isActive: false });
                }
            }
        }

        const { sessionToken: _st, ...insertArgs } = args;
        return await ctx.db.insert("sendPolicies", {
            userId,
            ...insertArgs,
            isActive: args.isActive ?? true,
            createdAt: Date.now(),
        });
    },
});

// Update a send policy
export const update = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),

        id: v.id("sendPolicies"),
        smtpConfigId: v.optional(v.id("smtpConfigs")),
        name: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
        dailySendLimit: v.optional(v.number()),
        hourlySendLimit: v.optional(v.number()),
        cooldownMinutes: v.optional(v.number()),
        timezone: v.optional(v.string()),
        businessHoursStart: v.optional(v.number()),
        businessHoursEnd: v.optional(v.number()),
        businessDays: v.optional(v.array(v.number())),
        isWarmupMode: v.optional(v.boolean()),
        warmupDailyIncrement: v.optional(v.number()),
        warmupStartDate: v.optional(v.number()),
        warmupMaxDaily: v.optional(v.number()),
        maxBounceRate: v.optional(v.number()),
        maxComplaintRate: v.optional(v.number()),
        autoPauseOnBounce: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const policy = await ctx.db.get(args.id);
        if (!policy || policy.userId !== userId) throw new Error("Policy not found");

        const { id, sessionToken: _st, ...updates } = args;
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

// Toggle active status
export const toggle = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("sendPolicies")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const policy = await ctx.db.get(args.id);
        if (!policy || policy.userId !== userId) throw new Error("Policy not found");

        await ctx.db.patch(args.id, {
            isActive: !policy.isActive,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

// Delete a send policy
export const remove = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("sendPolicies")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const policy = await ctx.db.get(args.id);
        if (!policy || policy.userId !== userId) throw new Error("Policy not found");

        await ctx.db.delete(args.id);
        return { success: true };
    },
});

// Get today's usage for a sender/global
export const getTodayUsage = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),

        smtpConfigId: v.optional(v.id("smtpConfigs")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return { sent: 0, remaining: 0, limit: 100 };

        // Get active policy
        const policy = await ctx.db
            .query("sendPolicies")
            .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
            .first();

        const dailyLimit = policy?.dailySendLimit || 100;

        // Count sends today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.getTime();

        // This would need campaignId tracking - simplified for now
        const campaigns = await ctx.db
            .query("campaigns")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.and(
                q.eq(q.field("status"), "sent"),
                q.gte(q.field("sentAt"), todayStart)
            ))
            .collect();

        const sent = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);

        return {
            sent,
            remaining: Math.max(0, dailyLimit - sent),
            limit: dailyLimit,
            isWarmup: policy?.isWarmupMode || false,
        };
    },
});
