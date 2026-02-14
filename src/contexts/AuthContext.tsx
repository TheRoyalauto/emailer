"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// =============================================================================
// TYPES
// =============================================================================

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    userId: Id<"users"> | null;
    userEmail: string | null;
    userName: string | null;
    sessionToken: string | null;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// =============================================================================
// STORAGE HELPERS
// =============================================================================

const TOKEN_KEY = "claimory_session_token";

function getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

function setStoredToken(token: string): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch { }
}

function clearStoredToken(): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch { }
}

// =============================================================================
// PROVIDER
// =============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load stored token on mount
    useEffect(() => {
        const stored = getStoredToken();
        if (stored) {
            setSessionToken(stored);
        }
        setIsInitialized(true);
    }, []);

    // Validate session with backend
    const sessionData = useQuery(
        api.customAuth.getSession,
        sessionToken ? { token: sessionToken } : "skip"
    );

    // Mutations
    const loginMutation = useMutation(api.customAuth.login);
    const logoutMutation = useMutation(api.customAuth.logout);
    const registerMutation = useMutation(api.customAuth.register);

    // Determine auth state
    const isLoading = !isInitialized || (sessionToken !== null && sessionData === undefined);
    const isAuthenticated = !!sessionData;

    // Clear invalid sessions
    useEffect(() => {
        if (isInitialized && sessionToken && sessionData === null) {
            // Session is invalid/expired
            clearStoredToken();
            setSessionToken(null);
        }
    }, [isInitialized, sessionToken, sessionData]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const result = await loginMutation({ email, password });
            if (result.success) {
                setStoredToken(result.token);
                setSessionToken(result.token);
                return { success: true };
            }
            return { success: false, error: result.error };
        } catch (err: any) {
            return { success: false, error: err.message || "Login failed" };
        }
    }, [loginMutation]);

    const register = useCallback(async (email: string, password: string, name: string, phone?: string) => {
        try {
            const result = await registerMutation({ email, password, name, phone });
            if (result.success) {
                setStoredToken(result.token);
                setSessionToken(result.token);
                return { success: true };
            }
            return { success: false, error: result.error };
        } catch (err: any) {
            return { success: false, error: err.message || "Registration failed" };
        }
    }, [registerMutation]);

    const logout = useCallback(async () => {
        if (sessionToken) {
            try {
                await logoutMutation({ token: sessionToken });
            } catch { }
        }
        clearStoredToken();
        setSessionToken(null);
    }, [sessionToken, logoutMutation]);

    const value = useMemo<AuthContextType>(() => ({
        isAuthenticated,
        isLoading,
        userId: sessionData?.userId ?? null,
        userEmail: sessionData?.email ?? null,
        userName: sessionData?.name ?? null,
        sessionToken,
        login,
        register,
        logout,
    }), [isAuthenticated, isLoading, sessionData, sessionToken, login, register, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// =============================================================================
// HOOK
// =============================================================================

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
