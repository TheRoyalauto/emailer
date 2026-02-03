/**
 * Real Lead Scraper - Direct Website Scraping
 * Searches Google, extracts actual business websites, and scrapes contact info
 */

import { crawlPage, CrawlResult } from './crawler';
import { extractContactInfo, extractEmailsFromHtml, extractPhonesFromHtml, extractBusinessName, ExtractedContact, getContactPageUrls } from './email-extractor';
import { validateEmail, calculateLeadScore, ValidationResult } from './email-validator';

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
 * Main scraping function - searches and extracts real contact info
 */
export async function scrapeLeads(
    prompt: string,
    maxResults: number = 20
): Promise<ScrapeResult> {
    const errors: string[] = [];
    const leads: ScrapedLead[] = [];
    const seenEmails = new Set<string>();

    console.log(`[Scraper] Searching for: ${prompt}`);

    // Parse the search query
    const { businessType, location } = parseQuery(prompt);

    if (!businessType) {
        errors.push('Could not determine business type from query');
        return { leads: [], totalScraped: 0, errors };
    }

    // Try Google Custom Search API first
    const searchResults = await googleCustomSearch(businessType, location, maxResults);

    if (searchResults.length === 0) {
        errors.push('No search results found. Try a different search term or location.');
        return { leads: [], totalScraped: 0, errors };
    }

    console.log(`[Scraper] Found ${searchResults.length} search results`);

    // Crawl each result and extract contact info
    let scraped = 0;
    for (const result of searchResults) {
        if (leads.length >= maxResults) break;

        try {
            // Skip non-business URLs
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

            // Extract emails and contact info
            let emails = extractEmailsFromHtml(html, result.url);
            const phones = extractPhonesFromHtml(html);
            const company = extractBusinessName(html, result.url);
            const contactInfo = extractContactInfo(html, result.url);

            // If no emails found on main page, try contact page
            if (emails.length === 0) {
                const contactUrls = getContactPageUrls(result.url);
                for (const contactUrl of contactUrls.slice(0, 2)) { // Check first 2 contact pages
                    try {
                        const contactCrawl = await crawlPage(contactUrl);
                        if (contactCrawl.success && contactCrawl.html) {
                            const moreEmails = extractEmailsFromHtml(contactCrawl.html, contactUrl);
                            emails.push(...moreEmails);
                            scraped++;
                        }
                    } catch {
                        // Ignore contact page errors
                    }
                }
            }

            // Process found emails
            for (const email of emails) {
                if (seenEmails.has(email.toLowerCase())) continue;
                if (leads.length >= maxResults) break;

                // Validate email
                const validation: ValidationResult = await validateEmail(email);

                if (!validation.valid) {
                    console.log(`[Scraper] Invalid email: ${email} - ${validation.reason}`);
                    continue;
                }

                seenEmails.add(email.toLowerCase());

                // Calculate lead score
                const leadScore = calculateLeadScore({
                    email,
                    phone: phones[0],
                    company,
                    website: result.url,
                    address: contactInfo.address,
                });

                leads.push({
                    email,
                    name: undefined, // We don't generate fake names
                    company: company || extractCompanyFromUrl(result.url),
                    phone: phones[0] ? formatPhone(phones[0]) : undefined,
                    location: location || undefined,
                    website: result.url,
                    address: contactInfo.address,
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

    return {
        leads,
        totalScraped: scraped,
        errors,
    };
}

/**
 * Parse user query into business type and location
 */
function parseQuery(prompt: string): { businessType: string; location: string } {
    const lower = prompt.toLowerCase();

    // Extract location
    const locationMatch = lower.match(/in\s+([^,]+(?:,\s*[a-z]{2,})?)/i);
    const location = locationMatch ? locationMatch[1].trim() : '';

    // Extract business type (everything before "in location")
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
 * Google Custom Search API
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
            const errorText = await response.text();
            console.error(`[Scraper] Google Search API error: ${response.status}`, errorText);
            return [];
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.log('[Scraper] No search results from Google');
            return [];
        }

        return data.items.map((item: any) => ({
            title: item.title || '',
            url: item.link || '',
        }));
    } catch (error) {
        console.error('[Scraper] Google Search error:', error);
        return [];
    }
}

/**
 * Check if URL is a directory (not a business website)
 */
function isDirectoryUrl(url: string): boolean {
    const directories = [
        'yelp.com',
        'yellowpages.com',
        'google.com/maps',
        'facebook.com',
        'linkedin.com',
        'bing.com',
        'mapquest.com',
        'manta.com',
        'bbb.org',
        'angi.com',
        'thumbtack.com',
        'nextdoor.com',
    ];

    return directories.some(dir => url.includes(dir));
}

/**
 * Extract company name from URL
 */
function extractCompanyFromUrl(url: string): string | undefined {
    try {
        const hostname = new URL(url).hostname;
        // Remove www. and common TLDs
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

/**
 * Format phone number
 */
function formatPhone(digits: string): string {
    const clean = digits.replace(/\D/g, '');
    if (clean.length === 10) {
        return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
    }
    return digits;
}
