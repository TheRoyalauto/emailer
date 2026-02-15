"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { useAuthQuery } from "../../hooks/useAuthConvex";

function DashboardPage() {
    // Core queries
    const contacts = useAuthQuery(api.contacts.list, {});
    const templates = useAuthQuery(api.templates.list, {});
    const campaigns = useAuthQuery(api.campaigns.list);
    const recentActivity = useAuthQuery(api.activities.getRecentActivity, { limit: 5 });

    // Chart state
    const [timeRange, setTimeRange] = useState<"LIVE" | "1D" | "1W" | "1M" | "3M" | "YTD" | "1Y" | "ALL">("LIVE");
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isHovering, setIsHovering] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);

    // Fetch real chart data based on time range
    const getDays = () => {
        switch (timeRange) {
            case "LIVE": return 1;
            case "1D": return 1;
            case "1W": return 7;
            case "1M": return 30;
            case "3M": return 90;
            case "YTD": return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24));
            case "1Y": return 365;
            case "ALL": return 730;
            default: return 30;
        }
    };
    const days = getDays();
    const isLive = timeRange === "LIVE";
    const chartDataRaw = useAuthQuery(api.analytics.getChartData, { days, isLive });

    // Use real data or empty array
    const chartData = useMemo(() => {
        if (!chartDataRaw || chartDataRaw.length === 0) {
            return [];
        }
        return chartDataRaw;
    }, [chartDataRaw]);

    // Simple stats
    const totalContacts = contacts?.length || 0;
    const totalTemplates = templates?.length || 0;
    const totalCampaigns = campaigns?.length || 0;
    const activeCampaigns = campaigns?.filter(c => c.status === "sending" || c.status === "scheduled")?.length || 0;

    // Chart calculations
    const totalEmailsSent = chartData.length > 0 ? chartData[chartData.length - 1]?.emailsSent || 0 : 0;
    const hasData = totalEmailsSent > 0;
    const maxValue = hasData ? Math.max(...chartData.map(d => d.emailsSent), 1) * 1.1 : 100;
    const points = hasData ? chartData.map((d, i) => ({
        x: (i / (chartData.length - 1)) * 100,
        y: 100 - (d.emailsSent / maxValue) * 100,
    })) : [];
    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    // Hover logic
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!chartRef.current || chartData.length === 0) return;
        const rect = chartRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const index = Math.round(percentage * (chartData.length - 1));
        setActiveIndex(index);
    }, [chartData.length]);

    // Current display value
    const displayData = activeIndex !== null && chartData[activeIndex] ? chartData[activeIndex] : chartData[chartData.length - 1];
    const previousData = activeIndex !== null && activeIndex > 0 && chartData[activeIndex - 1] ? chartData[activeIndex - 1] : chartData[chartData.length - 2];
    const currentValue = displayData?.emailsSent || 0;
    const previousValue = previousData?.emailsSent || 0;
    const change = currentValue - previousValue;
    const changePercent = previousValue > 0 ? ((change / previousValue) * 100).toFixed(1) : "0";

    const formatRelativeTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section with Chart */}
                <div className="relative mb-8 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-sky-500/5" />

                    <div className="relative p-6 md:p-8">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-slate-500 text-sm font-medium">Emails Sent</p>
                                    {isLive && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-xs text-emerald-500 font-semibold">LIVE</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl md:text-5xl font-bold font-heading text-slate-900 tracking-[-0.04em]">
                                        {currentValue.toLocaleString()}
                                    </span>
                                    {hasData && change !== 0 && (
                                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${change >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"}`}>
                                            {change >= 0 ? "+" : ""}{change} ({changePercent}%)
                                        </span>
                                    )}
                                </div>
                                {/* Fixed height date row */}
                                <p className={`text-slate-400 text-sm mt-1 h-5 ${activeIndex !== null && displayData ? 'opacity-100' : 'opacity-0'}`}>
                                    {displayData?.date || '\u00A0'}
                                </p>
                            </div>
                        </div>

                        {/* Interactive Chart */}
                        <div
                            ref={chartRef}
                            className="relative h-40 md:h-48"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => { setIsHovering(false); setActiveIndex(null); }}
                            onMouseMove={handleMouseMove}
                        >
                            {hasData ? (
                                <>
                                    {/* SVG Chart */}
                                    <svg
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="none"
                                        className="w-full h-full cursor-crosshair"
                                    >
                                        <defs>
                                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#06B6D4" />
                                                <stop offset="100%" stopColor="#0EA5E9" />
                                            </linearGradient>
                                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Area fill */}
                                        <path
                                            d={`${pathD} L 100 100 L 0 100 Z`}
                                            fill="url(#areaGradient)"
                                        />

                                        {/* Line */}
                                        <path
                                            d={pathD}
                                            fill="none"
                                            stroke="url(#lineGradient)"
                                            strokeWidth="0.5"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    </svg>

                                    {/* Hover Indicator */}
                                    {isHovering && activeIndex !== null && points[activeIndex] && (
                                        <>
                                            {/* Vertical Line */}
                                            <div
                                                className="absolute top-0 bottom-0 w-px bg-cyan-500/50 pointer-events-none transition-all duration-75"
                                                style={{ left: `${points[activeIndex].x}%` }}
                                            />
                                            {/* Dot */}
                                            <div
                                                className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-cyan-500 border-2 border-white shadow-lg shadow-cyan-500/30 pointer-events-none transition-all duration-75"
                                                style={{
                                                    left: `${points[activeIndex].x}%`,
                                                    top: `${points[activeIndex].y}%`
                                                }}
                                            />
                                        </>
                                    )}
                                </>
                            ) : (
                                /* Premium Empty State */
                                <div className="relative h-full">
                                    <svg
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="none"
                                        className="w-full h-full opacity-30"
                                    >
                                        <defs>
                                            <linearGradient id="placeholderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#06B6D4" />
                                                <stop offset="100%" stopColor="#0EA5E9" />
                                            </linearGradient>
                                            <linearGradient id="placeholderAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>

                                        <path
                                            d="M 0 85 Q 10 80 15 75 T 25 70 T 35 65 T 45 55 T 55 50 T 65 40 T 75 35 T 85 25 T 100 20 L 100 100 L 0 100 Z"
                                            fill="url(#placeholderAreaGradient)"
                                        />
                                        <path
                                            d="M 0 85 Q 10 80 15 75 T 25 70 T 35 65 T 45 55 T 55 50 T 65 40 T 75 35 T 85 25 T 100 20"
                                            fill="none"
                                            stroke="url(#placeholderGradient)"
                                            strokeWidth="0.5"
                                            vectorEffect="non-scaling-stroke"
                                            className="animate-pulse"
                                        />
                                    </svg>

                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <div className="w-12 h-12 mb-3 rounded-full bg-cyan-50 border border-cyan-200/50 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-900 font-semibold font-heading">Ready to grow</p>
                                        <p className="text-sm text-slate-400 mt-1">Send your first campaign to track growth</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex items-center justify-center gap-1 mt-4 pt-4 border-t border-slate-200">
                            {(["LIVE", "1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${timeRange === range
                                        ? "bg-slate-900 text-white shadow-md"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Link href="/contacts" className="group">
                        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-cyan-300 transition-all duration-200 hover:-translate-y-1">
                            <div className="text-3xl font-bold font-heading text-cyan-500 group-hover:scale-105 transition-transform tracking-[-0.04em]">
                                {totalContacts}
                            </div>
                            <div className="text-sm text-slate-400 font-medium">Contacts</div>
                        </div>
                    </Link>
                    <Link href="/campaigns" className="group">
                        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-200 hover:-translate-y-1">
                            <div className="text-3xl font-bold font-heading text-emerald-500 group-hover:scale-105 transition-transform tracking-[-0.04em]">
                                {activeCampaigns}
                            </div>
                            <div className="text-sm text-slate-400 font-medium">Active Campaigns</div>
                        </div>
                    </Link>
                    <Link href="/campaigns" className="group">
                        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-sky-300 transition-all duration-200 hover:-translate-y-1">
                            <div className="text-3xl font-bold font-heading text-sky-500 group-hover:scale-105 transition-transform tracking-[-0.04em]">
                                {totalCampaigns}
                            </div>
                            <div className="text-sm text-slate-400 font-medium">Total Campaigns</div>
                        </div>
                    </Link>
                    <Link href="/templates" className="group">
                        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-violet-300 transition-all duration-200 hover:-translate-y-1">
                            <div className="text-3xl font-bold font-heading text-violet-500 group-hover:scale-105 transition-transform tracking-[-0.04em]">
                                {totalTemplates}
                            </div>
                            <div className="text-sm text-slate-400 font-medium">Templates</div>
                        </div>
                    </Link>
                </div>

                {/* Two Column Layout */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-xl font-bold font-heading text-slate-900 mb-5 tracking-[-0.03em]">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                href="/campaigns"
                                className="flex items-center gap-4 p-4 rounded-xl bg-cyan-50/50 hover:bg-cyan-50 border border-cyan-100 transition-all duration-200 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center shadow-lg shadow-sm group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">New Campaign</div>
                                    <div className="text-sm text-slate-400">Send emails to your contacts</div>
                                </div>
                            </Link>
                            <Link
                                href="/scraper"
                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all duration-200 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">Find Leads</div>
                                    <div className="text-sm text-slate-400">Discover new business contacts</div>
                                </div>
                            </Link>
                            <Link
                                href="/contacts"
                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all duration-200 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">Add Contacts</div>
                                    <div className="text-sm text-slate-400">Import or add manually</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold font-heading text-slate-900 tracking-[-0.03em]">Recent Activity</h2>
                        </div>

                        {recentActivity === undefined ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                                    <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
                                    </svg>
                                </div>
                                <p className="text-slate-500 font-medium">No activity yet</p>
                                <p className="text-sm text-slate-400 mt-1">Start a campaign to see activity here</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity._id}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                {activity.type === "email_sent" ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
                                                )}
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm truncate">
                                                <span className="font-semibold text-slate-900">
                                                    {activity.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                                {activity.contact && (
                                                    <span className="text-slate-400 ml-2">
                                                        • {activity.contact.name || activity.contact.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400 font-medium">
                                            {formatRelativeTime(activity.createdAt)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DashboardPageWrapper() {
    return (
        <AuthGuard>
            <DashboardPage />
        </AuthGuard>
    );
}
