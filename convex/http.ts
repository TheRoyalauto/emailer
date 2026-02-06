import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

// Add auth routes (required for authentication to work)
auth.addHttpRoutes(http);

// Email open tracking webhook
http.route({
    path: "/track-open",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.json();
        const { contactId, campaignId } = body;

        if (contactId) {
            // Log email opened activity
            await ctx.runMutation(api.activities.logEmailEvent, {
                contactId,
                campaignId,
                eventType: "email_opened",
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }),
});

// Link click tracking webhook
http.route({
    path: "/track-click",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.json();
        const { contactId, campaignId, url } = body;

        if (contactId) {
            // Log email clicked activity
            await ctx.runMutation(api.activities.logEmailEvent, {
                contactId,
                campaignId,
                eventType: "email_clicked",
                url,
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }),
});

// Get email stats for a campaign
http.route({
    path: "/campaign-stats",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const campaignId = url.searchParams.get("id");

        if (!campaignId) {
            return new Response(JSON.stringify({ error: "Campaign ID required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Get stats from database
        const stats = await ctx.runQuery(api.analytics.getCampaignStats, {
            campaignId,
        });

        return new Response(JSON.stringify(stats), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }),
});

export default http;
