"use client";

import { useState } from "react";
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
}

function ScraperPage() {
    const [prompt, setPrompt] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<ScrapedContact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
    const [importing, setImporting] = useState(false);
    const [importSuccess, setImportSuccess] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // For batch assignment
    const batches = useQuery(api.batches.list);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const createContacts = useMutation(api.contacts.bulkCreate);

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

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to scrape leads");
            }

            const data = await response.json();
            setResults(data.contacts || []);

            // Auto-select all results
            setSelectedContacts(new Set(data.contacts.map((_: ScrapedContact, i: number) => i)));
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
            const contactsToImport = results
                .filter((_, i) => selectedContacts.has(i))
                .map(c => ({
                    email: c.email,
                    name: c.name,
                    company: c.company,
                    phone: c.phone,
                    location: c.location,
                }));

            await createContacts({
                contacts: contactsToImport,
                batchId: selectedBatchId ? selectedBatchId as Id<"batches"> : undefined,
            });

            setImportSuccess(contactsToImport.length);
            setResults([]);
            setSelectedContacts(new Set());
            setPrompt("");
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

                    {/* Example Prompts */}
                    <div className="mt-4">
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
                                <select
                                    value={selectedBatchId}
                                    onChange={(e) => setSelectedBatchId(e.target.value)}
                                    className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-sm"
                                >
                                    <option value="">No batch</option>
                                    {batches?.map((batch) => (
                                        <option key={batch._id} value={batch._id}>
                                            {batch.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Import Button */}
                                <button
                                    onClick={handleImport}
                                    disabled={selectedContacts.size === 0 || importing}
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
                                        </div>
                                        <div className="text-sm text-white/50 truncate">
                                            {contact.email}
                                        </div>
                                    </div>
                                    <div className="text-right text-sm text-white/40 hidden md:block">
                                        {contact.phone && <div>{contact.phone}</div>}
                                        {contact.location && <div>{contact.location}</div>}
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
