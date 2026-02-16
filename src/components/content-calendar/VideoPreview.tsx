"use client";

import { useState, useEffect, useCallback, lazy, Suspense, useRef } from "react";
import React from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { TextReveal } from "../../remotion/compositions/TextReveal";
import { StatsCounter } from "../../remotion/compositions/StatsCounter";
import { FeatureShowcase } from "../../remotion/compositions/FeatureShowcase";
import { TipCard } from "../../remotion/compositions/TipCard";

// ─── Template Definitions ───────────────────────────────────────────────────────

interface VideoTemplate {
    id: string;
    name: string;
    emoji: string;
    description: string;
    durationInFrames: number;
    fps: number;
    component: React.FC<any>;
}

const TEMPLATES: VideoTemplate[] = [
    {
        id: "text-reveal",
        name: "Text Reveal",
        emoji: "✍️",
        description: "Animated text typing with gradient glow",
        durationInFrames: 180,
        fps: 30,
        component: TextReveal,
    },
    {
        id: "stats-counter",
        name: "Stats Counter",
        emoji: "📊",
        description: "Counting numbers with bold stats grid",
        durationInFrames: 150,
        fps: 30,
        component: StatsCounter,
    },
    {
        id: "feature-showcase",
        name: "Feature Showcase",
        emoji: "🚀",
        description: "Product feature with pills & CTA bar",
        durationInFrames: 210,
        fps: 30,
        component: FeatureShowcase,
    },
    {
        id: "tip-card",
        name: "Quick Tip",
        emoji: "💡",
        description: "Knowledge tip with numbered steps",
        durationInFrames: 150,
        fps: 30,
        component: TipCard,
    },
];

interface VideoPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    concept?: string;
    caption?: string;
    contentItemId?: string;
}

type RenderStatus = "idle" | "rendering" | "uploading" | "done" | "error";

// ─── Lazy Player ────────────────────────────────────────────────────────────────
// The Remotion Player uses browser-only APIs. We lazy-load it to prevent SSR issues.

const LazyPlayer = lazy(() =>
    import("@remotion/player").then((mod) => ({
        default: mod.Player,
    }))
);

// ─── Component ──────────────────────────────────────────────────────────────────

