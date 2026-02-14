import { mutation } from "./_generated/server";
import { v } from "convex/values";

// One-time setup: Create super admin profile for first user
// Run this from the Convex dashboard: setupSuperAdmin({ email: "your@email.com" })
export const setupSuperAdmin = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        // Find user by email in auth
        const users = await ctx.db.query("users").collect();
        const user = users.find((u: any) => u.email === args.email);

        if (!user) {
            throw new Error(`User with email ${args.email} not found`);
        }

        // Check if profile exists
        const existing = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();

        if (existing) {
            // Update to super admin
            await ctx.db.patch(existing._id, {
                isSuperAdmin: true,
                isAdmin: true,
                tier: "scale",
            });
            return { success: true, message: "Existing profile upgraded to super admin" };
        }

        // Create new profile as super admin
        await ctx.db.insert("userProfiles", {
            userId: user._id,
            email: args.email,
            tier: "scale",
            isSuperAdmin: true,
            isAdmin: true,
            createdAt: Date.now(),
            lastLoginAt: Date.now(),
            emailsSentToday: 0,
            emailsSentThisMonth: 0,
            status: "active",
        });

        return { success: true, message: "Super admin profile created" };
    },
});

// Create profiles for all existing users who don't have one
export const migrateExistingUsers = mutation({
    args: { sessionToken: v.optional(v.union(v.string(), v.null())),},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        let created = 0;
        let skipped = 0;

        for (const user of users) {
            const existing = await ctx.db
                .query("userProfiles")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .first();

            if (existing) {
                skipped++;
                continue;
            }

            await ctx.db.insert("userProfiles", {
                userId: user._id,
                email: (user as any).email || "unknown@email.com",
                tier: "free",
                createdAt: Date.now(),
                emailsSentToday: 0,
                emailsSentThisMonth: 0,
                status: "active",
            });
            created++;
        }

        return { created, skipped, total: users.length };
    },
});
