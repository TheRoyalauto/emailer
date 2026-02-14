import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./auth";

// ═══════════════════════════════════════════════════════════════════════════
// TASKS - Follow-ups, Reminders, and To-dos
// Aligned with original schema: pending/in_progress/completed/cancelled, dueAt
// ═══════════════════════════════════════════════════════════════════════════

const TASK_STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const;
const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const TASK_TYPES = ["follow_up", "call", "email", "meeting", "proposal", "other"] as const;

// List tasks with filters
export const list = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
       
        status: v.optional(v.string()),
        priority: v.optional(v.string()),
        contactId: v.optional(v.id("contacts")),
        dealId: v.optional(v.id("deals")),
        includeCompleted: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        let tasks = await ctx.db
            .query("tasks")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        // Apply filters
        if (args.status) {
            tasks = tasks.filter(t => t.status === args.status);
        }
        if (args.priority) {
            tasks = tasks.filter(t => t.priority === args.priority);
        }
        if (args.contactId) {
            tasks = tasks.filter(t => t.contactId === args.contactId);
        }
        if (args.dealId) {
            tasks = tasks.filter(t => t.dealId === args.dealId);
        }
        if (!args.includeCompleted) {
            tasks = tasks.filter(t => t.status !== "completed" && t.status !== "cancelled");
        }

        // Enrich with contact/deal info
        const enriched = await Promise.all(
            tasks.map(async (task) => {
                const contact = task.contactId ? await ctx.db.get(task.contactId) : null;
                const deal = task.dealId ? await ctx.db.get(task.dealId) : null;
                return { ...task, contact, deal };
            })
        );

        return enriched;
    },
});

// Get upcoming tasks (next 7 days)
export const getUpcoming = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        const now = Date.now();
        const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;

        const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        return tasks
            .filter(t =>
                t.status !== "completed" &&
                t.status !== "cancelled" &&
                t.dueAt &&
                t.dueAt <= weekFromNow
            )
            .sort((a, b) => (a.dueAt || 0) - (b.dueAt || 0))
            .slice(0, 20);
    },
});

// Get overdue tasks
export const getOverdue = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        const now = Date.now();

        const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        return tasks.filter(t =>
            t.status !== "completed" &&
            t.status !== "cancelled" &&
            t.dueAt &&
            t.dueAt < now
        );
    },
});

// Get task stats
export const getStats = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return { total: 0, pending: 0, inProgress: 0, overdue: 0, completedToday: 0 };

        const now = Date.now();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const activeTasks = tasks.filter(t => t.status !== "completed" && t.status !== "cancelled");
        const overdue = activeTasks.filter(t => t.dueAt && t.dueAt < now);
        const completedToday = tasks.filter(t =>
            t.status === "completed" &&
            t.completedAt &&
            t.completedAt >= todayStart.getTime()
        );

        return {
            total: activeTasks.length,
            pending: activeTasks.filter(t => t.status === "pending").length,
            inProgress: activeTasks.filter(t => t.status === "in_progress").length,
            overdue: overdue.length,
            completedToday: completedToday.length,
        };
    },
});

// Create a new task
export const create = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
       
        title: v.string(),
        description: v.optional(v.string()),
        priority: v.optional(v.string()),
        taskType: v.optional(v.string()),
        contactId: v.optional(v.id("contacts")),
        dealId: v.optional(v.id("deals")),
        meetingId: v.optional(v.id("meetings")),
        replyId: v.optional(v.id("inboundReplies")),
        dueAt: v.optional(v.number()),
        reminderAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        return await ctx.db.insert("tasks", {
            userId,
            title: args.title,
            description: args.description,
            status: "pending",
            priority: (args.priority as typeof TASK_PRIORITIES[number]) || "medium",
            taskType: args.taskType as typeof TASK_TYPES[number],
            contactId: args.contactId,
            dealId: args.dealId,
            meetingId: args.meetingId,
            replyId: args.replyId,
            dueAt: args.dueAt,
            reminderAt: args.reminderAt,
            createdAt: Date.now(),
        });
    },
});

// Update a task
export const update = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
       
        id: v.id("tasks"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        status: v.optional(v.string()),
        priority: v.optional(v.string()),
        taskType: v.optional(v.string()),
        dueAt: v.optional(v.number()),
        reminderAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const task = await ctx.db.get(args.id);
        if (!task || task.userId !== userId) throw new Error("Task not found");

        const { id, ...updates } = args;
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, cleanUpdates);

        return { success: true };
    },
});

// Complete a task
export const complete = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
       
        id: v.id("tasks"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const task = await ctx.db.get(args.id);
        if (!task || task.userId !== userId) throw new Error("Task not found");

        await ctx.db.patch(args.id, {
            status: "completed",
            completedAt: Date.now(),
        });

        return { success: true };
    },
});

// Quick-complete (one-click)
export const quickComplete = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("tasks") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const task = await ctx.db.get(args.id);
        if (!task || task.userId !== userId) throw new Error("Task not found");

        await ctx.db.patch(args.id, {
            status: "completed",
            completedAt: Date.now(),
        });

        return { success: true };
    },
});

// Change task status
export const setStatus = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
       
        id: v.id("tasks"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const task = await ctx.db.get(args.id);
        if (!task || task.userId !== userId) throw new Error("Task not found");

        const updates: Record<string, unknown> = {
            status: args.status,
        };

        if (args.status === "completed") {
            updates.completedAt = Date.now();
        }

        await ctx.db.patch(args.id, updates);
        return { success: true };
    },
});

// Delete a task
export const remove = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("tasks") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const task = await ctx.db.get(args.id);
        if (!task || task.userId !== userId) throw new Error("Task not found");

        await ctx.db.delete(args.id);
        return { success: true };
    },
});
