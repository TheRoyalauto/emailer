"use client";

import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { Id } from "@/../convex/_generated/dataModel";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";

// Preset SMTP configurations
const SMTP_PRESETS = [
    { name: "Gmail", host: "smtp.gmail.com", port: 587, secure: false },
    { name: "Outlook", host: "smtp-mail.outlook.com", port: 587, secure: false },
    { name: "Yahoo", host: "smtp.mail.yahoo.com", port: 587, secure: false },
    { name: "iCloud", host: "smtp.mail.me.com", port: 587, secure: false },
    { name: "Zoho", host: "smtp.zoho.com", port: 587, secure: false },
    { name: "Private Email", host: "mail.privateemail.com", port: 587, secure: false },
    { name: "SendGrid", host: "smtp.sendgrid.net", port: 587, secure: false },
    { name: "Mailgun", host: "smtp.mailgun.org", port: 587, secure: false },
    { name: "Custom", host: "", port: 587, secure: false },
];

function SMTPSettingsPage() {
    const configs = useAuthQuery(api.smtpConfigs.list);
    const createConfig = useAuthMutation(api.smtpConfigs.create);
    const updateConfig = useAuthMutation(api.smtpConfigs.update);
    const setDefault = useAuthMutation(api.smtpConfigs.setDefault);
    const removeConfig = useAuthMutation(api.smtpConfigs.remove);

    const [showAdd, setShowAdd] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [testing, setTesting] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editFromEmail, setEditFromEmail] = useState("");
    const [editFromName, setEditFromName] = useState("");
    const [editHost, setEditHost] = useState("");
    const [editPort, setEditPort] = useState(587);
    const [editSecure, setEditSecure] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [editPassword, setEditPassword] = useState("");

    // Form state
    const [preset, setPreset] = useState("");
    const [host, setHost] = useState("");
    const [port, setPort] = useState(587);
    const [secure, setSecure] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fromEmail, setFromEmail] = useState("");
    const [fromEmailManual, setFromEmailManual] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [makeDefault, setMakeDefault] = useState(true);

    const handlePresetChange = (presetName: string) => {
        setPreset(presetName);
        const presetConfig = SMTP_PRESETS.find(p => p.name === presetName);
        if (presetConfig) {
            setHost(presetConfig.host);
            setPort(presetConfig.port);
            setSecure(presetConfig.secure);
        }
    };

    const handleCreate = async () => {
        await createConfig({
            name: displayName || preset || "SMTP Config",
            host,
            port,
            secure,
            username,
            password,
            fromEmail: fromEmail || username,
            fromName: displayName,
            isDefault: makeDefault,
        });
        setShowAdd(false);
        resetForm();
    };

    const resetForm = () => {
        setPreset("");
        setHost("");
        setPort(587);
        setSecure(false);
        setUsername("");
        setPassword("");
        setFromEmail("");
        setFromEmailManual(false);
        setDisplayName("");
        setMakeDefault(true);
        setWizardStep(1);
    };

    const startEdit = (config: NonNullable<typeof configs>[number]) => {
        setEditingId(config._id);
        setEditName(config.name || "");
        setEditFromEmail(config.fromEmail || "");
        setEditFromName(config.fromName || "");
        setEditHost(config.host || "");
        setEditPort(config.port || 587);
        setEditSecure(config.secure || false);
        setEditUsername(config.username || "");
        setEditPassword(config.password || "");
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        await updateConfig({
            id: editingId as Id<"smtpConfigs">,
            name: editName,
            fromEmail: editFromEmail,
            fromName: editFromName,
            host: editHost,
            port: editPort,
            secure: editSecure,
            username: editUsername,
            password: editPassword || undefined,
        });
        setEditingId(null);
    };

    const handleTest = async (configId: Id<"smtpConfigs">) => {
        setTesting(configId);
        setTestResult(null);

        const config = configs?.find(c => c._id === configId);
        if (!config) {
            setTestResult({ success: false, message: "Config not found" });
            setTesting(null);
            return;
        }

        try {
            const response = await fetch("/api/test-smtp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    configId,
                    host: config.host,
                    port: config.port,
                    secure: config.secure,
                    user: config.username,
                    pass: config.password,
                    from: config.fromEmail,
                    fromName: config.fromName,
                }),
            });
            const data = await response.json();
            setTestResult(data);
        } catch (error) {
            setTestResult({ success: false, message: "Test failed" });
        } finally {
            setTesting(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.03em]">
                                Email Accounts
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Manage your SMTP sending accounts</p>
                        </div>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-[0.98]"
                        >
                            + Add Account
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Total Accounts", value: configs?.length ?? 0, icon: "📧", color: "text-violet-500" },
                        { label: "Default Account", value: configs?.find(c => c.isDefault)?.name ?? "None", icon: "⭐", color: "text-amber-500" },
                        { label: "Ready to Send", value: configs?.length ?? 0, icon: "✅", color: "text-emerald-500" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-lg">
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className={`text-lg font-bold font-heading tracking-[-0.03em] ${stat.color}`}>
                                        {typeof stat.value === 'number' ? stat.value : stat.value}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Accounts Grid */}
                {configs === undefined ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
                    </div>
                ) : configs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl">
                            📧
                        </div>
                        <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-2">No Email Accounts Yet</h2>
                        <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                            Connect your email accounts to start sending campaigns. We support Gmail, Outlook, Yahoo, and more.
                        </p>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-[0.98]"
                        >
                            + Add Your First Account
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {configs.map((config) => (
                            <div
                                key={config._id}
                                onClick={() => startEdit(config)}
                                className={`group bg-white dark:bg-slate-900 rounded-xl border overflow-hidden transition-all hover:shadow-lg cursor-pointer ${config.isDefault
                                    ? "border-cyan-300 dark:border-cyan-800 shadow-sm"
                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                    }`}
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold ${config.isDefault
                                                ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                                }`}>
                                                {config.fromName?.charAt(0).toUpperCase() || config.name?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                                    {config.name}
                                                    {config.isDefault && (
                                                        <span className="px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 text-[10px] rounded-full font-semibold uppercase tracking-wider">
                                                            Default
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-0.5">{config.fromEmail}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/50 rounded-full">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Ready</span>
                                            </div>
                                            <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-4 font-mono text-xs text-slate-400">
                                        {config.host}:{config.port} • {config.secure ? "SSL" : "TLS"}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleTest(config._id); }}
                                            disabled={testing === config._id}
                                            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 font-medium transition-all disabled:opacity-50"
                                        >
                                            {testing === config._id ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                                    Testing…
                                                </span>
                                            ) : "🔌 Test Connection"}
                                        </button>
                                        {!config.isDefault && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDefault({ id: config._id }); }}
                                                className="px-3 py-2 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 rounded-lg text-xs font-semibold hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors"
                                            >
                                                ⭐ Default
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeConfig({ id: config._id }); }}
                                            className="px-3 py-2 bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-200 dark:border-red-900/50 rounded-lg text-xs hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    {testResult && testing === null && (
                                        <div className={`mt-3 p-3 rounded-lg text-xs font-medium ${testResult.success
                                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                            : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                                            }`}>
                                            {testResult.success ? "✅ " : "❌ "}{testResult.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setShowAdd(true)}
                            className="group p-8 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-800 transition-all hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 flex flex-col items-center justify-center gap-3 min-h-[200px]"
                        >
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/50 flex items-center justify-center text-xl transition-all text-slate-400 group-hover:text-cyan-500">
                                +
                            </div>
                            <span className="text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 font-medium text-sm transition-colors">Add Another Account</span>
                        </button>
                    </div>
                )}
            </main>

            {/* Add Account Wizard Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowAdd(false); resetForm(); }}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Progress Bar */}
                        <div className="flex border-b border-slate-200 dark:border-slate-700">
                            {[{ n: 1, l: "Provider" }, { n: 2, l: "Setup" }, { n: 3, l: "Credentials" }, { n: 4, l: "Finish" }].map((step) => (
                                <div
                                    key={step.n}
                                    className={`flex-1 py-3 text-center text-xs font-semibold transition-all ${wizardStep === step.n
                                        ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500"
                                        : wizardStep > step.n
                                            ? "text-slate-500 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400"
                                            : "text-slate-300 dark:text-slate-600"
                                        }`}
                                >
                                    {step.l}
                                </div>
                            ))}
                        </div>

                        <div className="p-6">
                            {/* Step 1: Choose Provider */}
                            {wizardStep === 1 && (
                                <div>
                                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-1">Choose Your Email Provider</h2>
                                    <p className="text-slate-400 text-sm mb-6">Select your email service to auto-configure settings</p>

                                    <div className="grid grid-cols-3 gap-3">
                                        {SMTP_PRESETS.map((p) => (
                                            <button
                                                key={p.name}
                                                onClick={() => {
                                                    handlePresetChange(p.name);
                                                    const needsInstructions = ["Gmail", "Yahoo", "iCloud"].includes(p.name);
                                                    setWizardStep(needsInstructions ? 2 : 3);
                                                }}
                                                className={`p-3.5 rounded-xl border text-center transition-all hover:scale-[1.02] ${preset === p.name
                                                    ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/50"
                                                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                                                    }`}
                                            >
                                                <div className="text-xl mb-1.5">
                                                    {p.name === "Gmail" && "📧"}
                                                    {p.name === "Outlook" && "📬"}
                                                    {p.name === "Yahoo" && "📨"}
                                                    {p.name === "iCloud" && "☁️"}
                                                    {p.name === "Zoho" && "📋"}
                                                    {p.name === "Private Email" && "📩"}
                                                    {p.name === "SendGrid" && "📤"}
                                                    {p.name === "Mailgun" && "🔫"}
                                                    {p.name === "Custom" && "⚙️"}
                                                </div>
                                                <div className="font-medium text-xs text-slate-700 dark:text-slate-300">{p.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Provider Setup Instructions */}
                            {wizardStep === 2 && (
                                <div>
                                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-1">📱 {preset} Setup Required</h2>
                                    <p className="text-slate-400 text-sm mb-6">
                                        {preset} requires an App Password for security. Follow these steps:
                                    </p>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                                        <ol className="space-y-3 text-sm">
                                            {preset === "Gmail" && (
                                                <>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                                                        <span className="text-slate-600 dark:text-slate-300">Go to <a href="https://myaccount.google.com" target="_blank" className="text-cyan-500 hover:underline">myaccount.google.com</a></span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                                                        <span className="text-slate-600 dark:text-slate-300">Enable 2-Factor Authentication if not already enabled</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                                                        <span className="text-slate-600 dark:text-slate-300">Go to Security → 2-Step Verification → App passwords</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                                                        <span className="text-slate-600 dark:text-slate-300">Generate a new app password for &quot;Mail&quot;</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                                                        <span className="text-slate-600 dark:text-slate-300">Use that <strong className="text-emerald-500">16-character password</strong> in the next step</span>
                                                    </li>
                                                </>
                                            )}
                                            {preset === "Yahoo" && (
                                                <>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                                                        <span className="text-slate-600 dark:text-slate-300">Go to <a href="https://login.yahoo.com/account/security" target="_blank" className="text-cyan-500 hover:underline">Yahoo Account Security</a></span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                                                        <span className="text-slate-600 dark:text-slate-300">Click &quot;Generate app password&quot;</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                                                        <span className="text-slate-600 dark:text-slate-300">Select &quot;Other App&quot; and enter a name</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                                                        <span className="text-slate-600 dark:text-slate-300">Use that app password in the next step</span>
                                                    </li>
                                                </>
                                            )}
                                            {preset === "iCloud" && (
                                                <>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                                                        <span className="text-slate-600 dark:text-slate-300">Go to <a href="https://appleid.apple.com" target="_blank" className="text-cyan-500 hover:underline">appleid.apple.com</a></span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                                                        <span className="text-slate-600 dark:text-slate-300">Sign in and go to Security section</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                                                        <span className="text-slate-600 dark:text-slate-300">Click &quot;Generate Password&quot; under App-Specific Passwords</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                                                        <span className="text-slate-600 dark:text-slate-300">Use that app password in the next step</span>
                                                    </li>
                                                </>
                                            )}
                                        </ol>
                                    </div>

                                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs text-amber-700 dark:text-amber-400 font-medium">
                                        ⚠️ Never use your main {preset} password. App passwords are safer and can be revoked anytime.
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Login Credentials */}
                            {wizardStep === 3 && (
                                <div>
                                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-1">Enter Your Login</h2>
                                    <p className="text-slate-400 text-sm mb-6">
                                        {preset === "Gmail"
                                            ? "Use an App Password (not your Gmail password)"
                                            : `Enter your ${preset || "email"} credentials`
                                        }
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">Email Address</label>
                                            <input
                                                type="email"
                                                value={username}
                                                onChange={(e) => {
                                                    setUsername(e.target.value);
                                                    if (!fromEmailManual) setFromEmail(e.target.value);
                                                }}
                                                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                                placeholder="your@email.com"
                                                autoFocus
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">
                                                {["Gmail", "Yahoo", "iCloud"].includes(preset) ? "App Password" : "Password"}
                                            </label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                                placeholder={["Gmail", "Yahoo", "iCloud"].includes(preset) ? "xxxx xxxx xxxx xxxx" : "••••••••"}
                                            />
                                        </div>

                                        {preset === "Custom" && (
                                            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">SMTP Server</label>
                                                        <input
                                                            type="text"
                                                            value={host}
                                                            onChange={(e) => setHost(e.target.value)}
                                                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                                            placeholder="smtp.example.com"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">Port</label>
                                                        <input
                                                            type="number"
                                                            value={port}
                                                            onChange={(e) => setPort(parseInt(e.target.value))}
                                                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <label className="flex items-center gap-2.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={secure}
                                                        onChange={(e) => setSecure(e.target.checked)}
                                                        className="w-4 h-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500/30"
                                                    />
                                                    <span className="text-sm text-slate-600 dark:text-slate-300">Use SSL (port 465)</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Display Name */}
                            {wizardStep === 4 && (
                                <div>
                                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-1">Almost Done!</h2>
                                    <p className="text-slate-400 text-sm mb-6">How should your name appear in emails?</p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">From Email</label>
                                            <input
                                                type="email"
                                                value={fromEmail}
                                                onChange={(e) => {
                                                    setFromEmail(e.target.value);
                                                    setFromEmailManual(true);
                                                }}
                                                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                                placeholder={username || "your@email.com"}
                                            />
                                            <p className="text-[11px] text-slate-400 mt-1">Leave same as login email, or set a different From address</p>
                                        </div>

                                        <div>
                                            <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5 font-medium">Display Name <span className="relative group"><svg className="w-3.5 h-3.5 text-slate-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">This is the name your recipients will see in their inbox</span></span></label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                                placeholder="Your Name or Company"
                                                autoFocus
                                            />
                                            <p className="text-[11px] text-slate-400 mt-2">
                                                Recipients will see: {displayName || "Your Name"} &lt;{fromEmail || "your@email.com"}&gt;
                                            </p>
                                        </div>

                                        <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 rounded-xl">
                                            <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-2 uppercase tracking-wider">Account Summary</div>
                                            <div className="space-y-1 text-sm text-slate-500">
                                                <div>Provider: <span className="text-slate-900 dark:text-white font-medium">{preset || "Custom"}</span></div>
                                                <div>Email: <span className="text-slate-900 dark:text-white font-medium">{username}</span></div>
                                                <div>Server: <span className="text-slate-900 dark:text-white font-medium">{host}:{port}</span></div>
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={makeDefault}
                                                onChange={(e) => setMakeDefault(e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500/30"
                                            />
                                            <div>
                                                <div className="font-medium text-sm text-slate-900 dark:text-white">Set as default account</div>
                                                <div className="text-[11px] text-slate-400">Use this account for new campaigns</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer with Navigation */}
                        <div className="flex justify-between items-center p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                            <button
                                onClick={() => {
                                    if (wizardStep === 1) {
                                        setShowAdd(false);
                                        resetForm();
                                    } else if (wizardStep === 3) {
                                        const needsInstructions = ["Gmail", "Yahoo", "iCloud"].includes(preset);
                                        setWizardStep(needsInstructions ? 2 : 1);
                                    } else {
                                        setWizardStep(wizardStep - 1);
                                    }
                                }}
                                className="px-4 py-2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm font-medium transition-colors"
                            >
                                {wizardStep === 1 ? "Cancel" : "← Back"}
                            </button>

                            {wizardStep < 4 ? (
                                <button
                                    onClick={() => setWizardStep(wizardStep + 1)}
                                    disabled={wizardStep === 3 && (!username || !password)}
                                    className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue →
                                </button>
                            ) : (
                                <button
                                    onClick={handleCreate}
                                    disabled={!host || !username || !password || !fromEmail}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ✓ Add Account
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Account Modal */}
            {editingId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingId(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Edit Email Account</h2>
                                    <p className="text-sm text-slate-400 mt-0.5">Update your account settings</p>
                                </div>
                                <button onClick={() => setEditingId(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>
                                <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">Nickname</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                    placeholder="e.g. Gmail Business"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">From Email</label>
                                    <input
                                        type="email"
                                        value={editFromEmail}
                                        onChange={(e) => setEditFromEmail(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5 font-medium">Display Name <span className="relative group"><svg className="w-3.5 h-3.5 text-slate-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">This is the name your recipients will see in their inbox</span></span></label>
                                    <input
                                        type="text"
                                        value={editFromName}
                                        onChange={(e) => setEditFromName(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Server Settings</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">SMTP Host</label>
                                        <input
                                            type="text"
                                            value={editHost}
                                            onChange={(e) => setEditHost(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                            placeholder="smtp.example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">Port</label>
                                        <input
                                            type="number"
                                            value={editPort}
                                            onChange={(e) => setEditPort(parseInt(e.target.value))}
                                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2.5 cursor-pointer mt-3">
                                    <input
                                        type="checkbox"
                                        checked={editSecure}
                                        onChange={(e) => setEditSecure(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500/30"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-300">Use SSL (port 465)</span>
                                </label>
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Credentials</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">Username</label>
                                        <input
                                            type="text"
                                            value={editUsername}
                                            onChange={(e) => setEditUsername(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">Password</label>
                                        <input
                                            type="password"
                                            value={editPassword}
                                            onChange={(e) => setEditPassword(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                            <button
                                onClick={() => setEditingId(null)}
                                className="px-4 py-2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={!editName || !editFromEmail || !editHost}
                                className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SMTPSettingsWrapper() {
    return (
        <AuthGuard>
            <SMTPSettingsPage />
        </AuthGuard>
    );
}
