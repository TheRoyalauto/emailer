import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// LinkedIn OAuth 2.0 — initiates auth flow
export async function GET(req: NextRequest) {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json({ error: "LinkedIn client ID not configured" }, { status: 500 });
    }

    const searchParams = req.nextUrl.searchParams;
    const sessionToken = searchParams.get("sessionToken");
    if (!sessionToken) {
        return NextResponse.json({ error: "Missing sessionToken" }, { status: 400 });
    }

    const state = Buffer.from(JSON.stringify({ sessionToken })).toString("base64url");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/social/callback/linkedin`;

    const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "openid profile w_member_social",
        state,
    });

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

    return NextResponse.redirect(authUrl);
}
