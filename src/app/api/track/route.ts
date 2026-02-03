import { NextRequest, NextResponse } from "next/server";

// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
);

// This endpoint serves a tracking pixel and can be used to track email opens
// Usage: <img src="/api/track?id=CONTACT_ID&c=CAMPAIGN_ID" width="1" height="1" />
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const contactId = searchParams.get("id");
    const campaignId = searchParams.get("c");

    // Log the open event
    // In production, you would:
    // 1. Call a Convex HTTP action to log this event
    // 2. Store the IP, user agent, timestamp, etc.
    // 3. Update the email's opened status

    console.log("Email opened:", {
        contactId,
        campaignId,
        timestamp: new Date().toISOString(),
        ip: request.headers.get("x-forwarded-for") || request.ip,
        userAgent: request.headers.get("user-agent"),
    });

    // For real tracking, you'd call your Convex backend here
    // await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/track-open`, {
    //     method: 'POST',
    //     body: JSON.stringify({ contactId, campaignId })
    // });

    // Return transparent 1x1 GIF
    return new NextResponse(TRACKING_PIXEL, {
        headers: {
            "Content-Type": "image/gif",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    });
}
