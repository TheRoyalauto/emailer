import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "./auth";
import { internal } from "./_generated/api";

// ═══════════════════════════════════════════════════════════════════════════
// AUTOMATIONS - Intelligent Trigger-Action Engine
// ═══════════════════════════════════════════════════════════════════════════

export const TRIGGER_TYPES = [
    { id: "reply_positive", label: "Positive Reply", icon: "😊", description: "When a lead responds positively" },
    { id: "reply_objection", label: "Objection Reply", icon: "🤔", description: "When a lead raises an objection" },
    { id: "reply_not_now", label: "Not Now Reply", icon: "⏰", description: "When a lead says not now" },
    { id: "reply_price", label: "Price Objection", icon: "💰", description: "When a lead objects to price" },
    { id: "reply_competitor", label: "Competitor Mention", icon: "🏢", description: "When a lead mentions a competitor" },
    { id: "reply_angry", label: "Angry Reply", icon: "😠", description: "When a lead responds negatively" },
    { id: "no_reply_after", label: "No Reply After", icon: "📭", description: "When no reply after X days" },
    { id: "demo_no_show", label: "Demo No-Show", icon: "👻", description: "When a lead misses their demo" },
    { id: "proposal_sent", label: "Proposal Sent", icon: "📤", description: "When a proposal is sent" },
    { id: "proposal_viewed", label: "Proposal Viewed", icon: "👀", description: "When a proposal is opened" },
    { id: "proposal_accepted", label: "Proposal Accepted", icon: "✅", description: "When a proposal is signed" },
    { id: "stage_change", label: "Stage Change", icon: "📊", description: "When deal stage changes" },
] as const;

export const ACTION_TYPES = [
    { id: "create_deal", label: "Create Deal", icon: "💼", description: "Create a new deal for this contact" },
    { id: "send_sequence", label: "Start Sequence", icon: "📧", description: "Enroll in an email sequence" },
    { id: "update_stage", label: "Update Stage", icon: "📊", description: "Move deal to a new stage" },
    { id: "add_task", label: "Add Task", icon: "✅", description: "Create a follow-up task" },
    { id: "send_booking_link", label: "Send Booking Link", icon: "📅", description: "Send calendar booking link" },
    { id: "send_email", label: "Send Email", icon: "✉️", description: "Send a specific email template" },
    { id: "notify_user", label: "Notify User", icon: "🔔", description: "Send notification to user" },
] as const;

// List all automation rules
export const list = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),

        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        let rules = await ctx.db
            .query("automationRules")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        if (args.isActive !== undefined) {
            rules = rules.filter((r) => r.isActive === args.isActive);
        }

        return rules.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    },
});

// Get rule by ID
export const get = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("automationRules")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        const rule = await ctx.db.get(args.id);
        if (!rule || rule.userId !== userId) return null;

        return rule;
    },
});

// Create automation rule
export const create = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),

        name: v.string(),
        description: v.optional(v.string()),
        triggerType: v.string(),
        triggerConfig: v.optional(v.any()),
        actionType: v.string(),
        actionConfig: v.any(),
        priority: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const ruleId = await ctx.db.insert("automationRules", {
            userId,
            name: args.name,
            description: args.description,
            isActive: true,
            triggerType: args.triggerType as typeof TRIGGER_TYPES[number]["id"],
            triggerConfig: args.triggerConfig,
            actionType: args.actionType as typeof ACTION_TYPES[number]["id"],
            actionConfig: args.actionConfig,
            priority: args.priority || 0,
            createdAt: Date.now(),
        });

        return ruleId;
    },
});

// Update automation rule
export const update = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),

        id: v.id("automationRules"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
        triggerType: v.optional(v.string()),
        triggerConfig: v.optional(v.any()),
        actionType: v.optional(v.string()),
        actionConfig: v.optional(v.any()),
        priority: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const rule = await ctx.db.get(args.id);
        if (!rule || rule.userId !== userId) throw new Error("Rule not found");

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

// Toggle rule active status
export const toggle = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("automationRules")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const rule = await ctx.db.get(args.id);
        if (!rule || rule.userId !== userId) throw new Error("Rule not found");

        await ctx.db.patch(args.id, {
            isActive: !rule.isActive,
            updatedAt: Date.now(),
        });

        return { success: true, isActive: !rule.isActive };
    },
});

