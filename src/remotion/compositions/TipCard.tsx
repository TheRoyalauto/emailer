

import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

// ─── Props ──────────────────────────────────────────────────────────────────────

interface TipCardProps {
    headline: string;
    subtext: string;
    brandName?: string;
}

// ─── Composition ────────────────────────────────────────────────────────────────

export const TipCard: React.FC<TipCardProps> = ({
    headline = "Your Tip Here",
    subtext = "Explain why this tip matters and how to apply it",
    brandName = "@emailer.io",
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Badge entrance
    const badgeScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
    const badgeOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

    // Headline
    const headlineOpacity = interpolate(frame, [12, 30], [0, 1], { extrapolateRight: "clamp" });
    const headlineY = interpolate(frame, [12, 30], [25, 0], { extrapolateRight: "clamp" });

    // Subtext
    const subtextOpacity = interpolate(frame, [30, 48], [0, 1], { extrapolateRight: "clamp" });
    const subtextY = interpolate(frame, [30, 48], [20, 0], { extrapolateRight: "clamp" });

    // Steps
    const steps = ["Set up your campaign", "Write compelling copy", "Hit send & watch results"];

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
                    width: width * 0.6,
                    height: width * 0.6,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #f59e0b15 0%, transparent 70%)",
                    top: "25%",
                    left: "15%",
                    filter: "blur(50px)",
                }}
            />

            {/* Tip badge */}
            <div
                style={{
                    opacity: badgeOpacity,
                    transform: `scale(${badgeScale})`,
                    padding: `${height * 0.01}px ${width * 0.05}px`,
                    borderRadius: 999,
                    background: "rgba(245, 158, 11, 0.15)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    marginBottom: height * 0.035,
                }}
            >
                <span style={{ fontSize: width * 0.028, fontWeight: 800, color: "#fbbf24" }}>
                    💡 Pro Tip
                </span>
            </div>

            {/* Headline */}
            <h2
                style={{
                    opacity: headlineOpacity,
                    transform: `translateY(${headlineY}px)`,
                    color: "#ffffff",
                    fontSize: width * 0.055,
                    fontWeight: 900,
                    lineHeight: 1.2,
                    textAlign: "center",
                    maxWidth: "85%",
                    margin: 0,
                    marginBottom: height * 0.02,
                }}
            >
                {headline}
            </h2>

            {/* Subtext */}
            <p
                style={{
                    opacity: subtextOpacity,
                    transform: `translateY(${subtextY}px)`,
                    color: "#94a3b8",
                    fontSize: width * 0.028,
                    lineHeight: 1.6,
                    textAlign: "center",
                    maxWidth: "80%",
                    margin: 0,
                    marginBottom: height * 0.04,
                }}
            >
                {subtext}
            </p>

            {/* Steps */}
            <div style={{ width: "80%", display: "flex", flexDirection: "column", gap: height * 0.012 }}>
                {steps.map((step, i) => {
                    const delay = 55 + i * 12;
                    const stepOpacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                    const stepX = interpolate(frame, [delay, delay + 12], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

                    return (
                        <div
                            key={step}
                            style={{
                                opacity: stepOpacity,
                                transform: `translateX(${stepX}px)`,
                                display: "flex",
                                alignItems: "center",
                                gap: width * 0.025,
                                padding: `${height * 0.012}px ${width * 0.03}px`,
                                borderRadius: width * 0.015,
                                background: "rgba(255,255,255,0.04)",
                            }}
                        >
                            <div
                                style={{
                                    width: width * 0.045,
                                    height: width * 0.045,
                                    borderRadius: "50%",
                                    background: "#6366f1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: width * 0.022,
                                    fontWeight: 800,
                                    color: "#fff",
                                    flexShrink: 0,
                                }}
                            >
                                {i + 1}
                            </div>
                            <span style={{ fontSize: width * 0.025, color: "#cbd5e1" }}>
                                {step}
                            </span>
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
                    fontWeight: 600,
                    color: "#818cf8",
                }}
            >
                {brandName} • Follow for more tips
            </div>
        </AbsoluteFill>
    );
};
