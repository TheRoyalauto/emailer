"use client";

import { useState } from "react";
import { api } from "@/../convex/_generated/api";
import { useAuthQuery, useAuthMutation } from "@/hooks/useAuthConvex";
import { useAuth } from "@/contexts/AuthContext";

interface SocialConnectionsModalProps {
    onClose: () => void;
}

const PLATFORMS = [
    {
        id: "x" as const,
        name: "X (Twitter)",
        icon: "𝕏",
        color: "bg-black text-white",
        hoverColor: "hover:bg-slate-800",
        desc: "Post tweets directly from your calendar",
    },
    {
        id: "linkedin" as const,
        name: "LinkedIn",
        icon: "💼",
        color: "bg-blue-700 text-white",
        hoverColor: "hover:bg-blue-800",
        desc: "Share posts to your professional network",
    },
];

export function SocialConnectionsModal({ onClose }: SocialConnectionsModalProps) {
    const { sessionToken } = useAuth();
    const connections = useAuthQuery(api.socialConnections.list);
    const disconnectPlatform = useAuthMutation(api.socialConnections.remove);
    const [disconnecting, setDisconnecting] = useState<string | null>(null);

    const getConnection = (platform: string) =>
        connections?.find((c: any) => c.platform === platform);

    const handleConnect = (platform: "x" | "linkedin") => {
        if (!sessionToken) return;
        const url = `/api/social/connect/${platform}?sessionToken=${encodeURIComponent(sessionToken)}`;
        window.location.href = url;
    };

    const handleDisconnect = async (platform: "x" | "linkedin") => {
        setDisconnecting(platform);
        try {
            await disconnectPlatform({ platform });
        } catch (err) {
            console.error("Disconnect failed:", err);
        }
        setDisconnecting(null);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Connected Accounts</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Link your social accounts to post directly</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">✕</button>
                </div>

                {/* Platforms */}
                <div className="p-6 space-y-3">
                    {PLATFORMS.map(platform => {
                        const conn = getConnection(platform.id);
                        const isConnected = !!conn?.hasToken;
                        const isDisconnecting = disconnecting === platform.id;

                        return (
                            <div
                                key={platform.id}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isConnected
                                        ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/30"
                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    }`}
                            >
                                {/* Platform icon */}
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${platform.color}`}>
                                    {platform.icon}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {platform.name}
                                    </div>
                                    {isConnected ? (
                                        <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                            Connected{conn?.platformUsername ? ` as @${conn.platformUsername}` : ""}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-400">{platform.desc}</div>
                                    )}
                                </div>

                                {/* Action */}
                                {isConnected ? (
                                    <button
                                        onClick={() => handleDisconnect(platform.id)}
                                        disabled={isDisconnecting}
                                        className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50"
                                    >
                                        {isDisconnecting ? "..." : "Disconnect"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleConnect(platform.id)}
                                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${platform.color} ${platform.hoverColor}`}
                                    >
                                        Connect
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {/* Unconnectable platforms */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Coming Soon</div>
                        {[
                            { icon: "📸", name: "Instagram", note: "Requires Facebook Business setup" },
                            { icon: "🎵", name: "TikTok", note: "Requires developer approval" },
                            { icon: "▶️", name: "YouTube", note: "Complex quota system" },
                        ].map(p => (
                            <div key={p.name} className="flex items-center gap-3 py-2 px-1">
                                <span className="text-lg w-6 text-center">{p.icon}</span>
                                <div>
                                    <span className="text-sm text-slate-500">{p.name}</span>
                                    <span className="text-xs text-slate-400 ml-2">— {p.note}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
