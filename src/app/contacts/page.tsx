"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { Id } from "@/../convex/_generated/dataModel";

const SALES_STAGES = [
    { id: "new", label: "New", color: "#9CA3AF", icon: "🆕" },
    { id: "contacted", label: "Contacted", color: "#0EA5E9", icon: "📧" },
    { id: "follow_up", label: "Follow-up", color: "#F59E0B", icon: "🔄" },
    { id: "qualified", label: "Qualified", color: "#8B5CF6", icon: "⭐" },
    { id: "closed_won", label: "Closed Won", color: "#10B981", icon: "✅" },
    { id: "closed_lost", label: "Closed Lost", color: "#EF4444", icon: "❌" },
];

interface Contact {
    _id: Id<"contacts">;
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    address?: string;
    status?: string;
    salesStage?: string;
    batchId?: Id<"batches">;
    lastEmailAt?: number;
    lastCallAt?: number;
    emailCount?: number;
    callCount?: number;
    tags?: string[];
}

function ContactsContent() {
    const contacts = useQuery(api.contacts.list, {});
    const batches = useQuery(api.batches.list);
    const createContact = useMutation(api.contacts.create);
    const updateContact = useMutation(api.contacts.update);
    const deleteContact = useMutation(api.contacts.remove);
    const updateSalesStage = useMutation(api.activities.updateSalesStage);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBatch, setSelectedBatch] = useState<string>("all");
    const [showAdd, setShowAdd] = useState(false);
    const [newContact, setNewContact] = useState({ email: "", name: "", company: "" });
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

    // Profile modal state
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Contact>>({});

    // Activity for selected contact
    const contactActivities = useQuery(
        api.activities.getContactActivities,
        selectedContact ? { contactId: selectedContact._id, limit: 20 } : "skip"
    );

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

    const openContactProfile = (contact: Contact) => {
        setSelectedContact(contact);
        setEditForm({
            email: contact.email,
            name: contact.name || "",
            company: contact.company || "",
            phone: contact.phone || "",
            location: contact.location || "",
            website: contact.website || "",
        });
        setIsEditing(false);
    };

    const handleSaveContact = async () => {
        if (!selectedContact) return;
        await updateContact({
            id: selectedContact._id,
            email: editForm.email,
            name: editForm.name || undefined,
            company: editForm.company || undefined,
            phone: editForm.phone || undefined,
            location: editForm.location || undefined,
        });
        setIsEditing(false);
        // Refresh the contact data
        const updated = contacts?.find(c => c._id === selectedContact._id);
        if (updated) setSelectedContact({ ...updated, ...editForm } as Contact);
    };

    const handleStageChange = async (stage: string) => {
        if (!selectedContact) return;
        await updateSalesStage({
            contactId: selectedContact._id,
            stage: stage as any,
        });
        setSelectedContact({ ...selectedContact, salesStage: stage });
    };

    const formatRelativeTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const companiesCount = new Set(contacts?.map(c => c.company).filter(Boolean)).size;
    const listsCount = batches?.length ?? 0;

    return (
        <div className="min-h-screen bg-[#F8F9FC] pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Hero Section */}
                <div className="relative mb-8 rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/5 to-[#10B981]/5" />

                    <div className="relative p-8 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#10B981] flex items-center justify-center text-2xl shadow-lg shadow-[#0EA5E9]/25">
                                    👥
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-[#1A1D26]">Contacts</h1>
                                    <p className="text-[#9CA3AF]">Manage your email recipients</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="group px-5 py-3 bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] rounded-xl font-semibold text-white shadow-lg shadow-[#FF6B4A]/25 hover:shadow-xl hover:shadow-[#FF6B4A]/30 transition-all hover:scale-105"
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-lg">+</span>
                                Add Contact
                            </span>
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Contacts", value: contacts?.length ?? 0, icon: "👥", color: "#0EA5E9" },
                        { label: "Companies", value: companiesCount, icon: "🏢", color: "#3B82F6" },
                        { label: "Contact Lists", value: listsCount, icon: "📋", color: "#8B5CF6" },
                        { label: "Selected", value: selectedContacts.size, icon: "✓", color: "#F59E0B" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="group p-4 bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: `${stat.color}15` }}
                                >
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-[#1A1D26]">{stat.value}</div>
                                    <div className="text-xs text-[#9CA3AF]">{stat.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[250px] relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">🔍</div>
                            <input
                                type="text"
                                placeholder="Search by email, name, or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none transition-all text-[#1A1D26] placeholder:text-[#9CA3AF]"
                            />
                        </div>

                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="px-4 py-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none transition-all text-[#1A1D26] appearance-none cursor-pointer min-w-[150px]"
                        >
                            <option value="all">All Lists</option>
                            {batches?.map(b => (
                                <option key={b._id} value={b._id}>{b.name}</option>
                            ))}
                        </select>

                        <div className="flex bg-[#F8F9FC] rounded-lg p-1 border border-[#E5E7EB]">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === "list" ? "bg-[#FF6B4A]/10 text-[#FF6B4A]" : "text-[#9CA3AF] hover:text-[#1A1D26]"}`}
                            >
                                ≡ List
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === "grid" ? "bg-[#FF6B4A]/10 text-[#FF6B4A]" : "text-[#9CA3AF] hover:text-[#1A1D26]"}`}
                            >
                                ⊞ Grid
                            </button>
                        </div>

                        <button
                            onClick={() => setShowAdd(!showAdd)}
                            className={`px-4 py-3 rounded-xl font-semibold transition-all ${showAdd
                                ? "bg-[#F1F3F8] text-[#9CA3AF]"
                                : "bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] text-white shadow-lg shadow-[#FF6B4A]/25 hover:shadow-xl"
                                }`}
                        >
                            {showAdd ? "Cancel" : "+ Add"}
                        </button>
                    </div>

                    {showAdd && (
                        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                            <div className="grid md:grid-cols-4 gap-3">
                                <input
                                    type="email"
                                    placeholder="Email address *"
                                    value={newContact.email}
                                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                    className="px-4 py-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none transition-all text-[#1A1D26] placeholder:text-[#9CA3AF]"
                                    autoFocus
                                />
                                <input
                                    type="text"
                                    placeholder="Name (optional)"
                                    value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    className="px-4 py-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none transition-all text-[#1A1D26] placeholder:text-[#9CA3AF]"
                                />
                                <input
                                    type="text"
                                    placeholder="Company (optional)"
                                    value={newContact.company}
                                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                                    className="px-4 py-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none transition-all text-[#1A1D26] placeholder:text-[#9CA3AF]"
                                />
                                <button
                                    onClick={handleAddContact}
                                    disabled={!newContact.email.trim()}
                                    className="px-4 py-3 bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#FF6B4A]/25 transition-all"
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
                        <div className="animate-spin w-8 h-8 border-2 border-[#FF6B4A] border-t-transparent rounded-full" />
                    </div>
                ) : filteredContacts?.length === 0 ? (
                    <div className="relative overflow-hidden text-center py-20 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
                        <div className="relative">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#0EA5E9]/10 to-[#10B981]/10 border border-[#E5E7EB] flex items-center justify-center text-4xl">
                                {searchQuery ? "🔍" : "👥"}
                            </div>
                            <h2 className="text-2xl font-bold text-[#1A1D26] mb-2">
                                {searchQuery ? `No results for "${searchQuery}"` : "No Contacts Yet"}
                            </h2>
                            <p className="text-[#9CA3AF] mb-6 max-w-md mx-auto">
                                {searchQuery
                                    ? "Try adjusting your search or filters"
                                    : "Add contacts manually or use the Lead Finder to discover new leads"
                                }
                            </p>
                            {!searchQuery && (
                                <div className="flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => setShowAdd(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] rounded-xl font-semibold text-white shadow-lg shadow-[#FF6B4A]/25 hover:shadow-xl hover:scale-105 transition-all"
                                    >
                                        + Add Contact
                                    </button>
                                    <a
                                        href="/scraper"
                                        className="px-6 py-3 bg-[#F1F3F8] border border-[#E5E7EB] rounded-xl font-semibold text-[#4B5563] hover:bg-[#E5E7EB] transition-all"
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
                            const stage = SALES_STAGES.find(s => s.id === contact.salesStage) || SALES_STAGES[0];
                            return (
                                <div
                                    key={contact._id}
                                    onClick={() => openContactProfile(contact as Contact)}
                                    className={`group relative p-4 bg-white rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${isSelected
                                        ? "border-[#FF6B4A]/30 shadow-lg shadow-[#FF6B4A]/10 bg-[#FF6B4A]/5"
                                        : "border-[#E5E7EB] hover:border-[#FF6B4A]/20"
                                        }`}
                                >
                                    <div
                                        className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all text-xs cursor-pointer z-10"
                                        style={{ borderColor: isSelected ? '#FF6B4A' : '#E5E7EB', backgroundColor: isSelected ? '#FF6B4A' : 'transparent', color: isSelected ? 'white' : 'transparent' }}
                                        onClick={(e) => { e.stopPropagation(); toggleContact(contact._id); }}
                                    >
                                        {isSelected && "✓"}
                                    </div>

                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold mb-3 ${isSelected
                                        ? "bg-gradient-to-br from-[#FF6B4A] to-[#F43F5E] text-white"
                                        : "bg-[#F1F3F8] text-[#4B5563]"
                                        }`}>
                                        {contact.name?.charAt(0).toUpperCase() || contact.email.charAt(0).toUpperCase()}
                                    </div>

                                    <h3 className="font-semibold text-[#1A1D26] truncate">{contact.name || contact.email.split('@')[0]}</h3>
                                    <p className="text-sm text-[#9CA3AF] truncate">{contact.email}</p>
                                    {contact.company && (
                                        <p className="text-xs text-[#9CA3AF] truncate mt-1">🏢 {contact.company}</p>
                                    )}

                                    <div className="mt-3 flex items-center gap-2">
                                        <span
                                            className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                                            style={{ backgroundColor: `${stage.color}15`, color: stage.color }}
                                        >
                                            {stage.icon} {stage.label}
                                        </span>
                                        {batch && (
                                            <span className="px-2 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-medium rounded-full">
                                                {batch.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs uppercase tracking-wider text-[#9CA3AF] font-semibold border-b border-[#E5E7EB] bg-[#F8F9FC]">
                            <div className="col-span-1 flex items-center">
                                <button
                                    onClick={selectAll}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all text-xs ${selectedContacts.size === filteredContacts?.length && filteredContacts.length > 0
                                        ? "bg-[#FF6B4A] border-[#FF6B4A] text-white"
                                        : "border-[#E5E7EB] hover:border-[#9CA3AF]"
                                        }`}
                                >
                                    {selectedContacts.size === filteredContacts?.length && filteredContacts.length > 0 && "✓"}
                                </button>
                            </div>
                            <div className="col-span-3">Contact</div>
                            <div className="col-span-2">Company</div>
                            <div className="col-span-2">Stage</div>
                            <div className="col-span-2">List</div>
                            <div className="col-span-2">Last Activity</div>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto">
                            {filteredContacts?.slice(0, 100).map((contact) => {
                                const batch = batches?.find(b => b._id === contact.batchId);
                                const isSelected = selectedContacts.has(contact._id);
                                const stage = SALES_STAGES.find(s => s.id === contact.salesStage) || SALES_STAGES[0];
                                return (
                                    <div
                                        key={contact._id}
                                        onClick={() => openContactProfile(contact as Contact)}
                                        className={`grid grid-cols-12 gap-4 items-center px-5 py-3 border-b border-[#F1F3F8] hover:bg-[#F8F9FC] transition-all cursor-pointer ${isSelected ? "bg-[#FF6B4A]/5" : ""
                                            }`}
                                    >
                                        <div className="col-span-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleContact(contact._id); }}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all text-xs ${isSelected
                                                    ? "bg-[#FF6B4A] border-[#FF6B4A] text-white"
                                                    : "border-[#E5E7EB] hover:border-[#9CA3AF]"
                                                    }`}
                                            >
                                                {isSelected && "✓"}
                                            </button>
                                        </div>
                                        <div className="col-span-3 flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isSelected
                                                ? "bg-gradient-to-br from-[#FF6B4A] to-[#F43F5E] text-white"
                                                : "bg-[#F1F3F8] text-[#4B5563]"
                                                }`}>
                                                {contact.name?.charAt(0).toUpperCase() || contact.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-[#1A1D26] truncate">{contact.name || "—"}</div>
                                                <div className="text-sm text-[#9CA3AF] truncate">{contact.email}</div>
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-[#9CA3AF] truncate">{contact.company || "—"}</div>
                                        <div className="col-span-2">
                                            <span
                                                className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                                                style={{ backgroundColor: `${stage.color}15`, color: stage.color }}
                                            >
                                                {stage.icon} {stage.label}
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            {batch ? (
                                                <span className="px-2 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-medium rounded-full">
                                                    {batch.name}
                                                </span>
                                            ) : (
                                                <span className="text-[#E5E7EB] text-sm">—</span>
                                            )}
                                        </div>
                                        <div className="col-span-2 text-sm text-[#9CA3AF]">
                                            {contact.lastEmailAt ? formatRelativeTime(contact.lastEmailAt) : "—"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {(filteredContacts?.length ?? 0) > 0 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-[#E5E7EB] bg-[#F8F9FC]">
                                <div className="text-sm text-[#9CA3AF]">
                                    {selectedContacts.size > 0 && (
                                        <span className="text-[#FF6B4A] font-medium">{selectedContacts.size} selected • </span>
                                    )}
                                    Showing {Math.min(100, filteredContacts?.length ?? 0)} of {filteredContacts?.length} contacts
                                </div>
                                {selectedContacts.size > 0 && (
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 bg-white border border-[#E5E7EB] text-[#4B5563] rounded-lg text-sm hover:bg-[#F1F3F8] transition-all">
                                            Export Selected
                                        </button>
                                        <button className="px-3 py-1.5 bg-[#FEF2F2] text-[#EF4444] rounded-lg text-sm hover:bg-[#EF4444]/20 transition-all">
                                            Delete Selected
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Contact Profile Modal */}
            {selectedContact && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F8F9FC]">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF6B4A] to-[#F43F5E] flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-[#FF6B4A]/25">
                                    {selectedContact.name?.charAt(0).toUpperCase() || selectedContact.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#1A1D26]">
                                        {selectedContact.name || selectedContact.email.split('@')[0]}
                                    </h2>
                                    <p className="text-sm text-[#9CA3AF]">{selectedContact.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-[#F1F3F8] border border-[#E5E7EB] text-[#4B5563] rounded-lg text-sm font-medium hover:bg-[#E5E7EB] transition-all"
                                    >
                                        ✏️ Edit
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 text-[#9CA3AF] hover:text-[#1A1D26] text-sm font-medium transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveContact}
                                            className="px-4 py-2 bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#FF6B4A]/25 transition-all"
                                        >
                                            Save Changes
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setSelectedContact(null)}
                                    className="p-2 hover:bg-white rounded-lg transition-colors text-[#9CA3AF] hover:text-[#1A1D26]"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Sales Stage */}
                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-3">Sales Stage</label>
                                <div className="flex flex-wrap gap-2">
                                    {SALES_STAGES.map((stage) => (
                                        <button
                                            key={stage.id}
                                            onClick={() => handleStageChange(stage.id)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedContact.salesStage === stage.id || (!selectedContact.salesStage && stage.id === "new")
                                                ? "ring-2 ring-offset-2"
                                                : "hover:scale-105"
                                                }`}
                                            style={{
                                                backgroundColor: `${stage.color}15`,
                                                color: stage.color,
                                                boxShadow: (selectedContact.salesStage === stage.id || (!selectedContact.salesStage && stage.id === "new")) ? `0 0 0 2px white, 0 0 0 4px ${stage.color}` : undefined
                                            }}
                                        >
                                            {stage.icon} {stage.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-3">Contact Details</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-[#9CA3AF] mb-1">Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.name || ""}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none text-[#1A1D26]"
                                            />
                                        ) : (
                                            <p className="px-4 py-2.5 bg-[#F8F9FC] rounded-xl text-[#1A1D26]">{selectedContact.name || "—"}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#9CA3AF] mb-1">Email</label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editForm.email || ""}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none text-[#1A1D26]"
                                            />
                                        ) : (
                                            <p className="px-4 py-2.5 bg-[#F8F9FC] rounded-xl text-[#1A1D26]">{selectedContact.email}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#9CA3AF] mb-1">Company</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.company || ""}
                                                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none text-[#1A1D26]"
                                            />
                                        ) : (
                                            <p className="px-4 py-2.5 bg-[#F8F9FC] rounded-xl text-[#1A1D26]">{selectedContact.company || "—"}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#9CA3AF] mb-1">Phone</label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editForm.phone || ""}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none text-[#1A1D26]"
                                            />
                                        ) : (
                                            <p className="px-4 py-2.5 bg-[#F8F9FC] rounded-xl text-[#1A1D26]">{selectedContact.phone || "—"}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#9CA3AF] mb-1">Location</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.location || ""}
                                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none text-[#1A1D26]"
                                            />
                                        ) : (
                                            <p className="px-4 py-2.5 bg-[#F8F9FC] rounded-xl text-[#1A1D26]">{selectedContact.location || "—"}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#9CA3AF] mb-1">Website</label>
                                        {isEditing ? (
                                            <input
                                                type="url"
                                                value={editForm.website || ""}
                                                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none text-[#1A1D26]"
                                            />
                                        ) : (
                                            <p className="px-4 py-2.5 bg-[#F8F9FC] rounded-xl text-[#1A1D26]">
                                                {selectedContact.website ? (
                                                    <a href={selectedContact.website} target="_blank" rel="noopener noreferrer" className="text-[#FF6B4A] hover:underline">
                                                        {selectedContact.website}
                                                    </a>
                                                ) : "—"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-3">Engagement Stats</label>
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="p-3 bg-[#F8F9FC] rounded-xl text-center">
                                        <div className="text-2xl font-bold text-[#1A1D26]">{selectedContact.emailCount || 0}</div>
                                        <div className="text-xs text-[#9CA3AF]">Emails Sent</div>
                                    </div>
                                    <div className="p-3 bg-[#F8F9FC] rounded-xl text-center">
                                        <div className="text-2xl font-bold text-[#1A1D26]">{selectedContact.callCount || 0}</div>
                                        <div className="text-xs text-[#9CA3AF]">Calls Made</div>
                                    </div>
                                    <div className="p-3 bg-[#F8F9FC] rounded-xl text-center">
                                        <div className="text-sm font-medium text-[#1A1D26]">
                                            {selectedContact.lastEmailAt ? formatRelativeTime(selectedContact.lastEmailAt) : "—"}
                                        </div>
                                        <div className="text-xs text-[#9CA3AF]">Last Email</div>
                                    </div>
                                    <div className="p-3 bg-[#F8F9FC] rounded-xl text-center">
                                        <div className="text-sm font-medium text-[#1A1D26]">
                                            {selectedContact.lastCallAt ? formatRelativeTime(selectedContact.lastCallAt) : "—"}
                                        </div>
                                        <div className="text-xs text-[#9CA3AF]">Last Call</div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Timeline */}
                            <div>
                                <label className="block text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-3">Activity History</label>
                                {contactActivities === undefined ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin w-6 h-6 border-2 border-[#FF6B4A] border-t-transparent rounded-full" />
                                    </div>
                                ) : contactActivities.length === 0 ? (
                                    <div className="text-center py-8 bg-[#F8F9FC] rounded-xl">
                                        <div className="text-3xl mb-2">📭</div>
                                        <p className="text-[#9CA3AF]">No activity yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                        {contactActivities.map((activity) => (
                                            <div key={activity._id} className="flex items-center gap-3 p-3 bg-[#F8F9FC] rounded-xl">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm border border-[#E5E7EB]">
                                                    {activity.type === "email_sent" ? "📧" :
                                                        activity.type === "email_opened" ? "👁️" :
                                                            activity.type === "email_clicked" ? "🔗" :
                                                                activity.type === "call_made" ? "📞" :
                                                                    activity.type === "status_changed" ? "🔄" :
                                                                        activity.type === "note_added" ? "📝" : "📌"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-[#1A1D26]">
                                                        {activity.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                                    </div>
                                                    {activity.notes && (
                                                        <div className="text-xs text-[#9CA3AF] truncate">{activity.notes}</div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-[#9CA3AF]">
                                                    {formatRelativeTime(activity.createdAt)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-[#F8F9FC]">
                            <button
                                onClick={async () => {
                                    if (confirm("Are you sure you want to delete this contact?")) {
                                        await deleteContact({ id: selectedContact._id });
                                        setSelectedContact(null);
                                    }
                                }}
                                className="px-4 py-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg text-sm font-medium transition-all"
                            >
                                🗑️ Delete Contact
                            </button>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#4B5563] rounded-lg text-sm font-medium hover:bg-[#F1F3F8] transition-all">
                                    📧 Send Email
                                </button>
                                <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#4B5563] rounded-lg text-sm font-medium hover:bg-[#F1F3F8] transition-all">
                                    📞 Log Call
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
