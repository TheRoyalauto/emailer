"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Template Definitions ───────────────────────────────────────────────────────

interface VideoTemplate {
    id: string;
    name: string;
    emoji: string;
    description: string;
    duration: number; // seconds
}

const TEMPLATES: VideoTemplate[] = [
    { id: "text-reveal", name: "Text Reveal", emoji: "✍️", description: "Animated text typing with gradient background", duration: 6 },
    { id: "stats-counter", name: "Stats Counter", emoji: "📊", description: "Animated counting numbers with bold stats", duration: 5 },
    { id: "feature-showcase", name: "Feature Showcase", emoji: "🚀", description: "Product feature highlight with slide-in animations", duration: 7 },
    { id: "tip-card", name: "Quick Tip", emoji: "💡", description: "Knowledge tip card with flip animation", duration: 5 },
];

interface VideoPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    concept?: string;
    caption?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function VideoPreview({ isOpen, onClose, concept, caption }: VideoPreviewProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("text-reveal");
    const [headline, setHeadline] = useState(concept || "");
    const [subtext, setSubtext] = useState(caption || "");
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [animKey, setAnimKey] = useState(0);

    useEffect(() => {
        if (concept) setHeadline(concept);
        if (caption) setSubtext(caption);
    }, [concept, caption]);

    // ── Record video using canvas capture ────────────────────────────────────

    const handleRecord = useCallback(async () => {
        const el = canvasRef.current;
        if (!el) return;

        setIsRecording(true);
        setRecordedUrl(null);

        // Restart animation
        setAnimKey(k => k + 1);
        setIsPlaying(true);

        // Small delay for animation to start
        await new Promise(r => setTimeout(r, 100));

        try {
            // Use html2canvas approach: capture frames manually and build a webm
            // For browser compatibility, use MediaRecorder on a canvas
            const canvas = document.createElement("canvas");
            canvas.width = 1080;
            canvas.height = 1920;
            const ctx = canvas.getContext("2d")!;

            const stream = canvas.captureStream(30);
            const recorder = new MediaRecorder(stream, {
                mimeType: "video/webm;codecs=vp9",
                videoBitsPerSecond: 5000000,
            });

            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

            const template = TEMPLATES.find(t => t.id === selectedTemplate);
            const totalMs = (template?.duration || 5) * 1000;

            recorder.start();

            // Capture frames from the DOM element
            const startTime = Date.now();
            const frameInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                if (elapsed >= totalMs) {
                    clearInterval(frameInterval);
                    recorder.stop();
                    return;
                }

                // Draw the current state of the animation div onto canvas
                drawFrame(ctx, canvas.width, canvas.height, selectedTemplate, headline, subtext, elapsed / totalMs);
            }, 1000 / 30); // 30fps

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "video/webm" });
                const url = URL.createObjectURL(blob);
                setRecordedUrl(url);
                setIsRecording(false);
                setIsPlaying(false);
            };
        } catch (err) {
            console.error("Recording failed:", err);
            setIsRecording(false);
            setIsPlaying(false);
        }
    }, [selectedTemplate, headline, subtext]);

    // ── Play preview ─────────────────────────────────────────────────────────

    const handlePlay = () => {
        setAnimKey(k => k + 1);
        setIsPlaying(true);
        const template = TEMPLATES.find(t => t.id === selectedTemplate);
        setTimeout(() => setIsPlaying(false), (template?.duration || 5) * 1000);
    };

    // ── Download ─────────────────────────────────────────────────────────────

    const handleDownload = () => {
        if (!recordedUrl) return;
        const a = document.createElement("a");
        a.href = recordedUrl;
        a.download = `emailer-video-${Date.now()}.webm`;
        a.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">🎬 Video Creator</h2>
                        <p className="text-sm text-slate-500">Create branded short-form video content</p>
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
                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
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
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subtext</label>
                            <textarea
                                value={subtext}
                                onChange={e => setSubtext(e.target.value)}
                                rows={3}
                                placeholder="Supporting text"
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-2">
                            <button
                                onClick={handlePlay}
                                disabled={isRecording}
                                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                            >
                                ▶️ Preview
                            </button>
                            <button
                                onClick={handleRecord}
                                disabled={isRecording}
                                className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isRecording ? (
                                    <><div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" /> Recording...</>
                                ) : (
                                    <>🎥 Record Video</>
                                )}
                            </button>
                            {recordedUrl && (
                                <button
                                    onClick={handleDownload}
                                    className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    ⬇️ Download .webm
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="flex-1 bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
                        <div
                            ref={canvasRef}
                            className="w-[270px] h-[480px] rounded-2xl overflow-hidden relative shadow-2xl"
                            style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)" }}
                        >
                            <TemplateRenderer
                                key={animKey}
                                template={selectedTemplate}
                                headline={headline}
                                subtext={subtext}
                                isPlaying={isPlaying}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Template Renderer ──────────────────────────────────────────────────────────

function TemplateRenderer({ template, headline, subtext, isPlaying }: { template: string; headline: string; subtext: string; isPlaying: boolean }) {
    switch (template) {
        case "text-reveal":
            return <TextRevealTemplate headline={headline} subtext={subtext} isPlaying={isPlaying} />;
        case "stats-counter":
            return <StatsCounterTemplate headline={headline} subtext={subtext} isPlaying={isPlaying} />;
        case "feature-showcase":
            return <FeatureShowcaseTemplate headline={headline} subtext={subtext} isPlaying={isPlaying} />;
        case "tip-card":
            return <TipCardTemplate headline={headline} subtext={subtext} isPlaying={isPlaying} />;
        default:
            return <TextRevealTemplate headline={headline} subtext={subtext} isPlaying={isPlaying} />;
    }
}

// ─── Text Reveal Template ───────────────────────────────────────────────────────

function TextRevealTemplate({ headline, subtext, isPlaying }: { headline: string; subtext: string; isPlaying: boolean }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
            {/* Animated gradient orb */}
            <div className={`absolute w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl ${isPlaying ? "animate-pulse" : ""}`} style={{ top: "20%", left: "10%" }} />
            <div className={`absolute w-32 h-32 rounded-full bg-cyan-500/20 blur-3xl ${isPlaying ? "animate-pulse" : ""}`} style={{ bottom: "25%", right: "5%" }} />

            {/* Logo */}
            <div className={`mb-6 transition-all duration-1000 ${isPlaying ? "opacity-100 translate-y-0" : "opacity-70 translate-y-0"}`}>
                <div className="text-lg font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">E-MAILER.IO</div>
            </div>

            {/* Headline with typewriter effect simulation */}
            <h1 className={`text-xl font-extrabold text-white leading-tight mb-3 transition-all ${isPlaying ? "duration-1000 opacity-100 translate-y-0" : "opacity-100"}`}>
                {headline || "Your Headline Here"}
            </h1>

            {/* Subtext */}
            <p className={`text-[11px] text-slate-300 leading-relaxed max-w-[220px] transition-all ${isPlaying ? "duration-1000 delay-500 opacity-100 translate-y-0" : "opacity-80"}`}>
                {subtext || "Add your supporting text"}
            </p>

            {/* CTA shimmer */}
            <div className={`mt-6 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-bold transition-all ${isPlaying ? "duration-700 delay-1000 opacity-100 scale-100" : "opacity-70 scale-95"}`}>
                Learn More →
            </div>

            {/* Bottom accent line */}
            <div className={`absolute bottom-8 left-5 right-5 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all ${isPlaying ? "duration-2000 delay-1500 opacity-60 scale-x-100" : "opacity-30 scale-x-50"}`} />

            <style jsx>{`
                @keyframes type { from { width: 0; } to { width: 100%; } }
            `}</style>
        </div>
    );
}

