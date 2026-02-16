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

export const get = query({
    args: { sessionToken: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.sessionToken) return null;
        const userId = await requireAuth(ctx, args.sessionToken);
        return await ctx.db
            .query("contentBrandVoice")
            .withIndex("by_user", (q: any) => q.eq("userId", userId))
            .first();
    },
});

// ─── Mutations ──────────────────────────────────────────────────────────────────

export const upsert = mutation({
    args: {
        sessionToken: v.string(),
        tone: v.string(),
        bannedWords: v.optional(v.array(v.string())),
        defaultCta: v.optional(v.string()),
        defaultHashtags: v.optional(v.array(v.string())),
        brandDescription: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx, args.sessionToken);
        const existing = await ctx.db
            .query("contentBrandVoice")
            .withIndex("by_user", (q: any) => q.eq("userId", userId))
            .first();

        const data = {
            tone: args.tone as any,
            bannedWords: args.bannedWords,
            defaultCta: args.defaultCta,
            defaultHashtags: args.defaultHashtags,
            brandDescription: args.brandDescription,
            updatedAt: Date.now(),
        };

        if (existing) {
            await ctx.db.patch(existing._id, data);
            return existing._id;
        } else {
            return await ctx.db.insert("contentBrandVoice", {
                userId,
                ...data,
                createdAt: Date.now(),
            });
        }
    },
});
