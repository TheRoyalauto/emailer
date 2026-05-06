/**
 * Real Lead Scraper - Direct Website Scraping
 * Data sources (in priority order):
 *   1. Scrapling (self-hosted Google Maps scraper — free, structured business data)
 *   2. Google Custom Search API (fallback, finds websites by keyword)
 *   3. AI generation (last resort, clearly marked as simulated)
 */

import { crawlPage, CrawlResult } from './crawler';
import { extractContactInfo, extractEmailsFromHtml, extractPhonesFromHtml, extractBusinessName, ExtractedContact, getContactPageUrls } from './email_extractor';
import { validateEmail, calculateLeadScore, ValidationResult } from './email_validator';
import { scraplingSearch, ScraplingResult, extractLocations } from './scrapling_search';

export interface ScrapedLead {
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    address?: string;
    leadScore: number;
    verified: boolean;
    source: string;
}

export interface ScrapeResult {
    leads: ScrapedLead[];
    totalScraped: number;
    errors: string[];
    source: 'scrapling' | 'google_custom_search' | 'mixed' | 'none';
}

export type ScrapeEvent =
    | { type: "phase"; phase: number; label: string; elapsedMs: number }
    | { type: "log"; level: "info" | "success" | "warn" | "data" | "system"; text: string; elapsedMs: number }
    | { type: "lead-found"; lead: ScrapedLead; elapsedMs: number }
    | { type: "complete"; totalLeads: number; totalScraped: number; source: ScrapeResult["source"]; elapsedMs: number }
    | { type: "error"; message: string; elapsedMs: number };

export interface ScrapeOptions {
    /** Business type. Free-text — passed through to Google Maps. */
    industry?: string;
    /** Explicit locations (ZIPs, "City, ST", city names). */
    locations?: string[];
    /** Free-text prompt — used to derive industry+locations when structured fields are missing. */
    prompt?: string;
    /** Total leads to return. */
    maxResults?: number;
    skipEmailExtraction?: boolean;
    verifyEmails?: boolean;
    excludeDomains?: string[];
    excludeEmails?: string[];
    /**
     * Real-time progress sink. Receives events as the scrape runs:
     * `phase` (when a major stage begins), `log` (per-step diagnostic),
     * `lead-found` (each new lead as it's verified), `error` (recoverable
     * issue), `complete` (final summary). Used by the SSE route to stream
     * to the UI's live console feed.
     */
    onEvent?: (event: ScrapeEvent) => void;
    /**
     * Polled between per-shop iterations. If it returns true, the scrape
     * bails cleanly and returns the leads gathered so far. Used by the
     * durable Convex action to honor user cancel requests.
     */
    shouldCancel?: () => boolean;
}

/**
 * Main scraping function. Accepts either a free-text `prompt` (legacy) or a
 * structured `ScrapeOptions` object.
 */
