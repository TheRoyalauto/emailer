import { MetadataRoute } from "next";
import { blogPosts } from "./(marketing)/blog/data";

const BASE_URL = "https://e-mailer.io";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date().toISOString();

    /* ─── Static Marketing Pages ─── */
    const marketingPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/features`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/pricing`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/faq`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/changelog`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/careers`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];

    /* ─── Resources Pages ─── */
    const resourcePages: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/how-it-works`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/compare`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/testimonials`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
    ];

    /* ─── Legal Pages ─── */
    const legalPages: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/privacy`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/cookies`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.2,
        },
        {
            url: `${BASE_URL}/gdpr`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];

    /* ─── Auth Pages ─── */
    const authPages: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/login`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/register`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.4,
        },
    ];

    /* ─── Blog Articles (dynamically generated from data) ─── */
    const blogArticles: MetadataRoute.Sitemap = blogPosts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "monthly" as const,
        priority: post.featured ? 0.8 : 0.7,
    }));

    return [
        ...marketingPages,
        ...resourcePages,
        ...legalPages,
        ...authPages,
        ...blogArticles,
    ];
}
