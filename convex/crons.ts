import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Keep the Railway scraper container warm. Hits /api/health every 4 hours
 * so Railway doesn't hibernate the instance. See `convex/scraperWarmer.ts`.
 */
crons.interval(
    "warm-railway-scraper",
    { hours: 4 },
    internal.scraperWarmer.ping,
    {},
);

export default crons;
