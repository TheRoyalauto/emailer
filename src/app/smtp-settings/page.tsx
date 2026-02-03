"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { Id } from "@/../convex/_generated/dataModel";

// Preset SMTP configurations
const SMTP_PRESETS = [
    { name: "Gmail", host: "smtp.gmail.com", port: 587, secure: false },
    { name: "Outlook", host: "smtp-mail.outlook.com", port: 587, secure: false },
    { name: "Yahoo", host: "smtp.mail.yahoo.com", port: 587, secure: false },
    { name: "iCloud", host: "smtp.mail.me.com", port: 587, secure: false },
    { name: "Zoho", host: "smtp.zoho.com", port: 587, secure: false },
    { name: "SendGrid", host: "smtp.sendgrid.net", port: 587, secure: false },
    { name: "Mailgun", host: "smtp.mailgun.org", port: 587, secure: false },
    { name: "Custom", host: "", port: 587, secure: false },
];

function SMTPSettingsPage() {
    const configs = useQuery(api.smtpConfigs.list);
    const createConfig = useMutation(api.smtpConfigs.create);
    const setDefault = useMutation(api.smtpConfigs.setDefault);
    const removeConfig = useMutation(api.smtpConfigs.remove);

    const [showAdd, setShowAdd] = useState(false);
    const [testing, setTesting] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Form state
    const [preset, setPreset] = useState("Gmail");
    const [name, setName] = useState("Gmail");
    const [host, setHost] = useState("smtp.gmail.com");
    const [port, setPort] = useState(587);
    const [secure, setSecure] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fromEmail, setFromEmail] = useState("");
    const [fromName, setFromName] = useState("");
    const [makeDefault, setMakeDefault] = useState(true);

    const handlePresetChange = (presetName: string) => {
        setPreset(presetName);
        const p = SMTP_PRESETS.find((x) => x.name === presetName);
        if (p) {
            setName(p.name);
            setHost(p.host);
            setPort(p.port);
            setSecure(p.secure);
        }
    };

    const handleCreate = async () => {
        if (!host || !username || !password || !fromEmail) return;
        await createConfig({
            name,
            host,
            port,
            secure,
            username,
            password,
            fromEmail,
            fromName: fromName || undefined,
            isDefault: makeDefault,
        });
        setShowAdd(false);
        resetForm();
    };

    const resetForm = () => {
        setPreset("Gmail");
        setName("Gmail");
        setHost("smtp.gmail.com");
        setPort(587);
        setSecure(false);
        setUsername("");
        setPassword("");
        setFromEmail("");
        setFromName("");
        setMakeDefault(true);
    };

    const handleTest = async (configId: Id<"smtpConfigs">) => {
        setTesting(configId);
        setTestResult(null);

        try {
            const response = await fetch("/api/test-smtp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ configId }),
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
        <div className="min-h-screen bg-[#0a0a0f] pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            SMTP Settings
                        </h1>
                        <p className="text-white/50 mt-1">Configure email sending credentials</p>
                    </div>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium"
                    >
                        + Add SMTP
                    </button>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-6">
                    <h3 className="font-medium text-indigo-400 mb-2">🔐 Why SMTP Credentials?</h3>
                    <p className="text-sm text-white/60">
                        Store your email credentials securely to send campaigns without entering them every time.
                        For Gmail, use an <strong>App Password</strong> (not your main password).
                    </p>
                </div>

                {/* Configs List */}
                {configs === undefined ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : configs.length === 0 ? (
                    <div className="text-center py-16 bg-[#12121f] rounded-xl border border-white/10">
                        <div className="text-5xl mb-4">📧</div>
                        <h2 className="text-xl font-semibold mb-2">No SMTP Configured</h2>
                        <p className="text-white/50 mb-4">Add your email credentials to start sending</p>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg"
                        >
                            Add SMTP Configuration
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {configs.map((config) => (
                            <div
                                key={config._id}
                                className={`bg-[#12121f] rounded-xl border p-5 ${config.isDefault ? "border-indigo-500/50" : "border-white/10"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{config.name}</h3>
                                            {config.isDefault && (
                                                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-white/50 mt-1">
                                            {config.host}:{config.port} ({config.secure ? "SSL" : "TLS"})
                                        </div>
                                        <div className="text-sm text-white/40 mt-1">
                                            From: {config.fromName ? `${config.fromName} <${config.fromEmail}>` : config.fromEmail}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleTest(config._id)}
                                            disabled={testing === config._id}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm transition-colors"
                                        >
                                            {testing === config._id ? "Testing..." : "Test"}
                                        </button>
                                        {!config.isDefault && (
                                            <button
                                                onClick={() => setDefault({ id: config._id })}
                                                className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm"
                                            >
                                                Set Default
                                            </button>
                                        )}
                                        <button
                                            onClick={() => removeConfig({ id: config._id })}
                                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                {testResult && testing === null && (
                                    <div className={`mt-3 p-2 rounded text-sm ${testResult.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                        }`}>
                                        {testResult.message}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Gmail App Password Guide */}
                <div className="mt-8 bg-[#12121f] rounded-xl border border-white/10 p-6">
                    <h3 className="font-semibold mb-3">📱 Gmail App Password Instructions</h3>
                    <ol className="space-y-2 text-sm text-white/60">
                        <li>1. Go to <span className="text-indigo-400">myaccount.google.com</span></li>
                        <li>2. Enable 2-Factor Authentication if not already enabled</li>
                        <li>3. Go to Security → 2-Step Verification → App passwords</li>
                        <li>4. Generate a new app password for "Mail"</li>
                        <li>5. Use that 16-character password here (not your Gmail password)</li>
                    </ol>
                </div>
            </main>

            {/* Add Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#12121f] rounded-2xl border border-white/10 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Add SMTP Configuration</h2>

                        <div className="space-y-4">
                            {/* Preset Selector */}
                            <div>
                                <label className="text-sm text-white/50 mb-1 block">Email Provider</label>
                                <select
                                    value={preset}
                                    onChange={(e) => handlePresetChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                >
                                    {SMTP_PRESETS.map((p) => (
                                        <option key={p.name} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {preset === "Custom" && (
                                <>
                                    <div>
                                        <label className="text-sm text-white/50 mb-1 block">Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                            placeholder="My SMTP Server"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-white/50 mb-1 block">Host</label>
                                            <input
                                                type="text"
                                                value={host}
                                                onChange={(e) => setHost(e.target.value)}
                                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                                placeholder="smtp.example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-white/50 mb-1 block">Port</label>
                                            <input
                                                type="number"
                                                value={port}
                                                onChange={(e) => setPort(parseInt(e.target.value))}
                                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={secure}
                                            onChange={(e) => setSecure(e.target.checked)}
                                            className="w-4 h-4 rounded"
                                        />
                                        <span className="text-sm text-white/60">Use SSL (port 465)</span>
                                    </label>
                                </>
                            )}

                            <div>
                                <label className="text-sm text-white/50 mb-1 block">Email / Username</label>
                                <input
                                    type="email"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        if (!fromEmail) setFromEmail(e.target.value);
                                    }}
                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-white/50 mb-1 block">
                                    Password {preset === "Gmail" && "(App Password)"}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                    placeholder="••••••••••••"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-white/50 mb-1 block">From Email</label>
                                <input
                                    type="email"
                                    value={fromEmail}
                                    onChange={(e) => setFromEmail(e.target.value)}
                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-white/50 mb-1 block">From Name (optional)</label>
                                <input
                                    type="text"
                                    value={fromName}
                                    onChange={(e) => setFromName(e.target.value)}
                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                    placeholder="Your Name or Company"
                                />
                            </div>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={makeDefault}
                                    onChange={(e) => setMakeDefault(e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-white/60">Set as default for sending</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => { setShowAdd(false); resetForm(); }}
                                className="px-4 py-2 bg-white/10 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!host || !username || !password || !fromEmail}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium disabled:opacity-50"
                            >
                                Save Configuration
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
