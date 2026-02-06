"use client";

import { useState } from "react";
import Link from "next/link";

const plans = [
    {
        name: "Free",
        description: "Try E-mailer with no commitment.",
        monthlyPrice: 0,
        yearlyPrice: 0,
        emails: "30 emails/day",
        features: [
            "1 email account",
            "Basic templates",
            "Email tracking",
            "Community support",
        ],
        cta: "Start Free",
        featured: false,
    },
    {
        name: "Starter",
        description: "For individuals sending outreach.",
        monthlyPrice: 19,
        yearlyPrice: 15,
        emails: "3,000 emails/month",
        features: [
            "3 email accounts",
            "AI-powered writing",
            "Smart sequences",
            "Basic analytics",
            "Email support",
        ],
        cta: "Start Free Trial",
        featured: false,
    },
    {
        name: "Growth",
        description: "For growing teams that need more power.",
        monthlyPrice: 49,
        yearlyPrice: 39,
        emails: "10,000 emails/month",
        features: [
            "10 email accounts",
            "Everything in Starter",
            "Advanced analytics",
            "CRM integrations",
            "Email warm-up",
            "Priority support",
        ],
        cta: "Start Free Trial",
        featured: true,
    },
    {
        name: "Scale",
        description: "For agencies and high-volume senders.",
        monthlyPrice: 99,
        yearlyPrice: 79,
        emails: "Unlimited emails",
        features: [
            "Unlimited accounts",
            "Everything in Growth",
            "Team collaboration",
            "Custom branding",
            "API access",
            "Dedicated support",
        ],
        cta: "Start Free Trial",
        featured: false,
    },
];

const faqs = [
    {
        q: "Can I change plans later?",
        a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
    },
    {
        q: "Do you offer a free trial?",
        a: "Yes, all paid plans include a 14-day free trial. No credit card required to start.",
    },
    {
        q: "What happens if I exceed my email limit?",
        a: "We'll notify you when you're approaching your limit. You can upgrade anytime or wait for the next billing cycle.",
    },
    {
        q: "Do you offer refunds?",
        a: "Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.",
    },
    {
        q: "How does lead generation work?",
        a: "Lead generation is credit-based and purchased separately. You can buy credits within the app to find and verify leads. This feature is coming soon!",
    },
];

export default function PricingPage() {
    const [yearly, setYearly] = useState(true);

    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
                        Start free and scale as you grow. No hidden fees, no surprises.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`font-medium ${!yearly ? "text-slate-900" : "text-slate-500"}`}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setYearly(!yearly)}
                            className={`relative w-14 h-8 rounded-full transition-colors ${yearly ? "bg-indigo-600" : "bg-slate-300"
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${yearly ? "translate-x-7" : "translate-x-1"
                                    }`}
                            />
                        </button>
                        <span className={`font-medium ${yearly ? "text-slate-900" : "text-slate-500"}`}>
                            Yearly
                        </span>
                        {yearly && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                                Save 20%
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 lg:py-24 -mt-8">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`relative p-6 rounded-2xl ${plan.featured
                                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-2xl shadow-indigo-500/25 ring-4 ring-indigo-500/20"
                                    : "bg-white border border-slate-200"
                                    }`}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-xs font-semibold rounded-full">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h3 className={`text-lg font-bold mb-1 ${plan.featured ? "text-white" : "text-slate-900"}`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-sm ${plan.featured ? "text-indigo-100" : "text-slate-600"}`}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-1">
                                    <span className={`text-3xl font-bold ${plan.featured ? "text-white" : "text-slate-900"}`}>
                                        ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                                    </span>
                                    <span className={plan.featured ? "text-indigo-200" : "text-slate-500"}>
                                        /month
                                    </span>
                                </div>
                                <p className={`text-sm mb-4 ${plan.featured ? "text-indigo-200" : "text-slate-500"}`}>
                                    {plan.emails}
                                </p>

                                <Link
                                    href="/register"
                                    className={`block w-full py-2.5 rounded-xl font-semibold text-center transition-all text-sm ${plan.featured
                                        ? "bg-white text-indigo-600 hover:bg-indigo-50"
                                        : "bg-slate-900 text-white hover:bg-slate-800"
                                        }`}
                                >
                                    {plan.cta}
                                </Link>

                                <ul className="mt-6 space-y-3">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-start gap-2">
                                            <svg
                                                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.featured ? "text-indigo-200" : "text-green-500"}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className={`text-sm ${plan.featured ? "text-indigo-100" : "text-slate-600"}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lead Generation Credits - Coming Soon */}
            <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-400 text-sm font-semibold rounded-full mb-4">
                        Coming Soon
                    </span>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                        Lead Generation Credits
                    </h2>
                    <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                        Find and verify leads with our AI-powered scraper. Buy credits as you need them—no subscription required.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="text-2xl font-bold text-white">$10</div>
                            <div className="text-slate-400 text-sm">1,000 credits</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 ring-2 ring-indigo-500">
                            <div className="text-2xl font-bold text-white">$40</div>
                            <div className="text-slate-400 text-sm">5,000 credits</div>
                            <div className="text-xs text-indigo-400 mt-1">Save 20%</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="text-2xl font-bold text-white">$70</div>
                            <div className="text-slate-400 text-sm">10,000 credits</div>
                            <div className="text-xs text-green-400 mt-1">Save 30%</div>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-6">
                        1 credit = 1 lead discovered • 8 credits = 1 verified email
                    </p>
                </div>
            </section>

            {/* Pricing FAQ */}
            <section className="py-16 lg:py-24 bg-slate-50">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 text-center mb-12">
                        Pricing FAQ
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="p-6 bg-white rounded-xl border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                                <p className="text-slate-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enterprise CTA */}
            <section className="py-16 lg:py-24">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
                        Need a custom plan?
                    </h2>
                    <p className="text-lg text-slate-600 mb-8">
                        We offer custom solutions for enterprise teams with specific needs.
                    </p>
                    <a
                        href="mailto:support@e-mailer.app"
                        className="inline-flex px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        Contact Sales →
                    </a>
                </div>
            </section>
        </>
    );
}