// Delete rule
export const remove = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        id: v.id("automationRules")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const rule = await ctx.db.get(args.id);
        if (!rule || rule.userId !== userId) throw new Error("Rule not found");

        await ctx.db.delete(args.id);
        return { success: true };
    },
});

// Get automation logs
export const getLogs = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),

        ruleId: v.optional(v.id("automationRules")),
        contactId: v.optional(v.id("contacts")),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        let logs = await ctx.db
            .query("automationLogs")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .take(args.limit || 100);

        if (args.ruleId) {
            logs = logs.filter((l) => l.ruleId === args.ruleId);
        }
        if (args.contactId) {
            logs = logs.filter((l) => l.contactId === args.contactId);
        }

        // Enrich with rule and contact info
        const enriched = await Promise.all(
            logs.map(async (log) => {
                const [rule, contact] = await Promise.all([
                    ctx.db.get(log.ruleId),
                    ctx.db.get(log.contactId),
                ]);
                return { ...log, rule, contact };
            })
        );

        return enriched;
    },
});

// Execute automation based on trigger
export const executeForTrigger = internalMutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),

        userId: v.id("users"),
        triggerType: v.string(),
        contactId: v.id("contacts"),
        dealId: v.optional(v.id("deals")),
        replyId: v.optional(v.id("inboundReplies")),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // Get active rules for this trigger type
        const rules = await ctx.db
            .query("automationRules")
            .withIndex("by_trigger", (q) => q.eq("triggerType", args.triggerType as typeof TRIGGER_TYPES[number]["id"]))
            .filter((q) =>
                q.and(
                    q.eq(q.field("userId"), args.userId),
                    q.eq(q.field("isActive"), true)
                )
            )
            .collect();

        const results = [];

        for (const rule of rules) {
            try {
                let actionTaken = "";
                let success = true;

                // Execute action based on type
                switch (rule.actionType) {
                    case "create_deal": {
                        const contact = await ctx.db.get(args.contactId);
                        if (contact) {
                            const dealName = contact.company
                                ? `${contact.company} Deal`
                                : `Deal - ${contact.email}`;

                            await ctx.db.insert("deals", {
                                userId: args.userId,
                                contactId: args.contactId,
                                name: dealName,
                                value: rule.actionConfig?.defaultValue || 0,
                                probability: 40,
                                stage: "replied",
                                createdAt: Date.now(),
                                updatedAt: Date.now(),
                            });
                            actionTaken = `Created deal "${dealName}"`;
                        }
                        break;
                    }

                    case "update_stage": {
                        if (args.dealId) {
                            const targetStage = rule.actionConfig?.targetStage || "qualified";
                            await ctx.db.patch(args.dealId, {
                                stage: targetStage,
                                updatedAt: Date.now(),
                            });
                            actionTaken = `Updated deal stage to "${targetStage}"`;
                        }
                        break;
                    }

                    case "add_task": {
                        const taskTitle = rule.actionConfig?.taskTitle || "Follow up";
                        const dueInDays = rule.actionConfig?.dueInDays || 1;

                        await ctx.db.insert("tasks", {
                            userId: args.userId,
                            contactId: args.contactId,
                            dealId: args.dealId,
                            title: taskTitle,
                            priority: rule.actionConfig?.priority || "medium",
                            status: "pending",
                            dueAt: Date.now() + (dueInDays * 24 * 60 * 60 * 1000),
                            createdAt: Date.now(),
                        });
                        actionTaken = `Created task "${taskTitle}"`;
                        break;
                    }

                    case "send_sequence": {
                        const sequenceId = rule.actionConfig?.sequenceId;
                        if (sequenceId) {
                            // Check if already enrolled
                            const existing = await ctx.db
                                .query("sequenceEnrollments")
                                .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
                                .filter((q) => q.eq(q.field("sequenceId"), sequenceId))
                                .first();

                            if (!existing) {
                                await ctx.db.insert("sequenceEnrollments", {
                                    sequenceId,
                                    contactId: args.contactId,
                                    currentStep: 0,
                                    status: "active",
                                    enrolledAt: Date.now(),
                                });
                                actionTaken = `Enrolled in sequence`;
                            } else {
                                actionTaken = `Already enrolled in sequence`;
                            }
                        }
                        break;
                    }

                    case "notify_user": {
                        // For now, just log it - could integrate with external notification service
                        actionTaken = `Notification triggered: ${rule.actionConfig?.message || "Automation triggered"}`;
                        break;
                    }

                    default:
                        actionTaken = `Action type "${rule.actionType}" not implemented`;
                        success = false;
                }

                // Log the execution
                await ctx.db.insert("automationLogs", {
                    userId: args.userId,
                    ruleId: rule._id,
                    contactId: args.contactId,
                    dealId: args.dealId,
                    replyId: args.replyId,
                    triggeredAt: Date.now(),
                    triggerType: args.triggerType,
                    actionTaken,
                    success,
                    metadata: args.metadata,
                });

                results.push({ ruleId: rule._id, success, actionTaken });

            } catch (error) {
                // Log error
                await ctx.db.insert("automationLogs", {
                    userId: args.userId,
                    ruleId: rule._id,
                    contactId: args.contactId,
                    dealId: args.dealId,
                    replyId: args.replyId,
                    triggeredAt: Date.now(),
                    triggerType: args.triggerType,
                    actionTaken: "Error executing action",
                    success: false,
                    error: error instanceof Error ? error.message : "Unknown error",
                    metadata: args.metadata,
                });

                results.push({ ruleId: rule._id, success: false, error: String(error) });
            }
        }

        return results;
    },
});

