"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { PageTransition, FadeInContainer, StaggeredList, StaggeredItem } from "@/components/PageTransition";
import Link from "next/link";

type InsightTab = "overview" | "analytics" | "reputation" | "ab-tests" | "calls";

function InsightsPage() {
    const [activeTab, setActiveTab] = useState<InsightTab>("overview");
    const stats = useQuery(api.sequenceScheduler.getReputationStats, { days: 30 });
    const callStats = useQuery(api.activities.getCallStats);

    const tabs: { id: InsightTab; label: string; icon: string }[] = [
        { id: "overview", label: "Overview", icon: "📊" },
        { id: "analytics", label: "Analytics", icon: "📈" },
        { id: "reputation", label: "Reputation", icon: "🛡️" },
        { id: "ab-tests", label: "A/B Tests", icon: "🧪" },
        { id: "calls", label: "Call Log", icon: "📞" },
    ];

    const getReputationColor = (score: number) => {
        if (score >= 90) return "text-emerald-400";
        if (score >= 70) return "text-yellow-400";
        if (score >= 50) return "text-orange-400";
        return "text-red-400";
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pb-20 md:pb-0">
            <AppHeader />

            <PageTransition>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header */}
                    <FadeInContainer>
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Insights
                            </h1>
                            <p className="text-white/50 mt-1">Analytics, reputation, and performance metrics</p>
                        </div>
                    </FadeInContainer>

                    {/* Tab Navigation */}
                    <FadeInContainer delay={0.1}>
                        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50"
                                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent"
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </FadeInContainer>

                    {/* Tab Content */}
                    {activeTab === "overview" && (
                        <FadeInContainer delay={0.15}>
                            <StaggeredList>
                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <StaggeredItem>
                                        <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-2xl border border-indigo-500/20">
                                            <div className="text-3xl font-bold text-indigo-400">
                                                {stats?.totals?.sent || 0}
                                            </div>
                                            <div className="text-sm text-white/50 mt-1">Emails Sent</div>
                                        </div>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/20">
                                            <div className="text-3xl font-bold text-emerald-400">
                                                {stats?.rates?.openRate !== undefined ? `${Number(stats.rates.openRate).toFixed(1)}%` : "—"}
                                            </div>
                                            <div className="text-sm text-white/50 mt-1">Open Rate</div>
                                        </div>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl border border-purple-500/20">
                                            <div className="text-3xl font-bold text-purple-400">
                                                {callStats?.today || 0}
                                            </div>
                                            <div className="text-sm text-white/50 mt-1">Calls Today</div>
                                        </div>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <div className={`p-5 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-2xl border border-amber-500/20`}>
                                            <div className={`text-3xl font-bold ${getReputationColor(stats?.reputationScore || 0)}`}>
                                                {stats?.reputationScore || 0}
                                            </div>
                                            <div className="text-sm text-white/50 mt-1">Reputation Score</div>
                                        </div>
                                    </StaggeredItem>
                                </div>

                                {/* Quick Links */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <StaggeredItem>
                                        <Link
                                            href="/analytics"
                                            className="block p-6 bg-[#12121f] rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">📈</span>
                                                <div>
                                                    <h3 className="font-semibold text-lg group-hover:text-indigo-400 transition-colors">Analytics Dashboard</h3>
                                                    <p className="text-white/50 text-sm">Detailed campaign performance metrics</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <Link
                                            href="/reputation"
                                            className="block p-6 bg-[#12121f] rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">🛡️</span>
                                                <div>
                                                    <h3 className="font-semibold text-lg group-hover:text-emerald-400 transition-colors">Domain Reputation</h3>
                                                    <p className="text-white/50 text-sm">Monitor deliverability and sender health</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <Link
                                            href="/ab-tests"
                                            className="block p-6 bg-[#12121f] rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">🧪</span>
                                                <div>
                                                    <h3 className="font-semibold text-lg group-hover:text-purple-400 transition-colors">A/B Testing</h3>
                                                    <p className="text-white/50 text-sm">Experiment with subject lines and content</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <Link
                                            href="/calls"
                                            className="block p-6 bg-[#12121f] rounded-2xl border border-white/10 hover:border-amber-500/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">📞</span>
                                                <div>
                                                    <h3 className="font-semibold text-lg group-hover:text-amber-400 transition-colors">Call Activity</h3>
                                                    <p className="text-white/50 text-sm">Track calls and follow-ups</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </StaggeredItem>
                                </div>
                            </StaggeredList>
                        </FadeInContainer>
                    )}

                    {activeTab === "reputation" && (
                        <FadeInContainer delay={0.15}>
                            <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] rounded-2xl border border-white/10 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-sm text-white/50 uppercase tracking-wider mb-2">Reputation Score</h2>
                                        <div className={`text-6xl font-bold ${getReputationColor(stats?.reputationScore || 0)}`}>
                                            {stats?.reputationScore || 0}
                                        </div>
                                    </div>
                                    <Link
                                        href="/reputation"
                                        className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        View Full Report →
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="p-4 bg-black/30 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-emerald-400">
                                            {stats?.rates?.deliveryRate !== undefined ? `${Number(stats.rates.deliveryRate).toFixed(1)}%` : "—"}
                                        </div>
                                        <div className="text-xs text-white/50 mt-1">Delivery</div>
                                    </div>
                                    <div className="p-4 bg-black/30 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-blue-400">
                                            {stats?.rates?.openRate !== undefined ? `${Number(stats.rates.openRate).toFixed(1)}%` : "—"}
                                        </div>
                                        <div className="text-xs text-white/50 mt-1">Opens</div>
                                    </div>
                                    <div className="p-4 bg-black/30 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-purple-400">
                                            {stats?.rates?.clickRate !== undefined ? `${Number(stats.rates.clickRate).toFixed(1)}%` : "—"}
                                        </div>
                                        <div className="text-xs text-white/50 mt-1">Clicks</div>
                                    </div>
                                    <div className="p-4 bg-black/30 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-amber-400">
                                            {stats?.rates?.bounceRate !== undefined ? `${Number(stats.rates.bounceRate).toFixed(2)}%` : "—"}
                                        </div>
                                        <div className="text-xs text-white/50 mt-1">Bounces</div>
                                    </div>
                                    <div className="p-4 bg-black/30 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-red-400">
                                            {stats?.rates?.complaintRate !== undefined ? `${Number(stats.rates.complaintRate).toFixed(3)}%` : "—"}
                                        </div>
                                        <div className="text-xs text-white/50 mt-1">Complaints</div>
                                    </div>
                                </div>
                            </div>
                        </FadeInContainer>
                    )}

                    {activeTab === "analytics" && (
                        <FadeInContainer delay={0.15}>
                            <div className="text-center py-16 text-white/40">
                                <span className="text-5xl mb-4 block">📈</span>
                                <p>Analytics dashboard embedded here</p>
                                <Link href="/analytics" className="text-indigo-400 hover:underline mt-2 inline-block">
                                    Open Full Analytics →
                                </Link>
                            </div>
                        </FadeInContainer>
                    )}

                    {activeTab === "ab-tests" && (
                        <FadeInContainer delay={0.15}>
                            <div className="text-center py-16 text-white/40">
                                <span className="text-5xl mb-4 block">🧪</span>
                                <p>A/B Testing experiments</p>
                                <Link href="/ab-tests" className="text-indigo-400 hover:underline mt-2 inline-block">
                                    Open A/B Tests →
                                </Link>
                            </div>
                        </FadeInContainer>
                    )}

                    {activeTab === "calls" && (
                        <FadeInContainer delay={0.15}>
                            <div className="bg-[#12121f] rounded-2xl border border-white/10 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">Call Summary</h3>
                                    <Link href="/calls" className="text-indigo-400 hover:underline text-sm">
                                        View All →
                                    </Link>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-black/30 rounded-xl text-center">
                                        <div className="text-3xl font-bold text-green-400">{callStats?.today || 0}</div>
                                        <div className="text-xs text-white/50 mt-1">Today</div>
                                    </div>
                                    <div className="p-4 bg-black/30 rounded-xl text-center">
                                        <div className="text-3xl font-bold text-blue-400">{callStats?.week || 0}</div>
                                        <div className="text-xs text-white/50 mt-1">This Week</div>
                                    </div>
                                    <div className="p-4 bg-black/30 rounded-xl text-center">
                                        <div className="text-3xl font-bold text-purple-400">{callStats?.month || 0}</div>
                                        <div className="text-xs text-white/50 mt-1">This Month</div>
                                    </div>
                                </div>
                            </div>
                        </FadeInContainer>
                    )}
                </main>
            </PageTransition>
        </div>
    );
}

export default function InsightsPageWrapper() {
    return (
        <AuthGuard>
            <InsightsPage />
        </AuthGuard>
    );
}
