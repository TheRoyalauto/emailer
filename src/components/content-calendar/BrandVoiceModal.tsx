"use client";

import { useState, useEffect } from "react";
import { api } from "@/../convex/_generated/api";
import { useAuthQuery, useAuthMutation } from "@/hooks/useAuthConvex";

const TONE_OPTIONS = [
    { value: "direct", label: "Direct", desc: "Confident, clear, no-nonsense" },
    { value: "playful", label: "Playful", desc: "Fun, witty, energetic" },
    { value: "professional", label: "Professional", desc: "Polished, authoritative, trustworthy" },
    { value: "casual", label: "Casual", desc: "Relaxed, conversational, friendly" },
    { value: "bold", label: "Bold", desc: "Provocative, edgy, attention-grabbing" },
];

interface BrandVoiceModalProps {
    onClose: () => void;
}

export function BrandVoiceModal({ onClose }: BrandVoiceModalProps) {
    const brandVoice = useAuthQuery(api.contentBrandVoice.get);
    const upsertVoice = useAuthMutation(api.contentBrandVoice.upsert);

    const [form, setForm] = useState({
        tone: "professional",
        bannedWords: [] as string[],
        defaultCta: "",
        defaultHashtags: [] as string[],
        brandDescription: "",
    });
    const [wordInput, setWordInput] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (brandVoice) {
            setForm({
                tone: brandVoice.tone || "professional",
                bannedWords: brandVoice.bannedWords || [],
                defaultCta: brandVoice.defaultCta || "",
                defaultHashtags: brandVoice.defaultHashtags || [],
                brandDescription: brandVoice.brandDescription || "",
            });
        }
    }, [brandVoice]);

    const addBannedWord = () => {
        const w = wordInput.trim().toLowerCase();
        if (w && !form.bannedWords.includes(w)) {
            setForm(f => ({ ...f, bannedWords: [...f.bannedWords, w] }));
        }
        setWordInput("");
    };

    const removeBannedWord = (word: string) => {
        setForm(f => ({ ...f, bannedWords: f.bannedWords.filter(w => w !== word) }));
    };

    const addHashtag = () => {
        let tag = tagInput.trim();
        if (!tag.startsWith("#")) tag = `#${tag}`;
        if (tag.length > 1 && !form.defaultHashtags.includes(tag)) {
            setForm(f => ({ ...f, defaultHashtags: [...f.defaultHashtags, tag] }));
        }
        setTagInput("");
    };

    const removeHashtag = (tag: string) => {
        setForm(f => ({ ...f, defaultHashtags: f.defaultHashtags.filter(t => t !== tag) }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await upsertVoice({
                tone: form.tone,
                bannedWords: form.bannedWords,
                defaultCta: form.defaultCta || undefined,
                defaultHashtags: form.defaultHashtags.length ? form.defaultHashtags : undefined,
                brandDescription: form.brandDescription || undefined,
            });
            onClose();
        } catch (err) {
            console.error("Save failed:", err);
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Brand Voice Settings</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Configure how AI generates your content</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">✕</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Tone */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Tone</label>
                        <div className="grid grid-cols-1 gap-2">
                            {TONE_OPTIONS.map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => setForm(f => ({ ...f, tone: t.value }))}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${form.tone === t.value
                                            ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800"
                                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                        }`}
                                >
                                    <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${form.tone === t.value
                                            ? "border-indigo-600 bg-indigo-600"
                                            : "border-slate-300 dark:border-slate-600"
                                        }`}>
                                        {form.tone === t.value && (
                                            <div className="w-full h-full rounded-full bg-white scale-[0.35]" />
                                        )}
                                    </div>
                                    <div>
                                        <div className={`text-sm font-medium ${form.tone === t.value ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300"}`}>
                                            {t.label}
                                        </div>
                                        <div className="text-xs text-slate-400">{t.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Brand Description */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Brand Description</label>
                        <textarea
                            value={form.brandDescription}
                            onChange={e => setForm(f => ({ ...f, brandDescription: e.target.value }))}
                            rows={3}
                            placeholder="Describe your brand personality, target audience, and key messaging themes..."
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none resize-none placeholder:text-slate-400"
                        />
                    </div>

                    {/* Default CTA */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Default CTA</label>
                        <input
                            value={form.defaultCta}
                            onChange={e => setForm(f => ({ ...f, defaultCta: e.target.value }))}
                            placeholder='e.g. "Start your free trial at e-mailer.io"'
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none placeholder:text-slate-400"
                        />
                    </div>

                    {/* Default Hashtags */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Default Hashtags</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addHashtag())}
                                placeholder="#emailmarketing"
                                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none placeholder:text-slate-400"
                            />
                            <button
                                onClick={addHashtag}
                                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        {form.defaultHashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {form.defaultHashtags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 text-xs font-medium">
                                        {tag}
                                        <button onClick={() => removeHashtag(tag)} className="text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-200">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Banned Words */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Banned Words</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                value={wordInput}
                                onChange={e => setWordInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addBannedWord())}
                                placeholder="Word to ban..."
                                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none placeholder:text-slate-400"
                            />
                            <button
                                onClick={addBannedWord}
                                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        {form.bannedWords.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {form.bannedWords.map(word => (
                                    <span key={word} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium">
                                        {word}
                                        <button onClick={() => removeBannedWord(word)} className="text-red-400 hover:text-red-600 dark:hover:text-red-200">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-sm font-medium">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 text-sm"
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>
        </div>
    );
}
