"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";

// Note: Send Test Email requires backend team to create convex/testEmail.ts
// See instructions in the Send Test modal

interface EmailEditorProps {
    htmlBody: string;
    onHtmlChange: (html: string) => void;
    subject?: string;
    smtpConfig?: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
    };
    fromName?: string;
    fromEmail?: string;
}

const VARIABLES = [
    { key: "{{firstName}}", label: "First Name", icon: "👤" },
    { key: "{{lastName}}", label: "Last Name", icon: "👤" },
    { key: "{{email}}", label: "Email", icon: "📧" },
    { key: "{{company}}", label: "Company", icon: "🏢" },
    { key: "{{unsubscribeUrl}}", label: "Unsubscribe", icon: "🔗" },
];

const HTML_SNIPPETS = [
    { id: "cta", icon: "🔘", name: "Button", html: `<p style="margin:0 0 16px 0;"><a href="https://example.com" style="display:inline-block;padding:14px 28px;background:#0891b2;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">Get Started Now</a></p>` },
    { id: "divider", icon: "➖", name: "Divider", html: `<hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0;" />` },
    { id: "bullets", icon: "📋", name: "List", html: `<ul style="margin:0 0 16px 20px;padding:0;"><li style="margin:0 0 8px 0;">First point</li><li style="margin:0 0 8px 0;">Second point</li></ul>` },
    { id: "callout", icon: "💡", name: "Callout", html: `<div style="margin:0 0 16px 0;padding:16px 20px;background:#f0f9ff;border-left:4px solid #0891b2;border-radius:4px;"><strong>Pro Tip:</strong> Your note here.</div>` },
    { id: "signature", icon: "✍️", name: "Signature", html: `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;"><p style="margin:0 0 4px 0;font-weight:600;">Your Name</p><p style="margin:0;color:#64748b;font-size:14px;">Title | Company</p></div>` },
    { id: "spacer", icon: "↕️", name: "Spacer", html: `<div style="height:32px;"></div>` },
    { id: "image", icon: "🖼️", name: "Image", html: `<img src="https://placehold.co/600x200/f0f9ff/0891b2?text=Your+Image" alt="Image" style="max-width:100%;height:auto;border-radius:8px;margin:0 0 16px 0;" />` },
];

const AI_TONES = [
    { id: "professional", label: "Professional", icon: "💼", desc: "Formal and business-appropriate" },
    { id: "casual", label: "Casual", icon: "😊", desc: "Friendly and conversational" },
    { id: "urgent", label: "Urgent", icon: "⚡", desc: "Action-oriented and time-sensitive" },
    { id: "persuasive", label: "Persuasive", icon: "🎯", desc: "Compelling and conversion-focused" },
    { id: "concise", label: "Concise", icon: "✂️", desc: "Shorter and more direct" },
];

const KEYBOARD_SHORTCUTS = [
    { keys: ["Ctrl", "B"], action: "Bold" },
    { keys: ["Ctrl", "I"], action: "Italic" },
    { keys: ["Ctrl", "U"], action: "Underline" },
    { keys: ["Ctrl", "K"], action: "Insert link" },
    { keys: ["Ctrl", "Z"], action: "Undo" },
    { keys: ["Ctrl", "Shift", "Z"], action: "Redo" },
    { keys: ["Ctrl", "Shift", "7"], action: "Numbered list" },
    { keys: ["Ctrl", "Shift", "8"], action: "Bullet list" },
    { keys: ["Ctrl", "Enter"], action: "New paragraph" },
    { keys: ["Ctrl", "Shift", "H"], action: "Toggle HTML mode" },
    { keys: ["F11"], action: "Toggle fullscreen" },
    { keys: ["Esc"], action: "Exit fullscreen" },
];

const PREVIEW_DEVICES = [
    { id: "desktop" as const, icon: "🖥️", label: "Desktop", width: "100%" },
    { id: "tablet" as const, icon: "📱", label: "Tablet", width: "768px" },
    { id: "mobile" as const, icon: "📲", label: "Mobile", width: "375px" },
];

const STARTER_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#ffffff;">
    <div style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#111111;">
        <p style="margin:0 0 16px 0;">Hi {{firstName}},</p>
        <p style="margin:0 0 16px 0;">Your message here...</p>
        <p style="margin:0;">Best regards</p>
    </div>
