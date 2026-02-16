import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function requireAuth(ctx: any, sessionToken: string) {
    const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q: any) => q.eq("token", sessionToken))
        .first();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    return session.userId;
}

// ─── Queries ────────────────────────────────────────────────────────────────────

export const list = query({
    args: {
        sessionToken: v.optional(v.string()),
        platform: v.optional(v.string()),
        status: v.optional(v.string()),
        search: v.optional(v.string()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (!args.sessionToken) return [];
        const userId = await requireAuth(ctx, args.sessionToken);

        let items = await ctx.db
            .query("contentCalendarItems")
            .withIndex("by_user", (q: any) => q.eq("userId", userId))
            .collect();

        // Filter by platform
        if (args.platform && args.platform !== "all") {
            items = items.filter((item: any) =>
                item.platforms.includes(args.platform)
            );
        }

        // Filter by status
        if (args.status && args.status !== "all") {
            items = items.filter((item: any) => item.status === args.status);
        }

        // Filter by date range
        if (args.startDate) {
            items = items.filter((item: any) => item.date >= args.startDate!);
        }
        if (args.endDate) {
            items = items.filter((item: any) => item.date <= args.endDate!);
        }

        // Search
        if (args.search) {
            const q = args.search.toLowerCase();
            items = items.filter((item: any) =>
                item.concept.toLowerCase().includes(q) ||
                item.caption.toLowerCase().includes(q) ||
                item.hashtags.toLowerCase().includes(q)
            );
        }

        // Sort by date ascending
        items.sort((a: any, b: any) => a.date.localeCompare(b.date));

        return items;
    },
});

export const getStats = query({
    args: { sessionToken: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.sessionToken) return { total: 0, draft: 0, ready: 0, scheduled: 0, posted: 0 };
        const userId = await requireAuth(ctx, args.sessionToken);

        const items = await ctx.db
            .query("contentCalendarItems")
            .withIndex("by_user", (q: any) => q.eq("userId", userId))
            .collect();

        return {
            total: items.length,
            draft: items.filter((i: any) => i.status === "draft").length,
            ready: items.filter((i: any) => i.status === "ready").length,
            scheduled: items.filter((i: any) => i.status === "scheduled").length,
            posted: items.filter((i: any) => i.status === "posted").length,
        };
    },
});

// ─── Mutations ──────────────────────────────────────────────────────────────────

export const create = mutation({
    args: {
        sessionToken: v.string(),
        date: v.string(),
        platforms: v.array(v.string()),
        type: v.string(),
        concept: v.string(),
        caption: v.string(),
        hashtags: v.string(),
        cta: v.string(),
        assetNotes: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken);
        return await ctx.db.insert("contentCalendarItems", {
            userId,
            date: args.date,
            platforms: args.platforms as any,
            type: args.type as any,
            concept: args.concept,
            caption: args.caption,
            hashtags: args.hashtags,
            cta: args.cta,
            assetNotes: args.assetNotes,
            status: (args.status || "draft") as any,
            lockedFields: [],
            createdAt: Date.now(),
        });
    },
});

export const update = mutation({
    args: {
        sessionToken: v.string(),
        id: v.id("contentCalendarItems"),
        date: v.optional(v.string()),
        platforms: v.optional(v.array(v.string())),
        type: v.optional(v.string()),
        concept: v.optional(v.string()),
        caption: v.optional(v.string()),
        hashtags: v.optional(v.string()),
        cta: v.optional(v.string()),
        assetNotes: v.optional(v.string()),
        status: v.optional(v.string()),
        lockedFields: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken);
        const item = await ctx.db.get(args.id);
        if (!item || item.userId !== userId) throw new Error("Not found");

        const updates: any = { updatedAt: Date.now() };
        if (args.date !== undefined) updates.date = args.date;
        if (args.platforms !== undefined) updates.platforms = args.platforms;
        if (args.type !== undefined) updates.type = args.type;
        if (args.concept !== undefined) updates.concept = args.concept;
        if (args.caption !== undefined) updates.caption = args.caption;
        if (args.hashtags !== undefined) updates.hashtags = args.hashtags;
        if (args.cta !== undefined) updates.cta = args.cta;
        if (args.assetNotes !== undefined) updates.assetNotes = args.assetNotes;
        if (args.status !== undefined) updates.status = args.status;
        if (args.lockedFields !== undefined) updates.lockedFields = args.lockedFields;

        await ctx.db.patch(args.id, updates);
    },
});

