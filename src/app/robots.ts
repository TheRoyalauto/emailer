import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/dashboard",
                    "/dashboard/*",
                    "/campaigns",
                    "/contacts",
                    "/analytics",
                    "/templates",
                    "/sequences",
                    "/settings",
                    "/settings/*",
                    "/senders",
                    "/lists",
                    "/replies",
                    "/reputation",
                    "/scraper",
                    "/pipeline",
                    "/deals",
                    "/tasks",
                    "/calls",
                    "/automations",
                    "/brand-rules",
                    "/insights",
                    "/links",
                    "/ab-tests",
                    "/accounts",
                    "/smtp-settings",
                    "/admin",
                    "/admin/*",
                    "/unsubscribes",
                    "/api/*",
                ],
            },
        ],
        sitemap: "https://e-mailer.io/sitemap.xml",
    };
}
