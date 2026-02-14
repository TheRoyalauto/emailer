import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./auth";

// Tier limits configuration
export const TIER_LIMITS = {
    free: { dailyEmails: 30, monthlyEmails: 900, emailAccounts: 1 },
    starter: { dailyEmails: 100, monthlyEmails: 3000, emailAccounts: 3 },
    growth: { dailyEmails: 350, monthlyEmails: 10000, emailAccounts: 10 },
    scale: { dailyEmails: Infinity, monthlyEmails: Infinity, emailAccounts: Infinity },
} as const;

export type Tier = keyof typeof TIER_LIMITS;

// Get current user's profile
export const getMyProfile = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!profile) return null;

        const limits = TIER_LIMITS[profile.tier];
        return {
            ...profile,
            limits,
            emailsRemainingToday: Math.max(0, limits.dailyEmails - (profile.emailsSentToday || 0)),
            emailsRemainingThisMonth: Math.max(0, limits.monthlyEmails - (profile.emailsSentThisMonth || 0)),
        };
    },
});

// Ensure profile exists (call after login)
export const ensureProfile = mutation({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        // Check if profile exists
        const existing = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (existing) {
            // Update last login
            await ctx.db.patch(existing._id, { lastLoginAt: Date.now() });
            return existing._id;
        }

        // Get user email from auth
        const user = await ctx.db.get(userId);
        const email = (user?.email || "unknown@email.com") as string;

        // Create new profile with free tier (upgrade via admin panel)
        const profileId = await ctx.db.insert("userProfiles", {
            userId,
            email,
            tier: "free",
            createdAt: Date.now(),
            lastLoginAt: Date.now(),
            emailsSentToday: 0,
            emailsSentThisMonth: 0,
            emailsLastResetAt: Date.now(),
            monthlyResetAt: Date.now(),
            emailAccountCount: 0,
            status: "active",
        });

        return profileId;
    },
});

// Check if user can send more emails
export const checkEmailLimit = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return { canSend: false, reason: "Not authenticated" };

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!profile) return { canSend: false, reason: "No profile found" };
        if (profile.status === "suspended") return { canSend: false, reason: "Account suspended" };

        const limits = TIER_LIMITS[profile.tier];
        const sentToday = profile.emailsSentToday || 0;
        const sentThisMonth = profile.emailsSentThisMonth || 0;

        if (sentToday >= limits.dailyEmails) {
            return { canSend: false, reason: `Daily limit reached (${limits.dailyEmails} emails)` };
        }

        if (sentThisMonth >= limits.monthlyEmails) {
            return { canSend: false, reason: `Monthly limit reached (${limits.monthlyEmails} emails)` };
        }

        return {
            canSend: true,
            remainingToday: limits.dailyEmails - sentToday,
            remainingThisMonth: limits.monthlyEmails - sentThisMonth,
        };
    },
});

// Increment email count after sending
export const incrementEmailCount = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        count: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!profile) throw new Error("No profile found");

        const increment = args.count || 1;
        const now = Date.now();
        const today = new Date().toDateString();
        const lastReset = profile.emailsLastResetAt ? new Date(profile.emailsLastResetAt).toDateString() : null;

        // Reset daily count if it's a new day
        let newDailyCount = (profile.emailsSentToday || 0) + increment;
        if (lastReset !== today) {
            newDailyCount = increment;
        }

        // Reset monthly count if it's a new month
        const thisMonth = new Date().getMonth();
        const lastMonthReset = profile.monthlyResetAt ? new Date(profile.monthlyResetAt).getMonth() : null;
        let newMonthlyCount = (profile.emailsSentThisMonth || 0) + increment;
        if (lastMonthReset !== thisMonth) {
            newMonthlyCount = increment;
        }

        await ctx.db.patch(profile._id, {
            emailsSentToday: newDailyCount,
            emailsSentThisMonth: newMonthlyCount,
            emailsLastResetAt: now,
            monthlyResetAt: lastMonthReset !== thisMonth ? now : profile.monthlyResetAt,
        });

        return { dailyCount: newDailyCount, monthlyCount: newMonthlyCount };
    },
});

// Get tier limits for display
export const getTierLimits = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async () => {
        return TIER_LIMITS;
    },
});
