"use client";

import { useState } from "react";
import Link from "next/link";

const plans = [
    {
        name: "Starter",
        description: "Perfect for individuals and small teams getting started.",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            "500 emails/month",
            "1 email account",
            "Basic templates",
            "Email tracking",
            "Chrome extension",
            "Community support",
        ],
        cta: "Start Free",
        featured: false,
    },
    {
        name: "Pro",
        description: "For growing teams that need more power and flexibility.",
        monthlyPrice: 49,
        yearlyPrice: 39,
        features: [
            "10,000 emails/month",
            "5 email accounts",
            "AI-powered writing",
            "Smart sequences",
            "Advanced analytics",
            "CRM integrations",
            "Email warm-up",
            "Priority support",
        ],
        cta: "Start Free Trial",
        featured: true,
    },
    {
        name: "Business",
        description: "For organizations that need enterprise-grade features.",
        monthlyPrice: 99,
        yearlyPrice: 79,
        features: [
            "Unlimited emails",
            "Unlimited accounts",
            "Everything in Pro",
            "Team collaboration",
            "Custom branding",
            "API access",
            "Dedicated IP",
            "SLA & onboarding",
        ],
        cta: "Contact Sales",
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
        a: "We'll notify you when you're approaching your limit. You can upgrade anytime or purchase additional credits.",
    },
    {
        q: "Do you offer refunds?",
        a: "Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.",
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
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`relative p-8 rounded-2xl ${plan.featured
                                        ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-2xl shadow-indigo-500/25 scale-105"
                                        : "bg-white border border-slate-200"
                                    }`}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-sm font-semibold rounded-full">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className={`text-xl font-bold mb-2 ${plan.featured ? "text-white" : "text-slate-900"}`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-sm ${plan.featured ? "text-indigo-100" : "text-slate-600"}`}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <span className={`text-4xl font-bold ${plan.featured ? "text-white" : "text-slate-900"}`}>
                                        ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                                    </span>
                                    <span className={plan.featured ? "text-indigo-200" : "text-slate-500"}>
                                        /month
                                    </span>
                                </div>

                                <Link
                                    href={plan.name === "Business" ? "/contact" : "/register"}
                                    className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${plan.featured
                                            ? "bg-white text-indigo-600 hover:bg-indigo-50"
                                            : "bg-slate-900 text-white hover:bg-slate-800"
                                        }`}
                                >
                                    {plan.cta}
                                </Link>

                                <ul className="mt-8 space-y-4">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-start gap-3">
                                            <svg
                                                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.featured ? "text-indigo-200" : "text-green-500"}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className={plan.featured ? "text-indigo-100" : "text-slate-600"}>
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

            {/* Pricing FAQ */}
            <section className="py-16 lg:py-24 bg-slate-50">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 text-center mb-12">
                        Pricing FAQ
                    </h2>
                    <div className="space-y-6">
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
                    <Link
                        href="/contact"
                        className="inline-flex px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        Contact Sales →
                    </Link>
                </div>
            </section>
        </>
    );
}

