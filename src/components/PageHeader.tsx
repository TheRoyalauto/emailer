"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle: string;
    actionLabel?: string;
    onAction?: () => void;
    actionClassName?: string;
    children?: ReactNode;
}

export function PageHeader({
    title,
    subtitle,
    actionLabel,
    onAction,
    actionClassName = "px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all",
    children,
}: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
                <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
            </div>
            {children ? (
                children
            ) : onAction && actionLabel ? (
                <button onClick={onAction} className={actionClassName}>
                    {actionLabel}
                </button>
            ) : null}
        </div>
    );
}
