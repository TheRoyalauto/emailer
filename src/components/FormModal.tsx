"use client";

import { ReactNode } from "react";

interface FormModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    onSubmit: () => void;
    submitLabel: string;
    submitDisabled?: boolean;
    children: ReactNode;
}

export function FormModal({
    open,
    onClose,
    title,
    onSubmit,
    submitLabel,
    submitDisabled,
    children,
}: FormModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">✕</button>
                </div>

                <div className="space-y-4">
                    {children}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={submitDisabled}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                        {submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
