"use client";

import { useState, useCallback } from "react";

interface CsvImportModalProps {
    onImport: (contacts: { email: string; name?: string; company?: string; location?: string; phone?: string; website?: string; address?: string; tags?: string[] }[]) => void;
    onClose: () => void;
}

interface FieldMapping {
    email: number;
    name: number;
    company: number;
    location: number;
    phone: number;
    website: number;
    address: number;
}

const FIELDS: { key: keyof FieldMapping; label: string; required?: boolean }[] = [
    { key: "email", label: "Email", required: true },
    { key: "name", label: "Name" },
    { key: "company", label: "Company" },
    { key: "location", label: "Location" },
    { key: "phone", label: "Phone" },
    { key: "website", label: "Website" },
    { key: "address", label: "Address" },
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

export default function CsvImportModal({ onImport, onClose }: CsvImportModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [importMode, setImportMode] = useState<"csv" | "paste">("csv");
    const [rawData, setRawData] = useState<string[][]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<FieldMapping>({
        email: -1, name: -1, company: -1, location: -1, phone: -1, website: -1, address: -1,
    });
    const [dragOver, setDragOver] = useState(false);

    // Paste mode state
    const [pasteText, setPasteText] = useState("");
    const [extractedEmails, setExtractedEmails] = useState<string[]>([]);

    const parseCsv = useCallback((text: string) => {
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        const parsed: string[][] = [];

        for (const line of lines) {
            const row: string[] = [];
            let current = "";
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === "," && !inQuotes) {
                    row.push(current.trim());
                    current = "";
                } else {
                    current += char;
                }
            }
            row.push(current.trim());
            parsed.push(row);
        }

        return parsed;
    }, []);

    const autoDetectMapping = useCallback((hdrs: string[]) => {
        const m: FieldMapping = { email: -1, name: -1, company: -1, location: -1, phone: -1, website: -1, address: -1 };
        const lower = hdrs.map(h => h.toLowerCase().trim());

        for (let i = 0; i < lower.length; i++) {
            const h = lower[i];
            if (h.includes("email") || h.includes("e-mail")) m.email = i;
            else if (h === "name" || h.includes("full name") || h.includes("contact name")) m.name = i;
            else if (h.includes("company") || h.includes("organization") || h.includes("business")) m.company = i;
            else if (h.includes("location") || h.includes("city") || h.includes("region")) m.location = i;
            else if (h.includes("phone") || h.includes("tel") || h.includes("mobile")) m.phone = i;
            else if (h.includes("website") || h.includes("url") || h.includes("domain")) m.website = i;
            else if (h.includes("address") || h.includes("street")) m.address = i;
        }

        return m;
    }, []);

    const handleFile = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const parsed = parseCsv(text);
            if (parsed.length < 2) return;

            const hdrs = parsed[0];
            const data = parsed.slice(1).filter(row => row.some(cell => cell.trim()));

            setHeaders(hdrs);
            setRawData(data);
            setMapping(autoDetectMapping(hdrs));
            setStep(2);
        };
        reader.readAsText(file);
    }, [parseCsv, autoDetectMapping]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    // Extract emails from pasted text
    const handlePasteExtract = useCallback(() => {
        const matches = pasteText.match(EMAIL_REGEX) || [];
        const unique = [...new Set(matches.map(e => e.toLowerCase().trim()))];
        setExtractedEmails(unique);
    }, [pasteText]);

    const handlePasteImport = () => {
        const contacts = extractedEmails.map(email => ({ email }));
        onImport(contacts);
    };

    const removeExtractedEmail = (emailToRemove: string) => {
        setExtractedEmails(prev => prev.filter(e => e !== emailToRemove));
    };

    const handleConfirmImport = () => {
        if (mapping.email < 0) return;

        const contacts = rawData
            .map(row => ({
                email: row[mapping.email]?.trim() || "",
                name: mapping.name >= 0 ? row[mapping.name]?.trim() : undefined,
                company: mapping.company >= 0 ? row[mapping.company]?.trim() : undefined,
                location: mapping.location >= 0 ? row[mapping.location]?.trim() : undefined,
                phone: mapping.phone >= 0 ? row[mapping.phone]?.trim() : undefined,
                website: mapping.website >= 0 ? row[mapping.website]?.trim() : undefined,
                address: mapping.address >= 0 ? row[mapping.address]?.trim() : undefined,
            }))
            .filter(c => c.email && c.email.includes("@"));

        onImport(contacts);
    };

    const totalSteps = importMode === "csv" ? 3 : (extractedEmails.length > 0 ? 2 : 1);
    const currentStep = importMode === "paste" ? (extractedEmails.length > 0 ? 2 : 1) : step;
    const stepLabel = importMode === "csv"
        ? (step === 1 ? "Upload CSV" : step === 2 ? "Map Columns" : "Preview & Confirm")
        : (extractedEmails.length > 0 ? "Review Emails" : "Paste Emails");

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 max-w-2xl w-full shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import Contacts</h2>
                        <p className="text-sm text-gray-400">
                            Step {currentStep} of {totalSteps} — {stepLabel}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-slate-900 dark:hover:text-white">✕</button>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-gray-200 dark:bg-slate-700">
                    <div
                        className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>

                <div className="p-6">
                    {/* Step 1: Upload / Paste */}
                    {step === 1 && (
                        <div>
                            {/* Mode Tabs */}
                            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
                                <button
                                    onClick={() => { setImportMode("csv"); setExtractedEmails([]); }}
                                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${importMode === "csv"
                                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                        }`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Upload CSV
                                    </span>
                                </button>
                                <button
                                    onClick={() => { setImportMode("paste"); }}
                                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${importMode === "paste"
                                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                        }`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Paste Emails
                                    </span>
                                </button>
                            </div>

                            {importMode === "csv" && (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragOver ? "border-sky-500 bg-sky-500/5" : "border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500"
                                        }`}
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-3xl">
                                        📄
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                        Drop your CSV file here
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-4">or click to browse</p>
                                    <label className="inline-block px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium cursor-pointer hover:bg-slate-900/90 dark:hover:bg-slate-100 transition-all">
                                        Choose File
                                        <input
                                            type="file"
                                            accept=".csv,.txt"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFile(file);
                                            }}
                                        />
                                    </label>
                                    <p className="text-xs text-gray-400 mt-4">
                                        Supports .csv files with headers. First row must be column names.
                                    </p>
                                </div>
                            )}

                            {importMode === "paste" && extractedEmails.length === 0 && (
                                <div>
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Paste any text containing emails</h3>
                                                    <p className="text-xs text-slate-400">We&apos;ll auto-detect all valid email addresses</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        const text = await navigator.clipboard.readText();
                                                        if (text) setPasteText(prev => prev ? prev + "\n" + text : text);
                                                    } catch { /* clipboard denied */ }
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-all active:scale-95 shrink-0"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                Paste from Clipboard
                                            </button>
                                        </div>
                                        <textarea
                                            value={pasteText}
                                            onChange={(e) => setPasteText(e.target.value)}
                                            maxLength={15000}
                                            className="w-full h-48 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all resize-none font-mono"
                                            placeholder={"Paste emails here — any format works:\n\njohn@example.com\nJane Doe <jane@company.com>\njohn@acme.com, sarah@startup.io\nName: Bob, Email: bob@business.org\n\nOr paste a whole spreadsheet, email list, or any text..."}
                                        />
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-slate-400">
                                                {pasteText ? `${(pasteText.match(EMAIL_REGEX) || []).length} emails detected` : "Supports any format — comma-separated, line-separated, or mixed text"}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                {pasteText && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPasteText("")}
                                                        className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                                <p className="text-xs text-slate-400">
                                                    {pasteText.length.toLocaleString()} / 15,000
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handlePasteExtract}
                                            disabled={!pasteText || !(pasteText.match(EMAIL_REGEX) || []).length}
                                            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-slate-900/90 dark:hover:bg-slate-100 transition-all active:scale-[0.98]"
                                        >
                                            Extract Emails →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {importMode === "paste" && extractedEmails.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{extractedEmails.length} unique emails found</h3>
                                                <p className="text-xs text-slate-400">Remove any you don&apos;t want, then import</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setExtractedEmails([])}
                                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                        >
                                            ← Re-paste
                                        </button>
                                    </div>

                                    <div className="max-h-72 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                                        {extractedEmails.map((email, i) => (
                                            <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0">
                                                        {email[0]}
                                                    </div>
                                                    <span className="text-sm text-slate-900 dark:text-white font-mono">{email}</span>
                                                </div>
                                                <button
                                                    onClick={() => removeExtractedEmail(email)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                                                    title="Remove"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between mt-6">
                                        <button onClick={() => setExtractedEmails([])} className="px-4 py-2.5 text-sm text-gray-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                            ← Back
                                        </button>
                                        <button
                                            onClick={handlePasteImport}
                                            disabled={extractedEmails.length === 0}
                                            className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-sky-500/25 transition-all active:scale-[0.98] disabled:opacity-40"
                                        >
                                            Import {extractedEmails.length} Contact{extractedEmails.length !== 1 ? "s" : ""}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Column mapping (CSV only) */}
                    {step === 2 && (
                        <div>
                            <p className="text-sm text-gray-400 mb-4">
                                We detected {rawData.length} rows. Map your CSV columns to contact fields:
                            </p>
                            <div className="space-y-3">
                                {FIELDS.map(field => (
                                    <div key={field.key} className="flex items-center gap-4">
                                        <label className="w-28 text-sm font-medium text-gray-600 dark:text-slate-300">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <select
                                            value={mapping[field.key]}
                                            onChange={(e) => setMapping({ ...mapping, [field.key]: parseInt(e.target.value) })}
                                            className={`flex-1 px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-sky-500 transition-all ${mapping[field.key] >= 0
                                                ? "bg-sky-500/5 dark:bg-sky-500/10 border-sky-500/30 text-slate-900 dark:text-white"
                                                : "bg-slate-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400"
                                                }`}
                                        >
                                            <option value={-1}>— Skip —</option>
                                            {headers.map((h, i) => (
                                                <option key={i} value={i}>{h}</option>
                                            ))}
                                        </select>
                                        {mapping[field.key] >= 0 && (
                                            <span className="text-xs text-gray-400 w-32 truncate">
                                                e.g. &quot;{rawData[0]?.[mapping[field.key]] || ""}&quot;
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(1)} className="px-4 py-2.5 text-sm text-gray-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    ← Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={mapping.email < 0}
                                    className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-slate-900/90 dark:hover:bg-slate-100 transition-all"
                                >
                                    Preview →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview (CSV only) */}
                    {step === 3 && (
                        <div>
                            <p className="text-sm text-gray-400 mb-4">
                                Preview of {Math.min(rawData.length, 8)} of {rawData.length} contacts to import:
                            </p>
                            <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-xl">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                                            {FIELDS.filter(f => mapping[f.key] >= 0).map(f => (
                                                <th key={f.key} className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-200 dark:border-slate-700">
                                                    {f.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rawData.slice(0, 8).map((row, i) => (
                                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                {FIELDS.filter(f => mapping[f.key] >= 0).map(f => (
                                                    <td key={f.key} className="px-3 py-2.5 text-slate-900 dark:text-white truncate max-w-[160px]">
                                                        {row[mapping[f.key]] || "—"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {rawData.length > 8 && (
                                <p className="text-xs text-gray-400 mt-2 text-center">
                                    + {rawData.length - 8} more contacts
                                </p>
                            )}
                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(2)} className="px-4 py-2.5 text-sm text-gray-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    ← Back
                                </button>
                                <button
                                    onClick={handleConfirmImport}
                                    className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-sky-500/25 transition-all"
                                >
                                    Import {rawData.filter(r => r[mapping.email]?.includes("@")).length} Contacts
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
