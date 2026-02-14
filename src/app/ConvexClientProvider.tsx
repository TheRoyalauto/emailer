"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider } from "../contexts/AuthContext";
import { ReactNode } from "react";

// Fallback to production Convex URL if env var is not set (Vercel build safety)
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://fearless-kookabura-668.convex.cloud";

const convex = new ConvexReactClient(CONVEX_URL);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ConvexProvider client={convex}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </ConvexProvider>
    );
}
