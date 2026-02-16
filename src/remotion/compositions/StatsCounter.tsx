

import React, { useMemo } from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

// ─── Props ──────────────────────────────────────────────────────────────────────

interface StatsCounterProps {
    headline: string;
    subtext: string;
    brandName?: string;
}

// ─── Composition ────────────────────────────────────────────────────────────────

export const StatsCounter: React.FC<StatsCounterProps> = ({
    headline = "Campaign Results",
    subtext = "Powered by E-mailer.io",
    brandName = "E-MAILER.IO",
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Main counter animation (count up to 10,000)
    const target = 10000;
    const countProgress = interpolate(frame, [20, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const easedProgress = 1 - Math.pow(1 - countProgress, 3); // ease-out cubic
    const count = Math.round(target * easedProgress);

    // Header fade
    const headerOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
    const headerY = interpolate(frame, [0, 15], [-20, 0], { extrapolateRight: "clamp" });

    // Counter scale pulse
    const counterScale = spring({ frame: frame - 15, fps, config: { damping: 10, stiffness: 80 } });

    // Sub-stats
    const stats = useMemo(() => [
        { label: "Open Rate", val: "68%" },
        { label: "Reply Rate", val: "24%" },
        { label: "Meetings", val: "142" },
        { label: "Revenue", val: "$340K" },
    ], []);

    // Footer
    const footerOpacity = interpolate(frame, [120, 140], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "system-ui, -apple-system, sans-serif",
            }}
        >
            {/* Ambient glow */}
            <div
                style={{
                    position: "absolute",
                    width: width * 0.55,
                    height: width * 0.55,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #7c3aed20 0%, transparent 70%)",
                    top: "5%",
                    right: "-10%",
                    filter: "blur(50px)",
                }}
            />

            {/* Headline */}
            <div
                style={{
                    opacity: headerOpacity,
                    transform: `translateY(${headerY}px)`,
                    fontSize: width * 0.03,
                    fontWeight: 800,
                    color: "#818cf8",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    marginBottom: height * 0.03,
                }}
            >
                {headline}
            </div>

            {/* Big counter */}
            <div
                style={{
                    transform: `scale(${counterScale})`,
                    fontSize: width * 0.12,
                    fontWeight: 900,
                    color: "#ffffff",
                    fontVariantNumeric: "tabular-nums",
                    marginBottom: height * 0.01,
                }}
            >
                {count.toLocaleString()}+
            </div>

            <div
                style={{
                    fontSize: width * 0.035,
                    fontWeight: 600,
                    color: "#cbd5e1",
                    marginBottom: height * 0.04,
                }}
            >
                Emails Sent
            </div>

            {/* Stats grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: width * 0.03,
                    width: "80%",
                }}
            >
                {stats.map((stat, i) => {
                    const delay = 50 + i * 10;
                    const statOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                    const statY = interpolate(frame, [delay, delay + 15], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

                    return (
                        <div
                            key={stat.label}
                            style={{
                                opacity: statOpacity,
                                transform: `translateY(${statY}px)`,
                                background: "rgba(255,255,255,0.05)",
                                backdropFilter: "blur(10px)",
                                borderRadius: width * 0.02,
                                padding: `${height * 0.02}px ${width * 0.03}px`,
                                textAlign: "center",
                            }}
                        >
                            <div style={{ fontSize: width * 0.045, fontWeight: 800, color: "#fff" }}>
                                {stat.val}
                            </div>
                            <div style={{ fontSize: width * 0.02, color: "#94a3b8", marginTop: 4 }}>
                                {stat.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div
                style={{
                    opacity: footerOpacity,
                    marginTop: height * 0.04,
                    fontSize: width * 0.022,
                    color: "#94a3b8",
                }}
            >
                {subtext}
            </div>
        </AbsoluteFill>
    );
};
