import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./auth";
import { TIER_LIMITS, Tier } from "./userProfiles";

// Helper to check if user is super admin
async function requireSuperAdmin(ctx: any, args: any) {
    const userId = await getAuthUserId(ctx, args);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q: any) => q.eq("userId", userId))
        .first();

    if (!profile?.isSuperAdmin) {
        throw new Error("Access denied: Super admin required");
    }

    return { userId, profile };
}

// List all users with profiles (paginated)
export const listAllUsers = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
        limit: v.optional(v.number()),
        cursor: v.optional(v.string()),
        tierFilter: v.optional(v.string()),
        search: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return { users: [], totalCount: 0 };

        // Check if super admin
        const adminProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!adminProfile?.isSuperAdmin) {
            return { users: [], totalCount: 0, error: "Access denied" };
        }

        let profiles = await ctx.db.query("userProfiles").collect();

        // Apply tier filter in JS (Convex doesn't allow query reassignment)
        if (args.tierFilter && args.tierFilter !== "all") {
            profiles = profiles.filter((p) => p.tier === args.tierFilter);
        }

        // Apply search filter
        let filtered = profiles;
        if (args.search) {
            const searchLower = args.search.toLowerCase();
            filtered = profiles.filter(
                (p) =>
                    p.email.toLowerCase().includes(searchLower) ||
                    (p.name?.toLowerCase() || "").includes(searchLower)
            );
        }

        // Sort by creation date (newest first)
        filtered.sort((a, b) => b.createdAt - a.createdAt);

        // Get tier stats
        const tierStats = {
            free: profiles.filter((p) => p.tier === "free").length,
            starter: profiles.filter((p) => p.tier === "starter").length,
            growth: profiles.filter((p) => p.tier === "growth").length,
            scale: profiles.filter((p) => p.tier === "scale").length,
        };

        return {
            users: filtered.slice(0, args.limit || 50),
            totalCount: filtered.length,
            tierStats,
        };
    },
});

// Get detailed user info
export const getUserDetails = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
        profileId: v.id("userProfiles"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        // Check if super admin
        const adminProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!adminProfile?.isSuperAdmin) return null;

        const profile = await ctx.db.get(args.profileId);
        if (!profile) return null;

        // Get user's campaigns
        const campaigns = await ctx.db
            .query("campaigns")
            .withIndex("by_user", (q) => q.eq("userId", profile.userId))
            .collect();

        // Get user's contacts count
        const contacts = await ctx.db
            .query("contacts")
            .withIndex("by_user", (q) => q.eq("userId", profile.userId))
            .collect();

        // Get user's email accounts
        const senders = await ctx.db
            .query("senders")
            .withIndex("by_user", (q) => q.eq("userId", profile.userId))
            .collect();

        const limits = TIER_LIMITS[profile.tier];

        return {
            profile,
            limits,
            stats: {
                campaignsCount: campaigns.length,
                contactsCount: contacts.length,
                sendersCount: senders.length,
                totalEmailsSent: campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0),
            },
            recentCampaigns: campaigns.slice(0, 5),
        };
    },
});

// Update user tier
export const updateUserTier = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
        profileId: v.id("userProfiles"),
        tier: v.union(v.literal("free"), v.literal("starter"), v.literal("growth"), v.literal("scale")),
    },
    handler: async (ctx, args) => {
        const { userId } = await requireSuperAdmin(ctx, args);

        const profile = await ctx.db.get(args.profileId);
        if (!profile) throw new Error("User not found");

        await ctx.db.patch(args.profileId, {
            tier: args.tier,
            tierUpdatedAt: Date.now(),
            tierUpdatedBy: userId,
        });

        return { success: true };
    },
});

// Toggle admin status
export const toggleAdminStatus = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
        profileId: v.id("userProfiles"),
        isAdmin: v.boolean(),
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx, args);

        await ctx.db.patch(args.profileId, {
            isAdmin: args.isAdmin,
        });

        return { success: true };
    },
});

// Update user status (active/suspended)
export const updateUserStatus = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
        profileId: v.id("userProfiles"),
        status: v.union(v.literal("active"), v.literal("suspended"), v.literal("deleted")),
    },
    handler: async (ctx, args) => {
        const { userId } = await requireSuperAdmin(ctx, args);

        const profile = await ctx.db.get(args.profileId);
        if (!profile) throw new Error("User not found");

        await ctx.db.patch(args.profileId, {
            status: args.status,
        });

        return { success: true };
    },
});

// Add admin note
export const addAdminNote = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
        profileId: v.id("userProfiles"),
        note: v.string(),
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx, args);

        const profile = await ctx.db.get(args.profileId);
        if (!profile) throw new Error("User not found");

        const existingNotes = profile.notes || "";
        const timestamp = new Date().toISOString();
        const newNote = `[${timestamp}] ${args.note}\n${existingNotes}`;

        await ctx.db.patch(args.profileId, {
            notes: newNote,
        });

        return { success: true };
    },
});

// Get admin dashboard stats
export const getDashboardStats = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null_())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        // Check if super admin
        const adminProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!adminProfile?.isSuperAdmin) return null;

        const allProfiles = await ctx.db.query("userProfiles").collect();
        const allCampaigns = await ctx.db.query("campaigns").collect();

        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        const newUsersToday = allProfiles.filter((p) => p.createdAt > oneDayAgo).length;
        const newUsersThisWeek = allProfiles.filter((p) => p.createdAt > oneWeekAgo).length;
        const activeUsersToday = allProfiles.filter((p) => p.lastLoginAt && p.lastLoginAt > oneDayAgo).length;

        const totalEmailsSent = allCampaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0);

        return {
            totalUsers: allProfiles.length,
            newUsersToday,
            newUsersThisWeek,
            activeUsersToday,
            totalEmailsSent,
            tierBreakdown: {
                free: allProfiles.filter((p) => p.tier === "free").length,
                starter: allProfiles.filter((p) => p.tier === "starter").length,
                growth: allProfiles.filter((p) => p.tier === "growth").length,
                scale: allProfiles.filter((p) => p.tier === "scale").length,
            },
            campaignsTotal: allCampaigns.length,
            campaignsSending: allCampaigns.filter((c) => c.status === "sending").length,
        };
    },
});

// Check if current user is super admin
export const checkSuperAdmin = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null_())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return { isSuperAdmin: false };

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        return { isSuperAdmin: profile?.isSuperAdmin || false };
    },
});

// Make a user super admin (only callable by existing super admin)
export const makeSuperAdmin = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
        profileId: v.id("userProfiles"),
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx, args);

        await ctx.db.patch(args.profileId, {
            isSuperAdmin: true,
            isAdmin: true,
        });

        return { success: true };
    },
});
