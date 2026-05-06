"use client";

/**
 * /scraper/history — persistent view of every lead the user has ever scraped.
 *
 * Powered by the `scrapedLeads` Convex table, which is populated automatically
 * after every successful search on /scraper. Industry-standard pattern — past
 * results are durable and queryable, not lost on page refresh.
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { useAuthQuery, useAuthMutation } from "../../../hooks/useAuthConvex";

type SortKey = "lastSeenAt" | "firstSeenAt" | "name" | "score" | "state";
type SortDir = "asc" | "desc";
type ImportFilter = "all" | "imported" | "not-imported";

interface HistoryRow {
    _id: Id<"scrapedLeads">;
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    address?: string;
    state?: string;
    website?: string;
    leadScore?: number;
    verified?: boolean;
    industry?: string;
    searchLocation?: string;
    firstSeenAt: number;
    lastSeenAt: number;
    imported?: boolean;
}

function ScraperHistoryPage() {
    const router = useRouter();
    const allLeads = useAuthQuery(api.scrapedLeads.list) as HistoryRow[] | undefined;
    const removeLeads = useAuthMutation(api.scrapedLeads.remove);
    const clearAll = useAuthMutation(api.scrapedLeads.clearAll);
    const createContacts = useAuthMutation(api.contacts.bulkCreate);
    const markImported = useAuthMutation(api.scrapedLeads.markImported);

    // Filter + sort state
    const [search, setSearch] = useState("");
    const [industryFilter, setIndustryFilter] = useState<string>("");
    const [importFilter, setImportFilter] = useState<ImportFilter>("not-imported");
    const [sortKey, setSortKey] = useState<SortKey>("lastSeenAt");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    // Selection
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [busy, setBusy] = useState<null | "importing" | "deleting" | "clearing">(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("desc"); }
    };

    /** Distinct industries for the dropdown filter. */
    const industries = useMemo(() => {
        if (!allLeads) return [];
        return Array.from(
            new Set(allLeads.map((l) => l.industry).filter((i): i is string => !!i))
        ).sort();
    }, [allLeads]);

    const filteredRows = useMemo(() => {
        if (!allLeads) return [];
        let rows = allLeads;
        if (search.trim()) {
            const s = search.trim().toLowerCase();
            rows = rows.filter((l) =>
                [l.name, l.company, l.email, l.address, l.state, l.industry]
                    .some((f) => f && f.toLowerCase().includes(s))
            );
        }
        if (industryFilter) rows = rows.filter((l) => l.industry === industryFilter);
        if (importFilter === "imported") rows = rows.filter((l) => !!l.imported);
        if (importFilter === "not-imported") rows = rows.filter((l) => !l.imported);

        rows = [...rows].sort((a, b) => {
            let cmp = 0;
            if (sortKey === "lastSeenAt") cmp = a.lastSeenAt - b.lastSeenAt;
            else if (sortKey === "firstSeenAt") cmp = a.firstSeenAt - b.firstSeenAt;
            else if (sortKey === "score") cmp = (a.leadScore ?? 0) - (b.leadScore ?? 0);
            else if (sortKey === "name")
                cmp = (a.name || a.company || a.email).localeCompare(b.name || b.company || b.email);
            else if (sortKey === "state") cmp = (a.state || "").localeCompare(b.state || "");
            return sortDir === "asc" ? cmp : -cmp;
        });

        return rows;
    }, [allLeads, search, industryFilter, importFilter, sortKey, sortDir]);

    const allSelected = filteredRows.length > 0 && filteredRows.every((r) => selected.has(r._id));
    const toggleAll = () => {
        if (allSelected) setSelected(new Set());
        else setSelected(new Set(filteredRows.map((r) => r._id)));
    };
    const toggleOne = (id: string) => {
        setSelected((s) => {
            const next = new Set(s);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleBulkImport = async () => {
        if (selected.size === 0 || !allLeads) return;
        setBusy("importing");
        setFeedback(null);
        try {
            const rows = allLeads.filter((l) => selected.has(l._id) && !l.imported);
            const importable = rows.filter((l) => l.email && !l.email.startsWith("unknown@"));
            if (importable.length === 0) {
                setFeedback("No selected leads have a real email address (placeholder emails skipped).");
                return;
            }
            await createContacts({
                contacts: importable.map((l) => ({
                    email: l.email,
                    name: l.name,
                    company: l.company,
                    phone: l.phone,
                    location: l.state,
                    website: l.website,
                    address: l.address,
                })),
            });
            await markImported({ emails: importable.map((l) => l.email) });
            setSelected(new Set());
            setFeedback(`Imported ${importable.length} contact${importable.length === 1 ? "" : "s"}.`);
        } catch (e) {
            setFeedback(e instanceof Error ? e.message : "Import failed.");
        } finally {
            setBusy(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selected.size === 0) return;
        if (!confirm(`Delete ${selected.size} lead${selected.size === 1 ? "" : "s"} from history? They'll be re-scraped on future searches.`)) return;
        setBusy("deleting");
        setFeedback(null);
        try {
            await removeLeads({ ids: Array.from(selected) as Id<"scrapedLeads">[] });
            setSelected(new Set());
            setFeedback("Deleted.");
        } catch (e) {
            setFeedback(e instanceof Error ? e.message : "Delete failed.");
        } finally {
            setBusy(null);
        }
    };

    const handleClearAll = async () => {
        if (!allLeads || allLeads.length === 0) return;
        if (!confirm(`Clear ALL ${allLeads.length} leads from scrape history? This can't be undone.`)) return;
        setBusy("clearing");
        try {
            await clearAll({});
            setSelected(new Set());
            setFeedback("Cleared all history.");
        } catch (e) {
            setFeedback(e instanceof Error ? e.message : "Clear failed.");
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 md:pb-0">
            <AppHeader />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-1">Scrape History</h1>
                        <p className="text-sm text-[#9CA3AF]">
                            Every lead you&apos;ve ever scraped, persistent across sessions. New searches automatically skip leads in this list.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/scraper")}
                        className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:shadow-lg hover:shadow-[#8B5CF6]/25 rounded-xl font-semibold text-sm text-white transition-all flex-shrink-0"
                    >
                        🔍 New Search
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name, email, address…"
                            className="md:col-span-2 px-3 py-2 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-[#0891b2] focus:ring-2 focus:ring-[#0891b2]/20 dark:text-white"
                        />
                        <select
                            value={industryFilter}
                            onChange={(e) => setIndustryFilter(e.target.value)}
                            className="px-3 py-2 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-[#0891b2] dark:text-white"
                        >
                            <option value="">All industries</option>
                            {industries.map((i) => (
                                <option key={i} value={i}>{i}</option>
                            ))}
                        </select>
                        <select
                            value={importFilter}
                            onChange={(e) => setImportFilter(e.target.value as ImportFilter)}
                            className="px-3 py-2 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-[#0891b2] dark:text-white"
                        >
                            <option value="not-imported">Not yet imported</option>
                            <option value="imported">Already imported</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                </div>

                {/* Action bar */}
                {filteredRows.length > 0 && (
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-[#4B5563] dark:text-slate-400">
                            {filteredRows.length} {filteredRows.length === 1 ? "lead" : "leads"}
                            {allLeads && filteredRows.length !== allLeads.length && (
                                <span className="text-[#9CA3AF]"> of {allLeads.length} total</span>
                            )}
                            {selected.size > 0 && <span className="ml-2 text-[#8B5CF6]">· {selected.size} selected</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            {selected.size > 0 && (
                                <>
                                    <button
                                        onClick={handleBulkImport}
                                        disabled={!!busy}
                                        className="px-3 py-1.5 bg-gradient-to-r from-[#10B981] to-[#059669] hover:shadow rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-all"
                                    >
                                        {busy === "importing" ? "Importing…" : `Import ${selected.size}`}
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={!!busy}
                                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-[#EF4444]/40 hover:bg-[#FEF2F2] rounded-lg text-xs font-semibold text-[#DC2626] disabled:opacity-50 transition-all"
                                    >
                                        {busy === "deleting" ? "Deleting…" : `Delete ${selected.size}`}
                                    </button>
                                </>
                            )}
                            {allLeads && allLeads.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    disabled={!!busy}
                                    className="px-3 py-1.5 text-xs font-medium text-[#9CA3AF] hover:text-[#DC2626] transition-colors"
                                >
                                    Clear all history
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {feedback && (
                    <div className="mb-3 p-3 bg-[#ECFDF5] border border-[#10B981]/30 rounded-lg text-sm text-[#047857]">
                        {feedback}
                    </div>
                )}

                {/* Table */}
                {allLeads === undefined ? (
                    <div className="text-center py-16 text-[#9CA3AF]">Loading…</div>
                ) : allLeads.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/10 to-[#A855F7]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-4xl">
                            📭
                        </div>
                        <h2 className="text-xl font-semibold text-[#0f172a] dark:text-white mb-2">No scrape history yet</h2>
                        <p className="text-[#9CA3AF] mb-6">Run your first search to start building a persistent lead library.</p>
                        <button
                            onClick={() => router.push("/scraper")}
                            className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:shadow-lg rounded-xl font-semibold text-sm text-white transition-all"
                        >
                            🔍 Find Leads
                        </button>
                    </div>
                ) : filteredRows.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700">
                        <div className="text-3xl mb-2">🔍</div>
                        <div className="text-[#4B5563] dark:text-slate-400 text-sm">No leads match your filters.</div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="max-h-[640px] overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-[#f8fafc] dark:bg-slate-800/95 backdrop-blur z-10 border-b border-[#E5E7EB] dark:border-slate-700">
                                    <tr>
                                        <th className="w-8 px-3 py-2.5">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleAll}
                                                className="w-4 h-4 rounded text-[#0891b2] focus:ring-[#0891b2]"
                                            />
                                        </th>
                                        <ColHeader label="Business" sortKey="name" current={sortKey} dir={sortDir} onSort={toggleSort} />
                                        <th className="text-left px-3 py-2.5 font-semibold text-[#4B5563] dark:text-slate-300">Email</th>
                                        <th className="text-left px-3 py-2.5 font-semibold text-[#4B5563] dark:text-slate-300">Phone</th>
                                        <ColHeader label="State" sortKey="state" current={sortKey} dir={sortDir} onSort={toggleSort} />
                                        <th className="text-left px-3 py-2.5 font-semibold text-[#4B5563] dark:text-slate-300 w-16">Site</th>
                                        <ColHeader label="Score" sortKey="score" current={sortKey} dir={sortDir} onSort={toggleSort} center />
                                        <th className="text-left px-3 py-2.5 font-semibold text-[#4B5563] dark:text-slate-300">Industry</th>
                                        <ColHeader label="Last seen" sortKey="lastSeenAt" current={sortKey} dir={sortDir} onSort={toggleSort} />
                                        <th className="text-left px-3 py-2.5 font-semibold text-[#4B5563] dark:text-slate-300 w-20">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F1F3F8] dark:divide-slate-800">
                                    {filteredRows.map((row) => {
                                        const checked = selected.has(row._id);
                                        const hasRealEmail = !!row.email && !row.email.startsWith("unknown@");
                                        return (
                                            <tr
                                                key={row._id}
                                                className={`hover:bg-[#f8fafc] dark:hover:bg-slate-800/60 transition-colors ${checked ? "bg-[#0891b2]/5" : ""}`}
                                            >
                                                <td className="px-3 py-2.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleOne(row._id)}
                                                        className="w-4 h-4 rounded text-[#0891b2] focus:ring-[#0891b2]"
                                                    />
                                                </td>
                                                <td className="px-3 py-2.5 max-w-[200px]">
                                                    <div className={`font-medium truncate ${!row.name && !row.company ? "italic text-[#9CA3AF]" : "text-[#0f172a] dark:text-white"}`}>
                                                        {row.name || row.company || "Name not found"}
                                                    </div>
                                                    {row.company && row.name && <div className="text-xs text-[#9CA3AF] truncate">{row.company}</div>}
                                                </td>
                                                <td className="px-3 py-2.5 max-w-[200px]">
                                                    <div className={`truncate text-xs ${hasRealEmail ? "text-[#4B5563] dark:text-slate-300" : "italic text-[#9CA3AF]"}`}>
                                                        {hasRealEmail ? row.email : "no email"}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2.5 text-xs text-[#4B5563] dark:text-slate-300 whitespace-nowrap">
                                                    {row.phone || <span className="text-[#CBD5E1] italic">—</span>}
                                                </td>
                                                <td className="px-3 py-2.5 text-xs text-[#4B5563] dark:text-slate-300">
                                                    {row.state || <span className="text-[#CBD5E1] italic">—</span>}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    {row.website ? (
                                                        <a
                                                            href={row.website.startsWith("http") ? row.website : `https://${row.website}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-[#0891b2] hover:underline whitespace-nowrap"
                                                        >
                                                            ↗ Visit
                                                        </a>
                                                    ) : (
                                                        <span className="text-[#CBD5E1] italic text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    {row.leadScore !== undefined ? (
                                                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                                            row.leadScore >= 7
                                                                ? "bg-[#10B981]/10 text-[#10B981]"
                                                                : row.leadScore >= 4
                                                                    ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                                                                    : "bg-[#EF4444]/10 text-[#EF4444]"
                                                        }`}>
                                                            {row.leadScore}
                                                        </span>
                                                    ) : <span className="text-[#CBD5E1] italic text-xs">—</span>}
                                                </td>
                                                <td className="px-3 py-2.5 text-xs text-[#4B5563] dark:text-slate-300 whitespace-nowrap">
                                                    {row.industry || <span className="text-[#CBD5E1] italic">—</span>}
                                                </td>
                                                <td className="px-3 py-2.5 text-xs text-[#9CA3AF] whitespace-nowrap">
                                                    {relativeTime(row.lastSeenAt)}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <div className="flex items-center gap-1 flex-wrap">
                                                        {row.verified && (
                                                            <span className="px-1.5 py-0.5 bg-[#10B981]/10 text-[#10B981] text-[10px] font-medium rounded">✓</span>
                                                        )}
                                                        {row.imported && (
                                                            <span className="px-1.5 py-0.5 bg-[#0891b2]/10 text-[#0891b2] text-[10px] font-medium rounded">imported</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function ColHeader({
    label,
    sortKey,
    current,
    dir,
    onSort,
    center,
}: {
    label: string;
    sortKey: SortKey;
    current: SortKey;
    dir: SortDir;
    onSort: (k: SortKey) => void;
    center?: boolean;
}) {
    const active = current === sortKey;
    return (
        <th className={`px-3 py-2.5 font-semibold text-[#4B5563] dark:text-slate-300 ${center ? "text-center" : "text-left"}`}>
            <button
                onClick={() => onSort(sortKey)}
                className={`flex items-center gap-1 hover:text-[#0f172a] dark:hover:text-white transition-colors ${active ? "text-[#0f172a] dark:text-white" : ""} ${center ? "mx-auto" : ""}`}
            >
                <span>{label}</span>
                <span className={`text-[10px] ${active ? "opacity-100" : "opacity-30"}`}>
                    {active ? (dir === "asc" ? "▲" : "▼") : "▼"}
                </span>
            </button>
        </th>
    );
}

function relativeTime(ms: number): string {
    const diffMs = Date.now() - ms;
    const min = 60_000;
    const hour = 60 * min;
    const day = 24 * hour;
    if (diffMs < min) return "just now";
    if (diffMs < hour) return `${Math.floor(diffMs / min)}m ago`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
    if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`;
    return new Date(ms).toLocaleDateString();
}

export default function ScraperHistoryPageWrapper() {
    return (
        <AuthGuard>
            <ScraperHistoryPage />
        </AuthGuard>
    );
}
