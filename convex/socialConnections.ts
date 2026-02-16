import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Auth helper ────────────────────────────────────────────────────────────────

async function requireAuth(ctx: any, sessionToken: string) {
    const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q: any) => q.eq("token", sessionToken))
        .first();
    if (!session || session.expiresAt < Date.now()) {
        throw new Error("Unauthorized");
    }
    return session.userId;
}

// ─── Queries ────────────────────────────────────────────────────────────────────

export const list = query({
    args: { sessionToken: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken!);
        const connections = await ctx.db
            .query("socialConnections")
            .withIndex("by_user", (q: any) => q.eq("userId", userId))
            .collect();
        // Strip tokens from response — only return metadata
        return connections.map((c: any) => ({
            _id: c._id,
            platform: c.platform,
            platformUsername: c.platformUsername,
            platformUserId: c.platformUserId,
            connectedAt: c.connectedAt,
            hasToken: !!c.accessToken,
        }));
    },
});

export const getByPlatform = query({
    args: {
        sessionToken: v.optional(v.string()),
        platform: v.union(v.literal("x"), v.literal("linkedin")),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken!);
        const connection = await ctx.db
            .query("socialConnections")
            .withIndex("by_user_platform", (q: any) =>
                q.eq("userId", userId).eq("platform", args.platform)
            )
            .first();
        if (!connection) return null;
        return {
            _id: connection._id,
            platform: connection.platform,
            platformUsername: connection.platformUsername,
            platformUserId: connection.platformUserId,
            connectedAt: connection.connectedAt,
            hasToken: !!connection.accessToken,
        };
    },
});

// Internal query — returns full token data (only called server-side)
export const getTokens = query({
    args: {
        sessionToken: v.optional(v.string()),
        platform: v.union(v.literal("x"), v.literal("linkedin")),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken!);
        return await ctx.db
            .query("socialConnections")
            .withIndex("by_user_platform", (q: any) =>
                q.eq("userId", userId).eq("platform", args.platform)
            )
            .first();
    },
});

// ─── Mutations ──────────────────────────────────────────────────────────────────

export const upsert = mutation({
    args: {
        sessionToken: v.string(),
        platform: v.union(v.literal("x"), v.literal("linkedin")),
        accessToken: v.string(),
        refreshToken: v.optional(v.string()),
        expiresAt: v.optional(v.number()),
        platformUserId: v.optional(v.string()),
        platformUsername: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken);
        const existing = await ctx.db
            .query("socialConnections")
            .withIndex("by_user_platform", (q: any) =>
                q.eq("userId", userId).eq("platform", args.platform)
            )
            .first();

        const data = {
            platform: args.platform,
            accessToken: args.accessToken,
            refreshToken: args.refreshToken,
            expiresAt: args.expiresAt,
            platformUserId: args.platformUserId,
            platformUsername: args.platformUsername,
            connectedAt: Date.now(),
        };

        if (existing) {
            await ctx.db.patch(existing._id, data);
            return existing._id;
        } else {
            return await ctx.db.insert("socialConnections", {
                userId,
                ...data,
            });
        }
    },
});

export const remove = mutation({
    args: {
        sessionToken: v.string(),
        platform: v.union(v.literal("x"), v.literal("linkedin")),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken);
        const existing = await ctx.db
            .query("socialConnections")
            .withIndex("by_user_platform", (q: any) =>
                q.eq("userId", userId).eq("platform", args.platform)
            )
            .first();
        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});
