"use client";

import { useMemo } from "react";

interface BlogArticleContentProps {
    content: string;
}

/* ─── Minimal Markdown-to-JSX renderer ─── */
export default function BlogArticleContent({ content }: BlogArticleContentProps) {
    const html = useMemo(() => renderMarkdown(content), [content]);

    return (
        <div
            className="prose-emailer"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function renderMarkdown(md: string): string {
    let html = md;

    // Code blocks (fenced) — must come before inline code
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
        return `<pre class="code-block"><code class="language-${lang || "text"}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Tables
    html = html.replace(/^(\|.+\|)\n(\|[\s:|-]+\|)\n((?:\|.+\|\n?)*)/gm, (_match, headerRow, _sep, bodyRows) => {
        const headers = headerRow.split("|").filter((c: string) => c.trim()).map((c: string) => `<th>${c.trim()}</th>`).join("");
        const rows = bodyRows.trim().split("\n").map((row: string) => {
            const cells = row.split("|").filter((c: string) => c.trim()).map((c: string) => `<td>${renderInline(c.trim())}</td>`).join("");
            return `<tr>${cells}</tr>`;
        }).join("");
        return `<div class="table-wrap"><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
    });

    // Horizontal Rule
    html = html.replace(/^---+$/gm, '<hr class="my-10 border-slate-200" />');

    // Headings (## and ###)
    html = html.replace(/^### (.+)$/gm, '<h3 class="article-h3">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="article-h2">$1</h2>');

    // Unordered lists
    html = html.replace(/^- \[ \] (.+)$/gm, '<li class="checklist-item unchecked"><span class="checkbox">☐</span> $1</li>');
    html = html.replace(/^- \[x\] (.+)$/gm, '<li class="checklist-item checked"><span class="checkbox">☑</span> $1</li>');
    html = html.replace(/((?:^- .+\n?)+)/gm, (match) => {
        if (match.includes('checklist-item')) return match;
        const items = match.trim().split("\n").map(line => {
            const text = line.replace(/^- /, "");
            return `<li>${renderInline(text)}</li>`;
        }).join("");
        return `<ul>${items}</ul>`;
    });

    // Ordered lists
    html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
        const items = match.trim().split("\n").map(line => {
            const text = line.replace(/^\d+\. /, "");
            return `<li>${renderInline(text)}</li>`;
        }).join("");
        return `<ol>${items}</ol>`;
    });

    // Numbered list items with bullet syntax
    html = html.replace(/^• (.+)$/gm, '<li>$1</li>');

    // Blockquotes (multi-line)
    html = html.replace(/((?:^> .+\n?)+)/gm, (match) => {
        const inner = match.split("\n").map(line => line.replace(/^> ?/, "")).join("\n");
        return `<blockquote class="article-blockquote">${renderParagraphs(inner)}</blockquote>`;
    });

    // Paragraphs (runs of non-empty, non-HTML lines)
    html = renderParagraphs(html);

    return html;
}

function renderParagraphs(html: string): string {
    const lines = html.split("\n\n");
    return lines.map(block => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("<")) return trimmed;
        return `<p>${renderInline(trimmed.replace(/\n/g, " "))}</p>`;
    }).join("\n\n");
}

function renderInline(text: string): string {
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="article-link">$1</a>');
    return text;
}

function escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
