/**
 * Persistent scrape history. Every lead the user ever scrapes lands here so:
 *   - Subsequent searches can dedup against it (skip already-seen leads)
 *   - The /scraper/history page can show all past results
 *   - We can mark leads as imported into the main contacts table
 *
 * The key is (userId, lowercased email). Re-scraping the same business
 * refreshes lastSeenAt + the most recent source data but preserves
 * firstSeenAt and the `imported` flag.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

const leadInputShape = v.object({
    email: v.string(),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    state: v.optional(v.string()),
    website: v.optional(v.string()),
    leadScore: v.optional(v.number()),
    verified: v.optional(v.boolean()),
});

/**
 * Insert new leads or refresh existing ones. Idempotent — calling twice with
 * the same input is safe. Returns counts so the caller can tell the user
 * "10 new + 5 already seen".
 */
export const bulkUpsert = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        leads: v.array(leadInputShape),
        industry: v.optional(v.string()),
        searchLocation: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const now = Date.now();
        let inserted = 0;
        let refreshed = 0;

        for (const lead of args.leads) {
            const email = lead.email.toLowerCase().trim();
            if (!email || !email.includes("@")) continue;

            const existing = await ctx.db
                .query("scrapedLeads")
                .withIndex("by_user_email", (q) =>
                    q.eq("userId", userId).eq("email", email)
                )
                .first();

            if (existing) {
                // Refresh latest data, preserve firstSeenAt + imported flag.
                await ctx.db.patch(existing._id, {
                    name: lead.name ?? existing.name,
                    company: lead.company ?? existing.company,
                    phone: lead.phone ?? existing.phone,
                    address: lead.address ?? existing.address,
                    state: lead.state ?? existing.state,
                    website: lead.website ?? existing.website,
                    leadScore: lead.leadScore ?? existing.leadScore,
                    verified: lead.verified ?? existing.verified,
                    industry: args.industry ?? existing.industry,
                    searchLocation: args.searchLocation ?? existing.searchLocation,
                    lastSeenAt: now,
                });
                refreshed++;
            } else {
                await ctx.db.insert("scrapedLeads", {
                    userId,
                    email,
                    name: lead.name,
                    company: lead.company,
                    phone: lead.phone,
                    address: lead.address,
                    state: lead.state,
                    website: lead.website,
                    leadScore: lead.leadScore,
                    verified: lead.verified,
                    industry: args.industry,
                    searchLocation: args.searchLocation,
                    firstSeenAt: now,
                    lastSeenAt: now,
                });
                inserted++;
            }
        }

        return { inserted, refreshed };
    },
});

/** Return the lowercase email of every lead this user has ever scraped. */
export const getSeenEmails = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) return [];

        const leads = await ctx.db
            .query("scrapedLeads")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        return leads.map((l) => l.email);
    },
});

/** Full history list, newest first. */
export const list = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) return [];
        return await ctx.db
            .query("scrapedLeads")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

/** Mark leads as imported (called after the user imports into contacts). */
export const markImported = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        emails: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const now = Date.now();
        let updated = 0;
        for (const rawEmail of args.emails) {
            const email = rawEmail.toLowerCase().trim();
            const existing = await ctx.db
                .query("scrapedLeads")
                .withIndex("by_user_email", (q) =>
                    q.eq("userId", userId).eq("email", email)
                )
                .first();
            if (existing && !existing.imported) {
                await ctx.db.patch(existing._id, {
                    imported: true,
                    lastSeenAt: now,
                });
                updated++;
            }
        }
        return { updated };
    },
});

export const remove = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        ids: v.array(v.id("scrapedLeads")),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        let deleted = 0;
        for (const id of args.ids) {
            const lead = await ctx.db.get(id);
            if (lead && lead.userId === userId) {
                await ctx.db.delete(id);
                deleted++;
            }
        }
        return { deleted };
    },
});

export const clearAll = mutation({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const leads = await ctx.db
            .query("scrapedLeads")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        for (const lead of leads) {
            await ctx.db.delete(lead._id);
        }
        return { deleted: leads.length };
    },
});
