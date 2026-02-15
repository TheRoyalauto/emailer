"use client";

import Link from "next/link";
import { useState } from "react";

const plans = [
    {
        name: "Free",
        description: "Get started with email outreach — no credit card required.",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            "30 emails/day",
            "900 emails/month",
            "1 email account",
            "Basic AI writing assistant",
            "Email tracking & analytics",
            "Contact management",
            "10 scrape credits/month",
            "Community support",
        ],
        cta: "Get Started Free",
        featured: false,
        tier: "free" as const,
    },
    {
        name: "Starter",
        description: "For individuals scaling their outreach.",
        monthlyPrice: 29,
        yearlyPrice: 24,
        features: [
            "100 emails/day",
            "3,000 emails/month",
            "3 email accounts",
            "Advanced AI writing & tone",
            "Smart sequences & follow-ups",
            "Email tracking & analytics",
            "A/B testing",
            "50 scrape credits/month",
            "Standard support",
        ],
        cta: "Start Free Trial",
        featured: false,
        tier: "starter" as const,
    },
    {
        name: "Professional",
        description: "For teams scaling their outreach operations.",
        monthlyPrice: 79,
        yearlyPrice: 66,
        features: [
            "350 emails/day",
            "10,000 emails/month",
            "10 email accounts",
            "Advanced AI writing & personalization",
            "Smart sequences & automation",
            "Advanced analytics & reports",
            "A/B testing & optimization",
            "CRM integration",
            "200 scrape credits/month",
            "Priority support",
        ],
        cta: "Start Free Trial",
        featured: true,
        tier: "professional" as const,
    },
    {
        name: "Enterprise",
        description: "For organizations with advanced needs.",
        monthlyPrice: 199,
        yearlyPrice: 166,
        features: [
            "Unlimited emails/day",
            "Unlimited emails/month",
            "Unlimited email accounts",
            "Custom AI training & prompts",
            "Advanced analytics & dashboards",
            "Dedicated IP address",
            "Custom integrations & API",
            "Unlimited scrape credits",
            "Dedicated account manager",
            "SSO & advanced security",
        ],
        cta: "Contact Sales",
        featured: false,
        tier: "enterprise" as const,
    },
];

const scrapeAddons = [
    { credits: 100, price: 9, popular: false },
    { credits: 500, price: 29, popular: true },
    { credits: 2000, price: 79, popular: false },
];

