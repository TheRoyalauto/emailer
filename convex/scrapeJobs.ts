/**
 * Convex layer for the durable scrape-job system.
 *
 * Lifecycle:
 *   queued  → mutation `create` inserts a row, frontend schedules the action
 *   running → action calls `markRunning` to flip status + record startedAt
 *   running → action streams phases/logs/leads via patch mutations
 *   complete | failed | cancelled → terminal states with completedAt set
 *
 * Frontend subscribes to `get(jobId)` for reactive updates. Surviving page
 * refresh comes for free — the action runs server-side and the next mount
 * picks up wherever the job is.
 */

import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const leadShape = v.object({
    email: v.string(),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(v.string()),
    leadScore: v.optional(v.number()),
    verified: v.optional(v.boolean()),
});

/** Create a queued job and immediately schedule the action that runs it. */
export const create = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        industry: v.optional(v.string()),
        locations: v.optional(v.array(v.string())),
        prompt: v.optional(v.string()),
        count: v.number(),
        fields: v.optional(v.array(v.string())),
        verifyEmails: v.optional(v.boolean()),
        excludeDomains: v.optional(v.array(v.string())),
        excludeEmails: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        const jobId = await ctx.db.insert("scrapeJobs", {
            userId,
            status: "queued",
            industry: args.industry,
            locations: args.locations,
            prompt: args.prompt,
            count: args.count,
            fields: args.fields,
            verifyEmails: args.verifyEmails,
            excludeDomains: args.excludeDomains,
            excludeEmails: args.excludeEmails,
            leadsCount: 0,
            logs: [],
            leads: [],
            createdAt: Date.now(),
        });

        // Hand off to the durable action. runAfter(0, ...) enqueues
        // immediately on the Convex action runner.
        await ctx.scheduler.runAfter(0, internal.scraperActions.runScrape, { jobId });

        return jobId;
    },
});

/** Single-job subscription target for the frontend reactive query. */
export const get = query({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        jobId: v.id("scrapeJobs"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) return null;
        const job = await ctx.db.get(args.jobId);
        if (!job || job.userId !== userId) return null;
        return job;
    },
});

/** Recent jobs for this user — powers the multi-search "in-flight" panel. */
export const listRecent = query({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())) },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) return [];
        return await ctx.db
            .query("scrapeJobs")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .take(10);
    },
});

/** User-facing cancel: action polls `cancelRequested` between phases. */
export const cancel = mutation({
    args: {
        sessionToken: v.optional(v.union(v.string(), v.null())),
        jobId: v.id("scrapeJobs"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");
        const job = await ctx.db.get(args.jobId);
        if (!job || job.userId !== userId) throw new Error("Not found");
        if (job.status === "complete" || job.status === "failed" || job.status === "cancelled") {
            return job.status;
        }
        await ctx.db.patch(args.jobId, { cancelRequested: true });
        return "cancellation requested";
    },
});

// ─── Internal mutations called by the action while it's running ────────────

export const markRunning = internalMutation({
    args: { jobId: v.id("scrapeJobs") },
    handler: async (ctx, { jobId }) => {
        await ctx.db.patch(jobId, { status: "running", startedAt: Date.now() });
    },
});

export const setPhase = internalMutation({
    args: {
        jobId: v.id("scrapeJobs"),
        phaseIdx: v.number(),
        phaseLabel: v.string(),
    },
    handler: async (ctx, { jobId, phaseIdx, phaseLabel }) => {
        await ctx.db.patch(jobId, { phaseIdx, phaseLabel });
    },
});

export const appendLogs = internalMutation({
    args: {
        jobId: v.id("scrapeJobs"),
        entries: v.array(
            v.object({
                elapsedMs: v.number(),
                level: v.string(),
                text: v.string(),
            }),
        ),
    },
    handler: async (ctx, { jobId, entries }) => {
        const job = await ctx.db.get(jobId);
        if (!job) return;
        const logs = (job.logs ?? []).concat(entries);
        // Keep last 500 lines max — bounds storage on long scrapes.
        const trimmed = logs.length > 500 ? logs.slice(-500) : logs;
        await ctx.db.patch(jobId, { logs: trimmed });
    },
});

export const appendLead = internalMutation({
    args: {
        jobId: v.id("scrapeJobs"),
        lead: leadShape,
    },
    handler: async (ctx, { jobId, lead }) => {
        const job = await ctx.db.get(jobId);
        if (!job) return;
        const leads = (job.leads ?? []).concat([lead]);
        await ctx.db.patch(jobId, {
            leads,
            leadsCount: leads.length,
        });
    },
});

export const completeJob = internalMutation({
    args: {
        jobId: v.id("scrapeJobs"),
        source: v.string(),
        totalScraped: v.optional(v.number()),
    },
    handler: async (ctx, { jobId, source, totalScraped }) => {
        await ctx.db.patch(jobId, {
            status: "complete",
            source,
            totalScraped,
            completedAt: Date.now(),
        });
    },
});

export const failJob = internalMutation({
    args: {
        jobId: v.id("scrapeJobs"),
        errorMessage: v.string(),
    },
    handler: async (ctx, { jobId, errorMessage }) => {
        await ctx.db.patch(jobId, {
            status: "failed",
            errorMessage,
            completedAt: Date.now(),
        });
    },
});

export const cancelJobInternal = internalMutation({
    args: { jobId: v.id("scrapeJobs") },
    handler: async (ctx, { jobId }) => {
        await ctx.db.patch(jobId, {
            status: "cancelled",
            completedAt: Date.now(),
        });
    },
});

/**
 * Internal read used by the action to check cancel signal between phases.
 * Read-only — exposed as a query rather than a mutation.
 */
export const isCancelRequested = internalQuery({
    args: { jobId: v.id("scrapeJobs") },
    handler: async (ctx, { jobId }) => {
        const job = await ctx.db.get(jobId);
        return job?.cancelRequested === true;
    },
});
