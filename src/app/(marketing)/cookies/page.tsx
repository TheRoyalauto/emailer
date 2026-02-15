import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cookie Policy — E-mailer",
    description:
        "Learn about the cookies E-mailer uses, why we use them, and how to manage your cookie preferences. Covers essential, analytics, and marketing cookies.",
    alternates: { canonical: "https://e-mailer.io/cookies" },
    openGraph: {
        title: "Cookie Policy — E-mailer",
        description: "How E-mailer uses cookies and how to manage your preferences.",
        url: "https://e-mailer.io/cookies",
        type: "website",
    },
};

const cookieCategories = [
    {
        category: "Essential Cookies",
        required: true,
        description: "These cookies are required for the Service to function. They cannot be disabled.",
        cookies: [
            { name: "__session", purpose: "Maintains your login session", duration: "Session", provider: "E-mailer" },
            { name: "__csrf", purpose: "Prevents cross-site request forgery attacks", duration: "Session", provider: "E-mailer" },
            { name: "cookie_consent", purpose: "Stores your cookie consent preferences", duration: "1 year", provider: "E-mailer" },
            { name: "__cf_bm", purpose: "Cloudflare bot detection and DDoS protection", duration: "30 min", provider: "Cloudflare" },
        ],
    },
    {
        category: "Analytics Cookies",
        required: false,
        description: "These cookies help us understand how you use E-mailer so we can improve the product. They collect anonymized usage data.",
        cookies: [
            { name: "ph_*", purpose: "Product analytics and usage tracking", duration: "1 year", provider: "PostHog" },
            { name: "_ga", purpose: "Distinguishes unique visitors", duration: "2 years", provider: "Google Analytics" },
            { name: "_gid", purpose: "Distinguishes unique visitors (24h)", duration: "24 hours", provider: "Google Analytics" },
        ],
    },
    {
        category: "Marketing Cookies",
        required: false,
        description: "These cookies help us measure the effectiveness of our advertising campaigns. They are only set if you opt in.",
        cookies: [
            { name: "_fbp", purpose: "Facebook ad attribution and conversion tracking", duration: "3 months", provider: "Meta" },
            { name: "_gcl_au", purpose: "Google Ads conversion linking", duration: "3 months", provider: "Google" },
            { name: "li_fat_id", purpose: "LinkedIn ad attribution", duration: "30 days", provider: "LinkedIn" },
        ],
    },
];

export default function CookiePolicyPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-[#FAFBFC]">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-4">Legal</p>
                    <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 tracking-[-0.03em] mb-4">
                        Cookie Policy
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Last updated: February 1, 2026</span>
                        <span>·</span>
                        <span>Effective: February 1, 2026</span>
                    </div>
                </div>
            </section>

            {/* Intro */}
            <section className="py-12 bg-white border-b border-slate-100">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <div className="space-y-4 text-sm text-slate-500 leading-relaxed">
                        <p>
                            E-mailer uses cookies and similar tracking technologies (web beacons, pixels, local storage) on our website and platform.
                            This policy explains what cookies we use, why we use them, and how you can control them.
                        </p>
                        <p>
                            <strong className="text-slate-700">What are cookies?</strong> Cookies are small text files stored on your device when you visit a website.
                            They help the website remember your preferences, keep you logged in, and understand how you interact with the site.
                        </p>
                    </div>
                </div>
            </section>

            {/* Cookie Tables */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="space-y-16">
                        {cookieCategories.map((cat) => (
                            <div key={cat.category}>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="font-heading text-xl font-semibold text-slate-900 tracking-[-0.02em]">
                                        {cat.category}
                                    </h2>
                                    {cat.required ? (
                                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-500">
                                            Required
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-cyan-50 text-cyan-600">
                                            Optional
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                    {cat.description}
                                </p>

                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    {/* Header */}
                                    <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                                        <span>Cookie</span>
                                        <span className="col-span-2">Purpose</span>
                                        <span className="hidden sm:flex items-center justify-between">
                                            <span>Duration</span>
                                        </span>
                                    </div>
                                    {/* Rows */}
                                    {cat.cookies.map((cookie, i) => (
                                        <div
                                            key={cookie.name}
                                            className={`grid grid-cols-4 gap-4 px-5 py-4 ${i < cat.cookies.length - 1 ? "border-b border-slate-100" : ""
                                                }`}
                                        >
                                            <div>
                                                <code className="text-xs font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {cookie.name}
                                                </code>
                                                <div className="text-xs text-slate-400 mt-1">{cookie.provider}</div>
                                            </div>
                                            <div className="col-span-2 text-sm text-slate-500">
                                                {cookie.purpose}
                                            </div>
                                            <div className="hidden sm:block text-sm text-slate-400">
                                                {cookie.duration}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Managing Cookies */}
            <section className="py-16 bg-[#FAFBFC] border-y border-slate-100">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <h2 className="font-heading text-xl font-semibold text-slate-900 tracking-[-0.02em] mb-6">
                        Managing Your Cookie Preferences
                    </h2>
                    <div className="space-y-5 text-sm text-slate-500 leading-relaxed">
                        <p>
                            <strong className="text-slate-700">Via browser settings:</strong> Most browsers allow you to block or delete cookies
                            through their privacy settings. Note that blocking essential cookies will prevent you from using E-mailer.
                        </p>
                        <p>
                            <strong className="text-slate-700">Via our cookie banner:</strong> When you first visit E-mailer, we display
                            a cookie consent banner that lets you accept or decline optional cookies. You can change your preferences
                            at any time by clicking the cookie icon in the bottom-left corner of any page.
                        </p>
                        <p>
                            <strong className="text-slate-700">Do Not Track:</strong> We respect the Do Not Track (DNT) browser signal.
                            When DNT is enabled, we will not load analytics or marketing cookies.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="py-16 bg-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <div className="p-7 bg-slate-50 rounded-xl border border-slate-200">
                        <h3 className="font-heading text-lg font-semibold text-slate-900 tracking-[-0.02em] mb-2">
                            Questions about cookies?
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Contact our Data Protection Officer at{" "}
                            <a href="mailto:privacy@e-mailer.io" className="text-cyan-600 hover:text-cyan-700 font-medium">
                                privacy@e-mailer.io
                            </a>
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <Link href="/privacy" className="text-cyan-600 hover:text-cyan-700 font-medium">Privacy Policy →</Link>
                            <Link href="/terms" className="text-cyan-600 hover:text-cyan-700 font-medium">Terms of Service →</Link>
                            <Link href="/gdpr" className="text-cyan-600 hover:text-cyan-700 font-medium">GDPR →</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
