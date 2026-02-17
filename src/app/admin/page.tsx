"use client";

import { useState, useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";
import Link from "next/link";

type Tier = "free" | "starter" | "professional" | "enterprise";

const tierConfig: Record<Tier, { label: string; color: string; darkColor: string; bg: string; darkBg: string; border: string; darkBorder: string; price: string }> = {
    free: { label: "Free", color: "text-slate-700", darkColor: "dark:text-slate-300", bg: "bg-slate-100", darkBg: "dark:bg-slate-800", border: "border-slate-200", darkBorder: "dark:border-slate-700", price: "$0" },
    starter: { label: "Starter", color: "text-cyan-700", darkColor: "dark:text-cyan-300", bg: "bg-cyan-50", darkBg: "dark:bg-cyan-950/50", border: "border-cyan-200", darkBorder: "dark:border-cyan-800", price: "$29/mo" },
    professional: { label: "Professional", color: "text-violet-700", darkColor: "dark:text-violet-300", bg: "bg-violet-50", darkBg: "dark:bg-violet-950/50", border: "border-violet-200", darkBorder: "dark:border-violet-800", price: "$79/mo" },
    enterprise: { label: "Enterprise", color: "text-amber-700", darkColor: "dark:text-amber-300", bg: "bg-amber-50", darkBg: "dark:bg-amber-950/50", border: "border-amber-200", darkBorder: "dark:border-amber-800", price: "$199/mo" },
};

const actionLabels: Record<string, { label: string; icon: string; color: string }> = {
    tier_change: { label: "Tier Change", icon: "🔄", color: "text-violet-600 bg-violet-50 dark:bg-violet-950/50" },
    status_change: { label: "Status Change", icon: "🔒", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" },
    admin_toggle: { label: "Admin Toggle", icon: "🛡", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50" },
    super_admin_grant: { label: "Super Admin Grant", icon: "⭐", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" },
    super_admin_revoke: { label: "Super Admin Revoke", icon: "❌", color: "text-red-600 bg-red-50 dark:bg-red-950/50" },
    usage_reset: { label: "Usage Reset", icon: "🔁", color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50" },
    data_deletion: { label: "Data Deletion", icon: "🗑", color: "text-red-600 bg-red-50 dark:bg-red-950/50" },
    note_added: { label: "Note Added", icon: "📝", color: "text-slate-600 bg-slate-50 dark:bg-slate-800" },
    impersonation_start: { label: "Impersonation Start", icon: "👁", color: "text-orange-600 bg-orange-50 dark:bg-orange-950/50" },
    impersonation_end: { label: "Impersonation End", icon: "👁‍🗨", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
};

const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "audit", label: "Audit Log", icon: "📋" },
    { id: "system", label: "System", icon: "⚙️" },
];

// ─── Shared Styles ────────────────────
const cardClass = "bg-white dark:bg-[var(--bg-primary)] rounded-xl border border-slate-200 dark:border-[var(--border-default)] shadow-sm dark:shadow-[var(--shadow-sm)]";
const headingClass = "font-heading text-slate-900 dark:text-[var(--text-primary)] tracking-[-0.02em]";
const bodyClass = "text-slate-500 dark:text-[var(--text-secondary)]";
const mutedClass = "text-slate-400 dark:text-[var(--text-muted)]";
const inputClass = "px-4 py-2 bg-slate-50 dark:bg-[var(--bg-tertiary)] border border-slate-200 dark:border-[var(--border-default)] rounded-lg text-sm text-slate-900 dark:text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-[var(--text-muted)] focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
const tableHeaderClass = "text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-[var(--text-muted)] uppercase tracking-wider";

export default function SuperAdminPage() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [search, setSearch] = useState("");
    const [tierFilter, setTierFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [noteInput, setNoteInput] = useState("");
    const [confirmAction, setConfirmAction] = useState<{ type: string; userId: string; label: string } | null>(null);
    const [auditActionFilter, setAuditActionFilter] = useState("all");
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains("dark"));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    // Queries
    const isSuperAdmin = useAuthQuery(api.superAdmin.checkSuperAdmin);
    const stats = useAuthQuery(api.superAdmin.getDashboardStats);
    const usersData = useAuthQuery(api.superAdmin.listAllUsers, {
        limit: 100,
        tierFilter: tierFilter !== "all" ? tierFilter : undefined,
        statusFilter: statusFilter !== "all" ? statusFilter : undefined,
        search: search || undefined,
    });
    const userDetails = useAuthQuery(
        api.superAdmin.getUserDetails,
        selectedUser ? { profileId: selectedUser as Id<"userProfiles"> } : "skip"
    );
    const auditLogs = useAuthQuery(api.superAdmin.getAuditLog, {
        limit: 50,
        actionFilter: auditActionFilter !== "all" ? auditActionFilter : undefined,
        targetProfileId: (activeTab === "users" && selectedUser) ? selectedUser as Id<"userProfiles"> : undefined,
    });

    // Mutations
    const updateTier = useAuthMutation(api.superAdmin.updateUserTier);
    const updateStatus = useAuthMutation(api.superAdmin.updateUserStatus);
    const toggleAdmin = useAuthMutation(api.superAdmin.toggleAdminStatus);
    const addNote = useAuthMutation(api.superAdmin.addAdminNote);
    const resetUsage = useAuthMutation(api.superAdmin.resetUserUsage);
    const deleteData = useAuthMutation(api.superAdmin.deleteUserData);
    const makeSuperAdminMut = useAuthMutation(api.superAdmin.makeSuperAdmin);
    const revokeSuperAdminMut = useAuthMutation(api.superAdmin.revokeSuperAdmin);
    const startImpersonation = useAuthMutation(api.superAdmin.startImpersonation);

    // ─── Loading ───
    if (isSuperAdmin === undefined) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[var(--bg-secondary)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm mx-auto mb-4 animate-pulse">SA</div>
                    <div className={`text-sm ${bodyClass}`}>Verifying access…</div>
                </div>
            </div>
        );
    }

    // ─── Access Denied ───
    if (isSuperAdmin && !isSuperAdmin.isSuperAdmin) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[var(--bg-secondary)] flex items-center justify-center">
                <div className={`${cardClass} p-10 text-center max-w-md`}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center justify-center text-3xl">🚫</div>
                    <h1 className={`text-xl font-bold ${headingClass} mb-2`}>Access Denied</h1>
                    <p className={bodyClass}>Super admin privileges required.</p>
                    <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-[var(--text-primary)] text-white dark:text-[var(--bg-secondary)] rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Handlers
    const handleTierChange = async (profileId: string, tier: Tier) => {
        await updateTier({ profileId: profileId as Id<"userProfiles">, tier });
    };

    const handleStatusChange = async (profileId: string, status: "active" | "suspended" | "deleted") => {
        await updateStatus({ profileId: profileId as Id<"userProfiles">, status });
        setConfirmAction(null);
    };

    const handleAddNote = async (profileId: string) => {
        if (!noteInput.trim()) return;
        await addNote({ profileId: profileId as Id<"userProfiles">, note: noteInput });
        setNoteInput("");
    };

    const handleResetUsage = async (profileId: string, type: "daily" | "monthly" | "both") => {
        await resetUsage({ profileId: profileId as Id<"userProfiles">, resetType: type });
        setConfirmAction(null);
    };

    const handleDeleteData = async (profileId: string) => {
        await deleteData({ profileId: profileId as Id<"userProfiles">, deleteProfile: true });
        setConfirmAction(null);
        setSelectedUser(null);
    };

    const handleStartImpersonation = async (profileId: string) => {
        const result = await startImpersonation({ profileId: profileId as Id<"userProfiles"> });
        if (result?.success && result.impersonationToken) {
            const currentToken = localStorage.getItem("claimory_session_token");
            if (currentToken) {
                sessionStorage.setItem("claimory_admin_token", currentToken);
            }
            localStorage.setItem("claimory_session_token", result.impersonationToken);
            window.location.href = "/dashboard";
        }
    };

    const formatTimestamp = (ts: number) => {
        const now = Date.now();
        const diff = now - ts;
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const TierBadge = ({ tier }: { tier: Tier }) => {
        const tc = tierConfig[tier] || tierConfig.free;
        return (
            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${tc.bg} ${tc.darkBg} ${tc.color} ${tc.darkColor} ${tc.border} ${tc.darkBorder}`}>
                {tc.label}
            </span>
        );
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const s = status || "active";
        const cls = s === "active"
            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
            : s === "suspended"
                ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
        const dot = s === "active" ? "bg-emerald-500" : s === "suspended" ? "bg-red-500" : "bg-slate-400";
        return (
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[var(--bg-secondary)]">
            {/* ─── Top Bar ─── */}
            <div className="bg-white dark:bg-[var(--bg-primary)] border-b border-slate-200 dark:border-[var(--border-default)] sticky top-0 z-40">
                <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">SA</div>
                        <div>
                            <h1 className={`text-lg font-bold ${headingClass}`}>Claimory Command Center</h1>
                            <p className={`text-xs ${mutedClass}`}>Super Admin Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSelectedUser(null); }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? "bg-cyan-500 text-white shadow-sm"
                                    : "text-slate-600 dark:text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-[var(--bg-tertiary)]"
                                    }`}
                            >
                                <span className="mr-1.5">{tab.icon}</span>{tab.label}
                            </button>
                        ))}
                        <div className="w-px h-6 bg-slate-200 dark:bg-[var(--border-default)] mx-1" />
                        <Link href="/dashboard" className={`px-3 py-2 rounded-lg text-sm font-medium ${bodyClass} hover:bg-slate-100 dark:hover:bg-[var(--bg-tertiary)] transition-colors`}>
                            ← App
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 py-6">
                {/* ═══════════════════ DASHBOARD TAB ═══════════════════ */}
                {activeTab === "dashboard" && stats && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Total Users", value: stats.totalUsers, icon: "👥", accent: "from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20" },
                                { label: "Active Today", value: stats.activeUsersToday, icon: "🟢", accent: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20" },
                                { label: "Emails Today", value: stats.emailsSentToday, icon: "📧", accent: "from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20" },
                                { label: "Total Campaigns", value: stats.campaignsTotal, icon: "📋", accent: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20" },
                            ].map((kpi) => (
                                <div key={kpi.label} className={`${cardClass} p-5 bg-gradient-to-br ${kpi.accent} hover:shadow-md transition-shadow`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl">{kpi.icon}</span>
                                        <span className={`text-xs ${mutedClass} font-medium uppercase tracking-wide`}>{kpi.label}</span>
                                    </div>
                                    <div className={`text-3xl font-bold font-heading tracking-[-0.04em] ${headingClass}`}>{kpi.value?.toLocaleString() || 0}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "New This Week", value: stats.newUsersThisWeek },
                                { label: "Suspended", value: stats.suspendedUsers },
                                { label: "Emails This Month", value: stats.emailsSentThisMonth },
                                { label: "Campaigns Sending", value: stats.campaignsSending },
                            ].map((s) => (
                                <div key={s.label} className={`${cardClass} p-4`}>
                                    <div className={`text-xs ${mutedClass} font-medium mb-1`}>{s.label}</div>
                                    <div className={`text-xl font-bold font-heading ${headingClass}`}>{s.value?.toLocaleString() || 0}</div>
                                </div>
                            ))}
                        </div>

                        {/* Tier Breakdown */}
                        <div className={`${cardClass} p-6`}>
                            <h2 className={`text-base font-bold ${headingClass} mb-4`}>Plan Distribution</h2>
                            <div className="grid grid-cols-4 gap-4">
                                {(Object.entries(stats.tierBreakdown || {}) as [Tier, number][]).map(([tier, count]) => {
                                    const tc = tierConfig[tier];
                                    const pct = stats.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0;
                                    return (
                                        <div key={tier} className={`rounded-xl p-4 border ${tc.bg} ${tc.darkBg} ${tc.border} ${tc.darkBorder}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-sm font-semibold ${tc.color} ${tc.darkColor}`}>{tc.label}</span>
                                                <span className={`text-xs ${tc.color} ${tc.darkColor} opacity-70`}>{tc.price}</span>
                                            </div>
                                            <div className={`text-2xl font-bold font-heading ${tc.color} ${tc.darkColor}`}>{count}</div>
                                            <div className="mt-2 h-1.5 bg-white/60 dark:bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-current rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className={`text-xs mt-1 ${tc.color} ${tc.darkColor} opacity-60`}>{pct}%</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Campaign Health */}
                        <div className={`${cardClass} p-6`}>
                            <h2 className={`text-base font-bold ${headingClass} mb-4`}>Campaign Health</h2>
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: "Draft", value: stats.campaignsDraft, cls: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800" },
                                    { label: "Sending", value: stats.campaignsSending, cls: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50" },
                                    { label: "Sent", value: stats.campaignsSent, cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50" },
                                    { label: "Total", value: stats.campaignsTotal, cls: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50" },
                                ].map((c) => (
                                    <div key={c.label} className={`rounded-xl p-4 ${c.cls}`}>
                                        <div className="text-xs font-medium opacity-70 mb-1">{c.label}</div>
                                        <div className="text-xl font-bold font-heading">{c.value || 0}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Audit Activity */}
                        {auditLogs && auditLogs.length > 0 && (
                            <div className={`${cardClass} p-6`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className={`text-base font-bold ${headingClass}`}>Recent Admin Activity</h2>
                                    <button onClick={() => setActiveTab("audit")} className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 font-medium">View All →</button>
                                </div>
                                <div className="space-y-2">
                                    {auditLogs.slice(0, 5).map((log: any) => {
                                        const config = actionLabels[log.action] || { label: log.action, icon: "📌", color: "text-slate-600 bg-slate-50 dark:bg-slate-800" };
                                        return (
                                            <div key={log._id} className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-[var(--border-subtle)] last:border-0">
                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${config.color}`}>{config.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-sm text-slate-700 dark:text-[var(--text-primary)] truncate`}>{log.details}</div>
                                                    <div className={`text-xs ${mutedClass}`}>{log.actorEmail} · {formatTimestamp(log.timestamp)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "dashboard" && !stats && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <div className={`text-sm ${mutedClass}`}>Loading dashboard…</div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════ USERS TAB ═══════════════════ */}
                {activeTab === "users" && (
                    <div className="flex gap-6 animate-fadeIn">
                        <div className={`${selectedUser ? "w-1/2" : "w-full"} transition-all duration-300`}>
                            {/* Filters */}
                            <div className={`${cardClass} p-4 mb-4`}>
                                <div className="flex flex-wrap gap-3">
                                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
                                        className={`flex-1 min-w-[200px] ${inputClass}`} />
                                    <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}
                                        className={`${inputClass} px-3`}>
                                        <option value="all">All Plans</option>
                                        <option value="free">Free</option>
                                        <option value="starter">Starter</option>
                                        <option value="professional">Professional</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                        className={`${inputClass} px-3`}>
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="deleted">Deleted</option>
                                    </select>
                                </div>
                                {usersData && <div className={`mt-3 text-xs ${mutedClass}`}>Showing {usersData.users?.length || 0} of {usersData.totalCount || 0} users</div>}
                            </div>

                            {/* User Table */}
                            <div className={`${cardClass} overflow-hidden`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-[var(--bg-tertiary)] border-b border-slate-200 dark:border-[var(--border-default)]">
                                                <th className={tableHeaderClass}>User</th>
                                                <th className={tableHeaderClass}>Plan</th>
                                                <th className={tableHeaderClass}>Status</th>
                                                <th className={tableHeaderClass}>Usage</th>
                                                <th className={tableHeaderClass}>Joined</th>
                                                <th className={`${tableHeaderClass} text-right`}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-[var(--border-subtle)]">
                                            {usersData?.users?.map((user: any) => {
                                                const isSelected = selectedUser === user._id;
                                                return (
                                                    <tr key={user._id} onClick={() => setSelectedUser(isSelected ? null : user._id)}
                                                        className={`cursor-pointer transition-colors ${isSelected
                                                            ? "bg-cyan-50/50 dark:bg-cyan-950/20"
                                                            : "hover:bg-slate-50 dark:hover:bg-[var(--bg-tertiary)]"
                                                            }`}>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                                                    {(user.name || user.email || "?").charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className={`text-sm font-medium ${headingClass} truncate`}>{user.name || "No name"}</div>
                                                                    <div className={`text-xs ${mutedClass} truncate`}>{user.email}</div>
                                                                </div>
                                                                {user.isSuperAdmin && <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded">SA</span>}
                                                                {user.isAdmin && !user.isSuperAdmin && <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded">A</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3"><TierBadge tier={user.tier as Tier} /></td>
                                                        <td className="px-4 py-3"><StatusBadge status={user.status || "active"} /></td>
                                                        <td className="px-4 py-3">
                                                            <div className={`text-xs font-medium ${headingClass}`}>{user.emailsSentToday || 0}/day</div>
                                                            <div className={`text-xs ${mutedClass}`}>{user.emailsSentThisMonth || 0}/mo</div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className={`text-xs ${bodyClass}`}>{new Date(user.createdAt).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <select value={user.tier} onChange={(e) => { e.stopPropagation(); handleTierChange(user._id, e.target.value as Tier); }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className={`px-2 py-1 ${inputClass} text-xs`}>
                                                                <option value="free">Free</option>
                                                                <option value="starter">Starter</option>
                                                                <option value="professional">Professional</option>
                                                                <option value="enterprise">Enterprise</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {(!usersData?.users || usersData.users.length === 0) && (
                                    <div className={`p-10 text-center ${mutedClass} text-sm`}>{usersData === undefined ? "Loading users…" : "No users found"}</div>
                                )}
                            </div>
                        </div>

                        {/* ─── User Detail Panel ─── */}
                        {selectedUser && userDetails && (
                            <div className="w-1/2 space-y-4 animate-fadeIn">
                                {/* Profile Header */}
                                <div className={`${cardClass} p-6`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                                                {(userDetails.profile.name || userDetails.profile.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className={`text-lg font-bold ${headingClass}`}>{userDetails.profile.name || "No Name"}</h3>
                                                <p className={`text-sm ${mutedClass}`}>{userDetails.profile.email}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <TierBadge tier={userDetails.profile.tier as Tier} />
                                                    <StatusBadge status={userDetails.profile.status || "active"} />
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedUser(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-[var(--bg-tertiary)] rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[var(--text-primary)] transition-colors">✕</button>
                                    </div>

                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { label: "Campaigns", value: userDetails.stats.campaignsCount },
                                            { label: "Contacts", value: userDetails.stats.contactsCount },
                                            { label: "Accounts", value: userDetails.stats.smtpConfigsCount },
                                            { label: "Total Sent", value: userDetails.stats.totalEmailsSent },
                                        ].map((s) => (
                                            <div key={s.label} className="bg-slate-50 dark:bg-[var(--bg-tertiary)] rounded-lg p-3 text-center">
                                                <div className={`text-lg font-bold font-heading ${headingClass}`}>{s.value}</div>
                                                <div className={`text-xs ${mutedClass}`}>{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Usage & Limits */}
                                <div className={`${cardClass} p-5`}>
                                    <h4 className={`text-sm font-bold ${headingClass} mb-3`}>Usage & Limits</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className={bodyClass}>Daily Emails</span>
                                                <span className={`text-slate-700 dark:text-[var(--text-primary)] font-medium`}>
                                                    {userDetails.profile.emailsSentToday || 0} / {userDetails.limits.dailyEmails === Infinity ? "∞" : userDetails.limits.dailyEmails}
                                                </span>
                                            </div>
                                            {userDetails.limits.dailyEmails !== Infinity && (
                                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-cyan-500 rounded-full transition-all"
                                                        style={{ width: `${Math.min(100, ((userDetails.profile.emailsSentToday || 0) / userDetails.limits.dailyEmails) * 100)}%` }} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className={bodyClass}>Monthly Emails</span>
                                                <span className={`text-slate-700 dark:text-[var(--text-primary)] font-medium`}>
                                                    {userDetails.profile.emailsSentThisMonth || 0} / {userDetails.limits.monthlyEmails === Infinity ? "∞" : userDetails.limits.monthlyEmails}
                                                </span>
                                            </div>
                                            {userDetails.limits.monthlyEmails !== Infinity && (
                                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-violet-500 rounded-full transition-all"
                                                        style={{ width: `${Math.min(100, ((userDetails.profile.emailsSentThisMonth || 0) / userDetails.limits.monthlyEmails) * 100)}%` }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => handleResetUsage(selectedUser!, "both")}
                                        className="mt-3 w-full py-2 bg-slate-50 dark:bg-[var(--bg-tertiary)] hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-[var(--border-default)] rounded-lg text-xs font-medium text-slate-600 dark:text-[var(--text-secondary)] transition-colors">
                                        Reset Usage Counters
                                    </button>
                                </div>

                                {/* Admin Actions */}
                                <div className={`${cardClass} p-5`}>
                                    <h4 className={`text-sm font-bold ${headingClass} mb-3`}>Admin Actions</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {!userDetails.profile.isSuperAdmin && (
                                            <button onClick={() => setConfirmAction({ type: "impersonate", userId: selectedUser!, label: `View app as ${userDetails.profile.email}? This creates a 1-hour session.` })}
                                                className="py-2 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/60 border border-orange-200 dark:border-orange-800 rounded-lg text-xs font-semibold text-orange-700 dark:text-orange-400 transition-colors col-span-2">
                                                👁 View as This User
                                            </button>
                                        )}
                                        {(userDetails.profile.status || "active") === "active" ? (
                                            <button onClick={() => setConfirmAction({ type: "suspend", userId: selectedUser!, label: "Suspend this user?" })}
                                                className="py-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 transition-colors">
                                                ⏸ Suspend
                                            </button>
                                        ) : (
                                            <button onClick={() => handleStatusChange(selectedUser!, "active")}
                                                className="py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 transition-colors">
                                                ✅ Reactivate
                                            </button>
                                        )}
                                        <button onClick={() => toggleAdmin({ profileId: selectedUser! as Id<"userProfiles">, isAdmin: !userDetails.profile.isAdmin })}
                                            className="py-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-400 transition-colors">
                                            {userDetails.profile.isAdmin ? "Remove Admin" : "Make Admin"}
                                        </button>
                                        <button onClick={() => setConfirmAction({ type: "delete", userId: selectedUser!, label: "Delete ALL data for this user? This cannot be undone." })}
                                            className="py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg text-xs font-semibold text-red-700 dark:text-red-400 transition-colors">
                                            🗑 Delete Data
                                        </button>
                                        {!userDetails.profile.isSuperAdmin ? (
                                            <button onClick={() => makeSuperAdminMut({ profileId: selectedUser! as Id<"userProfiles"> })}
                                                className="py-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 transition-colors">
                                                ⭐ Make Super Admin
                                            </button>
                                        ) : (
                                            <button onClick={() => revokeSuperAdminMut({ profileId: selectedUser! as Id<"userProfiles"> })}
                                                className="py-2 bg-slate-50 dark:bg-[var(--bg-tertiary)] hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-[var(--border-default)] rounded-lg text-xs font-semibold text-slate-600 dark:text-[var(--text-secondary)] transition-colors">
                                                Remove Super Admin
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Admin Notes */}
                                <div className={`${cardClass} p-5`}>
                                    <h4 className={`text-sm font-bold ${headingClass} mb-3`}>Admin Notes</h4>
                                    <div className="flex gap-2 mb-3">
                                        <input type="text" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Add a note…"
                                            className={`flex-1 ${inputClass} px-3`}
                                            onKeyDown={(e) => { if (e.key === "Enter") handleAddNote(selectedUser!); }} />
                                        <button onClick={() => handleAddNote(selectedUser!)}
                                            className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-semibold hover:bg-cyan-600 transition-colors">Add</button>
                                    </div>
                                    {userDetails.profile.notes && (
                                        <pre className={`text-xs ${bodyClass} bg-slate-50 dark:bg-[var(--bg-tertiary)] rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap font-sans`}>{userDetails.profile.notes}</pre>
                                    )}
                                </div>

                                {/* User Audit Trail */}
                                {auditLogs && auditLogs.length > 0 && (
                                    <div className={`${cardClass} p-5`}>
                                        <h4 className={`text-sm font-bold ${headingClass} mb-3`}>Activity for This User</h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {auditLogs.map((log: any) => {
                                                const config = actionLabels[log.action] || { label: log.action, icon: "📌", color: "text-slate-600 bg-slate-50 dark:bg-slate-800" };
                                                return (
                                                    <div key={log._id} className="flex items-center gap-2 py-1.5 border-b border-slate-50 dark:border-[var(--border-subtle)] last:border-0">
                                                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${config.color}`}>{config.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`text-xs text-slate-700 dark:text-[var(--text-primary)] truncate`}>{log.details}</div>
                                                            <div className={`text-[10px] ${mutedClass}`}>{formatTimestamp(log.timestamp)}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className={`${cardClass} p-5`}>
                                    <h4 className={`text-sm font-bold ${headingClass} mb-3`}>Metadata</h4>
                                    <div className="space-y-2 text-xs">
                                        {[
                                            { label: "User ID", value: userDetails.profile.userId, mono: true },
                                            { label: "Profile ID", value: userDetails.profile._id, mono: true },
                                            { label: "Created", value: new Date(userDetails.profile.createdAt).toLocaleString() },
                                            { label: "Last Login", value: userDetails.profile.lastLoginAt ? new Date(userDetails.profile.lastLoginAt).toLocaleString() : "Never" },
                                        ].map((item) => (
                                            <div key={item.label} className="flex justify-between">
                                                <span className={mutedClass}>{item.label}</span>
                                                <span className={`${bodyClass} ${item.mono ? "font-mono text-[10px]" : ""}`}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════ AUDIT LOG TAB ═══════════════════ */}
                {activeTab === "audit" && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Filters */}
                        <div className={`${cardClass} p-4 flex items-center gap-4`}>
                            <h2 className={`text-base font-bold ${headingClass}`}>Audit Trail</h2>
                            <select value={auditActionFilter} onChange={(e) => setAuditActionFilter(e.target.value)}
                                className={inputClass}>
                                <option value="all">All Actions</option>
                                <option value="tier_change">Tier Changes</option>
                                <option value="status_change">Status Changes</option>
                                <option value="admin_toggle">Admin Toggles</option>
                                <option value="super_admin_grant">Super Admin Grants</option>
                                <option value="super_admin_revoke">Super Admin Revokes</option>
                                <option value="usage_reset">Usage Resets</option>
                                <option value="data_deletion">Data Deletions</option>
                                <option value="note_added">Notes Added</option>
                                <option value="impersonation_start">Impersonation Starts</option>
                                <option value="impersonation_end">Impersonation Ends</option>
                            </select>
                            <span className={`text-xs ${mutedClass} ml-auto`}>{auditLogs?.length || 0} entries</span>
                        </div>

                        {/* Log Table */}
                        <div className={`${cardClass} overflow-hidden`}>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-[var(--bg-tertiary)] border-b border-slate-200 dark:border-[var(--border-default)]">
                                        <th className={`${tableHeaderClass} w-12`}>Type</th>
                                        <th className={tableHeaderClass}>Action</th>
                                        <th className={tableHeaderClass}>Details</th>
                                        <th className={tableHeaderClass}>Admin</th>
                                        <th className={tableHeaderClass}>Target</th>
                                        <th className={tableHeaderClass}>Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[var(--border-subtle)]">
                                    {auditLogs?.map((log: any) => {
                                        const config = actionLabels[log.action] || { label: log.action, icon: "📌", color: "text-slate-600 bg-slate-50 dark:bg-slate-800" };
                                        return (
                                            <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-[var(--bg-tertiary)] transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${config.color}`}>{config.icon}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${config.color}`}>{config.label}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className={`text-sm text-slate-700 dark:text-[var(--text-primary)] max-w-xs truncate`}>{log.details}</div>
                                                    {log.metadata && (
                                                        <div className={`text-[10px] ${mutedClass} font-mono mt-0.5 truncate max-w-xs`}>{log.metadata}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className={`text-xs ${bodyClass}`}>{log.actorEmail}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className={`text-xs ${bodyClass}`}>{log.targetEmail || "—"}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className={`text-xs ${bodyClass}`}>{formatTimestamp(log.timestamp)}</div>
                                                    <div className={`text-[10px] ${mutedClass}`}>{new Date(log.timestamp).toLocaleString()}</div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {(!auditLogs || auditLogs.length === 0) && (
                                <div className="p-16 text-center">
                                    <div className="text-4xl mb-3">📋</div>
                                    <div className={`${mutedClass} text-sm`}>No audit log entries yet</div>
                                    <div className={`text-slate-300 dark:text-slate-700 text-xs mt-1`}>Admin actions will appear here as they happen</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════════ SYSTEM TAB ═══════════════════ */}
                {activeTab === "system" && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className={`${cardClass} p-6`}>
                            <h2 className={`text-base font-bold ${headingClass} mb-4`}>Plan Configuration</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-[var(--bg-tertiary)]">
                                            <th className={tableHeaderClass}>Plan</th>
                                            <th className={tableHeaderClass}>Price</th>
                                            <th className={tableHeaderClass}>Daily Limit</th>
                                            <th className={tableHeaderClass}>Monthly Limit</th>
                                            <th className={tableHeaderClass}>Email Accounts</th>
                                            <th className={tableHeaderClass}>Users</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-[var(--border-subtle)]">
                                        {(["free", "starter", "professional", "enterprise"] as Tier[]).map((tier) => {
                                            const tc = tierConfig[tier];
                                            const limits = { free: { d: 30, m: 900, a: 1 }, starter: { d: 100, m: 3000, a: 3 }, professional: { d: 350, m: 10000, a: 10 }, enterprise: { d: "∞", m: "∞", a: "∞" } }[tier];
                                            return (
                                                <tr key={tier}>
                                                    <td className="px-4 py-3"><TierBadge tier={tier} /></td>
                                                    <td className={`px-4 py-3 text-sm font-medium ${headingClass}`}>{tc.price}</td>
                                                    <td className={`px-4 py-3 text-sm ${bodyClass}`}>{limits.d}</td>
                                                    <td className={`px-4 py-3 text-sm ${bodyClass}`}>{limits.m}</td>
                                                    <td className={`px-4 py-3 text-sm ${bodyClass}`}>{limits.a}</td>
                                                    <td className={`px-4 py-3 text-sm font-semibold ${headingClass}`}>{stats?.tierBreakdown?.[tier] || 0}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className={`${cardClass} p-6`}>
                                <h2 className={`text-base font-bold ${headingClass} mb-4`}>Platform Info</h2>
                                <div className="space-y-3">
                                    {[
                                        { label: "Environment", value: process.env.NODE_ENV || "development" },
                                        { label: "Version", value: "1.0.0" },
                                        { label: "Database", value: "Convex" },
                                        { label: "Auth", value: "Custom Email + Resend" },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-slate-50 dark:bg-[var(--bg-tertiary)] rounded-lg p-3 flex justify-between">
                                            <span className={`text-xs ${mutedClass}`}>{item.label}</span>
                                            <span className={`text-sm font-semibold ${headingClass}`}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`${cardClass} p-6`}>
                                <h2 className={`text-base font-bold ${headingClass} mb-4`}>Quick Setup</h2>
                                <div className="space-y-3">
                                    <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-xl">
                                        <h3 className="text-sm font-bold text-cyan-800 dark:text-cyan-300 mb-1">Create Super Admin</h3>
                                        <code className="text-xs text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/50 px-2 py-1 rounded">{`setupSuperAdmin({ email: "admin@domain.com" })`}</code>
                                        <p className="text-xs text-cyan-600 dark:text-cyan-500 mt-1">Run in Convex Dashboard → Functions</p>
                                    </div>
                                    <div className="p-4 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl">
                                        <h3 className="text-sm font-bold text-violet-800 dark:text-violet-300 mb-1">Migrate Users</h3>
                                        <code className="text-xs text-violet-700 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/50 px-2 py-1 rounded">{`migrateExistingUsers({})`}</code>
                                        <p className="text-xs text-violet-600 dark:text-violet-500 mt-1">Creates profiles for legacy users</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Confirmation Modal ─── */}
            {confirmAction && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className={`bg-white dark:bg-[var(--bg-primary)] rounded-2xl border border-slate-200 dark:border-[var(--border-default)] shadow-xl max-w-sm w-full p-6`}>
                        <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl ${confirmAction.type === "impersonate"
                            ? "bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800"
                            : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800"}`}>
                            {confirmAction.type === "impersonate" ? "👁" : "⚠️"}
                        </div>
                        <h3 className={`text-lg font-bold ${headingClass} text-center mb-2`}>Confirm Action</h3>
                        <p className={`text-sm ${bodyClass} text-center mb-6`}>{confirmAction.label}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmAction(null)}
                                className="flex-1 py-2.5 bg-slate-100 dark:bg-[var(--bg-tertiary)] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] transition-colors">Cancel</button>
                            <button onClick={() => {
                                if (confirmAction.type === "suspend") handleStatusChange(confirmAction.userId, "suspended");
                                if (confirmAction.type === "delete") handleDeleteData(confirmAction.userId);
                                if (confirmAction.type === "impersonate") handleStartImpersonation(confirmAction.userId);
                            }}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${confirmAction.type === "impersonate" ? "bg-orange-500 hover:bg-orange-600" : "bg-red-500 hover:bg-red-600"}`}>
                                {confirmAction.type === "impersonate" ? "Start Viewing" : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
