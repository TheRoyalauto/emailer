"use client";

import { useState } from "react";

interface AICopywriterProps {
    onGenerated: (subject: string, body: string) => void;
    onClose: () => void;
}

const TONES = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly & Warm" },
    { value: "urgent", label: "Urgent & Direct" },
    { value: "casual", label: "Casual & Conversational" },
    { value: "formal", label: "Formal & Corporate" },
];

const TEMPLATES = [
    { value: "", label: "Custom prompt..." },
    { value: "cold_outreach", label: "Cold Outreach", prompt: "Write a cold outreach email to introduce our services" },
    { value: "follow_up", label: "Follow-up", prompt: "Write a follow-up email after initial contact with no response" },
    { value: "meeting_request", label: "Meeting Request", prompt: "Write an email requesting a brief meeting or call" },
    { value: "value_prop", label: "Value Proposition", prompt: "Write an email highlighting the key benefits of working with us" },
    { value: "reconnect", label: "Reconnect", prompt: "Write an email to reconnect with a past contact or client" },
];

export default function AICopywriter({ onGenerated, onClose }: AICopywriterProps) {
    const [prompt, setPrompt] = useState("");
    const [tone, setTone] = useState("professional");
    const [templateType, setTemplateType] = useState("");
    const [context, setContext] = useState("");
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<{ subject: string; body: string } | null>(null);

    const handleTemplateChange = (value: string) => {
        setTemplateType(value);
        const template = TEMPLATES.find(t => t.value === value);
        if (template?.prompt) {
            setPrompt(template.prompt);
        }
    };

    const handleGenerate = async () => {
        if (!prompt && !templateType) {
            setError("Please enter a prompt or select a template");
            return;
        }

        setGenerating(true);
        setError(null);

        try {
            const fullPrompt = context
                ? `${prompt}\n\nContext: ${context}`
                : prompt;

            const response = await fetch("/api/generate-copy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    tone,
                    includeSubject: true,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate");
            }

            setPreview({
                subject: data.subject || "",
                body: data.body || "",
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Generation failed");
        } finally {
            setGenerating(false);
        }
    };

    const handleUse = () => {
        if (preview) {
            onGenerated(preview.subject, preview.body);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#12121f] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🤖</span>
                        <div>
                            <h2 className="text-xl font-bold">AI Copywriter</h2>
                            <p className="text-sm text-white/50">Generate email copy with AI</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {!preview ? (
                        <>
                            {/* Template Selection */}
                            <div>
                                <label className="text-sm text-white/50 mb-2 block">Quick Template</label>
                                <select
                                    value={templateType}
                                    onChange={(e) => handleTemplateChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                >
                                    {TEMPLATES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Prompt */}
                            <div>
                                <label className="text-sm text-white/50 mb-2 block">What do you want to write?</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg resize-none h-24"
                                    placeholder="E.g., Write a follow-up email for a potential client who hasn't responded in 2 weeks..."
                                />
                            </div>

                            {/* Context */}
                            <div>
                                <label className="text-sm text-white/50 mb-2 block">Additional Context (optional)</label>
                                <textarea
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg resize-none h-20"
                                    placeholder="E.g., We offer digital marketing services, targeting small businesses..."
                                />
                            </div>

                            {/* Tone */}
                            <div>
                                <label className="text-sm text-white/50 mb-2 block">Tone</label>
                                <div className="flex flex-wrap gap-2">
                                    {TONES.map(t => (
                                        <button
                                            key={t.value}
                                            onClick={() => setTone(t.value)}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${tone === t.value
                                                    ? "bg-indigo-500 text-white"
                                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                                }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}
                        </>
                    ) : (
                        /* Preview */
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-white/70">Generated Copy</h3>
                                <button
                                    onClick={() => setPreview(null)}
                                    className="text-sm text-indigo-400 hover:underline"
                                >
                                    ← Generate again
                                </button>
                            </div>

                            <div>
                                <label className="text-xs text-white/50 mb-1 block">Subject Line</label>
                                <input
                                    type="text"
                                    value={preview.subject}
                                    onChange={(e) => setPreview({ ...preview, subject: e.target.value })}
                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-white/50 mb-1 block">Email Body</label>
                                <textarea
                                    value={preview.body}
                                    onChange={(e) => setPreview({ ...preview, body: e.target.value })}
                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg resize-none h-64"
                                />
                            </div>

                            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-400">
                                💡 Edit the generated copy above before using it
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                    >
                        Cancel
                    </button>
                    {!preview ? (
                        <button
                            onClick={handleGenerate}
                            disabled={generating || (!prompt && !templateType)}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {generating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    ✨ Generate Copy
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleUse}
                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-medium"
                        >
                            Use This Copy
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
