"use client";

import Link from "next/link";
import { useState } from "react";
import { Metadata } from "next";

const plans = [
    {
        name: "Starter",
        description: "For individuals getting started with email outreach.",
        monthlyPrice: 29,
        yearlyPrice: 24,
        features: [
            "500 emails/month",
            "1 email account",
            "Basic AI writing",
            "Email tracking",
            "Standard support",
        ],
        cta: "Start Free Trial",
        featured: false,
    },
    {
        name: "Professional",
        description: "For teams scaling their outreach operations.",
        monthlyPrice: 79,
        yearlyPrice: 66,
        features: [
            "5,000 emails/month",
            "5 email accounts",
            "Advanced AI writing",
            "Smart sequences",
            "A/B testing",
            "CRM integration",
            "Priority support",
        ],
        cta: "Start Free Trial",
        featured: true,
    },
    {
        name: "Enterprise",
        description: "For organizations with advanced needs.",
        monthlyPrice: 199,
        yearlyPrice: 166,
        features: [
            "Unlimited emails",
            "Unlimited accounts",
            "Custom AI training",
            "Advanced analytics",
            "Dedicated IP",
            "Custom integrations",
            "Dedicated account manager",
            "SSO & security",
        ],
        cta: "Contact Sales",
        featured: false,
    },
];

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-[#FAFBFC]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-slate-900 tracking-[-0.03em] mb-4">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Start free, scale as you grow. No hidden fees, no surprises.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <span className={`text-sm font-medium ${!isYearly ? "text-slate-900" : "text-slate-400"}`}>Monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${isYearly ? "bg-cyan-500" : "bg-slate-300"}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isYearly ? "translate-x-7" : "translate-x-1"}`} />
                        </button>
                        <span className={`text-sm font-medium ${isYearly ? "text-slate-900" : "text-slate-400"}`}>
                            Yearly
                            <span className="ml-1.5 text-xs text-cyan-500 font-semibold">Save 17%</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20 lg:pb-32 bg-white">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 -mt-4">
                    <div className="grid md:grid-cols-3 gap-6">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`relative rounded-xl p-8 ${plan.featured
                                        ? "bg-slate-900 text-white border-2 border-slate-800 ring-1 ring-cyan-500/30 shadow-xl shadow-slate-900/10"
                                        : "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all"
                                    }`}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-500 text-white text-xs font-semibold tracking-wide rounded-full">
                                        Most Popular
                                    </div>
                                )}

                                <h3 className="font-heading text-xl font-semibold tracking-[-0.02em] mb-2">{plan.name}</h3>
                                <p className={`text-sm mb-6 ${plan.featured ? "text-slate-400" : "text-slate-500"}`}>
                                    {plan.description}
                                </p>

                                <div className="mb-8">
                                    <span className="font-heading text-5xl font-semibold tracking-[-0.04em]">
                                        ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                    </span>
                                    <span className={`ml-1 text-sm ${plan.featured ? "text-slate-400" : "text-slate-500"}`}>
                                        /month
                                    </span>
                                </div>

                                <Link
                                    href={plan.cta === "Contact Sales" ? "/contact" : "/register"}
                                    className={`block w-full py-3.5 text-center font-semibold rounded-lg tracking-[-0.01em] transition-all active:scale-[0.98] ${plan.featured
                                            ? "bg-white text-slate-900 hover:bg-slate-100"
                                            : "bg-slate-900 text-white hover:bg-slate-800"
                                        }`}
                                >
                                    {plan.cta}
                                </Link>

                                <ul className="mt-8 space-y-4">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-center gap-3">
                                            <svg className={`w-4 h-4 flex-shrink-0 ${plan.featured ? "text-cyan-400" : "text-cyan-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className={`text-sm ${plan.featured ? "text-slate-300" : "text-slate-600"}`}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Teaser */}
            <section className="py-16 bg-[#FAFBFC] border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="font-heading text-2xl font-semibold text-slate-900 tracking-[-0.03em] mb-4">
                        Questions about pricing?
                    </h2>
                    <p className="text-slate-500 mb-6 leading-relaxed">
                        Check out our FAQ or reach out to our team. We&apos;re here to help you find the right plan.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/faq" className="text-sm font-semibold text-slate-900 hover:text-cyan-600 transition-colors">
                            View FAQ →
                        </Link>
                        <Link href="/contact" className="text-sm font-semibold text-slate-900 hover:text-cyan-600 transition-colors">
                            Contact Sales →
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
