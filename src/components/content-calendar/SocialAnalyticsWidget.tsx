"use client";

import { api } from "@/../convex/_generated/api";
import { useAuthQuery } from "@/hooks/useAuthConvex";

const PLATFORM_META: Record<string, { name: string; icon: string; color: string; bgColor: string }> = {
    x: { name: "X", icon: "𝕏", color: "text-slate-900 dark:text-white", bgColor: "bg-slate-100 dark:bg-slate-800" },
    linkedin: { name: "LinkedIn", icon: "💼", color: "text-blue-700 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
    instagram: { name: "Instagram", icon: "📸", color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-50 dark:bg-pink-950/30" },
    tiktok: { name: "TikTok", icon: "🎵", color: "text-slate-800 dark:text-white", bgColor: "bg-slate-100 dark:bg-slate-800" },
    youtube: { name: "YouTube", icon: "▶️", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-950/30" },
};

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export function SocialAnalyticsWidget() {
    const analytics = useAuthQuery(api.contentCalendar.getPostingAnalytics);

    if (!analytics || analytics.totalPosted === 0) return null;

    const platforms = Object.entries(analytics.platformCounts).sort(([, a], [, b]) => b - a);
    const topPlatform = platforms[0];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 overflow-hidden">
            {/* Header bar */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm">📊</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Posting Activity</span>
                </div>
                <span className="text-xs text-slate-400">
                    {analytics.totalPosted} total {analytics.totalPosted === 1 ? "post" : "posts"}
                </span>
            </div>

            <div className="p-5">
                {/* Platform breakdown */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    {platforms.map(([platform, count]) => {
                        const meta = PLATFORM_META[platform] || { name: platform, icon: "📌", color: "text-slate-600", bgColor: "bg-slate-50" };
                        const pct = Math.round((count / analytics.totalPosted) * 100);

                        return (
                            <div
                                key={platform}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${meta.bgColor} ${topPlatform?.[0] === platform ? "ring-1 ring-cyan-200 dark:ring-cyan-800" : ""
                                    }`}
                            >
                                <span className="text-sm">{meta.icon}</span>
                                <div>
                                    <div className={`text-xs font-semibold ${meta.color}`}>{meta.name}</div>
                                    <div className="text-[10px] text-slate-400">{count} · {pct}%</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mb-4">
                    {platforms.map(([platform, count], i) => {
                        const pct = (count / analytics.totalPosted) * 100;
                        const colors = ["bg-slate-600", "bg-blue-600", "bg-pink-500", "bg-red-500", "bg-purple-500"];
                        return (
                            <div
                                key={platform}
                                className={`h-full ${colors[i] || colors[0]} transition-all duration-700`}
                                style={{ width: `${pct}%` }}
                            />
                        );
                    })}
                </div>

                {/* Recent posts */}
                {analytics.recentPosts.length > 0 && (
                    <div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent Activity</div>
                        <div className="space-y-1.5">
                            {analytics.recentPosts.slice(0, 5).map((post: any, i: number) => {
                                const meta = PLATFORM_META[post.platform] || { icon: "📌", bgColor: "bg-slate-50" };
                                return (
                                    <div key={i} className="flex items-center gap-2.5 py-1.5 group">
                                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${meta.bgColor}`}>
                                            {meta.icon}
                                        </span>
                                        <span className="text-xs text-slate-600 dark:text-slate-400 truncate flex-1">
                                            {post.concept}
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                                            {timeAgo(post.postedAt)}
                                        </span>
                                        {post.postUrl && (
                                            <a
                                                href={post.postUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-cyan-500 hover:text-cyan-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                            >
                                                View →
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
