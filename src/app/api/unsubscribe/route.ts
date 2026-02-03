import { NextRequest, NextResponse } from "next/server";

// Public unsubscribe endpoint (called from email links)
export async function POST(request: NextRequest) {
    try {
        const { email, reason } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        // Log the unsubscribe for now
        // In production, you would:
        // 1. Call Convex HTTP action to record unsubscribe
        // 2. Update contact status
        // 3. Pause any sequences

        console.log("Unsubscribe request:", {
            email: email.toLowerCase(),
            reason,
            timestamp: new Date().toISOString(),
        });

        // For now, we'll just return success
        // The actual DB update should be handled via Convex HTTP action
        // await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/unsubscribe`, {
        //     method: 'POST',
        //     body: JSON.stringify({ email, reason })
        // });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Unsubscribe error:", error);
        return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
    }
}

// GET endpoint for preflight
export async function GET(request: NextRequest) {
    const email = request.nextUrl.searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Redirect to the unsubscribe page with email param
    return NextResponse.redirect(new URL(`/unsubscribe?email=${encodeURIComponent(email)}`, request.url));
}
