import { NextRequest, NextResponse } from "next/server";

// Link click tracking endpoint
// Usage: /api/click?url=ENCODED_URL&id=CONTACT_ID&c=CAMPAIGN_ID
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const targetUrl = searchParams.get("url");
    const contactId = searchParams.get("id");
    const campaignId = searchParams.get("c");

    if (!targetUrl) {
        return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 });
    }

    // Log the click event
    console.log("Link clicked:", {
        contactId,
        campaignId,
        targetUrl,
        timestamp: new Date().toISOString(),
        ip: request.headers.get("x-forwarded-for") || request.ip,
        userAgent: request.headers.get("user-agent"),
    });

    // For real tracking, you'd call your Convex backend here
    // await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/track-click`, {
    //     method: 'POST',
    //     body: JSON.stringify({ contactId, campaignId, url: targetUrl })
    // });

    // Redirect to the actual URL
    try {
        const decodedUrl = decodeURIComponent(targetUrl);
        return NextResponse.redirect(decodedUrl, 302);
    } catch {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
}
