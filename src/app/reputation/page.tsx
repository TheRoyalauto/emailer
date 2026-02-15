"use client";

import { api } from "@/../convex/_generated/api";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { useAuthQuery } from "../../hooks/useAuthConvex";

function ReputationPage() {
    const stats = useAuthQuery(api.sequenceScheduler.getReputationStats, { days: 30 });

    const getReputationColor = (score: number) => {
        if (score >= 80) return "text-green-400";
        if (score >= 60) return "text-yellow-400";
        return "text-red-400";
    };

    const getReputationLabel = (score: number) => {
        if (score >= 90) return "Excellent";
        if (score >= 80) return "Good";
        if (score >= 60) return "Fair";
        if (score >= 40) return "Poor";
        return "Critical";
    };

    const getRateColor = (rate: string, type: "good" | "bad") => {
        const value = parseFloat(rate);
        if (type === "good") {
            if (value >= 50) return "text-green-400";
            if (value >= 20) return "text-yellow-400";
            return "text-red-400";
        } else {
            if (value < 2) return "text-green-400";
            if (value < 5) return "text-yellow-400";
            return "text-red-400";
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Domain Reputation
                    </h1>
                    <p className="text-slate-500 mt-1">Monitor your email deliverability and sender reputation</p>
                </div>

                {stats === undefined ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : !stats ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                        <div className="text-5xl mb-4">📊</div>
                        <h2 className="text-xl font-semibold mb-2">No Data Yet</h2>
                        <p className="text-slate-500">Start sending emails to see your reputation stats</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Reputation Score */}
                        <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] rounded-2xl border border-slate-200 p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm text-slate-500 uppercase tracking-wider mb-2">Reputation Score</h2>
                                    <div className={`text-6xl font-bold ${getReputationColor(stats.reputationScore)}`}>
                                        {stats.reputationScore}
                                    </div>
                                    <div className={`text-lg mt-1 ${getReputationColor(stats.reputationScore)}`}>
                                        {getReputationLabel(stats.reputationScore)}
                                    </div>
                                </div>
                                <div className="text-right text-slate-500 text-sm">
                                    <div>Last 30 days</div>
                                    <div className="text-2xl text-white mt-1">{stats.totals.sent.toLocaleString()}</div>
                                    <div>emails sent</div>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <div className="text-sm text-slate-500 mb-1">Delivery Rate</div>
                                <div className={`text-2xl font-bold ${getRateColor(stats.rates.deliveryRate, "good")}`}>
                                    {stats.rates.deliveryRate}%
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    {stats.totals.delivered.toLocaleString()} delivered
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <div className="text-sm text-slate-500 mb-1">Open Rate</div>
                                <div className={`text-2xl font-bold ${getRateColor(stats.rates.openRate, "good")}`}>
                                    {stats.rates.openRate}%
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    {stats.totals.opened.toLocaleString()} opened
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <div className="text-sm text-slate-500 mb-1">Click Rate</div>
                                <div className={`text-2xl font-bold ${getRateColor(stats.rates.clickRate, "good")}`}>
                                    {stats.rates.clickRate}%
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    {stats.totals.clicked.toLocaleString()} clicked
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <div className="text-sm text-slate-500 mb-1">Bounce Rate</div>
                                <div className={`text-2xl font-bold ${getRateColor(stats.rates.bounceRate, "bad")}`}>
                                    {stats.rates.bounceRate}%
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    {stats.totals.bounced.toLocaleString()} bounced
                                </div>
                            </div>
                        </div>

                        {/* Warning Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`bg-white rounded-xl border p-5 ${parseFloat(stats.rates.complaintRate) > 0.1
                                    ? "border-red-500/50"
                                    : "border-slate-200"
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-slate-500 mb-1">Spam Complaints</div>
                                        <div className={`text-2xl font-bold ${parseFloat(stats.rates.complaintRate) > 0.1
                                                ? "text-red-400"
                                                : "text-green-400"
                                            }`}>
                                            {stats.rates.complaintRate}%
                                        </div>
                                    </div>
                                    {parseFloat(stats.rates.complaintRate) > 0.1 && (
                                        <div className="text-red-400 text-3xl">⚠️</div>
                                    )}
                                </div>
                                <div className="text-xs text-slate-400 mt-2">
                                    Target: &lt;0.1% | {stats.totals.complained} complaints
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <div className="text-sm text-slate-500 mb-1">Unsubscribes</div>
                                <div className="text-2xl font-bold text-white">
                                    {stats.totals.unsubscribed}
                                </div>
                                <div className="text-xs text-slate-400 mt-2">
                                    Opt-outs from all campaigns
                                </div>
                            </div>
                        </div>

                        {/* Guidelines */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-semibold mb-4">📋 Deliverability Best Practices</h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-slate-700">Keep bounce rate under 2%</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-slate-700">Keep complaint rate under 0.1%</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-slate-700">Verify emails before sending</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-slate-700">Include clear unsubscribe link</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-slate-700">Set up SPF, DKIM, DMARC</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-slate-700">Warm up new sending domains</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ReputationWrapper() {
    return (
        <AuthGuard>
            <ReputationPage />
        </AuthGuard>
    );
}
