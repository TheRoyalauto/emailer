import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";

export const dynamic = "force-dynamic";

// X OAuth 2.0 callback — exchanges code for tokens
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const error = searchParams.get("error");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (error) {
        return NextResponse.redirect(
            `${baseUrl}/content-calendar?social_error=${encodeURIComponent(error)}`
        );
    }

    if (!code || !stateParam) {
        return NextResponse.redirect(
            `${baseUrl}/content-calendar?social_error=missing_params`
        );
    }

    try {
        // Decode state
        const state = JSON.parse(
            Buffer.from(stateParam, "base64url").toString()
        );
        const { sessionToken, codeVerifier } = state;

        const clientId = process.env.TWITTER_CLIENT_ID!;
        const clientSecret = process.env.TWITTER_CLIENT_SECRET!;
        const redirectUri = `${baseUrl}/api/social/callback/x`;

        // Exchange code for tokens
        const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            },
            body: new URLSearchParams({
                code,
                grant_type: "authorization_code",
                redirect_uri: redirectUri,
                code_verifier: codeVerifier,
            }),
        });

        if (!tokenRes.ok) {
            const err = await tokenRes.text();
            console.error("[X OAuth] Token exchange failed:", err);
            return NextResponse.redirect(
                `${baseUrl}/content-calendar?social_error=token_exchange_failed`
            );
        }

        const tokens = await tokenRes.json();

        // Get user info
        const userRes = await fetch("https://api.twitter.com/2/users/me", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const userData = userRes.ok ? await userRes.json() : null;

        // Store in Convex
        const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
        await convex.mutation(api.socialConnections.upsert, {
            sessionToken,
            platform: "x",
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || undefined,
            expiresAt: tokens.expires_in
                ? Date.now() + tokens.expires_in * 1000
                : undefined,
            platformUserId: userData?.data?.id || undefined,
            platformUsername: userData?.data?.username || undefined,
        });

        return NextResponse.redirect(
            `${baseUrl}/content-calendar?social_connected=x&username=${encodeURIComponent(userData?.data?.username || "")}`
        );
    } catch (err: any) {
        console.error("[X OAuth] Callback error:", err);
        return NextResponse.redirect(
            `${baseUrl}/content-calendar?social_error=callback_failed`
        );
    }
}
