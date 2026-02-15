import { ImageResponse } from "next/og";
import { getPostBySlug } from "../data";

export const runtime = "edge";
export const alt = "E-mailer Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        return new ImageResponse(
            (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#0f172a",
                        color: "#fff",
                        fontSize: 48,
                        fontFamily: "system-ui, sans-serif",
                    }}
                >
                    E-mailer Blog
                </div>
            ),
            { ...size }
        );
    }

    const categoryColor =
        post.category === "Cold Email"
            ? "#06b6d4"
            : post.category === "Deliverability"
                ? "#10b981"
                : post.category === "Templates"
                    ? "#f59e0b"
                    : post.category === "Guides"
                        ? "#8b5cf6"
                        : post.category === "Sales Strategy"
                            ? "#0284c7"
                            : "#64748b";

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "#0f172a",
                    fontFamily: "system-ui, sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Subtle grid pattern */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Accent glow */}
                <div
                    style={{
                        position: "absolute",
                        top: -120,
                        right: -120,
                        width: 400,
                        height: 400,
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${categoryColor}30, transparent 70%)`,
                        display: "flex",
                    }}
                />

                {/* Content container */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "60px 72px",
                        height: "100%",
                        position: "relative",
                    }}
                >
                    {/* Top row: Logo + Category */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        {/* Brand */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                            }}
                        >
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 10,
                                    background: "linear-gradient(135deg, #06b6d4, #0ea5e9)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontSize: 22,
                                    fontWeight: 700,
                                }}
                            >
                                E
                            </div>
                            <span
                                style={{
                                    color: "#94a3b8",
                                    fontSize: 22,
                                    fontWeight: 500,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                e-mailer.io/blog
                            </span>
                        </div>

                        {/* Category pill */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 20px",
                                borderRadius: 8,
                                background: `${categoryColor}18`,
                                border: `1px solid ${categoryColor}40`,
                            }}
                        >
                            <div
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: categoryColor,
                                    display: "flex",
                                }}
                            />
                            <span
                                style={{
                                    color: categoryColor,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                {post.category}
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 20,
                            maxWidth: 920,
                        }}
                    >
                        <h1
                            style={{
                                fontSize: post.title.length > 60 ? 44 : 52,
                                fontWeight: 700,
                                color: "#f8fafc",
                                lineHeight: 1.15,
                                letterSpacing: "-0.03em",
                                margin: 0,
                            }}
                        >
                            {post.title}
                        </h1>
                    </div>

                    {/* Bottom row: Author + Reading time */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                            }}
                        >
                            {/* Author avatar */}
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 10,
                                    background: "#1e293b",
                                    border: "1px solid #334155",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#94a3b8",
                                    fontSize: 16,
                                    fontWeight: 600,
                                }}
                            >
                                {post.author.avatar}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                <span
                                    style={{
                                        color: "#e2e8f0",
                                        fontSize: 18,
                                        fontWeight: 600,
                                    }}
                                >
                                    {post.author.name}
                                </span>
                                <span
                                    style={{
                                        color: "#64748b",
                                        fontSize: 15,
                                    }}
                                >
                                    {post.author.role}
                                </span>
                            </div>
                        </div>

                        {/* Meta */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 20,
                                color: "#64748b",
                                fontSize: 16,
                            }}
                        >
                            <span>{post.readingTime}</span>
                            <span style={{ color: "#334155" }}>·</span>
                            <span>
                                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
