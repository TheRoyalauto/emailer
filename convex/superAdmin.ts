import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "./auth";
import { TIER_LIMITS, Tier } from "./userProfiles";
import { Id } from "./_generated/dataModel";

// ─── HELPERS ──────────────────────────────────────

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

// Insert an audit log entry — called from every admin mutation
async function logAudit(
    ctx: MutationCtx,
    actorId: Id<"users">,
    actorEmail: string,
    action: string,
    details: string,
    targetProfileId?: Id<"userProfiles">,
    targetEmail?: string,
    metadata?: Record<string, any>
) {
    await ctx.db.insert("adminAuditLog", {
        actorId,
        actorEmail,
        action: action as any,
        targetProfileId,
        targetEmail,
        details,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        timestamp: Date.now(),
    });
}

// ─── QUERIES ─────────────────────────────────────

export const listAllUsers = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        limit: v.optional(v.number()),
        tierFilter: v.optional(v.string()),
        search: v.optional(v.string()),
        statusFilter: v.optional(v.string()),
        sortBy: v.optional(v.string()),
        sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return { users: [], totalCount: 0, tierStats: {} };

        const adminProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!adminProfile?.isSuperAdmin) {
            return { users: [], totalCount: 0, error: "Access denied" };
        }

        let profiles = await ctx.db.query("userProfiles").collect();

        if (args.tierFilter && args.tierFilter !== "all") {
            profiles = profiles.filter((p) => p.tier === args.tierFilter);
        }
        if (args.statusFilter && args.statusFilter !== "all") {
            profiles = profiles.filter((p) => (p.status || "active") === args.statusFilter);
        }

        let filtered = profiles;
        if (args.search) {
            const s = args.search.toLowerCase();
            filtered = profiles.filter(
                (p) =>
                    p.email.toLowerCase().includes(s) ||
                    (p.name?.toLowerCase() || "").includes(s)
            );
        }

        const sortBy = args.sortBy || "createdAt";
        const sortOrder = args.sortOrder || "desc";
        filtered.sort((a: any, b: any) => {
            const aVal = a[sortBy] || 0;
            const bVal = b[sortBy] || 0;
            return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
        });

        const allProfiles = await ctx.db.query("userProfiles").collect();
        const tierStats = {
            free: allProfiles.filter((p) => p.tier === "free").length,
            starter: allProfiles.filter((p) => p.tier === "starter").length,
            professional: allProfiles.filter((p) => p.tier === "professional").length,
            enterprise: allProfiles.filter((p) => p.tier === "enterprise").length,
        };

        return {
            users: filtered.slice(0, args.limit || 100),
            totalCount: filtered.length,
            tierStats,
        };
    },
});

export const getUserDetails = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        profileId: v.id("userProfiles"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

        const adminProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!adminProfile?.isSuperAdmin) return null;

        const profile = await ctx.db.get(args.profileId);
        if (!profile) return null;

        const campaigns = await ctx.db.query("campaigns").withIndex("by_user", (q) => q.eq("userId", profile.userId)).collect();
        const contacts = await ctx.db.query("contacts").withIndex("by_user", (q) => q.eq("userId", profile.userId)).collect();
        const senders = await ctx.db.query("senders").withIndex("by_user", (q) => q.eq("userId", profile.userId)).collect();
        const smtpConfigs = await ctx.db.query("smtpConfigs").withIndex("by_user", (q) => q.eq("userId", profile.userId)).collect();

        const limits = TIER_LIMITS[profile.tier];

        return {
            profile,
            limits,
            stats: {
                campaignsCount: campaigns.length,
                contactsCount: contacts.length,
                sendersCount: senders.length,
                smtpConfigsCount: smtpConfigs.length,
                totalEmailsSent: campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0),
            },
            recentCampaigns: campaigns.slice(0, 5),
            senders,
            smtpConfigs,
        };
    },
});

