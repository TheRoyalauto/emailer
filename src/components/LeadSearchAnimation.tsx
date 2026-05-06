"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface LiveLog {
    id: string;
    elapsedMs: number;
    level: string;
    text: string;
}

interface LeadSearchAnimationProps {
    isActive: boolean;
    prompt?: string;
    industry?: string;
    locations?: string[];
    liveLogs?: LiveLog[];
    liveLeadsFound?: number;
    livePhase?: { idx: number; label: string } | null;
    soundMuted?: boolean;
    onToggleSound?: () => void;
    onCancel?: () => void;
    canCancel?: boolean;
    /**
     * Live leads (with state field) — when present, pings are positioned at
     * geographic angles instead of random ones. CA → west, NY → east, etc.
     */
    liveLeads?: { state?: string }[];
    /** Ping audio cue — fires once per spawn (in addition to phase/lead sounds). */
    onPing?: () => void;
}

/**
 * Maps US state abbreviations to a radar angle (radians).
 * 0 = right (east), -π/2 = top (north), π = left (west), π/2 = bottom (south).
 *
 * The mapping puts coastal states at their cardinal/inter-cardinal positions
 * and squeezes the rest into the gaps. Not a real projection — just enough
 * geographic intuition that NY pings land east, CA pings land west, etc.
 */
const STATE_TO_ANGLE: Record<string, number> = {
    // West coast — left side of the radar (π = 180°)
    CA: Math.PI, OR: Math.PI - 0.4, WA: Math.PI - 0.7,
    NV: Math.PI - 0.2, AZ: Math.PI - 0.1,
    // Mountain — left-of-center
    UT: Math.PI - 0.5, ID: Math.PI - 0.9, MT: Math.PI - 1.1,
    WY: Math.PI - 1.3, CO: Math.PI - 0.6, NM: Math.PI - 0.4,
    // Plains — bottom
    TX: Math.PI / 2 + 0.3, OK: Math.PI / 2, KS: Math.PI / 2 - 0.2,
    NE: Math.PI / 2 - 0.5, SD: Math.PI / 2 - 0.7, ND: Math.PI / 2 - 0.9,
    // Midwest — bottom-right
    MN: Math.PI / 2 - 1.1, IA: Math.PI / 2 - 0.4, MO: Math.PI / 2 - 0.3,
    AR: Math.PI / 2 + 0.4, LA: Math.PI / 2 + 0.5, MS: Math.PI / 2 + 0.6,
    AL: Math.PI / 2 + 0.7, TN: Math.PI / 2 - 0.1, KY: Math.PI / 2 - 0.2,
    IL: Math.PI / 2 - 0.6, IN: Math.PI / 2 - 0.7, OH: Math.PI / 2 - 0.9,
    MI: Math.PI / 2 - 1.0, WI: Math.PI / 2 - 1.0,
    // East — right side (0)
    NY: 0, NJ: 0.2, PA: -0.2, MA: -0.5, CT: -0.3, RI: -0.4,
    NH: -0.7, VT: -0.6, ME: -0.9,
    DE: 0.4, MD: 0.5, DC: 0.5,
    VA: 0.6, NC: 0.7, SC: 0.85, GA: 1.0,
    FL: Math.PI / 2 - 0.05,
    WV: 0.3,
    // Outliers
    AK: -Math.PI + 0.3, HI: Math.PI - 1.6,
};

function angleForState(state?: string): number {
    if (!state) return Math.random() * Math.PI * 2;
    const s = state.toUpperCase();
    const base = STATE_TO_ANGLE[s];
    if (base === undefined) return Math.random() * Math.PI * 2;
    // Add small random jitter so multiple leads from the same state don't stack.
    return base + (Math.random() - 0.5) * 0.4;
}

/**
 * Cinematic scrape overlay. Centered radial scanner anchored at (0,0) in a
 * symmetric viewBox so rotations and pings can't drift off-center, premium
 * gradient-mesh backdrop, glassmorphic console.
 *
 * Coordinate system inside the scanner SVG: viewBox="-1 -1 2 2". Origin is
 * the geometric center; everything is unitized to ±1.
 */

const PHASE_COUNT = 6;
const PHASES_FALLBACK = [
    "Bootstrapping fetcher",
    "Connecting to scraper",
    "Scanning Google Maps",
    "Extracting from websites",
    "Validating emails",
    "Scoring + finalizing",
];

type LogType = "info" | "success" | "warn" | "data" | "system";

