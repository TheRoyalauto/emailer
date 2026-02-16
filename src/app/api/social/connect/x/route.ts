import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// X OAuth 2.0 with PKCE — initiates auth flow
export async function GET(req: NextRequest) {
    const clientId = process.env.TWITTER_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json({ error: "Twitter client ID not configured" }, { status: 500 });
    }

    const searchParams = req.nextUrl.searchParams;
    const sessionToken = searchParams.get("sessionToken");
    if (!sessionToken) {
        return NextResponse.json({ error: "Missing sessionToken" }, { status: 400 });
    }

    // Generate PKCE code verifier + challenge
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto
        .createHash("sha256")
        .update(codeVerifier)
        .digest("base64url");

    // Generate state with session token embedded
    const state = Buffer.from(
        JSON.stringify({ sessionToken, codeVerifier })
    ).toString("base64url");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/social/callback/x`;

    const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "tweet.read tweet.write users.read offline.access",
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
    });

    const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

    return NextResponse.redirect(authUrl);
}
