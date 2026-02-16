import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

// Platform aspect ratio mappings
const PLATFORM_ASPECTS: Record<string, string> = {
    instagram: "1:1",
    x: "16:9",
    linkedin: "16:9",
    tiktok: "9:16",
    youtube: "16:9",
};

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Google AI API key not configured" },
                { status: 500 }
            );
        }

        const { platform, concept, caption, style, brandAssets } = await req.json();

        if (!platform || !concept) {
            return NextResponse.json(
                { error: "platform and concept are required" },
                { status: 400 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        // Build a rich image prompt based on the content
        const imagePrompt = buildImagePrompt(platform, concept, caption, style, brandAssets);

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-preview-image-generation",
            contents: imagePrompt,
            config: {
                responseModalities: ["TEXT", "IMAGE"],
            },
        });

        // Extract image from response
        const parts = response.candidates?.[0]?.content?.parts || [];
        let imageBase64 = null;
        let mimeType = "image/png";

        for (const part of parts) {
            if (part.inlineData) {
                imageBase64 = part.inlineData.data;
                mimeType = part.inlineData.mimeType || "image/png";
                break;
            }
        }

        if (!imageBase64) {
            // Fallback: generate a branded text card
            const fallbackImage = generateFallbackCard(concept, platform);
            return NextResponse.json({
                image: fallbackImage,
                mimeType: "image/svg+xml",
                fallback: true,
            });
        }

        return NextResponse.json({
            image: imageBase64,
            mimeType,
            fallback: false,
        });
    } catch (err: any) {
        console.error("[generate-image] Error:", err);

        // If Gemini refuses, return fallback
        if (err.message?.includes("SAFETY") || err.message?.includes("blocked")) {
            const { concept, platform } = await req.json().catch(() => ({ concept: "Content", platform: "instagram" }));
            const fallbackImage = generateFallbackCard(concept, platform);
            return NextResponse.json({
                image: fallbackImage,
                mimeType: "image/svg+xml",
                fallback: true,
            });
        }

        return NextResponse.json(
            { error: err.message || "Image generation failed" },
            { status: 500 }
        );
    }
}

function buildImagePrompt(platform: string, concept: string, caption?: string, style?: string, brandAssets?: Array<{ name: string; category: string }>): string {
    const aspect = PLATFORM_ASPECTS[platform] || "1:1";

    const baseStyle = style || "modern, clean, premium tech brand";

    // Build brand asset context
    let brandContext = "";
    if (brandAssets?.length) {
        const assetNames = brandAssets.map(a => `${a.name} (${a.category})`).join(", ");
        brandContext = `\n\nBRAND REFERENCE ASSETS: The brand uses the following visual assets: ${assetNames}. Match the overall aesthetic, color feel, and visual language of these brand materials.`;
    }

    return `Create a professional social media graphic for ${platform}.

CONTENT: ${concept}
${caption ? `CONTEXT: ${caption.substring(0, 200)}` : ""}${brandContext}

DESIGN REQUIREMENTS:
- Aspect ratio: ${aspect}
- Style: ${baseStyle}
- Brand colors: Deep indigo (#4F46E5), purple (#7C3AED), cyan (#06B6D4), white text on dark backgrounds
- Modern tech aesthetic with gradients, clean typography feel
- No actual text in the image unless specifically relevant — focus on visual storytelling
- Professional, premium quality — think Apple/Stripe marketing material
- Include relevant visual metaphors (email icons, charts, growth arrows, etc. as appropriate)
- Clean composition with strategic use of negative space
- Subtle depth effects (shadows, glows, layering)

DO NOT include:
- Watermarks or stock photo badges  
- Generic clip art or low-quality elements
- Faces of real people
- Logos of other companies

Generate a single high-quality image.`;
}

function generateFallbackCard(concept: string, platform: string): string {
    // SVG fallback card with brand styling
    const width = platform === "tiktok" ? 540 : platform === "instagram" ? 540 : 960;
    const height = platform === "tiktok" ? 960 : platform === "instagram" ? 540 : 540;

    // Wrap text for SVG
    const words = concept.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
        if ((currentLine + " " + word).length > 30) {
            lines.push(currentLine.trim());
            currentLine = word;
        } else {
            currentLine += " " + word;
        }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    const textY = height / 2 - (lines.length * 28) / 2;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1E1B4B"/>
      <stop offset="50%" style="stop-color:#312E81"/>
      <stop offset="100%" style="stop-color:#4C1D95"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#818CF8"/>
      <stop offset="100%" style="stop-color:#06B6D4"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" rx="16"/>
  <rect x="${width * 0.1}" y="${height - 70}" width="${width * 0.8}" height="3" fill="url(#accent)" rx="2" opacity="0.6"/>
  ${lines.map((line, i) => `<text x="${width / 2}" y="${textY + i * 32}" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600">${escapeXml(line)}</text>`).join("\n  ")}
  <text x="${width / 2}" y="${height - 40}" text-anchor="middle" fill="#818CF8" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" letter-spacing="2">E-MAILER.IO</text>
</svg>`;

    return Buffer.from(svg).toString("base64");
}

function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
