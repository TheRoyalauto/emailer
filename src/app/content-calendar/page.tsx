"use client";

import { useState, useMemo, useCallback } from "react";
import { api } from "@/../convex/_generated/api";
import { AuthGuard } from "@/components/AuthGuard";
import { PageWrapper } from "@/components/PageWrapper";
import { PageHeader } from "@/components/PageHeader";
import { StatsBar } from "@/components/StatsBar";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageLoadingSpinner } from "@/components/PageLoadingSpinner";
import { useAuthQuery, useAuthMutation } from "@/hooks/useAuthConvex";
import { ContentEditModal } from "@/components/content-calendar/ContentEditModal";
import { BrandVoiceModal } from "@/components/content-calendar/BrandVoiceModal";
import { RevisePromptModal } from "@/components/content-calendar/RevisePromptModal";
import { SocialConnectionsModal } from "@/components/content-calendar/SocialConnectionsModal";
import { PostToSocialModal } from "@/components/content-calendar/PostToSocialModal";
import { SocialAnalyticsWidget } from "@/components/content-calendar/SocialAnalyticsWidget";
import { GeneratingOverlay } from "@/components/content-calendar/GeneratingOverlay";
import { GenerateWizard } from "@/components/content-calendar/GenerateWizard";
import { VideoPreview } from "@/components/content-calendar/VideoPreview";
import { BrandAssetLibrary } from "@/components/content-calendar/BrandAssetLibrary";

// ─── Constants ──────────────────────────────────────────────────────────────────

const PLATFORMS = [
    { value: "all", label: "All Platforms" },
    { value: "instagram", label: "Instagram", emoji: "📸" },
    { value: "x", label: "X (Twitter)", emoji: "𝕏" },
    { value: "linkedin", label: "LinkedIn", emoji: "💼" },
    { value: "tiktok", label: "TikTok", emoji: "🎵" },
    { value: "youtube", label: "YouTube", emoji: "▶️" },
];

const STATUSES = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft", color: "text-slate-500" },
    { value: "ready", label: "Ready", color: "text-blue-500" },
    { value: "scheduled", label: "Scheduled", color: "text-amber-500" },
    { value: "posted", label: "Posted", color: "text-emerald-500" },
];

const POST_TYPES: Record<string, { label: string; emoji: string }> = {
    reel: { label: "Reel", emoji: "🎬" },
    carousel: { label: "Carousel", emoji: "📱" },
    short: { label: "Short", emoji: "⚡" },
    tweet_thread: { label: "Thread", emoji: "🧵" },
    story: { label: "Story", emoji: "📖" },
    static_post: { label: "Post", emoji: "🖼️" },
    video: { label: "Video", emoji: "🎥" },
    live: { label: "Live", emoji: "🔴" },
    poll: { label: "Poll", emoji: "📊" },
};

const STATUS_BADGES: Record<string, string> = {
    draft: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
    ready: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    scheduled: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
    posted: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
};