export const getDashboardStats = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return null;

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

        return {
            totalUsers: allProfiles.length,
            newUsersToday: allProfiles.filter((p) => p.createdAt > oneDayAgo).length,
            newUsersThisWeek: allProfiles.filter((p) => p.createdAt > oneWeekAgo).length,
            activeUsersToday: allProfiles.filter((p) => p.lastLoginAt && p.lastLoginAt > oneDayAgo).length,
            activeUsersThisWeek: allProfiles.filter((p) => p.lastLoginAt && p.lastLoginAt > oneWeekAgo).length,
            suspendedUsers: allProfiles.filter((p) => p.status === "suspended").length,
            totalEmailsSent: allCampaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0),
            emailsSentToday: allProfiles.reduce((acc, p) => acc + (p.emailsSentToday || 0), 0),
            emailsSentThisMonth: allProfiles.reduce((acc, p) => acc + (p.emailsSentThisMonth || 0), 0),
            tierBreakdown: {
                free: allProfiles.filter((p) => p.tier === "free").length,
                starter: allProfiles.filter((p) => p.tier === "starter").length,
                professional: allProfiles.filter((p) => p.tier === "professional").length,
                enterprise: allProfiles.filter((p) => p.tier === "enterprise").length,
            },
            campaignsTotal: allCampaigns.length,
            campaignsSending: allCampaigns.filter((c) => c.status === "sending").length,
            campaignsSent: allCampaigns.filter((c) => c.status === "sent").length,
            campaignsDraft: allCampaigns.filter((c) => c.status === "draft").length,
        };
    },
});

export const checkSuperAdmin = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
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

// ─── AUDIT LOG QUERY ─────────────────────────────

export const getAuditLog = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        limit: v.optional(v.number()),
        actionFilter: v.optional(v.string()),
        targetProfileId: v.optional(v.id("userProfiles")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        const adminProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!adminProfile?.isSuperAdmin) return [];

        let logs;
        if (args.targetProfileId) {
            logs = await ctx.db
                .query("adminAuditLog")
                .withIndex("by_target", (q) => q.eq("targetProfileId", args.targetProfileId))
                .order("desc")
                .collect();
        } else {
            logs = await ctx.db
                .query("adminAuditLog")
                .withIndex("by_timestamp")
                .order("desc")
                .collect();
        }

        // Action filter
        if (args.actionFilter && args.actionFilter !== "all") {
            logs = logs.filter((l) => l.action === args.actionFilter);
        }

        return logs.slice(0, args.limit || 50);
    },
});

// ─── MUTATIONS ────────────────────────────────────

export const updateUserTier = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        profileId: v.id("userProfiles"),
        tier: v.union(v.literal("free"), v.literal("starter"), v.literal("professional"), v.literal("enterprise")),
    },
    handler: async (ctx, args) => {
        const { userId, profile: adminProfile } = await requireSuperAdmin(ctx, args);
        const profile = await ctx.db.get(args.profileId);
        if (!profile) throw new Error("User not found");

        const oldTier = profile.tier;
        await ctx.db.patch(args.profileId, {
            tier: args.tier,
            tierUpdatedAt: Date.now(),
            tierUpdatedBy: userId,
        });

        await logAudit(ctx, userId, adminProfile.email, "tier_change",
            `Changed tier from ${oldTier} to ${args.tier}`,
            args.profileId, profile.email,
            { oldTier, newTier: args.tier }
        );

        return { success: true };
    },
});

export const updateUserStatus = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        profileId: v.id("userProfiles"),
        status: v.union(v.literal("active"), v.literal("suspended"), v.literal("deleted")),
    },
    handler: async (ctx, args) => {
        const { userId, profile: adminProfile } = await requireSuperAdmin(ctx, args);
        const profile = await ctx.db.get(args.profileId);
        if (!profile) throw new Error("User not found");

        const oldStatus = profile.status || "active";
        await ctx.db.patch(args.profileId, { status: args.status });

        await logAudit(ctx, userId, adminProfile.email, "status_change",
            `Changed status from ${oldStatus} to ${args.status}`,
            args.profileId, profile.email,
            { oldStatus, newStatus: args.status }
        );

        return { success: true };
    },
});

