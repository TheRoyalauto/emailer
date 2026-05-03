/**
 * Scrapling-powered Google Maps search
 * Calls the self-hosted Scrapling FastAPI service to find collision shops
 * by ZIP code, returning structured business data (no email — that comes
 * from crawling the shop's website downstream).
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

/**
 * Call the Scrapling service for a given ZIP code or location string.
 * Returns URLs + prefill data ready for the crawler pipeline.
 */
export async function scraplingSearch(
    query: string,
    maxResults: number = 20
): Promise<ScraplingResult[]> {
    const scraperUrl = process.env.SCRAPER_URL;
    if (!scraperUrl) {
        console.log('[Scrapling] SCRAPER_URL not set — skipping');
        return [];
    }

    const locations = extractLocations(query);
    if (locations.length === 0) {
        console.log('[Scrapling] Could not extract location from query:', query);
        return [];
    }

    const results: ScraplingResult[] = [];
    const seen = new Set<string>();

    for (const loc of locations.slice(0, 3)) {
        if (results.length >= maxResults) break;

        try {
            const url = new URL(`${scraperUrl}/api/scrape`);
            url.searchParams.set('zip_code', loc);

            console.log(`[Scrapling] Fetching: ${url.toString()}`);

            const res = await fetch(url.toString(), {
                signal: AbortSignal.timeout(30_000),
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

                // Skip shops without a website (nothing to crawl for email)
                const website = shop.website?.trim();
                if (!website || seen.has(website)) continue;
                seen.add(website);

                results.push({
                    url: website,
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

    console.log(`[Scrapling] Returning ${results.length} shops to crawl`);
    return results;
}
