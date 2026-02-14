import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { getAuthUserId } from "./auth";
import { internal, api } from "./_generated/api";

// ═══════════════════════════════════════════════════════════════════════════
// REPLIES - Inbound Reply Triage & AI Classification
// ═══════════════════════════════════════════════════════════════════════════

export const CLASSIFICATIONS = [
    { id: "positive", label: "Positive", color: "#22c55e", icon: "😊", description: "Interested, wants to proceed" },
    { id: "not_now", label: "Not Now", color: "#f59e0b", icon: "⏰", description: "Interested but timing is wrong" },
    { id: "price_objection", label: "Price Objection", color: "#f97316", icon: "💰", description: "Concerned about cost" },
    { id: "competitor", label: "Competitor", color: "#8b5cf6", icon: "🏢", description: "Using or considering competitor" },
    { id: "angry", label: "Angry", color: "#ef4444", icon: "😠", description: "Upset or negative response" },
    { id: "unsubscribe", label: "Unsubscribe", color: "#6b7280", icon: "🚫", description: "Wants to opt out" },
    { id: "out_of_office", label: "Out of Office", color: "#3b82f6", icon: "✈️", description: "Auto-reply / OOO" },
    { id: "question", label: "Question", color: "#06b6d4", icon: "❓", description: "Has questions, needs info" },
    { id: "unknown", label: "Unknown", color: "#9ca3af", icon: "🤷", description: "Unclear intent" },
] as const;

// List all replies
export const list = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
       
        isProcessed: v.optional(v.boolean()),
        classification: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        let replies = await ctx.db
            .query("inboundReplies")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        if (args.isProcessed !== undefined) {
            replies = replies.filter((r) => r.isProcessed === args.isProcessed);
        }

        if (args.classification) {
            replies = replies.filter((r) => r.classification === args.classification);
        }

        const limited = replies.slice(0, args.limit || 100);

        // Enrich with contact info
        const enriched = await Promise.all(
            limited.map(async (reply) => {
                const contact = await ctx.db.get(reply.contactId);
                const deal = reply.dealId ? await ctx.db.get(reply.dealId) : null;
                return { ...reply, contact, deal };
            })
        );

        return enriched;
    },
});

// Get reply by ID
export const get = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
        id: v.id("inboundReplies") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        const reply = await ctx.db.get(args.id);
        if (!reply || reply.userId !== userId) return null;

        const contact = await ctx.db.get(reply.contactId);
        const deal = reply.dealId ? await ctx.db.get(reply.dealId) : null;

        return { ...reply, contact, deal };
    },
});

// Add a new reply (manual or from webhook)
export const add = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
       
        contactId: v.id("contacts"),
        dealId: v.optional(v.id("deals")),
        campaignId: v.optional(v.id("campaigns")),
        sequenceId: v.optional(v.id("sequences")),
        subject: v.string(),
        body: v.string(),
        fromEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const replyId = await ctx.db.insert("inboundReplies", {
            userId,
            contactId: args.contactId,
            dealId: args.dealId,
            campaignId: args.campaignId,
            sequenceId: args.sequenceId,
            subject: args.subject,
            body: args.body,
            fromEmail: args.fromEmail,
            receivedAt: Date.now(),
            isProcessed: false,
            responseStatus: "pending",
        });

        return replyId;
    },
});

// Update reply classification manually
export const updateClassification = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
       
        id: v.id("inboundReplies"),
        classification: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const reply = await ctx.db.get(args.id);
        if (!reply || reply.userId !== userId) throw new Error("Reply not found");

        await ctx.db.patch(args.id, {
            classification: args.classification as typeof CLASSIFICATIONS[number]["id"],
            isProcessed: true,
            processedAt: Date.now(),
        });

        // Trigger automation based on classification
        const triggerMap: Record<string, string> = {
            positive: "reply_positive",
            not_now: "reply_not_now",
            price_objection: "reply_price",
            competitor: "reply_competitor",
            angry: "reply_angry",
        };

        const triggerType = triggerMap[args.classification];
        if (triggerType) {
            await ctx.scheduler.runAfter(0, internal.automations.executeForTrigger, {
                userId,
                triggerType,
                contactId: reply.contactId,
                dealId: reply.dealId,
                replyId: args.id,
            });
        }

        return { success: true };
    },
});