export const toggleAdminStatus = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        profileId: v.id("userProfiles"),
        isAdmin: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { userId, profile: adminProfile } = await requireSuperAdmin(ctx, args);
        const profile = await ctx.db.get(args.profileId);
        if (!profile) throw new Error("User not found");

        await ctx.db.patch(args.profileId, { isAdmin: args.isAdmin });

        await logAudit(ctx, userId, adminProfile.email, "admin_toggle",
            `${args.isAdmin ? "Granted" : "Revoked"} admin status`,
            args.profileId, profile.email
        );

        return { success: true };
    },
});

export const addAdminNote = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        profileId: v.id("userProfiles"),
        note: v.string(),
    },
    handler: async (ctx, args) => {
        const { userId, profile: adminProfile } = await requireSuperAdmin(ctx, args);
        const profile = await ctx.db.get(args.profileId);
        if (!profile) throw new Error("User not found");

        const existingNotes = profile.notes || "";
        const timestamp = new Date().toISOString();
        const newNote = `[${timestamp}] ${args.note}\n${existingNotes}`;

        await ctx.db.patch(args.profileId, { notes: newNote });

        await logAudit(ctx, userId, adminProfile.email, "note_added",
            `Added note: "${args.note.substring(0, 100)}"`,
            args.profileId, profile.email
        );

        return { success: true };
    },
});

export const makeSuperAdmin = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        profileId: v.id("userProfiles"),
    },
    handler: async (ctx, args) => {
        const { userId, profile: adminProfile } = await requireSuperAdmin(ctx, args);
        const profile = await ctx.db.get(args.profileId);
        if (!profile) throw new Error("User not found");

        await ctx.db.patch(args.profileId, { isSuperAdmin: true, isAdmin: true });

        await logAudit(ctx, userId, adminProfile.email, "super_admin_grant",
            `Granted super admin to ${profile.email}`,
            args.profileId, profile.email
        );

        return { success: true };
    },
});

export const revokeSuperAdmin = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        profileId: v.id("userProfiles"),
    },
    handler: async (ctx, args) => {
        const { userId, profile: adminProfile } = await requireSuperAdmin(ctx, args);
        if (adminProfile._id === args.profileId) throw new Error("Cannot revoke your own super admin status");

        const profile = await ctx.db.get(args.profileId);
        if (!profile) throw new Error("User not found");

        await ctx.db.patch(args.profileId, { isSuperAdmin: false });

        await logAudit(ctx, userId, adminProfile.email, "super_admin_revoke",
            `Revoked super admin from ${profile.email}`,
            args.profileId, profile.email
        );

        return { success: true };
    },
});

export const resetUserUsage = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        profileId: v.id("userProfiles"),
        resetType: v.union(v.literal("daily"), v.literal("monthly"), v.literal("both")),
    },
    handler: async (ctx, args) => {
        const { userId, profile: adminProfile } = await requireSuperAdmin(ctx, args);
        const profile = await ctx.db.get(args.profileId);
        if (!profile) throw new Error("User not found");

        const updates: any = {};
        if (args.resetType === "daily" || args.resetType === "both") {
            updates.emailsSentToday = 0;
            updates.emailsLastResetAt = Date.now();
        }
        if (args.resetType === "monthly" || args.resetType === "both") {
            updates.emailsSentThisMonth = 0;
            updates.monthlyResetAt = Date.now();
        }

        await ctx.db.patch(args.profileId, updates);

        await logAudit(ctx, userId, adminProfile.email, "usage_reset",
            `Reset ${args.resetType} usage counters`,
            args.profileId, profile.email,
            { resetType: args.resetType, previousDaily: profile.emailsSentToday, previousMonthly: profile.emailsSentThisMonth }
        );

        return { success: true };
    },
});