const PLATFORM_BADGES: Record<string, string> = {
    instagram: "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400",
    x: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    linkedin: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
    tiktok: "bg-slate-900 dark:bg-slate-700 text-white",
    youtube: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getWeekRange(weekOffset: number) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + weekOffset * 7);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return {
        start: startOfWeek.toISOString().split("T")[0],
        end: endOfWeek.toISOString().split("T")[0],
        label: `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    };
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ─── Page ───────────────────────────────────────────────────────────────────────

function ContentCalendarPage() {
    // State
    const [platform, setPlatform] = useState("all");
    const [status, setStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [weekOffset, setWeekOffset] = useState(0);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [editingItem, setEditingItem] = useState<any>(null);
    const [showBrandVoice, setShowBrandVoice] = useState(false);
    const [showRevise, setShowRevise] = useState(false);
    const [showSocialConnections, setShowSocialConnections] = useState(false);
    const [postingItem, setPostingItem] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingDays, setGeneratingDays] = useState(0);
    const [showGenDropdown, setShowGenDropdown] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [wizardDays, setWizardDays] = useState(1);
    const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
    const [videoItem, setVideoItem] = useState<any>(null);
    const [showAssetLibrary, setShowAssetLibrary] = useState(false);

    // Data
    const weekRange = getWeekRange(weekOffset);
    const items = useAuthQuery(api.contentCalendar.list, {
        platform: platform !== "all" ? platform : undefined,
        status: status !== "all" ? status : undefined,
        search: search || undefined,
        startDate: weekRange.start,
        endDate: weekRange.end,
    });
    const stats = useAuthQuery(api.contentCalendar.getStats);
    const brandVoice = useAuthQuery(api.contentBrandVoice.get);
    const brandAssetsRaw = useAuthQuery(api.brandAssets.getAssetUrls, { limit: 10 });
    const brandAssets = (brandAssetsRaw || []).map((a: any) => ({ name: a.name, category: a.category }));
    const brandAssetIds = (brandAssetsRaw || []).map((a: any) => a._id).filter(Boolean);
    const socialConnections = useAuthQuery(api.socialConnections.list);
    const connectedPlatforms = (socialConnections || []).filter((c: any) => c.hasToken).map((c: any) => c.platform);

    // Mutations
    const updateItem = useAuthMutation(api.contentCalendar.update);
    const updateStatus = useAuthMutation(api.contentCalendar.updateStatus);
    const removeItem = useAuthMutation(api.contentCalendar.remove);
    const deleteAll = useAuthMutation(api.contentCalendar.deleteAll);
    const bulkInsert = useAuthMutation(api.contentCalendar.bulkInsert);
    const recordPostResult = useAuthMutation(api.contentCalendar.recordPostResult);
    const logAssetUsage = useAuthMutation(api.brandAssets.logUsage);

    const isLoading = items === undefined;

    // Open wizard instead of direct generation
    const openWizard = useCallback((days: number) => {
        setWizardDays(days);
        setShowWizard(true);
        setShowGenDropdown(false);
    }, []);

    // Called when wizard completes — save generated items to Convex
    const handleWizardComplete = useCallback(async (generatedItems: any[]) => {
        setShowWizard(false);
        setIsGenerating(true);
        setGeneratingDays(generatedItems.length);
        try {
            if (generatedItems.length >= 30) {
                await deleteAll();
            }
            // Strip image data before saving to Convex (images stored separately)
            const cleanItems = generatedItems.map(item => ({
                date: item.date,
                platforms: item.platforms,
                type: item.type,
                concept: item.concept,
                caption: item.caption,
                hashtags: item.hashtags,
                cta: item.cta,
                assetNotes: item.assetNotes,
            }));
            await bulkInsert({ items: cleanItems });
        } catch (err: any) {
            console.error("Save failed:", err);
            alert(`Save failed: ${err.message || "Error"}`);
        }
        setIsGenerating(false);
        setGeneratingDays(0);
    }, [deleteAll, bulkInsert]);

    const handleRegenerateSelected = useCallback(async () => {
        if (selectedIds.size === 0 || !items) return;
        const selectedItems = items.filter((i: any) => selectedIds.has(i._id));
        setGeneratingIds(new Set(selectedIds));

        try {
            const res = await fetch("/api/generate-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "regenerate",
                    selectedItems,
                    brandVoice: brandVoice || undefined,
                }),
            });

            const data = await res.json();
            if (data.items?.length) {
                for (let i = 0; i < data.items.length && i < selectedItems.length; i++) {
                    const original = selectedItems[i];
                    const updated = data.items[i];
                    const locked = original.lockedFields || [];
                    await updateItem({
                        id: original._id,
                        concept: locked.includes("concept") ? undefined : updated.concept,
                        caption: locked.includes("caption") ? undefined : updated.caption,
                        hashtags: locked.includes("hashtags") ? undefined : updated.hashtags,
                        cta: locked.includes("cta") ? undefined : updated.cta,
                        assetNotes: updated.assetNotes,
                    });
                }
            }
        } catch (err) {
            console.error("Regeneration failed:", err);
        }
        setGeneratingIds(new Set());
        setSelectedIds(new Set());
    }, [selectedIds, items, brandVoice, updateItem]);

    const handleRevise = useCallback(async (prompt: string) => {
        if (selectedIds.size === 0 || !items) return;
        const selectedItems = items.filter((i: any) => selectedIds.has(i._id));
        setGeneratingIds(new Set(selectedIds));

        try {
            const res = await fetch("/api/generate-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "revise",
                    selectedItems,
                    userPrompt: prompt,
                    brandVoice: brandVoice || undefined,
                }),
            });

            const data = await res.json();
            if (data.items?.length) {
                for (let i = 0; i < data.items.length && i < selectedItems.length; i++) {
                    const original = selectedItems[i];
                    const updated = data.items[i];
                    const locked = original.lockedFields || [];
                    await updateItem({
                        id: original._id,
                        concept: locked.includes("concept") ? undefined : updated.concept,
                        caption: locked.includes("caption") ? undefined : updated.caption,
                        hashtags: locked.includes("hashtags") ? undefined : updated.hashtags,
                        cta: locked.includes("cta") ? undefined : updated.cta,
                        assetNotes: updated.assetNotes,
                    });
                }
            }
        } catch (err) {
            console.error("Revision failed:", err);
        }
        setGeneratingIds(new Set());
        setSelectedIds(new Set());
        setShowRevise(false);
    }, [selectedIds, items, brandVoice, updateItem]);

    // ── Selection ───────────────────────────────────────────────────────────

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (!items) return;
        if (selectedIds.size === items.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map((i: any) => i._id)));
        }
    };

    // ── Status change ───────────────────────────────────────────────────────

    const nextStatus = (current: string) => {
        const flow: Record<string, string> = { draft: "ready", ready: "scheduled", scheduled: "posted" };
        return flow[current] || current;
    };

    const handleStatusAdvance = async (id: string, current: string) => {
        const next = nextStatus(current);
        if (next !== current) {
            await updateStatus({ id: id as any, status: next });
        }
    };

    // ── Calendar grouping ───────────────────────────────────────────────────

    const groupedByDate = useMemo(() => {
        if (!items) return {};
        const groups: Record<string, any[]> = {};
        for (const item of items) {
            if (!groups[item.date]) groups[item.date] = [];
            groups[item.date].push(item);
        }
        return groups;
    }, [items]);

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <PageWrapper>
            <PageHeader
                title="Content Calendar"
                subtitle="Plan and manage your social media content"
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowSocialConnections(true)}
                        className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all relative"
                    >
                        🔗 Accounts
                        {connectedPlatforms.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {connectedPlatforms.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setShowBrandVoice(true)}
                        className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                    >
                        🎨 Brand Voice
                    </button>
                    <button
                        onClick={() => setShowAssetLibrary(true)}
                        className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                    >
                        📸 Assets
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => openWizard(1)}
                            disabled={isGenerating}
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-l-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            ✨ Generate Today
                        </button>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowGenDropdown(!showGenDropdown)}
                            disabled={isGenerating}
                            className="px-2.5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-semibold rounded-r-lg transition-all disabled:opacity-50 border-l border-purple-500/30"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                        </button>
                        {showGenDropdown && (
                            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-20 py-1 overflow-hidden">
                                <button
                                    onClick={() => openWizard(7)}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2.5"
                                >
                                    <span className="text-base">📅</span>
                                    <div>
                                        <div className="font-medium">Generate 7 Days</div>
                                        <div className="text-xs text-slate-400">One week of content</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => openWizard(14)}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2.5"
                                >
                                    <span className="text-base">🗓️</span>
                                    <div>
                                        <div className="font-medium">Generate 14 Days</div>
                                        <div className="text-xs text-slate-400">Two weeks of content</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => openWizard(30)}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2.5"
                                >
                                    <span className="text-base">🚀</span>
                                    <div>
                                        <div className="font-medium">Generate 30 Days</div>
                                        <div className="text-xs text-slate-400">Full month • replaces all existing</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </PageHeader>

            {/* Stats */}
            <StatsBar
                items={[
                    { value: stats?.total ?? 0, label: "Total Posts" },
                    { value: stats?.draft ?? 0, label: "Drafts", color: "text-slate-500" },
                    { value: stats?.ready ?? 0, label: "Ready", color: "text-blue-500" },
                    { value: stats?.scheduled ?? 0, label: "Scheduled", color: "text-amber-500" },
                    { value: stats?.posted ?? 0, label: "Posted", color: "text-emerald-500" },
                ]}
                columns={5}
            />

            {/* Social Analytics */}
            <SocialAnalyticsWidget />

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px] relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                        <input
                            placeholder="Search content..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                    </div>

                    {/* Platform filter */}
                    <select
                        value={platform}
                        onChange={e => setPlatform(e.target.value)}
                        className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 cursor-pointer focus:border-cyan-500 focus:outline-none transition-all"
                    >
                        {PLATFORMS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>

                    {/* Status filter */}
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 cursor-pointer focus:border-cyan-500 focus:outline-none transition-all"
                    >
                        {STATUSES.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>

                    {/* Week nav */}
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <button onClick={() => setWeekOffset(w => w - 1)} className="px-2.5 py-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">←</button>
                        <span className="px-2 text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[120px] text-center">{weekRange.label}</span>
                        <button onClick={() => setWeekOffset(w => w + 1)} className="px-2.5 py-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">→</button>
                    </div>

                    {/* View toggle */}
                    <div className="flex bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === "list" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode("calendar")}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === "calendar" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                        >
                            Calendar
                        </button>
                    </div>
                </div>

                {/* Bulk actions */}
                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-sm text-slate-500">{selectedIds.size} selected</span>
                        <button
                            onClick={handleRegenerateSelected}
                            className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors"
                        >
                            🔄 Regenerate
                        </button>
                        <button
                            onClick={() => setShowRevise(true)}
                            className="px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
                        >
                            ✏️ Revise with Prompt
                        </button>
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <PageLoadingSpinner />
            ) : !items || items.length === 0 ? (
                <PageEmptyState
                    icon="📅"
                    title="No content yet"
                    description="Generate today's content or a full month of social media posts with AI-generated images."
                    actionLabel="✨ Generate Content"
                    onAction={() => openWizard(1)}
                />
            ) : viewMode === "list" ? (
                /* ─── List View ─────────────────────────────────────────── */
                <div className="space-y-3">
                    {/* Select all */}
                    <div className="flex items-center gap-2 px-1">
                        <button
                            onClick={selectAll}
                            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            {selectedIds.size === items.length ? "Deselect All" : "Select All"}
                        </button>
                    </div>

                    {items.map((item: any) => (
                        <div
                            key={item._id}
                            className={`bg-white dark:bg-slate-900 rounded-xl border transition-all ${selectedIds.has(item._id)
                                ? "border-indigo-300 dark:border-indigo-600 ring-1 ring-indigo-200 dark:ring-indigo-800"
                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                } ${generatingIds.has(item._id) ? "opacity-50 animate-pulse" : ""}`}
                        >
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    {/* Checkbox */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSelect(item._id); }}
                                        className={`mt-1 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${selectedIds.has(item._id)
                                            ? "bg-indigo-600 border-indigo-600 text-white"
                                            : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                                            }`}
                                    >
                                        {selectedIds.has(item._id) && (
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </button>

                                    {/* Content — clickable to edit */}
                                    <div
                                        className="flex-1 min-w-0 cursor-pointer group"
                                        onClick={() => setEditingItem(item)}
                                    >
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{formatDate(item.date)}</span>
                                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider ${STATUS_BADGES[item.status]}`}>
                                                {item.status}
                                            </span>
                                            {item.videoStorageId && (
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
                                                    🎬 Video
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                {POST_TYPES[item.type]?.emoji} {POST_TYPES[item.type]?.label}
                                            </span>
                                            {item.platforms.map((p: string) => (
                                                <span key={p} className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${PLATFORM_BADGES[p]}`}>
                                                    {PLATFORMS.find(pl => pl.value === p)?.emoji} {p}
                                                </span>
                                            ))}
                                        </div>

                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {item.concept}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                                            {item.caption}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            {item.hashtags && (
                                                <span className="truncate max-w-[200px]">{item.hashtags}</span>
                                            )}
                                            {item.cta && (
                                                <span className="text-cyan-500 font-medium">CTA: {item.cta}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => setEditingItem(item)}
                                            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                                            title="Edit"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </button>
                                        <button
                                            onClick={() => setPostingItem(item)}
                                            className="px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
                                            title="Post to social"
                                        >
                                            📤 Post
                                        </button>
                                        <button
                                            onClick={() => setVideoItem(item)}
                                            className="px-2.5 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
                                            title="Create video"
                                        >
                                            🎬 Video
                                        </button>
                                        {item.status !== "posted" && (
                                            <button
                                                onClick={() => handleStatusAdvance(item._id, item.status)}
                                                className="px-2.5 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-950/50 transition-colors"
                                                title={`Mark as ${nextStatus(item.status)}`}
                                            >
                                                → {nextStatus(item.status)}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => removeItem({ id: item._id })}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* ─── Calendar View ────────────────────────────────────── */
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                    {Object.entries(groupedByDate).map(([date, dayItems]) => (
                        <div key={date} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 min-h-[120px]">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                {formatDate(date)}
                            </div>
                            <div className="space-y-1.5">
                                {(dayItems as any[]).map((item: any) => (
                                    <button
                                        key={item._id}
                                        onClick={() => setEditingItem(item)}
                                        className={`w-full text-left p-2 rounded-lg border transition-all hover:shadow-sm ${STATUS_BADGES[item.status]} border-current/10`}
                                    >
                                        <div className="text-[11px] font-semibold truncate">
                                            {POST_TYPES[item.type]?.emoji} {item.concept}
                                        </div>
                                        <div className="text-[10px] opacity-70 truncate mt-0.5">
                                            {item.platforms.map((p: string) => PLATFORMS.find(pl => pl.value === p)?.emoji).join(" ")}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {/* Fill empty days */}
                    {Array.from({ length: Math.max(0, 7 - Object.keys(groupedByDate).length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 min-h-[120px]">
                            <div className="text-xs text-slate-300 dark:text-slate-700 text-center mt-8">No posts</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {editingItem && (
                <ContentEditModal
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                    onSave={async (updates: any) => {
                        await updateItem({ id: editingItem._id, ...updates });
                        setEditingItem(null);
                    }}
                />
            )}

            {showBrandVoice && (
                <BrandVoiceModal
                    onClose={() => setShowBrandVoice(false)}
                />
            )}

            {showRevise && (
                <RevisePromptModal
                    count={selectedIds.size}
                    onClose={() => setShowRevise(false)}
                    onSubmit={handleRevise}
                />
            )}

            {showSocialConnections && (
                <SocialConnectionsModal
                    onClose={() => setShowSocialConnections(false)}
                />
            )}

            {postingItem && (
                <PostToSocialModal
                    item={postingItem}
                    connectedPlatforms={connectedPlatforms}
                    onClose={() => setPostingItem(null)}
                    onPostSuccess={async (platform, postUrl) => {
                        await recordPostResult({
                            id: postingItem._id,
                            platform,
                            postUrl: postUrl || undefined,
                        });
                    }}
                />
            )}

            {/* Robot generating overlay */}
            {isGenerating && <GeneratingOverlay days={generatingDays} />}

            {/* Generation Wizard */}
            {showWizard && (
                <GenerateWizard
                    days={wizardDays}
                    brandVoice={brandVoice}
                    brandAssets={brandAssets.length > 0 ? brandAssets : undefined}
                    onLogUsage={brandAssetIds.length > 0 ? (platform, concept, success) => {
                        logAssetUsage({
                            assetIds: brandAssetIds,
                            platform,
                            contentConcept: concept,
                            generationSuccess: success,
                        }).catch(console.error);
                    } : undefined}
                    onComplete={handleWizardComplete}
                    onClose={() => setShowWizard(false)}
                />
            )}

            {/* Video Creator */}
            <VideoPreview
                isOpen={!!videoItem}
                onClose={() => setVideoItem(null)}
                concept={videoItem?.concept}
                caption={videoItem?.caption}
                contentItemId={videoItem?._id}
            />

            {/* Brand Asset Library */}
            <BrandAssetLibrary
                isOpen={showAssetLibrary}
                onClose={() => setShowAssetLibrary(false)}
            />
        </PageWrapper>
    );
}

export default function ContentCalendarPageWrapper() {
    return (
        <AuthGuard>
            <ContentCalendarPage />
        </AuthGuard>
    );
}
