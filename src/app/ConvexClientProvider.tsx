"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider } from "../contexts/AuthContext";
import { ReactNode } from "react";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

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
