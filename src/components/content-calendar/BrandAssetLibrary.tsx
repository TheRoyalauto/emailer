"use client";

import { useState, useRef, useCallback } from "react";
import { api } from "@/../convex/_generated/api";
import { useAuthQuery, useAuthMutation } from "@/hooks/useAuthConvex";

// ─── Types ──────────────────────────────────────────────────────────────────────

const CATEGORIES = [
    { id: "screenshot", label: "Screenshots", emoji: "🖥️" },
    { id: "logo", label: "Logos", emoji: "🎯" },
    { id: "product", label: "Product", emoji: "📦" },
    { id: "marketing", label: "Marketing", emoji: "📣" },
    { id: "icon", label: "Icons", emoji: "✨" },
    { id: "other", label: "Other", emoji: "📁" },
] as const;

type CategoryId = typeof CATEGORIES[number]["id"];

const PLATFORM_LABELS: Record<string, { emoji: string; label: string }> = {
    instagram: { emoji: "📸", label: "Instagram" },
    x: { emoji: "𝕏", label: "X" },
    linkedin: { emoji: "💼", label: "LinkedIn" },
    tiktok: { emoji: "🎵", label: "TikTok" },
    youtube: { emoji: "▶️", label: "YouTube" },
};

interface BrandAssetLibraryProps {
    isOpen: boolean;
    onClose: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function BrandAssetLibrary({ isOpen, onClose }: BrandAssetLibraryProps) {
    const [activeTab, setActiveTab] = useState<"library" | "analytics">("library");
    const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all");
    const [uploading, setUploading] = useState(false);
    const [uploadCategory, setUploadCategory] = useState<CategoryId>("screenshot");
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Queries & Mutations
    const assets = useAuthQuery(api.brandAssets.list, {
        category: activeCategory === "all" ? undefined : activeCategory,
    }) || [];
    const analytics = useAuthQuery(api.brandAssets.getAnalytics);
    const generateUploadUrl = useAuthMutation(api.brandAssets.generateUploadUrl);
    const saveAsset = useAuthMutation(api.brandAssets.save);
    const removeAsset = useAuthMutation(api.brandAssets.remove);

    // ── Upload handler ──────────────────────────────────────────────────────

    const handleUpload = useCallback(async (files: FileList | File[]) => {
        if (!files.length) return;
        setUploading(true);

        try {
            for (const file of Array.from(files)) {
                if (!file.type.startsWith("image/")) continue;

                const uploadUrl = await generateUploadUrl();
                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });

                const { storageId } = await result.json();
                await saveAsset({
                    storageId,
                    name: file.name.replace(/\.[^.]+$/, ""),
                    category: uploadCategory,
                    mimeType: file.type,
                    sizeBytes: file.size,
                });
            }
        } catch (err: any) {
            console.error("Upload failed:", err);
            alert(`Upload failed: ${err.message || "Error"}`);
        }

        setUploading(false);
    }, [generateUploadUrl, saveAsset, uploadCategory]);

    // ── Delete handler ──────────────────────────────────────────────────────

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm("Delete this asset?")) return;
        try {
            await removeAsset({ id: id as any });
        } catch (err: any) {
            alert(`Delete failed: ${err.message || "Error"}`);
        }
    }, [removeAsset]);

    // ── Drag and drop ───────────────────────────────────────────────────────

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };
    const handleDragLeave = () => setDragOver(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
    };

    if (!isOpen) return null;

    const analyticsData = analytics || { assets: [], summary: { totalGenerations: 0, successRate: 0, topPlatform: "" } };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            🎨 Brand Asset Library
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {activeTab === "library"
                                ? "Upload screenshots, logos, and brand assets for AI-powered image generation"
                                : "Track which assets AI references most and their effectiveness"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Tab switcher */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                            <button
                                onClick={() => setActiveTab("library")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "library"
                                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                            >
                                📁 Library
                            </button>
                            <button
                                onClick={() => setActiveTab("analytics")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "analytics"
                                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                            >
                                📊 Analytics
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* ═══════ Library Tab ═══════ */}
                {activeTab === "library" && (
                    <>
                        {/* Category filter bar */}
                        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto flex-shrink-0">
                            <button
                                onClick={() => setActiveCategory("all")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${activeCategory === "all"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                            >
                                All
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${activeCategory === cat.id
                                            ? "bg-indigo-600 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    {cat.emoji} {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Upload zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`mb-6 border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${dragOver
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                    }`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={e => e.target.files && handleUpload(e.target.files)}
                                />
                                {uploading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Uploading...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-3xl mb-2">📸</div>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Drop files here or click to upload</p>
                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP • Max 10MB per file</p>
                                    </>
                                )}
                                <div className="mt-3 flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                                    <span className="text-xs text-slate-400">Upload as:</span>
                                    <select
                                        value={uploadCategory}
                                        onChange={e => setUploadCategory(e.target.value as CategoryId)}
                                        className="text-xs px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Asset grid */}
                            {assets.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-3">📂</div>
                                    <p className="text-sm font-semibold text-slate-500">No assets yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Upload screenshots, logos, and brand images</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {assets.map((asset: any) => (
                                        <div
                                            key={asset._id}
                                            className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all"
                                        >
                                            <div className="aspect-square bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                                                {asset.url ? (
                                                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                                        <div className="w-6 h-6 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <button
                                                        onClick={() => handleDelete(asset._id)}
                                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                                                        title="Delete asset"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                                    </button>
                                                </div>
                                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold rounded uppercase">
                                                    {CATEGORIES.find(c => c.id === asset.category)?.emoji} {asset.category}
                                                </div>
                                            </div>
                                            <div className="p-2.5">
                                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{asset.name}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    {(asset.sizeBytes / 1024).toFixed(0)} KB • {asset.mimeType.split("/")[1]?.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ═══════ Analytics Tab ═══════ */}
                {activeTab === "analytics" && (
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-100 dark:border-indigo-800/50 p-4">
                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {analyticsData.summary.totalGenerations}
                                </div>
                                <div className="text-xs font-medium text-indigo-500/70 dark:text-indigo-400/70 mt-0.5">Total Generations</div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 rounded-xl border border-emerald-100 dark:border-emerald-800/50 p-4">
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {analyticsData.summary.successRate}%
                                </div>
                                <div className="text-xs font-medium text-emerald-500/70 dark:text-emerald-400/70 mt-0.5">AI Success Rate</div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-100 dark:border-amber-800/50 p-4">
                                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    {analyticsData.summary.topPlatform
                                        ? (PLATFORM_LABELS[analyticsData.summary.topPlatform]?.emoji || "") + " " + (PLATFORM_LABELS[analyticsData.summary.topPlatform]?.label || analyticsData.summary.topPlatform)
                                        : "—"
                                    }
                                </div>
                                <div className="text-xs font-medium text-amber-500/70 dark:text-amber-400/70 mt-0.5">Top Platform</div>
                            </div>
                        </div>

                        {/* Asset Effectiveness Ranking */}
                        <div className="mb-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Asset Effectiveness</h3>
                            <p className="text-xs text-slate-400 mb-4">Ranked by AI generation usage and success rate</p>
                        </div>

                        {analyticsData.assets.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="text-4xl mb-3">📊</div>
                                <p className="text-sm font-semibold text-slate-500">No analytics data yet</p>
                                <p className="text-xs text-slate-400 mt-1">Generate content with brand assets to start tracking effectiveness</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {analyticsData.assets.map((asset: any, idx: number) => {
                                    const isTop = idx === 0 && asset.totalUsages > 0;
                                    return (
                                        <div
                                            key={asset._id}
                                            className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isTop
                                                    ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800/50"
                                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                }`}
                                        >
                                            {/* Rank */}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isTop
                                                    ? "bg-amber-500 text-white"
                                                    : idx < 3 && asset.totalUsages > 0
                                                        ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                                                        : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                                                }`}>
                                                {isTop ? "🏆" : `#${idx + 1}`}
                                            </div>

                                            {/* Asset thumbnail */}
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                                {asset.url ? (
                                                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">?</div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{asset.name}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded uppercase font-medium flex-shrink-0">
                                                        {asset.category}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-slate-400">
                                                        <span className="font-semibold text-slate-600 dark:text-slate-300">{asset.totalUsages}</span> uses
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        <span className={`font-semibold ${asset.successRate >= 80 ? "text-emerald-600 dark:text-emerald-400" : asset.successRate >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-500"}`}>
                                                            {asset.successRate}%
                                                        </span> success
                                                    </span>
                                                    {asset.topPlatform && (
                                                        <span className="text-[10px] text-slate-400">
                                                            Top: {PLATFORM_LABELS[asset.topPlatform]?.emoji} {PLATFORM_LABELS[asset.topPlatform]?.label || asset.topPlatform}
                                                        </span>
                                                    )}
                                                    {asset.lastUsed && (
                                                        <span className="text-[10px] text-slate-400">
                                                            Last: {new Date(asset.lastUsed).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Effectiveness score */}
                                            <div className="flex-shrink-0 text-right">
                                                <div className={`text-lg font-bold ${asset.effectiveness >= 30
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : asset.effectiveness >= 10
                                                            ? "text-indigo-600 dark:text-indigo-400"
                                                            : "text-slate-400"
                                                    }`}>
                                                    {asset.effectiveness}
                                                </div>
                                                <div className="text-[9px] text-slate-400 uppercase font-medium">Score</div>
                                            </div>

                                            {/* Platform breakdown bar */}
                                            {asset.totalUsages > 0 && (
                                                <div className="flex-shrink-0 w-24">
                                                    <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                                                        {Object.entries(asset.platformBreakdown).map(([plat, count]: [string, any]) => {
                                                            const pct = (count / asset.totalUsages) * 100;
                                                            const colors: Record<string, string> = {
                                                                instagram: "bg-pink-500",
                                                                x: "bg-slate-600",
                                                                linkedin: "bg-blue-600",
                                                                tiktok: "bg-cyan-500",
                                                                youtube: "bg-red-500",
                                                            };
                                                            return (
                                                                <div
                                                                    key={plat}
                                                                    className={`${colors[plat] || "bg-slate-400"}`}
                                                                    style={{ width: `${pct}%` }}
                                                                    title={`${PLATFORM_LABELS[plat]?.label || plat}: ${count}`}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="flex items-center gap-0.5 mt-1 justify-center">
                                                        {Object.keys(asset.platformBreakdown).map((plat: string) => (
                                                            <span key={plat} className="text-[8px]">
                                                                {PLATFORM_LABELS[plat]?.emoji}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0 bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-xs text-slate-400">
                        {activeTab === "library"
                            ? `${assets.length} asset${assets.length !== 1 ? "s" : ""} • Used by AI when generating images`
                            : `${analyticsData.assets.length} tracked assets • ${analyticsData.summary.totalGenerations} total generations`
                        }
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
