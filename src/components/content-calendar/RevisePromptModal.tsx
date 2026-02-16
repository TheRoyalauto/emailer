"use client";

import { useState } from "react";

interface RevisePromptModalProps {
    count: number;
    onClose: () => void;
    onSubmit: (prompt: string) => Promise<void>;
}

export function RevisePromptModal({ count, onClose, onSubmit }: RevisePromptModalProps) {
    const [prompt, setPrompt] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!prompt.trim()) return;
        setSubmitting(true);
        await onSubmit(prompt.trim());
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Revise Content</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Revising {count} {count === 1 ? "post" : "posts"} with your guidance</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">✕</button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        rows={4}
                        placeholder="Tell the AI how to revise the selected posts. Examples:

• Make the hooks more provocative
• Focus on pain points around deliverability
• Add more urgency to the CTAs
• Make the tone more casual and relatable"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none resize-none placeholder:text-slate-400"
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-sm font-medium">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!prompt.trim() || submitting}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 text-sm flex items-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                Revising...
                            </>
                        ) : (
                            <>✨ Revise Posts</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
