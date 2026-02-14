import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./auth";

// Log a call activity
export const logCall = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
       
        contactId: v.id("contacts"),
        outcome: v.union(
            v.literal("answered"),
            v.literal("voicemail"),
            v.literal("no_answer"),
            v.literal("busy"),
            v.literal("wrong_number"),
            v.literal("callback_requested")
        ),
        duration: v.optional(v.number()),
        notes: v.optional(v.string()),
        followUpAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const contact = await ctx.db.get(args.contactId);
        if (!contact || contact.userId !== userId) {
            throw new Error("Contact not found");
        }

        // Create activity log
        await ctx.db.insert("contactActivities", {
            userId,
            contactId: args.contactId,
            type: args.outcome === "voicemail" ? "voicemail_left" : "call_made",
            callOutcome: args.outcome,
            callDuration: args.duration,
            notes: args.notes,
            followUpAt: args.followUpAt,
            createdAt: Date.now(),
        });

        // Update contact stats
        await ctx.db.patch(args.contactId, {
            lastCallAt: Date.now(),
            callCount: (contact.callCount || 0) + 1,
            nextFollowUpAt: args.followUpAt,
            salesStage: contact.salesStage === "new" ? "contacted" : contact.salesStage,
        });

        return { success: true };
    },
});

// Log an email activity (called when campaign sends email)
export const logEmail = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
       
        contactId: v.id("contacts"),
        campaignId: v.optional(v.id("campaigns")),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const contact = await ctx.db.get(args.contactId);
        if (!contact || contact.userId !== userId) {
            throw new Error("Contact not found");
        }

        await ctx.db.insert("contactActivities", {
            userId,
            contactId: args.contactId,
            type: "email_sent",
            campaignId: args.campaignId,
            notes: args.notes,
            createdAt: Date.now(),
        });

        await ctx.db.patch(args.contactId, {
            lastEmailAt: Date.now(),
            emailCount: (contact.emailCount || 0) + 1,
            salesStage: contact.salesStage === "new" ? "contacted" : contact.salesStage,
        });

        return { success: true };
    },
});

// Add a note to a contact
export const addNote = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
       
        contactId: v.id("contacts"),
        notes: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const contact = await ctx.db.get(args.contactId);
        if (!contact || contact.userId !== userId) {
            throw new Error("Contact not found");
        }

        await ctx.db.insert("contactActivities", {
            userId,
            contactId: args.contactId,
            type: "note_added",
            notes: args.notes,
            createdAt: Date.now(),
        });

        return { success: true };
    },
});

// Schedule a follow-up
export const scheduleFollowUp = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
       
        contactId: v.id("contacts"),
        followUpAt: v.number(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const contact = await ctx.db.get(args.contactId);
        if (!contact || contact.userId !== userId) {
            throw new Error("Contact not found");
        }

        await ctx.db.insert("contactActivities", {
            userId,
            contactId: args.contactId,
            type: "follow_up_scheduled",
            followUpAt: args.followUpAt,
            notes: args.notes,
            createdAt: Date.now(),
        });

        await ctx.db.patch(args.contactId, {
            nextFollowUpAt: args.followUpAt,
            salesStage: "follow_up",
        });

        return { success: true };
    },
});

// Update sales stage
export const updateSalesStage = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
       
        contactId: v.id("contacts"),
        stage: v.union(
            v.literal("new"),
            v.literal("contacted"),
            v.literal("follow_up"),
            v.literal("qualified"),
            v.literal("closed_won"),
            v.literal("closed_lost")
        ),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const contact = await ctx.db.get(args.contactId);
        if (!contact || contact.userId !== userId) {
            throw new Error("Contact not found");
        }

        await ctx.db.insert("contactActivities", {
            userId,
            contactId: args.contactId,
            type: "status_changed",
            notes: args.notes || `Stage changed to ${args.stage}`,
            createdAt: Date.now(),
        });

        await ctx.db.patch(args.contactId, {
            salesStage: args.stage,
        });

        return { success: true };
    },
});

// Get activity history for a contact
export const getContactActivities = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
       
        contactId: v.id("contacts"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const contact = await ctx.db.get(args.contactId);
        if (!contact || contact.userId !== userId) return [];

        const activities = await ctx.db
            .query("contactActivities")
            .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
            .order("desc")
            .take(args.limit || 50);

        return activities;
    },
});

// Get recent activity across all contacts (for dashboard)
export const getRecentActivity = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
       
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        const activities = await ctx.db
            .query("contactActivities")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .take(args.limit || 20);

        // Fetch contact details for each activity
        const activitiesWithContacts = await Promise.all(
            activities.map(async (activity) => {
                const contact = await ctx.db.get(activity.contactId);
                return {
                    ...activity,
                    contact: contact ? {
                        email: contact.email,
                        name: contact.name,
                        company: contact.company,
                    } : null,
                };
            })
        );

        return activitiesWithContacts;
    },
});

// Get today's follow-ups
export const getTodayFollowUps = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null_())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        const now = Date.now();
        const startOfDay = new Date().setHours(0, 0, 0, 0);
        const endOfDay = new Date().setHours(23, 59, 59, 999);

        const contacts = await ctx.db
            .query("contacts")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        return contacts.filter(c =>
            c.nextFollowUpAt &&
            c.nextFollowUpAt >= startOfDay &&
            c.nextFollowUpAt <= endOfDay
        );
    },
});

// Get call stats for dashboard
export const getCallStats = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null_())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return { today: 0, week: 0, month: 0 };

        const now = Date.now();
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        const startOfWeek = now - 7 * 24 * 60 * 60 * 1000;
        const startOfMonth = now - 30 * 24 * 60 * 60 * 1000;

        const allCalls = await ctx.db
            .query("contactActivities")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("type"), "call_made"))
            .collect();

        return {
            today: allCalls.filter(c => c.createdAt >= startOfToday).length,
            week: allCalls.filter(c => c.createdAt >= startOfWeek).length,
            month: allCalls.filter(c => c.createdAt >= startOfMonth).length,
        };
    },
});

// Log email events from tracking webhooks (opens, clicks)
export const logEmailEvent = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null_())),
       
        contactId: v.id("contacts"),
        campaignId: v.optional(v.string()),
        eventType: v.union(
            v.literal("email_opened"),
            v.literal("email_clicked")
        ),
        url: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const contact = await ctx.db.get(args.contactId);
        if (!contact) {
            throw new Error("Contact not found");
        }

        await ctx.db.insert("contactActivities", {
            userId: contact.userId!,
            contactId: args.contactId,
            type: args.eventType,
            notes: args.url ? `Clicked: ${args.url}` : undefined,
            createdAt: Date.now(),
        });

        return { success: true };
    },
});
