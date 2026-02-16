"use client";

import { useState, useCallback } from "react";
import { VideoPreview } from "./VideoPreview";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface BrandVoice {
    tone: string;
    bannedWords?: string[];
    defaultCta?: string;
    defaultHashtags?: string[];
    brandDescription?: string;
}

interface GeneratedItem {
    date: string;
    platforms: string[];
    type: string;
    concept: string;
    caption: string;
    hashtags: string;
    cta: string;
    assetNotes: string;
    mediaType: "picture" | "video";
    imageData?: string;        // base64
    imageMimeType?: string;
    imageLoading?: boolean;
    imageFallback?: boolean;
}

interface GenerateWizardProps {
    days: number;
    brandVoice?: BrandVoice | null;
    brandAssets?: Array<{ name: string; category: string }>;
    onLogUsage?: (platform: string, concept: string, success: boolean) => void;
    onComplete: (items: GeneratedItem[]) => void;
    onClose: () => void;
}

// ─── Platform Config ────────────────────────────────────────────────────────────

const PLATFORMS = [
    { id: "instagram", label: "Instagram", emoji: "📸", types: ["reel", "carousel", "story", "static_post"], color: "from-pink-500 to-purple-500" },
    { id: "x", label: "X (Twitter)", emoji: "𝕏", types: ["tweet_thread", "static_post", "poll"], color: "from-slate-700 to-slate-900" },
    { id: "linkedin", label: "LinkedIn", emoji: "💼", types: ["static_post", "carousel", "video", "poll"], color: "from-blue-600 to-blue-800" },
    { id: "tiktok", label: "TikTok", emoji: "🎵", types: ["short", "video"], color: "from-cyan-400 to-pink-500" },
    { id: "youtube", label: "YouTube", emoji: "▶️", types: ["video", "short"], color: "from-red-500 to-red-700" },
];

// ─── Component ──────────────────────────────────────────────────────────────────

