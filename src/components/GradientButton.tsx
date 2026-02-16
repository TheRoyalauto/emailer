"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
    primary:
        "px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all disabled:opacity-50",
    secondary:
        "px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-medium transition-all disabled:opacity-50",
    danger:
        "px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-all disabled:opacity-50",
};

export function GradientButton({
    variant = "primary",
    children,
    className,
    ...props
}: GradientButtonProps) {
    return (
        <button
            className={className || VARIANTS[variant]}
            {...props}
        >
            {children}
        </button>
    );
}
