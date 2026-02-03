import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

// Helper to get authenticated user
async function getAuthUserId(ctx: any) {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return userId;
}

// List all campaigns (templates) for the current user
export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];
        return await ctx.db
            .query("campaigns")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

// Get a single campaign
export const get = query({
    args: { id: v.id("campaigns") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;
        const campaign = await ctx.db.get(args.id);
        if (!campaign || campaign.userId !== userId) return null;
        return campaign;
    },
});

// Create a new campaign
export const create = mutation({
    args: {
        name: v.string(),
        subject: v.string(),
        htmlContent: v.string(),
        textContent: v.optional(v.string()),
        listId: v.optional(v.id("lists")),
        senderId: v.optional(v.id("senders")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        return await ctx.db.insert("campaigns", {
            ...args,
            userId,
            status: "draft",
            stats: {
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                bounced: 0,
                unsubscribed: 0,
            },
        });
    },
});

// Update a campaign
export const update = mutation({
    args: {
        id: v.id("campaigns"),
        name: v.optional(v.string()),
        subject: v.optional(v.string()),
        htmlContent: v.optional(v.string()),
        textContent: v.optional(v.string()),
        listId: v.optional(v.id("lists")),
        senderId: v.optional(v.id("senders")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const campaign = await ctx.db.get(args.id);
        if (!campaign || campaign.userId !== userId) {
            throw new Error("Campaign not found");
        }
        const { id, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(id, filtered);
        return await ctx.db.get(id);
    },
});

// Delete a campaign
export const remove = mutation({
    args: { id: v.id("campaigns") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const campaign = await ctx.db.get(args.id);
        if (!campaign || campaign.userId !== userId) {
            throw new Error("Campaign not found");
        }
        await ctx.db.delete(args.id);
    },
});

// Update campaign status
export const updateStatus = mutation({
    args: {
        id: v.id("campaigns"),
        status: v.union(
            v.literal("draft"),
            v.literal("scheduled"),
            v.literal("sending"),
            v.literal("sent"),
            v.literal("paused")
        ),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const campaign = await ctx.db.get(args.id);
        if (!campaign || campaign.userId !== userId) {
            throw new Error("Campaign not found");
        }
        await ctx.db.patch(args.id, { status: args.status });
        return await ctx.db.get(args.id);
    },
});
