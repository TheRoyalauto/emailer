import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./auth";

// ═══════════════════════════════════════════════════════════════════════════
// DEALS - Pipeline Management for Active Opportunities
// ═══════════════════════════════════════════════════════════════════════════

export const DEAL_STAGES = [
    { id: "lead", label: "Lead", color: "#6b7280", icon: "🎯", probability: 10 },
    { id: "contacted", label: "Contacted", color: "#3b82f6", icon: "📧", probability: 20 },
    { id: "replied", label: "Replied", color: "#8b5cf6", icon: "💬", probability: 40 },
    { id: "qualified", label: "Qualified", color: "#f59e0b", icon: "⭐", probability: 60 },
    { id: "demo_booked", label: "Demo Booked", color: "#06b6d4", icon: "📅", probability: 70 },
    { id: "proposal_sent", label: "Proposal Sent", color: "#ec4899", icon: "📄", probability: 80 },
    { id: "negotiation", label: "Negotiation", color: "#f97316", icon: "🤝", probability: 90 },
    { id: "closed_won", label: "Closed Won", color: "#22c55e", icon: "🎉", probability: 100 },
    { id: "closed_lost", label: "Closed Lost", color: "#ef4444", icon: "❌", probability: 0 },
] as const;

export type DealStage = typeof DEAL_STAGES[number]["id"];

// List all deals for the current user
export const list = query({
    args: {
        sessionToken: v.optional(v.string()),
       
        stage: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        let q = ctx.db
            .query("deals")
            .withIndex("by_user", (q) => q.eq("userId", userId));

        const deals = await q.order("desc").collect();

        // Filter by stage if specified
        const filtered = args.stage
            ? deals.filter((d) => d.stage === args.stage)
            : deals;

        // Enrich with contact info
        const enriched = await Promise.all(
            filtered.slice(0, args.limit || 100).map(async (deal) => {
                const contact = await ctx.db.get(deal.contactId);
                return { ...deal, contact };
            })
        );

        return enriched;
    },
});

// Get deal by ID
export const get = query({
    args: {
        sessionToken: v.optional(v.string()),
        id: v.id("deals") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        const deal = await ctx.db.get(args.id);
        if (!deal || deal.userId !== userId) return null;

        const contact = await ctx.db.get(deal.contactId);
        return { ...deal, contact };
    },
});

// Get deals by contact
export const getByContact = query({
    args: {
        sessionToken: v.optional(v.string()),
        contactId: v.id("contacts") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        return await ctx.db
            .query("deals")
            .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();
    },
});

// Create a new deal
export const create = mutation({
    args: {
        sessionToken: v.optional(v.string()),
       
        contactId: v.id("contacts"),
        name: v.string(),
        value: v.number(),
        stage: v.optional(v.string()),
        expectedCloseDate: v.optional(v.number()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const contact = await ctx.db.get(args.contactId);
        if (!contact) throw new Error("Contact not found");

        const now = Date.now();
        const stage = (args.stage || "lead") as DealStage;
        const stageInfo = DEAL_STAGES.find((s) => s.id === stage);
        const probability = stageInfo?.probability || 10;

        const dealId = await ctx.db.insert("deals", {
            userId,
            contactId: args.contactId,
            name: args.name,
            value: args.value,
            probability,
            stage,
            expectedCloseDate: args.expectedCloseDate,
            notes: args.notes,
            createdAt: now,
            updatedAt: now,
        });

        // Update contact's sales stage
        await ctx.db.patch(args.contactId, {
            salesStage: stage === "closed_won" ? "closed_won" :
                stage === "closed_lost" ? "closed_lost" :
                    stage === "qualified" ? "qualified" : "contacted",
        });

        return dealId;
    },
});

// Update deal stage
export const updateStage = mutation({
    args: {
        sessionToken: v.optional(v.string()),
       
        id: v.id("deals"),
        stage: v.string(),
        lostReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const deal = await ctx.db.get(args.id);
        if (!deal || deal.userId !== userId) throw new Error("Deal not found");

        const stage = args.stage as DealStage;
        const stageInfo = DEAL_STAGES.find((s) => s.id === stage);
        const probability = stageInfo?.probability || 0;

        const updates: Record<string, unknown> = {
            stage,
            probability,
            updatedAt: Date.now(),
        };

        if (stage === "closed_won") {
            updates.wonDate = Date.now();
        }

        if (stage === "closed_lost" && args.lostReason) {
            updates.lostReason = args.lostReason;
        }

        await ctx.db.patch(args.id, updates);

        // Sync contact stage
        const contact = await ctx.db.get(deal.contactId);
        if (contact) {
            await ctx.db.patch(deal.contactId, {
                salesStage: stage === "closed_won" ? "closed_won" :
                    stage === "closed_lost" ? "closed_lost" :
                        stage === "qualified" ? "qualified" : "contacted",
            });
        }

        return { success: true };
    },
});

// Update deal details
export const update = mutation({
    args: {
        sessionToken: v.optional(v.string()),
       
        id: v.id("deals"),
        name: v.optional(v.string()),
        value: v.optional(v.number()),
        expectedCloseDate: v.optional(v.number()),
        notes: v.optional(v.string()),
        bookingLink: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const deal = await ctx.db.get(args.id);
        if (!deal || deal.userId !== userId) throw new Error("Deal not found");

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

// Delete a deal
export const remove = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        id: v.id("deals") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const deal = await ctx.db.get(args.id);
        if (!deal || deal.userId !== userId) throw new Error("Deal not found");

        await ctx.db.delete(args.id);
        return { success: true };
    },
});

// Get pipeline stats
export const getStats = query({
    args: { sessionToken: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        const deals = await ctx.db
            .query("deals")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const stats = {
            total: deals.length,
            totalValue: deals.reduce((sum, d) => sum + d.value, 0),
            weightedValue: deals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0),
            byStage: {} as Record<string, { count: number; value: number }>,
            wonThisMonth: 0,
            wonValueThisMonth: 0,
            lostThisMonth: 0,
        };

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthStart = startOfMonth.getTime();

        for (const deal of deals) {
            if (!stats.byStage[deal.stage]) {
                stats.byStage[deal.stage] = { count: 0, value: 0 };
            }
            stats.byStage[deal.stage].count++;
            stats.byStage[deal.stage].value += deal.value;

            if (deal.stage === "closed_won" && deal.wonDate && deal.wonDate >= monthStart) {
                stats.wonThisMonth++;
                stats.wonValueThisMonth += deal.value;
            }

            if (deal.stage === "closed_lost" && deal.updatedAt >= monthStart) {
                stats.lostThisMonth++;
            }
        }

        return stats;
    },
});

// Create deal from contact (quick action)
export const createFromContact = mutation({
    args: {
        sessionToken: v.optional(v.string()),
       
        contactId: v.id("contacts"),
        value: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const contact = await ctx.db.get(args.contactId);
        if (!contact) throw new Error("Contact not found");

        const name = contact.company
            ? `${contact.company} Deal`
            : contact.name
                ? `${contact.name} Deal`
                : `Deal - ${contact.email}`;

        const now = Date.now();

        const dealId = await ctx.db.insert("deals", {
            userId,
            contactId: args.contactId,
            name,
            value: args.value || 0,
            probability: 10,
            stage: "lead",
            createdAt: now,
            updatedAt: now,
        });

        return dealId;
    },
});