export function GenerateWizard({ days, brandVoice, brandAssets, onLogUsage, onComplete, onClose }: GenerateWizardProps) {
    const [step, setStep] = useState(1);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "x", "linkedin"]);
    const [topic, setTopic] = useState("");
    const [mediaType, setMediaType] = useState<"picture" | "video">("picture");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
    const [imageProgress, setImageProgress] = useState({ current: 0, total: 0 });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editCaption, setEditCaption] = useState("");
    const [generationPhase, setGenerationPhase] = useState<"text" | "images" | "done">("text");
    const [videoPreviewItem, setVideoPreviewItem] = useState<GeneratedItem | null>(null);

    // ── Platform selection toggle ────────────────────────────────────────────

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    // ── Generate content (Step 2 → Step 3) ──────────────────────────────────

    const handleGenerate = useCallback(async () => {
        if (selectedPlatforms.length === 0) return;
        setIsGenerating(true);
        setGenerationPhase("text");

        try {
            // Step 1: Generate text content
            const res = await fetch("/api/generate-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "generate",
                    days,
                    brandVoice: brandVoice || undefined,
                    platforms: selectedPlatforms,
                    topic: topic || undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.items?.length) {
                alert(`Generation failed: ${data.error || "No content returned"}`);
                setIsGenerating(false);
                return;
            }

            // Set items with mediaType info
            const itemsWithLoading: GeneratedItem[] = data.items.map((item: any) => ({
                ...item,
                mediaType,
                imageLoading: mediaType === "picture",
                imageData: undefined,
                imageMimeType: undefined,
                imageFallback: false,
            }));
            setGeneratedItems(itemsWithLoading);
            setStep(3);

            // Skip image generation for video mode
            if (mediaType === "video") {
                setGenerationPhase("done");
                setIsGenerating(false);
                return;
            }

            setGenerationPhase("images");

            // Step 2: Generate images for each item (in parallel batches of 3)
            const totalItems = itemsWithLoading.length;
            setImageProgress({ current: 0, total: totalItems });

            const batchSize = 3;
            for (let i = 0; i < totalItems; i += batchSize) {
                const batch = itemsWithLoading.slice(i, i + batchSize);
                const batchPromises = batch.map(async (item, batchIdx) => {
                    const idx = i + batchIdx;
                    try {
                        const imgRes = await fetch("/api/generate-image", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                platform: item.platforms[0],
                                concept: item.concept,
                                caption: item.caption,
                                brandAssets: brandAssets || undefined,
                            }),
                        });
                        const imgData = await imgRes.json();
                        return { idx, image: imgData.image, mimeType: imgData.mimeType, fallback: imgData.fallback };
                    } catch {
                        return { idx, image: null, mimeType: null, fallback: true };
                    }
                });

                const results = await Promise.all(batchPromises);
                setGeneratedItems(prev => {
                    const updated = [...prev];
                    for (const r of results) {
                        if (updated[r.idx]) {
                            updated[r.idx] = {
                                ...updated[r.idx],
                                imageData: r.image || undefined,
                                imageMimeType: r.mimeType || undefined,
                                imageFallback: r.fallback || false,
                                imageLoading: false,
                            };
                        }
                    }
                    return updated;
                });
                setImageProgress(prev => ({ ...prev, current: Math.min(i + batchSize, totalItems) }));

                // Log asset usage for analytics
                if (brandAssets?.length && onLogUsage) {
                    for (const r of results) {
                        const item = itemsWithLoading[r.idx];
                        if (item) {
                            onLogUsage(item.platforms[0], item.concept, !r.fallback);
                        }
                    }
                }
            }

            setGenerationPhase("done");
        } catch (err: any) {
            alert(`Generation failed: ${err.message || "Network error"}`);
        }
        setIsGenerating(false);
    }, [days, brandVoice, brandAssets, selectedPlatforms, topic]);

    // ── Regenerate single image ──────────────────────────────────────────────

    const regenerateImage = useCallback(async (index: number) => {
        const item = generatedItems[index];
        if (!item) return;

        setGeneratedItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], imageLoading: true };
            return updated;
        });

        try {
            const res = await fetch("/api/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    platform: item.platforms[0],
                    concept: item.concept,
                    caption: item.caption,
                    brandAssets: brandAssets || undefined,
                }),
            });
            const data = await res.json();
            setGeneratedItems(prev => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    imageData: data.image || undefined,
                    imageMimeType: data.mimeType || undefined,
                    imageFallback: data.fallback || false,
                    imageLoading: false,
                };
                return updated;
            });
        } catch {
            setGeneratedItems(prev => {
                const updated = [...prev];
                updated[index] = { ...updated[index], imageLoading: false };
                return updated;
            });
        }
    }, [generatedItems, brandAssets]);

    // ── Save edits ──────────────────────────────────────────────────────────

    const saveEdit = (index: number) => {
        setGeneratedItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], caption: editCaption };
            return updated;
        });
        setEditingIndex(null);
    };

    // ── Complete ─────────────────────────────────────────────────────────────

    const handleComplete = () => {
        onComplete(generatedItems);
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {step === 1 ? "Choose Platforms" : step === 2 ? "Content Preferences" : "Review & Edit"}
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {step === 1 ? "Select which platforms to generate content for" :
                                    step === 2 ? "Customize what AI generates" :
                                        `${generatedItems.length} posts generated — review before saving`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Step indicators */}
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3].map(s => (
                                    <div
                                        key={s}
                                        className={`w-2 h-2 rounded-full transition-all ${s === step ? "w-6 bg-indigo-500" :
                                            s < step ? "bg-indigo-400" : "bg-slate-300 dark:bg-slate-600"
                                            }`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Step 1: Platform Selection */}
                        {step === 1 && (
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        if (selectedPlatforms.length === PLATFORMS.length) {
                                            setSelectedPlatforms([]);
                                        } else {
                                            setSelectedPlatforms(PLATFORMS.map(p => p.id));
                                        }
                                    }}
                                    className="text-sm text-indigo-500 hover:text-indigo-600 font-medium mb-2"
                                >
                                    {selectedPlatforms.length === PLATFORMS.length ? "Deselect All" : "Select All"}
                                </button>
                                <div className="grid grid-cols-1 gap-3">
                                    {PLATFORMS.map(platform => {
                                        const isSelected = selectedPlatforms.includes(platform.id);
                                        return (
                                            <button
                                                key={platform.id}
                                                onClick={() => togglePlatform(platform.id)}
                                                className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                                    }`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white text-xl shadow-lg`}>
                                                    {platform.emoji}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-slate-900 dark:text-white">{platform.label}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        Best for: {platform.types.slice(0, 3).join(", ")}
                                                    </div>
                                                </div>
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
                                                    ? "border-indigo-500 bg-indigo-500"
                                                    : "border-slate-300 dark:border-slate-600"
                                                    }`}>
                                                    {isSelected && (
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Content Preferences */}
                        {step === 2 && (
                            <div className="space-y-6">
                                {/* Media Type Toggle */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Media Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setMediaType("picture")}
                                            className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${mediaType === "picture"
                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-sm"
                                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${mediaType === "picture"
                                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
                                                : "bg-slate-100 dark:bg-slate-800"
                                                }`}>📸</div>
                                            <div>
                                                <div className="font-semibold text-sm text-slate-900 dark:text-white">Picture</div>
                                                <div className="text-[11px] text-slate-500">AI-generated images</div>
                                            </div>
                                            {mediaType === "picture" && (
                                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                                                </div>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setMediaType("video")}
                                            className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${mediaType === "video"
                                                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-sm"
                                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${mediaType === "video"
                                                ? "bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg"
                                                : "bg-slate-100 dark:bg-slate-800"
                                                }`}>🎬</div>
                                            <div>
                                                <div className="font-semibold text-sm text-slate-900 dark:text-white">Video</div>
                                                <div className="text-[11px] text-slate-500">Animated video templates</div>
                                            </div>
                                            {mediaType === "video" && (
                                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Topic or Theme (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={e => setTopic(e.target.value)}
                                        placeholder="E.g. 'Email deliverability tips' or leave blank for AI to decide"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    />
                                    <p className="text-xs text-slate-400 mt-1.5">AI will generate varied content if left blank</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Selected Platforms
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPlatforms.map(pid => {
                                            const p = PLATFORMS.find(x => x.id === pid);
                                            return p ? (
                                                <span key={pid} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                                                    {p.emoji} {p.label}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">🤖</span>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">What will be generated</span>
                                    </div>
                                    <ul className="text-sm text-slate-500 space-y-1">
                                        <li>✓ {days} {days === 1 ? "post" : "posts"} of platform-optimized content</li>
                                        <li>✓ {mediaType === "picture" ? "AI-generated images" : "Animated video templates"} for each post</li>
                                        <li>✓ Platform-specific captions, hashtags & CTAs</li>
                                        <li>✓ Aspect ratios matched per platform</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review & Edit */}
                        {step === 3 && (
                            <div className="space-y-4">
                                {/* Image generation progress */}
                                {generationPhase === "images" && (
                                    <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800 mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                                Generating images... {imageProgress.current}/{imageProgress.total}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                style={{ width: `${imageProgress.total > 0 ? (imageProgress.current / imageProgress.total) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {generatedItems.map((item, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div className="flex">
                                            {/* Media Thumbnail */}
                                            <div className="w-40 h-40 flex-shrink-0 bg-slate-100 dark:bg-slate-700 relative">
                                                {item.mediaType === "video" ? (
                                                    /* Video badge */
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                                                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-400"><path d="M5 3l14 9-14 9V3z" fill="currentColor" /></svg>
                                                        </div>
                                                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Video</span>
                                                        <button
                                                            onClick={() => setVideoPreviewItem(item)}
                                                            className="absolute bottom-1 right-1 px-2 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-md hover:bg-purple-700 transition-colors"
                                                        >
                                                            🎬 Create
                                                        </button>
                                                    </div>
                                                ) : item.imageLoading ? (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                ) : item.imageData ? (
                                                    <>
                                                        <img
                                                            src={item.imageMimeType === "image/svg+xml"
                                                                ? `data:image/svg+xml;base64,${item.imageData}`
                                                                : `data:${item.imageMimeType || "image/png"};base64,${item.imageData}`}
                                                            alt={item.concept}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button
                                                            onClick={() => regenerateImage(idx)}
                                                            className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded-md hover:bg-black/80 transition-colors"
                                                            title="Regenerate image"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6M3 12a9 9 0 0115.36-6.36L21 8M3 22v-6h6M21 12a9 9 0 01-15.36 6.36L3 16" /></svg>
                                                        </button>
                                                        {item.imageFallback && (
                                                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-amber-500/80 text-white text-[9px] font-bold rounded uppercase">Fallback</div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">No image</div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-3 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-mono text-slate-400">{item.date}</span>
                                                            {item.mediaType === "video" && (
                                                                <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 text-[9px] font-bold rounded uppercase">🎬 Video</span>
                                                            )}
                                                        </div>
                                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{item.concept}</h4>
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        {item.platforms.map(p => {
                                                            const platform = PLATFORMS.find(x => x.id === p);
                                                            return platform ? (
                                                                <span key={p} className="text-xs" title={platform.label}>{platform.emoji}</span>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                </div>

                                                {editingIndex === idx ? (
                                                    <div className="mt-1">
                                                        <textarea
                                                            value={editCaption}
                                                            onChange={e => setEditCaption(e.target.value)}
                                                            rows={3}
                                                            className="w-full px-2 py-1.5 text-xs border border-indigo-300 dark:border-indigo-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                                                        />
                                                        <div className="flex gap-1.5 mt-1">
                                                            <button onClick={() => saveEdit(idx)} className="px-2 py-1 text-[10px] font-semibold bg-indigo-500 text-white rounded-md hover:bg-indigo-600">Save</button>
                                                            <button onClick={() => setEditingIndex(null)} className="px-2 py-1 text-[10px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p
                                                        onClick={() => { setEditingIndex(idx); setEditCaption(item.caption); }}
                                                        className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 cursor-pointer hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                                                        title="Click to edit"
                                                    >
                                                        {item.caption}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded font-medium">{item.type}</span>
                                                    <span className="text-[10px] text-slate-400 truncate">{item.hashtags}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0 bg-slate-50 dark:bg-slate-800/50">
                        <div>
                            {step > 1 && step < 3 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
                                >
                                    ← Back
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            {step === 1 && (
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={selectedPlatforms.length === 0}
                                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                                >
                                    Next →
                                </button>
                            )}
                            {step === 2 && (
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>🚀 Generate</>
                                    )}
                                </button>
                            )}
                            {step === 3 && (
                                <button
                                    onClick={handleComplete}
                                    disabled={generationPhase !== "done"}
                                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    ✅ Save to Calendar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Inline Video Creator */}
            {videoPreviewItem && (
                <VideoPreview
                    isOpen={true}
                    onClose={() => setVideoPreviewItem(null)}
                    concept={videoPreviewItem.concept}
                    caption={videoPreviewItem.caption}
                />
            )}
        </>
    );
}
