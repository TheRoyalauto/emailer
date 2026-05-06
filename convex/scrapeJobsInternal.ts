/**
 * Internal-only queries for the scraper action.
 *
 * Kept separate from `scrapeJobs.ts` because internal queries return all
 * fields (including any future fields not exposed to the user query), and
 * separating them documents that distinction.
 */

import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

/** Read all params + state of a job. Used by the runScrape action. */
export const getInternal = internalQuery({
    args: { jobId: v.id("scrapeJobs") },
    handler: async (ctx, { jobId }) => {
        return await ctx.db.get(jobId);
    },
});
