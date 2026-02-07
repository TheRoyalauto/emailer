"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ReactNode } from "react";

// NEXT_PUBLIC_* vars are inlined at BUILD time in Next.js
// Hardcoded fallback ensures production always connects even if env var is missing
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://fearless-kookabura-668.convex.cloud";

if (typeof window !== "undefined") {
    console.log("[ConvexClient] URL:", CONVEX_URL, "| env:", process.env.NEXT_PUBLIC_CONVEX_URL || "NOT SET");
}

const convex = new ConvexReactClient(CONVEX_URL);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ConvexAuthProvider client={convex}>
            {children}
        </ConvexAuthProvider>
    );
}
