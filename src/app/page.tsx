import Link from "next/link";
import { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

export const metadata: Metadata = {
    title: "Sendly - AI-Powered Email Outreach Platform | Best Cold Email Software",
    description: "Sendly is the #1 AI-powered email outreach platform. Send personalized cold emails at scale, automate follow-ups, and close more deals. Trusted by 10,000+ sales teams.",
    keywords: ["email outreach", "cold email software", "AI email writer", "sales automation", "email marketing platform", "lead generation tool", "email sequences"],
    openGraph: {
        title: "Sendly - AI-Powered Email Outreach Platform",
        description: "Send personalized cold emails at scale with AI-powered writing and smart sequences. Start free.",
        type: "website",
        url: "https://sendly.io",
        siteName: "Sendly",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sendly - AI-Powered Email Outreach Platform",
        description: "Send personalized cold emails at scale with AI-powered writing and smart sequences.",
    },
    alternates: { canonical: "https://sendly.io" },
};

// Feature data
const features = [
    {
        icon: "⚡",
        title: "AI-Powered Writing",
        description: "Generate personalized emails in seconds. Our AI adapts to your tone and creates compelling copy that converts.",
    },
    {
        icon: "🎯",
        title: "Smart Sequences",
        description: "Automate multi-step follow-up campaigns. Set triggers, delays, and conditions for the perfect outreach flow.",
    },
    {
        icon: "📊",
        title: "Advanced Analytics",
        description: "Track opens, clicks, and replies in real-time. Make data-driven decisions to optimize your campaigns.",
    },
    {
        icon: "🔒",
        title: "Deliverability Suite",
        description: "Built-in warm-up, spam testing, and reputation monitoring. Land in the inbox, not the spam folder.",
    },
    {
        icon: "🔗",
        title: "CRM Integration",
        description: "Sync with Salesforce, HubSpot, and more. Keep your pipeline updated automatically.",
    },
    {
        icon: "👥",
        title: "Team Collaboration",
        description: "Share templates, track team performance, and maintain brand consistency across your organization.",
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
        quote: "Sendly transformed our outreach. We went from 2% to 15% reply rates in just one month.",
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
        quote: "We replaced 3 different tools with Sendly. It does everything and costs way less.",
        author: "Emily Watson",
        role: "VP Sales, StartupXYZ",
        avatar: "EW",
    },
];

// JSON-LD structured data for SEO
const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Sendly",
    description: "AI-powered email outreach platform for sales teams",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
    },
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "2847",
    },
};

export default function Home() {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />
            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-violet-400/10 to-indigo-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center max-w-4xl mx-auto">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-8">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                Live: 2,847 emails sent in the last hour
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] mb-6">
                                Send cold emails that
                                <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                    actually get replies
                                </span>
                            </h1>

                            {/* Subheadline */}
                            <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                                The AI-powered email outreach platform for modern sales teams.
                                Personalize at scale, automate follow-ups, and close more deals.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                                <Link
                                    href="/register"
                                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg"
                                >
                                    Start Free Trial →
                                </Link>
                                <Link
                                    href="/demo"
                                    className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-lg flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Watch Demo
                                </Link>
                            </div>

                            {/* Trust Badges */}
                            <p className="text-sm text-slate-500">
                                No credit card required · Free 14-day trial · Cancel anytime
                            </p>
                        </div>

                        {/* App Preview */}
                        <div className="mt-16 lg:mt-20 relative">
                            <div className="relative mx-auto max-w-5xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
                                <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-800">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <span className="ml-4 text-sm text-slate-400">app.sendly.io</span>
                                    </div>
                                    <div className="aspect-[16/9] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-white/60 text-sm">Dashboard Preview</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-slate-50 border-y border-slate-200">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-slate-600 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 lg:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                                Everything you need to scale outreach
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                From AI-powered writing to advanced analytics, Sendly gives you all the tools
                                you need to run successful email campaigns.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, i) => (
                                <div
                                    key={i}
                                    className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                                Loved by sales teams everywhere
                            </h2>
                            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                                Join thousands of businesses using Sendly to transform their outreach.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {testimonials.map((t, i) => (
                                <div
                                    key={i}
                                    className="p-8 bg-white/5 backdrop-blur rounded-2xl border border-white/10 hover:border-white/20 transition-colors"
                                >
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(5)].map((_, j) => (
                                            <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                                        &ldquo;{t.quote}&rdquo;
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-semibold">
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{t.author}</div>
                                            <div className="text-sm text-slate-400">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-20 lg:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                                Get started in minutes
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Three simple steps to transform your email outreach.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 lg:gap-16">
                            {[
                                {
                                    step: "01",
                                    title: "Import your leads",
                                    description: "Upload a CSV or connect your CRM. We'll automatically enrich and verify your contacts.",
                                },
                                {
                                    step: "02",
                                    title: "Create your campaign",
                                    description: "Use our AI to write personalized emails, or start from one of our proven templates.",
                                },
                                {
                                    step: "03",
                                    title: "Watch the replies roll in",
                                    description: "Our smart sequences handle the follow-ups. You focus on closing deals.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-xl mb-6">
                                        {item.step}
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-20 lg:py-32 bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                    <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                            Ready to 10x your outreach?
                        </h2>
                        <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                            Join over 10,000 sales professionals who use Sendly to send better emails and close more deals.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex px-10 py-5 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-lg"
                        >
                            Start Your Free Trial →
                        </Link>
                        <p className="mt-6 text-indigo-200 text-sm">
                            Free 14-day trial · No credit card required · Cancel anytime
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
