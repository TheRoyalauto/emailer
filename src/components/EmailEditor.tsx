"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface EmailEditorProps {
    htmlBody: string;
    onHtmlChange: (html: string) => void;
    subject?: string;
}

const VARIABLES = [
    { key: "{{firstName}}", label: "First Name" },
    { key: "{{lastName}}", label: "Last Name" },
    { key: "{{email}}", label: "Email" },
    { key: "{{unsubscribeUrl}}", label: "Unsubscribe Link" },
];

const HTML_SNIPPETS = [
    {
        id: "cta",
        icon: "🔘",
        name: "CTA Button",
        html: `<p style="margin:0 0 16px 0;"><a href="https://example.com" style="display:inline-block;padding:14px 28px;background:#8b5cf6;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">Get Started Now</a></p>`,
    },
    {
        id: "divider",
        icon: "➖",
        name: "Divider",
        html: `<hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e5;" />`,
    },
    {
        id: "bullets",
        icon: "📋",
        name: "Bullet List",
        html: `<ul style="margin:0 0 16px 20px;padding:0;">
    <li style="margin:0 0 8px 0;">First benefit or point</li>
    <li style="margin:0 0 8px 0;">Second benefit or point</li>
    <li style="margin:0 0 8px 0;">Third benefit or point</li>
</ul>`,
    },
    {
        id: "callout",
        icon: "💡",
        name: "Callout Box",
        html: `<div style="margin:0 0 16px 0;padding:16px 20px;background:#f3f4f6;border-left:4px solid #8b5cf6;border-radius:4px;">
    <strong style="display:block;margin-bottom:4px;">Pro Tip:</strong>
    <span style="color:#555;">Your helpful tip or important note goes here.</span>
</div>`,
    },
    {
        id: "signature",
        icon: "✍️",
        name: "Signature",
        html: `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e5e5;">
    <p style="margin:0 0 4px 0;font-weight:600;">Your Name</p>
    <p style="margin:0;color:#666;font-size:14px;">Your Title | Your Company</p>
</div>`,
    },
    {
        id: "social",
        icon: "🔗",
        name: "Social Links",
        html: `<p style="margin:16px 0 0 0;font-size:14px;color:#666;">
    Follow us:
    <a href="#" style="color:#0066cc;text-decoration:none;margin-left:8px;">Twitter</a> ·
    <a href="#" style="color:#0066cc;text-decoration:none;margin-left:4px;">LinkedIn</a> ·
    <a href="#" style="color:#0066cc;text-decoration:none;margin-left:4px;">Website</a>
</p>`,
    },
];

const STARTER_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#ffffff;">
    <div style="max-width:640px;margin:0 auto;padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#111111;">
        <p style="margin:0 0 16px 0;">Hi {{firstName}},</p>
        <p style="margin:0 0 16px 0;">Your message here...</p>
        <p style="margin:0;">Best regards</p>
    </div>
