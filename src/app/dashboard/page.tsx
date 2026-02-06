"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";

function DashboardPage() {
    // Core queries
    const contacts = useQuery(api.contacts.list, {});
    const templates = useQuery(api.templates.list, {});
    const campaigns = useQuery(api.campaigns.list);
    const recentActivity = useQuery(api.activities.getRecentActivity, { limit: 5 });

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
    const chartDataRaw = useQuery(api.analytics.getChartData, { days, isLive });

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
        <div className="min-h-screen bg-[#F8F9FC] pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section with Chart */}
                <div className="relative mb-8 rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B4A]/5 to-[#0EA5E9]/5" />

                    <div className="relative p-6 md:p-8">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-[#4B5563] text-sm font-medium">Emails Sent</p>
                                    {isLive && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                                            </span>
                                            <span className="text-xs text-[#10B981] font-semibold">LIVE</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl md:text-5xl font-bold text-gradient">
                                        {currentValue.toLocaleString()}
                                    </span>
                                    {hasData && change !== 0 && (
                                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${change >= 0 ? "text-[#10B981] bg-[#ECFDF5]" : "text-[#EF4444] bg-[#FEF2F2]"}`}>
                                            {change >= 0 ? "+" : ""}{change} ({changePercent}%)
                                        </span>
                                    )}
                                </div>
                                {/* Fixed height date row */}
                                <p className={`text-[#9CA3AF] text-sm mt-1 h-5 ${activeIndex !== null && displayData ? 'opacity-100' : 'opacity-0'}`}>
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
                                                <stop offset="0%" stopColor="#FF6B4A" />
                                                <stop offset="100%" stopColor="#F43F5E" />
                                            </linearGradient>
                                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#FF6B4A" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#FF6B4A" stopOpacity="0" />
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
                                                className="absolute top-0 bottom-0 w-px bg-[#FF6B4A]/50 pointer-events-none transition-all duration-75"
                                                style={{ left: `${points[activeIndex].x}%` }}
                                            />
                                            {/* Dot */}
                                            <div
                                                className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-[#FF6B4A] border-2 border-white shadow-lg shadow-[#FF6B4A]/30 pointer-events-none transition-all duration-75"
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
                                                <stop offset="0%" stopColor="#FF6B4A" />
                                                <stop offset="100%" stopColor="#F43F5E" />
                                            </linearGradient>
                                            <linearGradient id="placeholderAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#FF6B4A" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#FF6B4A" stopOpacity="0" />
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
                                        <div className="w-12 h-12 mb-3 rounded-full bg-gradient-to-br from-[#FF6B4A]/10 to-[#F43F5E]/10 border border-[#FF6B4A]/20 flex items-center justify-center">
                                            <span className="text-2xl">🚀</span>
                                        </div>
                                        <p className="text-[#1A1D26] font-semibold">Ready to grow</p>
                                        <p className="text-sm text-[#9CA3AF] mt-1">Send your first campaign to track growth</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex items-center justify-center gap-1 mt-4 pt-4 border-t border-[#E5E7EB]">
                            {(["LIVE", "1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${timeRange === range
                                        ? "bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] text-white shadow-md shadow-[#FF6B4A]/20"
                                        : "text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#F1F3F8]"
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
                        <div className="p-5 bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#0EA5E9]/30 transition-all duration-200 hover:-translate-y-1">
                            <div className="text-3xl font-bold text-[#0EA5E9] group-hover:scale-105 transition-transform">
                                {totalContacts}
                            </div>
                            <div className="text-sm text-[#9CA3AF] font-medium">Contacts</div>
                        </div>
                    </Link>
                    <Link href="/campaigns" className="group">
                        <div className="p-5 bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#10B981]/30 transition-all duration-200 hover:-translate-y-1">
                            <div className="text-3xl font-bold text-[#10B981] group-hover:scale-105 transition-transform">
                                {activeCampaigns}
                            </div>
                            <div className="text-sm text-[#9CA3AF] font-medium">Active Campaigns</div>
                        </div>
                    </Link>
                    <Link href="/campaigns" className="group">
                        <div className="p-5 bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#F59E0B]/30 transition-all duration-200 hover:-translate-y-1">
                            <div className="text-3xl font-bold text-[#F59E0B] group-hover:scale-105 transition-transform">
                                {totalCampaigns}
                            </div>
                            <div className="text-sm text-[#9CA3AF] font-medium">Total Campaigns</div>
                        </div>
                    </Link>
                    <Link href="/templates" className="group">
                        <div className="p-5 bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#FF6B4A]/30 transition-all duration-200 hover:-translate-y-1">
                            <div className="text-3xl font-bold text-[#FF6B4A] group-hover:scale-105 transition-transform">
                                {totalTemplates}
                            </div>
                            <div className="text-sm text-[#9CA3AF] font-medium">Templates</div>
                        </div>
                    </Link>
                </div>

                {/* Two Column Layout */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
                        <h2 className="text-xl font-bold text-[#1A1D26] mb-5">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                href="/campaigns"
                                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#FF6B4A]/5 to-[#F43F5E]/5 hover:from-[#FF6B4A]/10 hover:to-[#F43F5E]/10 border border-[#FF6B4A]/10 transition-all duration-200 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B4A] to-[#F43F5E] flex items-center justify-center text-lg shadow-lg shadow-[#FF6B4A]/20 group-hover:scale-110 transition-transform">
                                    🚀
                                </div>
                                <div>
                                    <div className="font-semibold text-[#1A1D26]">New Campaign</div>
                                    <div className="text-sm text-[#9CA3AF]">Send emails to your contacts</div>
                                </div>
                            </Link>
                            <Link
                                href="/scraper"
                                className="flex items-center gap-4 p-4 rounded-xl bg-[#F8F9FC] hover:bg-[#F1F3F8] border border-[#E5E7EB] transition-all duration-200 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                    🔎
                                </div>
                                <div>
                                    <div className="font-semibold text-[#1A1D26]">Find Leads</div>
                                    <div className="text-sm text-[#9CA3AF]">Discover new business contacts</div>
                                </div>
                            </Link>
                            <Link
                                href="/contacts"
                                className="flex items-center gap-4 p-4 rounded-xl bg-[#F8F9FC] hover:bg-[#F1F3F8] border border-[#E5E7EB] transition-all duration-200 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                    ➕
                                </div>
                                <div>
                                    <div className="font-semibold text-[#1A1D26]">Add Contacts</div>
                                    <div className="text-sm text-[#9CA3AF]">Import or add manually</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-[#1A1D26]">Recent Activity</h2>
                        </div>

                        {recentActivity === undefined ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin w-6 h-6 border-2 border-[#FF6B4A] border-t-transparent rounded-full" />
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F1F3F8] flex items-center justify-center text-3xl">
                                    📭
                                </div>
                                <p className="text-[#4B5563] font-medium">No activity yet</p>
                                <p className="text-sm text-[#9CA3AF] mt-1">Start a campaign to see activity here</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity._id}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8F9FC] transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-[#F1F3F8] flex items-center justify-center text-sm">
                                            {activity.type === "email_sent" ? "📧" :
                                                activity.type === "status_changed" ? "🔄" : "📌"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm truncate">
                                                <span className="font-semibold text-[#1A1D26]">
                                                    {activity.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                                {activity.contact && (
                                                    <span className="text-[#9CA3AF] ml-2">
                                                        • {activity.contact.name || activity.contact.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs text-[#9CA3AF] font-medium">
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
