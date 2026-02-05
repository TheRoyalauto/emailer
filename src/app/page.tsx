"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

// Animated counter hook
function useRandomCounter(min: number, max: number, interval: number) {
    const [count, setCount] = useState(min + Math.floor(Math.random() * (max - min)));
    const [previousCounts, setPreviousCounts] = useState<Set<number>>(new Set());

    useEffect(() => {
        const timer = setInterval(() => {
            let newCount: number;
            do {
                newCount = min + Math.floor(Math.random() * (max - min));
            } while (previousCounts.has(newCount) && previousCounts.size < (max - min));

            setPreviousCounts(prev => {
                const updated = new Set(prev);
                if (updated.size > 100) updated.clear(); // Reset after 100 to avoid memory issues
                updated.add(newCount);
                return updated;
            });
            setCount(newCount);
        }, interval);
        return () => clearInterval(timer);
    }, [min, max, interval, previousCounts]);

    return count;
}

// Typing animation hook
function useTypingEffect(text: string, speed: number = 50) {
    const [displayText, setDisplayText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let i = 0;
        setDisplayText("");
        setIsComplete(false);
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayText(text.slice(0, i + 1));
                i++;
            } else {
                setIsComplete(true);
                clearInterval(timer);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return { displayText, isComplete };
}

// Feature data
const features = [
    {
        icon: "⚡",
        title: "AI-Powered Writing",
        description: "Generate personalized emails in seconds. Our AI adapts to your tone and creates compelling copy.",
    },
    {
        icon: "🎯",
        title: "Smart Sequences",
        description: "Automate multi-step follow-up campaigns with triggers, delays, and conditions.",
    },
    {
        icon: "📊",
        title: "Advanced Analytics",
        description: "Track opens, clicks, and replies in real-time. Make data-driven decisions.",
    },
    {
        icon: "🔒",
        title: "Deliverability Suite",
        description: "Built-in warm-up, spam testing, and reputation monitoring.",
    },
    {
        icon: "🔗",
        title: "CRM Integration",
        description: "Sync with Salesforce, HubSpot, and more automatically.",
    },
    {
        icon: "👥",
        title: "Team Collaboration",
        description: "Share templates and track team performance.",
    },
];

const stats = [
    { value: "50M+", label: "Emails Sent" },
    { value: "98.7%", label: "Deliverability" },
    { value: "3.2x", label: "More Replies" },
    { value: "10K+", label: "Happy Users" },
];

const testimonials = [
    {
        quote: "E-mailer transformed our outreach. We went from 2% to 15% reply rates in just one month.",
        author: "Sarah Chen",
        role: "Head of Sales, TechCorp",
        avatar: "SC",
    },
    {
        quote: "The AI writes better cold emails than most of my sales team. It's honestly scary good.",
        author: "Marcus Rodriguez",
        role: "Founder, GrowthLabs",
        avatar: "MR",
    },
    {
        quote: "We replaced 3 different tools with E-mailer. It does everything and costs way less.",
        author: "Emily Watson",
        role: "VP Sales, StartupXYZ",
        avatar: "EW",
    },
];

const steps = [
    {
        num: "01",
        title: "Import Leads",
        description: "Upload CSV or connect CRM. Auto-enrichment included.",
        visual: "📥",
    },
    {
        num: "02",
        title: "Write with AI",
        description: "Our AI writes personalized emails that sound human.",
        visual: "✨",
    },
    {
        num: "03",
        title: "Send & Track",
        description: "Smart sequences handle follow-ups. You close deals.",
        visual: "🚀",
    },
];

// JSON-LD for SEO
const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "E-mailer",
    description: "AI-powered email outreach platform for sales teams",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "2847" },
};

