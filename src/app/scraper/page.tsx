"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";

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
}

function ScraperPage() {
    const [prompt, setPrompt] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<ScrapedContact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
    const [importing, setImporting] = useState(false);
    const [importSuccess, setImportSuccess] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSearchHistory, setShowSearchHistory] = useState(false);

    // For batch assignment
    const batches = useQuery(api.batches.list);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [showNewBatchInput, setShowNewBatchInput] = useState(false);
    const [newBatchName, setNewBatchName] = useState("");
    const createContacts = useMutation(api.contacts.bulkCreate);
    const createBatch = useMutation(api.batches.create);

    // Search history
    const searchHistory = useQuery(api.leadSearches.list);
    const saveSearch = useMutation(api.leadSearches.create);
    const clearSearchHistory = useMutation(api.leadSearches.clearAll);

    // Existing contacts for duplicate detection
    const existingContacts = useQuery(api.contacts.list, {});
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
        <div className="min-h-screen bg-[#0a0a0f] pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            AI Lead Scraper
                        </span>
                    </h1>
                    <p className="text-white/50">
                        Describe the leads you want and AI will find them for you
                    </p>
                </div>

                {/* Search Input */}
                <div className="bg-[#12121f] rounded-xl border border-white/10 p-6 mb-6">
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the leads you're looking for..."
                            className="w-full h-32 px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 resize-none text-lg"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.metaKey) {
                                    handleSearch();
                                }
                            }}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-white/30">
                            ⌘ + Enter to search
                        </div>
                    </div>

                    {/* Example Prompts & History Toggle */}
                    <div className="mt-4 flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="text-xs text-white/40 mb-2">Try these:</div>
                            <div className="flex flex-wrap gap-2">
                                {EXAMPLE_PROMPTS.map((example, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPrompt(example)}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/60 hover:text-white transition-colors"
                                    >
                                        {example}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {searchHistory && searchHistory.length > 0 && (
                            <button
                                onClick={() => setShowSearchHistory(!showSearchHistory)}
                                className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-sm text-indigo-400 transition-colors flex items-center gap-1"
                            >
                                🕐 History ({searchHistory.length})
                            </button>
                        )}
                    </div>

                    {/* Search History Panel */}
                    {showSearchHistory && searchHistory && searchHistory.length > 0 && (
                        <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-white/70">Recent Searches</span>
                                <button
                                    onClick={async () => {
                                        await clearSearchHistory({});
                                        setShowSearchHistory(false);
                                    }}
                                    className="text-xs text-red-400 hover:text-red-300"
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
                                        className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="text-sm truncate">{search.prompt}</div>
                                        <div className="text-xs text-white/40 flex items-center gap-2 mt-1">
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
                        onClick={handleSearch}
                        disabled={!prompt.trim() || isSearching}
                        className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-indigo-500/20"
                    >
                        {isSearching ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Searching with AI...
                            </span>
                        ) : (
                            "🔍 Find Leads"
                        )}
                    </button>
                </div>

                {/* Duplicate Warning */}
                {results.length > 0 && duplicateCount > 0 && (
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>
                            <strong>{duplicateCount}</strong> of {results.length} leads already exist in your contacts.
                            Duplicates are deselected by default.
                        </span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                {/* Success */}
                {importSuccess && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-2">
                        <span>✅</span>
                        Successfully imported {importSuccess} contacts!
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="bg-[#12121f] rounded-xl border border-white/10 overflow-hidden">
                        {/* Results Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={toggleAll}
                                    className="p-1"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedContacts.size === results.length}
                                        onChange={toggleAll}
                                        className="w-4 h-4 rounded bg-white/10 border-white/20 text-indigo-500"
                                    />
                                </button>
                                <span className="font-semibold">
                                    Found {results.length} leads
                                </span>
                                <span className="text-white/50 text-sm">
                                    ({selectedContacts.size} selected)
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
                                            className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-sm w-40"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => {
                                                setShowNewBatchInput(false);
                                                setNewBatchName("");
                                            }}
                                            className="text-white/50 hover:text-white text-sm"
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
                                        className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-sm"
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
                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    📥 Export CSV
                                </button>

                                {/* Import Button */}
                                <button
                                    onClick={handleImport}
                                    disabled={selectedContacts.size === 0 || importing || (showNewBatchInput && !newBatchName.trim())}
                                    className="px-4 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {importing ? "Importing..." : `Import ${selectedContacts.size}`}
                                </button>
                            </div>
                        </div>

                        {/* Results List */}
                        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                            {results.map((contact, i) => (
                                <div
                                    key={i}
                                    onClick={() => toggleContact(i)}
                                    className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors ${selectedContacts.has(i) ? "bg-indigo-500/10" : ""
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedContacts.has(i)}
                                        onChange={() => toggleContact(i)}
                                        className="w-4 h-4 rounded bg-white/10 border-white/20 text-indigo-500"
                                    />
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold flex-shrink-0">
                                        {(contact.name || contact.email).charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium truncate">
                                                {contact.name || contact.email.split("@")[0]}
                                            </span>
                                            {contact.company && (
                                                <span className="text-white/50 text-sm truncate">
                                                    • {contact.company}
                                                </span>
                                            )}
                                            {contact.isDuplicate && (
                                                <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                                    Duplicate
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-white/50 truncate">
                                            {contact.email}
                                        </div>
                                    </div>
                                    {/* Lead Score Badge */}
                                    {contact.leadScore && (
                                        <div className={`px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${contact.leadScore >= 80 ? 'bg-green-500/20 text-green-400' :
                                                contact.leadScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            {contact.leadScore}
                                        </div>
                                    )}
                                    <div className="text-right text-sm text-white/40 hidden md:block flex-shrink-0">
                                        {contact.phone && <div>{contact.phone}</div>}
                                        {contact.location && <div>{contact.location}</div>}
                                        {contact.website && (
                                            <a
                                                href={contact.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-indigo-400 hover:text-indigo-300 truncate block max-w-[200px]"
                                            >
                                                🌐 Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isSearching && results.length === 0 && !importSuccess && (
                    <div className="text-center py-12 text-white/30">
                        <div className="text-6xl mb-4">🤖</div>
                        <p>Enter a prompt above to start finding leads</p>
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
