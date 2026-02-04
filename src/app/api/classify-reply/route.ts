import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const CLASSIFICATIONS = [
    "positive",      // Interested, wants to proceed
    "not_now",       // Bad timing, follow up later
    "price_objection", // Price is a concern
    "competitor",    // Mentions competitor
    "angry",         // Upset, unsubscribe vibes
    "unsubscribe",   // Wants to stop receiving emails
    "out_of_office", // Auto-reply, vacation
    "question",      // Genuine question about product/service
    "unknown",       // Can't determine intent
] as const;

type Classification = typeof CLASSIFICATIONS[number];

interface ClassificationResult {
    classification: Classification;
    confidence: number;
    sentiment: number; // -1 to 1
    buyingSignals: {
        budget?: string;
        authority?: string;
        need?: string;
        timeline?: string;
        score: number; // 0-100
    };
    suggestedResponses: Array<{
        subject: string;
        body: string;
        tone: string;
    }>;
    summary: string;
}

export async function POST(request: NextRequest) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const { subject, body, fromEmail, originalSequenceContext } = await request.json();

        if (!body) {
            return NextResponse.json({ error: "Reply body required" }, { status: 400 });
        }

        const systemPrompt = `You are an AI sales intelligence assistant specializing in analyzing email replies from prospects. Your job is to:

1. CLASSIFY the reply into one of these categories:
   - positive: Shows interest, wants to proceed, asks for more info
   - not_now: Timing is wrong, follow up later
   - price_objection: Concerned about price, budget
   - competitor: Mentions using competitor, comparison shopping
   - angry: Upset, threatened, wants to stop all contact
   - unsubscribe: Explicitly asks to be removed
   - out_of_office: OOO auto-reply, vacation notice
   - question: Has genuine questions needing answers
   - unknown: Can't determine intent

2. EXTRACT BANT signals (Budget, Authority, Need, Timeline):
   - Budget: Any mention of budget, pricing expectations, or financial constraints
   - Authority: Indicators of decision-making power or need to consult others
   - Need: Pain points, requirements, or problems they're trying to solve
   - Timeline: Any urgency, deadlines, or time constraints mentioned
   - Score: Overall buying readiness 0-100

3. GENERATE 3 response alternatives (unless angry/unsubscribe):
   - Best: Most likely to advance the conversation
   - Empathetic: Acknowledges their concerns
   - Direct: Gets straight to the point

4. ASSESS sentiment: -1 (very negative) to 1 (very positive)

Respond in JSON format:
{
    "classification": "...",
    "confidence": 0.0-1.0,
    "sentiment": -1.0 to 1.0,
    "buyingSignals": {
        "budget": "...", 
        "authority": "...",
        "need": "...",
        "timeline": "...",
        "score": 0-100
    },
    "suggestedResponses": [
        {"subject": "...", "body": "...", "tone": "Best"},
        {"subject": "...", "body": "...", "tone": "Empathetic"},
        {"subject": "...", "body": "...", "tone": "Direct"}
    ],
    "summary": "One-line summary of the reply intent"
}

If classification is "angry" or "unsubscribe", leave suggestedResponses empty.
Use HTML for response bodies with <p>, <br> tags.`;

        const userMessage = `Analyze this email reply:

FROM: ${fromEmail}
SUBJECT: ${subject || "(no subject)"}

BODY:
${body}

${originalSequenceContext ? `CONTEXT (original email they're replying to):
${originalSequenceContext}` : ""}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
            ],
            temperature: 0.3, // Lower temp for more consistent classification
            max_tokens: 2000,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content || "{}";

        try {
            const result: ClassificationResult = JSON.parse(content);

            // Validate classification
            if (!CLASSIFICATIONS.includes(result.classification as Classification)) {
                result.classification = "unknown";
            }

            // Clamp values
            result.confidence = Math.max(0, Math.min(1, result.confidence || 0.5));
            result.sentiment = Math.max(-1, Math.min(1, result.sentiment || 0));
            if (result.buyingSignals) {
                result.buyingSignals.score = Math.max(0, Math.min(100, result.buyingSignals.score || 0));
            }

            return NextResponse.json({
                success: true,
                ...result,
            });
        } catch {
            return NextResponse.json({
                success: false,
                error: "Failed to parse AI response",
                raw: content,
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Classification error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to classify reply" },
            { status: 500 }
        );
    }
}
