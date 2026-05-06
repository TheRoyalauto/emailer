"use node";

/**
 * Durable scrape worker.
 *
 * The `create` mutation in scrapeJobs.ts schedules this action immediately
 * after inserting a queued job. The action runs the full scrape pipeline,
 * piping every progress event into Convex via internal mutations so the
 * frontend's reactive `get(jobId)` query renders live updates.
 *
 * Why an action instead of a Next.js route handler:
 *   - Survives client navigation / page refresh — the user can come back
 *     and the job will either still be running or already finished.
 *   - Multiple jobs run concurrently for one user without competing for
 *     the same Next.js function instance.
 *   - Cancel button works: action polls `cancelRequested` between phases,
 *     bails cleanly if the user requested cancellation.
 *
 * Runtime: `"use node"` is required because email-validator uses
 * `dns/promises` for MX lookups (Node-only). Convex's default V8 runtime
 * doesn't expose those.
 */

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { scrapeLeads, ScrapeEvent } from "./scraper";

interface CancelRequestedFlag { cancelled: boolean }

export const runScrape = internalAction({
    args: { jobId: v.id("scrapeJobs") },
    handler: async (ctx, { jobId }) => {
        await ctx.runMutation(internal.scrapeJobs.markRunning, { jobId });

        // Buffer phase changes / log lines / leads in-process and flush them
        // periodically so we don't issue 100+ tiny mutations during a scrape.
        // Trade-off: ~250ms latency between event firing and UI paint, in
        // exchange for ~5x fewer roundtrips.
        const logBuffer: { elapsedMs: number; level: string; text: string }[] = [];
        let lastFlush = Date.now();
        const cancellation: CancelRequestedFlag = { cancelled: false };

        const flushLogs = async () => {
            if (logBuffer.length === 0) return;
            const entries = logBuffer.splice(0, logBuffer.length);
            await ctx.runMutation(internal.scrapeJobs.appendLogs, { jobId, entries });
            lastFlush = Date.now();
        };

        const onEvent = (event: ScrapeEvent) => {
            if (event.type === "log") {
                logBuffer.push({
                    elapsedMs: event.elapsedMs,
                    level: event.level,
                    text: event.text,
                });
            }
            // Phase + lead-found are user-visible enough to flush eagerly.
            // We do this best-effort — fire and forget, since the action
            // doesn't await these inside the synchronous callback.
            if (event.type === "phase") {
                ctx.runMutation(internal.scrapeJobs.setPhase, {
                    jobId,
                    phaseIdx: event.phase,
                    phaseLabel: event.label,
                }).catch(() => { /* swallow — action continues regardless */ });
            }
            if (event.type === "lead-found") {
                ctx.runMutation(internal.scrapeJobs.appendLead, {
                    jobId,
                    lead: {
                        email: event.lead.email,
                        name: event.lead.name,
                        company: event.lead.company,
                        phone: event.lead.phone,
                        location: event.lead.location,
                        website: event.lead.website,
                        address: event.lead.address,
                        leadScore: event.lead.leadScore,
                        verified: event.lead.verified,
                    },
                }).catch(() => { /* */ });
            }
            // Time-based log flush. 500ms is a comfortable beat for the
            // perceived "live console" experience.
            if (Date.now() - lastFlush > 500) {
                flushLogs().catch(() => { /* */ });
            }
        };

        // Periodic cancel poll — the action stops cleanly if the user
        // pressed Cancel. Runs in parallel with the scrape itself.
        const cancelPoll = setInterval(async () => {
            try {
                const cancelled = await ctx.runQuery(
                    internal.scrapeJobs.isCancelRequested,
                    { jobId },
                );
                if (cancelled) cancellation.cancelled = true;
            } catch { /* */ }
        }, 1500);

        // Fetch the job to get its params
        const job = await ctx.runQuery(internal.scrapeJobsInternal.getInternal, { jobId });
        if (!job) {
            clearInterval(cancelPoll);
            return;
        }

        try {
            const result = await scrapeLeads({
                industry: job.industry,
                locations: job.locations,
                prompt: job.prompt,
                maxResults: job.count,
                skipEmailExtraction: job.fields ? !job.fields.includes("email") : false,
                verifyEmails: job.verifyEmails ?? true,
                excludeDomains: job.excludeDomains,
                excludeEmails: job.excludeEmails,
                onEvent,
                shouldCancel: () => cancellation.cancelled,
            });

            // Final flush of any buffered log lines.
            await flushLogs();

            if (cancellation.cancelled) {
                await ctx.runMutation(internal.scrapeJobs.cancelJobInternal, { jobId });
                return;
            }

            await ctx.runMutation(internal.scrapeJobs.completeJob, {
                jobId,
                source: result.source,
                totalScraped: result.totalScraped,
            });
        } catch (err) {
            await flushLogs().catch(() => { /* */ });
            await ctx.runMutation(internal.scrapeJobs.failJob, {
                jobId,
                errorMessage: err instanceof Error ? err.message : String(err),
            });
        } finally {
            clearInterval(cancelPoll);
        }
    },
});
