"use client";

import { useEffect, useState, useMemo } from "react";

interface LeadSearchAnimationProps {
    isActive: boolean;
    prompt?: string;
}

// Random beep-boop messages
const ROBOT_MESSAGES = [
    "BEEP!", "BOOP!", "SCANNING...", "FOUND ONE!", "PROCESSING...",
    "ANALYZING...", "SEARCHING...", "LOADING...", "COMPILING...",
];

const SEARCH_PHASES = [
    "Initializing search protocol...",
    "Connecting to data sources...",
    "Scanning business directories...",
    "Cross-referencing databases...",
    "Analyzing contact information...",
    "Validating email addresses...",
    "Calculating lead scores...",
    "Compiling results...",
];

export default function LeadSearchAnimation({ isActive, prompt }: LeadSearchAnimationProps) {
    const [progress, setProgress] = useState(0);
    const [leadsFound, setLeadsFound] = useState(0);
    const [databasesScanned, setDatabasesScanned] = useState(0);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [beepBoop, setBeepBoop] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
    const [papers, setPapers] = useState<{ id: number; x: number; delay: number }[]>([]);
    const [contactCards, setContactCards] = useState<{ id: number; x: number; y: number }[]>([]);

    // Progress simulation
    useEffect(() => {
        if (!isActive) {
            setProgress(0);
            setLeadsFound(0);
            setDatabasesScanned(0);
            setCurrentPhase(0);
            setBeepBoop([]);
            setPapers([]);
            setContactCards([]);
            return;
        }

        // Progress bar
        const progressInterval = setInterval(() => {
            setProgress(p => Math.min(p + Math.random() * 3, 95));
        }, 200);

        // Leads counter
        const leadsInterval = setInterval(() => {
            setLeadsFound(l => l + Math.floor(Math.random() * 3));
        }, 800);

        // Databases counter
        const dbInterval = setInterval(() => {
            setDatabasesScanned(d => d + 1);
        }, 400);

        // Phase updates
        const phaseInterval = setInterval(() => {
            setCurrentPhase(p => (p + 1) % SEARCH_PHASES.length);
        }, 2000);

        // Beep-boop bubbles
        const beepInterval = setInterval(() => {
            const id = Date.now();
            const text = ROBOT_MESSAGES[Math.floor(Math.random() * ROBOT_MESSAGES.length)];
            const x = 30 + Math.random() * 40; // Around the robot area
            const y = 20 + Math.random() * 30;
            setBeepBoop(prev => [...prev.slice(-5), { id, text, x, y }]);
        }, 600);

        // Flying papers
        const paperInterval = setInterval(() => {
            const id = Date.now();
            setPapers(prev => [...prev.slice(-8), { id, x: 60 + Math.random() * 20, delay: Math.random() * 0.5 }]);
        }, 300);

        // Contact cards appearing
        const cardInterval = setInterval(() => {
            const id = Date.now();
            setContactCards(prev => [...prev.slice(-6), { id, x: 10 + Math.random() * 80, y: 50 + Math.random() * 30 }]);
        }, 1200);

        return () => {
            clearInterval(progressInterval);
            clearInterval(leadsInterval);
            clearInterval(dbInterval);
            clearInterval(phaseInterval);
            clearInterval(beepInterval);
            clearInterval(paperInterval);
            clearInterval(cardInterval);
        };
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
            {/* Backdrop with animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#12122f] to-[#1a0a2a] animate-gradient-shift" />

            {/* Scan lines effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(99,102,241,0.03)_2px,rgba(99,102,241,0.03)_4px)]" />
                <div className="absolute w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent animate-scan-line" />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-indigo-400/40 rounded-full animate-float-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 w-full max-w-4xl px-8">
                {/* Robot + Filing Cabinet Scene */}
                <div className="relative h-80 mb-8">
                    {/* Filing Cabinet */}
                    <div className="absolute right-16 bottom-0 w-40 h-56">
                        {/* Cabinet body */}
                        <div className="absolute inset-0 bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-lg border-2 border-zinc-600 shadow-2xl">
                            {/* Drawers */}
                            {[0, 1, 2].map((drawer, idx) => (
                                <div
                                    key={drawer}
                                    className={`absolute left-2 right-2 h-14 bg-zinc-600 rounded border border-zinc-500 shadow-inner ${idx === 1 ? 'animate-drawer-open' : ''}`}
                                    style={{ top: `${10 + idx * 60}px` }}
                                >
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-2 bg-zinc-400 rounded-full" />
                                    {idx === 1 && (
                                        <div className="absolute -left-2 top-0 bottom-0 w-2 bg-yellow-400/20 rounded-l animate-pulse" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Flying papers */}
                        {papers.map((paper) => (
                            <div
                                key={paper.id}
                                className="absolute w-8 h-10 bg-white rounded-sm shadow-lg animate-paper-fly"
                                style={{
                                    left: '50%',
                                    top: '40%',
                                    animationDelay: `${paper.delay}s`,
                                }}
                            >
                                <div className="w-4 h-0.5 bg-zinc-300 mt-2 ml-1 rounded" />
                                <div className="w-5 h-0.5 bg-zinc-300 mt-1 ml-1 rounded" />
                                <div className="w-3 h-0.5 bg-zinc-300 mt-1 ml-1 rounded" />
                            </div>
                        ))}
                    </div>

                    {/* Robot */}
                    <div className="absolute left-1/3 bottom-0 -translate-x-1/2">
                        {/* Robot body */}
                        <div className="relative">
                            {/* Head */}
                            <div className="relative w-24 h-20 bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-t-3xl rounded-b-lg mx-auto border-2 border-indigo-400 shadow-lg shadow-indigo-500/30">
                                {/* Eyes */}
                                <div className="absolute top-4 left-3 w-6 h-6 bg-cyan-400 rounded-full animate-blink shadow-lg shadow-cyan-400/50">
                                    <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full" />
                                </div>
                                <div className="absolute top-4 right-3 w-6 h-6 bg-cyan-400 rounded-full animate-blink shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0.1s' }}>
                                    <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full" />
                                </div>
                                {/* Antenna */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-6 bg-zinc-400">
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                                </div>
                                {/* Mouth (LED display) */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-green-900 rounded overflow-hidden">
                                    <div className="w-full h-full bg-green-400 animate-mouth-speak" style={{ clipPath: 'polygon(0 0, 20% 0, 20% 100%, 0 100%, 0 0, 30% 0, 30% 100%, 50% 100%, 50% 0, 60% 0, 60% 100%, 80% 100%, 80% 0, 100% 0, 100% 100%, 0 100%)' }} />
                                </div>
                            </div>

                            {/* Neck */}
                            <div className="w-8 h-4 bg-zinc-500 mx-auto rounded" />

                            {/* Body */}
                            <div className="w-32 h-28 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded-2xl border-2 border-zinc-500 mx-auto relative shadow-xl">
                                {/* Chest panel */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-16 bg-zinc-900 rounded-lg border border-zinc-700 p-1">
                                    {/* LED indicators */}
                                    <div className="flex justify-center gap-1 mb-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                    {/* Mini display */}
                                    <div className="h-8 bg-green-950 rounded text-[6px] text-green-400 font-mono p-0.5 overflow-hidden">
                                        <div className="animate-scroll-text">
                                            SCANNING...<br />
                                            FOUND: {leadsFound}<br />
                                            STATUS: OK<br />
                                            HACKING...<br />
                                            JK, LOL 🤖
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right arm - reaching INTO the cabinet */}
                            <div className="absolute top-20 -right-8 origin-top-left">
                                {/* Upper arm */}
                                <div className="relative animate-reach-arm">
                                    <div className="w-28 h-5 bg-gradient-to-r from-zinc-600 to-zinc-500 rounded-full border border-zinc-400 shadow-md" />
                                    {/* Elbow joint */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-500 rounded-full border-2 border-zinc-400 shadow-inner">
                                        <div className="absolute inset-1.5 bg-zinc-600 rounded-full" />
                                    </div>
                                    {/* Forearm - angled into cabinet */}
                                    <div className="absolute right-2 top-2 origin-left animate-pull-forearm">
                                        <div className="w-24 h-4 bg-gradient-to-r from-zinc-500 to-zinc-400 rounded-full border border-zinc-400 shadow-md rotate-[40deg]" />
                                        {/* Wrist */}
                                        <div className="absolute right-[-70px] top-[45px] w-5 h-5 bg-zinc-500 rounded-full border border-zinc-400" />
                                        {/* Hand gripping a folder */}
                                        <div className="absolute right-[-90px] top-[40px] animate-grip-folder">
                                            {/* Folder being pulled out */}
                                            <div className="w-10 h-14 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-sm shadow-lg border border-yellow-600 rotate-[-10deg]">
                                                <div className="w-full h-2 bg-yellow-600 rounded-t-sm" />
                                                <div className="mt-2 ml-1 w-6 h-0.5 bg-yellow-700/50 rounded" />
                                                <div className="mt-1 ml-1 w-5 h-0.5 bg-yellow-700/50 rounded" />
                                            </div>
                                            {/* Gripper fingers wrapped around folder */}
                                            <div className="absolute -left-2 top-2 w-2 h-8 bg-zinc-400 rounded-full origin-top rotate-[15deg]" />
                                            <div className="absolute -left-1 top-1 w-2 h-6 bg-zinc-400 rounded-full origin-top rotate-[5deg]" />
                                            <div className="absolute right-0 top-2 w-2 h-7 bg-zinc-400 rounded-full origin-top rotate-[-10deg]" />
                                            <div className="absolute right-1 top-1 w-2 h-5 bg-zinc-400 rounded-full origin-top rotate-[-5deg]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Left arm - holding stack of papers */}
                            <div className="absolute top-20 -left-4 origin-top-right">
                                <div className="relative animate-hold-papers">
                                    {/* Upper arm */}
                                    <div className="w-20 h-5 bg-gradient-to-l from-zinc-600 to-zinc-500 rounded-full border border-zinc-400 shadow-md -scale-x-100" />
                                    {/* Elbow */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-zinc-500 rounded-full border border-zinc-400" />
                                    {/* Forearm bent to hold papers */}
                                    <div className="absolute -left-2 top-3 origin-right">
                                        <div className="w-16 h-4 bg-gradient-to-l from-zinc-500 to-zinc-400 rounded-full border border-zinc-400 rotate-[50deg] -scale-x-100" />
                                        {/* Hand holding papers */}
                                        <div className="absolute -left-[40px] top-[55px] rotate-[-20deg]">
                                            {/* Stack of papers */}
                                            <div className="w-8 h-10 bg-white rounded-sm shadow-md border border-zinc-200 relative">
                                                <div className="absolute -bottom-1 -right-1 w-8 h-10 bg-zinc-100 rounded-sm shadow -z-10" />
                                                <div className="absolute -bottom-2 -right-2 w-8 h-10 bg-zinc-200 rounded-sm shadow -z-20" />
                                                <div className="mt-1 ml-1 w-5 h-0.5 bg-zinc-400 rounded" />
                                                <div className="mt-1 ml-1 w-4 h-0.5 bg-zinc-400 rounded" />
                                                <div className="mt-1 ml-1 w-5 h-0.5 bg-zinc-400 rounded" />
                                            </div>
                                            {/* Thumb */}
                                            <div className="absolute -right-2 top-3 w-2 h-5 bg-zinc-400 rounded-full rotate-[20deg]" />
                                            {/* Fingers under papers */}
                                            <div className="absolute left-1 -bottom-1 w-6 h-2 bg-zinc-400 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Legs */}
                            <div className="flex justify-center gap-4 mt-1">
                                <div className="w-8 h-12 bg-zinc-600 rounded-b-lg border-2 border-t-0 border-zinc-500" />
                                <div className="w-8 h-12 bg-zinc-600 rounded-b-lg border-2 border-t-0 border-zinc-500" />
                            </div>
                        </div>
                    </div>

                    {/* Beep-boop bubbles */}
                    {beepBoop.map((bubble) => (
                        <div
                            key={bubble.id}
                            className="absolute px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white text-sm font-bold animate-bubble-pop shadow-lg"
                            style={{ left: `${bubble.x}%`, top: `${bubble.y}%` }}
                        >
                            {bubble.text}
                        </div>
                    ))}

                    {/* Contact cards appearing */}
                    {contactCards.map((card) => (
                        <div
                            key={card.id}
                            className="absolute w-20 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur rounded-lg border border-emerald-400/30 p-1.5 animate-card-appear shadow-lg"
                            style={{ left: `${card.x}%`, top: `${card.y}%` }}
                        >
                            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full mb-1 flex items-center justify-center text-xs">👤</div>
                            <div className="w-full h-1 bg-white/20 rounded" />
                        </div>
                    ))}
                </div>

                {/* Stats Panel */}
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-6 shadow-2xl shadow-indigo-500/10">
                    {/* Status message */}
                    <div className="text-center mb-6">
                        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse mb-2">
                            🤖 SEARCHING FOR LEADS
                        </div>
                        <div className="text-indigo-300/70 font-mono text-sm animate-typewriter overflow-hidden whitespace-nowrap">
                            {SEARCH_PHASES[currentPhase]}
                        </div>
                        {prompt && (
                            <div className="text-white/40 text-xs mt-2 truncate max-w-md mx-auto">
                                "{prompt}"
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {/* Databases Scanned */}
                        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 text-center">
                            <div className="text-3xl font-bold text-cyan-400 font-mono animate-number-increment">
                                {databasesScanned}
                            </div>
                            <div className="text-xs text-zinc-400 mt-1">Databases Scanned</div>
                        </div>

                        {/* Leads Found */}
                        <div className="bg-zinc-800/50 rounded-xl p-4 border border-emerald-500/30 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent animate-pulse" />
                            <div className="relative text-3xl font-bold text-emerald-400 font-mono">
                                {leadsFound}
                            </div>
                            <div className="relative text-xs text-zinc-400 mt-1">Leads Found</div>
                        </div>

                        {/* Processing */}
                        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 text-center">
                            <div className="text-2xl font-bold text-purple-400 flex items-center justify-center gap-2">
                                <span className="animate-spin">⚙️</span>
                            </div>
                            <div className="text-xs text-zinc-400 mt-1">Processing...</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-zinc-500 font-mono">
                            <span>0%</span>
                            <span className="text-indigo-400">{Math.round(progress)}%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* Activity bar graph */}
                    <div className="mt-6 flex items-end justify-center gap-1 h-12">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-2 bg-gradient-to-t from-indigo-600 to-purple-400 rounded-t animate-bar-dance"
                                style={{
                                    height: `${20 + Math.random() * 80}%`,
                                    animationDelay: `${i * 0.05}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Cancel hint */}
                <div className="text-center mt-4 text-zinc-500 text-sm">
                    Please wait while our robot finds the best leads for you...
                </div>
            </div>

            {/* Styles */}
            <style jsx>{`
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-shift {
                    background-size: 200% 200%;
                    animation: gradient-shift 8s ease infinite;
                }

                @keyframes scan-line {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(calc(100vh + 100%)); }
                }
                .animate-scan-line {
                    animation: scan-line 3s linear infinite;
                }

                @keyframes float-particle {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
                    25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
                    50% { transform: translateY(-10px) translateX(-10px); opacity: 0.4; }
                    75% { transform: translateY(-30px) translateX(5px); opacity: 0.6; }
                }
                .animate-float-particle {
                    animation: float-particle 4s ease-in-out infinite;
                }

                @keyframes blink {
                    0%, 90%, 100% { transform: scaleY(1); }
                    95% { transform: scaleY(0.1); }
                }
                .animate-blink {
                    animation: blink 3s ease-in-out infinite;
                }

                @keyframes reach-arm {
                    0%, 100% { transform: rotate(5deg) translateX(0); }
                    50% { transform: rotate(-5deg) translateX(15px); }
                }
                .animate-reach-arm {
                    animation: reach-arm 2s ease-in-out infinite;
                }

                @keyframes pull-forearm {
                    0%, 100% { transform: translateX(0) translateY(0); }
                    30% { transform: translateX(20px) translateY(10px); }
                    60% { transform: translateX(-10px) translateY(-5px); }
                }
                .animate-pull-forearm {
                    animation: pull-forearm 2s ease-in-out infinite;
                }

                @keyframes grip-folder {
                    0%, 100% { transform: scale(1) rotate(-10deg); }
                    25% { transform: scale(1.05) rotate(-5deg); }
                    50% { transform: scale(1) rotate(-15deg); }
                    75% { transform: scale(0.95) rotate(-8deg); }
                }
                .animate-grip-folder {
                    animation: grip-folder 2s ease-in-out infinite;
                }

                @keyframes hold-papers {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }
                .animate-hold-papers {
                    animation: hold-papers 3s ease-in-out infinite;
                }

                @keyframes mouth-speak {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                .animate-mouth-speak {
                    animation: mouth-speak 0.15s linear infinite;
                }

                @keyframes drawer-open {
                    0%, 100% { transform: translateX(0); }
                    40%, 60% { transform: translateX(20px); }
                }
                .animate-drawer-open {
                    animation: drawer-open 2s ease-in-out infinite;
                }

                @keyframes paper-fly {
                    0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
                    100% { transform: translate(-150px, -100px) rotate(-30deg); opacity: 0; }
                }
                .animate-paper-fly {
                    animation: paper-fly 1.5s ease-out forwards;
                }

                @keyframes bubble-pop {
                    0% { transform: scale(0) translateY(0); opacity: 0; }
                    20% { transform: scale(1.2) translateY(-10px); opacity: 1; }
                    30% { transform: scale(1) translateY(-15px); opacity: 1; }
                    100% { transform: scale(0.8) translateY(-50px); opacity: 0; }
                }
                .animate-bubble-pop {
                    animation: bubble-pop 1.5s ease-out forwards;
                }

                @keyframes card-appear {
                    0% { transform: scale(0) rotate(-10deg); opacity: 0; }
                    50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
                    70% { transform: scale(1) rotate(0deg); opacity: 1; }
                    100% { transform: scale(0.9) rotate(-2deg); opacity: 0; }
                }
                .animate-card-appear {
                    animation: card-appear 2.5s ease-out forwards;
                }

                @keyframes typewriter {
                    from { width: 0; }
                    to { width: 100%; }
                }
                .animate-typewriter {
                    animation: typewriter 2s steps(40) infinite alternate;
                }

                @keyframes number-increment {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .animate-number-increment {
                    animation: number-increment 0.3s ease-out;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s ease-in-out infinite;
                }

                @keyframes bar-dance {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(0.5); }
                }
                .animate-bar-dance {
                    animation: bar-dance 0.8s ease-in-out infinite;
                }

                @keyframes scroll-text {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                .animate-scroll-text {
                    animation: scroll-text 3s linear infinite;
                }
            `}</style>
        </div>
    );
}
