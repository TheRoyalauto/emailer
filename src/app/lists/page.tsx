"use client";

import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";

function ListsPage() {
    const lists = useAuthQuery(api.lists.list);
    const createList = useAuthMutation(api.lists.create);
    const deleteList = useAuthMutation(api.lists.remove);
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
        <div className="min-h-screen bg-slate-50 text-white pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Mailing Lists
                        </h1>
                        <p className="text-slate-500 mt-1">Organize contacts into mailing lists</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        + New List
                    </button>
                </div>

                {isCreating && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setIsCreating(false)}>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-xl font-semibold mb-4">Create List</h2>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="List name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/40 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                                    autoFocus
                                />
                                <textarea
                                    placeholder="Description (optional)"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/40 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 h-24 resize-none"
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button onClick={() => setIsCreating(false)} className="px-4 py-2 bg-slate-50 rounded-lg hover:bg-white/20 transition-colors">
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
                    <div className="text-slate-500">Loading lists...</div>
                ) : lists.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-500 mb-4">No lists yet</p>
                        <button onClick={() => setIsCreating(true)} className="text-indigo-400 hover:text-indigo-300">
                            Create your first list →
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lists.map((list) => (
                            <div
                                key={list._id}
                                className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-slate-200 hover:border-indigo-500/50 transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold group-hover:text-indigo-300 transition-colors">
                                            {list.name}
                                        </h3>
                                        {list.description && (
                                            <p className="text-slate-500 text-sm mt-1">{list.description}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => deleteList({ id: list._id })}
                                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <span className="text-slate-400 text-sm">
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

export default function ListsPageWrapper() {
    return (
        <AuthGuard>
            <ListsPage />
        </AuthGuard>
    );
}
