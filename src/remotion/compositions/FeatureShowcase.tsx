

import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

// ─── Props ──────────────────────────────────────────────────────────────────────

interface FeatureShowcaseProps {
    headline: string;
    subtext: string;
    brandName?: string;
}

// ─── Composition ────────────────────────────────────────────────────────────────

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
    headline = "Feature Name",
    subtext = "Describe the feature and its benefits",
    brandName = "E-MAILER.IO",
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Brand entrance
    const brandOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

    // Icon animation
    const iconScale = spring({ frame: frame - 10, fps, config: { damping: 10, stiffness: 80 } });
    const iconRotation = interpolate(frame, [10, 30], [-15, 0], { extrapolateRight: "clamp" });
    const iconOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" });

    // Headline slide-in
    const headlineX = interpolate(frame, [20, 45], [-30, 0], { extrapolateRight: "clamp" });
    const headlineOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: "clamp" });

    // Subtext slide-in
    const subtextX = interpolate(frame, [35, 55], [-30, 0], { extrapolateRight: "clamp" });
    const subtextOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp" });

    // Feature pills
    const pills = ["AI-Powered", "Automated", "Real-time"];

    // CTA bar
    const ctaOpacity = interpolate(frame, [120, 140], [0, 1], { extrapolateRight: "clamp" });
    const ctaY = interpolate(frame, [120, 140], [20, 0], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)",
                display: "flex",
                flexDirection: "column",
                padding: `${height * 0.08}px ${width * 0.07}px ${height * 0.06}px`,
                fontFamily: "system-ui, -apple-system, sans-serif",
            }}
        >
            {/* Ambient glow */}
            <div
                style={{
                    position: "absolute",
                    width: width * 0.4,
                    height: width * 0.4,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #06b6d420 0%, transparent 70%)",
                    top: "3%",
                    left: "-5%",
                    filter: "blur(50px)",
                }}
            />

            {/* Brand */}
            <div
                style={{
                    opacity: brandOpacity,
                    fontSize: width * 0.03,
                    fontWeight: 900,
                    background: "linear-gradient(90deg, #818cf8, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "0.1em",
                    marginBottom: height * 0.05,
                }}
            >
                {brandName}
            </div>

            {/* Feature icon */}
            <div
                style={{
                    opacity: iconOpacity,
                    transform: `scale(${iconScale}) rotate(${iconRotation}deg)`,
                    width: width * 0.1,
                    height: width * 0.1,
                    borderRadius: width * 0.025,
                    background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: width * 0.055,
                    marginBottom: height * 0.03,
                    boxShadow: "0 8px 30px rgba(99, 102, 241, 0.3)",
                }}
            >
                🚀
            </div>

            {/* Headline */}
            <h2
                style={{
                    opacity: headlineOpacity,
                    transform: `translateX(${headlineX}px)`,
                    color: "#ffffff",
                    fontSize: width * 0.055,
                    fontWeight: 900,
                    lineHeight: 1.2,
                    margin: 0,
                    marginBottom: height * 0.015,
                }}
            >
                {headline}
            </h2>

            {/* Subtext */}
            <p
                style={{
                    opacity: subtextOpacity,
                    transform: `translateX(${subtextX}px)`,
                    color: "#94a3b8",
                    fontSize: width * 0.028,
                    lineHeight: 1.6,
                    margin: 0,
                    flex: 1,
                }}
            >
                {subtext}
            </p>

            {/* Feature pills */}
            <div style={{ display: "flex", gap: width * 0.015, flexWrap: "wrap", marginTop: height * 0.02 }}>
                {pills.map((pill, i) => {
                    const delay = 80 + i * 8;
                    const pillOpacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                    const pillY = interpolate(frame, [delay, delay + 12], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

                    return (
                        <span
                            key={pill}
                            style={{
                                opacity: pillOpacity,
                                transform: `translateY(${pillY}px)`,
                                padding: `${height * 0.008}px ${width * 0.025}px`,
                                borderRadius: 999,
                                background: "rgba(255,255,255,0.08)",
                                color: "#cbd5e1",
                                fontSize: width * 0.022,
                                fontWeight: 700,
                            }}
                        >
                            {pill}
                        </span>
                    );
                })}
            </div>

            {/* CTA bar */}
            <div
                style={{
                    opacity: ctaOpacity,
                    transform: `translateY(${ctaY}px)`,
                    marginTop: height * 0.03,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: `${height * 0.018}px ${width * 0.04}px`,
                    borderRadius: width * 0.02,
                    background: "rgba(255,255,255,0.05)",
                }}
            >
                <span style={{ fontSize: width * 0.025, fontWeight: 600, color: "#fff" }}>
                    Try it free →
                </span>
                <span style={{ fontSize: width * 0.02, color: "#818cf8" }}>
                    emailer.io
                </span>
            </div>
        </AbsoluteFill>
    );
};