interface RadarPing {
    id: string;
    angle: number; // radians, around the disc
    radius: number; // 0–1 from center
    bornAt: number;
}

export default function LeadSearchAnimation({
    isActive,
    prompt,
    industry,
    locations,
    liveLogs,
    liveLeadsFound,
    livePhase,
    soundMuted,
    onToggleSound,
    onCancel,
    canCancel,
    liveLeads,
    onPing,
}: LeadSearchAnimationProps) {
    const reduceMotion = useReducedMotion();
    const [elapsedMs, setElapsedMs] = useState(0);
    const startRef = useRef<number>(0);
    const [pings, setPings] = useState<RadarPing[]>([]);
    const lastLeadsRef = useRef<number>(0);

    const useLive = (liveLogs?.length ?? 0) > 0;
    const visibleLogs: { id: string; ts: number; type: LogType; text: string }[] = useLive
        ? (liveLogs ?? []).slice(-10).map((l) => ({
              id: l.id,
              ts: l.elapsedMs,
              type: (l.level as LogType) ?? "info",
              text: l.text,
          }))
        : fallbackTimeline(industry, locations).filter((l) => l.elapsed * 1000 <= elapsedMs).slice(-10);

    const phaseIdx = livePhase ? livePhase.idx : Math.min(Math.floor(elapsedMs / 12000), PHASE_COUNT - 1);
    const phaseLabel = livePhase ? livePhase.label : PHASES_FALLBACK[phaseIdx];

    useEffect(() => {
        if (!isActive) {
            setElapsedMs(0);
            startRef.current = 0;
            setPings([]);
            lastLeadsRef.current = 0;
            return;
        }
        startRef.current = Date.now();
        const tick = setInterval(() => setElapsedMs(Date.now() - startRef.current), 100);
        return () => clearInterval(tick);
    }, [isActive]);

    useEffect(() => {
        const found = liveLeadsFound ?? 0;
        if (found <= lastLeadsRef.current) return;
        const newPings: RadarPing[] = [];
        for (let i = lastLeadsRef.current; i < found; i++) {
            // Geographic positioning when we know the lead's state — biases
            // the ping toward CA-west, NY-east, FL-south etc. Falls back to
            // a random angle if the state isn't known.
            const lead = liveLeads?.[i];
            const angle = angleForState(lead?.state);
            newPings.push({
                id: `ping-${i}-${Date.now()}`,
                angle,
                radius: 0.32 + Math.random() * 0.55,
                bornAt: Date.now(),
            });
        }
        lastLeadsRef.current = found;
        setPings((prev) => {
            const merged = [...prev, ...newPings];
            const cutoff = Date.now() - 5000;
            // Cap to last 12 visible — a busy radar at 50+ leads gets noisy.
            // Older spawns go into a rim "history" indicator instead.
            return merged.filter((p) => p.bornAt > cutoff).slice(-12);
        });
        // Soft blip cue per ping
        if (onPing) onPing();
    }, [liveLeadsFound, liveLeads, onPing]);

    if (!isActive) return null;

    const seconds = Math.floor(elapsedMs / 1000);
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 overflow-hidden"
        >
            <PremiumBackdrop reduceMotion={!!reduceMotion} />
            <SpinKeyframes />

            <div className="relative z-10 h-full flex items-center justify-center px-6 py-6">
                <div className="w-full max-w-[1080px] flex flex-col items-center">
                    <TopStatusBar
                        leadsFound={liveLeadsFound ?? 0}
                        mm={mm}
                        ss={ss}
                        industry={industry}
                        locations={locations}
                        soundMuted={soundMuted}
                        onToggleSound={onToggleSound}
                    />

                    <div className="mt-6 mb-6 flex justify-center w-full">
                        <Scanner pings={pings} phaseIdx={phaseIdx} reduceMotion={!!reduceMotion} totalLeadsFound={liveLeadsFound ?? 0} />
                    </div>

                    <PhaseStrip currentIdx={phaseIdx} label={phaseLabel} />

                    {prompt && (
                        <div className="mt-4 text-center text-[14px] text-white/55 leading-relaxed max-w-2xl">
                            {prompt}
                        </div>
                    )}

                    <div className="mt-6 w-full max-w-[860px]">
                        <ConsoleFeed lines={visibleLogs} />
                    </div>

                    <FooterBar
                        leadsFound={liveLeadsFound ?? 0}
                        canCancel={canCancel}
                        onCancel={onCancel}
                    />
                </div>
            </div>
        </motion.div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Backdrop: deep gradient mesh + film grain + subtle starfield
// ────────────────────────────────────────────────────────────────────────────

function PremiumBackdrop({ reduceMotion }: { reduceMotion: boolean }) {
    const stars = useMemo(
        () =>
            Array.from({ length: 60 }).map((_, i) => ({
                id: i,
                x: (i * 73.3) % 100,
                y: (i * 41.7) % 100,
                size: ((i * 7) % 3) * 0.5 + 1,
                delay: (i * 0.2) % 3,
            })),
        []
    );

    return (
        <>
            <div className="absolute inset-0 bg-[#04050a]" />

            {/* Aurora orbs — static when reduced-motion is set, gentle drift otherwise. */}
            <motion.div
                className="absolute -top-1/3 -left-1/3 w-[80vw] h-[80vw] rounded-full opacity-60"
                style={{
                    background:
                        "radial-gradient(circle, #6d28d9 0%, rgba(109, 40, 217, 0.2) 30%, transparent 65%)",
                    filter: "blur(70px)",
                }}
                animate={reduceMotion ? undefined : { x: [0, 80, -40, 0], y: [0, 60, -30, 0] }}
                transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute -bottom-1/3 -right-1/3 w-[80vw] h-[80vw] rounded-full opacity-50"
                style={{
                    background:
                        "radial-gradient(circle, #0891b2 0%, rgba(8, 145, 178, 0.15) 30%, transparent 65%)",
                    filter: "blur(80px)",
                }}
                animate={reduceMotion ? undefined : { x: [0, -100, 50, 0], y: [0, -70, 40, 0] }}
                transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full opacity-40"
                style={{
                    background: "radial-gradient(circle, #e879f9 0%, transparent 60%)",
                    filter: "blur(90px)",
                }}
                animate={reduceMotion ? undefined : { x: [0, 60, -50, 0], y: [0, -40, 70, 0] }}
                transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Tiny stars — only twinkle when motion is allowed */}
            {!reduceMotion && stars.map((s) => (
                <motion.div
                    key={s.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: s.size,
                        height: s.size,
                    }}
                    animate={{ opacity: [0.15, 0.7, 0.15] }}
                    transition={{ duration: 3 + s.delay, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
                />
            ))}

            {/* Film grain */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.05] mix-blend-overlay pointer-events-none">
                <filter id="noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noise)" />
            </svg>

            {/* Vignette toward edges keeps focus on center */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at center, transparent 35%, rgba(4, 5, 10, 0.85) 100%)",
                }}
            />
        </>
    );
}

