/**
 * Real Lead Scraper - Direct Website Scraping
 * Data sources (in priority order):
 *   1. Scrapling (self-hosted Google Maps scraper — free, structured business data)
 *   2. Google Custom Search API (fallback, finds websites by keyword)
 *   3. AI generation (last resort, clearly marked as simulated)
 */

import { crawlPage, CrawlResult } from './crawler';
import { extractContactInfo, extractEmailsFromHtml, extractPhonesFromHtml, extractBusinessName, ExtractedContact, getContactPageUrls } from './email-extractor';
import { validateEmail, calculateLeadScore, ValidationResult } from './email-validator';
import { scraplingSearch, ScraplingResult } from './scrapling-search';

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
}

/**
 * Main scraping function — searches for businesses and extracts real contact info
 */
export async function scrapeLeads(
    prompt: string,
    maxResults: number = 20
): Promise<ScrapeResult> {
    const errors: string[] = [];
    const leads: ScrapedLead[] = [];
    const seenEmails = new Set<string>();

    console.log(`[Scraper] Searching for: ${prompt}`);

    // --- Source 1: Scrapling (Google Maps, structured business data) ---
    let searchResults: Array<{ url: string; title: string; prefill?: ScraplingResult['prefill'] }> = [];

    if (process.env.SCRAPER_URL) {
        try {
            const scraplingResults = await scraplingSearch(prompt, maxResults);
            if (scraplingResults.length > 0) {
                searchResults = scraplingResults;
                console.log(`[Scraper] Scrapling returned ${searchResults.length} shops`);
            }
        } catch (err) {
            console.error('[Scraper] Scrapling error:', err);
            errors.push('Scrapling search failed, falling back to Google Custom Search');
        }
    }

    // --- Source 2: Google Custom Search API (fallback) ---
    if (searchResults.length === 0) {
        const { businessType, location } = parseQuery(prompt);

        if (!businessType) {
            errors.push('Could not determine business type from query');
            return { leads: [], totalScraped: 0, errors };
        }

        const googleResults = await googleCustomSearch(businessType, location, maxResults);
        searchResults = googleResults.map(r => ({ url: r.url, title: r.title }));

        if (searchResults.length === 0) {
            errors.push('No search results found. Configure SCRAPER_URL or Google Custom Search API.');
            return { leads: [], totalScraped: 0, errors };
        }

        console.log(`[Scraper] Google Custom Search returned ${searchResults.length} results`);
    }

    // --- Crawl each result and extract contact info ---
    let scraped = 0;

    for (const result of searchResults) {
        if (leads.length >= maxResults) break;

        try {
            if (isDirectoryUrl(result.url)) {
                console.log(`[Scraper] Skipping directory: ${result.url}`);
                continue;
            }

            console.log(`[Scraper] Crawling: ${result.url}`);
            const crawlResult: CrawlResult = await crawlPage(result.url);
            scraped++;

            if (!crawlResult.success || !crawlResult.html) {
                console.log(`[Scraper] No HTML from: ${result.url} - ${crawlResult.error}`);
                continue;
            }

            const html = crawlResult.html;

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

            for (const email of emails) {
                if (seenEmails.has(email.toLowerCase())) continue;
                if (leads.length >= maxResults) break;

                const validation: ValidationResult = await validateEmail(email);

                if (!validation.valid) {
                    console.log(`[Scraper] Invalid email: ${email} - ${validation.reason}`);
                    continue;
                }

                seenEmails.add(email.toLowerCase());

                const leadScore = calculateLeadScore({
                    email,
                    phone: phones[0],
                    company,
                    website: result.url,
                    address,
                });

                leads.push({
                    email,
                    name: undefined,
                    company: company || extractCompanyFromUrl(result.url),
                    phone: phones[0] ? formatPhone(phones[0]) : undefined,
                    location: result.prefill?.state || undefined,
                    website: result.url,
                    address,
                    leadScore,
                    verified: validation.valid,
                    source: result.url,
                });

                console.log(`[Scraper] Found lead: ${email} from ${result.url}`);
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.log(`[Scraper] Error crawling ${result.url}: ${msg}`);
            errors.push(`Failed to crawl ${result.url}: ${msg}`);
        }
    }

    console.log(`[Scraper] Completed: ${leads.length} leads from ${scraped} pages`);

    return { leads, totalScraped: scraped, errors };
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

function formatPhone(digits: string): string {
    const clean = digits.replace(/\D/g, '');
    if (clean.length === 10) {
        return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
    }
    return digits;
}