// Get automation stats
export const getStats = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        const [rules, logs] = await Promise.all([
            ctx.db.query("automationRules")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect(),
            ctx.db.query("automationLogs")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect(),
        ]);

        const last24h = Date.now() - (24 * 60 * 60 * 1000);
        const recentLogs = logs.filter((l) => l.triggeredAt >= last24h);

        return {
            total: rules.length,
            active: rules.filter((r) => r.isActive).length,
            totalExecutions: logs.length,
            executionsLast24h: recentLogs.length,
            successRate: logs.length > 0
                ? Math.round((logs.filter((l) => l.success).length / logs.length) * 100)
                : 100,
        };
    },
});

// Seed default automation rules
export const seedDefaults = mutation({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("automationRules")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (existing) {
            return { seeded: false, message: "Rules already exist" };
        }

        const defaultRules = [
            {
                name: "Create Deal on Positive Reply",
                description: "Automatically creates a deal when a lead responds positively",
                triggerType: "reply_positive" as const,
                actionType: "create_deal" as const,
                actionConfig: { defaultValue: 1000 },
                priority: 1,
            },
            {
                name: "Follow Up Task on Objection",
                description: "Creates a high-priority follow-up task when lead raises objections",
                triggerType: "reply_objection" as const,
                actionType: "add_task" as const,
                actionConfig: { taskTitle: "Address objection - Review reply", priority: "high", dueInDays: 1 },
                priority: 2,
            },
            {
                name: "Reschedule on No-Show",
                description: "Creates a task to reschedule when demo is missed",
                triggerType: "demo_no_show" as const,
                actionType: "add_task" as const,
                actionConfig: { taskTitle: "Reschedule demo - No show", priority: "urgent", dueInDays: 0 },
                priority: 3,
            },
        ];

        for (const rule of defaultRules) {
            await ctx.db.insert("automationRules", {
                userId,
                name: rule.name,
                description: rule.description,
                isActive: true,
                triggerType: rule.triggerType,
                actionType: rule.actionType,
                actionConfig: rule.actionConfig,
                priority: rule.priority,
                createdAt: Date.now(),
            });
        }

        return { seeded: true, count: defaultRules.length };
    },
});
