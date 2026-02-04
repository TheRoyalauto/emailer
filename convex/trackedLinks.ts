import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ═══════════════════════════════════════════════════════════════════════════
// TRACKED LINKS - Click Tracking with UTM Parameters
// ═══════════════════════════════════════════════════════════════════════════

// Generate a short random code
function generateCode(length = 8): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// List all tracked links for the current user
export const list = query({
    args: {
        campaignId: v.optional(v.id("campaigns")),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        let query = ctx.db
            .query("trackedLinks")
            .withIndex("by_user", (q) => q.eq("userId", userId));

        if (args.campaignId) {
            query = ctx.db
                .query("trackedLinks")
                .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId));
        }

        const links = await query
            .order("desc")
            .take(args.limit || 100);

        return links;
    },
});

// Get link by code (public - for redirect)
export const getByCode = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const link = await ctx.db
            .query("trackedLinks")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();

        if (!link || !link.isActive) return null;

        // Check expiration
        if (link.expiresAt && link.expiresAt < Date.now()) return null;

        return link;
    },
});

// Get stats for tracked links
export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return { total: 0, totalClicks: 0, activeLinks: 0 };

        const links = await ctx.db
            .query("trackedLinks")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        return {
            total: links.length,
            totalClicks: links.reduce((sum, l) => sum + l.clickCount, 0),
            activeLinks: links.filter(l => l.isActive).length,
        };
    },
});

// Create a tracked link
export const create = mutation({
    args: {
        destinationUrl: v.string(),
        campaignId: v.optional(v.id("campaigns")),
        sequenceId: v.optional(v.id("sequences")),
        contactId: v.optional(v.id("contacts")),
        utmSource: v.optional(v.string()),
        utmMedium: v.optional(v.string()),
        utmCampaign: v.optional(v.string()),
        utmContent: v.optional(v.string()),
        utmTerm: v.optional(v.string()),
        label: v.optional(v.string()),
        expiresAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Generate unique code
        let code = generateCode();
        let existing = await ctx.db
            .query("trackedLinks")
            .withIndex("by_code", (q) => q.eq("code", code))
            .first();

        while (existing) {
            code = generateCode();
            existing = await ctx.db
                .query("trackedLinks")
                .withIndex("by_code", (q) => q.eq("code", code))
                .first();
        }

        return await ctx.db.insert("trackedLinks", {
            userId,
            code,
            destinationUrl: args.destinationUrl,
            campaignId: args.campaignId,
            sequenceId: args.sequenceId,
            contactId: args.contactId,
            utmSource: args.utmSource,
            utmMedium: args.utmMedium,
            utmCampaign: args.utmCampaign,
            utmContent: args.utmContent,
            utmTerm: args.utmTerm,
            label: args.label,
            clickCount: 0,
            isActive: true,
            createdAt: Date.now(),
            expiresAt: args.expiresAt,
        });
    },
});

// Record a click (for redirect handler to call)
export const recordClick = mutation({
    args: {
        code: v.string(),
        contactId: v.optional(v.id("contacts")),
    },
    handler: async (ctx, args) => {
        const link = await ctx.db
            .query("trackedLinks")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();

        if (!link || !link.isActive) return null;

        // Check expiration
        if (link.expiresAt && link.expiresAt < Date.now()) return null;

        await ctx.db.patch(link._id, {
            clickCount: link.clickCount + 1,
            lastClickedAt: Date.now(),
        });

        return link.destinationUrl;
    },
});

// Build tracking URL
export const buildUrl = query({
    args: { id: v.id("trackedLinks") },
    handler: async (ctx, args) => {
        const link = await ctx.db.get(args.id);
        if (!link) return null;

        // Base tracking URL - uses the app's domain
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        let trackingUrl = `${baseUrl}/api/r/${link.code}`;

        return trackingUrl;
    },
});

// Update a tracked link
export const update = mutation({
    args: {
        id: v.id("trackedLinks"),
        destinationUrl: v.optional(v.string()),
        label: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
        expiresAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const link = await ctx.db.get(args.id);
        if (!link || link.userId !== userId) throw new Error("Link not found");

        const { id, ...updates } = args;
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, cleanUpdates);
        return { success: true };
    },
});

// Delete a tracked link
export const remove = mutation({
    args: { id: v.id("trackedLinks") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const link = await ctx.db.get(args.id);
        if (!link || link.userId !== userId) throw new Error("Link not found");

        await ctx.db.delete(args.id);
        return { success: true };
    },
});
