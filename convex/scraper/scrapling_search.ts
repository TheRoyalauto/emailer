/**
 * Scrapling-powered Google Maps search
 * Calls the self-hosted Scrapling FastAPI service to find any business type
 * by ZIP code or city, returning structured business data (no email — that
 * comes from crawling the business's website downstream).
 *
 * Vertical-agnostic — pass `keyword` to scrape any vertical (dentists,
 * restaurants, law firms, etc.). Defaults to collision-repair-shop for
 * backward compatibility with the n8n lead-gen workflow.
 */

export interface ScraplingShop {
    name: string;
    address: string;
    zip_code: string;
    state: string;
    rating: number;
    reviews: number;
    phone: string;
    website: string;
    score: number;
}

export interface ScraplingResult {
    url: string;
    title: string;
    // Pre-filled from Maps data — skips crawling for these fields
    prefill: {
        company: string;
        phone?: string;
        address?: string;
        state?: string;
        rating?: number;
        reviews?: number;
    };
}

/**
 * Extract ZIP codes or locations from a natural language query.
 * e.g. "collision shops in Houston TX 77001" → ["77001"] or ["Houston, TX"]
 */
export function extractLocations(prompt: string): string[] {
    const locations: string[] = [];

    // ZIP codes
    const zips = prompt.match(/\b\d{5}\b/g);
    if (zips) locations.push(...zips);

    // "in City, ST" pattern
    const cityMatch = prompt.match(/\bin\s+([A-Z][a-z]+(?: [A-Z][a-z]+)*(?:,\s*[A-Z]{2})?)/);
    if (cityMatch) locations.push(cityMatch[1]);

    // Fallback: any trailing location phrase
    if (locations.length === 0) {
        const fallback = prompt.replace(/collision\s+(shop|repair|center|body)/gi, '').trim();
        if (fallback.length > 2) locations.push(fallback);
    }

    return [...new Set(locations)];
}

export interface ScraplingSearchOptions {
    /** Business type — "dentist", "restaurant", "law firm", etc. Defaults to "collision repair shop". */
    keyword?: string;
    /** Explicit list of locations (ZIPs, "City, ST", or city names). Takes precedence over query parsing. */
    locations?: string[];
    /** Free-text query — used only if `locations` is not provided. */
    query?: string;
    /** Max business records to return across all locations. */
    maxResults?: number;
    /** Per-location card limit hint passed to the scraper. */
    perLocationLimit?: number;
    /** If true, include businesses with no website. Default false (websites are needed for email crawling). */
    includeWebsiteless?: boolean;
}

/**
 * Call the Scrapling service for one or more locations.
 * Returns URLs + prefill data ready for the crawler pipeline.
 *
 * Backward-compat: passing a string in the first position behaves like the
 * old `(query, maxResults)` signature.
 */
export async function scraplingSearch(
    optsOrQuery: ScraplingSearchOptions | string,
    maxResultsLegacy: number = 20
): Promise<ScraplingResult[]> {
    const scraperUrl = process.env.SCRAPER_URL;
    if (!scraperUrl) {
        console.log('[Scrapling] SCRAPER_URL not set — skipping');
        return [];
    }

    const opts: ScraplingSearchOptions = typeof optsOrQuery === 'string'
        ? { query: optsOrQuery, maxResults: maxResultsLegacy }
        : optsOrQuery;

    const keyword = opts.keyword?.trim() || 'collision repair shop';
    const maxResults = opts.maxResults ?? 20;
    // Railway scraper caps at 60 cards per call (Maps pagination limit). Above
    // that the FastAPI Query(le=60) validator returns 422 and we get 0 results.
    // Clamp here so the call always succeeds; for >60 leads the user must use
    // multiple locations.
    const perLocationLimit = Math.min(60, opts.perLocationLimit ?? Math.max(15, maxResults));
    const includeWebsiteless = opts.includeWebsiteless ?? false;

    let locations = opts.locations?.map(l => l.trim()).filter(Boolean) ?? [];
    if (locations.length === 0 && opts.query) {
        locations = extractLocations(opts.query);
    }

    if (locations.length === 0) {
        console.log('[Scrapling] No locations provided. Query:', opts.query);
        return [];
    }

    const results: ScraplingResult[] = [];
    const seen = new Set<string>();

    for (const loc of locations.slice(0, 5)) {
        if (results.length >= maxResults) break;

        try {
            const url = new URL(`${scraperUrl}/api/scrape`);
            // Send both `zip_code` (legacy required param on the un-redeployed
            // scraper) and `location`+`keyword` (new params). The new scraper
            // ignores `zip_code` if `location` is set; the old scraper ignores
            // `keyword`+`location` and uses `zip_code` with the hardcoded
            // collision-shop search. Belt-and-suspenders for redeploy ordering.
            url.searchParams.set('zip_code', loc);
            url.searchParams.set('location', loc);
            url.searchParams.set('keyword', keyword);
            url.searchParams.set('limit', String(perLocationLimit));

            console.log(`[Scrapling] Fetching: ${url.toString()}`);

            const res = await fetch(url.toString(), {
                signal: AbortSignal.timeout(45_000),
            });

            if (!res.ok) {
                console.error(`[Scrapling] HTTP ${res.status} for location: ${loc}`);
                continue;
            }

            const data: { shops?: ScraplingShop[]; error?: string } = await res.json();

            if (data.error) {
                console.error('[Scrapling] Service error:', data.error);
                continue;
            }

            for (const shop of data.shops ?? []) {
                if (results.length >= maxResults) break;

                const website = shop.website?.trim();
                // Use website as the dedup key when present; fall back to (name+address)
                // so we still surface websiteless businesses when allowed.
                const key = website || `${shop.name}|${shop.address}`;
                if (seen.has(key)) continue;
                if (!website && !includeWebsiteless) continue;
                seen.add(key);

                results.push({
                    url: website || '',
                    title: shop.name,
                    prefill: {
                        company: shop.name,
                        phone: shop.phone || undefined,
                        address: shop.address || undefined,
                        state: shop.state || undefined,
                        rating: shop.rating || undefined,
                        reviews: shop.reviews || undefined,
                    },
                });
            }
        } catch (err) {
            console.error(`[Scrapling] Request failed for ${loc}:`, err);
        }
    }

    console.log(`[Scrapling] Returning ${results.length} businesses (keyword="${keyword}", locations=${locations.length})`);
    return results;
}
