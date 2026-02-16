"use client";

import { ReactNode } from "react";
import { AppHeader } from "@/components/AuthGuard";

interface PageWrapperProps {
    children: ReactNode;
    maxWidth?: "6xl" | "7xl";
    className?: string;
}

const MAX_WIDTH: Record<string, string> = {
    "6xl": "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6",
    "7xl": "max-w-7xl mx-auto px-4 py-6",
};

export function PageWrapper({ children, maxWidth = "6xl", className }: PageWrapperProps) {
    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0 ${className || ""}`}>
            <AppHeader />
            <main className={MAX_WIDTH[maxWidth]}>
                {children}
            </main>
        </div>
    );
}
