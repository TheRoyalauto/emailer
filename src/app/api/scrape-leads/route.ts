import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface ScrapedContact {
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    location?: string;
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

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key not configured" },
                { status: 500 }
            );
        }

        // Use GPT-4 to generate realistic business contacts based on the prompt
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a lead generation assistant. Given a user's request, generate a list of realistic business contacts that match their criteria.

For each contact, provide:
- email (required): A realistic business email
- name: Full name of the contact person
- company: Company/business name
- phone: Phone number with area code
- location: City, State

Generate contacts that would realistically exist based on the user's query. Make emails realistic (using common business domain patterns like @gmail.com, @yahoo.com, or company domains).

IMPORTANT: Return ONLY a valid JSON array of contacts. No explanation, no markdown, just the JSON array.

Example output:
[
  {"email": "john.smith@autobodyshop.com", "name": "John Smith", "company": "Smith's Auto Body", "phone": "555-123-4567", "location": "Los Angeles, CA"},
  {"email": "sarah@collisionrepair.net", "name": "Sarah Johnson", "company": "Johnson Collision Center", "phone": "555-234-5678", "location": "Los Angeles, CA"}
]`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.8,
            max_tokens: 4000,
        });

        const responseText = completion.choices[0]?.message?.content || "[]";

        // Parse the JSON response
        let contacts: ScrapedContact[] = [];
        try {
            // Try to extract JSON from the response
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                contacts = JSON.parse(jsonMatch[0]);
            }
        } catch {
            console.error("Failed to parse AI response:", responseText);
            return NextResponse.json(
                { error: "Failed to parse AI response" },
                { status: 500 }
            );
        }

        // Validate and clean contacts
        const validContacts = contacts
            .filter(c => c.email && c.email.includes("@"))
            .map(c => ({
                email: c.email.toLowerCase().trim(),
                name: c.name?.trim(),
                company: c.company?.trim(),
                phone: c.phone?.trim(),
                location: c.location?.trim(),
            }));

        return NextResponse.json({
            contacts: validContacts,
            count: validContacts.length,
        });
    } catch (error) {
        console.error("Scrape leads error:", error);
        return NextResponse.json(
            { error: "Failed to generate leads" },
            { status: 500 }
        );
    }
}