</body>
</html>`;

export default function EmailEditor({ htmlBody, onHtmlChange, subject }: EmailEditorProps) {
    const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
    const [activeTab, setActiveTab] = useState<"html" | "visual">("html");
    const [showVariables, setShowVariables] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClick = () => {
            setShowVariables(false);
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    // Insert text at cursor position
    const insertAtCursor = useCallback((text: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = htmlBody.substring(0, start) + text + htmlBody.substring(end);
        onHtmlChange(newValue);

        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + text.length;
            textarea.focus();
        }, 0);
    }, [htmlBody, onHtmlChange]);

    // Wrap selection with tags
    const wrapSelection = useCallback((before: string, after: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = htmlBody.substring(start, end);
        const newValue = htmlBody.substring(0, start) + before + selectedText + after + htmlBody.substring(end);
        onHtmlChange(newValue);

        setTimeout(() => {
            textarea.selectionStart = start + before.length;
            textarea.selectionEnd = start + before.length + selectedText.length;
            textarea.focus();
        }, 0);
    }, [htmlBody, onHtmlChange]);

    const formatBold = () => wrapSelection("<b>", "</b>");
    const formatItalic = () => wrapSelection("<i>", "</i>");
    const formatUnderline = () => wrapSelection("<u>", "</u>");
    const formatLink = () => {
        const url = prompt("Enter URL:");
        if (url) wrapSelection(`<a href="${url}" style="color:#0066cc;text-decoration:underline;">`, "</a>");
    };
    const formatParagraph = () => insertAtCursor('\n<p style="margin:0 0 16px 0;">New paragraph</p>');
    const formatList = () => insertAtCursor('\n<ul style="margin:0 0 16px 20px;padding:0;">\n    <li style="margin:0 0 6px 0;">Item 1</li>\n    <li style="margin:0 0 6px 0;">Item 2</li>\n</ul>');
    const formatButton = () => {
        const url = prompt("Button URL:", "https://");
        const text = prompt("Button text:", "Click Here");
        if (url && text) {
            insertAtCursor(`\n<p style="margin:0 0 16px 0;"><a href="${url}" style="display:inline-block;padding:12px 24px;background:#0066cc;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">${text}</a></p>`);
        }
    };

    // Handle Enter key to insert HTML line breaks
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            // Shift+Enter = new paragraph, Enter = line break
            const insertHtml = e.shiftKey
                ? '\n<p style="margin:0 0 16px 0;"></p>'
                : '<br>\n';

            const newValue = htmlBody.substring(0, start) + insertHtml + htmlBody.substring(end);
            onHtmlChange(newValue);

            setTimeout(() => {
                const newPos = start + insertHtml.length;
                textarea.selectionStart = textarea.selectionEnd = newPos;
                textarea.focus();
            }, 0);
        }
    };

    const loadStarterTemplate = () => {
        onHtmlChange(STARTER_TEMPLATE);
    };

    const insertSnippet = (html: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            // If no textarea, append to existing or set as new content
            onHtmlChange(htmlBody + "\n" + html);
            return;
        }
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = htmlBody.substring(0, start) + html + htmlBody.substring(end);
        onHtmlChange(newValue);
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + html.length;
            textarea.focus();
        }, 0);
    };

    // Preview with interpolated variables (sample data)
    const getPreviewHtml = () => {
        if (!htmlBody.trim()) {
            return `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:Arial,sans-serif;color:#888;padding:40px;text-align:center;">
                    <div>
                        <div style="font-size:48px;margin-bottom:16px;">📧</div>
                        <div style="font-size:14px;">Start typing or select a template<br/>to see your email preview here</div>
                    </div>
                </div>
            `;
        }
        return htmlBody
            .replace(/\{\{firstName\}\}/g, "John")
            .replace(/\{\{lastName\}\}/g, "Doe")
            .replace(/\{\{email\}\}/g, "john@example.com")
            .replace(/\{\{unsubscribeUrl\}\}/g, "#unsubscribe");
    };

    const isEmpty = !htmlBody.trim();

    return (
        <div style={{ display: "flex", gap: 16, height: "100%" }}>
            {/* Editor Panel */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                {/* Toolbar */}
                <div
                    style={{
                        display: "flex",
                        gap: 6,
                        padding: "10px 12px",
                        background: "var(--bg-tertiary)",
                        borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                        border: "1px solid var(--border-subtle)",
                        borderBottom: "none",
                        flexWrap: "wrap",
                        alignItems: "center",
                    }}
                >
                    {/* Tab switcher */}
                    <div style={{
                        display: "flex",
                        gap: 2,
                        padding: 2,
                        background: "var(--bg-primary)",
                        borderRadius: 6,
                        marginRight: 8,
                    }}>
                        <button
                            className={`btn btn-sm ${activeTab === "html" ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => setActiveTab("html")}
                            style={{ fontSize: 12, padding: "5px 12px", borderRadius: 4 }}
                        >
                            HTML
                        </button>
                        <button
                            className={`btn btn-sm ${activeTab === "visual" ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => setActiveTab("visual")}
                            style={{ fontSize: 12, padding: "5px 12px", borderRadius: 4 }}
                        >
                            Visual
                        </button>
                    </div>

                    <div style={{ width: 1, height: 20, background: "var(--border-subtle)" }} />

                    {/* Formatting buttons */}
                    <button className="btn btn-ghost btn-sm" onClick={formatBold} title="Bold" style={{ padding: "6px 10px", fontWeight: 700 }}>
                        B
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={formatItalic} title="Italic" style={{ padding: "6px 10px", fontStyle: "italic" }}>
                        I
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={formatUnderline} title="Underline" style={{ padding: "6px 10px", textDecoration: "underline" }}>
                        U
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={formatLink} title="Insert Link" style={{ padding: "6px 10px" }}>
                        🔗
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={formatParagraph} title="Add Paragraph" style={{ padding: "6px 10px" }}>
                        ¶
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={formatList} title="Add List" style={{ padding: "6px 10px" }}>
                        •••
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={formatButton} title="Add CTA Button" style={{ padding: "6px 10px" }}>
                        🔘
                    </button>

                    <div style={{ width: 1, height: 20, background: "var(--border-subtle)" }} />

                    {/* Variables dropdown */}
                    <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setShowVariables(!showVariables)}
                            style={{ padding: "6px 10px", fontSize: 12 }}
                        >
                            {`{{x}}`} ▾
                        </button>
                        {showVariables && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "calc(100% + 4px)",
                                    left: 0,
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border-subtle)",
                                    borderRadius: 8,
                                    padding: 6,
                                    zIndex: 100,
                                    minWidth: 160,
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                                }}
                            >
                                <div style={{ fontSize: 11, color: "var(--text-muted)", padding: "4px 8px", marginBottom: 4 }}>
                                    Insert Variable
                                </div>
                                {VARIABLES.map((v) => (
                                    <button
                                        key={v.key}
                                        className="btn btn-ghost btn-sm"
                                        style={{ width: "100%", justifyContent: "flex-start", fontSize: 12, padding: "6px 8px" }}
                                        onClick={() => {
                                            insertAtCursor(v.key);
                                            setShowVariables(false);
                                        }}
                                    >
                                        <code style={{ marginRight: 8, opacity: 0.6 }}>{v.key}</code>
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor Content - Always same layout */}
                <div
                    style={{
                        flex: 1,
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                        padding: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        overflow: "hidden",
                    }}
                >
                    {/* Insert Components - Always visible */}
                    <div style={{ flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>Insert Components</span>
                            {isEmpty && (
                                <button
                                    onClick={loadStarterTemplate}
                                    className="btn btn-ghost btn-sm"
                                    style={{ padding: "4px 10px", fontSize: 11 }}
                                >
                                    📄 Load Base Template
                                </button>
                            )}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                            {HTML_SNIPPETS.map((snippet) => (
                                <button
                                    key={snippet.id}
                                    onClick={() => insertSnippet(snippet.html)}
                                    style={{
                                        padding: "8px",
                                        background: "var(--bg-secondary)",
                                        border: "1px solid var(--border-subtle)",
                                        borderRadius: 6,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 4,
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                        fontSize: 10,
                                        color: "var(--text-secondary)",
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = "var(--accent-primary)";
                                        e.currentTarget.style.background = "var(--bg-tertiary)";
                                        e.currentTarget.style.color = "var(--text-primary)";
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = "var(--border-subtle)";
                                        e.currentTarget.style.background = "var(--bg-secondary)";
                                        e.currentTarget.style.color = "var(--text-secondary)";
                                    }}
                                    title={snippet.name}
                                >
                                    <span style={{ fontSize: 18 }}>{snippet.icon}</span>
                                    <span style={{ fontWeight: 500 }}>{snippet.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* HTML Textarea - Always visible */}
                    <textarea
                        ref={textareaRef}
                        className="form-textarea"
                        value={htmlBody}
                        onChange={(e) => onHtmlChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{
                            flex: 1,
                            fontFamily: "monospace",
                            fontSize: 13,
                            lineHeight: 1.6,
                            resize: "none",
                            minHeight: 200,
                        }}
                        placeholder="Start typing your email content...

Press Enter for line break (<br>)
Press Shift+Enter for new paragraph (<p>)"
                    />
                </div>
            </div>

            {/* Gmail-Style Preview Panel (Dark Theme) */}
            <div style={{
                width: previewMode === "mobile" ? 488 : 585,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                overflow: "hidden",
            }}>
                {/* Preview Mode Toggle */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        background: "var(--bg-tertiary)",
                        borderBottom: "1px solid var(--border-subtle)",
                    }}
                >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Gmail Preview</span>
                    <div style={{
                        display: "flex",
                        gap: 2,
                        padding: 2,
                        background: "var(--bg-primary)",
                        borderRadius: 6,
                    }}>
                        <button
                            className={`btn btn-sm ${previewMode === "desktop" ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => setPreviewMode("desktop")}
                            style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4 }}
                        >
                            🖥️
                        </button>
                        <button
                            className={`btn btn-sm ${previewMode === "mobile" ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => setPreviewMode("mobile")}
                            style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4 }}
                        >
                            📱
                        </button>
                    </div>
                </div>

                {/* Gmail Chrome - Toolbar */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 16px",
                    background: "var(--bg-tertiary)",
                    borderBottom: "1px solid var(--border-subtle)",
                }}>
                    <span style={{ cursor: "pointer", opacity: 0.5, fontSize: 14 }}>←</span>
                    <span style={{ cursor: "pointer", opacity: 0.5, fontSize: 12 }}>🗑️</span>
                    <span style={{ cursor: "pointer", opacity: 0.5, fontSize: 12 }}>📁</span>
                    <span style={{ cursor: "pointer", opacity: 0.5, fontSize: 12 }}>⚠️</span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>1 of 1</span>
                </div>

                {/* Email Header - Subject */}
                <div style={{
                    padding: "14px 16px 10px",
                    background: "var(--bg-primary)",
                    borderBottom: "1px solid var(--border-subtle)",
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 500,
                        color: "var(--text-primary)",
                    }}>
                        {subject || "No subject"}
                    </h2>
                    <div style={{
                        marginTop: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}>
                        <span style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            background: "rgba(139, 92, 246, 0.15)",
                            color: "var(--accent-primary)",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 500,
                        }}>Inbox</span>
                    </div>
                </div>

                {/* Sender Info */}
                <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "14px 16px",
                    background: "var(--bg-primary)",
                    borderBottom: "1px solid var(--border-subtle)",
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--accent-primary) 0%, #a855f7 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontSize: 14,
                        fontWeight: 600,
                        flexShrink: 0,
                    }}>
                        Y
                    </div>

                    {/* Sender details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                                Your Name
                            </span>
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                &lt;you@example.com&gt;
                            </span>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            to <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>John Doe</span>
                            <span style={{ fontSize: 9, opacity: 0.5 }}>▾</span>
                        </div>
                    </div>

                    {/* Timestamp & Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {new Date().toLocaleString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span style={{ cursor: "pointer", opacity: 0.4, fontSize: 12 }}>⭐</span>
                        <span style={{ cursor: "pointer", opacity: 0.4, fontSize: 12 }}>↩️</span>
                        <span style={{ cursor: "pointer", opacity: 0.4 }}>⋮</span>
                    </div>
                </div>

                {/* Email Body */}
                <div
                    style={{
                        flex: 1,
                        background: "var(--bg-primary)",
                        overflow: "auto",
                        minHeight: 220,
                    }}
                >
                    <iframe
                        srcDoc={`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;min-height:100%;background:#1a1a2e;color:#ffffff;}a{color:#a78bfa;}p,div,span,li,td,th,h1,h2,h3,h4,h5,h6{color:#ffffff !important;}</style></head><body style="padding:16px;font-family:Arial,Helvetica,sans-serif;background:#1a1a2e;color:#ffffff;">${getPreviewHtml()}</body></html>`}
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            display: "block",
                            minHeight: 220,
                            background: "#1a1a2e",
                        }}
                        title="Email Preview"
                        sandbox="allow-same-origin"
                    />
                </div>

                {/* Reply Bar */}
                <div style={{
                    padding: "10px 16px",
                    background: "var(--bg-secondary)",
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    gap: 8,
                }}>
                    <div style={{
                        flex: 1,
                        padding: "8px 14px",
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 20,
                        color: "var(--text-muted)",
                        fontSize: 13,
                        cursor: "text",
                    }}>
                        Click here to Reply
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ borderRadius: 20, padding: "8px 14px", fontSize: 12 }}>
                        Forward
                    </button>
                </div>
            </div>
        </div>
    );
}
