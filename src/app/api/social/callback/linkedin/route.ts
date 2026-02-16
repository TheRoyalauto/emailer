import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";

export const dynamic = "force-dynamic";

// LinkedIn OAuth 2.0 callback — exchanges code for tokens
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
        const state = JSON.parse(
            Buffer.from(stateParam, "base64url").toString()
        );
        const { sessionToken } = state;

        const clientId = process.env.LINKEDIN_CLIENT_ID!;
        const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
        const redirectUri = `${baseUrl}/api/social/callback/linkedin`;

        // Exchange code for tokens
        const tokenRes = await fetch(
            "https://www.linkedin.com/oauth/v2/accessToken",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: redirectUri,
                    client_id: clientId,
                    client_secret: clientSecret,
                }),
            }
        );

        if (!tokenRes.ok) {
            const err = await tokenRes.text();
            console.error("[LinkedIn OAuth] Token exchange failed:", err);
            return NextResponse.redirect(
                `${baseUrl}/content-calendar?social_error=token_exchange_failed`
            );
        }

        const tokens = await tokenRes.json();

        // Get user profile
        const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const profile = profileRes.ok ? await profileRes.json() : null;

        // Store in Convex
        const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
        await convex.mutation(api.socialConnections.upsert, {
            sessionToken,
            platform: "linkedin",
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || undefined,
            expiresAt: tokens.expires_in
                ? Date.now() + tokens.expires_in * 1000
                : undefined,
            platformUserId: profile?.sub || undefined,
            platformUsername: profile?.name || profile?.email || undefined,
        });

        return NextResponse.redirect(
            `${baseUrl}/content-calendar?social_connected=linkedin&username=${encodeURIComponent(profile?.name || "")}`
        );
    } catch (err: any) {
        console.error("[LinkedIn OAuth] Callback error:", err);
        return NextResponse.redirect(
            `${baseUrl}/content-calendar?social_error=callback_failed`
        );
    }
}
