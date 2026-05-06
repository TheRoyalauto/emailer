/**
 * Lead-scraper API route. Streams progress as Server-Sent Events.
 *
 * Wire format: each event is a single line `data: <JSON>\n\n` per the SSE
 * spec. Frontend `handleSearch` reads the response body as a stream and
 * dispatches events to React state — driving the live console feed and the
 * real-time leads-found counter in <LeadSearchAnimation />.
 *
 * Falls back to a single `complete` or `error` event for legacy clients
 * that don't read the stream — they get the final result the same as before
 * because the stream is well-formed JSON-per-line and the last event is
 * always either `complete` or `error`.
 */

import { NextRequest } from "next/server";
import { scrapeLeads, ScrapeEvent } from "@/lib/scraper";
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

interface StructuredRequest {
    industry?: string;
    locations?: string[];
    count?: number;
    fields?: string[];
    verifyEmails?: boolean;
    prompt?: string;
    excludeDomains?: string[];
    excludeEmails?: string[];
}

type StreamEvent =
    | ScrapeEvent
    | { type: "result"; contacts: ScrapedContact[]; source: string; totalScraped?: number; message?: string }
    | { type: "fatal"; error: string };

export async function POST(request: NextRequest) {
    const body: StructuredRequest = await request.json();
    const { industry, locations, count, fields, verifyEmails, prompt, excludeDomains, excludeEmails } = body;

    const cleanLocations = (locations ?? []).map(l => l.trim()).filter(Boolean);

    // Validation errors are returned non-streamed (one-shot JSON) so simple
    // clients fail fast without parsing the stream.
    if (!industry && !prompt) {
        return jsonError("Provide either an industry+locations or a free-text prompt", 400);
    }
    if (industry && cleanLocations.length === 0 && !prompt) {
        return jsonError("At least one location (ZIP or city) is required when using structured search", 400);
    }

    const wantsEmail = !fields || fields.includes("email");
    const maxResults = Math.min(Math.max(count ?? 25, 1), 100);

    console.log("[API] Lead scraping request:", {
        industry, locations: cleanLocations, count: maxResults, fields,
        verifyEmails: verifyEmails ?? true, prompt,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const send = (event: StreamEvent) => {
                try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                } catch { /* stream closed */ }
            };

            try {
                let scrapeFailureReason: string | undefined;

                if (process.env.SCRAPER_URL || (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID)) {
                    try {
                        const result = await scrapeLeads({
                            industry,
                            locations: cleanLocations.length > 0 ? cleanLocations : undefined,
                            prompt,
                            maxResults,
                            skipEmailExtraction: !wantsEmail,
                            verifyEmails: verifyEmails ?? true,
                            excludeDomains: excludeDomains?.filter(Boolean),
                            excludeEmails: excludeEmails?.filter(Boolean),
                            onEvent: send, // pipe scrape events directly into the SSE stream
                        });

                        if (result.leads.length > 0) {
                            console.log(`[API] Real scraper found ${result.leads.length} leads (source=${result.source})`);
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
                            send({
                                type: "result",
                                contacts,
                                source: "real_scraper",
                                totalScraped: result.totalScraped,
                            });
                            controller.close();
                            return;
                        }

                        if (result.errors.length > 0) {
                            scrapeFailureReason = result.errors.join(" / ");
                        } else if (result.totalScraped === 0) {
                            scrapeFailureReason = "Scraper returned no businesses. The Railway scraper may be cold-started or rate-limited — try again in 30 seconds, or check Railway dashboard.";
                        } else {
                            scrapeFailureReason = `Scraper found ${result.totalScraped} businesses but none had extractable contact info matching your criteria.`;
                        }
                        console.log("[API] Real scraper found no leads, falling back to AI. Reason:", scrapeFailureReason);
                    } catch (scrapeError) {
                        scrapeFailureReason = scrapeError instanceof Error ? scrapeError.message : String(scrapeError);
                        console.error("[API] Real scraper error:", scrapeError);
                    }
                }

                // AI fallback — emit one final `result` event with the AI list,
                // clearly tagged as ai_generated so the UI surfaces the warning.
                if (!process.env.GOOGLE_AI_API_KEY) {
                    send({
                        type: "result",
                        contacts: [],
                        source: "error",
                        message: scrapeFailureReason || "No lead-generation source available. Set up SCRAPER_URL or GOOGLE_AI_API_KEY.",
                    });
                    controller.close();
                    return;
                }

                send({ type: "log", level: "system", text: "Falling back to AI generation (simulated data)", elapsedMs: 0 });

                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                const aiQuery = prompt
                    || `${maxResults} ${industry || "businesses"}${cleanLocations.length ? ` in ${cleanLocations.join(", ")}` : ""}`;

                const systemPrompt = `Generate realistic business contacts for: "${aiQuery}"

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

                const aiResult = await model.generateContent(systemPrompt);
                const responseText = aiResult.response.text() || "[]";

                let contacts: ScrapedContact[] = [];
                try {
                    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
                    if (jsonMatch) contacts = JSON.parse(jsonMatch[0]);
                } catch {
                    send({ type: "result", contacts: [], source: "error", message: "Failed to parse AI response" });
                    controller.close();
                    return;
                }

                const validContacts = contacts
                    .filter(c => c.email && c.email.includes("@"))
                    .map(c => ({
                        ...c,
                        email: c.email.toLowerCase().trim(),
                        leadScore: c.leadScore || 50,
                        verified: false,
                    }));

                send({ type: "result", contacts: validContacts, source: "ai_generated" });
                controller.close();
            } catch (error) {
                console.error("Scrape leads error:", error);
                send({ type: "fatal", error: String(error) });
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}

function jsonError(message: string, status: number) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
