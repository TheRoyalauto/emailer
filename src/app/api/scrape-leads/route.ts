import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use Google Gemini Flash
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

interface ScrapedContact {
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    address?: string;
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

        if (!process.env.GOOGLE_AI_API_KEY) {
            return NextResponse.json(
                { error: "Google AI API key not configured" },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemPrompt = `You are a lead generation assistant. Given a user's request, generate a list of realistic business contacts that match their criteria.

For each contact, provide:
- email (required): A realistic business email
- name: Full name of the contact person
- company: Company/business name
- phone: Phone number with area code
- location: City, State
- website: Company website URL (e.g., https://example.com)
- address: Full street address

Generate contacts that would realistically exist based on the user's query. Make emails realistic (using common business domain patterns like @gmail.com, @yahoo.com, or company domains).

IMPORTANT: Return ONLY a valid JSON array of contacts. No explanation, no markdown, just the JSON array.

Example output:
[
  {"email": "john.smith@smithsautobody.com", "name": "John Smith", "company": "Smith's Auto Body", "phone": "310-555-1234", "location": "Los Angeles, CA", "website": "https://smithsautobody.com", "address": "1234 Main St, Los Angeles, CA 90001"},
  {"email": "sarah@johnsoncollision.net", "name": "Sarah Johnson", "company": "Johnson Collision Center", "phone": "213-555-5678", "location": "Los Angeles, CA", "website": "https://johnsoncollision.net", "address": "5678 Oak Ave, Los Angeles, CA 90012"}
]`;

        // Retry logic for rate limits
        let result;
        let lastError;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                result = await model.generateContent([
                    { text: systemPrompt },
                    { text: `User request: ${prompt}` }
                ]);
                break;
            } catch (err) {
                lastError = err;
                if (err instanceof Error && err.message.includes("429")) {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
                    continue;
                }
                throw err;
            }
        }

        if (!result) {
            throw lastError || new Error("Failed after retries");
        }

        const responseText = result.response.text() || "[]";

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
                website: c.website?.trim(),
                address: c.address?.trim(),
            }));

        return NextResponse.json({
            contacts: validContacts,
            count: validContacts.length,
        });
    } catch (error) {
        console.error("Scrape leads error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Failed to generate leads: ${errorMessage}` },
            { status: 500 }
        );
    }
}
