module.exports = {

"[project]/convex/_generated/api.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
/* eslint-disable */ /**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */ __turbopack_esm__({
    "api": (()=>api),
    "components": (()=>components),
    "internal": (()=>internal)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/convex/dist/esm/server/index.js [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/convex/dist/esm/server/api.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$components$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_import__("[project]/node_modules/convex/dist/esm/server/components/index.js [app-ssr] (ecmascript) <locals>");
;
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["anyApi"];
const internal = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["anyApi"];
const components = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$components$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["componentsGeneric"])();
}}),
"[project]/src/components/EmailEditor.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>EmailEditor)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const VARIABLES = [
    {
        key: "{{firstName}}",
        label: "First Name"
    },
    {
        key: "{{lastName}}",
        label: "Last Name"
    },
    {
        key: "{{email}}",
        label: "Email"
    },
    {
        key: "{{unsubscribeUrl}}",
        label: "Unsubscribe Link"
    }
];
const HTML_SNIPPETS = [
    {
        id: "cta",
        icon: "🔘",
        name: "CTA Button",
        html: `<p style="margin:0 0 16px 0;"><a href="https://example.com" style="display:inline-block;padding:14px 28px;background:#8b5cf6;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">Get Started Now</a></p>`
    },
    {
        id: "divider",
        icon: "➖",
        name: "Divider",
        html: `<hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e5;" />`
    },
    {
        id: "bullets",
        icon: "📋",
        name: "Bullet List",
        html: `<ul style="margin:0 0 16px 20px;padding:0;">
    <li style="margin:0 0 8px 0;">First benefit or point</li>
    <li style="margin:0 0 8px 0;">Second benefit or point</li>
    <li style="margin:0 0 8px 0;">Third benefit or point</li>
</ul>`
    },
    {
        id: "callout",
        icon: "💡",
        name: "Callout Box",
        html: `<div style="margin:0 0 16px 0;padding:16px 20px;background:#f3f4f6;border-left:4px solid #8b5cf6;border-radius:4px;">
    <strong style="display:block;margin-bottom:4px;">Pro Tip:</strong>
    <span style="color:#555;">Your helpful tip or important note goes here.</span>
</div>`
    },
    {
        id: "signature",
        icon: "✍️",
        name: "Signature",
        html: `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e5e5;">
    <p style="margin:0 0 4px 0;font-weight:600;">Your Name</p>
    <p style="margin:0;color:#666;font-size:14px;">Your Title | Your Company</p>
</div>`
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
</p>`
    }
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
function EmailEditor({ htmlBody, onHtmlChange, subject }) {
    const [previewMode, setPreviewMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("desktop");
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("html");
    const [showVariables, setShowVariables] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const textareaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Close dropdowns when clicking outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleClick = ()=>{
            setShowVariables(false);
        };
        document.addEventListener("click", handleClick);
        return ()=>document.removeEventListener("click", handleClick);
    }, []);
    // Insert text at cursor position
    const insertAtCursor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((text)=>{
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = htmlBody.substring(0, start) + text + htmlBody.substring(end);
        onHtmlChange(newValue);
        setTimeout(()=>{
            textarea.selectionStart = textarea.selectionEnd = start + text.length;
            textarea.focus();
        }, 0);
    }, [
        htmlBody,
        onHtmlChange
    ]);
    // Wrap selection with tags
    const wrapSelection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((before, after)=>{
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = htmlBody.substring(start, end);
        const newValue = htmlBody.substring(0, start) + before + selectedText + after + htmlBody.substring(end);
        onHtmlChange(newValue);
        setTimeout(()=>{
            textarea.selectionStart = start + before.length;
            textarea.selectionEnd = start + before.length + selectedText.length;
            textarea.focus();
        }, 0);
    }, [
        htmlBody,
        onHtmlChange
    ]);
    const formatBold = ()=>wrapSelection("<b>", "</b>");
    const formatItalic = ()=>wrapSelection("<i>", "</i>");
    const formatUnderline = ()=>wrapSelection("<u>", "</u>");
    const formatLink = ()=>{
        const url = prompt("Enter URL:");
        if (url) wrapSelection(`<a href="${url}" style="color:#0066cc;text-decoration:underline;">`, "</a>");
    };
    const formatParagraph = ()=>insertAtCursor('\n<p style="margin:0 0 16px 0;">New paragraph</p>');
    const formatList = ()=>insertAtCursor('\n<ul style="margin:0 0 16px 20px;padding:0;">\n    <li style="margin:0 0 6px 0;">Item 1</li>\n    <li style="margin:0 0 6px 0;">Item 2</li>\n</ul>');
    const formatButton = ()=>{
        const url = prompt("Button URL:", "https://");
        const text = prompt("Button text:", "Click Here");
        if (url && text) {
            insertAtCursor(`\n<p style="margin:0 0 16px 0;"><a href="${url}" style="display:inline-block;padding:12px 24px;background:#0066cc;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">${text}</a></p>`);
        }
    };
    // Handle Enter key to insert HTML line breaks
    const handleKeyDown = (e)=>{
        if (e.key === "Enter") {
            e.preventDefault();
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            // Shift+Enter = new paragraph, Enter = line break
            const insertHtml = e.shiftKey ? '\n<p style="margin:0 0 16px 0;"></p>' : '<br>\n';
            const newValue = htmlBody.substring(0, start) + insertHtml + htmlBody.substring(end);
            onHtmlChange(newValue);
            setTimeout(()=>{
                const newPos = start + insertHtml.length;
                textarea.selectionStart = textarea.selectionEnd = newPos;
                textarea.focus();
            }, 0);
        }
    };
    const loadStarterTemplate = ()=>{
        onHtmlChange(STARTER_TEMPLATE);
    };
    const insertSnippet = (html)=>{
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
        setTimeout(()=>{
            textarea.selectionStart = textarea.selectionEnd = start + html.length;
            textarea.focus();
        }, 0);
    };
    // Preview with interpolated variables (sample data)
    const getPreviewHtml = ()=>{
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
        return htmlBody.replace(/\{\{firstName\}\}/g, "John").replace(/\{\{lastName\}\}/g, "Doe").replace(/\{\{email\}\}/g, "john@example.com").replace(/\{\{unsubscribeUrl\}\}/g, "#unsubscribe");
    };
    const isEmpty = !htmlBody.trim();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            gap: 16,
            height: "100%"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            gap: 6,
                            padding: "10px 12px",
                            background: "var(--bg-tertiary)",
                            borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                            border: "1px solid var(--border-subtle)",
                            borderBottom: "none",
                            flexWrap: "wrap",
                            alignItems: "center"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    gap: 2,
                                    padding: 2,
                                    background: "var(--bg-primary)",
                                    borderRadius: 6,
                                    marginRight: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `btn btn-sm ${activeTab === "html" ? "btn-primary" : "btn-ghost"}`,
                                        onClick: ()=>setActiveTab("html"),
                                        style: {
                                            fontSize: 12,
                                            padding: "5px 12px",
                                            borderRadius: 4
                                        },
                                        children: "HTML"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 248,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `btn btn-sm ${activeTab === "visual" ? "btn-primary" : "btn-ghost"}`,
                                        onClick: ()=>setActiveTab("visual"),
                                        style: {
                                            fontSize: 12,
                                            padding: "5px 12px",
                                            borderRadius: 4
                                        },
                                        children: "Visual"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 255,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 240,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: 1,
                                    height: 20,
                                    background: "var(--border-subtle)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 264,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatBold,
                                title: "Bold",
                                style: {
                                    padding: "6px 10px",
                                    fontWeight: 700
                                },
                                children: "B"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 267,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatItalic,
                                title: "Italic",
                                style: {
                                    padding: "6px 10px",
                                    fontStyle: "italic"
                                },
                                children: "I"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 270,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatUnderline,
                                title: "Underline",
                                style: {
                                    padding: "6px 10px",
                                    textDecoration: "underline"
                                },
                                children: "U"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 273,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatLink,
                                title: "Insert Link",
                                style: {
                                    padding: "6px 10px"
                                },
                                children: "🔗"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 276,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatParagraph,
                                title: "Add Paragraph",
                                style: {
                                    padding: "6px 10px"
                                },
                                children: "¶"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 279,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatList,
                                title: "Add List",
                                style: {
                                    padding: "6px 10px"
                                },
                                children: "•••"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 282,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatButton,
                                title: "Add CTA Button",
                                style: {
                                    padding: "6px 10px"
                                },
                                children: "🔘"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 285,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: 1,
                                    height: 20,
                                    background: "var(--border-subtle)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 289,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: "relative"
                                },
                                onClick: (e)=>e.stopPropagation(),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "btn btn-ghost btn-sm",
                                        onClick: ()=>setShowVariables(!showVariables),
                                        style: {
                                            padding: "6px 10px",
                                            fontSize: 12
                                        },
                                        children: [
                                            `{{x}}`,
                                            " ▾"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 293,
                                        columnNumber: 25
                                    }, this),
                                    showVariables && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: "absolute",
                                            top: "calc(100% + 4px)",
                                            left: 0,
                                            background: "var(--bg-secondary)",
                                            border: "1px solid var(--border-subtle)",
                                            borderRadius: 8,
                                            padding: 6,
                                            zIndex: 100,
                                            minWidth: 160,
                                            boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 11,
                                                    color: "var(--text-muted)",
                                                    padding: "4px 8px",
                                                    marginBottom: 4
                                                },
                                                children: "Insert Variable"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 315,
                                                columnNumber: 33
                                            }, this),
                                            VARIABLES.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "btn btn-ghost btn-sm",
                                                    style: {
                                                        width: "100%",
                                                        justifyContent: "flex-start",
                                                        fontSize: 12,
                                                        padding: "6px 8px"
                                                    },
                                                    onClick: ()=>{
                                                        insertAtCursor(v.key);
                                                        setShowVariables(false);
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                            style: {
                                                                marginRight: 8,
                                                                opacity: 0.6
                                                            },
                                                            children: v.key
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/EmailEditor.tsx",
                                                            lineNumber: 328,
                                                            columnNumber: 41
                                                        }, this),
                                                        v.label
                                                    ]
                                                }, v.key, true, {
                                                    fileName: "[project]/src/components/EmailEditor.tsx",
                                                    lineNumber: 319,
                                                    columnNumber: 37
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 301,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 292,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 226,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            background: "var(--bg-primary)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                            padding: 16,
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            overflow: "hidden"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flexShrink: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    color: "var(--text-muted)"
                                                },
                                                children: "Insert Components"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 354,
                                                columnNumber: 29
                                            }, this),
                                            isEmpty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: loadStarterTemplate,
                                                className: "btn btn-ghost btn-sm",
                                                style: {
                                                    padding: "4px 10px",
                                                    fontSize: 11
                                                },
                                                children: "📄 Load Base Template"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 356,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 353,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "grid",
                                            gridTemplateColumns: "repeat(6, 1fr)",
                                            gap: 6
                                        },
                                        children: HTML_SNIPPETS.map((snippet)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>insertSnippet(snippet.html),
                                                style: {
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
                                                    color: "var(--text-secondary)"
                                                },
                                                onMouseOver: (e)=>{
                                                    e.currentTarget.style.borderColor = "var(--accent-primary)";
                                                    e.currentTarget.style.background = "var(--bg-tertiary)";
                                                    e.currentTarget.style.color = "var(--text-primary)";
                                                },
                                                onMouseOut: (e)=>{
                                                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                                                    e.currentTarget.style.background = "var(--bg-secondary)";
                                                    e.currentTarget.style.color = "var(--text-secondary)";
                                                },
                                                title: snippet.name,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: 18
                                                        },
                                                        children: snippet.icon
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                                        lineNumber: 396,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontWeight: 500
                                                        },
                                                        children: snippet.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                                        lineNumber: 397,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, snippet.id, true, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 367,
                                                columnNumber: 33
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 365,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 352,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                ref: textareaRef,
                                className: "form-textarea",
                                value: htmlBody,
                                onChange: (e)=>onHtmlChange(e.target.value),
                                onKeyDown: handleKeyDown,
                                style: {
                                    flex: 1,
                                    fontFamily: "monospace",
                                    fontSize: 13,
                                    lineHeight: 1.6,
                                    resize: "none",
                                    minHeight: 200
                                },
                                placeholder: "Start typing your email content...      Press Enter for line break (<br>)   Press Shift+Enter for new paragraph (<p>)"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 404,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 338,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/EmailEditor.tsx",
                lineNumber: 224,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: previewMode === "mobile" ? 488 : 585,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    overflow: "hidden"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            background: "var(--bg-tertiary)",
                            borderBottom: "1px solid var(--border-subtle)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "var(--text-secondary)"
                                },
                                children: "Gmail Preview"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 448,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    gap: 2,
                                    padding: 2,
                                    background: "var(--bg-primary)",
                                    borderRadius: 6
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `btn btn-sm ${previewMode === "desktop" ? "btn-primary" : "btn-ghost"}`,
                                        onClick: ()=>setPreviewMode("desktop"),
                                        style: {
                                            fontSize: 10,
                                            padding: "3px 8px",
                                            borderRadius: 4
                                        },
                                        children: "🖥️"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 456,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `btn btn-sm ${previewMode === "mobile" ? "btn-primary" : "btn-ghost"}`,
                                        onClick: ()=>setPreviewMode("mobile"),
                                        style: {
                                            fontSize: 10,
                                            padding: "3px 8px",
                                            borderRadius: 4
                                        },
                                        children: "📱"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 463,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 449,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 438,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "8px 16px",
                            background: "var(--bg-tertiary)",
                            borderBottom: "1px solid var(--border-subtle)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    cursor: "pointer",
                                    opacity: 0.5,
                                    fontSize: 14
                                },
                                children: "←"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 482,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    cursor: "pointer",
                                    opacity: 0.5,
                                    fontSize: 12
                                },
                                children: "🗑️"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 483,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    cursor: "pointer",
                                    opacity: 0.5,
                                    fontSize: 12
                                },
                                children: "📁"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 484,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    cursor: "pointer",
                                    opacity: 0.5,
                                    fontSize: 12
                                },
                                children: "⚠️"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 485,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 486,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: 11,
                                    color: "var(--text-muted)"
                                },
                                children: "1 of 1"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 487,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 474,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: "14px 16px 10px",
                            background: "var(--bg-primary)",
                            borderBottom: "1px solid var(--border-subtle)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    margin: 0,
                                    fontSize: 18,
                                    fontWeight: 500,
                                    color: "var(--text-primary)"
                                },
                                children: subject || "No subject"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 496,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 6,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        display: "inline-block",
                                        padding: "2px 8px",
                                        background: "rgba(139, 92, 246, 0.15)",
                                        color: "var(--accent-primary)",
                                        borderRadius: 4,
                                        fontSize: 11,
                                        fontWeight: 500
                                    },
                                    children: "Inbox"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/EmailEditor.tsx",
                                    lineNumber: 510,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 504,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 491,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "14px 16px",
                            background: "var(--bg-primary)",
                            borderBottom: "1px solid var(--border-subtle)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
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
                                    flexShrink: 0
                                },
                                children: "Y"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 532,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    minWidth: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            marginBottom: 2,
                                            flexWrap: "wrap"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: "var(--text-primary)"
                                                },
                                                children: "Your Name"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 551,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 11,
                                                    color: "var(--text-muted)"
                                                },
                                                children: "<you@example.com>"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 554,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 550,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: 11,
                                            color: "var(--text-muted)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4
                                        },
                                        children: [
                                            "to ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: 500,
                                                    color: "var(--text-secondary)"
                                                },
                                                children: "John Doe"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 559,
                                                columnNumber: 32
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 9,
                                                    opacity: 0.5
                                                },
                                                children: "▾"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 560,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 558,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 549,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    flexShrink: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 11,
                                            color: "var(--text-muted)"
                                        },
                                        children: new Date().toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric"
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 566,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            cursor: "pointer",
                                            opacity: 0.4,
                                            fontSize: 12
                                        },
                                        children: "⭐"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 569,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            cursor: "pointer",
                                            opacity: 0.4,
                                            fontSize: 12
                                        },
                                        children: "↩️"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 570,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            cursor: "pointer",
                                            opacity: 0.4
                                        },
                                        children: "⋮"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 571,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 565,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 523,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            background: "var(--bg-primary)",
                            overflow: "auto",
                            minHeight: 220
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                            srcDoc: `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;min-height:100%;background:#1a1a2e;color:#ffffff;}a{color:#a78bfa;}p,div,span,li,td,th,h1,h2,h3,h4,h5,h6{color:#ffffff !important;}</style></head><body style="padding:16px;font-family:Arial,Helvetica,sans-serif;background:#1a1a2e;color:#ffffff;">${getPreviewHtml()}</body></html>`,
                            style: {
                                width: "100%",
                                height: "100%",
                                border: "none",
                                display: "block",
                                minHeight: 220,
                                background: "#1a1a2e"
                            },
                            title: "Email Preview",
                            sandbox: "allow-same-origin"
                        }, void 0, false, {
                            fileName: "[project]/src/components/EmailEditor.tsx",
                            lineNumber: 584,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 576,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: "10px 16px",
                            background: "var(--bg-secondary)",
                            borderTop: "1px solid var(--border-subtle)",
                            display: "flex",
                            gap: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    padding: "8px 14px",
                                    background: "var(--bg-tertiary)",
                                    border: "1px solid var(--border-subtle)",
                                    borderRadius: 20,
                                    color: "var(--text-muted)",
                                    fontSize: 13,
                                    cursor: "text"
                                },
                                children: "Click here to Reply"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 607,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                style: {
                                    borderRadius: 20,
                                    padding: "8px 14px",
                                    fontSize: 12
                                },
                                children: "Forward"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 619,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 600,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/EmailEditor.tsx",
                lineNumber: 427,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/EmailEditor.tsx",
        lineNumber: 222,
        columnNumber: 9
    }, this);
}
}}),
"[project]/src/app/templates/page.tsx [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const e = new Error("Could not parse module '[project]/src/app/templates/page.tsx'");
e.code = 'MODULE_UNPARSEABLE';
throw e;}}),
"[project]/src/app/templates/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules ssr)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: require } = __turbopack_context__;
{
}}),

};

//# sourceMappingURL=_9a7558._.js.map