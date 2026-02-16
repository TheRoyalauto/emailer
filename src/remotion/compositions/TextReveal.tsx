

import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

// ─── Props ──────────────────────────────────────────────────────────────────────

interface TextRevealProps {
    headline: string;
    subtext: string;
    brandName?: string;
    accentColor?: string;
}

// ─── Composition ────────────────────────────────────────────────────────────────

export const TextReveal: React.FC<TextRevealProps> = ({
    headline = "Your Headline Here",
    subtext = "Add your supporting text",
    brandName = "E-MAILER.IO",
    accentColor = "#6366f1",
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Animations
    const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const logoY = interpolate(frame, [0, 20], [-30, 0], { extrapolateRight: "clamp" });

    const headlineOpacity = interpolate(frame, [15, 40], [0, 1], { extrapolateRight: "clamp" });
    const headlineY = interpolate(frame, [15, 40], [40, 0], { extrapolateRight: "clamp" });

    const subtextOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
    const subtextY = interpolate(frame, [40, 60], [20, 0], { extrapolateRight: "clamp" });

    const ctaScale = spring({ frame: frame - 70, fps, config: { damping: 12, stiffness: 100 } });
    const ctaOpacity = interpolate(frame, [70, 80], [0, 1], { extrapolateRight: "clamp" });

    // Orb animations
    const orb1X = interpolate(frame, [0, 180], [0, 30], { extrapolateRight: "clamp" });
    const orb1Scale = interpolate(frame, [0, 90, 180], [0.8, 1.2, 0.9]);
    const orb2X = interpolate(frame, [0, 180], [0, -20], { extrapolateRight: "clamp" });

    // Bottom accent line
    const lineScale = interpolate(frame, [100, 140], [0, 1], { extrapolateRight: "clamp" });

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
            {/* Ambient orbs */}
            <div
                style={{
                    position: "absolute",
                    width: width * 0.5,
                    height: width * 0.5,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)`,
                    top: "15%",
                    left: "5%",
                    transform: `translateX(${orb1X}px) scale(${orb1Scale})`,
                    filter: "blur(40px)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: width * 0.35,
                    height: width * 0.35,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #06b6d430 0%, transparent 70%)",
                    bottom: "20%",
                    right: "5%",
                    transform: `translateX(${orb2X}px)`,
                    filter: "blur(40px)",
                }}
            />

            {/* Brand Logo */}
            <div
                style={{
                    opacity: logoOpacity,
                    transform: `translateY(${logoY}px)`,
                    fontSize: width * 0.04,
                    fontWeight: 900,
                    background: `linear-gradient(90deg, ${accentColor}, #06b6d4)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "0.1em",
                    marginBottom: height * 0.04,
                }}
            >
                {brandName}
            </div>

            {/* Headline */}
            <h1
                style={{
                    opacity: headlineOpacity,
                    transform: `translateY(${headlineY}px)`,
                    color: "#ffffff",
                    fontSize: width * 0.065,
                    fontWeight: 900,
                    lineHeight: 1.15,
                    textAlign: "center",
                    maxWidth: "85%",
                    margin: 0,
                    marginBottom: height * 0.02,
                }}
            >
                {headline}
            </h1>

            {/* Subtext */}
            <p
                style={{
                    opacity: subtextOpacity,
                    transform: `translateY(${subtextY}px)`,
                    color: "#94a3b8",
                    fontSize: width * 0.028,
                    lineHeight: 1.6,
                    textAlign: "center",
                    maxWidth: "75%",
                    margin: 0,
                }}
            >
                {subtext}
            </p>

            {/* CTA Button */}
            <div
                style={{
                    opacity: ctaOpacity,
                    transform: `scale(${ctaScale})`,
                    marginTop: height * 0.04,
                    padding: `${height * 0.015}px ${width * 0.06}px`,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${accentColor}, #06b6d4)`,
                    color: "#ffffff",
                    fontSize: width * 0.025,
                    fontWeight: 700,
                }}
            >
                Learn More →
            </div>

            {/* Bottom accent line */}
            <div
                style={{
                    position: "absolute",
                    bottom: height * 0.06,
                    left: "10%",
                    right: "10%",
                    height: 2,
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${accentColor}, #06b6d4)`,
                    opacity: 0.5,
                    transform: `scaleX(${lineScale})`,
                }}
            />
        </AbsoluteFill>
    );
};
