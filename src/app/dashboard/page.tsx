"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";

// Generate sample data for the chart (would come from real data in production)
function generateChartData(days: number) {
    const data = [];
    const now = Date.now();
    let emailsSent = Math.floor(Math.random() * 50);

    for (let i = days; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        emailsSent += Math.floor(Math.random() * 20);
        data.push({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            timestamp: date.getTime(),
            emailsSent,
            opens: Math.floor(emailsSent * (0.2 + Math.random() * 0.3)),
            clicks: Math.floor(emailsSent * (0.05 + Math.random() * 0.1)),
        });
    }
    return data;
}

function DashboardPage() {
    // Core queries
    const contacts = useQuery(api.contacts.list, {});
    const templates = useQuery(api.templates.list, {});
    const campaigns = useQuery(api.campaigns.list);
    const recentActivity = useQuery(api.activities.getRecentActivity, { limit: 5 });

    // Chart state
    const [timeRange, setTimeRange] = useState<"1W" | "1M" | "3M" | "ALL">("1M");
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isHovering, setIsHovering] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);

    // Generate chart data based on time range
    const chartData = useMemo(() => {
        const days = timeRange === "1W" ? 7 : timeRange === "1M" ? 30 : timeRange === "3M" ? 90 : 180;
        return generateChartData(days);
    }, [timeRange]);

    // Simple stats
    const totalContacts = contacts?.length || 0;
    const totalTemplates = templates?.length || 0;
    const totalCampaigns = campaigns?.length || 0;
    const activeCampaigns = campaigns?.filter(c => c.status === "sending" || c.status === "scheduled")?.length || 0;

    // Chart calculations
    const maxValue = Math.max(...chartData.map(d => d.emailsSent)) * 1.1;
    const points = chartData.map((d, i) => ({
        x: (i / (chartData.length - 1)) * 100,
        y: 100 - (d.emailsSent / maxValue) * 100,
    }));
    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    // Hover logic
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!chartRef.current) return;
        const rect = chartRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const index = Math.round(percentage * (chartData.length - 1));
        setActiveIndex(index);
    }, [chartData.length]);

    // Current display value
    const displayData = activeIndex !== null ? chartData[activeIndex] : chartData[chartData.length - 1];
    const previousData = activeIndex !== null && activeIndex > 0 ? chartData[activeIndex - 1] : chartData[chartData.length - 2];
    const change = displayData && previousData ? displayData.emailsSent - previousData.emailsSent : 0;
    const changePercent = previousData?.emailsSent ? ((change / previousData.emailsSent) * 100).toFixed(1) : "0";

    const formatRelativeTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section with Chart */}
                <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-[#12121f] to-[#16162a] border border-white/10">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.1),transparent_50%)]" />

                    <div className="relative p-6 md:p-8">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <p className="text-white/50 text-sm mb-1">Emails Sent</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                        {displayData?.emailsSent?.toLocaleString() || 0}
                                    </span>
                                    <span className={`text-sm font-medium ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {change >= 0 ? "+" : ""}{change} ({changePercent}%)
                                    </span>
                                </div>
                                {activeIndex !== null && (
                                    <p className="text-white/40 text-sm mt-1">{displayData?.date}</p>
                                )}
                            </div>

                            {/* Time Range Toggle */}
                            <div className="flex bg-black/30 rounded-lg p-1 border border-white/10">
                                {(["1W", "1M", "3M", "ALL"] as const).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${timeRange === range
                                                ? "bg-indigo-500/30 text-indigo-300"
                                                : "text-white/40 hover:text-white/60"
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interactive Chart */}
                        <div
                            ref={chartRef}
                            className="relative h-40 md:h-48 cursor-crosshair"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => { setIsHovering(false); setActiveIndex(null); }}
                            onMouseMove={handleMouseMove}
                        >
                            {/* SVG Chart */}
                            <svg
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                className="w-full h-full"
                            >
                                <defs>
                                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
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
                                        className="absolute top-0 bottom-0 w-px bg-white/30 pointer-events-none transition-all duration-75"
                                        style={{ left: `${points[activeIndex].x}%` }}
                                    />
                                    {/* Dot */}
                                    <div
                                        className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-indigo-500 border-2 border-white shadow-lg shadow-indigo-500/50 pointer-events-none transition-all duration-75"
                                        style={{
                                            left: `${points[activeIndex].x}%`,
                                            top: `${points[activeIndex].y}%`
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Link href="/contacts" className="group">
                        <div className="p-5 bg-gradient-to-br from-[#12121f] to-[#16162a] rounded-xl border border-white/10 hover:border-indigo-500/30 transition-all hover:-translate-y-1">
                            <div className="text-3xl font-bold text-indigo-400 group-hover:scale-105 transition-transform">
                                {totalContacts}
                            </div>
                            <div className="text-sm text-white/50">Contacts</div>
                        </div>
                    </Link>
                    <Link href="/campaigns" className="group">
                        <div className="p-5 bg-gradient-to-br from-[#12121f] to-[#16162a] rounded-xl border border-white/10 hover:border-green-500/30 transition-all hover:-translate-y-1">
                            <div className="text-3xl font-bold text-green-400 group-hover:scale-105 transition-transform">
                                {activeCampaigns}
                            </div>
                            <div className="text-sm text-white/50">Active Campaigns</div>
                        </div>
                    </Link>
                    <Link href="/campaigns" className="group">
                        <div className="p-5 bg-gradient-to-br from-[#12121f] to-[#16162a] rounded-xl border border-white/10 hover:border-amber-500/30 transition-all hover:-translate-y-1">
                            <div className="text-3xl font-bold text-amber-400 group-hover:scale-105 transition-transform">
                                {totalCampaigns}
                            </div>
                            <div className="text-sm text-white/50">Total Campaigns</div>
                        </div>
                    </Link>
                    <Link href="/templates" className="group">
                        <div className="p-5 bg-gradient-to-br from-[#12121f] to-[#16162a] rounded-xl border border-white/10 hover:border-purple-500/30 transition-all hover:-translate-y-1">
                            <div className="text-3xl font-bold text-purple-400 group-hover:scale-105 transition-transform">
                                {totalTemplates}
                            </div>
                            <div className="text-sm text-white/50">Templates</div>
                        </div>
                    </Link>
                </div>

                {/* Two Column Layout */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <div className="bg-[#12121f] rounded-xl border border-white/10 p-6">
                        <h2 className="text-xl font-semibold mb-5">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                href="/campaigns"
                                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/20 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                    🚀
                                </div>
                                <div>
                                    <div className="font-medium">New Campaign</div>
                                    <div className="text-sm text-white/40">Send emails to your contacts</div>
                                </div>
                            </Link>
                            <Link
                                href="/scraper"
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                    🔎
                                </div>
                                <div>
                                    <div className="font-medium">Find Leads</div>
                                    <div className="text-sm text-white/40">Discover new business contacts</div>
                                </div>
                            </Link>
                            <Link
                                href="/contacts"
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                    ➕
                                </div>
                                <div>
                                    <div className="font-medium">Add Contacts</div>
                                    <div className="text-sm text-white/40">Import or add manually</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-[#12121f] rounded-xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-semibold">Recent Activity</h2>
                        </div>

                        {recentActivity === undefined ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-3xl">
                                    📭
                                </div>
                                <p className="text-white/40">No activity yet</p>
                                <p className="text-sm text-white/30 mt-1">Start a campaign to see activity here</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity._id}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                                            {activity.type === "email_sent" ? "📧" :
                                                activity.type === "status_changed" ? "🔄" : "📌"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm truncate">
                                                <span className="font-medium">
                                                    {activity.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                                {activity.contact && (
                                                    <span className="text-white/50 ml-2">
                                                        • {activity.contact.name || activity.contact.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs text-white/30">
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
