import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";

export const dynamic = "force-dynamic";

interface PostRequest {
    sessionToken: string;
    platform: "x" | "linkedin";
    text: string;
    hashtags?: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: PostRequest = await req.json();
        const { sessionToken, platform, text, hashtags } = body;

        if (!sessionToken || !platform || !text) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get stored tokens from Convex
        const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
        const connection = await convex.query(api.socialConnections.getTokens, {
            sessionToken,
            platform,
        });

        if (!connection || !connection.accessToken) {
            return NextResponse.json(
                { error: `Not connected to ${platform}. Please connect first.` },
                { status: 401 }
            );
        }

        // Build full post text
        const fullText = hashtags ? `${text}\n\n${hashtags}` : text;

        if (platform === "x") {
            return await postToX(connection.accessToken, fullText);
        } else if (platform === "linkedin") {
            return await postToLinkedIn(
                connection.accessToken,
                connection.platformUserId!,
                fullText
            );
        }

        return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    } catch (err: any) {
        console.error("[Social Post] Error:", err);
        return NextResponse.json(
            { error: err.message || "Posting failed" },
            { status: 500 }
        );
    }
}

// ─── X (Twitter) Posting ────────────────────────────────────────────────────────

async function postToX(accessToken: string, text: string) {
    // Twitter has a 280 char limit — truncate if needed
    const tweetText = text.length > 280 ? text.substring(0, 277) + "..." : text;

    const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: tweetText }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("[X Post] Failed:", err);

        // Handle token expiry
        if (res.status === 401) {
            return NextResponse.json(
                {
                    error: "X access token expired. Please reconnect your account.",
                    needsReconnect: true,
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                error:
                    err.detail ||
                    err.title ||
                    "Failed to post to X",
            },
            { status: res.status }
        );
    }

    const data = await res.json();
    const tweetId = data.data?.id;
    const tweetUrl = tweetId
        ? `https://twitter.com/i/web/status/${tweetId}`
        : null;

    return NextResponse.json({
        success: true,
        platform: "x",
        postId: tweetId,
        postUrl: tweetUrl,
    });
}

// ─── LinkedIn Posting ───────────────────────────────────────────────────────────

async function postToLinkedIn(
    accessToken: string,
    personId: string,
    text: string
) {
    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
            author: `urn:li:person:${personId}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: { text },
                    shareMediaCategory: "NONE",
                },
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
            },
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("[LinkedIn Post] Failed:", err);

        if (res.status === 401) {
            return NextResponse.json(
                {
                    error: "LinkedIn access token expired. Please reconnect your account.",
                    needsReconnect: true,
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                error:
                    err.message ||
                    "Failed to post to LinkedIn",
            },
            { status: res.status }
        );
    }

    const postId = res.headers.get("x-restli-id") || "";

    return NextResponse.json({
        success: true,
        platform: "linkedin",
        postId,
        postUrl: postId
            ? `https://www.linkedin.com/feed/update/${postId}`
            : null,
    });
}
