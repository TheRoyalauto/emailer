import React from "react";
import { Composition } from "remotion";
import { TextReveal } from "./compositions/TextReveal";
import { StatsCounter } from "./compositions/StatsCounter";
import { FeatureShowcase } from "./compositions/FeatureShowcase";
import { TipCard } from "./compositions/TipCard";

// ─── Remotion Root ──────────────────────────────────────────────────────────────
// Register all video compositions for the Remotion studio and Player

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="TextReveal"
                component={TextReveal as unknown as React.FC<Record<string, unknown>>}
                durationInFrames={180}
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    headline: "Your Headline Here",
                    subtext: "Add your supporting text",
                    brandName: "E-MAILER.IO",
                    accentColor: "#6366f1",
                }}
            />
            <Composition
                id="StatsCounter"
                component={StatsCounter as unknown as React.FC<Record<string, unknown>>}
                durationInFrames={150}
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    headline: "Campaign Results",
                    subtext: "Powered by E-mailer.io",
                    brandName: "E-MAILER.IO",
                }}
            />
            <Composition
                id="FeatureShowcase"
                component={FeatureShowcase as unknown as React.FC<Record<string, unknown>>}
                durationInFrames={210}
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    headline: "Feature Name",
                    subtext: "Describe the feature and its benefits",
                    brandName: "E-MAILER.IO",
                }}
            />
            <Composition
                id="TipCard"
                component={TipCard as unknown as React.FC<Record<string, unknown>>}
                durationInFrames={150}
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    headline: "Your Tip Here",
                    subtext: "Explain why this tip matters and how to apply it",
                    brandName: "@emailer.io",
                }}
            />
        </>
    );
};
