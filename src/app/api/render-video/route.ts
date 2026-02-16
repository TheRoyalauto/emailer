import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import os from "os";

export const maxDuration = 120; // Allow up to 2 minutes for rendering

// ─── Template configs (must match src/remotion/Root.tsx) ────────────────────────

const TEMPLATE_CONFIGS: Record<string, { id: string; durationInFrames: number; fps: number }> = {
    "text-reveal": { id: "TextReveal", durationInFrames: 180, fps: 30 },
    "stats-counter": { id: "StatsCounter", durationInFrames: 150, fps: 30 },
    "feature-showcase": { id: "FeatureShowcase", durationInFrames: 210, fps: 30 },
    "tip-card": { id: "TipCard", durationInFrames: 150, fps: 30 },
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { templateId, headline, subtext } = body;

        if (!templateId || !TEMPLATE_CONFIGS[templateId]) {
            return NextResponse.json(
                { error: `Invalid templateId. Valid: ${Object.keys(TEMPLATE_CONFIGS).join(", ")}` },
                { status: 400 }
            );
        }

        const config = TEMPLATE_CONFIGS[templateId];

        // Dynamic imports (these are heavy — only load when needed)
        const { bundle } = await import("@remotion/bundler");
        const { renderMedia, selectComposition } = await import("@remotion/renderer");

        // Bundle the Remotion project
        const entryPoint = path.resolve(process.cwd(), "src/remotion/Root.tsx");
        const bundled = await bundle({
            entryPoint,
            onProgress: (progress: number) => {
                console.log(`[render-video] Bundling: ${(progress * 100).toFixed(0)}%`);
            },
        });

        // Select the composition
        const inputProps = {
            headline: headline || "Your Headline Here",
            subtext: subtext || "Add your supporting text",
            brandName: templateId === "tip-card" ? "@emailer.io" : "E-MAILER.IO",
            ...(templateId === "text-reveal" ? { accentColor: "#6366f1" } : {}),
        };

        const composition = await selectComposition({
            serveUrl: bundled,
            id: config.id,
            inputProps,
        });

        // Render to a temp file
        const outputDir = path.join(os.tmpdir(), "remotion-renders");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, `${config.id}-${Date.now()}.mp4`);

        await renderMedia({
            composition,
            serveUrl: bundled,
            codec: "h264",
            outputLocation: outputPath,
            inputProps,
            onProgress: ({ progress }: { progress: number }) => {
                console.log(`[render-video] Rendering: ${(progress * 100).toFixed(0)}%`);
            },
        });

        // Read the file and return as response
        const videoBuffer = fs.readFileSync(outputPath);

        // Clean up
        try {
            fs.unlinkSync(outputPath);
        } catch {
            // ignore cleanup errors
        }

        return new NextResponse(videoBuffer, {
            status: 200,
            headers: {
                "Content-Type": "video/mp4",
                "Content-Disposition": `attachment; filename="${config.id}-video.mp4"`,
                "Content-Length": videoBuffer.length.toString(),
            },
        });
    } catch (error: any) {
        console.error("[render-video] Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to render video" },
            { status: 500 }
        );
    }
}