export async function scrapeLeads(
    optsOrPrompt: ScrapeOptions | string,
    maxResultsLegacy: number = 20
): Promise<ScrapeResult> {
    const opts: ScrapeOptions = typeof optsOrPrompt === 'string'
        ? { prompt: optsOrPrompt, maxResults: maxResultsLegacy }
        : optsOrPrompt;

    const errors: string[] = [];
    const leads: ScrapedLead[] = [];
    const seenEmails = new Set<string>();
    const startMs = Date.now();
    const elapsed = () => Date.now() - startMs;
    const emit = opts.onEvent ?? (() => {});
    const log = (level: "info" | "success" | "warn" | "data" | "system", text: string) =>
        emit({ type: "log", level, text, elapsedMs: elapsed() });
    const phase = (n: number, label: string) =>
        emit({ type: "phase", phase: n, label, elapsedMs: elapsed() });

    const maxResults = opts.maxResults ?? 20;
    const skipEmailExtraction = opts.skipEmailExtraction ?? false;
    const verifyEmails = opts.verifyEmails ?? true;

    // Resolve industry and locations
    let industry = opts.industry?.trim();
    let locations = opts.locations?.map(l => l.trim()).filter(Boolean) ?? [];
    if ((!industry || locations.length === 0) && opts.prompt) {
        const parsed = parseQuery(opts.prompt);
        industry = industry || parsed.businessType;
        if (locations.length === 0) {
            const fromPrompt = extractLocations(opts.prompt);
            if (fromPrompt.length > 0) locations = fromPrompt;
            else if (parsed.location) locations = [parsed.location];
        }
    }

    console.log(`[Scraper] industry="${industry}" locations=${JSON.stringify(locations)} max=${maxResults} skipEmail=${skipEmailExtraction}`);
    phase(0, "Bootstrapping fetcher");
    log("system", `Initializing scrape · keyword="${industry || "(none)"}" · locations=[${locations.join(", ")}]`);

    // --- Source 1: Scrapling (Google Maps, structured business data) ---
    let searchResults: Array<{ url: string; title: string; prefill?: ScraplingResult['prefill'] }> = [];

    // Normalize excludeDomains to a Set of lowercased hostnames (no "www.").
    const excludeDomainSet = new Set(
        (opts.excludeDomains ?? [])
            .map(d => d.trim().toLowerCase())
            .map(d => d.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0])
            .filter(Boolean)
    );
    const excludeEmailSet = new Set(
        (opts.excludeEmails ?? []).map(e => e.toLowerCase().trim()).filter(Boolean)
    );

    if (process.env.SCRAPER_URL && locations.length > 0) {
        phase(1, "Connecting to scraper");
        log("data", `GET https://scraper-production-b94c.up.railway.app/api/scrape · keyword="${industry || ""}" · ${locations.length} location(s)`);
        try {
            // Over-fetch from the scraper so we still hit maxResults after
            // dedup-skipping leads already in the user's contacts.
            const oversampleFactor = excludeDomainSet.size > 0 ? 2 : 1;
            phase(2, "Scanning Google Maps");
            const scraplingResults = await scraplingSearch({
                keyword: industry || undefined,
                locations,
                maxResults: Math.min(maxResults * oversampleFactor, 60 * Math.max(locations.length, 1)),
                includeWebsiteless: skipEmailExtraction,
            });
            if (scraplingResults.length > 0) {
                log("success", `Maps returned ${scraplingResults.length} businesses across ${locations.length} location(s)`);
                // Filter out businesses whose website matches a contact the
                // user already has — saves the per-website crawl + email
                // validate work entirely.
                const beforeFilter = scraplingResults.length;
                searchResults = scraplingResults.filter((r) => {
                    if (!r.url) return true; // websiteless — keep, no domain to compare
                    try {
                        const host = new URL(r.url).hostname.replace(/^www\./, "").toLowerCase();
                        return !excludeDomainSet.has(host);
                    } catch {
                        return true;
                    }
                });
                const skipped = beforeFilter - searchResults.length;
                if (skipped > 0) {
                    console.log(`[Scraper] Skipped ${skipped} leads already in contacts (matched on domain)`);
                    log("warn", `Skipped ${skipped} businesses already in your contacts`);
                }
                console.log(`[Scraper] Scrapling returned ${searchResults.length} businesses`);
            }
        } catch (err) {
            console.error('[Scraper] Scrapling error:', err);
            errors.push('Scrapling search failed, falling back to Google Custom Search');
        }
    }

    // --- Fast path: skip website crawling, return Maps listings as leads ---
    if (skipEmailExtraction && searchResults.length > 0) {
        phase(5, "Scoring + finalizing");
        log("system", "Fast path: returning Maps listings as-is (no website crawl)");
        for (const result of searchResults) {
            if (leads.length >= maxResults) break;
            const company = result.prefill?.company || result.title;
            const website = result.url || undefined;
            const placeholderEmail = website
                ? `unknown@${safeDomain(website)}`
                : `unknown@${slugify(company)}.local`;
            const leadScore = calculateLeadScore({
                email: placeholderEmail,
                phone: result.prefill?.phone,
                company,
                website,
                address: result.prefill?.address,
            });
            const lead: ScrapedLead = {
                email: placeholderEmail,
                company,
                phone: result.prefill?.phone ? formatPhone(result.prefill.phone) : undefined,
                location: result.prefill?.state || undefined,
                website,
                address: result.prefill?.address,
                leadScore,
                verified: false,
                source: website || 'google_maps',
            };
            leads.push(lead);
            emit({ type: "lead-found", lead, elapsedMs: elapsed() });
        }
        console.log(`[Scraper] Fast path: ${leads.length} listings returned (no email extraction)`);
        return {
            leads,
            totalScraped: searchResults.length,
            errors,
            source: 'scrapling',
        };
    }

    if (searchResults.length > 0) {
        phase(3, "Extracting from websites");
    }

    // --- Source 2: Google Custom Search API (fallback) ---
    if (searchResults.length === 0) {
        if (!industry) {
            errors.push('Could not determine business type from query');
            return { leads: [], totalScraped: 0, errors, source: 'none' };
        }

        // Detect state-only or country-only locations — these don't anchor a
        // local Maps search and almost always return 0 hits. Surface a
        // specific tip rather than a generic "no results" error.
        const tooBroadLocation = locations.find(loc => {
            const l = loc.trim().toLowerCase();
            return (
                /^(usa|us|united states|america)$/.test(l) ||
                US_STATE_NAMES.has(l) ||
                /^[a-z]{2}$/.test(l) // bare two-letter state code
            );
        });

        const locationStr = locations[0] || '';
        const hasGoogleCs = !!(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID);
        const googleResults = hasGoogleCs
            ? await googleCustomSearch(industry, locationStr, maxResults)
            : [];
        searchResults = googleResults.map(r => ({ url: r.url, title: r.title }));

        if (searchResults.length === 0) {
            const ctx = `"${industry}"${locations.length ? ` in ${locations.join(", ")}` : ""}`;
            if (tooBroadLocation) {
                errors.push(
                    `Google Maps returned 0 results for ${ctx}. "${tooBroadLocation}" is too broad — Maps needs a city or ZIP code to anchor the search. Try "Los Angeles, CA" or "90001" instead.`
                );
            } else {
                errors.push(
                    `Google Maps returned 0 results for ${ctx}. Try a more common search term (e.g. "lawyers" instead of "law firm"), a different city, or add a 5-digit ZIP code.`
                );
            }
            return { leads: [], totalScraped: 0, errors, source: 'none' };
        }

        console.log(`[Scraper] Google Custom Search returned ${searchResults.length} results`);
    }

    // --- Crawl each result and extract contact info ---
    let scraped = 0;

    let validationPhaseEntered = false;
    for (const result of searchResults) {
        if (leads.length >= maxResults) break;
        if (opts.shouldCancel?.()) {
            log("warn", "Scrape cancelled by user");
            break;
        }

        try {
            if (isDirectoryUrl(result.url)) {
                console.log(`[Scraper] Skipping directory: ${result.url}`);
                log("warn", `Skipping directory: ${safeDomain(result.url)}`);
                continue;
            }

            const host = safeDomain(result.url);
            log("data", `→ GET ${host}`);
            console.log(`[Scraper] Crawling: ${result.url}`);
            const crawlResult: CrawlResult = await crawlPage(result.url);
            scraped++;

            if (!crawlResult.success || !crawlResult.html) {
                console.log(`[Scraper] No HTML from: ${result.url} - ${crawlResult.error}`);
                log("warn", `${host}: ${crawlResult.error || "no HTML"}`);
                continue;
            }

            const html = crawlResult.html;
            log("info", `${host}: ${Math.round(html.length / 1024)} KB extracted`);

            let emails = extractEmailsFromHtml(html, result.url);
            // Use prefilled phone/company from Scrapling if available, else extract
            const phones = result.prefill?.phone
                ? [result.prefill.phone]
                : extractPhonesFromHtml(html);
            const company = result.prefill?.company || extractBusinessName(html, result.url);
            const contactInfo = extractContactInfo(html, result.url);
            const address = result.prefill?.address || contactInfo.address;

            // Try contact page if no emails on main page
            if (emails.length === 0) {
                log("info", `${host}: no email on landing · trying /contact`);
                const contactUrls = getContactPageUrls(result.url);
                for (const contactUrl of contactUrls.slice(0, 2)) {
                    try {
                        const contactCrawl = await crawlPage(contactUrl);
                        if (contactCrawl.success && contactCrawl.html) {
                            emails.push(...extractEmailsFromHtml(contactCrawl.html, contactUrl));
                            scraped++;
                        }
                    } catch {
                        // ignore
                    }
                }
            }
            if (emails.length > 0) {
                log("success", `${host}: regex matched ${emails.length} email${emails.length === 1 ? "" : "s"}`);
            }

            for (const email of emails) {
                const lowerEmail = email.toLowerCase();
                if (seenEmails.has(lowerEmail)) continue;
                // Skip emails that are already in the user's contacts —
                // belt-and-suspenders alongside the website-domain skip above.
                if (excludeEmailSet.has(lowerEmail)) {
                    seenEmails.add(lowerEmail);
                    log("warn", `Skipping ${email} · already in your contacts`);
                    continue;
                }
                if (leads.length >= maxResults) break;

                let valid = true;
                if (verifyEmails) {
                    if (!validationPhaseEntered) {
                        phase(4, "Validating emails (MX lookups)");
                        validationPhaseEntered = true;
                    }
                    log("data", `MX lookup ${email.split("@")[1]}`);
                    const validation: ValidationResult = await validateEmail(email);
                    if (!validation.valid) {
                        console.log(`[Scraper] Invalid email: ${email} - ${validation.reason}`);
                        log("warn", `${email}: ${validation.reason}`);
                        continue;
                    }
                    valid = validation.valid;
                }

                seenEmails.add(email.toLowerCase());

                const leadScore = calculateLeadScore({
                    email,
                    phone: phones[0],
                    company,
                    website: result.url,
                    address,
                });

                const newLead: ScrapedLead = {
                    email,
                    name: undefined,
                    company: company || extractCompanyFromUrl(result.url),
                    phone: phones[0] ? formatPhone(phones[0]) : undefined,
                    location: result.prefill?.state || undefined,
                    website: result.url,
                    address,
                    leadScore,
                    verified: valid,
                    source: result.url,
                };
                leads.push(newLead);
                emit({ type: "lead-found", lead: newLead, elapsedMs: elapsed() });

                console.log(`[Scraper] Found lead: ${email} from ${result.url}`);
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.log(`[Scraper] Error crawling ${result.url}: ${msg}`);
            errors.push(`Failed to crawl ${result.url}: ${msg}`);
        }
    }

    console.log(`[Scraper] Completed: ${leads.length} leads from ${scraped} pages`);
    phase(5, "Scoring + finalizing");
    log("success", `Pipeline complete · ${leads.length} leads from ${scraped} pages crawled`);
    const source: ScrapeResult["source"] = process.env.SCRAPER_URL ? 'scrapling' : 'google_custom_search';
    emit({ type: "complete", totalLeads: leads.length, totalScraped: scraped, source, elapsedMs: elapsed() });

    return { leads, totalScraped: scraped, errors, source };
}

