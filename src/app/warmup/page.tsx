"use client";

import { api } from "@/../convex/_generated/api";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { PageTransition, FadeInContainer } from "@/components/PageTransition";
import { useAuthQuery } from "../../hooks/useAuthConvex";

function SendingLimitsPage() {
    const accounts = useAuthQuery(api.warmup.getAllSendLimits);
    const stats = useAuthQuery(api.warmup.getThrottleStats);
    const recentLogs = useAuthQuery(api.warmupLogs.listRecent, { limit: 50 });

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case "resend": return "✉️";
            case "sendgrid": return "📧";
            case "mailgun": return "📬";
            default: return "📤";
        }
    };

    const getRampColor = (day: number, rampDays: number) => {
        const progress = day / rampDays;
        if (progress >= 1) return { bar: "from-emerald-500 to-emerald-400", text: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" };
        if (progress >= 0.5) return { bar: "from-cyan-500 to-blue-500", text: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/20" };
        return { bar: "from-amber-500 to-amber-400", text: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" };
    };

    const getLogTypeConfig = (type: string, status: string) => {
        if (status === "failed") return { icon: "❌", color: "text-red-500", bg: "bg-red-500/10" };
        switch (type) {
            case "sent": return { icon: "📤", color: "text-cyan-500", bg: "bg-cyan-500/10" };
            case "reply_received": return { icon: "💬", color: "text-emerald-500", bg: "bg-emerald-500/10" };
            case "bounced": return { icon: "⚠️", color: "text-amber-500", bg: "bg-amber-500/10" };
            case "opened": return { icon: "👁️", color: "text-blue-500", bg: "bg-blue-500/10" };
            default: return { icon: "📋", color: "text-slate-400", bg: "bg-slate-500/10" };
        }
    };

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Build ramp schedule display
    const RAMP = [5, 8, 12, 16, 20, 25, 30, 35, 40, 50, 65, 80, 100, 150];

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
                                    Sending Limits
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Reputation Guard — fresh accounts ramp gradually to protect deliverability
                                </p>
                            </div>
                            {stats && (
                                <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                                    <span><span className="text-amber-500 font-bold">{stats.ramping}</span> ramping</span>
                                    <span><span className="text-emerald-500 font-bold">{stats.unlimited}</span> unlimited</span>
                                    <span><span className="text-cyan-500 font-bold">{stats.totalSentToday}</span> sent today</span>
                                </div>
                            )}
                        </div>

                        {/* How it works */}
                        <div className="bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 dark:from-cyan-500/10 dark:via-blue-500/10 dark:to-purple-500/10 rounded-2xl border border-cyan-200/50 dark:border-cyan-800/30 p-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20 flex-shrink-0">
                                    🛡️
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">How Reputation Guard Works</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                                        New email accounts start with low daily send limits that automatically increase over 14 days.
                                        This prevents spam flags and builds trust with email providers like Gmail and Outlook.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {RAMP.map((limit, i) => (
                                            <div key={i} className="flex flex-col items-center px-2 py-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                                <span className="text-[10px] text-slate-400 font-medium">Day {i + 1}</span>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{limit}</span>
                                            </div>
                                        ))}
                                        <div className="flex flex-col items-center px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                                            <span className="text-[10px] text-emerald-500 font-medium">Day 15+</span>
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">∞</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account list */}
                        {accounts === undefined ? (
                            <div className="flex justify-center py-16">
                                <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
                            </div>
                        ) : accounts.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-5">📧</div>
                                <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-2">No Email Accounts</h2>
                                <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">Add email accounts in your Account Center to see their sending limits.</p>
                                <a href="/settings?tab=email-config" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] transition-all">
                                    Connect Email Account →
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-3 mb-10">
                                {accounts.map((account) => {
                                    const rampColor = getRampColor(account.day, account.rampDays);
                                    const usagePercent = account.dailyLimit
                                        ? Math.min(100, Math.round((account.sentToday / account.dailyLimit) * 100))
                                        : 0;

                                    return (
                                        <div key={account.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                            <div className="flex items-center gap-4 p-5">
                                                {/* Icon */}
                                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                                                    {getProviderIcon(account.provider)}
                                                </div>

                                                {/* Account info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">{account.name}</span>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${rampColor.bg} ${rampColor.text}`}>
                                                            {account.isRamping ? (
                                                                <>🔥 Day {account.day + 1}/{account.rampDays}</>
                                                            ) : (
                                                                <>✅ Unlimited</>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 truncate">{account.email}</div>
                                                </div>

                                                {/* Stats */}
                                                <div className="hidden sm:flex items-center gap-6">
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 font-medium">Today</div>
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {account.sentToday}
                                                            {account.dailyLimit && <span className="text-slate-400 font-normal">/{account.dailyLimit}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 font-medium">Remaining</div>
                                                        <div className={`text-sm font-bold ${account.isRamping ? (account.remaining > 0 ? "text-cyan-500" : "text-red-500") : "text-emerald-500"}`}>
                                                            {account.isRamping ? account.remaining : "∞"}
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 font-medium">Limit</div>
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {account.dailyLimit || "∞"}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Usage bar */}
                                                <div className="w-24 flex-shrink-0 hidden md:block">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] text-slate-400">{usagePercent}%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${rampColor.bar} rounded-full transition-all duration-500`}
                                                            style={{ width: `${usagePercent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Ramp progress (only for ramping accounts) */}
                                            {account.isRamping && (
                                                <div className="px-5 pb-4 -mt-1">
                                                    <div className="flex items-center gap-1.5">
                                                        {RAMP.map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`flex-1 h-1 rounded-full transition-all ${i <= account.day
                                                                        ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                                                                        : "bg-slate-100 dark:bg-slate-800"
                                                                    }`}
                                                            />
                                                        ))}
                                                        <div className={`flex-1 h-1 rounded-full ${account.day >= RAMP.length ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800"}`} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Recent activity */}
                        {(recentLogs || []).length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <span>📋</span> Recent Send Activity
                                </h2>
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                                    {(recentLogs || []).slice(0, 20).map((log) => {
                                        const typeConfig = getLogTypeConfig(log.type, log.status);
                                        const acct = (accounts || []).find((a) => a.id === log.smtpConfigId);

                                        return (
                                            <div key={log._id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <div className={`w-8 h-8 rounded-lg ${typeConfig.bg} flex items-center justify-center text-sm flex-shrink-0`}>
                                                    {typeConfig.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate block">{log.recipientEmail}</span>
                                                    {log.subject && <span className="text-[11px] text-slate-400 truncate block">{log.subject}</span>}
                                                </div>
                                                {acct && (
                                                    <span className="hidden sm:inline text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                                        {acct.email}
                                                    </span>
                                                )}
                                                <span className="text-[11px] text-slate-400 flex-shrink-0">{formatTime(log.createdAt)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
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
            <SendingLimitsPage />
        </AuthGuard>
    );
}
