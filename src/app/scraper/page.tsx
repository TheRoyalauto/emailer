"use client";

import { useState, useMemo } from "react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import LeadSearchAnimation from "@/components/LeadSearchAnimation";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";

const EXAMPLE_PROMPTS = [
    "Find me 20 auto body shops in Los Angeles, California",
    "Get contact emails for collision repair centers in Miami",
    "Search for insurance adjusters in the Houston area",
    "Find body shop owners in Chicago with their phone numbers",
];

interface ScrapedContact {
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    address?: string;
    leadScore?: number;
    isDuplicate?: boolean;
    verified?: boolean;
}

// Track data source
type DataSource = 'real_scraper' | 'ai_generated' | 'unknown';

function ScraperPage() {
    const [prompt, setPrompt] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<ScrapedContact[]>([]);
    const [dataSource, setDataSource] = useState<DataSource>('unknown');
    const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
    const [importing, setImporting] = useState(false);
    const [importSuccess, setImportSuccess] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSearchHistory, setShowSearchHistory] = useState(false);

    // For batch assignment
    const batches = useAuthQuery(api.batches.list);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [showNewBatchInput, setShowNewBatchInput] = useState(false);
    const [newBatchName, setNewBatchName] = useState("");
    const createContacts = useAuthMutation(api.contacts.bulkCreate);
    const createBatch = useAuthMutation(api.batches.create);

    // Search history
    const searchHistory = useAuthQuery(api.leadSearches.list);
    const saveSearch = useAuthMutation(api.leadSearches.create);
    const clearSearchHistory = useAuthMutation(api.leadSearches.clearAll);

    // Existing contacts for duplicate detection
    const existingContacts = useAuthQuery(api.contacts.list, {});
    const existingEmails = useMemo(() => {
        return new Set(existingContacts?.map(c => c.email.toLowerCase()) || []);
    }, [existingContacts]);

    // Check for duplicates in results
    const duplicateCount = useMemo(() => {
        return results.filter(r => existingEmails.has(r.email.toLowerCase())).length;
    }, [results, existingEmails]);

    const handleSearch = async () => {
        if (!prompt.trim()) return;
        setIsSearching(true);
        setError(null);
        setResults([]);
        setImportSuccess(null);

        try {
            // Call AI endpoint for lead generation
            const response = await fetch("/api/scrape-leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            // Check if response is JSON before parsing
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Lead generation service unavailable. Please check API configuration.");
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to scrape leads");
            }

            // Track source
            setDataSource(data.source || 'unknown');

            // Mark duplicates in results
            const contactsWithDuplicates = (data.contacts || []).map((c: ScrapedContact) => ({
                ...c,
                isDuplicate: existingEmails.has(c.email.toLowerCase()),
            }));

            setResults(contactsWithDuplicates);

            // Auto-select non-duplicates only
            const nonDuplicateIndices = contactsWithDuplicates
                .map((c: ScrapedContact, i: number) => c.isDuplicate ? -1 : i)
                .filter((i: number) => i >= 0);
            setSelectedContacts(new Set(nonDuplicateIndices));

            // Save search to history
            if (data.contacts?.length > 0) {
                await saveSearch({
                    prompt: prompt.trim(),
                    resultsCount: data.contacts.length,
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to scrape leads");
        } finally {
            setIsSearching(false);
        }
    };

    const toggleContact = (index: number) => {
        const newSelected = new Set(selectedContacts);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedContacts(newSelected);
    };

    const toggleAll = () => {
        if (selectedContacts.size === results.length) {
            setSelectedContacts(new Set());
        } else {
            setSelectedContacts(new Set(results.map((_, i) => i)));
        }
    };

    const handleImport = async () => {
        if (selectedContacts.size === 0) return;
        setImporting(true);
        setError(null);

        try {
            // Create new batch if needed
            let batchId: Id<"batches"> | undefined = undefined;
            if (showNewBatchInput && newBatchName.trim()) {
                batchId = await createBatch({ name: newBatchName.trim() });
            } else if (selectedBatchId) {
                batchId = selectedBatchId as Id<"batches">;
            }

            const contactsToImport = results
                .filter((_, i) => selectedContacts.has(i))
                .map(c => ({
                    email: c.email,
                    name: c.name,
                    company: c.company,
                    phone: c.phone,
                    location: c.location,
                    website: c.website,
                    address: c.address,
                }));

            await createContacts({
                contacts: contactsToImport,
                batchId,
            });

            setImportSuccess(contactsToImport.length);
            setResults([]);
            setSelectedContacts(new Set());
            setPrompt("");
            setNewBatchName("");
            setShowNewBatchInput(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to import contacts");
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 md:pb-0">
            {/* Robot Animation Overlay */}
            <LeadSearchAnimation isActive={isSearching} prompt={prompt} />

            <AppHeader />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] mb-4 shadow-lg shadow-[#8B5CF6]/25">
                        <span className="text-3xl">🤖</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[#0f172a] dark:text-white mb-2">
                        AI Lead Scraper
                    </h1>
                    <p className="text-[#9CA3AF]">
                        Describe the leads you want and AI will find them for you
                    </p>
                </div>

                {/* Search Input */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm p-6 mb-6">
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the leads you're looking for..."
                            className="w-full h-32 px-4 py-3 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0891b2] focus:ring-2 focus:ring-[#0891b2]/20 resize-none text-lg text-[#0f172a] dark:text-white placeholder:text-[#9CA3AF] transition-all"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.metaKey) {
                                    handleSearch();
                                }
                            }}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-[#9CA3AF]">
                            ⌘ + Enter to search
                        </div>
                    </div>

                    {/* Example Prompts & History Toggle */}
                    <div className="mt-4 flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="text-xs text-[#9CA3AF] mb-2 font-medium">Try these:</div>
                            <div className="flex flex-wrap gap-2">
                                {EXAMPLE_PROMPTS.map((example, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPrompt(example)}
                                        className="px-3 py-1.5 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 hover:bg-[#F1F3F8] dark:hover:bg-slate-700 hover:border-[#0891b2]/30 rounded-lg text-sm text-[#4B5563] dark:text-slate-300 hover:text-[#0f172a] dark:hover:text-white transition-all"
                                    >
                                        {example}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {searchHistory && searchHistory.length > 0 && (
                            <button
                                onClick={() => setShowSearchHistory(!showSearchHistory)}
                                className="px-3 py-1.5 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 rounded-lg text-sm text-[#8B5CF6] font-medium transition-colors flex items-center gap-1"
                            >
                                🕐 History ({searchHistory.length})
                            </button>
                        )}
                    </div>

                    {/* Search History Panel */}
                    {showSearchHistory && searchHistory && searchHistory.length > 0 && (
                        <div className="mt-4 p-4 bg-[#f8fafc] dark:bg-slate-800 rounded-xl border border-[#E5E7EB] dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-[#0f172a] dark:text-white">Recent Searches</span>
                                <button
                                    onClick={async () => {
                                        await clearSearchHistory({});
                                        setShowSearchHistory(false);
                                    }}
                                    className="text-xs text-[#EF4444] hover:text-[#DC2626] font-medium"
                                >
                                    Clear All
                                </button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {searchHistory.map((search) => (
                                    <button
                                        key={search._id}
                                        onClick={() => {
                                            setPrompt(search.prompt);
                                            setShowSearchHistory(false);
                                        }}
                                        className="w-full text-left p-3 rounded-lg bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 hover:border-[#0891b2]/30 hover:shadow-sm transition-all"
                                    >
                                        <div className="text-sm font-medium text-[#0f172a] dark:text-white truncate">{search.prompt}</div>
                                        <div className="text-xs text-[#9CA3AF] flex items-center gap-2 mt-1">
                                            <span>{search.resultsCount} leads found</span>
                                            <span>•</span>
                                            <span>{new Date(search.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Button */}
                    <button
                        disabled
                        className="mt-4 w-full py-3.5 bg-gradient-to-r from-[#9CA3AF] to-[#6B7280] rounded-xl font-semibold text-lg text-white opacity-75 cursor-not-allowed transition-all"
                    >
                        🚀 Coming Soon
                    </button>
                </div>

                {/* Duplicate Warning */}
                {results.length > 0 && duplicateCount > 0 && (
                    <div className="mb-6 p-4 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-xl text-[#92400E] flex items-center gap-2">
                        <span>⚠️</span>
                        <span>
                            <strong>{duplicateCount}</strong> of {results.length} leads already exist in your contacts.
                            Duplicates are deselected by default.
                        </span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#EF4444]/30 rounded-xl text-[#DC2626] flex items-center gap-2">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                {/* Success */}
                {importSuccess && (
                    <div className="mb-6 p-4 bg-[#ECFDF5] border border-[#10B981]/30 rounded-xl text-[#047857] flex items-center gap-2">
                        <span>✅</span>
                        Successfully imported {importSuccess} contacts!
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm overflow-hidden">
                        {/* Results Header */}
                        <div className="p-4 border-b border-[#E5E7EB] dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={toggleAll}
                                    className="p-1"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedContacts.size === results.length}
                                        onChange={toggleAll}
                                        className="w-4 h-4 rounded bg-[#F1F3F8] border-[#E5E7EB] text-[#0891b2] focus:ring-[#0891b2]"
                                    />
                                </button>
                                <span className="font-semibold text-[#0f172a] dark:text-white">
                                    Found {results.length} leads
                                </span>
                                <span className="text-[#9CA3AF] text-sm">
                                    ({selectedContacts.size} selected)
                                </span>
                                {/* Source Badge */}
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${dataSource === 'real_scraper'
                                    ? 'bg-[#10B981]/10 text-[#10B981]'
                                    : dataSource === 'ai_generated'
                                        ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                                        : 'bg-[#9CA3AF]/10 text-[#9CA3AF]'}`}>
                                    {dataSource === 'real_scraper' ? '✓ Real Data' : dataSource === 'ai_generated' ? '⚡ AI Generated' : 'Unknown'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Batch Selector */}
                                {showNewBatchInput ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newBatchName}
                                            onChange={(e) => setNewBatchName(e.target.value)}
                                            placeholder="New batch name..."
                                            className="px-3 py-1.5 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-sm w-40 focus:border-[#0891b2] focus:outline-none dark:text-white"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => {
                                                setShowNewBatchInput(false);
                                                setNewBatchName("");
                                            }}
                                            className="text-[#9CA3AF] hover:text-[#0f172a] text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <select
                                        value={selectedBatchId}
                                        onChange={(e) => {
                                            if (e.target.value === "__new__") {
                                                setShowNewBatchInput(true);
                                                setSelectedBatchId("");
                                            } else {
                                                setSelectedBatchId(e.target.value);
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-sm text-[#0f172a] dark:text-white focus:border-[#0891b2] focus:outline-none"
                                    >
                                        <option value="">No batch</option>
                                        <option value="__new__">➕ Create New Batch</option>
                                        {batches?.map((batch) => (
                                            <option key={batch._id} value={batch._id}>
                                                {batch.name}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {/* Export CSV Button */}
                                <button
                                    onClick={() => {
                                        const csv = [
                                            ["Name", "Email", "Company", "Phone", "Location", "Website", "Address"].join(","),
                                            ...results.filter((_, i) => selectedContacts.has(i)).map(c =>
                                                [c.name, c.email, c.company, c.phone, c.location, c.website, c.address]
                                                    .map(v => `"${(v || "").replace(/"/g, '""')}"`)
                                                    .join(",")
                                            )
                                        ].join("\n");
                                        const blob = new Blob([csv], { type: "text/csv" });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
                                        a.click();
                                    }}
                                    disabled={selectedContacts.size === 0}
                                    className="px-3 py-1.5 bg-[#F1F3F8] dark:bg-slate-800 hover:bg-[#E5E7EB] dark:hover:bg-slate-700 border border-[#E5E7EB] dark:border-slate-700 rounded-lg font-medium text-sm text-[#4B5563] dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    📥 Export CSV
                                </button>

                                {/* Import Button */}
                                <button
                                    onClick={handleImport}
                                    disabled={selectedContacts.size === 0 || importing || (showNewBatchInput && !newBatchName.trim())}
                                    className="px-4 py-1.5 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-lg font-semibold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#10B981]/25"
                                >
                                    {importing ? "Importing..." : `Import ${selectedContacts.size}`}
                                </button>
                            </div>
                        </div>

                        {/* Results List */}
                        <div className="divide-y divide-[#F1F3F8] dark:divide-slate-800 max-h-[400px] overflow-y-auto">
                            {results.map((contact, i) => (
                                <div
                                    key={i}
                                    onClick={() => toggleContact(i)}
                                    className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-[#f8fafc] dark:hover:bg-slate-800 transition-colors ${selectedContacts.has(i) ? "bg-[#0891b2]/5" : ""
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedContacts.has(i)}
                                        onChange={() => toggleContact(i)}
                                        className="w-4 h-4 rounded bg-[#F1F3F8] border-[#E5E7EB] text-[#0891b2] focus:ring-[#0891b2]"
                                    />
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${selectedContacts.has(i)
                                        ? "bg-gradient-to-br from-[#0891b2] to-[#0284c7] text-white"
                                        : "bg-[#F1F3F8] dark:bg-slate-800 text-[#4B5563] dark:text-slate-400"
                                        }`}>
                                        {(contact.name || contact.email).charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium truncate ${!contact.name ? 'italic text-[#9CA3AF]' : 'text-[#0f172a] dark:text-white'}`}>
                                                {contact.name || 'Name not found'}
                                            </span>
                                            <span className={`text-sm truncate ${contact.company ? 'text-[#9CA3AF]' : 'text-[#E5E7EB] italic'}`}>
                                                • {contact.company || 'Company not found'}
                                            </span>
                                            {contact.verified && (
                                                <span className="px-1 py-0.5 bg-[#10B981]/10 text-[#10B981] text-xs rounded font-medium">✓</span>
                                            )}
                                            {contact.isDuplicate && (
                                                <span className="px-1.5 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] text-xs rounded font-medium">
                                                    Duplicate
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-[#9CA3AF] truncate">
                                            {contact.email}
                                        </div>
                                    </div>
                                    {/* Lead Score Badge */}
                                    {contact.leadScore && (
                                        <div className={`px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${contact.leadScore >= 80 ? 'bg-[#10B981]/10 text-[#10B981]' :
                                            contact.leadScore >= 60 ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                                                'bg-[#EF4444]/10 text-[#EF4444]'
                                            }`}>
                                            {contact.leadScore}
                                        </div>
                                    )}
                                    <div className="text-right text-sm hidden md:block flex-shrink-0 min-w-[150px]">
                                        <div className={contact.phone ? 'text-[#9CA3AF]' : 'text-[#E5E7EB] italic text-xs'}>📞 {contact.phone || 'No phone'}</div>
                                        <div className={contact.location ? 'text-[#9CA3AF]' : 'text-[#E5E7EB] italic text-xs'}>📍 {contact.location || 'No location'}</div>
                                        {contact.website ? (
                                            <a
                                                href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-[#0891b2] hover:text-[#0284c7] truncate block max-w-[200px]"
                                            >
                                                🌐 Website
                                            </a>
                                        ) : (
                                            <div className="text-[#E5E7EB] italic text-xs">🌐 No website</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isSearching && results.length === 0 && !importSuccess && (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/10 to-[#A855F7]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-4xl">
                            🤖
                        </div>
                        <h2 className="text-xl font-semibold text-[#0f172a] dark:text-white mb-2">Ready to Find Leads</h2>
                        <p className="text-[#9CA3AF]">Enter a prompt above to start finding leads</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ScraperPageWrapper() {
    return (
        <AuthGuard>
            <ScraperPage />
        </AuthGuard>
    );
}