// Mark reply as responded
export const markResponded = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
        id: v.id("inboundReplies") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const reply = await ctx.db.get(args.id);
        if (!reply || reply.userId !== userId) throw new Error("Reply not found");

        await ctx.db.patch(args.id, {
            responseStatus: "responded",
            respondedAt: Date.now(),
        });

        return { success: true };
    },
});

// Mark reply as ignored
export const markIgnored = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
        id: v.id("inboundReplies") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const reply = await ctx.db.get(args.id);
        if (!reply || reply.userId !== userId) throw new Error("Reply not found");

        await ctx.db.patch(args.id, {
            responseStatus: "ignored",
        });

        return { success: true };
    },
});

// Save AI-generated responses
export const saveResponses = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
       
        id: v.id("inboundReplies"),
        classification: v.string(),
        sentiment: v.optional(v.number()),
        buyingSignals: v.optional(v.object({
            budget: v.optional(v.string()),
            authority: v.optional(v.string()),
            need: v.optional(v.string()),
            timeline: v.optional(v.string()),
            score: v.optional(v.number()),
        })),
        suggestedResponses: v.array(v.object({
            type: v.string(),
            subject: v.string(),
            body: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const reply = await ctx.db.get(args.id);
        if (!reply || reply.userId !== userId) throw new Error("Reply not found");

        await ctx.db.patch(args.id, {
            classification: args.classification as typeof CLASSIFICATIONS[number]["id"],
            sentiment: args.sentiment,
            buyingSignals: args.buyingSignals,
            suggestedResponses: args.suggestedResponses,
            isProcessed: true,
            processedAt: Date.now(),
        });

        // Trigger automation
        const triggerMap: Record<string, string> = {
            positive: "reply_positive",
            not_now: "reply_not_now",
            price_objection: "reply_price",
            competitor: "reply_competitor",
            angry: "reply_angry",
        };

        const triggerType = triggerMap[args.classification];
        if (triggerType) {
            await ctx.scheduler.runAfter(0, internal.automations.executeForTrigger, {
                userId,
                triggerType,
                contactId: reply.contactId,
                dealId: reply.dealId,
                replyId: args.id,
            });
        }

        return { success: true };
    },
});

// Delete reply
export const remove = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
        id: v.id("inboundReplies") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const reply = await ctx.db.get(args.id);
        if (!reply || reply.userId !== userId) throw new Error("Reply not found");

        await ctx.db.delete(args.id);
        return { success: true };
    },
});

// Get reply stats
export const getStats = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null_())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        const replies = await ctx.db
            .query("inboundReplies")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const stats = {
            total: replies.length,
            unprocessed: replies.filter((r) => !r.isProcessed).length,
            pending: replies.filter((r) => r.responseStatus === "pending").length,
            responded: replies.filter((r) => r.responseStatus === "responded").length,
            byClassification: {} as Record<string, number>,
            averageSentiment: 0,
        };

        let sentimentSum = 0;
        let sentimentCount = 0;

        for (const reply of replies) {
            if (reply.classification) {
                stats.byClassification[reply.classification] =
                    (stats.byClassification[reply.classification] || 0) + 1;
            }
            if (reply.sentiment !== undefined) {
                sentimentSum += reply.sentiment;
                sentimentCount++;
            }
        }

        stats.averageSentiment = sentimentCount > 0
            ? Math.round(sentimentSum / sentimentCount)
            : 0;

        return stats;
    },
});

// Get unprocessed count (for badges)
export const getUnprocessedCount = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null_())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return 0;

        const replies = await ctx.db
            .query("inboundReplies")
            .withIndex("by_user_processed", (q) =>
                q.eq("userId", userId).eq("isProcessed", false)
            )
            .collect();

        return replies.length;
    },
});