export const updateStatus = mutation({
    args: {
        sessionToken: v.string(),
        id: v.id("contentCalendarItems"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken);
        const item = await ctx.db.get(args.id);
        if (!item || item.userId !== userId) throw new Error("Not found");
        await ctx.db.patch(args.id, { status: args.status as any, updatedAt: Date.now() });
    },
});

export const remove = mutation({
    args: {
        sessionToken: v.string(),
        id: v.id("contentCalendarItems"),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken);
        const item = await ctx.db.get(args.id);
        if (!item || item.userId !== userId) throw new Error("Not found");
        await ctx.db.delete(args.id);
    },
});

export const deleteAll = mutation({
    args: { sessionToken: v.string() },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken);
        const items = await ctx.db
            .query("contentCalendarItems")
            .withIndex("by_user", (q: any) => q.eq("userId", userId))
            .collect();
        for (const item of items) {
            await ctx.db.delete(item._id);
        }
        return items.length;
    },
});

export const bulkInsert = mutation({
    args: {
        sessionToken: v.string(),
        items: v.array(v.object({
            date: v.string(),
            platforms: v.array(v.string()),
            type: v.string(),
            concept: v.string(),
            caption: v.string(),
            hashtags: v.string(),
            cta: v.string(),
            assetNotes: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken);
        const now = Date.now();
        const ids = [];
        for (const item of args.items) {
            const id = await ctx.db.insert("contentCalendarItems", {
                userId,
                date: item.date,
                platforms: item.platforms as any,
                type: item.type as any,
                concept: item.concept,
                caption: item.caption,
                hashtags: item.hashtags,
                cta: item.cta,
                assetNotes: item.assetNotes,
                status: "draft" as const,
                lockedFields: [],
                createdAt: now,
            });
            ids.push(id);
        }
        return ids;
    },
});

// ─── Analytics ──────────────────────────────────────────────────────────────────

export const getPostingAnalytics = query({
    args: { sessionToken: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.sessionToken) return null;
        const userId = await requireAuth(ctx, args.sessionToken);

        const items = await ctx.db
            .query("contentCalendarItems")
            .withIndex("by_user", (q: any) => q.eq("userId", userId))
            .collect();

        // Platform breakdown
        const platformCounts: Record<string, number> = {};
        const recentPosts: { concept: string; platform: string; postUrl?: string; postedAt: number }[] = [];

        for (const item of items) {
            const results = item.postResults || [];
            for (const r of results) {
                platformCounts[r.platform] = (platformCounts[r.platform] || 0) + 1;
                recentPosts.push({
                    concept: item.concept,
                    platform: r.platform,
                    postUrl: r.postUrl,
                    postedAt: r.postedAt,
                });
            }
        }

        // Sort recent posts by time descending, take top 10
        recentPosts.sort((a, b) => b.postedAt - a.postedAt);
        const topRecent = recentPosts.slice(0, 10);

        const totalPosted = Object.values(platformCounts).reduce((s, n) => s + n, 0);

        return {
            totalPosted,
            platformCounts,
            recentPosts: topRecent,
        };
    },
});

export const recordPostResult = mutation({
    args: {
        sessionToken: v.string(),
        id: v.id("contentCalendarItems"),
        platform: v.string(),
        postId: v.optional(v.string()),
        postUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken);
        const item = await ctx.db.get(args.id);
        if (!item || item.userId !== userId) throw new Error("Not found");

        const existing = item.postResults || [];
        const newResult = {
            platform: args.platform,
            postId: args.postId,
            postUrl: args.postUrl,
            postedAt: Date.now(),
        };

        await ctx.db.patch(args.id, {
            postResults: [...existing, newResult],
            status: "posted" as const,
            updatedAt: Date.now(),
        });
    },
});
