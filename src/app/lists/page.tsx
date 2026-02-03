"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

export default function ListsPage() {
    const lists = useQuery(api.lists.list);
    const createList = useMutation(api.lists.create);
    const deleteList = useMutation(api.lists.remove);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");

    const handleCreate = async () => {
        if (!newName.trim()) return;
        await createList({
            name: newName,
            description: newDescription || undefined,
        });
        setNewName("");
        setNewDescription("");
        setIsCreating(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            <header className="border-b border-white/10 bg-black/40 sticky top-0 z-50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Emailer
                        </Link>
                        <nav className="flex gap-4">
                            <Link href="/campaigns" className="text-white/60 hover:text-white transition-colors">Campaigns</Link>
                            <Link href="/contacts" className="text-white/60 hover:text-white transition-colors">Contacts</Link>
                            <Link href="/lists" className="text-white font-medium">Lists</Link>
                            <Link href="/senders" className="text-white/60 hover:text-white transition-colors">Senders</Link>
                        </nav>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        + New List
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold mb-8">Mailing Lists</h1>

                {isCreating && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setIsCreating(false)}>
                        <div className="bg-[#1a1a2e] p-6 rounded-xl border border-white/10 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-xl font-semibold mb-4">Create List</h2>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="List name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                    autoFocus
                                />
                                <textarea
                                    placeholder="Description (optional)"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 h-24 resize-none"
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button onClick={() => setIsCreating(false)} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleCreate} className="px-4 py-2 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors">
                                    Create List
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {lists === undefined ? (
                    <div className="text-white/50">Loading lists...</div>
                ) : lists.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-white/50 mb-4">No lists yet</p>
                        <button onClick={() => setIsCreating(true)} className="text-indigo-400 hover:text-indigo-300">
                            Create your first list →
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lists.map((list) => (
                            <div
                                key={list._id}
                                className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-indigo-500/50 transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold group-hover:text-indigo-300 transition-colors">
                                            {list.name}
                                        </h3>
                                        {list.description && (
                                            <p className="text-white/50 text-sm mt-1">{list.description}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => deleteList({ id: list._id })}
                                        className="p-2 text-white/40 hover:text-red-400 transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <span className="text-white/40 text-sm">
                                        {list.contactCount} contact{list.contactCount !== 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
