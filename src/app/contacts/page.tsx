"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { Id } from "@/../convex/_generated/dataModel";

function ContactsContent() {
    const contacts = useQuery(api.contacts.list, {});
    const batches = useQuery(api.batches.list);
    const createContact = useMutation(api.contacts.create);
    const deleteContact = useMutation(api.contacts.remove);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBatch, setSelectedBatch] = useState<string>("all");
    const [showAdd, setShowAdd] = useState(false);
    const [newContact, setNewContact] = useState({ email: "", name: "", company: "" });
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

    const filteredContacts = contacts?.filter(c => {
        const matchesBatch = selectedBatch === "all" || c.batchId === selectedBatch;
        const matchesSearch = !searchQuery ||
            c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.company?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBatch && matchesSearch;
    });

    const handleAddContact = async () => {
        if (!newContact.email.trim()) return;
        await createContact({
            email: newContact.email,
            name: newContact.name || undefined,
            company: newContact.company || undefined,
        });
        setNewContact({ email: "", name: "", company: "" });
        setShowAdd(false);
    };

    const toggleContact = (id: string) => {
        const newSet = new Set(selectedContacts);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedContacts(newSet);
    };

    const selectAll = () => {
        if (selectedContacts.size === filteredContacts?.length) {
            setSelectedContacts(new Set());
        } else {
            setSelectedContacts(new Set(filteredContacts?.map(c => c._id)));
        }
    };

    const companiesCount = new Set(contacts?.map(c => c.company).filter(Boolean)).size;
    const listsCount = batches?.length ?? 0;

    return (
        <div className="min-h-screen bg-[#0a0a0f] pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Hero Section */}
                <div className="relative mb-8 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 via-teal-600/20 to-cyan-600/30" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.3),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.2),transparent_50%)]" />

                    <div className="relative p-8 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/25">
                                    👥
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Contacts</h1>
                                    <p className="text-white/60">Manage your email recipients</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="group px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-medium hover:bg-white/20 hover:border-white/30 transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/10"
                        >
                            <span className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">+</span>
                                Add Contact
                            </span>
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Contacts", value: contacts?.length ?? 0, icon: "👥", color: "emerald" },
                        { label: "Companies", value: companiesCount, icon: "🏢", color: "blue" },
                        { label: "Contact Lists", value: listsCount, icon: "📋", color: "purple" },
                        { label: "Selected", value: selectedContacts.size, icon: "✓", color: "amber" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="group p-4 bg-[#12121f] rounded-xl border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className="text-xl font-bold">{stat.value}</div>
                                    <div className="text-xs text-white/50">{stat.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-[#12121f] rounded-xl border border-white/10 p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[250px] relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</div>
                            <input
                                type="text"
                                placeholder="Search by email, name, or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-emerald-500/50 focus:outline-none transition-colors"
                            />
                        </div>

                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-emerald-500/50 focus:outline-none transition-colors appearance-none cursor-pointer min-w-[150px]"
                        >
                            <option value="all">All Lists</option>
                            {batches?.map(b => (
                                <option key={b._id} value={b._id}>{b.name}</option>
                            ))}
                        </select>

                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === "list" ? "bg-emerald-500/20 text-emerald-400" : "text-white/50 hover:text-white"}`}
                            >
                                ≡ List
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === "grid" ? "bg-emerald-500/20 text-emerald-400" : "text-white/50 hover:text-white"}`}
                            >
                                ⊞ Grid
                            </button>
                        </div>

                        <button
                            onClick={() => setShowAdd(!showAdd)}
                            className={`px-4 py-3 rounded-xl font-medium transition-all ${showAdd
                                ? "bg-white/10 text-white/60"
                                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25"
                                }`}
                        >
                            {showAdd ? "Cancel" : "+ Add"}
                        </button>
                    </div>

                    {showAdd && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="grid md:grid-cols-4 gap-3">
                                <input
                                    type="email"
                                    placeholder="Email address *"
                                    value={newContact.email}
                                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                    className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-emerald-500/50 focus:outline-none transition-colors"
                                    autoFocus
                                />
                                <input
                                    type="text"
                                    placeholder="Name (optional)"
                                    value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-emerald-500/50 focus:outline-none transition-colors"
                                />
                                <input
                                    type="text"
                                    placeholder="Company (optional)"
                                    value={newContact.company}
                                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                                    className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-emerald-500/50 focus:outline-none transition-colors"
                                />
                                <button
                                    onClick={handleAddContact}
                                    disabled={!newContact.email.trim()}
                                    className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                                >
                                    ✓ Save Contact
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contacts Display */}
                {contacts === undefined ? (
                    <div className="flex justify-center py-16">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">👥</div>
                        </div>
                    </div>
                ) : filteredContacts?.length === 0 ? (
                    <div className="relative overflow-hidden text-center py-20 bg-gradient-to-br from-[#12121f] to-[#1a1a2f] rounded-2xl border border-white/10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />

                        <div className="relative">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center text-4xl">
                                {searchQuery ? "🔍" : "👥"}
                            </div>
                            <h2 className="text-2xl font-bold mb-2">
                                {searchQuery ? `No results for "${searchQuery}"` : "No Contacts Yet"}
                            </h2>
                            <p className="text-white/50 mb-6 max-w-md mx-auto">
                                {searchQuery
                                    ? "Try adjusting your search or filters"
                                    : "Add contacts manually or use the Lead Finder to discover new leads"
                                }
                            </p>
                            {!searchQuery && (
                                <div className="flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => setShowAdd(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transition-all"
                                    >
                                        + Add Contact
                                    </button>
                                    <a
                                        href="/scraper"
                                        className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-all"
                                    >
                                        🔎 Lead Finder
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredContacts?.slice(0, 100).map((contact) => {
                            const batch = batches?.find(b => b._id === contact.batchId);
                            const isSelected = selectedContacts.has(contact._id);
                            return (
                                <div
                                    key={contact._id}
                                    onClick={() => toggleContact(contact._id)}
                                    className={`group relative p-4 bg-gradient-to-br from-[#12121f] to-[#16162a] rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${isSelected
                                            ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                                            : "border-white/10 hover:border-white/20"
                                        }`}
                                >
                                    <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/30"
                                        }`}>
                                        {isSelected && "✓"}
                                    </div>

                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold mb-3 ${isSelected
                                            ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                                            : "bg-white/10 text-white/60"
                                        }`}>
                                        {contact.name?.charAt(0).toUpperCase() || contact.email.charAt(0).toUpperCase()}
                                    </div>

                                    <h3 className="font-medium truncate">{contact.name || contact.email.split('@')[0]}</h3>
                                    <p className="text-sm text-white/50 truncate">{contact.email}</p>
                                    {contact.company && (
                                        <p className="text-xs text-white/40 truncate mt-1">🏢 {contact.company}</p>
                                    )}

                                    {batch && (
                                        <div className="mt-3 inline-block px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                            {batch.name}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-[#12121f] rounded-xl border border-white/10 overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs uppercase tracking-wider text-white/40 border-b border-white/10 bg-black/20">
                            <div className="col-span-1 flex items-center">
                                <button
                                    onClick={selectAll}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedContacts.size === filteredContacts?.length && filteredContacts.length > 0
                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                            : "border-white/30 hover:border-white/50"
                                        }`}
                                >
                                    {selectedContacts.size === filteredContacts?.length && filteredContacts.length > 0 && "✓"}
                                </button>
                            </div>
                            <div className="col-span-4">Email</div>
                            <div className="col-span-2">Name</div>
                            <div className="col-span-2">Company</div>
                            <div className="col-span-2">List</div>
                            <div className="col-span-1">Actions</div>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto">
                            {filteredContacts?.slice(0, 100).map((contact) => {
                                const batch = batches?.find(b => b._id === contact.batchId);
                                const isSelected = selectedContacts.has(contact._id);
                                return (
                                    <div
                                        key={contact._id}
                                        className={`grid grid-cols-12 gap-4 items-center px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-all ${isSelected ? "bg-emerald-500/5" : ""
                                            }`}
                                    >
                                        <div className="col-span-1">
                                            <button
                                                onClick={() => toggleContact(contact._id)}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected
                                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                                        : "border-white/30 hover:border-white/50"
                                                    }`}
                                            >
                                                {isSelected && "✓"}
                                            </button>
                                        </div>
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isSelected
                                                    ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                                                    : "bg-white/10 text-white/60"
                                                }`}>
                                                {contact.name?.charAt(0).toUpperCase() || contact.email.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium truncate">{contact.email}</span>
                                        </div>
                                        <div className="col-span-2 text-white/60 truncate">{contact.name || "—"}</div>
                                        <div className="col-span-2 text-white/60 truncate">{contact.company || "—"}</div>
                                        <div className="col-span-2">
                                            {batch ? (
                                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                                    {batch.name}
                                                </span>
                                            ) : (
                                                <span className="text-white/30 text-sm">—</span>
                                            )}
                                        </div>
                                        <div className="col-span-1">
                                            <button
                                                onClick={() => deleteContact({ id: contact._id as Id<"contacts"> })}
                                                className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {(filteredContacts?.length ?? 0) > 0 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-black/20">
                                <div className="text-sm text-white/50">
                                    {selectedContacts.size > 0 && (
                                        <span className="text-emerald-400">{selectedContacts.size} selected • </span>
                                    )}
                                    Showing {Math.min(100, filteredContacts?.length ?? 0)} of {filteredContacts?.length} contacts
                                </div>
                                {selectedContacts.size > 0 && (
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 bg-white/10 text-white/60 rounded-lg text-sm hover:bg-white/20 transition-all">
                                            Export Selected
                                        </button>
                                        <button className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-all">
                                            Delete Selected
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ContactsPage() {
    return (
        <AuthGuard>
            <ContactsContent />
        </AuthGuard>
    );
}
