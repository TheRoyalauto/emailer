# Changelog

All notable changes to the emailer project. Format loosely follows [Keep a
Changelog](https://keepachangelog.com/en/1.1.0/) — section ordering: Added,
Changed, Deprecated, Removed, Fixed, Security.

## [Unreleased]

### Removed
- Dead `src/app/api/scrape-leads/` SSE route. Replaced by Convex action in v1.0-scraper.

### Added
- This CHANGELOG.

## [v1.0-scraper] — 2026-05-06

The Lead Scraper feature was rebuilt end-to-end. Tagged release.

### Added
- **Durable scrape jobs** — every search creates a `scrapeJobs` Convex row and schedules an `internal.scraperActions.runScrape` action. Survives page refresh, supports concurrent jobs per user, supports cancellation.
- **`scrapedLeads` table** — persistent history of every lead the user has ever seen. Enables server-side dedup against future searches.
- **`/scraper/history` route** — sortable table of every past lead with filters (industry, imported status), bulk import, bulk delete.
- **Recent jobs strip** on `/scraper` — clickable pills for in-flight + completed jobs.
- **Cancel button** — sets `cancelRequested: true`; action polls every 1.5s and bails cleanly.
- **Skip-already-in-contacts** — derived from the user's contacts table; sent to the action which filters Maps results before crawling, saving real time.
- **Geo-mapped radar pings** — each lead's state field maps to a cardinal/intercardinal angle (CA→west, NY→east, FL→south). Pings appear at the geographically-correct position on the radar.
- **Web Audio sound design** — phase / lead / ping voices via synth, mute toggle persists in localStorage.
- **Reduced-motion respect** — disables aurora drift, twinkles, sweep rotation under `prefers-reduced-motion: reduce`.
- **Responsive scanner** — `min(86vw, 480px)` sizing, ring labels render inside the SVG so they auto-scale.
- **Industry-synonyms helper** — narrow terms ("law firm") show alternative chips ("lawyer", "attorney") below the input.
- **State auto-suggest** — typing a state name reveals 5 top-cities chips with a one-click "Add all 5".
- **Industry chips, multi-location pills, lead-count segmented control, field checkboxes, email-verification toggle** — replaces the old free-text textarea.
- **Slide-over typed mode** — for users who prefer the legacy free-text query.

### Changed
- **Scraper backend moved from in-process Next.js → Convex action** (`"use node"` runtime). All Node deps replaced where possible — DNS lookups now go through Cloudflare DNS-over-HTTPS so the validator works in any runtime.
- **Vertical-agnostic scraping** — Railway scraper accepts `keyword=<industry>` instead of being hardcoded to collision shops. Default keyword preserves n8n workflow 01 backward compat.
- **Generalized US street-address regex** — works for any vertical (catches Suite/Apt/Unit designators), no longer keyword-anchored.
- **Cinematic search overlay** — replaced cartoon robot + grid background + bullet-list panels with: animated gradient-mesh backdrop (drifting aurora orbs + twinkling stars + film grain + vignette), single 480px hero radar with a CSS conic-gradient sweep, three-layer ping animation (ripple, glow, hot center, connection line from core).
- **Sortable results table with filter chips** — replaced the card list. Filter chips (All / New only / Verified / Has email / Score≥7), click row → detail side panel with Maps + LinkedIn quick links.
- **CSV export + Print** — both respect ticked field columns; print uses `@media print` CSS to render a clean printable view.
- **Honest progress display** — no fake counters. Live `LEADS N` counter only increments on real `lead-found` events from the Convex action. Phase progress driven by `livePhase.idx` from the reactive subscription.
- **Convex `/ingest-leads` webhook** — empty `leads` array now returns 200 with zero counts (was 400).
- **`leadSearches` table** — added optional `failureReason`, `industry`, `locations` fields for telemetry on zero-result searches.

### Removed
- Cartoon robot animation component (replaced by hero radar).
- Fake counters in the loading overlay (replaced by reactive subscription state).
- Theatrical "leads found: X" simulation that didn't match actual results.

### Fixed
- 50+ leads no longer auto-fails — Railway scraper caps `limit` at 60, frontend now clamps `perLocationLimit` to `min(60, requested)` and surfaces a "Add another location to reach N" UI tip when the request would exceed one location's capacity.
- "No results" misleading error when SCRAPER_URL was set — now reports the actual cause (timeout, page crash, narrow keyword, too-broad location).
- State-name location warning — chips for "California" / "Texas" / etc. render amber with ⚠ instead of cyan, with a banner suggesting cities/ZIPs.
- Page-refresh resilience — scrapes continue server-side and the UI re-attaches to the running job on remount.

### Security
- DNS lookups for email validation no longer require Node runtime, so the validator can run in Convex's V8 actions without exposing internal Node APIs.

## Older

See git log prior to commit `fd17cf3` for previous scraper iterations (in-process route handler, SSE streaming, simulated console feed).
