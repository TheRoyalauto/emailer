import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        if (!code) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        // Get the link by code
        const link = await convex.query(api.trackedLinks.getByCode, { code });

        if (!link) {
            // Link not found or expired
            return NextResponse.redirect(new URL("/", request.url));
        }

        // Record the click
        await convex.mutation(api.trackedLinks.recordClick, { code });

        // Build destination URL with UTM parameters
        let destinationUrl = link.destinationUrl;
        const url = new URL(destinationUrl);

        if (link.utmSource) url.searchParams.set("utm_source", link.utmSource);
        if (link.utmMedium) url.searchParams.set("utm_medium", link.utmMedium);
        if (link.utmCampaign) url.searchParams.set("utm_campaign", link.utmCampaign);
        if (link.utmContent) url.searchParams.set("utm_content", link.utmContent);
        if (link.utmTerm) url.searchParams.set("utm_term", link.utmTerm);

        // Redirect to destination
        return NextResponse.redirect(url.toString());
    } catch (error) {
        console.error("Redirect error:", error);
        return NextResponse.redirect(new URL("/", request.url));
    }
}
