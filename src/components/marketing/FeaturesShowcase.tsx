"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════ */

/* ─── Cursor Glow ─── */
function CursorGlow() {
    const [pos, setPos] = useState({ x: -300, y: -300 });
    useEffect(() => {
        const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", handler);
        return () => window.removeEventListener("mousemove", handler);
    }, []);
    return (
        <div
            className="pointer-events-none fixed z-50"
            style={{
                left: pos.x - 250,
                top: pos.y - 250,
                width: 500,
                height: 500,
                background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 60%)",
                borderRadius: "50%",
                transition: "left 0.1s ease-out, top 0.1s ease-out",
            }}
        />
    );
}

/* ─── 3D Tilt Card ─── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState({ transform: "perspective(800px) rotateX(0deg) rotateY(0deg)" });
    const [glow, setGlow] = useState({ x: 50, y: 50 });

    const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        setStyle({
            transform: `perspective(800px) rotateX(${(y - 0.5) * -10}deg) rotateY(${(x - 0.5) * 10}deg) scale3d(1.015,1.015,1.015)`,
        });
        setGlow({ x: x * 100, y: y * 100 });
    }, []);

    const onLeave = useCallback(() => {
        setStyle({ transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)" });
        setGlow({ x: 50, y: 50 });
    }, []);

    return (
        <div
            ref={ref}
            className={`relative ${className}`}
            style={{ ...style, transition: "transform 0.35s cubic-bezier(0.03,0.98,0.52,0.99)", transformStyle: "preserve-3d" }}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
        >
            <div
                className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(6,182,212,0.08) 0%, transparent 60%)`,
                }}
            />
            {children}
        </div>
    );
}

/* ─── Animated Counter ─── */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        if (!inView) return;
        const dur = 2000;
        const start = performance.now();
        const step = (now: number) => {
            const p = Math.min((now - start) / dur, 1);
            setDisplay(Math.round(value * (1 - Math.pow(1 - p, 4))));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [inView, value]);
    return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

/* ─── Scroll Reveal ─── */
function Reveal({ children, delay = 0, direction = "up" }: { children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" | "scale" }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    const v = {
        up: { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } },
        left: { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } },
        right: { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } },
        scale: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
    };
    return (
        <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={v[direction]} transition={{ duration: 0.65, delay, ease: [0.25, 0.46, 0.45, 0.94] }}>
            {children}
        </motion.div>
    );
}

