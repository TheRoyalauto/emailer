import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./auth";

// ─── Warmup ramp schedule: day → emails/day ─────────────────────────────────────
// Gradual 14-day ramp from 5 → 50 emails/day
const WARMUP_RAMP = [5, 8, 12, 16, 20, 25, 28, 32, 36, 40, 43, 46, 48, 50];

// ─── Queries ─────────────────────────────────────────────────────────────────────

/** List all warmup schedules for the current user */
export const list = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        return await ctx.db
            .query("warmupSchedules")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
    },
});

/** Get warmup schedule for a specific sender */
export const getBySender = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        senderId: v.id("senders"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        return await ctx.db
            .query("warmupSchedules")
            .withIndex("by_sender", (q) => q.eq("senderId", args.senderId))
            .first();
    },
});

/** Get warmup stats summary for the user */
export const getStats = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return { total: 0, warming: 0, ready: 0, paused: 0 };

        const schedules = await ctx.db
            .query("warmupSchedules")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        return {
            total: schedules.length,
            warming: schedules.filter((s) => s.status === "warming").length,
            ready: schedules.filter((s) => s.status === "ready").length,
            paused: schedules.filter((s) => s.status === "paused").length,
        };
    },
});

// ─── Mutations ───────────────────────────────────────────────────────────────────

/** Start warmup for a sender */
export const startWarmup = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        senderId: v.id("senders"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        // Verify sender belongs to user
        const sender = await ctx.db.get(args.senderId);
        if (!sender || sender.userId !== userId) {
            throw new Error("Sender not found");
        }

        // Check if warmup already exists for this sender
        const existing = await ctx.db
            .query("warmupSchedules")
            .withIndex("by_sender", (q) => q.eq("senderId", args.senderId))
            .first();

        if (existing) {
            if (existing.status === "warming") {
                throw new Error("Warmup already in progress for this sender");
            }
            // Resume or restart
            await ctx.db.patch(existing._id, {
                status: "warming",
                currentDay: existing.status === "paused" ? existing.currentDay : 0,
                currentDailyVolume: WARMUP_RAMP[existing.status === "paused" ? existing.currentDay : 0],
                emailsSentToday: 0,
                startedAt: Date.now(),
                pausedAt: undefined,
                completedAt: undefined,
                lastActivityAt: Date.now(),
            });
            return existing._id;
        }

        // Create new warmup schedule
        return await ctx.db.insert("warmupSchedules", {
            userId,
            senderId: args.senderId,
            senderEmail: sender.email,
            senderName: sender.name,
            status: "warming",
            currentDay: 0,
            totalDays: 14,
            currentDailyVolume: WARMUP_RAMP[0],
            targetDailyVolume: 50,
            emailsSentToday: 0,
            totalEmailsSent: 0,
            repliesReceived: 0,
            healthScore: 50, // Start at 50, improves with successful sends
            startedAt: Date.now(),
            createdAt: Date.now(),
            lastActivityAt: Date.now(),
        });
    },
});

/** Pause warmup for a sender */
export const pauseWarmup = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        scheduleId: v.id("warmupSchedules"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const schedule = await ctx.db.get(args.scheduleId);
        if (!schedule || schedule.userId !== userId) {
            throw new Error("Schedule not found");
        }

        if (schedule.status !== "warming") {
            throw new Error("Can only pause an active warmup");
        }

        await ctx.db.patch(args.scheduleId, {
            status: "paused",
            pausedAt: Date.now(),
            lastActivityAt: Date.now(),
        });
    },
});

/** Resume warmup for a sender */
export const resumeWarmup = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        scheduleId: v.id("warmupSchedules"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const schedule = await ctx.db.get(args.scheduleId);
        if (!schedule || schedule.userId !== userId) {
            throw new Error("Schedule not found");
        }

        if (schedule.status !== "paused") {
            throw new Error("Can only resume a paused warmup");
        }

        await ctx.db.patch(args.scheduleId, {
            status: "warming",
            pausedAt: undefined,
            lastActivityAt: Date.now(),
            currentDailyVolume: WARMUP_RAMP[Math.min(schedule.currentDay, WARMUP_RAMP.length - 1)],
        });
    },
});

/** Advance warmup to next day (called by scheduler or cron) */
export const advanceDay = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        scheduleId: v.id("warmupSchedules"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const schedule = await ctx.db.get(args.scheduleId);
        if (!schedule || schedule.userId !== userId) {
            throw new Error("Schedule not found");
        }

        if (schedule.status !== "warming") {
            throw new Error("Warmup is not active");
        }

        const nextDay = schedule.currentDay + 1;

        // Check if warmup is complete
        if (nextDay >= schedule.totalDays) {
            await ctx.db.patch(args.scheduleId, {
                status: "ready",
                currentDay: schedule.totalDays,
                currentDailyVolume: schedule.targetDailyVolume,
                emailsSentToday: 0,
                healthScore: Math.min(100, schedule.healthScore + 5),
                completedAt: Date.now(),
                lastActivityAt: Date.now(),
            });
            return;
        }

        // Advance to next day
        const newVolume = WARMUP_RAMP[Math.min(nextDay, WARMUP_RAMP.length - 1)];
        await ctx.db.patch(args.scheduleId, {
            currentDay: nextDay,
            currentDailyVolume: newVolume,
            emailsSentToday: 0,
            lastActivityAt: Date.now(),
        });
    },
});

/** Record a sent warmup email */
export const recordSend = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        scheduleId: v.id("warmupSchedules"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const schedule = await ctx.db.get(args.scheduleId);
        if (!schedule || schedule.userId !== userId) {
            throw new Error("Schedule not found");
        }

        await ctx.db.patch(args.scheduleId, {
            emailsSentToday: schedule.emailsSentToday + 1,
            totalEmailsSent: schedule.totalEmailsSent + 1,
            lastActivityAt: Date.now(),
        });
    },
});

/** Record a reply received during warmup */
export const recordReply = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        scheduleId: v.id("warmupSchedules"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const schedule = await ctx.db.get(args.scheduleId);
        if (!schedule || schedule.userId !== userId) {
            throw new Error("Schedule not found");
        }

        // Replies improve health score
        const newHealth = Math.min(100, schedule.healthScore + 2);

        await ctx.db.patch(args.scheduleId, {
            repliesReceived: schedule.repliesReceived + 1,
            healthScore: newHealth,
            lastActivityAt: Date.now(),
        });
    },
});

/** Update health score (e.g., from deliverability check) */
export const updateHealthScore = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        scheduleId: v.id("warmupSchedules"),
        healthScore: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const schedule = await ctx.db.get(args.scheduleId);
        if (!schedule || schedule.userId !== userId) {
            throw new Error("Schedule not found");
        }

        const clamped = Math.max(0, Math.min(100, args.healthScore));

        // Auto-pause if health drops below 30
        if (clamped < 30 && schedule.status === "warming") {
            await ctx.db.patch(args.scheduleId, {
                healthScore: clamped,
                status: "paused",
                pausedAt: Date.now(),
                lastActivityAt: Date.now(),
            });
            return;
        }

        await ctx.db.patch(args.scheduleId, {
            healthScore: clamped,
            lastActivityAt: Date.now(),
        });
    },
});

/** Delete a warmup schedule */
export const remove = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        scheduleId: v.id("warmupSchedules"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const schedule = await ctx.db.get(args.scheduleId);
        if (!schedule || schedule.userId !== userId) {
            throw new Error("Schedule not found");
        }

        await ctx.db.delete(args.scheduleId);
    },
});
