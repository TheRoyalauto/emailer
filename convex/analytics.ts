import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get campaign stats
export const getCampaignStats = query({
    args: {
        campaignId: v.string(),
    },
    handler: async (ctx, args) => {
        // Get all email activities for this campaign
        const activities = await ctx.db
            .query("contactActivities")
            .withIndex("by_type")
            .filter((q) =>
                q.or(
                    q.eq(q.field("type"), "email_sent"),
                    q.eq(q.field("type"), "email_opened"),
                    q.eq(q.field("type"), "email_clicked")
                )
            )
            .collect();

        // Filter by campaign (if campaignId was stored)
        const campaignActivities = activities.filter(a =>
            a.campaignId === args.campaignId
        );

        const sent = campaignActivities.filter(a => a.type === "email_sent").length;
        const opened = campaignActivities.filter(a => a.type === "email_opened").length;
        const clicked = campaignActivities.filter(a => a.type === "email_clicked").length;

        return {
            sent,
            opened,
            clicked,
            openRate: sent > 0 ? (opened / sent * 100).toFixed(1) : "0",
            clickRate: sent > 0 ? (clicked / sent * 100).toFixed(1) : "0",
            clickToOpenRate: opened > 0 ? (clicked / opened * 100).toFixed(1) : "0",
        };
    },
});

// Get overall email analytics
export const getEmailAnalytics = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        // Get all email activities for this user
        const activities = await ctx.db
            .query("contactActivities")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const sent = activities.filter(a => a.type === "email_sent").length;
        const opened = activities.filter(a => a.type === "email_opened").length;
        const clicked = activities.filter(a => a.type === "email_clicked").length;

        // Get today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTs = today.getTime();

        const todayActivities = activities.filter(a => a.createdAt >= todayTs);
        const todaySent = todayActivities.filter(a => a.type === "email_sent").length;
        const todayOpened = todayActivities.filter(a => a.type === "email_opened").length;

        // Get week stats
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const weekActivities = activities.filter(a => a.createdAt >= weekAgo);
        const weekSent = weekActivities.filter(a => a.type === "email_sent").length;
        const weekOpened = weekActivities.filter(a => a.type === "email_opened").length;

        return {
            total: {
                sent,
                opened,
                clicked,
                openRate: sent > 0 ? (opened / sent * 100).toFixed(1) : "0",
                clickRate: sent > 0 ? (clicked / sent * 100).toFixed(1) : "0",
            },
            today: {
                sent: todaySent,
                opened: todayOpened,
            },
            week: {
                sent: weekSent,
                opened: weekOpened,
            },
        };
    },
});

// Get top performing contacts (most engaged)
export const getTopContacts = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // Get opened/clicked events
        const activities = await ctx.db
            .query("contactActivities")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) =>
                q.or(
                    q.eq(q.field("type"), "email_opened"),
                    q.eq(q.field("type"), "email_clicked")
                )
            )
            .collect();

        // Count engagement per contact
        const engagementMap = new Map<string, number>();
        for (const activity of activities) {
            const count = engagementMap.get(activity.contactId) || 0;
            engagementMap.set(activity.contactId, count + (activity.type === "email_clicked" ? 2 : 1));
        }

        // Sort by engagement
        const sorted = Array.from(engagementMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, args.limit || 10);

        // Get contact details
        const contacts = await Promise.all(
            sorted.map(async ([contactId, score]) => {
                const contact = await ctx.db.get(contactId as any);
                return contact ? { ...contact, engagementScore: score } : null;
            })
        );

        return contacts.filter(Boolean);
    },
});
