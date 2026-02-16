import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Helper ─────────────────────────────────────────────────────────────────────

async function requireAuth(ctx: any, sessionToken: string) {
    const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q: any) => q.eq("token", sessionToken))
        .first();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    return session.userId;
}

// ─── Generate Upload URL ────────────────────────────────────────────────────────

export const generateUploadUrl = mutation({
    args: { sessionToken: v.string() },
    handler: async (ctx, args) => {
        await requireAuth(ctx, args.sessionToken);
        return await ctx.storage.generateUploadUrl();
    },
});

// ─── Save Asset ─────────────────────────────────────────────────────────────────

export const save = mutation({
    args: {
        sessionToken: v.string(),
        storageId: v.id("_storage"),
        name: v.string(),
        category: v.union(
            v.literal("screenshot"),
            v.literal("logo"),
            v.literal("product"),
            v.literal("marketing"),
            v.literal("icon"),
            v.literal("other")
        ),
        mimeType: v.string(),
        sizeBytes: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken);
        return await ctx.db.insert("brandAssets", {
            userId,
            storageId: args.storageId,
            name: args.name,
            category: args.category,
            mimeType: args.mimeType,
            sizeBytes: args.sizeBytes,
            createdAt: Date.now(),
        });
    },
});

// ─── List Assets ────────────────────────────────────────────────────────────────

export const list = query({
    args: {
        sessionToken: v.optional(v.string()),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (!args.sessionToken) return [];
        const userId = await requireAuth(ctx, args.sessionToken);

        let assets;
        if (args.category) {
            assets = await ctx.db
                .query("brandAssets")
                .withIndex("by_user_category", (q: any) =>
                    q.eq("userId", userId).eq("category", args.category)
                )
                .collect();
        } else {
            assets = await ctx.db
                .query("brandAssets")
                .withIndex("by_user", (q: any) => q.eq("userId", userId))
                .collect();
        }

        // Attach file URLs
        return Promise.all(
            assets.map(async (asset: any) => ({
                ...asset,
                url: await ctx.storage.getUrl(asset.storageId),
            }))
        );
    },
});

// ─── Delete Asset ───────────────────────────────────────────────────────────────

export const remove = mutation({
    args: {
        sessionToken: v.string(),
        id: v.id("brandAssets"),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken);
        const asset = await ctx.db.get(args.id);
        if (!asset || asset.userId !== userId) throw new Error("Not found");

        // Delete from storage
        await ctx.storage.delete(asset.storageId);
        // Delete record
        await ctx.db.delete(args.id);
    },
});

// ─── Get Asset URLs (for AI generation) ─────────────────────────────────────────

export const getAssetUrls = query({
    args: {
        sessionToken: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        if (!args.sessionToken) return [];
        const userId = await requireAuth(ctx, args.sessionToken);
        const assets = await ctx.db
            .query("brandAssets")
            .withIndex("by_user", (q: any) => q.eq("userId", userId))
            .collect();

        // Return up to `limit` asset URLs
        const limited = args.limit ? assets.slice(0, args.limit) : assets;
        return Promise.all(
            limited.map(async (asset: any) => ({
                _id: asset._id,
                url: await ctx.storage.getUrl(asset.storageId),
                name: asset.name,
                category: asset.category,
                mimeType: asset.mimeType,
            }))
        );
    },
});

// ─── Log Asset Usage (called after image generation) ────────────────────────────

export const logUsage = mutation({
    args: {
        sessionToken: v.string(),
        assetIds: v.array(v.id("brandAssets")),
        platform: v.string(),
        contentConcept: v.string(),
        generationSuccess: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken);
        return await ctx.db.insert("assetUsageLogs", {
            userId,
            assetIds: args.assetIds,
            platform: args.platform,
            contentConcept: args.contentConcept,
            generationSuccess: args.generationSuccess,
            createdAt: Date.now(),
        });
    },
});

// ─── Get Analytics ──────────────────────────────────────────────────────────────

export const getAnalytics = query({
    args: {
        sessionToken: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const empty = { assets: [], summary: { totalGenerations: 0, successRate: 0, topPlatform: "" } };
        if (!args.sessionToken) return empty;

        try {
            const userId = await requireAuth(ctx, args.sessionToken);

            // Get all assets
            const assets = await ctx.db
                .query("brandAssets")
                .withIndex("by_user", (q: any) => q.eq("userId", userId))
                .collect();

            // Get all usage logs (may fail if table not deployed yet)
            let logs: any[] = [];
            try {
                logs = await ctx.db
                    .query("assetUsageLogs")
                    .withIndex("by_user", (q: any) => q.eq("userId", userId))
                    .collect();
            } catch {
                // Table may not exist yet — return assets with zero metrics
            }

            // Aggregate per-asset metrics
            const assetMetrics = await Promise.all(
                assets.map(async (asset: any) => {
                    const usages = logs.filter((l: any) => l.assetIds?.includes(asset._id));
                    const successCount = usages.filter((l: any) => l.generationSuccess).length;
                    const totalCount = usages.length;
                    const lastUsed = usages.length > 0
                        ? Math.max(...usages.map((l: any) => l.createdAt))
                        : null;

                    const platformCounts: Record<string, number> = {};
                    for (const u of usages) {
                        platformCounts[u.platform] = (platformCounts[u.platform] || 0) + 1;
                    }

                    const successRate = totalCount > 0 ? successCount / totalCount : 0;
                    const effectiveness = Math.round((totalCount * 0.6 + successRate * 40) * 10) / 10;

                    return {
                        _id: asset._id,
                        name: asset.name,
                        category: asset.category,
                        url: await ctx.storage.getUrl(asset.storageId),
                        totalUsages: totalCount,
                        successCount,
                        successRate: totalCount > 0 ? Math.round(successRate * 100) : 0,
                        lastUsed,
                        topPlatform: Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
                        platformBreakdown: platformCounts,
                        effectiveness,
                    };
                })
            );

            const totalGenerations = logs.length;
            const totalSuccess = logs.filter((l: any) => l.generationSuccess).length;
            const platformTotals: Record<string, number> = {};
            for (const l of logs) {
                platformTotals[l.platform] = (platformTotals[l.platform] || 0) + 1;
            }
            const topPlatform = Object.entries(platformTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

            return {
                assets: assetMetrics.sort((a, b) => b.effectiveness - a.effectiveness),
                summary: {
                    totalGenerations,
                    successRate: totalGenerations > 0 ? Math.round((totalSuccess / totalGenerations) * 100) : 0,
                    topPlatform,
                },
            };
        } catch {
            return empty;
        }
    },
});