// ─── Stats Counter Template ─────────────────────────────────────────────────────

function StatsCounterTemplate({ headline, subtext, isPlaying }: { headline: string; subtext: string; isPlaying: boolean }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isPlaying) { setCount(0); return; }
        const target = 10000;
        const frames = 90; // 3 seconds at 30fps
        let frame = 0;
        const interval = setInterval(() => {
            frame++;
            const progress = frame / frames;
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.round(target * eased));
            if (frame >= frames) clearInterval(interval);
        }, 33);
        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
            <div className="absolute w-56 h-56 rounded-full bg-purple-600/15 blur-3xl" style={{ top: "10%", right: "-10%" }} />

            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">
                {headline || "Campaign Results"}
            </div>

            <div className={`text-5xl font-black text-white mb-2 tabular-nums transition-all ${isPlaying ? "duration-300 scale-100" : "scale-90"}`}>
                {count.toLocaleString()}+
            </div>

            <div className="text-sm text-slate-300 font-semibold mb-6">Emails Sent</div>

            <div className="grid grid-cols-2 gap-3 w-full px-2">
                {[
                    { label: "Open Rate", val: "68%" },
                    { label: "Reply Rate", val: "24%" },
                    { label: "Meetings", val: "142" },
                    { label: "Revenue", val: "$340K" },
                ].map((stat, i) => (
                    <div key={stat.label} className={`p-2.5 rounded-xl bg-white/5 backdrop-blur-sm transition-all ${isPlaying ? `duration-500 opacity-100 translate-y-0` : "opacity-50 translate-y-2"}`} style={{ transitionDelay: isPlaying ? `${800 + i * 200}ms` : "0ms" }}>
                        <div className="text-lg font-bold text-white">{stat.val}</div>
                        <div className="text-[9px] text-slate-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className={`mt-5 text-[10px] text-slate-400 transition-all ${isPlaying ? "duration-500 delay-[2000ms] opacity-100" : "opacity-40"}`}>
                {subtext || "Powered by E-mailer.io"}
            </div>
        </div>
    );
}

// ─── Feature Showcase Template ──────────────────────────────────────────────────

function FeatureShowcaseTemplate({ headline, subtext, isPlaying }: { headline: string; subtext: string; isPlaying: boolean }) {
    return (
        <div className="absolute inset-0 flex flex-col px-5 pt-12 pb-8">
            <div className="absolute w-40 h-40 rounded-full bg-cyan-500/15 blur-3xl" style={{ top: "5%", left: "-5%" }} />

            {/* Logo */}
            <div className={`text-sm font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-wide mb-8 transition-all ${isPlaying ? "duration-500 opacity-100" : "opacity-70"}`}>
                E-MAILER.IO
            </div>

            {/* Feature icon */}
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl mb-4 transition-all ${isPlaying ? "duration-700 opacity-100 scale-100 rotate-0" : "opacity-50 scale-75 -rotate-12"}`}>
                🚀
            </div>

            {/* Headline */}
            <h2 className={`text-lg font-extrabold text-white leading-tight mb-2 transition-all ${isPlaying ? "duration-700 delay-300 opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
                {headline || "Feature Name"}
            </h2>

            {/* Description */}
            <p className={`text-[11px] text-slate-300 leading-relaxed mb-auto transition-all ${isPlaying ? "duration-700 delay-500 opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
                {subtext || "Describe the feature and its benefits"}
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-1.5 mt-4">
                {["AI-Powered", "Automated", "Real-time"].map((pill, i) => (
                    <span key={pill} className={`px-2.5 py-1 rounded-full text-[9px] font-bold bg-white/10 text-slate-300 transition-all ${isPlaying ? `duration-500 opacity-100 translate-y-0` : "opacity-0 translate-y-3"}`} style={{ transitionDelay: isPlaying ? `${1200 + i * 150}ms` : "0ms" }}>
                        {pill}
                    </span>
                ))}
            </div>

            {/* Bottom CTA bar */}
            <div className={`mt-4 flex items-center justify-between p-3 rounded-xl bg-white/5 transition-all ${isPlaying ? "duration-700 delay-[1800ms] opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <span className="text-[10px] text-white font-semibold">Try it free →</span>
                <span className="text-[9px] text-indigo-400">emailer.io</span>
            </div>
        </div>
    );
}

// ─── Tip Card Template ──────────────────────────────────────────────────────────

function TipCardTemplate({ headline, subtext, isPlaying }: { headline: string; subtext: string; isPlaying: boolean }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
            <div className="absolute w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" style={{ top: "30%", left: "20%" }} />

            {/* Tip badge */}
            <div className={`mb-5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 transition-all ${isPlaying ? "duration-500 opacity-100 scale-100" : "opacity-50 scale-90"}`}>
                <span className="text-xs font-bold text-amber-400">💡 Pro Tip</span>
            </div>

            {/* Main tip text */}
            <h2 className={`text-lg font-extrabold text-white leading-tight mb-3 transition-all ${isPlaying ? "duration-700 delay-200 opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                {headline || "Your Tip Here"}
            </h2>

            {/* Explanation */}
            <p className={`text-[11px] text-slate-300 leading-relaxed max-w-[220px] mb-6 transition-all ${isPlaying ? "duration-700 delay-500 opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                {subtext || "Explain why this tip matters and how to apply it"}
            </p>

            {/* Steps */}
            <div className="space-y-2 w-full px-2">
                {["Set up your campaign", "Write compelling copy", "Hit send & watch results"].map((step, i) => (
                    <div key={step} className={`flex items-center gap-2.5 p-2 rounded-lg bg-white/5 transition-all ${isPlaying ? `duration-500 opacity-100 translate-x-0` : "opacity-0 translate-x-4"}`} style={{ transitionDelay: isPlaying ? `${800 + i * 250}ms` : "0ms" }}>
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">{i + 1}</div>
                        <span className="text-[10px] text-slate-300">{step}</span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className={`mt-6 text-[9px] text-indigo-400 font-semibold transition-all ${isPlaying ? "duration-500 delay-[2000ms] opacity-100" : "opacity-0"}`}>
                @emailer.io • Follow for more tips
            </div>
        </div>
    );
}

// ─── Canvas Frame Renderer (for recording) ──────────────────────────────────────

function drawFrame(
    ctx: CanvasRenderingContext2D,
    w: number, h: number,
    template: string,
    headline: string,
    subtext: string,
    progress: number // 0 to 1
) {
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#1E1B4B");
    grad.addColorStop(0.5, "#312E81");
    grad.addColorStop(1, "#4C1D95");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Ambient glow
    ctx.save();
    ctx.globalAlpha = 0.15;
    const Circle = (cx: number, cy: number, r: number, color: string) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, color);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    };
    Circle(w * 0.3, h * 0.25, 300, "#6366f1");
    Circle(w * 0.7, h * 0.65, 250, "#06b6d4");
    ctx.restore();

    // Text (simplified — all templates render similarly in recorded version)
    const alpha = Math.min(progress * 3, 1);
    ctx.globalAlpha = alpha;

    // Logo
    ctx.font = "bold 36px system-ui";
    ctx.fillStyle = "#818cf8";
    ctx.textAlign = "center";
    ctx.fillText("E-MAILER.IO", w / 2, h * 0.15);

    // Headline
    const headAlpha = Math.min(Math.max((progress - 0.1) * 4, 0), 1);
    ctx.globalAlpha = headAlpha;
    ctx.font = "900 72px system-ui";
    ctx.fillStyle = "#ffffff";

    // Word wrap
    const words = (headline || "Your Headline Here").split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
        const test = line + (line ? " " : "") + word;
        if (ctx.measureText(test).width > w * 0.8) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    }
    lines.push(line);

    const lineHeight = 85;
    const startY = h / 2 - (lines.length * lineHeight) / 2;
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], w / 2, startY + i * lineHeight);
    }

    // Subtext
    const subAlpha = Math.min(Math.max((progress - 0.3) * 3, 0), 1);
    ctx.globalAlpha = subAlpha;
    ctx.font = "400 32px system-ui";
    ctx.fillStyle = "#cbd5e1";
    const subLines = (subtext || "Supporting text").substring(0, 100);
    ctx.fillText(subLines, w / 2, h * 0.7);

    // CTA button
    const ctaAlpha = Math.min(Math.max((progress - 0.5) * 3, 0), 1);
    ctx.globalAlpha = ctaAlpha;
    const ctaW = 280, ctaH = 60;
    const ctaX = w / 2 - ctaW / 2, ctaY = h * 0.8;
    const ctaGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaW, ctaY);
    ctaGrad.addColorStop(0, "#6366f1");
    ctaGrad.addColorStop(1, "#06b6d4");
    ctx.fillStyle = ctaGrad;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 30);
    ctx.fill();
    ctx.font = "bold 24px system-ui";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Learn More →", w / 2, ctaY + 38);

    ctx.globalAlpha = 1;
}
