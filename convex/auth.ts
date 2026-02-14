/**
 * Auth compatibility layer.
 * Drop-in replacement for @convex-dev/auth patterns.
 * Session token is passed as `sessionToken` in query/mutation args.
 */
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

async function validateSession(
    ctx: QueryCtx | MutationCtx,
    token: string
): Promise<Id<"users"> | null> {
    const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q) => q.eq("token", token))
        .first();

    if (!session) return null;
    if (Date.now() > session.expiresAt) return null;

    return session.userId;
}

/**
 * Reads sessionToken from any args-like object.
 * Works with both `getAuthUserId(ctx)` and `getAuthUserId(ctx, args)`.
 */
export async function getAuthUserId(
    ctx: QueryCtx | MutationCtx,
    args?: any
): Promise<Id<"users"> | null> {
    const token = args?.sessionToken;
    if (!token) return null;
    return validateSession(ctx, token);
}

/**
 * Compatibility for `auth.getUserId(ctx)` pattern used in batches.ts, campaigns.ts.
 */
export const auth = {
    getUserId: async (
        ctx: QueryCtx | MutationCtx,
        args?: any
    ): Promise<Id<"users"> | null> => {
        return getAuthUserId(ctx, args);
    },
};
