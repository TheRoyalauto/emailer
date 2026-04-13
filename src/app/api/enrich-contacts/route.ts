import { NextRequest, NextResponse } from "next/server";
import { crawlPage } from "@/lib/scraper/crawler";
import { extractPhonesFromHtml, extractBusinessName, extractAddress } from "@/lib/scraper/email-extractor";

const FREE_EMAIL_DOMAINS = new Set([
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "aol.com", "icloud.com", "protonmail.com", "mail.com",
    "live.com", "msn.com", "me.com", "mac.com",
    "ymail.com", "googlemail.com", "proton.me", "hey.com",
]);

type EnrichData = {
    company?: string;
    phone?: string;
    website?: string;
    address?: string;
    location?: string;
};

function extractDomain(email: string): string | null {
    const parts = email.split("@");
    if (parts.length !== 2) return null;
    return parts[1].toLowerCase().trim();
}

function formatPhone(digits: string): string {
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return digits;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as { emails: string[]; fields: string[] };
        const { emails, fields } = body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: "emails array required" }, { status: 400 });
        }
        if (!fields || !Array.isArray(fields) || fields.length === 0) {
            return NextResponse.json({ results: emails.map(email => ({ email, data: {} })) });
        }

        // Group emails by domain so each domain is only crawled once
        const domainToEmails = new Map<string, string[]>();
        for (const email of emails) {
            const domain = extractDomain(email);
            if (!domain || FREE_EMAIL_DOMAINS.has(domain)) continue;
            const list = domainToEmails.get(domain) ?? [];
            list.push(email);
            domainToEmails.set(domain, list);
        }

        // Crawl each unique domain in parallel
        const domainResults = new Map<string, EnrichData>();

        await Promise.allSettled(
            Array.from(domainToEmails.keys()).map(async (domain) => {
                try {
                    const url = `https://${domain}`;
                    const result = await crawlPage(url, 8000);
                    if (!result.success || !result.html) return;

                    const data: EnrichData = {};

                    if (fields.includes("company")) {
                        const name = extractBusinessName(result.html, url);
                        if (name) data.company = name;
                    }

                    if (fields.includes("phone")) {
                        const phones = extractPhonesFromHtml(result.html);
                        if (phones.length > 0) data.phone = formatPhone(phones[0]);
                    }

                    if (fields.includes("website")) {
                        data.website = url;
                    }

                    if (fields.includes("address") || fields.includes("location")) {
                        let address = extractAddress(result.html);
                        // Try /contact page if no address on homepage
                        if (!address) {
                            const contactResult = await crawlPage(`${url}/contact`, 5000);
                            if (contactResult.success && contactResult.html) {
                                address = extractAddress(contactResult.html);
                            }
                        }
                        if (address) {
                            if (fields.includes("address")) data.address = address;
                            if (fields.includes("location")) {
                                const cityState = address.match(/([A-Za-z\s]+),\s*([A-Z]{2})/);
                                data.location = cityState
                                    ? `${cityState[1].trim()}, ${cityState[2]}`
                                    : address.slice(0, 60);
                            }
                        }
                    }

                    domainResults.set(domain, data);
                } catch {
                    // Skip domains that fail silently
                }
            })
        );

        // Map enriched data back to each email
        const results = emails.map(email => {
            const domain = extractDomain(email);
            const data: EnrichData = domain ? (domainResults.get(domain) ?? {}) : {};
            return { email, data };
        });

        return NextResponse.json({ results });
    } catch {
        return NextResponse.json({ error: "Enrichment failed" }, { status: 500 });
    }
}