function SpinKeyframes() {
    return (
        <style>{`
            @keyframes scanner-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .scanner-sweep {
                animation: scanner-spin 5s linear infinite;
                transform-origin: 50% 50%;
            }
            @media (prefers-reduced-motion: reduce) {
                .scanner-sweep { animation: none; }
            }
        `}</style>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Scanner — properly centered viewBox -1..1, geometry can't drift
// ────────────────────────────────────────────────────────────────────────────

function Scanner({
    pings,
    phaseIdx,
    reduceMotion,
    totalLeadsFound,
}: {
    pings: RadarPing[];
    phaseIdx: number;
    reduceMotion: boolean;
    totalLeadsFound: number;
}) {
    // Responsive sizing — clamp between 280px (small mobile) and 480px (desktop).
    // Uses viewport-relative w/h via inline CSS so it scales with the window.
    const sizeStyle = {
        width: "min(86vw, 480px)",
        height: "min(86vw, 480px)",
        maxWidth: 480,
        maxHeight: 480,
    } as const;

    return (
        <div className="relative" style={sizeStyle}>
            {/* Outer ambient glow */}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(34, 211, 238, 0.15) 40%, transparent 70%)",
                    filter: "blur(30px)",
                }}
            />

            {/* CSS-driven sweep using a conic gradient — guaranteed centered + smooth.
                The mask circle clips it to a disc; the gradient sweeps through 360°.
                Hidden when the user prefers reduced motion. */}
            {!reduceMotion && (
                <div
                    className="absolute inset-0 rounded-full scanner-sweep"
                    style={{
                        background:
                            "conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(34, 211, 238, 0.18) 320deg, rgba(34, 211, 238, 0.55) 350deg, rgba(255, 255, 255, 0.85) 360deg)",
                        maskImage: "radial-gradient(circle, black 0%, black 96%, transparent 100%)",
                        WebkitMaskImage:
                            "radial-gradient(circle, black 0%, black 96%, transparent 100%)",
                    }}
                />
            )}

            {/* Static SVG: rings, crosshair, ticks, core, pings */}
            <svg viewBox="-1 -1 2 2" className="absolute inset-0 w-full h-full">
                <defs>
                    <radialGradient id="discGloss" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(124, 58, 237, 0.18)" />
                        <stop offset="60%" stopColor="rgba(15, 23, 42, 0.4)" />
                        <stop offset="100%" stopColor="rgba(15, 23, 42, 0.85)" />
                    </radialGradient>
                    <radialGradient id="centerCore" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                        <stop offset="35%" stopColor="#a78bfa" stopOpacity="0.9" />
                        <stop offset="70%" stopColor="#7c3aed" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="rgba(124, 58, 237, 0)" />
                    </radialGradient>
                    <radialGradient id="pingGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fff" />
                        <stop offset="40%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
                    </radialGradient>
                </defs>

                {/* Glass disc */}
                <circle cx="0" cy="0" r="0.98" fill="url(#discGloss)" />

                {/* Concentric rings */}
                {[0.28, 0.46, 0.64, 0.82].map((r, i) => (
                    <circle
                        key={i}
                        cx="0"
                        cy="0"
                        r={r}
                        fill="none"
                        stroke="rgba(167, 139, 250, 0.18)"
                        strokeWidth="0.004"
                        strokeDasharray={i === 3 ? "0" : "0.012 0.018"}
                    />
                ))}
                {/* Outer rim */}
                <circle cx="0" cy="0" r="0.96" fill="none" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="0.006" />
                <circle cx="0" cy="0" r="0.92" fill="none" stroke="rgba(167, 139, 250, 0.12)" strokeWidth="0.002" />

                {/* Crosshair */}
                <line x1="0" y1="-0.92" x2="0" y2="0.92" stroke="rgba(167, 139, 250, 0.1)" strokeWidth="0.003" />
                <line x1="-0.92" y1="0" x2="0.92" y2="0" stroke="rgba(167, 139, 250, 0.1)" strokeWidth="0.003" />

                {/* Tick marks on outer ring */}
                {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i / 24) * Math.PI * 2;
                    const x1 = Math.cos(angle) * 0.92;
                    const y1 = Math.sin(angle) * 0.92;
                    const x2 = Math.cos(angle) * (i % 6 === 0 ? 0.86 : 0.89);
                    const y2 = Math.sin(angle) * (i % 6 === 0 ? 0.86 : 0.89);
                    return (
                        <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={i % 6 === 0 ? "rgba(167, 139, 250, 0.7)" : "rgba(167, 139, 250, 0.25)"}
                            strokeWidth="0.005"
                        />
                    );
                })}

                {/* Ring labels — positioned just inside the rim. Tspan with
                    static x/y because we want them upright, not rotated. */}
                {([
                    { x: 0, y: -0.8, text: "MAPS", active: phaseIdx >= 2, anchor: "middle" as const, dy: "0" },
                    { x: 0.8, y: 0.02, text: "CRAWL", active: phaseIdx >= 3, anchor: "end" as const, dy: "0" },
                    { x: 0, y: 0.82, text: "DNS", active: phaseIdx >= 4, anchor: "middle" as const, dy: "0" },
                    { x: -0.8, y: 0.02, text: "CORE", active: true, anchor: "start" as const, dy: "0" },
                ]).map((label) => (
                    <text
                        key={label.text}
                        x={label.x}
                        y={label.y}
                        textAnchor={label.anchor}
                        dominantBaseline="middle"
                        fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
                        fontSize="0.045"
                        letterSpacing="0.015"
                        fontWeight="500"
                        fill={label.active ? "rgba(103, 232, 249, 0.85)" : "rgba(255, 255, 255, 0.18)"}
                        style={{ transition: "fill 0.5s ease" }}
                    >
                        {label.text}
                    </text>
                ))}

                {/* Lead pings */}
                <AnimatePresence>
                    {pings.map((p) => {
                        const cx = Math.cos(p.angle) * p.radius;
                        const cy = Math.sin(p.angle) * p.radius;
                        return (
                            <motion.g key={p.id}>
                                {/* Outer ripple */}
                                <motion.circle
                                    cx={cx}
                                    cy={cy}
                                    r="0.012"
                                    fill="none"
                                    stroke="#22d3ee"
                                    strokeWidth="0.005"
                                    initial={{ opacity: 0.9, scale: 1 }}
                                    animate={{ opacity: 0, scale: 8 }}
                                    transition={{ duration: 2.4, ease: "easeOut" }}
                                />
                                {/* Inner glow */}
                                <motion.circle
                                    cx={cx}
                                    cy={cy}
                                    r="0.022"
                                    fill="url(#pingGrad)"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: [0, 1, 0.7, 0], scale: [0, 1.2, 1, 0.6] }}
                                    transition={{ duration: 4.2, ease: "easeOut" }}
                                />
                                {/* Hot center */}
                                <motion.circle
                                    cx={cx}
                                    cy={cy}
                                    r="0.008"
                                    fill="#fff"
                                    initial={{ opacity: 1, scale: 0.5 }}
                                    animate={{ opacity: [1, 1, 0], scale: [0.5, 1, 1] }}
                                    transition={{ duration: 4.2, ease: "easeOut" }}
                                />
                                {/* Connection line from center */}
                                <motion.line
                                    x1="0"
                                    y1="0"
                                    x2={cx}
                                    y2={cy}
                                    stroke="rgba(34, 211, 238, 0.4)"
                                    strokeWidth="0.003"
                                    strokeDasharray="0.01 0.01"
                                    initial={{ opacity: 0, pathLength: 0 }}
                                    animate={{ opacity: [0, 0.8, 0], pathLength: [0, 1, 1] }}
                                    transition={{ duration: 1.8, ease: "easeOut" }}
                                />
                            </motion.g>
                        );
                    })}
                </AnimatePresence>

                {/* Center core stack */}
                <circle cx="0" cy="0" r="0.18" fill="url(#centerCore)" />
                <motion.circle
                    cx="0"
                    cy="0"
                    r="0.08"
                    fill="rgba(255, 255, 255, 0.9)"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <circle cx="0" cy="0" r="0.025" fill="#fff" />
            </svg>

            {/* Older-leads rim indicator — appears once total exceeds the visible cap */}
            {totalLeadsFound > 12 && (
                <div className="absolute -top-2 right-2 text-[9px] font-mono tracking-[0.2em] text-cyan-300/70 bg-black/40 backdrop-blur px-2 py-0.5 rounded-full border border-cyan-400/30">
                    +{totalLeadsFound - 12} earlier
                </div>
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Top status bar
// ────────────────────────────────────────────────────────────────────────────

function TopStatusBar({
    leadsFound,
    mm,
    ss,
    industry,
    locations,
    soundMuted,
    onToggleSound,
}: {
    leadsFound: number;
    mm: string;
    ss: string;
    industry?: string;
    locations?: string[];
    soundMuted?: boolean;
    onToggleSound?: () => void;
}) {
    return (
        <div className="w-full max-w-[1080px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <span className="relative flex w-2 h-2">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[13px] text-emerald-200/90 font-medium">Live search</span>

                <span className="hidden sm:flex items-center gap-2 ml-2 text-[12px] text-white/45">
                    <span className="w-px h-3 bg-white/15" />
                    <span className="text-white/75 font-medium">{industry || "—"}</span>
                    <span>·</span>
                    <span className="truncate max-w-[280px]">{(locations ?? []).join(" + ") || "—"}</span>
                </span>
            </div>

            <div className="flex items-center gap-5">
                <AnimatePresence mode="popLayout">
                    {leadsFound > 0 && (
                        <motion.div
                            key={leadsFound}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ duration: 0.35, type: "spring", bounce: 0.45 }}
                            className="flex items-baseline gap-1.5"
                        >
                            <span className="text-[28px] font-semibold text-white tabular-nums leading-none">
                                {leadsFound}
                            </span>
                            <span className="text-[11px] text-white/55 font-medium uppercase tracking-wider">
                                leads
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={onToggleSound}
                    className="text-[13px] text-white/40 hover:text-white/90 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                    title={soundMuted ? "Unmute" : "Mute"}
                >
                    {soundMuted ? "🔇" : "🔊"}
                </button>

                <span className="font-mono text-[13px] text-white/65 tabular-nums tracking-tight">
                    {mm}:{ss}
                </span>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Phase strip
// ────────────────────────────────────────────────────────────────────────────

function PhaseStrip({ currentIdx, label }: { currentIdx: number; label: string }) {
    return (
        <div className="w-full max-w-[680px]">
            <div className="flex items-center gap-1.5 mb-3">
                {Array.from({ length: PHASE_COUNT }).map((_, i) => {
                    const isPast = i < currentIdx;
                    const isCurrent = i === currentIdx;
                    return (
                        <div key={i} className="flex-1 relative">
                            <div
                                className={`h-[3px] rounded-full transition-colors duration-500 ${
                                    isPast || isCurrent ? "bg-gradient-to-r from-violet-500 to-cyan-400" : "bg-white/10"
                                }`}
                            />
                            {isCurrent && (
                                <motion.div
                                    className="absolute inset-0 h-[3px] rounded-full bg-gradient-to-r from-transparent via-white/90 to-transparent"
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-baseline gap-2 justify-center"
                >
                    <span className="text-[22px] font-medium text-white">{label}</span>
                    <DotPulse />
                </motion.div>
            </AnimatePresence>
            <div className="text-[11px] text-white/35 mt-1 text-center">
                Phase {currentIdx + 1} of {PHASE_COUNT}
            </div>
        </div>
    );
}

function DotPulse() {
    return (
        <span className="inline-flex gap-[3px] ml-0.5 self-center">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-1 h-1 rounded-full bg-white/70"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
                />
            ))}
        </span>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Console feed
// ────────────────────────────────────────────────────────────────────────────

function ConsoleFeed({ lines }: { lines: { id: string; ts: number; type: LogType; text: string }[] }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                    </div>
                    <span className="ml-2 text-[11px] font-mono text-white/45 tracking-wider uppercase">
                        live console
                    </span>
                </div>
                <div className="text-[10px] font-mono text-white/30">scrapeJobs.run</div>
            </div>
            <div className="px-5 py-3.5 font-mono text-[12px] leading-[1.7] h-[200px] overflow-hidden relative">
                <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
                <AnimatePresence initial={false}>
                    {lines.map((line) => (
                        <motion.div
                            key={line.id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="flex gap-3"
                        >
                            <span className="text-white/25 tabular-nums flex-shrink-0 select-none">
                                {fmtTs(line.ts)}
                            </span>
                            <span className={lineColor(line.type)}>
                                <span className="select-none mr-1.5 opacity-60">{linePrefix(line.type)}</span>
                                {line.text}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div className="flex gap-3 mt-0.5">
                    <span className="text-white/25 tabular-nums select-none">
                        {fmtTs((lines[lines.length - 1]?.ts ?? 0) + 0.001)}
                    </span>
                    <span className="text-cyan-300/85">
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            ▍
                        </motion.span>
                    </span>
                </div>
            </div>
        </div>
    );
}

function lineColor(t: LogType): string {
    switch (t) {
        case "success":
            return "text-emerald-300/95";
        case "warn":
            return "text-amber-300/95";
        case "data":
            return "text-cyan-300/95";
        case "system":
            return "text-violet-300/95";
        default:
            return "text-white/75";
    }
}
function linePrefix(t: LogType): string {
    switch (t) {
        case "success":
            return "✓";
        case "warn":
            return "!";
        case "data":
            return "→";
        case "system":
            return "◆";
        default:
            return "·";
    }
}
function fmtTs(elapsedMs: number): string {
    const seconds = Math.floor(elapsedMs / 1000);
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
}

// ────────────────────────────────────────────────────────────────────────────
// Footer
// ────────────────────────────────────────────────────────────────────────────

function FooterBar({
    leadsFound,
    canCancel,
    onCancel,
}: {
    leadsFound: number;
    canCancel?: boolean;
    onCancel?: () => void;
}) {
    return (
        <div className="mt-4 w-full max-w-[860px] flex items-center justify-between text-[11px] text-white/40">
            <span className="font-mono">
                stealthy_fetcher · {leadsFound} {leadsFound === 1 ? "lead" : "leads"} persisted
            </span>
            <div className="flex items-center gap-3">
                <span className="hidden sm:inline">Real searches take 30–90s</span>
                {canCancel && onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/25 text-rose-200 text-[11px] font-medium tracking-wider uppercase transition-colors"
                    >
                        ✕ Cancel
                    </button>
                )}
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Fallback timeline
// ────────────────────────────────────────────────────────────────────────────

function fallbackTimeline(industry?: string, locations?: string[]) {
    const ind = (industry || "businesses").trim();
    const firstLoc = (locations ?? [])[0] || "—";
    return [
        { id: "f0", elapsed: 0.2, text: "Initializing fetcher", type: "system" as LogType },
        { id: "f1", elapsed: 1.4, text: `Connecting · keyword="${ind}" location="${firstLoc}"`, type: "info" as LogType },
        { id: "f2", elapsed: 3.5, text: "Scraper online · awaiting results", type: "success" as LogType },
    ];
}
