"use client";

import { useState, useCallback } from "react";

interface CsvImportModalProps {
    onImport: (contacts: { email: string; name?: string; company?: string; location?: string; phone?: string; website?: string; address?: string; tags?: string[] }[]) => void;
    onClose: () => void;
}

type FieldMapping = {
    email: number;
    name: number;
    company: number;
    location: number;
    phone: number;
    website: number;
    address: number;
};

const FIELDS: { key: keyof FieldMapping; label: string; required?: boolean }[] = [
    { key: "email", label: "Email", required: true },
    { key: "name", label: "Name" },
    { key: "company", label: "Company" },
    { key: "location", label: "Location" },
    { key: "phone", label: "Phone" },
    { key: "website", label: "Website" },
    { key: "address", label: "Address" },
];

export default function CsvImportModal({ onImport, onClose }: CsvImportModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [rawData, setRawData] = useState<string[][]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<FieldMapping>({
        email: -1, name: -1, company: -1, location: -1, phone: -1, website: -1, address: -1,
    });
    const [dragOver, setDragOver] = useState(false);

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

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 max-w-2xl w-full shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Import Contacts</h2>
                        <p className="text-sm text-[#9CA3AF]">
                            Step {step} of 3 — {step === 1 ? "Upload CSV" : step === 2 ? "Map Columns" : "Preview & Confirm"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-[#9CA3AF] hover:text-[#0f172a] dark:hover:text-white">✕</button>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-[#E5E7EB] dark:bg-slate-700">
                    <div
                        className="h-full bg-gradient-to-r from-[#0EA5E9] to-[#10B981] transition-all duration-500"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-6">
                    {/* Step 1: Upload */}
                    {step === 1 && (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragOver ? "border-[#0EA5E9] bg-[#0EA5E9]/5" : "border-[#E5E7EB] dark:border-slate-700 hover:border-[#9CA3AF] dark:hover:border-slate-500"
                                }`}
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-center text-3xl">
                                📄
                            </div>
                            <h3 className="text-lg font-semibold text-[#0f172a] dark:text-white mb-2">
                                Drop your CSV file here
                            </h3>
                            <p className="text-sm text-[#9CA3AF] mb-4">or click to browse</p>
                            <label className="inline-block px-6 py-3 bg-[#0f172a] dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium cursor-pointer hover:bg-[#0f172a]/90 dark:hover:bg-slate-100 transition-all">
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
                            <p className="text-xs text-[#9CA3AF] mt-4">
                                Supports .csv files with headers. First row must be column names.
                            </p>
                        </div>
                    )}

                    {/* Step 2: Column mapping */}
                    {step === 2 && (
                        <div>
                            <p className="text-sm text-[#9CA3AF] mb-4">
                                We detected {rawData.length} rows. Map your CSV columns to contact fields:
                            </p>
                            <div className="space-y-3">
                                {FIELDS.map(field => (
                                    <div key={field.key} className="flex items-center gap-4">
                                        <label className="w-28 text-sm font-medium text-[#4B5563] dark:text-slate-300">
                                            {field.label} {field.required && <span className="text-[#EF4444]">*</span>}
                                        </label>
                                        <select
                                            value={mapping[field.key]}
                                            onChange={(e) => setMapping({ ...mapping, [field.key]: parseInt(e.target.value) })}
                                            className={`flex-1 px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-[#0EA5E9] transition-all ${mapping[field.key] >= 0
                                                ? "bg-[#0EA5E9]/5 dark:bg-[#0EA5E9]/10 border-[#0EA5E9]/30 text-[#0f172a] dark:text-white"
                                                : "bg-[#f8fafc] dark:bg-slate-800 border-[#E5E7EB] dark:border-slate-700 text-[#9CA3AF]"
                                                }`}
                                        >
                                            <option value={-1}>— Skip —</option>
                                            {headers.map((h, i) => (
                                                <option key={i} value={i}>{h}</option>
                                            ))}
                                        </select>
                                        {mapping[field.key] >= 0 && (
                                            <span className="text-xs text-[#9CA3AF] w-32 truncate">
                                                e.g. &quot;{rawData[0]?.[mapping[field.key]] || ""}&quot;
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(1)} className="px-4 py-2.5 text-sm text-[#4B5563] dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-white transition-colors">
                                    ← Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={mapping.email < 0}
                                    className="px-5 py-2.5 bg-[#0f172a] dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-[#0f172a]/90 dark:hover:bg-slate-100 transition-all"
                                >
                                    Preview →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {step === 3 && (
                        <div>
                            <p className="text-sm text-[#9CA3AF] mb-4">
                                Preview of {Math.min(rawData.length, 8)} of {rawData.length} contacts to import:
                            </p>
                            <div className="overflow-x-auto border border-[#E5E7EB] dark:border-slate-700 rounded-xl">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#f8fafc] dark:bg-slate-800/50">
                                            {FIELDS.filter(f => mapping[f.key] >= 0).map(f => (
                                                <th key={f.key} className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] border-b border-[#E5E7EB] dark:border-slate-700">
                                                    {f.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rawData.slice(0, 8).map((row, i) => (
                                            <tr key={i} className="border-b border-[#F1F3F8] dark:border-slate-800 last:border-0">
                                                {FIELDS.filter(f => mapping[f.key] >= 0).map(f => (
                                                    <td key={f.key} className="px-3 py-2.5 text-[#0f172a] dark:text-white truncate max-w-[160px]">
                                                        {row[mapping[f.key]] || "—"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {rawData.length > 8 && (
                                <p className="text-xs text-[#9CA3AF] mt-2 text-center">
                                    + {rawData.length - 8} more contacts
                                </p>
                            )}
                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(2)} className="px-4 py-2.5 text-sm text-[#4B5563] dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-white transition-colors">
                                    ← Back
                                </button>
                                <button
                                    onClick={handleConfirmImport}
                                    className="px-6 py-2.5 bg-gradient-to-r from-[#0EA5E9] to-[#10B981] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#0EA5E9]/25 transition-all"
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
