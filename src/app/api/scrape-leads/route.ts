import { NextRequest, NextResponse } from "next/server";
import { scrapeLeads } from "@/lib/scraper";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ScrapedContact {
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    address?: string;
    leadScore?: number;
    verified?: boolean;
}

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        console.log('[API] Lead scraping request:', prompt);

        // Try real scraping first if Google Search API is configured
        if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
            try {
                const result = await scrapeLeads(prompt, 25);

                if (result.leads.length > 0) {
                    console.log(`[API] Real scraper found ${result.leads.length} leads`);

                    const contacts: ScrapedContact[] = result.leads.map(lead => ({
                        email: lead.email,
                        name: lead.name || undefined,
                        company: lead.company || undefined,
                        phone: lead.phone || undefined,
                        location: lead.location || undefined,
                        website: lead.website || undefined,
                        address: lead.address || undefined,
                        leadScore: lead.leadScore,
                        verified: lead.verified,
                    }));

                    return NextResponse.json({
                        contacts,
                        count: contacts.length,
                        source: 'real_scraper',
                        totalScraped: result.totalScraped,
                    });
                }
                console.log('[API] Real scraper found no leads, falling back to AI');
            } catch (scrapeError) {
                console.error('[API] Real scraper error:', scrapeError);
            }
        }

        // AI fallback - clearly marked as AI-generated
        if (!process.env.GOOGLE_AI_API_KEY) {
            return NextResponse.json({
                contacts: [],
                count: 0,
                source: 'error',
                message: 'No API configured. Set up Google Custom Search API for real leads, or GOOGLE_AI_API_KEY for AI-generated leads.',
            });
        }

        console.log('[API] Using AI generation (data is simulated, not real)');

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemPrompt = `Generate realistic business contacts for: "${prompt}"

Return ONLY a JSON array. Each contact must have:
- email (required): realistic business email
- name: contact person name (or null if unknown)
- company: business name
- phone: phone with area code
- location: city, state
- website: company URL
- address: street address
- leadScore: 1-100 quality score

IMPORTANT: These are SIMULATED leads for demonstration. Return valid JSON array only.`;

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text() || "[]";

        let contacts: ScrapedContact[] = [];
        try {
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                contacts = JSON.parse(jsonMatch[0]);
            }
        } catch {
            return NextResponse.json({
                contacts: [],
                count: 0,
                source: 'error',
                message: 'Failed to parse AI response',
            });
        }

        const validContacts = contacts
            .filter(c => c.email && c.email.includes("@"))
            .map(c => ({
                ...c,
                email: c.email.toLowerCase().trim(),
                leadScore: c.leadScore || 50,
                verified: false, // AI-generated are NOT verified
            }));

        return NextResponse.json({
            contacts: validContacts,
            count: validContacts.length,
            source: 'ai_generated', // CLEARLY MARKED
        });
    } catch (error) {
        console.error("Scrape leads error:", error);
        return NextResponse.json(
            { contacts: [], count: 0, source: 'error', error: String(error) },
            { status: 500 }
        );
    }
}
