import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// List all A/B tests
export const list = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const tests = await ctx.db
            .query("abTests")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        // Fetch template details
        const testsWithTemplates = await Promise.all(
            tests.map(async (test) => {
                const templateA = await ctx.db.get(test.templateAId);
                const templateB = await ctx.db.get(test.templateBId);
                return {
                    ...test,
                    templateA,
                    templateB,
                };
            })
        );

        return testsWithTemplates;
    },
});

// Get a single A/B test
export const get = query({
    args: { id: v.id("abTests") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const test = await ctx.db.get(args.id);
        if (!test || test.userId !== userId) return null;

        const templateA = await ctx.db.get(test.templateAId);
        const templateB = await ctx.db.get(test.templateBId);

        return { ...test, templateA, templateB };
    },
});

// Create a new A/B test
export const create = mutation({
    args: {
        name: v.string(),
        templateAId: v.id("templates"),
        templateBId: v.id("templates"),
        splitPercentage: v.number(), // 50 = 50/50, 70 = 70% A / 30% B
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        return await ctx.db.insert("abTests", {
            userId,
            name: args.name,
            templateAId: args.templateAId,
            templateBId: args.templateBId,
            splitPercentage: args.splitPercentage,
            status: "draft",
            variantAStats: { sent: 0, opened: 0, clicked: 0 },
            variantBStats: { sent: 0, opened: 0, clicked: 0 },
            createdAt: Date.now(),
        });
    },
});

// Start an A/B test
export const start = mutation({
    args: { id: v.id("abTests") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const test = await ctx.db.get(args.id);
        if (!test || test.userId !== userId) {
            throw new Error("Test not found");
        }

        await ctx.db.patch(args.id, { status: "running" });
        return { success: true };
    },
});

// Record A/B test event
export const recordEvent = mutation({
    args: {
        testId: v.id("abTests"),
        variant: v.union(v.literal("A"), v.literal("B")),
        eventType: v.union(v.literal("sent"), v.literal("opened"), v.literal("clicked")),
    },
    handler: async (ctx, args) => {
        const test = await ctx.db.get(args.testId);
        if (!test) throw new Error("Test not found");

        const statsKey = args.variant === "A" ? "variantAStats" : "variantBStats";
        const currentStats = test[statsKey] || { sent: 0, opened: 0, clicked: 0 };

        await ctx.db.patch(args.testId, {
            [statsKey]: {
                ...currentStats,
                [args.eventType]: currentStats[args.eventType as keyof typeof currentStats] + 1,
            },
        });

        return { success: true };
    },
});

// Complete A/B test and declare winner
export const complete = mutation({
    args: {
        id: v.id("abTests"),
        winningVariant: v.union(v.literal("A"), v.literal("B")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const test = await ctx.db.get(args.id);
        if (!test || test.userId !== userId) {
            throw new Error("Test not found");
        }

        await ctx.db.patch(args.id, {
            status: "completed",
            winningVariant: args.winningVariant,
            completedAt: Date.now(),
        });

        return { success: true };
    },
});

// Delete an A/B test
export const remove = mutation({
    args: { id: v.id("abTests") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const test = await ctx.db.get(args.id);
        if (!test || test.userId !== userId) {
            throw new Error("Test not found");
        }

        await ctx.db.delete(args.id);
        return { success: true };
    },
});

// Get which variant to send to (A or B) based on split
export const getVariant = query({
    args: { testId: v.id("abTests") },
    handler: async (ctx, args) => {
        const test = await ctx.db.get(args.testId);
        if (!test || test.status !== "running") return null;

        const random = Math.random() * 100;
        return random < test.splitPercentage ? "A" : "B";
    },
});