/* ─── Window Chrome (neutral/Windows style) ─── */
function WindowChrome({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
            {/* Title bar — neutral Windows-style */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                    <span className="text-xs text-slate-500 font-medium">{title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {badge}
                    {/* Windows-style controls */}
                    <div className="flex items-center gap-0.5 ml-2">
                        <div className="w-3 h-3 flex items-center justify-center hover:bg-slate-200 rounded-sm transition-colors">
                            <div className="w-2 h-px bg-slate-400" />
                        </div>
                        <div className="w-3 h-3 flex items-center justify-center hover:bg-slate-200 rounded-sm transition-colors">
                            <div className="w-1.5 h-1.5 border border-slate-400 rounded-[1px]" />
                        </div>
                        <div className="w-3 h-3 flex items-center justify-center hover:bg-red-100 rounded-sm transition-colors">
                            <svg className="w-2 h-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
}

/* ═══════════════════════════════════════════
   INTERACTIVE DEMO COMPONENTS
   ═══════════════════════════════════════════ */

/* ─── Live Email Typing Demo ─── */
function EmailTypingDemo() {
    const [text, setText] = useState("");
    const [done, setDone] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    const lines = [
        "Hi Sarah,",
        "",
        "I noticed Meridian Cloud just expanded into the EU market —",
        "congrats on the Munich office. Given your team's growth,",
        "I imagine outbound pipeline is top priority right now.",
        "",
        "We built E-mailer specifically for scaling teams like yours.",
        "Our AI writes truly personalized emails (not templates)",
        "and delivers 98.7% inbox placement.",
        "",
        "Would a 15-min demo next week make sense?",
        "",
        "Best,",
        "Alex",
    ];

    useEffect(() => {
        if (!inView) return;
        const full = lines.join("\n");
        let i = 0;
        const iv = setInterval(() => {
            if (i <= full.length) { setText(full.slice(0, i)); i++; }
            else { clearInterval(iv); setDone(true); }
        }, 20);
        return () => clearInterval(iv);
    }, [inView]);

    return (
        <div ref={ref}>
            <WindowChrome
                title="New Email — AI Composing"
                badge={done ? (
                    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                        ✓ AI Generated
                    </motion.span>
                ) : undefined}
            >
                {/* Fields */}
                <div className="px-5 py-3 border-b border-slate-100 space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 w-10">To:</span>
                        <span className="text-sm text-slate-700">sarah.chen@meridiancloud.io</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 w-10">Subject:</span>
                        <span className="text-sm text-slate-700">Congrats on the EU expansion, Sarah 🚀</span>
                    </div>
                </div>
                {/* Body */}
                <div className="px-5 py-4 min-h-[240px]">
                    <pre className="text-sm text-slate-600 font-sans whitespace-pre-wrap leading-relaxed">
                        {text}
                        <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-[2px] h-4 bg-cyan-500 ml-0.5 align-middle" />
                    </pre>
                </div>
                {/* Bottom bar */}
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[11px] text-cyan-600/70 font-medium">AI personalization active</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Score: 98/100</span>
                </div>
            </WindowChrome>
        </div>
    );
}

/* ─── Animated Sequence Flow ─── */
function SequenceFlowDemo() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    const steps = [
        { label: "Day 1", action: "Initial email sent", status: "sent", dot: "bg-cyan-500" },
        { label: "Day 3", action: "Opened · No reply", status: "tracking", dot: "bg-amber-500" },
        { label: "Day 5", action: "Follow-up #1 sent", status: "sent", dot: "bg-cyan-500" },
        { label: "Day 7", action: "Link clicked", status: "engaged", dot: "bg-emerald-500" },
        { label: "Day 8", action: "Follow-up #2 sent", status: "sent", dot: "bg-cyan-500" },
        { label: "Day 9", action: "Reply received ✓", status: "success", dot: "bg-emerald-500" },
    ];

    return (
        <div ref={ref}>
            <WindowChrome title="Sequence: Enterprise Outbound Q1">
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-xs text-cyan-600 font-medium">Live</span>
                        <span className="text-xs text-slate-400 ml-auto">6 steps · 9 days</span>
                    </div>
                    <div className="space-y-2">
                        {steps.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                transition={{ duration: 0.45, delay: i * 0.15 }}
                                className="flex items-center gap-3"
                            >
                                <div className="flex flex-col items-center w-6">
                                    <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                                    {i < steps.length - 1 && <div className="w-px h-5 bg-slate-200" />}
                                </div>
                                <div className="flex-1 flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 hover:border-slate-200 transition-colors">
                                    <div>
                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">{s.label}</span>
                                        <p className="text-sm text-slate-700">{s.action}</p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${s.status === "success" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                        s.status === "engaged" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                            s.status === "tracking" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                "bg-cyan-50 text-cyan-600 border-cyan-200"
                                        }`}>
                                        {s.status}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </WindowChrome>
        </div>
    );
}

/* ─── Deliverability Gauge ─── */
function DeliverabilityGauge() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <WindowChrome title="Deliverability Monitor">
            <div ref={ref} className="p-5">
                <div className="flex items-center justify-center mb-5">
                    <div className="relative w-36 h-36">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                            <motion.circle
                                cx="60" cy="60" r="50" fill="none" stroke="url(#gaugeGradLight)" strokeWidth="8" strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 50}
                                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                                animate={inView ? { strokeDashoffset: 2 * Math.PI * 50 * (1 - 0.987) } : { strokeDashoffset: 2 * Math.PI * 50 }}
                                transition={{ duration: 2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            />
                            <defs>
                                <linearGradient id="gaugeGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#06B6D4" />
                                    <stop offset="100%" stopColor="#10B981" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-slate-900 tracking-tight">
                                {inView ? <Counter value={98} suffix=".7%" /> : "0%"}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Inbox Rate</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: "SPF", status: "Pass" },
                        { label: "DKIM", status: "Pass" },
                        { label: "DMARC", status: "Pass" },
                    ].map((c) => (
                        <div key={c.label} className="text-center bg-emerald-50/50 rounded-lg py-2 border border-emerald-100">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest block">{c.label}</span>
                            <span className="text-xs font-semibold text-emerald-600">✓ {c.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </WindowChrome>
    );
}

/* ─── Analytics Preview ─── */
function AnalyticsPreview() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const bars = [35, 52, 48, 71, 63, 85, 78, 92, 88, 95, 91, 97];

    return (
        <WindowChrome title="Campaign Analytics">
            <div ref={ref} className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-500 font-medium">Reply rate trend</span>
                    <span className="text-[10px] text-slate-400">Last 12 weeks</span>
                </div>
                <div className="flex items-end gap-1.5 h-28 mb-4">
                    {bars.map((h, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 rounded-t"
                            style={{ background: "linear-gradient(to top, #06B6D4, #67E8F9)" }}
                            initial={{ height: 0 }}
                            animate={inView ? { height: `${h}%` } : { height: 0 }}
                            transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        />
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: "Opens", value: "67.3%" },
                        { label: "Replies", value: "23.1%" },
                        { label: "Meetings", value: "142" },
                    ].map((s) => (
                        <div key={s.label} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">{s.label}</span>
                            <span className="text-base font-semibold text-slate-900">{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </WindowChrome>
    );
}

/* ═══════════════════════════════════════════
   FEATURE DATA
   ═══════════════════════════════════════════ */
const bentoFeatures = [
    {
        title: "AI-Powered Writing",
        desc: "Our AI researches each prospect, then writes emails that feel hand-crafted. Adapts to your tone, style, and industry.",
        tags: ["Per-prospect research", "Style adaptation", "Multi-variant", "Compliance"],
        accent: "cyan",
    },
    {
        title: "Smart Sequences",
        desc: "Multi-step campaigns with conditional logic. Auto-pause on replies, adjust send times per timezone.",
        tags: ["Conditional branching", "Auto-pause", "Timezone-aware", "A/B testing"],
        accent: "violet",
    },
    {
        title: "Email Warm-up",
        desc: "Automatically build sender reputation. Production-ready in 2-3 weeks with our warm-up network.",
        tags: ["Gradual ramp-up", "Auto-optimization"],
        accent: "emerald",
    },
    {
        title: "Spam Testing",
        desc: "Test against every major spam filter before hitting send. Get actionable fix suggestions.",
        tags: ["Pre-send checks", "Fix suggestions"],
        accent: "amber",
    },
    {
        title: "Real-time Analytics",
        desc: "Track opens, clicks, replies as they happen. Know exactly which messages drive pipeline.",
        tags: ["Live dashboards", "Custom reports"],
        accent: "sky",
    },
    {
        title: "CRM Integrations",
        desc: "Two-way sync with Salesforce, HubSpot, Pipedrive. Keep your pipeline updated automatically.",
        tags: ["HubSpot & Salesforce", "Auto-sync"],
        accent: "pink",
    },
    {
        title: "Reply Classification",
        desc: "AI classifies every reply — positive, objection, OoO — and routes them automatically.",
        tags: ["AI classification", "Smart routing"],
        accent: "lime",
    },
    {
        title: "Multi-Account",
        desc: "Connect unlimited email accounts. Rotate senders automatically for better deliverability.",
        tags: ["Unlimited accounts", "Smart rotation"],
        accent: "fuchsia",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string; tagBg: string }> = {
    cyan: { bg: "bg-cyan-50", border: "border-cyan-100", text: "text-cyan-700", tagBg: "bg-cyan-50 text-cyan-600 border-cyan-200" },
    violet: { bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-700", tagBg: "bg-violet-50 text-violet-600 border-violet-200" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", tagBg: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    amber: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", tagBg: "bg-amber-50 text-amber-600 border-amber-200" },
    sky: { bg: "bg-sky-50", border: "border-sky-100", text: "text-sky-700", tagBg: "bg-sky-50 text-sky-600 border-sky-200" },
    pink: { bg: "bg-pink-50", border: "border-pink-100", text: "text-pink-700", tagBg: "bg-pink-50 text-pink-600 border-pink-200" },
    lime: { bg: "bg-lime-50", border: "border-lime-100", text: "text-lime-700", tagBg: "bg-lime-50 text-lime-600 border-lime-200" },
    fuchsia: { bg: "bg-fuchsia-50", border: "border-fuchsia-100", text: "text-fuchsia-700", tagBg: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200" },
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function FeaturesShowcase() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <>
            <CursorGlow />

            {/* ═══ HERO ═══ */}
            <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#FAFBFC]">
                {/* Ambient gradient blobs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-[500px] h-[500px] -top-32 -right-32 rounded-full bg-gradient-to-br from-cyan-100/60 to-transparent blur-[100px] animate-drift-slow" />
                    <div className="absolute w-[400px] h-[400px] -bottom-32 -left-32 rounded-full bg-gradient-to-tr from-violet-100/40 to-transparent blur-[100px] animate-drift-medium" />
                    <div className="absolute w-[300px] h-[300px] top-1/3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-100/30 to-transparent blur-[80px] animate-drift-fast" />
                </div>

                {/* Subtle grid */}
                <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center pt-32">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-200 bg-cyan-50/50 mb-8">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-xs text-cyan-700 font-semibold tracking-wide">PLATFORM FEATURES</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        className="font-heading text-5xl md:text-6xl lg:text-7xl font-semibold text-slate-900 tracking-[-0.04em] mb-6 leading-[1.05]"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        Every feature built for
                        <br />
                        <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                            one thing: replies
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        Not vanity metrics. Not open rates. Every tool in E-mailer is engineered to
                        get prospects to respond. AI writing, smart sequences, inbox-grade deliverability.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <Link href="/register" className="group relative px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl tracking-[-0.01em] overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98]">
                            Start Free Trial →
                        </Link>
                        <Link href="/how-it-works" className="px-8 py-4 text-slate-600 font-semibold rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-md transition-all">
                            See How It Works
                        </Link>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div className="mt-20" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
                        <div className="w-5 h-9 rounded-full border-2 border-slate-300 flex items-start justify-center p-1.5 mx-auto">
                            <motion.div className="w-1 h-2 rounded-full bg-cyan-500" animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} />
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ═══ FEATURE: AI WRITING ═══ */}
            <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
                <div className="absolute w-[400px] h-[400px] -top-20 -right-20 rounded-full bg-cyan-50/80 blur-[100px]" />
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <Reveal direction="left">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-200 bg-cyan-50 mb-6">
                                    <span className="text-[10px] text-cyan-700 font-semibold uppercase tracking-widest">Core Feature</span>
                                </div>
                                <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 tracking-[-0.03em] mb-5">
                                    AI that writes like your <span className="text-cyan-600">best rep</span>
                                </h2>
                                <p className="text-slate-500 leading-relaxed mb-8 max-w-lg">
                                    Our AI doesn't just fill in {'{{first_name}}'}. It researches each prospect's company,
                                    role, recent news, and industry — then writes an email you'd be proud to send yourself.
                                </p>
                                <div className="space-y-3">
                                    {["Researches LinkedIn, company site, and news for each prospect", "Adapts to your writing style — formal, casual, or something in between", "Generates multiple variants so you can pick the best one", "Built-in CAN-SPAM, GDPR, and CASL compliance checks"].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <svg className="w-3 h-3 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                            </div>
                                            <span className="text-sm text-slate-600">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Reveal>
                        <Reveal direction="right" delay={0.15}>
                            <EmailTypingDemo />
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ═══ FEATURE: SEQUENCES ═══ */}
            <section className="relative py-24 lg:py-32 bg-[#FAFBFC] overflow-hidden">
                <div className="absolute w-[400px] h-[400px] bottom-0 left-0 rounded-full bg-violet-50/80 blur-[100px]" />
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <Reveal direction="left" delay={0.15}>
                            <SequenceFlowDemo />
                        </Reveal>
                        <Reveal direction="right">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-50 mb-6">
                                    <span className="text-[10px] text-violet-700 font-semibold uppercase tracking-widest">Automation</span>
                                </div>
                                <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 tracking-[-0.03em] mb-5">
                                    Sequences that <span className="text-violet-600">think</span>
                                </h2>
                                <p className="text-slate-500 leading-relaxed mb-8 max-w-lg">
                                    Not just timed follow-ups. E-mailer sequences react to prospect behavior —
                                    opens, clicks, replies, silence. Each path triggers the right next step.
                                </p>
                                <div className="space-y-3">
                                    {["Multi-step campaigns with unlimited conditional branches", "Auto-pause when a prospect replies — no awkward double-sends", "AI-optimized send times per recipient timezone", "Built-in A/B testing across subject lines, body, and CTAs"].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <svg className="w-3 h-3 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                            </div>
                                            <span className="text-sm text-slate-600">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ═══ FEATURE: DELIVERABILITY + ANALYTICS ═══ */}
            <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
                <div className="absolute w-[500px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-50/60 blur-[100px]" />
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                    <Reveal>
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 mb-6">
                                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-widest">Intelligence</span>
                            </div>
                            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 tracking-[-0.03em] mb-4">
                                Deliverability you can <span className="text-emerald-600">see</span>
                            </h2>
                            <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                                Real-time monitoring of sender reputation, authentication, and campaign performance.
                                No guessing. No surprises.
                            </p>
                        </div>
                    </Reveal>
                    <div className="grid lg:grid-cols-2 gap-8">
                        <Reveal delay={0.1}><DeliverabilityGauge /></Reveal>
                        <Reveal delay={0.2}><AnalyticsPreview /></Reveal>
                    </div>
                </div>
            </section>

            {/* ═══ BENTO GRID ═══ */}
            <section className="relative py-24 lg:py-32 bg-[#FAFBFC] overflow-hidden">
                <div className="absolute w-[400px] h-[400px] top-20 right-20 rounded-full bg-cyan-50/50 blur-[80px]" />
                <div className="absolute w-[300px] h-[300px] bottom-20 left-20 rounded-full bg-violet-50/40 blur-[80px]" />
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                    <Reveal>
                        <div className="text-center mb-16">
                            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 tracking-[-0.03em] mb-4">
                                Everything else you need
                            </h2>
                            <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                                Every tool, integration, and capability to run outbound at scale — in one platform.
                            </p>
                        </div>
                    </Reveal>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {bentoFeatures.map((f, i) => {
                            const a = accentMap[f.accent] || accentMap.cyan;
                            return (
                                <Reveal key={i} delay={i * 0.05} direction="scale">
                                    <TiltCard className="group">
                                        <div className={`h-full p-6 rounded-2xl ${a.bg} border ${a.border} hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-500`}>
                                            <h3 className={`font-heading text-base font-semibold ${a.text} tracking-[-0.02em] mb-2`}>
                                                {f.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 leading-relaxed mb-4">{f.desc}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {f.tags.map((t) => (
                                                    <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${a.tagBg}`}>
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </TiltCard>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══ STATS ═══ */}
            <section className="py-20 bg-white border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { value: 500, suffix: "+", label: "Sales teams", sub: "since Jan 2025" },
                            { value: 98, suffix: ".7%", label: "Inbox rate", sub: "industry-leading" },
                            { value: 23, suffix: "%", label: "Avg. reply rate", sub: "vs 2-5% industry" },
                            { value: 5, suffix: " min", label: "Setup time", sub: "first campaign live" },
                        ].map((s, i) => (
                            <Reveal key={i} delay={i * 0.08}>
                                <div className="text-center">
                                    <div className="font-heading text-4xl lg:text-5xl font-semibold text-slate-900 tracking-[-0.04em]">
                                        <Counter value={s.value} suffix={s.suffix} />
                                    </div>
                                    <div className="text-sm text-slate-600 mt-1">{s.label}</div>
                                    <div className="text-[11px] text-slate-400">{s.sub}</div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="relative py-28 lg:py-36 bg-[#FAFBFC] overflow-hidden">
                <div className="absolute w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-50 to-violet-50 blur-[100px] opacity-60" />
                <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 text-center">
                    <Reveal>
                        <h2 className="font-heading text-3xl lg:text-5xl font-semibold text-slate-900 tracking-[-0.04em] mb-6">
                            Stop sending.
                            <br />
                            <span className="bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">
                                Start connecting.
                            </span>
                        </h2>
                        <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                            14-day free trial. No credit card. Launch your first AI-powered campaign in under 5 minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/register" className="px-10 py-5 bg-slate-900 text-white font-semibold rounded-xl tracking-[-0.01em] hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] transition-all text-lg">
                                Start Free Trial →
                            </Link>
                            <Link href="/compare" className="px-10 py-5 text-slate-600 font-semibold rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-md transition-all text-lg">
                                Compare Plans
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>
        </>
    );
}