export default function Home() {
    const emailCount = useRandomCounter(5000, 20000, 3000);
    const [activeStep, setActiveStep] = useState(0);
    const { displayText, isComplete } = useTypingEffect("Send emails that get replies.", 80);

    // Auto-cycle through steps
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Navbar />

            <main>
                {/* HERO SECTION */}
                <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
                    <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400/30 to-violet-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />

                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                        {/* Live Counter - Tight spacing */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-semibold border border-green-200/50 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="tabular-nums">{emailCount.toLocaleString()}</span> emails sent this hour
                            </div>
                        </div>

                        <div className="text-center max-w-4xl mx-auto">
                            {/* Headline with typing effect */}
                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.05] mb-6">
                                <span className="block text-slate-400 text-2xl sm:text-3xl lg:text-4xl font-medium mb-2">
                                    Cold email, simplified.
                                </span>
                                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                                    {displayText}
                                    {!isComplete && <span className="animate-pulse">|</span>}
                                </span>
                            </h1>

                            {/* Story paragraph */}
                            <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                                We built E-mailer because cold email shouldn&apos;t be complicated.
                                <span className="text-slate-900 font-medium"> Import leads. Write with AI. Send. Track. That&apos;s it.</span>
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                                <Link
                                    href="/register"
                                    className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg flex items-center justify-center gap-2"
                                >
                                    Start Free
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                                <Link
                                    href="#how-it-works"
                                    className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur text-slate-700 font-semibold rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-white transition-all text-lg"
                                >
                                    See How It Works
                                </Link>
                            </div>

                            <p className="text-sm text-slate-500">
                                Free forever for small teams · No credit card · Setup in 2 minutes
                            </p>
                        </div>

                        {/* Interactive 3-Step Preview */}
                        <div id="how-it-works" className="mt-16 lg:mt-20">
                            <div className="max-w-4xl mx-auto">
                                {/* Step indicators */}
                                <div className="flex justify-center gap-4 mb-8">
                                    {steps.map((step, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveStep(i)}
                                            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${activeStep === i
                                                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg scale-105"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                        >
                                            <span className="text-2xl">{step.visual}</span>
                                            <span className="font-semibold hidden sm:block">{step.title}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Active step content */}
                                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12 transition-all">
                                    <div className="flex flex-col lg:flex-row items-center gap-8">
                                        <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-5xl">
                                            {steps[activeStep].visual}
                                        </div>
                                        <div className="text-center lg:text-left">
                                            <div className="text-sm font-bold text-indigo-600 mb-1">STEP {steps[activeStep].num}</div>
                                            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                                                {steps[activeStep].title}
                                            </h3>
                                            <p className="text-lg text-slate-600">
                                                {steps[activeStep].description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-8 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                                            style={{ width: `${((activeStep + 1) / 3) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* VALUE PROP - The Story */}
                <section className="py-20 lg:py-28 bg-slate-50 border-y border-slate-200">
                    <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                            Why we built E-mailer
                        </h2>
                        <p className="text-lg lg:text-xl text-slate-600 leading-relaxed mb-8">
                            We were tired of bloated sales tools that cost too much and did too little.
                            So we built something simple: <span className="text-slate-900 font-semibold">one app that does cold email right.</span>
                        </p>
                        <div className="grid sm:grid-cols-3 gap-6 text-left">
                            {[
                                { icon: "🚫", title: "No complexity", desc: "No 47-step workflows. Just email." },
                                { icon: "💰", title: "No hidden fees", desc: "Transparent pricing. Free tier forever." },
                                { icon: "🎯", title: "No BS", desc: "Write. Send. Track. Close deals." },
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                                    <div className="text-3xl mb-3">{item.icon}</div>
                                    <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                                    <p className="text-slate-600 text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center group">
                                    <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                                        {stat.value}
                                    </div>
                                    <div className="text-slate-600 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 lg:py-28">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                                Everything you need. Nothing you don&apos;t.
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Powerful features, zero bloat.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, i) => (
                                <div
                                    key={i}
                                    className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                                Teams love E-mailer
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {testimonials.map((t, i) => (
                                <div
                                    key={i}
                                    className="p-6 bg-white/5 backdrop-blur rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, j) => (
                                            <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-slate-300 mb-4 text-sm leading-relaxed">
                                        &ldquo;{t.quote}&rdquo;
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-semibold">
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white text-sm">{t.author}</div>
                                            <div className="text-xs text-slate-400">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 lg:py-28 bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                    <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
                        <h2 className="text-3xl lg:text-5xl font-bold mb-4">
                            Ready to send better emails?
                        </h2>
                        <p className="text-xl text-indigo-100 mb-8">
                            Join 10,000+ teams. Start sending in 2 minutes.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex px-10 py-5 bg-white text-indigo-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all text-lg"
                        >
                            Start Free →
                        </Link>
                        <p className="mt-4 text-indigo-200 text-sm">
                            Free forever · No credit card
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