</body>
</html>`;

function extractBodyContent(html: string): string {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) return bodyMatch[1].trim();
    const divMatch = html.match(/<div[^>]*>([\s\S]*)<\/div>/i);
    if (divMatch) return divMatch[1].trim();
    return html;
}

function wrapInEmailHtml(content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#ffffff;">
    <div style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#111111;">
        ${content}
    </div>
</body>
</html>`;
}

// Basic HTML syntax highlighting (produces highlighted spans)
function highlightHtml(code: string): string {
    return code
        // HTML comments
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-slate-400 dark:text-slate-600">$1</span>')
        // Tags
        .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="text-rose-600 dark:text-rose-400">$2</span>')
        // Attributes
        .replace(/([\w-]+)(=)/g, '<span class="text-amber-700 dark:text-amber-300">$1</span><span class="text-slate-400 dark:text-slate-500">$2</span>')
        // Strings
        .replace(/("([^"]*)")/g, '<span class="text-emerald-600 dark:text-emerald-400">$1</span>')
        // Angle brackets
        .replace(/(&lt;|&gt;|\/>)/g, '<span class="text-slate-400 dark:text-slate-500">$1</span>');
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// ── Toolbar Button ──────────────────────────────────────────────────────────
function ToolbarBtn({ onClick, isActive, children, title }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
}) {
    return (
        <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`w-7 h-7 flex items-center justify-center rounded-md text-sm transition-all ${isActive
                ? "bg-cyan-50 text-cyan-700 shadow-sm ring-1 ring-cyan-200"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
            title={title}
        >
            {children}
        </button>
    );
}

// ── Keyboard Shortcuts Modal ────────────────────────────────────────────────
function ShortcutsModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900">Keyboard Shortcuts</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Speed up your workflow</p>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-xs">✕</button>
                </div>
                <div className="p-3 max-h-[60vh] overflow-auto">
                    {KEYBOARD_SHORTCUTS.map((s, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-sm text-slate-600">{s.action}</span>
                            <div className="flex items-center gap-1">
                                {s.keys.map((k, j) => (
                                    <span key={j}>
                                        <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-500 shadow-sm min-w-[24px] text-center inline-block">
                                            {k}
                                        </kbd>
                                        {j < s.keys.length - 1 && <span className="text-slate-300 mx-0.5 text-[10px]">+</span>}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                    <p className="text-[10px] text-slate-400 text-center">On Mac, replace <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono">Ctrl</kbd> with <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono">⌘ Cmd</kbd></p>
                </div>
            </div>
        </div>
    );
}

// ── Main Email Editor ───────────────────────────────────────────────────────
export default function EmailEditor({ htmlBody, onHtmlChange, subject, smtpConfig, fromName, fromEmail }: EmailEditorProps) {
    const [mode, setMode] = useState<"visual" | "html" | "preview">("visual");
    const [showVars, setShowVars] = useState(false);
    const [showSnippets, setShowSnippets] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showAiMenu, setShowAiMenu] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [testEmail, setTestEmail] = useState("");
    const [testStatus, setTestStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [aiRewriting, setAiRewriting] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
    const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLPreElement>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

    // Close dropdowns on outside click
    useEffect(() => {
        const close = () => { setShowVars(false); setShowSnippets(false); setShowAiMenu(false); };
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, []);

    // ── Feature 1: Auto-save indicator ──
    useEffect(() => {
        if (!htmlBody.trim()) return;
        setSaveState("saving");
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            setSaveState("saved");
            setTimeout(() => setSaveState("idle"), 2000);
        }, 600);
        return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
    }, [htmlBody]);

    // Keyboard shortcut: F11 for fullscreen, Ctrl+Shift+H for HTML toggle, Escape to exit
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
            if (e.key === "F11") { e.preventDefault(); setIsFullscreen((f) => !f); }
            if (e.key === "H" && e.ctrlKey && e.shiftKey) {
                e.preventDefault();
                setMode((m) => m === "html" ? "visual" : "html");
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isFullscreen]);

    // TipTap editor
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: "text-cyan-600 underline cursor-pointer" },
            }),
            Placeholder.configure({ placeholder: "Start writing your email…" }),
        ],
        content: extractBodyContent(htmlBody),
        onUpdate: ({ editor: ed }) => {
            onHtmlChange(wrapInEmailHtml(ed.getHTML()));
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none focus:outline-none min-h-[240px] px-5 py-4 text-slate-800 leading-relaxed",
            },
        },
    });

    // Sync when switching modes
    useEffect(() => {
        if (mode === "visual" && editor) {
            const current = extractBodyContent(htmlBody);
            const existing = editor.getHTML();
            if (current.replace(/\s+/g, "") !== existing.replace(/\s+/g, "")) {
                editor.commands.setContent(current);
            }
        }
    }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Feature 2: Syntax highlighted HTML ──
    const highlightedCode = useMemo(() => {
        return highlightHtml(escapeHtml(htmlBody));
    }, [htmlBody]);

    // Sync scroll between textarea and highlight overlay
    const handleCodeScroll = useCallback(() => {
        if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    }, []);

    // Insert into whichever mode is active
    const insertContent = useCallback((text: string) => {
        if (mode === "visual" && editor) {
            editor.chain().focus().insertContent(text).run();
        } else if (mode === "html") {
            const ta = textareaRef.current;
            if (!ta) { onHtmlChange(htmlBody + text); return; }
            const s = ta.selectionStart;
            const e = ta.selectionEnd;
            const next = htmlBody.substring(0, s) + text + htmlBody.substring(e);
            onHtmlChange(next);
            setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + text.length; ta.focus(); }, 0);
        }
    }, [mode, editor, htmlBody, onHtmlChange]);

    // Code mode: wrap selection with tags
    const wrapSelection = useCallback((before: string, after: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const s = ta.selectionStart;
        const e = ta.selectionEnd;
        const sel = htmlBody.substring(s, e);
        onHtmlChange(htmlBody.substring(0, s) + before + sel + after + htmlBody.substring(e));
        setTimeout(() => { ta.selectionStart = s + before.length; ta.selectionEnd = s + before.length + sel.length; ta.focus(); }, 0);
    }, [htmlBody, onHtmlChange]);

    const addLink = () => {
        const url = prompt("Enter URL:");
        if (!url) return;
        if (mode === "visual" && editor) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        } else {
            wrapSelection(`<a href="${url}" style="color:#0891b2;text-decoration:underline;">`, "</a>");
        }
    };

    const loadStarterTemplate = () => {
        onHtmlChange(STARTER_TEMPLATE);
        if (editor) editor.commands.setContent(extractBodyContent(STARTER_TEMPLATE));
    };

    // ── Feature 4: AI Rewrite ──
    const handleAiRewrite = useCallback(async (toneId: string) => {
        setShowAiMenu(false);
        if (!htmlBody.trim()) return;
        setAiRewriting(true);

        const tone = AI_TONES.find((t) => t.id === toneId);
        const bodyText = extractBodyContent(htmlBody);

        // Client-side rewrite simulation — when backend team sets up an API endpoint,
        // replace this block with a fetch call to your Convex action
        try {
            // Simulated tone transformation for now
            let rewritten = bodyText;
            if (toneId === "concise") {
                // Strip extra whitespace and simplify
                rewritten = bodyText
                    .replace(/<p[^>]*>\s*<\/p>/g, "")
                    .replace(/\s{2,}/g, " ");
            } else if (toneId === "urgent") {
                rewritten = bodyText.replace(
                    /(<p[^>]*>)(.*?)(<\/p>)/gi,
                    (_, open, text, close) => {
                        if (text.includes("{{")) return `${open}${text}${close}`;
                        return `${open}${text}${close}`;
                    }
                );
            }

            // For now this is a placeholder — actual AI endpoint needed
            await new Promise((r) => setTimeout(r, 800));

            // Show a toast-style notification that AI rewrite needs backend
            console.info(
                `[E-Mailer AI] Tone "${tone?.label}" requested. Connect to your AI endpoint for live rewriting.`
            );

            // In a real implementation, you'd do:
            // const result = await convex.action(api.ai.rewriteEmail, { body: bodyText, tone: toneId });
            // onHtmlChange(wrapInEmailHtml(result));

        } finally {
            setAiRewriting(false);
        }
    }, [htmlBody]);

    // ── Feature: Send Test Email ──
    const handleSendTest = useCallback(async () => {
        if (!testEmail.includes("@") || !htmlBody.trim()) return;

        if (!smtpConfig) {
            setTestStatus("error");
            return;
        }

        setTestStatus("sending");
        try {
            const testHtml = htmlBody
                .replace(/\{\{firstName\}\}/g, "John")
                .replace(/\{\{lastName\}\}/g, "Doe")
                .replace(/\{\{email\}\}/g, testEmail)
                .replace(/\{\{company\}\}/g, "Acme Inc.")
                .replace(/\{\{unsubscribeUrl\}\}/g, "#unsubscribe");

            const response = await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: testEmail,
                    subject: `[TEST] ${subject || "Test Email"}`,
                    html: testHtml,
                    from: {
                        name: fromName || "Test Sender",
                        email: fromEmail || "test@example.com",
                    },
                    smtp: smtpConfig,
                }),
            });

            if (response.ok) {
                setTestStatus("sent");
            } else {
                const err = await response.json().catch(() => ({}));
                console.error("[E-Mailer] Test email failed:", err);
                setTestStatus("error");
            }
        } catch {
            setTestStatus("error");
        }
    }, [testEmail, htmlBody, subject, smtpConfig, fromName, fromEmail]);

    const getPreviewHtml = () => {
        if (!htmlBody.trim()) {
            return `<div style="display:flex;align-items:center;justify-content:center;height:240px;color:#94a3b8;text-align:center;font-family:Arial,sans-serif;">
                <div><div style="font-size:48px;margin-bottom:12px;">📧</div><div style="font-size:14px;">Start typing to see your email</div></div></div>`;
        }
        return htmlBody
            .replace(/\{\{firstName\}\}/g, "John")
            .replace(/\{\{lastName\}\}/g, "Doe")
            .replace(/\{\{email\}\}/g, "john@example.com")
            .replace(/\{\{company\}\}/g, "Acme Inc.")
            .replace(/\{\{unsubscribeUrl\}\}/g, "#unsubscribe");
    };

    const isEmpty = !htmlBody.trim();
    const lineCount = htmlBody.split("\n").length;

    // Stats for status bar
    const charCount = htmlBody.length;
    const wordCount = htmlBody.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
    const byteSize = new Blob([htmlBody]).size;
    const kbSize = (byteSize / 1024).toFixed(1);
    const isClipped = byteSize > 102 * 1024;
    const isWarning = byteSize > 80 * 1024;

    return (
        <>
            {/* Fullscreen backdrop */}
            {isFullscreen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsFullscreen(false)}
                />
            )}

            {/* Shortcuts modal */}
            {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}

            <div className={`flex flex-col bg-white overflow-hidden shadow-sm transition-all duration-300 ${isFullscreen
                ? "fixed inset-4 z-50 rounded-2xl border border-slate-200/50 shadow-2xl animate-in zoom-in-95 fade-in duration-200"
                : "h-full rounded-xl border border-slate-200"
                }`}>

                {/* ── Toolbar ────────────────────────────────────────────── */}
                <div className="px-3 py-2 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
                    {/* Mode switcher */}
                    <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg shrink-0">
                        {([
                            { id: "visual" as const, label: "✏️ Write", tip: "Rich text editing" },
                            { id: "html" as const, label: "</> HTML", tip: "Edit raw HTML (Ctrl+Shift+H)" },
                            { id: "preview" as const, label: "👁 Preview", tip: "See final email" },
                        ]).map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === m.id
                                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-400 hover:text-slate-600"
                                    }`}
                                title={m.tip}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Formatting tools (visible in Write and HTML modes) */}
                    {mode !== "preview" && (
                        <div className="flex items-center gap-0.5 flex-wrap min-w-0">
                            {mode === "visual" && editor && (
                                <>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold (Ctrl+B)">
                                        <span className="font-bold text-xs">B</span>
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic (Ctrl+I)">
                                        <span className="italic text-xs">I</span>
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline (Ctrl+U)">
                                        <span className="underline text-xs">U</span>
                                    </ToolbarBtn>
                                    <div className="w-px h-5 bg-slate-200 mx-0.5" />
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading">
                                        <span className="font-bold text-[10px]">H1</span>
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="Subheading">
                                        <span className="font-semibold text-[10px]">H2</span>
                                    </ToolbarBtn>
                                    <div className="w-px h-5 bg-slate-200 mx-0.5" />
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List (Ctrl+Shift+8)">
                                        <span className="text-xs">•≡</span>
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Numbered List (Ctrl+Shift+7)">
                                        <span className="text-xs">1.</span>
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Quote">
                                        <span className="text-xs">❝</span>
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
                                        <span className="text-xs">━</span>
                                    </ToolbarBtn>
                                    <div className="w-px h-5 bg-slate-200 mx-0.5" />
                                </>
                            )}

                            {mode === "html" && (
                                <>
                                    <ToolbarBtn onClick={() => wrapSelection("<b>", "</b>")} title="Bold (Ctrl+B)">
                                        <span className="font-bold text-xs">B</span>
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => wrapSelection("<i>", "</i>")} title="Italic (Ctrl+I)">
                                        <span className="italic text-xs">I</span>
                                    </ToolbarBtn>
                                    <div className="w-px h-5 bg-slate-200 mx-0.5" />
                                </>
                            )}

                            {/* Link */}
                            <ToolbarBtn onClick={addLink} isActive={mode === "visual" && editor?.isActive("link")} title="Link (Ctrl+K)">
                                <span className="text-xs">🔗</span>
                            </ToolbarBtn>
                            {mode === "visual" && editor?.isActive("link") && (
                                <ToolbarBtn onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">
                                    <span className="text-xs">🚫</span>
                                </ToolbarBtn>
                            )}

                            <div className="w-px h-5 bg-slate-200 mx-0.5" />

                            {/* Snippets */}
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => { setShowSnippets(!showSnippets); setShowVars(false); setShowAiMenu(false); }}
                                    className={`px-2 py-1 rounded-md text-xs transition-all flex items-center gap-1 ${showSnippets ? "bg-cyan-50 text-cyan-700" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}
                                >
                                    📦 <span className="hidden sm:inline">Insert</span> ▾
                                </button>
                                {showSnippets && (
                                    <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl p-1.5 z-50 min-w-48 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                                        <div className="text-[10px] text-slate-400 px-2 py-1 font-semibold uppercase tracking-wider">Components</div>
                                        {HTML_SNIPPETS.map((s) => (
                                            <button
                                                key={s.id}
                                                className="w-full px-2.5 py-2 text-left text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2.5"
                                                onClick={() => { insertContent(s.html); setShowSnippets(false); }}
                                            >
                                                <span className="text-sm">{s.icon}</span>
                                                <span className="font-medium">{s.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Variables */}
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => { setShowVars(!showVars); setShowSnippets(false); setShowAiMenu(false); }}
                                    className={`px-2 py-1 rounded-md text-xs font-mono transition-all ${showVars ? "bg-cyan-50 text-cyan-700" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}
                                >
                                    {`{{x}}`} ▾
                                </button>
                                {showVars && (
                                    <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl p-1.5 z-50 min-w-48 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                                        <div className="text-[10px] text-slate-400 px-2 py-1 font-semibold uppercase tracking-wider">Merge Variables</div>
                                        {VARIABLES.map((v) => (
                                            <button
                                                key={v.key}
                                                className="w-full px-2.5 py-2 text-left text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                                                onClick={() => { insertContent(v.key); setShowVars(false); }}
                                            >
                                                <span>{v.icon}</span>
                                                <code className="text-cyan-600 bg-cyan-50 px-1 py-0.5 rounded text-[10px] font-mono">{v.key}</code>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {mode === "visual" && editor && (
                                <>
                                    <div className="w-px h-5 bg-slate-200 mx-0.5" />
                                    <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">
                                        <span className="text-xs">↩</span>
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Shift+Z)">
                                        <span className="text-xs">↪</span>
                                    </ToolbarBtn>
                                </>
                            )}
                        </div>
                    )}

                    {/* Preview mode: device width toggle */}
                    {mode === "preview" && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg">
                                {PREVIEW_DEVICES.map((d) => (
                                    <button
                                        key={d.id}
                                        onClick={() => setPreviewDevice(d.id)}
                                        className={`px-2 py-1 text-xs rounded-md transition-all flex items-center gap-1 ${previewDevice === d.id
                                            ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                                            : "text-slate-400 hover:text-slate-600"
                                            }`}
                                        title={d.label}
                                    >
                                        <span>{d.icon}</span>
                                        <span className="hidden sm:inline text-[10px] font-medium">{d.label}</span>
                                    </button>
                                ))}
                            </div>
                            <span className="text-[10px] text-slate-300">Live preview</span>
                        </div>
                    )}

                    {/* Right-side controls: save indicator, shortcuts, fullscreen */}
                    <div className="flex items-center gap-1.5 ml-auto shrink-0">
                        {/* Auto-save indicator */}
                        {saveState !== "idle" && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${saveState === "saving"
                                ? "text-amber-500"
                                : "text-emerald-500"
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${saveState === "saving" ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
                                {saveState === "saving" ? "Saving" : "Saved"}
                            </div>
                        )}

                        {/* Copy HTML */}
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(htmlBody);
                                const btn = document.getElementById("copy-html-btn");
                                if (btn) { btn.textContent = "✓ Copied!"; setTimeout(() => { btn.textContent = "📋 Copy HTML"; }, 1500); }
                            }}
                            id="copy-html-btn"
                            disabled={isEmpty}
                            className="px-2 py-1 rounded-md text-[10px] font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                            title="Copy full HTML to clipboard"
                        >
                            📋 Copy HTML
                        </button>

                        {/* Send Test Email */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => { setShowTestModal(!showTestModal); setTestStatus("idle"); }}
                                disabled={isEmpty}
                                className="px-2 py-1 rounded-md text-[10px] font-medium text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                                title="Send a test email to yourself"
                            >
                                🚀 Send Test
                            </button>
                            {showTestModal && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl p-4 z-50 w-72 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold text-slate-900">Send Test Email</h4>
                                        <button onClick={() => setShowTestModal(false)} className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 text-[10px]">✕</button>
                                    </div>

                                    {testStatus === "sent" ? (
                                        <div className="text-center py-3">
                                            <div className="text-2xl mb-2">✅</div>
                                            <p className="text-sm font-medium text-emerald-600">Test email sent!</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Check your inbox for {testEmail}</p>
                                            <button
                                                onClick={() => { setTestStatus("idle"); setShowTestModal(false); }}
                                                className="mt-3 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    ) : testStatus === "error" ? (
                                        <div className="text-center py-3">
                                            <div className="text-2xl mb-2">⚠️</div>
                                            <p className="text-sm font-medium text-red-600">{smtpConfig ? "Send failed" : "No SMTP configured"}</p>
                                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                                {smtpConfig
                                                    ? "Check your SMTP settings and try again"
                                                    : "Pass smtpConfig prop to enable test sends, or configure SMTP in Settings"}
                                            </p>
                                            <button
                                                onClick={() => setTestStatus("idle")}
                                                className="mt-3 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <label className="block text-[10px] text-slate-500 font-medium mb-1 uppercase tracking-wider">Recipient</label>
                                            <input
                                                type="email"
                                                value={testEmail}
                                                onChange={(e) => setTestEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 bg-slate-50 placeholder:text-slate-300 transition-all"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && testEmail.includes("@")) {
                                                        handleSendTest();
                                                    }
                                                }}
                                                autoFocus
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1.5 mb-3">Uses your default sending account • Variables replaced with sample data</p>
                                            <button
                                                onClick={handleSendTest}
                                                disabled={!testEmail.includes("@") || testStatus === "sending"}
                                                className="w-full px-3 py-2 text-xs font-medium bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
                                            >
                                                {testStatus === "sending" ? (
                                                    <>
                                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>🚀 Send Test Email</>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Keyboard shortcuts */}
                        <button
                            onClick={() => setShowShortcuts(true)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                            title="Keyboard shortcuts"
                        >
                            <span className="text-[10px] font-mono font-bold">⌨</span>
                        </button>

                        {/* Fullscreen toggle */}
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isFullscreen
                                ? "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-300 shadow-sm"
                                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                }`}
                            title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen (F11)"}
                        >
                            {isFullscreen ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="4 14 10 14 10 20" />
                                    <polyline points="20 10 14 10 14 4" />
                                    <line x1="14" y1="10" x2="21" y2="3" />
                                    <line x1="3" y1="21" x2="10" y2="14" />
                                </svg>
                            ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 3 21 3 21 9" />
                                    <polyline points="9 21 3 21 3 15" />
                                    <line x1="21" y1="3" x2="14" y2="10" />
                                    <line x1="3" y1="21" x2="10" y2="14" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Starter Template Banner ── */}
                {isEmpty && mode !== "preview" && (
                    <div className="px-4 py-2.5 bg-gradient-to-r from-cyan-50/80 to-sky-50/80 border-b border-cyan-100/60 flex items-center justify-between shrink-0">
                        <span className="text-xs text-cyan-700/70">Start from scratch or load a template</span>
                        <button
                            onClick={loadStarterTemplate}
                            className="px-3 py-1.5 text-xs bg-white hover:bg-cyan-50 border border-cyan-200 rounded-lg text-cyan-700 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                        >
                            📄 Load Starter
                        </button>
                    </div>
                )}

                {/* ── AI Rewriting Overlay ── */}
                {aiRewriting && (
                    <div className="px-4 py-2 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100 flex items-center gap-2 shrink-0">
                        <div className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                        <span className="text-xs text-violet-600 font-medium">AI is rewriting your email...</span>
                    </div>
                )}

                {/* ── Editor Area ────────────────────────────────────────── */}
                <div className="flex-1 overflow-hidden min-h-0">

                    {/* WRITE MODE */}
                    {mode === "visual" && (
                        <div className="h-full overflow-auto">
                            <EditorContent editor={editor} className="h-full" />
                        </div>
                    )}

                    {/* HTML MODE — Syntax highlighted */}
                    {mode === "html" && (
                        <div className="h-full flex overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
                            {/* Line numbers */}
                            <div className="py-4 pl-4 pr-2 text-right select-none pointer-events-none shrink-0 overflow-hidden">
                                {Array.from({ length: lineCount }, (_, i) => (
                                    <div key={i} className="text-[11px] leading-[20px] text-slate-300 dark:text-slate-700 font-mono">{i + 1}</div>
                                ))}
                            </div>

                            {/* Highlighted overlay */}
                            <pre
                                ref={highlightRef}
                                className="absolute inset-0 py-4 pr-4 font-mono text-[12px] leading-[20px] pointer-events-none overflow-hidden whitespace-pre-wrap break-words"
                                style={{ paddingLeft: `${Math.max(lineCount.toString().length * 8 + 32, 48)}px` }}
                                aria-hidden="true"
                                dangerouslySetInnerHTML={{ __html: highlightedCode }}
                            />

                            {/* Transparent textarea on top for editing */}
                            <textarea
                                ref={textareaRef}
                                value={htmlBody}
                                onChange={(e) => onHtmlChange(e.target.value)}
                                onScroll={handleCodeScroll}
                                className="flex-1 w-full py-4 pr-4 bg-transparent text-transparent font-mono text-[12px] leading-[20px] resize-none focus:outline-none caret-cyan-600 dark:caret-cyan-400 selection:bg-cyan-200/50 dark:selection:bg-cyan-800/40 relative z-10"
                                placeholder="Type or paste your HTML here..."
                                spellCheck={false}
                                autoComplete="off"
                                autoCorrect="off"
                            />
                        </div>
                    )}

                    {/* PREVIEW MODE — Device responsive */}
                    {mode === "preview" && (
                        <div className="h-full flex flex-col bg-white">
                            {/* Gmail-style header */}
                            <div className="px-5 py-3 border-b border-slate-100 shrink-0">
                                <h3 className="text-base font-semibold text-slate-900 mb-1">
                                    {subject || "No subject"}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="px-1.5 py-0.5 bg-cyan-50 text-cyan-600 rounded text-[10px] font-medium">Inbox</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 px-5 py-3 border-b border-slate-100 shrink-0">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">Y</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-slate-900">Your Name</span>
                                        <span className="text-slate-400 text-xs">&lt;you@example.com&gt;</span>
                                    </div>
                                    <div className="text-xs text-slate-400">to <span className="text-slate-500">John Doe</span></div>
                                </div>
                                <span className="text-xs text-slate-400 shrink-0">
                                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                            </div>

                            {/* Responsive preview container */}
                            <div className="flex-1 overflow-auto flex justify-center bg-slate-50/50 p-4">
                                <div
                                    className={`bg-white transition-all duration-300 h-full ${previewDevice !== "desktop" ? "border border-slate-200 rounded-xl shadow-lg" : "w-full"}`}
                                    style={{
                                        maxWidth: PREVIEW_DEVICES.find((d) => d.id === previewDevice)?.width ?? "100%",
                                        width: "100%",
                                    }}
                                >
                                    {/* Device frame indicator */}
                                    {previewDevice !== "desktop" && (
                                        <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 rounded-t-xl flex items-center gap-1.5">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                                            </div>
                                            <div className="flex-1 mx-4 h-4 bg-white rounded border border-slate-200 flex items-center px-2">
                                                <span className="text-[8px] text-slate-300 font-mono truncate">mail.google.com</span>
                                            </div>
                                        </div>
                                    )}
                                    <iframe
                                        srcDoc={`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;background:#fff;color:#111;}a{color:#0891b2;}</style></head><body style="padding:0;margin:0;font-family:Arial,Helvetica,sans-serif;background:#fff;">${getPreviewHtml()}</body></html>`}
                                        className={`w-full h-full border-none ${previewDevice !== "desktop" ? "rounded-b-xl" : ""}`}
                                        style={{ minHeight: 240, background: "#fff" }}
                                        title="Email Preview"
                                        sandbox="allow-same-origin"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Status Bar ──────────────────────────────────────── */}
                <div className="px-3 py-1.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span>{wordCount.toLocaleString()} words</span>
                        <span className="text-slate-200">·</span>
                        <span>{charCount.toLocaleString()} chars</span>
                        {mode === "html" && (
                            <>
                                <span className="text-slate-200">·</span>
                                <span>{lineCount} lines</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* AI Rewrite — prominent bottom placement */}
                        {mode !== "preview" && (
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => { setShowAiMenu(!showAiMenu); setShowVars(false); setShowSnippets(false); }}
                                    disabled={aiRewriting || isEmpty}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${showAiMenu
                                        ? "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 ring-1 ring-violet-200 shadow-sm"
                                        : aiRewriting
                                            ? "bg-violet-50 text-violet-600"
                                            : "bg-gradient-to-r from-violet-50 to-purple-50 text-violet-600 hover:from-violet-100 hover:to-purple-100 hover:shadow-sm"
                                        }`}
                                >
                                    {aiRewriting ? (
                                        <>
                                            <span className="w-3 h-3 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                                            Rewriting...
                                        </>
                                    ) : (
                                        <>✨ AI Rewrite</>
                                    )}
                                </button>
                                {showAiMenu && !aiRewriting && (
                                    <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl p-1.5 z-50 min-w-56 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
                                        <div className="text-[10px] text-slate-400 px-2 py-1 font-semibold uppercase tracking-wider">Rewrite Tone</div>
                                        {AI_TONES.map((t) => (
                                            <button
                                                key={t.id}
                                                className="w-full px-2.5 py-2.5 text-left text-xs text-slate-600 hover:text-slate-900 hover:bg-violet-50 rounded-lg transition-colors flex items-center gap-2.5"
                                                onClick={() => handleAiRewrite(t.id)}
                                            >
                                                <span className="text-sm">{t.icon}</span>
                                                <div>
                                                    <div className="font-medium">{t.label}</div>
                                                    <div className="text-[10px] text-slate-400">{t.desc}</div>
                                                </div>
                                            </button>
                                        ))}
                                        <div className="mt-1 pt-1 border-t border-slate-100 px-2 py-1.5">
                                            <p className="text-[10px] text-slate-400 italic">⚡ Requires AI backend — send setup instructions to backend team</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Gmail size indicator */}
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${isClipped
                            ? "bg-red-50 text-red-600"
                            : isWarning
                                ? "bg-amber-50 text-amber-600"
                                : "bg-emerald-50/50 text-emerald-500"
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isClipped ? "bg-red-400 animate-pulse" : isWarning ? "bg-amber-400" : "bg-emerald-400"
                                }`} />
                            {kbSize} KB
                            {isClipped && <span className="ml-0.5">⚠ Gmail will clip</span>}
                            {isWarning && !isClipped && <span className="ml-0.5">Approaching limit</span>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