/**
 * Parse user query into business type and location
 */
function parseQuery(prompt: string): { businessType: string; location: string } {
    const lower = prompt.toLowerCase();

    const locationMatch = lower.match(/in\s+([^,]+(?:,\s*[a-z]{2,})?)/i);
    const location = locationMatch ? locationMatch[1].trim() : '';

    let businessType = lower
        .replace(/find\s+(me\s+)?/i, '')
        .replace(/search\s+(for\s+)?/i, '')
        .replace(/get\s+(me\s+)?/i, '')
        .replace(/\d+\s*/g, '')
        .replace(/in\s+.*/i, '')
        .trim();

    return { businessType, location };
}

/**
 * Google Custom Search API (fallback when SCRAPER_URL is not set)
 */
async function googleCustomSearch(
    businessType: string,
    location: string,
    numResults: number
): Promise<{ title: string; url: string }[]> {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !engineId) {
        console.log('[Scraper] Google Search API not configured');
        return [];
    }

    const query = `${businessType} ${location} contact email`.trim();

    try {
        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.set('key', apiKey);
        url.searchParams.set('cx', engineId);
        url.searchParams.set('q', query);
        url.searchParams.set('num', String(Math.min(numResults, 10)));

        const response = await fetch(url.toString());

        if (!response.ok) {
            console.error(`[Scraper] Google Search API error: ${response.status}`, await response.text());
            return [];
        }

        const data = await response.json();
        if (!data.items?.length) return [];

        return data.items.map((item: { title?: string; link?: string }) => ({
            title: item.title || '',
            url: item.link || '',
        }));
    } catch (error) {
        console.error('[Scraper] Google Search error:', error);
        return [];
    }
}

