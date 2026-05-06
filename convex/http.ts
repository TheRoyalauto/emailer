import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

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

// Ingest leads from n8n / Scrapling
// POST /ingest-leads
// Headers: x-webhook-secret: <WEBHOOK_SECRET env var>
// Body: { leads: [{ email, name, company, phone, address, location, website }] }
http.route({
    path: "/ingest-leads",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const secret = request.headers.get("x-webhook-secret");
        const expectedSecret = process.env.WEBHOOK_SECRET;

        if (!expectedSecret || secret !== expectedSecret) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        let body: { leads?: unknown[] };
        try {
            body = await request.json();
        } catch {
            return new Response(JSON.stringify({ error: "Invalid JSON" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (!Array.isArray(body.leads)) {
            return new Response(JSON.stringify({ error: "leads array required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
        if (body.leads.length === 0) {
            // Empty arrays are valid: a cron run that found nothing should not error.
            return new Response(JSON.stringify({ success: true, created: 0, skipped: 0 }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Look up the admin user by email
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            return new Response(JSON.stringify({ error: "ADMIN_EMAIL env var not set" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const user = await ctx.runQuery(api.customAuth.getUserByEmail, { email: adminEmail });
        if (!user) {
            return new Response(JSON.stringify({ error: "Admin user not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        const result = await ctx.runMutation(internal.contacts.ingestLeads, {
            userId: user._id,
            leads: body.leads as any[],
        });

        return new Response(JSON.stringify({ success: true, ...result }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }),
});

export default http;
