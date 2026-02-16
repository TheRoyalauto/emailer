"use client";

import { useState } from "react";
import { api } from "@/../convex/_generated/api";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { PageTransition, FadeInContainer } from "@/components/PageTransition";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { Id } from "@/../convex/_generated/dataModel";

type TabKey = "accounts" | "history";

function WarmupPage() {
    const { tier } = useFeatureGate();
    const smtpConfigs = useAuthQuery(api.smtpConfigs.list);
    const warmupSchedules = useAuthQuery(api.warmup.list);
    const warmupStats = useAuthQuery(api.warmup.getStats);
    const recentLogs = useAuthQuery(api.warmupLogs.listRecent, { limit: 100 });

    const startWarmup = useAuthMutation(api.warmup.startWarmup);
    const pauseWarmup = useAuthMutation(api.warmup.pauseWarmup);
    const resumeWarmup = useAuthMutation(api.warmup.resumeWarmup);
    const removeWarmup = useAuthMutation(api.warmup.remove);

    const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>("accounts");

    // Merge SMTP configs (saved email accounts) with their warmup schedules
    const accounts = (smtpConfigs || []).map((config) => {
        const schedule = (warmupSchedules || []).find((s) => s.smtpConfigId === config._id);
        return {
            id: config._id,
            email: config.fromEmail,
            name: config.name,
            displayName: config.fromName || config.name,
            provider: config.provider || "smtp",
            scheduleId: schedule?._id || null,
            status: schedule?.status || ("not_started" as const),
            day: schedule?.currentDay || 0,
            totalDays: schedule?.totalDays || 14,
            currentDaily: schedule?.currentDailyVolume || 0,
            targetDaily: schedule?.targetDailyVolume || 50,
            healthScore: schedule?.healthScore || 0,
            repliesReceived: schedule?.repliesReceived || 0,
            emailsSentToday: schedule?.emailsSentToday || 0,
            totalEmailsSent: schedule?.totalEmailsSent || 0,
        };
    });

    const handleStart = async (smtpConfigId: Id<"smtpConfigs">) => {
        await startWarmup({ smtpConfigId });
    };

    const handleToggle = async (account: typeof accounts[0]) => {
        if (!account.scheduleId) return;
        if (account.status === "warming") {
            await pauseWarmup({ scheduleId: account.scheduleId });
        } else if (account.status === "paused") {
            await resumeWarmup({ scheduleId: account.scheduleId });
        }
    };

    const handleRemove = async (scheduleId: Id<"warmupSchedules">) => {
        await removeWarmup({ scheduleId });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "warming":
                return { label: "Warming Up", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", icon: "🔥", dotColor: "bg-amber-500" };
            case "ready":
                return { label: "Warmed Up", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", icon: "✅", dotColor: "bg-emerald-500" };
            case "paused":
                return { label: "Paused", color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20", icon: "⏸️", dotColor: "bg-slate-400" };
            default:
                return { label: "Not Started", color: "text-slate-400", bg: "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700", icon: "⭕", dotColor: "bg-slate-300" };
        }
    };

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case "resend": return "✉️";
            case "sendgrid": return "📧";
            case "mailgun": return "📬";
            default: return "📤";
        }
    };

    const getHealthColor = (score: number) => {
        if (score >= 80) return "text-emerald-500";
        if (score >= 50) return "text-amber-500";
        return "text-red-500";
    };

    const getHealthBarColor = (score: number) => {
        if (score >= 80) return "from-emerald-500 to-emerald-400";
        if (score >= 50) return "from-amber-500 to-amber-400";
        return "from-red-500 to-red-400";
    };

    const getLogTypeConfig = (type: string, status: string) => {
        if (status === "failed") return { icon: "❌", color: "text-red-500", bg: "bg-red-500/10", label: "Failed" };
        switch (type) {
            case "sent": return { icon: "📤", color: "text-cyan-500", bg: "bg-cyan-500/10", label: "Sent" };
            case "reply_received": return { icon: "💬", color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Reply Received" };
            case "bounced": return { icon: "⚠️", color: "text-amber-500", bg: "bg-amber-500/10", label: "Bounced" };
            case "opened": return { icon: "👁️", color: "text-blue-500", bg: "bg-blue-500/10", label: "Opened" };
            case "health_check": return { icon: "🛡️", color: "text-purple-500", bg: "bg-purple-500/10", label: "Health Check" };
            default: return { icon: "📋", color: "text-slate-400", bg: "bg-slate-500/10", label: type };
        }
    };

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const formatFullTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString("en-US", {
            month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true
        });
    };

    // Group logs by date
    const groupedLogs = (recentLogs || []).reduce((groups, log) => {
        const dateKey = new Date(log.createdAt).toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric",
        });
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(log);
        return groups;
    }, {} as Record<string, typeof recentLogs>);

    // Compute log summary stats
    const logSummary = {
        total: (recentLogs || []).length,
        sent: (recentLogs || []).filter((l) => l.type === "sent" && l.status === "success").length,
        replies: (recentLogs || []).filter((l) => l.type === "reply_received").length,
        bounced: (recentLogs || []).filter((l) => l.type === "bounced").length,
        failed: (recentLogs || []).filter((l) => l.status === "failed").length,
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[var(--bg-primary)] pb-20 md:pb-0">
            <AppHeader />
            <PageTransition>
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <FadeInContainer delay={0}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.02em]">
                                    Email Warmup
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Gradually build sender reputation for your saved email accounts
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {warmupStats && (
                                    <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                                        <span><span className="text-amber-500 font-bold">{warmupStats.warming}</span> warming</span>
                                        <span><span className="text-emerald-500 font-bold">{warmupStats.ready}</span> ready</span>
                                        <span><span className="text-slate-400 font-bold">{warmupStats.paused}</span> paused</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-1 mb-6 w-fit">
                            {([
                                { key: "accounts" as const, label: "Accounts", icon: "📧" },
                                { key: "history" as const, label: "Activity Log", icon: "📋" },
                            ]).map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                        }`}
                                >
                                    <span className="text-sm">{tab.icon}</span>
                                    {tab.label}
                                    {tab.key === "history" && logSummary.total > 0 && (
                                        <span className="ml-1 px-1.5 py-0.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold rounded-full">
                                            {logSummary.total}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {activeTab === "accounts" && (
                            <>
                                {/* How it works banner */}
                                <div className="bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 dark:from-cyan-500/10 dark:via-blue-500/10 dark:to-purple-500/10 rounded-2xl border border-cyan-200/50 dark:border-cyan-800/30 p-6 mb-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20 flex-shrink-0">
                                            🔥
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">How Email Warmup Works</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                We gradually increase your daily email volume over 14 days, simulating real conversations with auto-replies.
                                                This builds Gmail/Outlook trust in your sender domain and keeps you out of spam folders.
                                            </p>
                                            <div className="flex flex-wrap gap-6 mt-4">
                                                {[
                                                    { icon: "📈", label: "Gradual Ramp", desc: "5 → 50 emails/day" },
                                                    { icon: "💬", label: "Auto-Replies", desc: "Real-looking conversations" },
                                                    { icon: "📊", label: "Health Score", desc: "Inbox placement tracking" },
                                                    { icon: "🛡️", label: "Safe Sending", desc: "Auto-pause on issues" },
                                                ].map((item) => (
                                                    <div key={item.label} className="flex items-center gap-2.5">
                                                        <span className="text-lg">{item.icon}</span>
                                                        <div>
                                                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.label}</div>
                                                            <div className="text-[11px] text-slate-400">{item.desc}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Account List */}
                                {smtpConfigs === undefined ? (
                                    <div className="flex justify-center py-16">
                                        <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                    </div>
                                ) : accounts.length === 0 ? (
                                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-5">
                                            📧
                                        </div>
                                        <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-2">
                                            No Email Accounts Connected
                                        </h2>
                                        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                                            Add email accounts in your Account Center to start warming them up.
                                        </p>
                                        <a
                                            href="/settings?tab=email-config"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] transition-all"
                                        >
                                            Connect Email Account →
                                        </a>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {accounts.map((account) => {
                                            const statusConfig = getStatusConfig(account.status);
                                            const isExpanded = expandedAccount === account.id;
                                            const progressPercent = account.totalDays > 0 ? (account.day / account.totalDays) * 100 : 0;

                                            return (
                                                <div
                                                    key={account.id}
                                                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-600"
                                                >
                                                    {/* Main row */}
                                                    <div
                                                        className="flex items-center gap-4 p-5 cursor-pointer"
                                                        onClick={() => setExpandedAccount(isExpanded ? null : account.id)}
                                                    >
                                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-lg font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                            {getProviderIcon(account.provider)}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">{account.displayName || account.name}</span>
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.bg} ${statusConfig.color}`}>
                                                                    <span>{statusConfig.icon}</span>
                                                                    {statusConfig.label}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-400 mt-0.5 truncate">{account.email}</div>
                                                        </div>

                                                        <div className="hidden sm:flex items-center gap-6">
                                                            {account.status !== "not_started" && (
                                                                <>
                                                                    <div className="text-center">
                                                                        <div className="text-xs text-slate-400 font-medium">Day</div>
                                                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{account.day}/{account.totalDays}</div>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <div className="text-xs text-slate-400 font-medium">Daily</div>
                                                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{account.emailsSentToday}/{account.currentDaily}</div>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <div className="text-xs text-slate-400 font-medium">Health</div>
                                                                        <div className={`text-sm font-bold ${getHealthColor(account.healthScore)}`}>{account.healthScore}%</div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className="flex-shrink-0">
                                                            {account.status === "not_started" ? (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleStart(account.id as Id<"smtpConfigs">); }}
                                                                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold rounded-lg hover:shadow-md hover:shadow-cyan-500/20 active:scale-[0.97] transition-all"
                                                                >
                                                                    Start Warmup
                                                                </button>
                                                            ) : (account.status === "warming" || account.status === "paused") ? (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleToggle(account); }}
                                                                    className={`relative w-11 h-[24px] rounded-full transition-all ${account.status === "warming" ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-600"}`}
                                                                >
                                                                    <div className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all ${account.status === "warming" ? "left-[21px]" : "left-[3px]"}`} />
                                                                </button>
                                                            ) : (
                                                                <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-lg">✅ Ready</span>
                                                            )}
                                                        </div>

                                                        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>

                                                    {/* Expanded details */}
                                                    {isExpanded && (
                                                        <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-5 space-y-5">
                                                            {account.status === "not_started" ? (
                                                                <div className="text-center py-6">
                                                                    <div className="text-3xl mb-3">🚀</div>
                                                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Ready to Warm Up</h3>
                                                                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                                                                        Click &quot;Start Warmup&quot; to begin the 14-day automated warmup process.
                                                                        We&apos;ll gradually increase your sending volume while monitoring deliverability.
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div>
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="text-xs font-semibold text-slate-500">Warmup Progress</span>
                                                                            <span className="text-xs font-semibold text-slate-900 dark:text-white">Day {account.day} of {account.totalDays}</span>
                                                                        </div>
                                                                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                                        {[
                                                                            { label: "Sent Today", value: account.emailsSentToday, icon: "📤" },
                                                                            { label: "Total Sent", value: account.totalEmailsSent, icon: "📊" },
                                                                            { label: "Auto-Replies", value: account.repliesReceived, icon: "💬" },
                                                                            { label: "Health Score", value: `${account.healthScore}%`, icon: "🛡️" },
                                                                        ].map((stat) => (
                                                                            <div key={stat.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                                    <span className="text-sm">{stat.icon}</span>
                                                                                    <span className="text-[11px] text-slate-400 font-medium">{stat.label}</span>
                                                                                </div>
                                                                                <div className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="text-xs font-semibold text-slate-500">Inbox Placement Health</span>
                                                                            <span className={`text-sm font-bold ${getHealthColor(account.healthScore)}`}>
                                                                                {account.healthScore >= 80 ? "Excellent" : account.healthScore >= 50 ? "Fair" : "Low"}
                                                                            </span>
                                                                        </div>
                                                                        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                            <div className={`h-full bg-gradient-to-r ${getHealthBarColor(account.healthScore)} rounded-full transition-all duration-700`} style={{ width: `${account.healthScore}%` }} />
                                                                        </div>
                                                                    </div>

                                                                    {(account.status === "ready" || account.status === "paused") && account.scheduleId && (
                                                                        <div className="flex items-center gap-3 pt-2">
                                                                            {account.status === "paused" && (
                                                                                <button onClick={() => handleToggle(account)} className="px-4 py-2 bg-cyan-500/10 text-cyan-500 text-xs font-semibold rounded-lg hover:bg-cyan-500/20 transition-colors">Resume Warmup</button>
                                                                            )}
                                                                            <button onClick={() => handleStart(account.id as Id<"smtpConfigs">)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Restart Warmup</button>
                                                                            <button onClick={() => handleRemove(account.scheduleId!)} className="px-4 py-2 bg-red-500/10 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-500/20 transition-colors">Remove</button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === "history" && (
                            <>
                                {/* Log summary stats */}
                                {logSummary.total > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                                        {[
                                            { label: "Total Events", value: logSummary.total, icon: "📋", color: "text-slate-900 dark:text-white" },
                                            { label: "Sent", value: logSummary.sent, icon: "📤", color: "text-cyan-500" },
                                            { label: "Replies", value: logSummary.replies, icon: "💬", color: "text-emerald-500" },
                                            { label: "Bounced", value: logSummary.bounced, icon: "⚠️", color: "text-amber-500" },
                                            { label: "Failed", value: logSummary.failed, icon: "❌", color: "text-red-500" },
                                        ].map((stat) => (
                                            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span>{stat.icon}</span>
                                                    <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                                                </div>
                                                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Log timeline */}
                                {recentLogs === undefined ? (
                                    <div className="flex justify-center py-16">
                                        <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                    </div>
                                ) : (recentLogs || []).length === 0 ? (
                                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-5">
                                            📋
                                        </div>
                                        <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-2">
                                            No Activity Yet
                                        </h2>
                                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                                            Once warmup starts sending emails, every action will be logged here for full transparency.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.entries(groupedLogs).map(([dateKey, logs]) => (
                                            <div key={dateKey}>
                                                {/* Date header */}
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{dateKey}</div>
                                                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                                    <div className="text-[10px] text-slate-400 font-medium">{logs!.length} events</div>
                                                </div>

                                                {/* Log entries */}
                                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                                                    {logs!.map((log) => {
                                                        const typeConfig = getLogTypeConfig(log.type, log.status);
                                                        // Find account name for this log
                                                        const accountConfig = (smtpConfigs || []).find((c) => c._id === log.smtpConfigId);
                                                        const accountLabel = accountConfig?.fromEmail || accountConfig?.name || "Unknown";

                                                        return (
                                                            <div key={log._id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                                {/* Type icon */}
                                                                <div className={`w-9 h-9 rounded-lg ${typeConfig.bg} flex items-center justify-center text-base flex-shrink-0`}>
                                                                    {typeConfig.icon}
                                                                </div>

                                                                {/* Details */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`text-xs font-semibold ${typeConfig.color}`}>{typeConfig.label}</span>
                                                                        <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                                                                        <span className="text-xs text-slate-400 truncate">Day {log.day}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-medium">
                                                                            {log.recipientEmail}
                                                                        </span>
                                                                        {log.subject && (
                                                                            <>
                                                                                <span className="text-[10px] text-slate-300 dark:text-slate-600">—</span>
                                                                                <span className="text-[11px] text-slate-400 truncate">{log.subject}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    {log.error && (
                                                                        <div className="text-[11px] text-red-400 mt-0.5 truncate">{log.error}</div>
                                                                    )}
                                                                </div>

                                                                {/* Account badge */}
                                                                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md flex-shrink-0">
                                                                    <span className="text-[10px]">📧</span>
                                                                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{accountLabel}</span>
                                                                </div>

                                                                {/* Timestamp */}
                                                                <div className="text-right flex-shrink-0">
                                                                    <div className="text-[11px] text-slate-400 font-medium">{formatTime(log.createdAt)}</div>
                                                                    <div className="text-[10px] text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">{formatFullTime(log.createdAt)}</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </FadeInContainer>
                </main>
            </PageTransition>
        </div>
    );
}

export default function WarmupPageWrapper() {
    return (
        <AuthGuard>
            <WarmupPage />
        </AuthGuard>
    );
}