function isDirectoryUrl(url: string): boolean {
    const directories = [
        'yelp.com', 'yellowpages.com', 'google.com/maps', 'facebook.com',
        'linkedin.com', 'bing.com', 'mapquest.com', 'manta.com',
        'bbb.org', 'angi.com', 'thumbtack.com', 'nextdoor.com',
    ];
    return directories.some(dir => url.includes(dir));
}

function extractCompanyFromUrl(url: string): string | undefined {
    try {
        const hostname = new URL(url).hostname;
        return hostname
            .replace(/^www\./, '')
            .replace(/\.(com|net|org|biz|info|co)$/i, '')
            .split('.')[0]
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    } catch {
        return undefined;
    }
}

// Lower-cased US state names. Used to detect locations that are too broad
// to anchor a Google Maps search.
const US_STATE_NAMES = new Set([
    "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
    "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho",
    "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana",
    "maine", "maryland", "massachusetts", "michigan", "minnesota",
    "mississippi", "missouri", "montana", "nebraska", "nevada",
    "new hampshire", "new jersey", "new mexico", "new york",
    "north carolina", "north dakota", "ohio", "oklahoma", "oregon",
    "pennsylvania", "rhode island", "south carolina", "south dakota",
    "tennessee", "texas", "utah", "vermont", "virginia", "washington",
    "west virginia", "wisconsin", "wyoming", "district of columbia",
]);

function formatPhone(digits: string): string {
    const clean = digits.replace(/\D/g, '');
    if (clean.length === 10) {
        return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
    }
    return digits;
}

function safeDomain(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return 'unknown.local';
    }
}

function slugify(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
}