export function VideoPreview({ isOpen, onClose, concept, caption, contentItemId }: VideoPreviewProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>("text-reveal");
    const [headline, setHeadline] = useState(concept || "");
    const [subtext, setSubtext] = useState(caption || "");
    const [renderStatus, setRenderStatus] = useState<RenderStatus>("idle");
    const [renderError, setRenderError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const generateUploadUrl = useMutation(api.contentCalendar.generateUploadUrl);
    const saveVideo = useMutation(api.contentCalendar.saveVideo);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (concept) setHeadline(concept);
        if (caption) setSubtext(caption);
    }, [concept, caption]);

    const currentTemplate = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];
    const TemplateComponent = currentTemplate.component;

    const handleDownload = useCallback(async () => {
        setRenderStatus("rendering");
        setRenderError(null);
        try {
            const res = await fetch("/api/render-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ templateId: selectedTemplate, headline, subtext }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Render failed");
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${currentTemplate.name.replace(/\s+/g, "-").toLowerCase()}-video.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setRenderStatus("done");
            setTimeout(() => setRenderStatus("idle"), 3000);
        } catch (error: any) {
            setRenderError(error.message);
            setRenderStatus("error");
        }
    }, [selectedTemplate, headline, subtext, currentTemplate.name]);

    const handleSaveToCalendar = useCallback(async () => {
        if (!contentItemId) return;
        setRenderStatus("rendering");
        setRenderError(null);
        try {
            const res = await fetch("/api/render-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ templateId: selectedTemplate, headline, subtext }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Render failed");
            }
            const blob = await res.blob();
            setRenderStatus("uploading");
            const sessionToken = localStorage.getItem("session_token");
            if (!sessionToken) throw new Error("Not authenticated");
            const uploadUrl = await generateUploadUrl({ sessionToken });
            const uploadRes = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": "video/mp4" },
                body: blob,
            });
            if (!uploadRes.ok) throw new Error("Upload failed");
            const { storageId } = await uploadRes.json();
            await saveVideo({ sessionToken, id: contentItemId as any, videoStorageId: storageId });
            setRenderStatus("done");
            setTimeout(() => setRenderStatus("idle"), 3000);
        } catch (error: any) {
            setRenderError(error.message);
            setRenderStatus("error");
        }
    }, [contentItemId, selectedTemplate, headline, subtext, generateUploadUrl, saveVideo]);

    if (!isOpen) return null;

    const inputProps = selectedTemplate === "text-reveal"
        ? { headline, subtext, brandName: "E-MAILER.IO", accentColor: "#6366f1" }
        : { headline, subtext, brandName: selectedTemplate === "tip-card" ? "@emailer.io" : "E-MAILER.IO" };

    const isRendering = renderStatus === "rendering" || renderStatus === "uploading";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white text-sm">🎬</span>
                            Video Creator
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Remotion</span>
                        </h2>
                        <p className="text-sm text-slate-500">Create branded short-form video content with live preview</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Controls */}
                    <div className="w-72 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto space-y-5">
                        {/* Template selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Template</label>
                            <div className="space-y-2">
                                {TEMPLATES.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTemplate(t.id)}
                                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedTemplate === t.id
                                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{t.emoji}</span>
                                            <div>
                                                <div className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</div>
                                                <div className="text-[10px] text-slate-400">{t.description}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Text inputs */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Headline</label>
                            <input
                                type="text"
                                value={headline}
                                onChange={e => setHeadline(e.target.value)}
                                placeholder="Main headline text"
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subtext</label>
                            <textarea
                                value={subtext}
                                onChange={e => setSubtext(e.target.value)}
                                rows={3}
                                placeholder="Supporting text"
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-2">
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-2" />

                            {/* Download MP4 */}
                            <button
                                onClick={handleDownload}
                                disabled={isRendering}
                                className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {renderStatus === "rendering" ? (
                                    <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Rendering…</>
                                ) : renderStatus === "done" ? (
                                    <>✅ Downloaded!</>
                                ) : (
                                    <>📥 Download MP4</>
                                )}
                            </button>

                            {/* Save to Calendar */}
                            {contentItemId && (
                                <button
                                    onClick={handleSaveToCalendar}
                                    disabled={isRendering}
                                    className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {renderStatus === "uploading" ? (
                                        <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                                    ) : renderStatus === "done" ? (
                                        <>✅ Saved!</>
                                    ) : (
                                        <>💾 Save to Calendar</>
                                    )}
                                </button>
                            )}

                            {/* Error */}
                            {renderStatus === "error" && renderError && (
                                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-2.5">
                                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">{renderError}</p>
                                    <button onClick={() => { setRenderStatus("idle"); setRenderError(null); }} className="text-xs text-red-500 hover:text-red-700 mt-1 font-semibold">Dismiss</button>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Details</div>
                            <div className="text-xs text-slate-500 space-y-0.5">
                                <div>Duration: {(currentTemplate.durationInFrames / currentTemplate.fps).toFixed(1)}s</div>
                                <div>Resolution: 1080×1920</div>
                                <div>FPS: {currentTemplate.fps}</div>
                                <div>Codec: H.264 (MP4)</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Remotion Player Preview */}
                    <div className="flex-1 bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
                        {isRendering && (
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                <div className="text-sm font-semibold text-white">
                                    {renderStatus === "rendering" ? "Rendering video…" : "Uploading to cloud…"}
                                </div>
                                <p className="text-xs text-slate-400 max-w-48 text-center">This may take 30-60 seconds</p>
                            </div>
                        )}
                        <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10" style={{ width: 270, height: 480 }}>
                            {mounted ? (
                                <Suspense fallback={
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                                    </div>
                                }>
                                    <LazyPlayer
                                        component={TemplateComponent}
                                        inputProps={inputProps}
                                        durationInFrames={currentTemplate.durationInFrames}
                                        fps={currentTemplate.fps}
                                        compositionWidth={1080}
                                        compositionHeight={1920}
                                        style={{ width: 270, height: 480 }}
                                        controls={false}
                                        loop
                                        autoPlay
                                    />
                                </Suspense>
                            ) : (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
