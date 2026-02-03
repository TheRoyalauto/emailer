/**
 * Lead Scraper - Main orchestrator that ties everything together
 */

import { crawlPage, crawlPages } from './crawler';
import {
    extractEmailsFromHtml,
    extractContactInfo,
    getContactPageUrls,
    ExtractedContact,
} from './email-extractor';
import { validateEmail, calculateLeadScore } from './email-validator';
import { googleSearch, buildSearchQuery } from './google-search';
import * as cheerio from 'cheerio';

export interface ScrapedLead {
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    address?: string;
    leadScore: number;
    source: string;
    verified: boolean;
}

export interface ScrapeResult {
    leads: ScrapedLead[];
    totalScraped: number;
    errors: string[];
}

/**
 * Main lead scraping function
 */
export async function scrapeLeads(
    prompt: string,
    maxLeads: number = 20
): Promise<ScrapeResult> {
    const errors: string[] = [];
    const leads: ScrapedLead[] = [];
    const seenEmails = new Set<string>();

    try {
        // Step 1: Search for relevant businesses
        console.log('[Scraper] Searching for:', prompt);
        const searchQuery = buildSearchQuery(prompt);
        const searchResults = await googleSearch(searchQuery, 20);

        if (searchResults.length === 0) {
            errors.push('No search results found');
            return { leads: [], totalScraped: 0, errors };
        }

        console.log(`[Scraper] Found ${searchResults.length} search results`);

        // Step 2: Extract business website URLs from search results
        const websiteUrls = await extractBusinessWebsites(searchResults);
        console.log(`[Scraper] Extracted ${websiteUrls.length} business websites`);

        // Step 3: Crawl each website for contact info
        let scraped = 0;
        for (const url of websiteUrls) {
            if (leads.length >= maxLeads) break;

            try {
                const contact = await scrapeWebsite(url);

                if (contact && contact.email && !seenEmails.has(contact.email)) {
                    seenEmails.add(contact.email);

                    // Validate email
                    const validation = await validateEmail(contact.email);

                    const lead: ScrapedLead = {
                        email: contact.email,
                        name: contact.name,
                        company: contact.company,
                        phone: contact.phone,
                        location: extractLocation(prompt),
                        website: contact.website,
                        address: contact.address,
                        leadScore: calculateLeadScore(contact),
                        source: contact.source || url,
                        verified: validation.valid,
                    };

                    leads.push(lead);
                    console.log(`[Scraper] Found lead: ${lead.email} (score: ${lead.leadScore})`);
                }

                scraped++;
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Failed to scrape ${url}: ${msg}`);
            }

            // Rate limiting
            await sleep(500);
        }

        // Sort by lead score
        leads.sort((a, b) => b.leadScore - a.leadScore);

        return { leads, totalScraped: scraped, errors };
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Scraper error: ${msg}`);
        return { leads, totalScraped: 0, errors };
    }
}

/**
 * Extract business website URLs from directory listings
 */
async function extractBusinessWebsites(searchResults: { url: string; title: string }[]): Promise<string[]> {
    const websites: string[] = [];

    for (const result of searchResults) {
        // If it's a Yelp or Yellow Pages page, crawl it for business websites
        if (result.url.includes('yelp.com') || result.url.includes('yellowpages.com')) {
            try {
                const crawlResult = await crawlPage(result.url);
                if (crawlResult.success) {
                    const businessUrls = extractBusinessUrlsFromDirectory(crawlResult.html, result.url);
                    websites.push(...businessUrls);
                }
            } catch {
                // Ignore errors, continue with other results
            }
        } else if (!result.url.includes('google.com/maps')) {
            // Direct business website
            websites.push(result.url);
        }
    }

    // Deduplicate by domain
    const seenDomains = new Set<string>();
    return websites.filter(url => {
        try {
            const domain = new URL(url).hostname;
            if (seenDomains.has(domain)) return false;
            seenDomains.add(domain);
            return true;
        } catch {
            return false;
        }
    });
}

/**
 * Extract business website URLs from Yelp/YellowPages listing pages
 */
function extractBusinessUrlsFromDirectory(html: string, sourceUrl: string): string[] {
    const $ = cheerio.load(html);
    const urls: string[] = [];

    if (sourceUrl.includes('yelp.com')) {
        // Yelp business links
        $('a[href*="/biz/"]').each((_, el) => {
            const href = $(el).attr('href');
            if (href && !href.includes('/biz_photos/')) {
                const fullUrl = href.startsWith('http') ? href : `https://www.yelp.com${href}`;
                urls.push(fullUrl);
            }
        });
    } else if (sourceUrl.includes('yellowpages.com')) {
        // Yellow Pages business links
        $('a.business-name').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                const fullUrl = href.startsWith('http') ? href : `https://www.yellowpages.com${href}`;
                urls.push(fullUrl);
            }
        });
        // Also get "Visit Website" links
        $('a.track-visit-website').each((_, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('http')) {
                urls.push(href);
            }
        });
    }

    return urls.slice(0, 20); // Limit per directory
}

/**
 * Scrape a single website for contact information
 */
async function scrapeWebsite(url: string): Promise<Partial<ExtractedContact> | null> {
    // Crawl main page
    const mainPage = await crawlPage(url);
    if (!mainPage.success) {
        return null;
    }

    let contact = extractContactInfo(mainPage.html, url);

    // If no email found, try contact/about pages
    if (!contact.email) {
        const contactUrls = getContactPageUrls(url);
        for (const contactUrl of contactUrls) {
            const page = await crawlPage(contactUrl);
            if (page.success) {
                const emails = extractEmailsFromHtml(page.html, contactUrl);
                if (emails.length > 0) {
                    contact.email = emails[0];
                    contact.source = contactUrl;
                    break;
                }
            }
            await sleep(300);
        }
    }

    return contact.email ? contact : null;
}

/**
 * Extract location from user prompt
 */
function extractLocation(prompt: string): string | undefined {
    const match = prompt.match(/in\s+([^,]+(?:,\s*[A-Za-z]+)?)/i);
    if (match) {
        return match[1].trim();
    }
    return undefined;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
