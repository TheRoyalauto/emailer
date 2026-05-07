/**
 * Periodic Railway scraper warmer (v1.1 ops).
 *
 * Railway idles inactive containers; if we go 24h without a scrape the next
 * one cold-starts (~30s extra). This action pings /api/health on a cron to
 * keep the container hot.
 *
 * Note: this does NOT prevent the Camoufox-after-long-uptime crash that
 * `reference_camoufox_page_crash.md` documents. That's a memory-pressure
 * issue inside Camoufox itself and only a redeploy fixes it. The warmer's
 * sole job is preventing Railway-side container hibernation.
 */

import { internalAction } from "./_generated/server";

const SCRAPER_URL = "https://scraper-production-b94c.up.railway.app";

export const ping = internalAction({
    args: {},
    handler: async () => {
        try {
            const res = await fetch(`${SCRAPER_URL}/api/health`, {
                signal: AbortSignal.timeout(10_000),
            });
            console.log(`[warmer] ping ${res.status} ${res.ok ? "OK" : "DEGRADED"}`);
        } catch (e) {
            console.error("[warmer] ping failed:", e instanceof Error ? e.message : e);
        }
    },
});
