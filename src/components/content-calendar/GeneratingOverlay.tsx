"use client";

import { useEffect, useState } from "react";

const PHRASES = [
    "Brewing content magic ☕",
    "Teaching robots to write captions 🤖",
    "Analyzing trending topics 📈",
    "Crafting scroll-stopping hooks 🎣",
    "Optimizing for engagement 🎯",
    "Generating fire content 🔥",
    "Mixing hashtags & vibes ✨",
    "Building your content empire 👑",
    "AI brain doing its thing 🧠",
    "Almost there, hang tight 🚀",
];

interface GeneratingOverlayProps {
    days: number;
}

export function GeneratingOverlay({ days }: GeneratingOverlayProps) {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [dots, setDots] = useState("");

    // Rotate phrases
    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
        }, 2800);
        return () => clearInterval(interval);
    }, []);

    // Animate dots
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
            <div className="text-center max-w-md px-8">
                {/* Robot */}
                <div className="relative mx-auto w-32 h-32 mb-6">
                    {/* Glow */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/30 to-cyan-500/30 blur-2xl animate-pulse" />

                    {/* Robot body */}
                    <div className="relative w-32 h-32 animate-bounce" style={{ animationDuration: "2s" }}>
                        {/* Head */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-slate-800 rounded-2xl border-2 border-slate-600 shadow-lg shadow-indigo-500/20">
                            {/* Antenna */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-4 bg-slate-500">
                                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400 animate-ping" style={{ animationDuration: "1.5s" }} />
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400" />
                            </div>
                            {/* Eyes */}
                            <div className="absolute top-5 left-3 w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50">
                                <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                            </div>
                            <div className="absolute top-5 right-3 w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50">
                                <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                            </div>
                            {/* Mouth - animated */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-0.5">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 rounded-full bg-indigo-400"
                                        style={{
                                            height: `${4 + Math.sin((Date.now() / 200) + i) * 3}px`,
                                            animation: `mouth-bar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-10 bg-slate-800 rounded-xl border-2 border-slate-600 shadow-lg">
                            {/* Chest light */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 animate-pulse" />
                            {/* Buttons */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            </div>
                        </div>

                        {/* Left arm */}
                        <div
                            className="absolute top-[52px] -left-1 w-3 h-10 bg-slate-700 rounded-full border border-slate-600 origin-top"
                            style={{ animation: "arm-wave 1.2s ease-in-out infinite alternate" }}
                        />
                        {/* Right arm */}
                        <div
                            className="absolute top-[52px] -right-1 w-3 h-10 bg-slate-700 rounded-full border border-slate-600 origin-top"
                            style={{ animation: "arm-wave 1.2s ease-in-out 0.6s infinite alternate" }}
                        />
                    </div>
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold text-white mb-2">
                    Generating {days === 1 ? "Today's" : `${days} Days of`} Content{dots}
                </h3>
                <p className="text-sm text-slate-400 mb-4 h-5 transition-all duration-300">
                    {PHRASES[phraseIndex]}
                </p>

                {/* Progress bar */}
                <div className="w-64 mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 rounded-full"
                        style={{
                            animation: "progress-shimmer 2.5s ease-in-out infinite",
                            backgroundSize: "200% 100%",
                        }}
                    />
                </div>
                <p className="text-xs text-slate-500 mt-3">This usually takes 15–30 seconds</p>

                {/* CSS Keyframes */}
                <style jsx>{`
                    @keyframes arm-wave {
                        0% { transform: rotate(-8deg); }
                        100% { transform: rotate(15deg); }
                    }
                    @keyframes mouth-bar {
                        0% { height: 2px; }
                        100% { height: 6px; }
                    }
                    @keyframes progress-shimmer {
                        0% { background-position: -200% 0; width: 20%; }
                        50% { width: 60%; }
                        100% { background-position: 200% 0; width: 20%; }
                    }
                `}</style>
            </div>
        </div>
    );
}
