import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./auth";

// ─── Reputation Guard: Smart Send Throttle ───────────────────────────────────
// Fresh accounts ramp from 5 → unlimited over 14 days.
// The user's actual campaign emails ARE the warmup.
// ──────────────────────────────────────────────────────────────────────────────

// Day → max emails/day. After day 14, unlimited.
const WARMUP_RAMP = [5, 8, 12, 16, 20, 25, 30, 35, 40, 50, 65, 80, 100, 150];
const RAMP_DAYS = WARMUP_RAMP.length; // 14 days
const UNLIMITED = 999999;

/** Get today's date as YYYY-MM-DD */
function getToday(): string {
    return new Date().toISOString().slice(0, 10);
}

/** Calculate the warmup day for an account based on createdAt */
function getWarmupDay(createdAt: number): number {
    const ageMs = Date.now() - createdAt;
    return Math.floor(ageMs / 86400000); // ms → days
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Get send limit info for a specific SMTP account */
export const getSendLimit = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        smtpConfigId: v.id("smtpConfigs"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        const config = await ctx.db.get(args.smtpConfigId);
        if (!config || config.userId !== userId) return null;

        const today = getToday();
        const day = getWarmupDay(config.createdAt);
        const isRamping = day < RAMP_DAYS;
        const dailyLimit = isRamping ? WARMUP_RAMP[day] : UNLIMITED;

        // If the lastSendDate is today, use the current count. Otherwise, count is 0.
        const sentToday = config.lastSendDate === today ? (config.dailySendCount || 0) : 0;
        const remaining = Math.max(0, dailyLimit - sentToday);

        return {
            day,
            rampDays: RAMP_DAYS,
            isRamping,
            dailyLimit: isRamping ? dailyLimit : null, // null = unlimited
            sentToday,
            remaining: isRamping ? remaining : UNLIMITED,
            accountAge: day,
            accountEmail: config.fromEmail,
            accountName: config.fromName || config.name,
        };
    },
});

/** Get send limits for ALL accounts for the current user (dashboard) */
export const getAllSendLimits = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        const configs = await ctx.db
            .query("smtpConfigs")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const today = getToday();

        return configs.map((config) => {
            const day = getWarmupDay(config.createdAt);
            const isRamping = day < RAMP_DAYS;
            const dailyLimit = isRamping ? WARMUP_RAMP[day] : UNLIMITED;
            const sentToday = config.lastSendDate === today ? (config.dailySendCount || 0) : 0;
            const remaining = Math.max(0, dailyLimit - sentToday);
            const progressPercent = isRamping ? Math.round((day / RAMP_DAYS) * 100) : 100;

            return {
                id: config._id,
                email: config.fromEmail,
                name: config.fromName || config.name,
                provider: config.provider || "smtp",
                day,
                rampDays: RAMP_DAYS,
                isRamping,
                dailyLimit: isRamping ? dailyLimit : null,
                sentToday,
                remaining: isRamping ? remaining : UNLIMITED,
                progressPercent,
                createdAt: config.createdAt,
            };
        });
    },
});

/** Get aggregate stats across all accounts */
export const getThrottleStats = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return { total: 0, ramping: 0, unlimited: 0, totalSentToday: 0 };

        const configs = await ctx.db
            .query("smtpConfigs")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const today = getToday();

        let ramping = 0;
        let unlimited = 0;
        let totalSentToday = 0;

        for (const config of configs) {
            const day = getWarmupDay(config.createdAt);
            if (day < RAMP_DAYS) {
                ramping++;
            } else {
                unlimited++;
            }
            if (config.lastSendDate === today) {
                totalSentToday += config.dailySendCount || 0;
            }
        }

        return { total: configs.length, ramping, unlimited, totalSentToday };
    },
});

// ─── Mutations ───────────────────────────────────────────────────────────────

/** Record sends for an account (called after successful bulk/single send) */
export const recordSends = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        smtpConfigId: v.id("smtpConfigs"),
        count: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const config = await ctx.db.get(args.smtpConfigId);
        if (!config || config.userId !== userId) {
            throw new Error("Account not found");
        }

        const today = getToday();

        // If the date changed, reset the counter
        const currentCount = config.lastSendDate === today ? (config.dailySendCount || 0) : 0;

        await ctx.db.patch(args.smtpConfigId, {
            dailySendCount: currentCount + args.count,
            lastSendDate: today,
            lastUsedAt: Date.now(),
        });
    },
});

/** Reset daily send count (for manual override by user) */
export const resetDailyCount = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        smtpConfigId: v.id("smtpConfigs"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const config = await ctx.db.get(args.smtpConfigId);
        if (!config || config.userId !== userId) {
            throw new Error("Account not found");
        }

        await ctx.db.patch(args.smtpConfigId, {
            dailySendCount: 0,
            lastSendDate: getToday(),
        });
    },
});
