"use client";

import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { PageTransition, FadeInContainer } from "@/components/PageTransition";
import { useAuthQuery } from "../../hooks/useAuthConvex";
import { PageHeader } from "@/components/PageHeader";

type InsightTab = "overview" | "performance" | "reputation" | "calls";

function InsightsPage() {
    const [activeTab, setActiveTab] = useState<InsightTab>("overview");
    const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

    const stats = useAuthQuery(api.sequenceScheduler.getReputationStats, {
        days: timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    });
    const callStats = useAuthQuery(api.activities.getCallStats);
    const recentActivity = useAuthQuery(api.activities.getRecentActivity, { limit: 10 });

    const tabs: { id: InsightTab; label: string; icon: string }[] = [
        { id: "overview", label: "Overview", icon: "📊" },
        { id: "performance", label: "Performance", icon: "📈" },
        { id: "reputation", label: "Reputation", icon: "🛡️" },
        { id: "calls", label: "Calls", icon: "📞" },
    ];

    const getReputationColor = (score: number) => {
        if (score >= 90) return "text-emerald-400";
        if (score >= 70) return "text-yellow-400";
        if (score >= 50) return "text-orange-400";
        return "text-red-400";
    };

    const getReputationBg = (score: number) => {
        if (score >= 90) return "from-emerald-500/20 to-emerald-500/5";
        if (score >= 70) return "from-yellow-500/20 to-yellow-500/5";
        if (score >= 50) return "from-orange-500/20 to-orange-500/5";
        return "from-red-500/20 to-red-500/5";
    };

    const formatRelativeTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "call_made": return "📞";
            case "voicemail_left": return "📱";
            case "email_sent": return "📧";
            case "note_added": return "📝";
            case "follow_up_scheduled": return "📅";
            case "status_changed": return "🔄";
            default: return "📌";
        }
    };

    // Calculate performance metrics
    const openRate = stats?.rates?.openRate ? Number(stats.rates.openRate) : 0;
    const clickRate = stats?.rates?.clickRate ? Number(stats.rates.clickRate) : 0;
    const bounceRate = stats?.rates?.bounceRate ? Number(stats.rates.bounceRate) : 0;
    const deliveryRate = stats?.rates?.deliveryRate ? Number(stats.rates.deliveryRate) : 100;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20 md:pb-0">
            <AppHeader />

            <PageTransition>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header with Time Range */}
                    <FadeInContainer>
                        <PageHeader
                            title="Insights"
                            subtitle="Performance metrics and analytics"
                        >
                            <div className="flex gap-2">
                                {(["7d", "30d", "90d"] as const).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${timeRange === range
                                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50"
                                            : "bg-white text-slate-500 hover:bg-slate-50"
                                            }`}
                                    >
                                        {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
                                    </button>
                                ))}
                            </div>
                        </PageHeader>
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
                                        : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </FadeInContainer>

                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <FadeInContainer delay={0.15}>
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-2xl border border-indigo-500/20">
                                    <div className="text-3xl font-bold text-indigo-400">
                                        {stats?.totals?.sent || 0}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">Emails Sent</div>
                                </div>
                                <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/20">
                                    <div className="text-3xl font-bold text-emerald-400">
                                        {openRate > 0 ? `${openRate.toFixed(1)}%` : "—"}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">Open Rate</div>
                                </div>
                                <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl border border-purple-500/20">
                                    <div className="text-3xl font-bold text-purple-400">
                                        {callStats?.today || 0}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">Calls Today</div>
                                </div>
                                <div className={`p-5 bg-gradient-to-br ${getReputationBg(stats?.reputationScore || 0)} rounded-2xl border border-slate-200`}>
                                    <div className={`text-3xl font-bold ${getReputationColor(stats?.reputationScore || 0)}`}>
                                        {stats?.reputationScore || 0}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">Reputation Score</div>
                                </div>
                            </div>

                            {/* Two Column Layout */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Performance Summary */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-500">Delivery Rate</span>
                                                <span className="text-emerald-400">{deliveryRate.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${deliveryRate}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-500">Open Rate</span>
                                                <span className="text-blue-400">{openRate.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(openRate * 2, 100)}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-500">Click Rate</span>
                                                <span className="text-purple-400">{clickRate.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min(clickRate * 5, 100)}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-500">Bounce Rate</span>
                                                <span className="text-red-400">{bounceRate.toFixed(2)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                                <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${Math.min(bounceRate * 10, 100)}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                                    {recentActivity === undefined ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                                        </div>
                                    ) : recentActivity.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400">
                                            <p>No recent activity</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-200 max-h-64 overflow-y-auto">
                                            {recentActivity.map((activity) => (
                                                <div key={activity._id} className="py-3 flex items-center gap-3">
                                                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm truncate">
                                                            {activity.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                                        </div>
                                                        {activity.notes && (
                                                            <div className="text-xs text-slate-400 truncate">{activity.notes}</div>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-400">{formatRelativeTime(activity.createdAt)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </FadeInContainer>
                    )}

                    {/* Performance Tab */}
                    {activeTab === "performance" && (
                        <FadeInContainer delay={0.15}>
                            <div className="space-y-6">
                                {/* Email Stats */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold mb-6">Email Performance</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div className="p-4 bg-black/30 rounded-xl text-center">
                                            <div className="text-2xl font-bold text-white">{stats?.totals?.sent || 0}</div>
                                            <div className="text-xs text-slate-500 mt-1">Sent</div>
                                        </div>
                                        <div className="p-4 bg-black/30 rounded-xl text-center">
                                            <div className="text-2xl font-bold text-emerald-400">{stats?.totals?.delivered || 0}</div>
                                            <div className="text-xs text-slate-500 mt-1">Delivered</div>
                                        </div>
                                        <div className="p-4 bg-black/30 rounded-xl text-center">
                                            <div className="text-2xl font-bold text-blue-400">{stats?.totals?.opened || 0}</div>
                                            <div className="text-xs text-slate-500 mt-1">Opened</div>
                                        </div>
                                        <div className="p-4 bg-black/30 rounded-xl text-center">
                                            <div className="text-2xl font-bold text-purple-400">{stats?.totals?.clicked || 0}</div>
                                            <div className="text-xs text-slate-500 mt-1">Clicked</div>
                                        </div>
                                        <div className="p-4 bg-black/30 rounded-xl text-center">
                                            <div className="text-2xl font-bold text-red-400">{stats?.totals?.bounced || 0}</div>
                                            <div className="text-xs text-slate-500 mt-1">Bounced</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rate Cards */}
                                <div className="grid md:grid-cols-4 gap-4">
                                    <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/20">
                                        <div className="text-sm text-slate-500 mb-2">Delivery Rate</div>
                                        <div className="text-4xl font-bold text-emerald-400">{deliveryRate.toFixed(1)}%</div>
                                        <div className="text-xs text-slate-400 mt-2">Target: 95%+</div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl border border-blue-500/20">
                                        <div className="text-sm text-slate-500 mb-2">Open Rate</div>
                                        <div className="text-4xl font-bold text-blue-400">{openRate.toFixed(1)}%</div>
                                        <div className="text-xs text-slate-400 mt-2">Industry avg: 20%</div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl border border-purple-500/20">
                                        <div className="text-sm text-slate-500 mb-2">Click Rate</div>
                                        <div className="text-4xl font-bold text-purple-400">{clickRate.toFixed(1)}%</div>
                                        <div className="text-xs text-slate-400 mt-2">Industry avg: 2.5%</div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-2xl border border-amber-500/20">
                                        <div className="text-sm text-slate-500 mb-2">Reply Rate</div>
                                        <div className="text-4xl font-bold text-amber-400">—</div>
                                        <div className="text-xs text-slate-400 mt-2">Coming soon</div>
                                    </div>
                                </div>
                            </div>
                        </FadeInContainer>
                    )}

                    {/* Reputation Tab */}
                    {activeTab === "reputation" && (
                        <FadeInContainer delay={0.15}>
                            <div className="space-y-6">
                                {/* Score Hero */}
                                <div className={`bg-gradient-to-br ${getReputationBg(stats?.reputationScore || 0)} rounded-2xl border border-slate-200 p-8`}>
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                        <div>
                                            <h2 className="text-sm text-slate-500 uppercase tracking-wider mb-2">Sender Reputation Score</h2>
                                            <div className={`text-7xl font-bold ${getReputationColor(stats?.reputationScore || 0)}`}>
                                                {stats?.reputationScore || 0}
                                            </div>
                                            <p className="text-slate-500 mt-2">
                                                {(stats?.reputationScore || 0) >= 90 ? "Excellent - Your emails are highly trusted" :
                                                    (stats?.reputationScore || 0) >= 70 ? "Good - Minor improvements possible" :
                                                        (stats?.reputationScore || 0) >= 50 ? "Fair - Consider improving practices" :
                                                            "Poor - Immediate action needed"}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-black/30 rounded-xl text-center">
                                                <div className="text-2xl font-bold text-emerald-400">{deliveryRate.toFixed(0)}%</div>
                                                <div className="text-xs text-slate-500 mt-1">Deliverability</div>
                                            </div>
                                            <div className="p-4 bg-black/30 rounded-xl text-center">
                                                <div className="text-2xl font-bold text-red-400">{bounceRate.toFixed(2)}%</div>
                                                <div className="text-xs text-slate-500 mt-1">Bounce Rate</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Metrics */}
                                <div className="grid md:grid-cols-5 gap-4">
                                    <div className="p-5 bg-white rounded-xl border border-slate-200 text-center">
                                        <div className="text-2xl font-bold text-emerald-400">{deliveryRate.toFixed(1)}%</div>
                                        <div className="text-xs text-slate-500 mt-1">Delivery</div>
                                        <div className="w-full h-1 bg-slate-50 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${deliveryRate}%` }} />
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white rounded-xl border border-slate-200 text-center">
                                        <div className="text-2xl font-bold text-blue-400">{openRate.toFixed(1)}%</div>
                                        <div className="text-xs text-slate-500 mt-1">Opens</div>
                                        <div className="w-full h-1 bg-slate-50 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(openRate * 2, 100)}%` }} />
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white rounded-xl border border-slate-200 text-center">
                                        <div className="text-2xl font-bold text-purple-400">{clickRate.toFixed(1)}%</div>
                                        <div className="text-xs text-slate-500 mt-1">Clicks</div>
                                        <div className="w-full h-1 bg-slate-50 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(clickRate * 5, 100)}%` }} />
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white rounded-xl border border-slate-200 text-center">
                                        <div className="text-2xl font-bold text-amber-400">{bounceRate.toFixed(2)}%</div>
                                        <div className="text-xs text-slate-500 mt-1">Bounces</div>
                                        <div className="w-full h-1 bg-slate-50 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(bounceRate * 10, 100)}%` }} />
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white rounded-xl border border-slate-200 text-center">
                                        <div className="text-2xl font-bold text-red-400">
                                            {stats?.rates?.complaintRate ? Number(stats.rates.complaintRate).toFixed(3) : 0}%
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">Complaints</div>
                                        <div className="w-full h-1 bg-slate-50 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(Number(stats?.rates?.complaintRate || 0) * 100, 100)}%` }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Tips */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold mb-4">Reputation Tips</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="flex gap-3 p-4 bg-black/30 rounded-xl">
                                            <span className="text-2xl">✅</span>
                                            <div>
                                                <div className="font-medium">Clean Your List</div>
                                                <div className="text-sm text-slate-500">Remove bounced and inactive contacts regularly</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 p-4 bg-black/30 rounded-xl">
                                            <span className="text-2xl">📧</span>
                                            <div>
                                                <div className="font-medium">Warm Up Domains</div>
                                                <div className="text-sm text-slate-500">Gradually increase sending volume for new domains</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 p-4 bg-black/30 rounded-xl">
                                            <span className="text-2xl">🎯</span>
                                            <div>
                                                <div className="font-medium">Personalize Content</div>
                                                <div className="text-sm text-slate-500">Higher engagement = better reputation</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 p-4 bg-black/30 rounded-xl">
                                            <span className="text-2xl">⏰</span>
                                            <div>
                                                <div className="font-medium">Optimal Timing</div>
                                                <div className="text-sm text-slate-500">Send during business hours for better opens</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeInContainer>
                    )}

                    {/* Calls Tab */}
                    {activeTab === "calls" && (
                        <FadeInContainer delay={0.15}>
                            <div className="space-y-6">
                                {/* Call Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl border border-green-500/20">
                                        <div className="text-4xl font-bold text-green-400">{callStats?.today || 0}</div>
                                        <div className="text-sm text-slate-500 mt-2">Calls Today</div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl border border-blue-500/20">
                                        <div className="text-4xl font-bold text-blue-400">{callStats?.week || 0}</div>
                                        <div className="text-sm text-slate-500 mt-2">This Week</div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl border border-purple-500/20">
                                        <div className="text-4xl font-bold text-purple-400">{callStats?.month || 0}</div>
                                        <div className="text-sm text-slate-500 mt-2">This Month</div>
                                    </div>
                                </div>

                                {/* Recent Call Activity */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold mb-4">Recent Call Activity</h3>
                                    {recentActivity === undefined ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-200">
                                            {recentActivity
                                                .filter(a => a.type.includes('call') || a.type.includes('voicemail'))
                                                .slice(0, 10)
                                                .map((activity) => (
                                                    <div key={activity._id} className="py-4 flex items-center gap-4">
                                                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium">
                                                                {activity.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                                            </div>
                                                            {activity.notes && (
                                                                <div className="text-sm text-slate-400 truncate">{activity.notes}</div>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-slate-400">{formatRelativeTime(activity.createdAt)}</div>
                                                    </div>
                                                ))}
                                            {recentActivity.filter(a => a.type.includes('call') || a.type.includes('voicemail')).length === 0 && (
                                                <div className="text-center py-8 text-slate-400">
                                                    <span className="text-4xl block mb-2">📞</span>
                                                    <p>No call activity yet</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
