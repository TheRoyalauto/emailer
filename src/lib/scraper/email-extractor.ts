/**
 * Email Extractor - Extracts email addresses from HTML content
 */

import * as cheerio from 'cheerio';

// Email regex pattern - matches most valid emails
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Common contact page paths to check
const CONTACT_PATHS = ['/contact', '/contact-us', '/about', '/about-us', '/team', '/staff'];

// Blacklisted email patterns (not real contacts)
const EMAIL_BLACKLIST = [
    'example.com',
    'domain.com',
    'email.com',
    'yourcompany.com',
    'sentry.io',
    'wixpress.com',
    'wordpress.com',
    'squarespace.com',
    '.png',
    '.jpg',
    '.gif',
    '.svg',
    'noreply',
    'no-reply',
    'donotreply',
    'unsubscribe',
];

export interface ExtractedContact {
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    address?: string;
    source: string;
}

/**
 * Extract emails from HTML content
 */
export function extractEmailsFromHtml(html: string, sourceUrl: string): string[] {
    const emails = new Set<string>();

    // Method 1: Regex on raw HTML (catches obfuscated emails too)
    const rawMatches = html.match(EMAIL_REGEX) || [];
    rawMatches.forEach(email => emails.add(email.toLowerCase()));

    // Method 2: Parse mailto: links
    const $ = cheerio.load(html);
    $('a[href^="mailto:"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const email = href.replace('mailto:', '').split('?')[0].toLowerCase();
        if (email.includes('@')) {
            emails.add(email);
        }
    });

    // Filter out blacklisted emails
    const filtered = Array.from(emails).filter(email => {
        return !EMAIL_BLACKLIST.some(blacklisted => email.includes(blacklisted));
    });

    return filtered;
}

/**
 * Extract phone numbers from HTML
 */
export function extractPhonesFromHtml(html: string): string[] {
    const phones = new Set<string>();

    // US phone patterns
    const phonePatterns = [
        /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,  // (555) 123-4567 or 555-123-4567
        /\d{3}[-.\s]\d{3}[-.\s]\d{4}/g,          // 555.123.4567
        /\+1[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g, // +1 555 123 4567
    ];

    phonePatterns.forEach(pattern => {
        const matches = html.match(pattern) || [];
        matches.forEach(phone => {
            // Normalize phone format
            const normalized = phone.replace(/\D/g, '');
            if (normalized.length >= 10 && normalized.length <= 11) {
                phones.add(normalized.slice(-10)); // Last 10 digits
            }
        });
    });

    return Array.from(phones);
}

/**
 * Extract business name from HTML
 */
export function extractBusinessName(html: string, url: string): string | undefined {
    const $ = cheerio.load(html);

    // Try various meta tags and elements
    const sources = [
        $('meta[property="og:site_name"]').attr('content'),
        $('meta[name="application-name"]').attr('content'),
        $('meta[property="og:title"]').attr('content'),
        $('title').first().text(),
        $('h1').first().text(),
    ];

    for (const source of sources) {
        if (source && source.trim().length > 1 && source.length < 100) {
            // Clean up the name
            let name = source.trim()
                .replace(/\s*[-|–—]\s*.*/g, '') // Remove anything after dash
                .replace(/\s*\|\s*.*/g, '')    // Remove anything after pipe
                .trim();

            if (name.length > 1) {
                return name;
            }
        }
    }

    // Fallback: extract from domain
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        const name = domain.split('.')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
        return undefined;
    }
}

/**
 * Extract address from HTML
 */
export function extractAddress(html: string): string | undefined {
    const $ = cheerio.load(html);

    // Look for common address patterns
    const addressPatterns = [
        /\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)[\s,]+[\w\s]+,?\s*[A-Z]{2}\s+\d{5}/gi,
    ];

    for (const pattern of addressPatterns) {
        const match = html.match(pattern);
        if (match && match[0]) {
            return match[0].trim();
        }
    }

    // Try schema.org markup
    const streetAddress = $('[itemprop="streetAddress"]').first().text();
    const locality = $('[itemprop="addressLocality"]').first().text();
    const region = $('[itemprop="addressRegion"]').first().text();
    const postalCode = $('[itemprop="postalCode"]').first().text();

    if (streetAddress && locality) {
        return `${streetAddress}, ${locality}${region ? ', ' + region : ''}${postalCode ? ' ' + postalCode : ''}`.trim();
    }

    return undefined;
}

/**
 * Get contact page URLs for a given website
 */
export function getContactPageUrls(baseUrl: string): string[] {
    try {
        const url = new URL(baseUrl);
        const origin = url.origin;
        return CONTACT_PATHS.map(path => origin + path);
    } catch {
        return [];
    }
}

/**
 * Extract all contact info from HTML
 */
export function extractContactInfo(html: string, sourceUrl: string): Partial<ExtractedContact> {
    const emails = extractEmailsFromHtml(html, sourceUrl);
    const phones = extractPhonesFromHtml(html);
    const company = extractBusinessName(html, sourceUrl);
    const address = extractAddress(html);

    return {
        email: emails[0],
        company,
        phone: phones[0] ? formatPhone(phones[0]) : undefined,
        address,
        website: new URL(sourceUrl).origin,
        source: sourceUrl,
    };
}

function formatPhone(digits: string): string {
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return digits;
}
