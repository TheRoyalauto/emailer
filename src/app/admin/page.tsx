"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

type Tier = "free" | "starter" | "growth" | "scale";

const tierColors: Record<Tier, string> = {
    free: "bg-slate-100 text-slate-700",
    starter: "bg-blue-100 text-blue-700",
    growth: "bg-violet-100 text-violet-700",
    scale: "bg-amber-100 text-amber-700",
};

const tierLabels: Record<Tier, string> = {
    free: "Free",
    starter: "Starter",
    growth: "Growth",
    scale: "Scale",
};

export default function AdminPage() {
    const [search, setSearch] = useState("");
    const [tierFilter, setTierFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState<Id<"userProfiles"> | null>(null);
    const [showTierModal, setShowTierModal] = useState(false);
    const [pendingTier, setPendingTier] = useState<Tier | null>(null);

    const isSuperAdmin = useQuery(api.superAdmin.checkSuperAdmin);
    const dashboardStats = useQuery(api.superAdmin.getDashboardStats);
    const usersData = useQuery(api.superAdmin.listAllUsers, {
        search: search || undefined,
        tierFilter: tierFilter !== "all" ? tierFilter : undefined,
        limit: 100,
    });
    const userDetails = useQuery(
        api.superAdmin.getUserDetails,
        selectedUser ? { profileId: selectedUser } : "skip"
    );

    const updateTier = useMutation(api.superAdmin.updateUserTier);
    const updateStatus = useMutation(api.superAdmin.updateUserStatus);

    // Not authorized
    if (isSuperAdmin && !isSuperAdmin.isSuperAdmin) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-slate-400">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    const handleTierChange = async () => {
        if (!selectedUser || !pendingTier) return;
        await updateTier({ profileId: selectedUser, tier: pendingTier });
        setShowTierModal(false);
        setPendingTier(null);
    };

    const handleStatusChange = async (status: "active" | "suspended") => {
        if (!selectedUser) return;
        await updateStatus({ profileId: selectedUser, status });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Super Admin</h1>
                            <p className="text-sm text-slate-400">User Management Dashboard</p>
                        </div>
                    </div>
                    <a href="/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                        ← Back to App
                    </a>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                {dashboardStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="text-3xl font-bold">{dashboardStats.totalUsers}</div>
                            <div className="text-slate-400 text-sm">Total Users</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="text-3xl font-bold text-green-400">{dashboardStats.newUsersToday}</div>
                            <div className="text-slate-400 text-sm">New Today</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="text-3xl font-bold text-blue-400">{dashboardStats.activeUsersToday}</div>
                            <div className="text-slate-400 text-sm">Active Today</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="text-3xl font-bold text-violet-400">{dashboardStats.totalEmailsSent.toLocaleString()}</div>
                            <div className="text-slate-400 text-sm">Emails Sent</div>
                        </div>
                    </div>
                )}

                {/* Tier Breakdown */}
                {dashboardStats && (
                    <div className="flex flex-wrap gap-3 mb-8">
                        <button
                            onClick={() => setTierFilter("all")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tierFilter === "all" ? "bg-white text-slate-900" : "bg-white/10 hover:bg-white/20"
                                }`}
                        >
                            All ({dashboardStats.totalUsers})
                        </button>
                        {Object.entries(dashboardStats.tierBreakdown).map(([tier, count]) => (
                            <button
                                key={tier}
                                onClick={() => setTierFilter(tier)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tierFilter === tier ? "bg-white text-slate-900" : "bg-white/10 hover:bg-white/20"
                                    }`}
                            >
                                {tierLabels[tier as Tier]} ({count})
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* User List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            {/* Search */}
                            <div className="p-4 border-b border-white/10">
                                <input
                                    type="text"
                                    placeholder="Search by email or name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Tier</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Emails</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {usersData?.users.map((user) => (
                                            <tr
                                                key={user._id}
                                                onClick={() => setSelectedUser(user._id)}
                                                className={`cursor-pointer hover:bg-white/5 transition-colors ${selectedUser === user._id ? "bg-indigo-500/20" : ""
                                                    }`}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-medium">
                                                            {user.email[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{user.name || "—"}</div>
                                                            <div className="text-sm text-slate-400">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tierColors[user.tier]}`}>
                                                        {tierLabels[user.tier]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm">
                                                        <span className="text-slate-400">Today:</span> {user.emailsSentToday || 0}
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="text-slate-400">Month:</span> {user.emailsSentThisMonth || 0}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-400">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {usersData?.users.length === 0 && (
                                    <div className="p-8 text-center text-slate-400">
                                        No users found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* User Details Panel */}
                    <div className="lg:col-span-1">
                        {selectedUser && userDetails ? (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6 sticky top-6">
                                {/* Header */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-2xl font-bold">
                                        {userDetails.profile.email[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-lg">{userDetails.profile.name || "No Name"}</div>
                                        <div className="text-sm text-slate-400">{userDetails.profile.email}</div>
                                    </div>
                                </div>

                                {/* Tier Control */}
                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase mb-2 block">Tier</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {(["free", "starter", "growth", "scale"] as Tier[]).map((tier) => (
                                            <button
                                                key={tier}
                                                onClick={() => {
                                                    setPendingTier(tier);
                                                    setShowTierModal(true);
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${userDetails.profile.tier === tier
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-white/10 hover:bg-white/20"
                                                    }`}
                                            >
                                                {tierLabels[tier]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Usage Stats */}
                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase mb-2 block">Usage</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="text-lg font-bold">{userDetails.profile.emailsSentToday || 0}</div>
                                            <div className="text-xs text-slate-400">Emails Today</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="text-lg font-bold">{userDetails.profile.emailsSentThisMonth || 0}</div>
                                            <div className="text-xs text-slate-400">This Month</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="text-lg font-bold">{userDetails.stats.campaignsCount}</div>
                                            <div className="text-xs text-slate-400">Campaigns</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="text-lg font-bold">{userDetails.stats.contactsCount}</div>
                                            <div className="text-xs text-slate-400">Contacts</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Control */}
                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase mb-2 block">Status</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStatusChange("active")}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${userDetails.profile.status !== "suspended"
                                                    ? "bg-green-600 text-white"
                                                    : "bg-white/10 hover:bg-white/20"
                                                }`}
                                        >
                                            Active
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange("suspended")}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${userDetails.profile.status === "suspended"
                                                    ? "bg-red-600 text-white"
                                                    : "bg-white/10 hover:bg-white/20"
                                                }`}
                                        >
                                            Suspend
                                        </button>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="text-sm text-slate-400 space-y-1">
                                    <div>Joined: {new Date(userDetails.profile.createdAt).toLocaleString()}</div>
                                    {userDetails.profile.lastLoginAt && (
                                        <div>Last Login: {new Date(userDetails.profile.lastLoginAt).toLocaleString()}</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-slate-400">
                                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Select a user to view details
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tier Change Confirmation Modal */}
            {showTierModal && pendingTier && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-2">Confirm Tier Change</h3>
                        <p className="text-slate-400 mb-6">
                            Change this user's tier to <strong className="text-white">{tierLabels[pendingTier]}</strong>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowTierModal(false)}
                                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTierChange}
                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
