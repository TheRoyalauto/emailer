import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// List all unsubscribes
export const list = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        return await ctx.db
            .query("unsubscribes")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

// Check if email is unsubscribed
export const isUnsubscribed = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        email: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return false;

        const unsub = await ctx.db
            .query("unsubscribes")
            .withIndex("by_user_email", (q) =>
                q.eq("userId", userId).eq("email", args.email.toLowerCase())
            )
            .first();

        return !!unsub;
    },
});

// Unsubscribe an email
export const unsubscribe = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
       
        email: v.string(),
        contactId: v.optional(v.id("contacts")),
        reason: v.optional(v.string()),
        campaignId: v.optional(v.id("campaigns")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        // Check if already unsubscribed
        const existing = await ctx.db
            .query("unsubscribes")
            .withIndex("by_user_email", (q) =>
                q.eq("userId", userId).eq("email", args.email.toLowerCase())
            )
            .first();

        if (existing) {
            return { success: true, alreadyUnsubscribed: true };
        }

        // Create unsubscribe record
        await ctx.db.insert("unsubscribes", {
            userId,
            email: args.email.toLowerCase(),
            contactId: args.contactId,
            reason: args.reason,
            campaignId: args.campaignId,
            unsubscribedAt: Date.now(),
        });

        // Update contact status if provided
        if (args.contactId) {
            const contact = await ctx.db.get(args.contactId);
            if (contact && contact.userId === userId) {
                await ctx.db.patch(args.contactId, { status: "unsubscribed" });
            }
        } else {
            // Find contact by email and update
            const contact = await ctx.db
                .query("contacts")
                .withIndex("by_user_email", (q) =>
                    q.eq("userId", userId).eq("email", args.email.toLowerCase())
                )
                .first();
            if (contact) {
                await ctx.db.patch(contact._id, { status: "unsubscribed" });
            }
        }

        // Pause any sequence enrollments
        const contacts = await ctx.db
            .query("contacts")
            .withIndex("by_user_email", (q) =>
                q.eq("userId", userId).eq("email", args.email.toLowerCase())
            )
            .collect();

        for (const contact of contacts) {
            const enrollments = await ctx.db
                .query("sequenceEnrollments")
                .withIndex("by_contact", (q) => q.eq("contactId", contact._id))
                .filter((q) => q.eq(q.field("status"), "active"))
                .collect();

            for (const enrollment of enrollments) {
                await ctx.db.patch(enrollment._id, { status: "unsubscribed" });
            }
        }

        return { success: true, alreadyUnsubscribed: false };
    },
});

// Resubscribe an email
export const resubscribe = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        email: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        // Find and delete unsubscribe record
        const unsub = await ctx.db
            .query("unsubscribes")
            .withIndex("by_user_email", (q) =>
                q.eq("userId", userId).eq("email", args.email.toLowerCase())
            )
            .first();

        if (unsub) {
            await ctx.db.delete(unsub._id);
        }

        // Update contact status
        const contact = await ctx.db
            .query("contacts")
            .withIndex("by_user_email", (q) =>
                q.eq("userId", userId).eq("email", args.email.toLowerCase())
            )
            .first();

        if (contact) {
            await ctx.db.patch(contact._id, { status: "active" });
        }

        return { success: true };
    },
});

// Get unsubscribe count
export const getCount = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return 0;

        const unsubs = await ctx.db
            .query("unsubscribes")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        return unsubs.length;
    },
});
