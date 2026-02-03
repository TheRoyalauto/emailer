import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
    try {
        // Initialize client inside handler to avoid build-time errors
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const { prompt, tone, includeSubject } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt required" }, { status: 400 });
        }

        const systemPrompt = `You are an expert email copywriter for sales outreach. Write compelling, professional email copy that:
- Gets opened (if writing subject lines)
- Feels personal and genuine, not salesy or spammy
- Is concise and respects the reader's time
- Has a clear call-to-action
- Uses the tone: ${tone || "professional"}

${includeSubject ? "Include both a subject line and email body." : "Only write the email body."}

Format your response as JSON:
${includeSubject ? '{"subject": "...", "body": "..."}' : '{"body": "..."}'}

Use HTML for the body with <p>, <strong>, <br> tags. Keep it simple and mobile-friendly.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = completion.choices[0]?.message?.content || "";

        try {
            // Try to parse as JSON
            const parsed = JSON.parse(content);
            return NextResponse.json({
                success: true,
                subject: parsed.subject,
                body: parsed.body,
            });
        } catch {
            // If not valid JSON, return as body
            return NextResponse.json({
                success: true,
                body: content,
            });
        }
    } catch (error: any) {
        console.error("AI copy error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate copy" },
            { status: 500 }
        );
    }
}

