import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// =============================================================================
// PASSWORD HASHING (Web Crypto API — native in Convex runtime)
// =============================================================================

function generateSalt(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

function generateToken(): string {
    const array = new Uint8Array(48);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// =============================================================================
// SESSION HELPER — Used by ALL other files (replaces getAuthUserId)
// =============================================================================

/**
 * Get the authenticated user ID from a session token.
 * Pass the session token from the frontend via args, or use the helper pattern.
 */
export async function getSessionUserId(
    ctx: QueryCtx | MutationCtx,
    sessionToken?: string | null
): Promise<Id<"users"> | null> {
    if (!sessionToken) return null;

    const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q) => q.eq("token", sessionToken))
        .first();

    if (!session) return null;
    if (Date.now() > session.expiresAt) return null;

    return session.userId;
}

// =============================================================================
// AUTH MUTATIONS & QUERIES
// =============================================================================

/**
 * Register a new user.
 * Creates the user record, profile, and session in one atomic flow.
 */
export const register = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        email: v.string(),
        password: v.string(),
        name: v.string(),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase().trim();
        const name = args.name.trim();

        console.log(`[AUTH] register called | email=${email} | timestamp=${new Date().toISOString()}`);

        // Validate password
        if (args.password.length < 8) {
            return { success: false as const, error: "Password must be at least 8 characters" };
        }

        // Check if email already exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existing) {
            return { success: false as const, error: "An account with this email already exists" };
        }

        // Hash password
        const salt = generateSalt();
        const passwordHash = await hashPassword(args.password, salt);

        // Create user
        const userId = await ctx.db.insert("users", {
            email,
            name,
            phone: args.phone || undefined,
            passwordHash,
            salt,
            createdAt: Date.now(),
        });

        // Create user profile (tier system)
        await ctx.db.insert("userProfiles", {
            userId,
            email,
            name,
            tier: "free",
            createdAt: Date.now(),
            lastLoginAt: Date.now(),
            emailsSentToday: 0,
            emailsSentThisMonth: 0,
            emailsLastResetAt: Date.now(),
            monthlyResetAt: Date.now(),
            emailAccountCount: 0,
            status: "active",
        });

        // Create session
        const token = generateToken();
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

        await ctx.db.insert("sessions", {
            userId,
            token,
            expiresAt,
            createdAt: Date.now(),
        });

        console.log(`[AUTH] register success | userId=${userId} | email=${email}`);

        return {
            success: true as const,
            token,
            userId,
        };
    },
});

/**
 * Log in an existing user.
 */
export const login = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase().trim();

        console.log(`[AUTH] login called | email=${email} | timestamp=${new Date().toISOString()}`);

        // Find user
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (!user) {
            return { success: false as const, error: "Invalid email or password" };
        }

        // Legacy users from old auth system won't have salt/passwordHash
        if (!user.salt || !user.passwordHash) {
            return { success: false as const, error: "Please re-register — your account uses a legacy auth format" };
        }

        // Verify password
        const hash = await hashPassword(args.password, user.salt);
        if (hash !== user.passwordHash) {
            return { success: false as const, error: "Invalid email or password" };
        }

        // Create session
        const token = generateToken();
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

        await ctx.db.insert("sessions", {
            userId: user._id,
            token,
            expiresAt,
            createdAt: Date.now(),
        });

        // Update last login on profile
        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();

        if (profile) {
            await ctx.db.patch(profile._id, { lastLoginAt: Date.now() });
        }

        console.log(`[AUTH] login success | userId=${user._id} | email=${email}`);

        return {
            success: true as const,
            token,
            userId: user._id,
        };
    },
});

/**
 * Get current session info (validates token + returns user data).
 * Called on page load to check if user is still authenticated.
 */
export const getSession = query({
    args: {
        sessionToken: v.optional(v.string()),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (!args.token) return null;

        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.token!))
            .first();

        if (!session) return null;
        if (Date.now() > session.expiresAt) return null;

        const user = await ctx.db.get(session.userId);
        if (!user) return null;

        return {
            userId: user._id,
            email: user.email,
            name: user.name,
        };
    },
});

/**
 * Log out — delete the session.
 */
export const logout = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (session) {
            await ctx.db.delete(session._id);
        }

        return { success: true };
    },
});

/**
 * Admin: Delete a user by email (dev utility).
 * Removes user, profile, and all sessions.
 */
export const adminDeleteUser = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase().trim();
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (!user) return { success: false, error: "User not found" };

        // Delete sessions
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();
        for (const s of sessions) await ctx.db.delete(s._id);

        // Delete profile
        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
        if (profile) await ctx.db.delete(profile._id);

        // Delete user
        await ctx.db.delete(user._id);

        console.log(`[AUTH] adminDeleteUser | deleted ${email}`);
        return { success: true };
    },
});
