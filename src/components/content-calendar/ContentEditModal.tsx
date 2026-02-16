"use client";

import { useState, useEffect } from "react";

const PLATFORM_OPTIONS = [
    { value: "instagram", label: "Instagram", emoji: "📸" },
    { value: "x", label: "X (Twitter)", emoji: "𝕏" },
    { value: "linkedin", label: "LinkedIn", emoji: "💼" },
    { value: "tiktok", label: "TikTok", emoji: "🎵" },
    { value: "youtube", label: "YouTube", emoji: "▶️" },
];

const TYPE_OPTIONS = [
    { value: "reel", label: "Reel" },
    { value: "carousel", label: "Carousel" },
    { value: "short", label: "Short" },
    { value: "tweet_thread", label: "Tweet Thread" },
    { value: "story", label: "Story" },
    { value: "static_post", label: "Static Post" },
    { value: "video", label: "Video" },
    { value: "live", label: "Live" },
    { value: "poll", label: "Poll" },
];

const LOCKABLE_FIELDS = ["concept", "caption", "hashtags", "cta"] as const;

interface ContentEditModalProps {
    item: any;
    onClose: () => void;
    onSave: (updates: any) => Promise<void>;
}

export function ContentEditModal({ item, onClose, onSave }: ContentEditModalProps) {
    const [form, setForm] = useState({
        date: item.date,
        platforms: item.platforms as string[],
        type: item.type,
        concept: item.concept,
        caption: item.caption,
        hashtags: item.hashtags,
        cta: item.cta,
        assetNotes: item.assetNotes || "",
        status: item.status,
        lockedFields: item.lockedFields || [],
    });
    const [saving, setSaving] = useState(false);

    const togglePlatform = (p: string) => {
        setForm(f => ({
            ...f,
            platforms: f.platforms.includes(p)
                ? f.platforms.filter(x => x !== p)
                : [...f.platforms, p],
        }));
    };

    const toggleLock = (field: string) => {
        setForm(f => ({
            ...f,
            lockedFields: f.lockedFields.includes(field)
                ? f.lockedFields.filter((x: string) => x !== field)
                : [...f.lockedFields, field],
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Post</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">✕</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Date */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Date</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                        />
                    </div>

                    {/* Platforms */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Platforms</label>
                        <div className="flex flex-wrap gap-2">
                            {PLATFORM_OPTIONS.map(p => (
                                <button
                                    key={p.value}
                                    onClick={() => togglePlatform(p.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${form.platforms.includes(p.value)
                                            ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                                        }`}
                                >
                                    {p.emoji} {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Post Type</label>
                        <select
                            value={form.type}
                            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
                        >
                            {TYPE_OPTIONS.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Lockable fields */}
                    {LOCKABLE_FIELDS.map(field => (
                        <div key={field}>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                </label>
                                <button
                                    onClick={() => toggleLock(field)}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${form.lockedFields.includes(field)
                                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        }`}
                                    title="Lock this field to prevent AI from changing it during regeneration"
                                >
                                    {form.lockedFields.includes(field) ? "🔒 Locked" : "🔓 Lock"}
                                </button>
                            </div>
                            {field === "caption" ? (
                                <textarea
                                    value={(form as any)[field]}
                                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none resize-none"
                                />
                            ) : (
                                <input
                                    value={(form as any)[field]}
                                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                                />
                            )}
                        </div>
                    ))}

                    {/* Asset Notes */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Asset Notes</label>
                        <textarea
                            value={form.assetNotes}
                            onChange={e => setForm(f => ({ ...f, assetNotes: e.target.value }))}
                            rows={2}
                            placeholder="What visuals/recordings/b-roll to create..."
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none resize-none placeholder:text-slate-400"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
                        <div className="flex gap-2">
                            {["draft", "ready", "scheduled", "posted"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setForm(f => ({ ...f, status: s }))}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all capitalize ${form.status === s
                                            ? s === "draft" ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                                                : s === "ready" ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                                    : s === "scheduled" ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                                                        : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 text-sm"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
