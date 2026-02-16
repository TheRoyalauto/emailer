import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

function getGemini() {
    const apiKey = process.env.GOOGLE_AI_API_KEY || "";
    return new GoogleGenerativeAI(apiKey);
}

interface BrandVoice {
    tone: string;
    bannedWords?: string[];
    defaultCta?: string;
    defaultHashtags?: string[];
    brandDescription?: string;
}

interface LockedItem {
    date: string;
    concept?: string;
    caption?: string;
    hashtags?: string;
    cta?: string;
}

export async function POST(req: NextRequest) {
    try {
        if (!process.env.GOOGLE_AI_API_KEY) {
            return NextResponse.json(
                { error: "Google AI API key not configured. Add GOOGLE_AI_API_KEY to .env.local" },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { action, brandVoice, lockedItems, selectedItems, userPrompt, days = 30, platforms, topic } = body;

        if (action === "generate") {
            return await generateContent(days, brandVoice, lockedItems, platforms, topic);
        } else if (action === "regenerate") {
            return await regenerateItems(selectedItems, brandVoice);
        } else if (action === "revise") {
            return await reviseWithPrompt(selectedItems, userPrompt, brandVoice);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err: any) {
        console.error("[generate-content] Error:", err);
        return NextResponse.json({ error: err.message || "Generation failed" }, { status: 500 });
    }
}

// ─── Gemini helper ──────────────────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string> {
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 16000,
            responseMimeType: "application/json",
        },
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
}

// ─── Generation ─────────────────────────────────────────────────────────────────

async function generateContent(days: number, brandVoice?: BrandVoice, lockedItems?: LockedItem[], platforms?: string[], topic?: string) {
    const startDate = new Date();
    const dates = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split("T")[0]);
    }

    const voiceContext = buildVoiceContext(brandVoice);
    const lockedContext = lockedItems?.length ? buildLockedContext(lockedItems) : "";
    const platformFilter = platforms?.length ? `\nTARGET PLATFORMS (only use these): ${platforms.join(", ")}` : "";
    const topicContext = topic ? `\nFOCUS TOPIC: ${topic} — weave this theme throughout the content while maintaining variety.` : "";

    const prompt = `You are a senior social media strategist for E-mailer.io, an AI-powered email campaign and sales operations platform. Generate ${days} days of high-end social media content.

${voiceContext}${platformFilter}${topicContext}

PRODUCT CONTEXT:
E-mailer.io helps businesses find leads, send cold email campaigns, manage contacts, track engagement, automate follow-ups, and close deals. Key features: AI copywriter, email sequences, lead scraper, deal pipeline, email warmup, domain reputation monitoring, and smart automations.

TARGET AUDIENCE:
- SaaS founders, sales teams, and marketing agencies
- People doing cold outreach, B2B sales, and lead generation
- Small to mid-size businesses wanting to scale outreach

CONTENT MIX (vary across the ${days} days):
- Product demos & walkthroughs (show the platform in action)
- Before/after transformations (cold email results)
- Founder POV & behind-the-scenes
- Customer outcome stories (realistic, not generic)
- Tips & tactics (cold email, deliverability, CRM)
- Objection handling (cost, spam, alternatives)
- Feature highlights (specific features with clear value)
- Industry trends & hot takes
- Engagement posts (polls, questions, debates)

${lockedContext}

DATES: ${dates.join(", ")}

Respond with a JSON array of exactly ${days} objects, one per day. Each object must have:
{
  "date": "YYYY-MM-DD",
  "platforms": ["instagram", "x", "linkedin", "tiktok", "youtube"] (pick 1-3 most relevant),
  "type": "reel" | "carousel" | "short" | "tweet_thread" | "story" | "static_post" | "video" | "poll",
  "concept": "Clear, specific creative concept title (1 line)",
  "caption": "Full caption with hook, body, and CTA. Use line breaks. Must be compelling and not generic.",
  "hashtags": "5-8 relevant hashtags as a single string",
  "cta": "Clear call-to-action (1 line)",
  "assetNotes": "What visuals/recordings/b-roll to create"
}

RULES:
- Every hook must stop the scroll — be specific, provocative, or surprising
- No fluff. No "In today's digital landscape..." openings
- Every caption must have a clear pain point, insight, or result
- CTAs must drive to trial signup, demo, or website
- Vary platforms intelligently (LinkedIn for B2B thought leadership, TikTok/Reels for quick tips, X for hot takes)
- Make the content feel like it's from a category-defining company, not a startup
- Asset notes should be specific and actionable

Return ONLY the JSON array, no markdown, no explanation.`;

    const content = await callGemini(prompt);
    const items = parseJsonResponse(content);

    return NextResponse.json({ items });
}

async function regenerateItems(items: any[], brandVoice?: BrandVoice) {
    const voiceContext = buildVoiceContext(brandVoice);

    const prompt = `You are a senior social media strategist for E-mailer.io. Regenerate these ${items.length} social media posts with fresh, different concepts. Keep any locked fields unchanged.

${voiceContext}

ITEMS TO REGENERATE:
${JSON.stringify(items, null, 2)}

For each item, generate a completely new concept, caption, hashtags, CTA, and asset notes — UNLESS a field is marked as locked (in the "lockedFields" array), in which case keep that field exactly as-is.

Return ONLY a JSON array of the regenerated items with the same structure. No markdown.`;

    const content = await callGemini(prompt);
    const regenerated = parseJsonResponse(content);

    return NextResponse.json({ items: regenerated });
}

async function reviseWithPrompt(items: any[], userPrompt: string, brandVoice?: BrandVoice) {
    const voiceContext = buildVoiceContext(brandVoice);

    const prompt = `You are a senior social media strategist for E-mailer.io. Revise these social media posts based on the user's guidance.

${voiceContext}

USER'S REVISION GUIDANCE:
"${userPrompt}"

ITEMS TO REVISE:
${JSON.stringify(items, null, 2)}

Apply the user's guidance to revise each item. Keep any locked fields unchanged. Make the revisions meaningful — don't just add a word here or there.

Return ONLY a JSON array of the revised items with the same structure. No markdown.`;

    const content = await callGemini(prompt);
    const revised = parseJsonResponse(content);

    return NextResponse.json({ items: revised });
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function buildVoiceContext(brandVoice?: BrandVoice): string {
    if (!brandVoice) return "TONE: Professional and direct. High-end brand voice.";

    let ctx = `TONE: ${brandVoice.tone}`;
    if (brandVoice.brandDescription) ctx += `\nBRAND: ${brandVoice.brandDescription}`;
    if (brandVoice.bannedWords?.length) ctx += `\nNEVER USE THESE WORDS: ${brandVoice.bannedWords.join(", ")}`;
    if (brandVoice.defaultCta) ctx += `\nDEFAULT CTA: ${brandVoice.defaultCta}`;
    if (brandVoice.defaultHashtags?.length) ctx += `\nALWAYS INCLUDE HASHTAGS: ${brandVoice.defaultHashtags.join(" ")}`;
    return ctx;
}

function buildLockedContext(lockedItems: LockedItem[]): string {
    const locked = lockedItems.filter(i =>
        i.concept || i.caption || i.hashtags || i.cta
    );
    if (!locked.length) return "";
    return `LOCKED CONTENT (keep these exactly as-is for the specified dates):\n${JSON.stringify(locked, null, 2)}`;
}

function parseJsonResponse(content: string): any[] {
    try {
        return JSON.parse(content);
    } catch {
        // Try extracting JSON from markdown code blocks
        const match = content.match(/\[[\s\S]*\]/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch {
                return [];
            }
        }
        return [];
    }
}
