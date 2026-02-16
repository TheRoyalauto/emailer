"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PostToSocialModalProps {
    item: any;
    connectedPlatforms: string[];
    onClose: () => void;
    onPostSuccess?: (platform: string, postUrl: string | null) => void;
}

const PLATFORM_CONFIG: Record<string, { name: string; icon: string; color: string; maxLen?: number; copyUrl?: string }> = {
    x: { name: "X (Twitter)", icon: "𝕏", color: "bg-black text-white", maxLen: 280 },
    linkedin: { name: "LinkedIn", icon: "💼", color: "bg-blue-700 text-white" },
    instagram: { name: "Instagram", icon: "📸", color: "bg-gradient-to-r from-pink-500 to-purple-500 text-white", copyUrl: "https://www.instagram.com" },
    tiktok: { name: "TikTok", icon: "🎵", color: "bg-black text-white", copyUrl: "https://www.tiktok.com/upload" },
    youtube: { name: "YouTube", icon: "▶️", color: "bg-red-600 text-white", copyUrl: "https://studio.youtube.com" },
};

export function PostToSocialModal({ item, connectedPlatforms, onClose, onPostSuccess }: PostToSocialModalProps) {
    const { sessionToken } = useAuth();
    const [posting, setPosting] = useState<Record<string, boolean>>({});
    const [results, setResults] = useState<Record<string, { success: boolean; url?: string; error?: string }>>({});
    const [copied, setCopied] = useState(false);

    const fullText = [item.caption, item.hashtags].filter(Boolean).join("\n\n");

    const handlePost = async (platform: "x" | "linkedin") => {
        if (!sessionToken) return;
        setPosting(prev => ({ ...prev, [platform]: true }));

        try {
            const res = await fetch("/api/social/post", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionToken,
                    platform,
                    text: item.caption,
                    hashtags: item.hashtags,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setResults(prev => ({
                    ...prev,
                    [platform]: { success: true, url: data.postUrl },
                }));
                onPostSuccess?.(platform, data.postUrl);
            } else {
                setResults(prev => ({
                    ...prev,
                    [platform]: { success: false, error: data.error },
                }));
            }
        } catch (err: any) {
            setResults(prev => ({
                ...prev,
                [platform]: { success: false, error: err.message },
            }));
        }

        setPosting(prev => ({ ...prev, [platform]: false }));
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = fullText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Post to Social</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{item.concept}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">✕</button>
                </div>

                {/* Preview */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Preview</div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 max-h-[160px] overflow-y-auto">
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {item.caption}
                        </p>
                        {item.hashtags && (
                            <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2">{item.hashtags}</p>
                        )}
                    </div>
                </div>

                {/* Platforms */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                    {item.platforms.map((platform: string) => {
                        const config = PLATFORM_CONFIG[platform];
                        if (!config) return null;
                        const isConnected = connectedPlatforms.includes(platform);
                        const result = results[platform];
                        const isPosting = posting[platform];

                        return (
                            <div
                                key={platform}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${result?.success
                                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30"
                                        : result?.error
                                            ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30"
                                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${config.color}`}>
                                    {config.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{config.name}</div>
                                    {result?.success ? (
                                        <div className="text-xs text-emerald-600 dark:text-emerald-400">
                                            ✓ Posted successfully
                                            {result.url && (
                                                <a href={result.url} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                                                    View →
                                                </a>
                                            )}
                                        </div>
                                    ) : result?.error ? (
                                        <div className="text-xs text-red-500 truncate">{result.error}</div>
                                    ) : !isConnected ? (
                                        <div className="text-xs text-slate-400">Not connected — use copy below</div>
                                    ) : (
                                        <div className="text-xs text-slate-400">Ready to post</div>
                                    )}
                                </div>

                                {result?.success ? (
                                    <span className="text-emerald-500 text-lg">✓</span>
                                ) : isConnected && (platform === "x" || platform === "linkedin") ? (
                                    <button
                                        onClick={() => handlePost(platform as "x" | "linkedin")}
                                        disabled={isPosting}
                                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 ${config.color}`}
                                    >
                                        {isPosting ? (
                                            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                        ) : (
                                            "Post"
                                        )}
                                    </button>
                                ) : config.copyUrl ? (
                                    <a
                                        href={config.copyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Open ↗
                                    </a>
                                ) : null}
                            </div>
                        );
                    })}
                </div>

                {/* Copy + Close */}
                <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleCopy}
                        className="flex-1 px-4 py-2.5 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        {copied ? "✓ Copied!" : "📋 Copy Caption"}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