export const deleteUserData = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        profileId: v.id("userProfiles"),
        deleteProfile: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { userId, profile: adminProfile } = await requireSuperAdmin(ctx, args);
        const profile = await ctx.db.get(args.profileId);
        if (!profile) throw new Error("User not found");
        if (profile.isSuperAdmin) throw new Error("Cannot delete super admin data");

        const uid = profile.userId;

        const campaigns = await ctx.db.query("campaigns").withIndex("by_user", (q) => q.eq("userId", uid)).collect();
        for (const c of campaigns) await ctx.db.delete(c._id);

        const contacts = await ctx.db.query("contacts").withIndex("by_user", (q) => q.eq("userId", uid)).collect();
        for (const c of contacts) await ctx.db.delete(c._id);

        const senders = await ctx.db.query("senders").withIndex("by_user", (q) => q.eq("userId", uid)).collect();
        for (const s of senders) await ctx.db.delete(s._id);

        const smtpConfigs = await ctx.db.query("smtpConfigs").withIndex("by_user", (q) => q.eq("userId", uid)).collect();
        for (const s of smtpConfigs) await ctx.db.delete(s._id);

        if (args.deleteProfile) {
            await ctx.db.patch(args.profileId, { status: "deleted" });
        }

        const deleted = { campaigns: campaigns.length, contacts: contacts.length, senders: senders.length, smtpConfigs: smtpConfigs.length };

        await logAudit(ctx, userId, adminProfile.email, "data_deletion",
            `Deleted all data: ${campaigns.length} campaigns, ${contacts.length} contacts, ${senders.length} senders, ${smtpConfigs.length} SMTP configs`,
            args.profileId, profile.email,
            { deleted, profileDeleted: args.deleteProfile || false }
        );

        return { success: true, deleted };
    },
});

// ─── IMPERSONATION ────────────────────────────────

// Create a session that lets the admin view the app as the target user
export const startImpersonation = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        profileId: v.id("userProfiles"),
    },
    handler: async (ctx, args) => {
        const { userId, profile: adminProfile } = await requireSuperAdmin(ctx, args);
        const targetProfile = await ctx.db.get(args.profileId);
        if (!targetProfile) throw new Error("Target user not found");
        if (targetProfile.isSuperAdmin) throw new Error("Cannot impersonate another super admin");

        // Generate a unique impersonation token
        const token = `imp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

        // Create a short-lived session (1 hour) for the target user
        await ctx.db.insert("sessions", {
            userId: targetProfile.userId,
            token,
            expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
            createdAt: Date.now(),
            impersonatedBy: userId,
            isImpersonation: true,
        });

        await logAudit(ctx, userId, adminProfile.email, "impersonation_start",
            `Started impersonating ${targetProfile.email}`,
            args.profileId, targetProfile.email
        );

        return {
            success: true,
            impersonationToken: token,
            targetEmail: targetProfile.email,
            targetName: targetProfile.name,
            expiresIn: "1 hour",
        };
    },
});

// End an impersonation session
export const endImpersonation = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        impersonationToken: v.string(),
    },
    handler: async (ctx, args) => {
        const { userId, profile: adminProfile } = await requireSuperAdmin(ctx, args);

        // Find and delete the impersonation session
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.impersonationToken))
            .first();

        if (session && session.isImpersonation) {
            const targetProfile = await ctx.db
                .query("userProfiles")
                .withIndex("by_userId", (q) => q.eq("userId", session.userId))
                .first();

            await ctx.db.delete(session._id);

            await logAudit(ctx, userId, adminProfile.email, "impersonation_end",
                `Ended impersonation of ${targetProfile?.email || "unknown"}`,
                targetProfile?._id, targetProfile?.email
            );
        }

        return { success: true };
    },
});

// Check if current session is an impersonation
export const checkImpersonation = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const token = args.sessionToken;
        if (!token) return { isImpersonation: false };

        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .first();

        if (!session || !session.isImpersonation) return { isImpersonation: false };

        // Get admin info
        const adminProfile = session.impersonatedBy ? await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", session.impersonatedBy!))
            .first() : null;

        // Get target user info
        const targetProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", session.userId))
            .first();

        return {
            isImpersonation: true,
            adminEmail: adminProfile?.email,
            adminName: adminProfile?.name,
            targetEmail: targetProfile?.email,
            targetName: targetProfile?.name,
            expiresAt: session.expiresAt,
        };
    },
});
