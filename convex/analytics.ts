import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// Get campaign stats
export const getCampaignStats = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
       
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
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
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
        sessionToken: v.optional(v.union(v.string(), v.null())),
       
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
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

// Get chart data for dashboard (time-series email stats)
export const getChartData = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
       
        days: v.optional(v.number()), // Number of days to fetch (default 30)
        isLive: v.optional(v.boolean()), // If true, return hourly data for last 24h
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        const days = args.days || 30;
        const isLive = args.isLive || false;
        const now = Date.now();
        const startDate = now - days * 24 * 60 * 60 * 1000;

        // Try to get from emailStats table first
        const emailStats = await ctx.db
            .query("emailStats")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        if (emailStats.length > 0) {
            // Sort by date and filter to range
            const filtered = emailStats
                .filter(s => {
                    const dateTs = new Date(s.date).getTime();
                    return dateTs >= startDate;
                })
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            // Return with cumulative totals
            let cumulativeSent = 0;
            return filtered.map(stat => {
                cumulativeSent += stat.sent;
                return {
                    date: stat.date,
                    timestamp: new Date(stat.date).getTime(),
                    emailsSent: cumulativeSent,
                    dailySent: stat.sent,
                    opens: stat.opened,
                    clicks: stat.clicked,
                };
            });
        }

        // Fallback: aggregate from contactActivities
        const activities = await ctx.db
            .query("contactActivities")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.gte(q.field("createdAt"), startDate))
            .collect();

        // Group by day
        const dailyStats = new Map<string, { sent: number; opens: number; clicks: number }>();

        for (const activity of activities) {
            const date = new Date(activity.createdAt);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            if (!dailyStats.has(dateKey)) {
                dailyStats.set(dateKey, { sent: 0, opens: 0, clicks: 0 });
            }

            const stats = dailyStats.get(dateKey)!;
            if (activity.type === "email_sent") stats.sent++;
            if (activity.type === "email_opened") stats.opens++;
            if (activity.type === "email_clicked") stats.clicks++;
        }

        // Generate all days in range with 0s for missing days
        const result = [];
        let cumulativeSent = 0;

        for (let i = days; i >= 0; i--) {
            const date = new Date(now - i * 24 * 60 * 60 * 1000);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const stats = dailyStats.get(dateKey) || { sent: 0, opens: 0, clicks: 0 };

            cumulativeSent += stats.sent;

            result.push({
                date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                timestamp: date.getTime(),
                emailsSent: cumulativeSent,
                dailySent: stats.sent,
                opens: stats.opens,
                clicks: stats.clicks,
            });
        }

        return result;
    },
});
