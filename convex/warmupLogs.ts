import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./auth";

// ─── Queries ─────────────────────────────────────────────────────────────────────

/** List warmup logs for a specific schedule (paginated, newest first) */
export const listBySchedule = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        scheduleId: v.id("warmupSchedules"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        // Verify the schedule belongs to user
        const schedule = await ctx.db.get(args.scheduleId);
        if (!schedule || schedule.userId !== userId) return [];

        const logs = await ctx.db
            .query("warmupLogs")
            .withIndex("by_schedule", (q) => q.eq("scheduleId", args.scheduleId))
            .order("desc")
            .take(100);

        return logs;
    },
});

/** List all recent warmup logs for the current user */
export const listRecent = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        const limit = args.limit || 50;

        const logs = await ctx.db
            .query("warmupLogs")
            .withIndex("by_user_date", (q) => q.eq("userId", userId))
            .order("desc")
            .take(limit);

        return logs;
    },
});

/** Get log stats for a schedule (counts by type) */
export const getLogStats = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        scheduleId: v.id("warmupSchedules"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        const schedule = await ctx.db.get(args.scheduleId);
        if (!schedule || schedule.userId !== userId) return null;

        const logs = await ctx.db
            .query("warmupLogs")
            .withIndex("by_schedule", (q) => q.eq("scheduleId", args.scheduleId))
            .collect();

        return {
            total: logs.length,
            sent: logs.filter((l) => l.type === "sent" && l.status === "success").length,
            replies: logs.filter((l) => l.type === "reply_received").length,
            bounced: logs.filter((l) => l.type === "bounced").length,
            failed: logs.filter((l) => l.status === "failed").length,
            opened: logs.filter((l) => l.type === "opened").length,
        };
    },
});

// ─── Mutations ───────────────────────────────────────────────────────────────────

/** Record a warmup log entry */
export const record = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        scheduleId: v.id("warmupSchedules"),
        recipientEmail: v.string(),
        subject: v.string(),
        type: v.union(
            v.literal("sent"),
            v.literal("reply_received"),
            v.literal("bounced"),
            v.literal("opened"),
            v.literal("health_check")
        ),
        status: v.union(
            v.literal("success"),
            v.literal("failed")
        ),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const schedule = await ctx.db.get(args.scheduleId);
        if (!schedule || schedule.userId !== userId) {
            throw new Error("Schedule not found");
        }

        return await ctx.db.insert("warmupLogs", {
            userId,
            scheduleId: args.scheduleId,
            smtpConfigId: schedule.smtpConfigId,
            recipientEmail: args.recipientEmail,
            subject: args.subject,
            type: args.type,
            status: args.status,
            error: args.error,
            day: schedule.currentDay,
            createdAt: Date.now(),
        });
    },
});

/** Clear all logs for a schedule */
export const clearBySchedule = mutation({
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

        const logs = await ctx.db
            .query("warmupLogs")
            .withIndex("by_schedule", (q) => q.eq("scheduleId", args.scheduleId))
            .collect();

        for (const log of logs) {
            await ctx.db.delete(log._id);
        }

        return { deleted: logs.length };
    },
});