const faqs = [
    {
        q: "Can I switch plans anytime?",
        a: "Yes. Upgrade or downgrade at any time. Changes take effect immediately, and we prorate the difference.",
    },
    {
        q: "What are scrape credits?",
        a: "Scrape credits power our AI Lead Scraper. Each credit lets you search and extract one business lead — including emails, phone numbers, and social profiles — directly from the web.",
    },
    {
        q: "Is there a free trial?",
        a: "The Free plan is free forever. Paid plans include a 14-day free trial so you can test all features before committing.",
    },
    {
        q: "What happens if I hit my email limit?",
        a: "You'll get a notification. Your remaining emails will queue and send the next day. You can also upgrade your plan instantly.",
    },
    {
        q: "Do you offer refunds?",
        a: "Yes. If you're not satisfied within the first 30 days, we'll issue a full refund — no questions asked.",
    },
];

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-[#FAFBFC] dark:bg-[var(--bg-secondary)]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 text-xs font-semibold mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        Free forever plan available
                    </div>
                    <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-slate-900 dark:text-white tracking-[-0.03em] mb-4">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Start free, scale as you grow. No hidden fees, no surprises.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <span className={`text-sm font-medium transition-colors ${!isYearly ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>Monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${isYearly ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-600"}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${isYearly ? "translate-x-7" : "translate-x-1"}`} />
                        </button>
                        <span className={`text-sm font-medium transition-colors ${isYearly ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
                            Yearly
                            <span className="ml-1.5 text-xs text-cyan-500 font-semibold">Save 17%</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20 lg:pb-32 bg-white dark:bg-[var(--bg-primary)]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`relative rounded-xl p-7 transition-all duration-200 ${plan.featured
                                    ? "bg-slate-900 dark:bg-slate-950 text-white border-2 border-slate-800 dark:border-cyan-900 ring-1 ring-cyan-500/30 shadow-xl shadow-slate-900/10 dark:shadow-cyan-500/5 scale-[1.02] z-10"
                                    : "bg-white dark:bg-[var(--bg-primary)] text-slate-900 dark:text-white border border-slate-200 dark:border-[var(--border-default)] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all"
                                    }`}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-semibold tracking-wide rounded-full shadow-sm">
                                        Most Popular
                                    </div>
                                )}

                                <h3 className="font-heading text-xl font-semibold tracking-[-0.02em] mb-1">{plan.name}</h3>
                                <p className={`text-sm mb-5 ${plan.featured ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
                                    {plan.description}
                                </p>

                                <div className="mb-6">
                                    {plan.monthlyPrice === 0 ? (
                                        <div>
                                            <span className="font-heading text-4xl font-semibold tracking-[-0.04em]">Free</span>
                                            <span className={`ml-1 text-sm ${plan.featured ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>forever</span>
                                        </div>
                                    ) : (
                                        <div>
                                            <span className="font-heading text-4xl font-semibold tracking-[-0.04em]">
                                                ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                            </span>
                                            <span className={`ml-1 text-sm ${plan.featured ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
                                                /month
                                            </span>
                                            {isYearly && plan.monthlyPrice > 0 && (
                                                <div className={`text-xs mt-1 ${plan.featured ? "text-slate-500" : "text-slate-400 dark:text-slate-500"}`}>
                                                    <span className="line-through">${plan.monthlyPrice}</span> billed annually
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href={plan.cta === "Contact Sales" ? "/contact" : "/register"}
                                    className={`block w-full py-3 text-center font-semibold rounded-lg tracking-[-0.01em] transition-all active:scale-[0.98] ${plan.featured
                                        ? "bg-white text-slate-900 hover:bg-slate-100"
                                        : plan.monthlyPrice === 0
                                            ? "bg-cyan-500 text-white hover:bg-cyan-600"
                                            : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                                        }`}
                                >
                                    {plan.cta}
                                </Link>

                                <ul className="mt-7 space-y-3">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-start gap-2.5">
                                            <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.featured ? "text-cyan-400" : "text-cyan-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className={`text-sm leading-snug ${plan.featured ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Scrape Credits Add-on */}
            <section className="py-16 lg:py-24 bg-[#FAFBFC] dark:bg-[var(--bg-secondary)] border-t border-slate-100 dark:border-[var(--border-default)]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400 text-xs font-semibold mb-4">
                            🔍 Add-on
                        </div>
                        <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-[-0.03em] mb-3">
                            Scrape Credits
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                            Power up our AI Lead Scraper with additional credits. Find verified leads from any industry, anywhere.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {scrapeAddons.map((addon, i) => (
                            <div
                                key={i}
                                className={`relative rounded-xl p-6 text-center transition-all ${addon.popular
                                    ? "bg-white dark:bg-[var(--bg-primary)] border-2 border-cyan-500 dark:border-cyan-600 shadow-lg shadow-cyan-500/10"
                                    : "bg-white dark:bg-[var(--bg-primary)] border border-slate-200 dark:border-[var(--border-default)] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
                                    }`}
                            >
                                {addon.popular && (
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-cyan-500 text-white text-[10px] font-semibold tracking-wide rounded-full">
                                        Best Value
                                    </div>
                                )}
                                <div className="text-3xl mb-2">🔍</div>
                                <div className="font-heading text-2xl font-bold text-slate-900 dark:text-white tracking-[-0.02em] mb-1">
                                    {addon.credits.toLocaleString()} credits
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    ${(addon.price / addon.credits * 100).toFixed(1)}¢ per lead
                                </div>
                                <div className="font-heading text-3xl font-semibold text-slate-900 dark:text-white mb-4">
                                    ${addon.price}
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/one-time</span>
                                </div>
                                <button
                                    className="w-full py-2.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed relative overflow-hidden"
                                    disabled
                                >
                                    Coming Soon
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
                        Credits never expire. Use them whenever you need fresh leads.
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 lg:py-24 bg-white dark:bg-[var(--bg-primary)] border-t border-slate-100 dark:border-[var(--border-default)]">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <h2 className="font-heading text-2xl font-semibold text-slate-900 dark:text-white tracking-[-0.03em] mb-8 text-center">
                        Frequently asked questions
                    </h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div key={i} className={`rounded-xl border transition-all ${openFaq === i
                                ? "border-cyan-200 dark:border-cyan-800 bg-cyan-50/30 dark:bg-cyan-950/20"
                                : "border-slate-200 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-primary)]"
                                }`}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-5 text-left"
                                >
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white pr-4">{faq.q}</span>
                                    <svg
                                        className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openFaq === i && (
                                    <div className="px-5 pb-5 -mt-1">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA / Contact */}
            <section className="py-16 bg-[#FAFBFC] dark:bg-[var(--bg-secondary)] border-t border-slate-100 dark:border-[var(--border-default)]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="font-heading text-2xl font-semibold text-slate-900 dark:text-white tracking-[-0.03em] mb-4">
                        Questions about pricing?
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        Check out our FAQ or reach out to our team. We&apos;re here to help you find the right plan.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/faq" className="text-sm font-semibold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                            View FAQ →
                        </Link>
                        <Link href="/contact" className="text-sm font-semibold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                            Contact Sales →
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
