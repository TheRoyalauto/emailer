import { v } from "convex/values";
import { mutation, query, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Generate a 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// =============================================================================
// CANONICAL EMAIL VERIFICATION FLOW
// =============================================================================

/**
 * Step 1: Initiate verification
 * - Generates OTP
 * - Stores in database
 * - Schedules email send (fire-and-forget)
 * - Returns immediately
 */
export const initiateVerification = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        email: v.string(),
        name: v.string(),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase().trim();
        const code = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        console.log(`[PROD_DEBUG] initiateVerification called | email=${email} | code=${code} | timestamp=${new Date().toISOString()}`);

        // Upsert verification record
        const existing = await ctx.db
            .query("emailVerifications")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                code,
                expiresAt,
                attempts: 0,
                verified: false,
                name: args.name,
                ...(args.phone ? { phone: args.phone } : {}),
            });
        } else {
            await ctx.db.insert("emailVerifications", {
                email,
                code,
                expiresAt,
                attempts: 0,
                verified: false,
                name: args.name,
                ...(args.phone ? { phone: args.phone } : {}),
                createdAt: Date.now(),
            });
        }

        // Schedule email send (fire-and-forget)
        await ctx.scheduler.runAfter(0, internal.emailVerification.sendEmailInternal, {
            email,
            name: args.name,
            code,
        });

        return { success: true };
    },
});

/**
 * Internal action to send verification email via Resend
 * Called by scheduler, not exposed to client
 */
export const sendEmailInternal = internalAction({
    args: {
        email: v.string(),
        name: v.string(),
        code: v.string(),
    },
    handler: async (ctx, args) => {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const fromAddress = process.env.RESEND_FROM_EMAIL || "E-mailer <verify@no-reply.e-mailer.io>";
        console.log(`[PROD_DEBUG] sendEmailInternal fired | email=${args.email} | hasApiKey=${!!RESEND_API_KEY} | from=${fromAddress}`);

        if (!RESEND_API_KEY) {
            console.error("[PROD_DEBUG] RESEND_API_KEY is missing! Email will NOT be sent.");
            return { success: false };
        }

        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: fromAddress,
                    to: args.email,
                    subject: "Verify your E-mailer account",
                    html: `
                        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                            <h1 style="color: #6366f1; margin-bottom: 24px;">Verify your email</h1>
                            <p style="color: #64748b; margin-bottom: 24px;">
                                Hi ${args.name},<br><br>
                                Use this code to verify your E-mailer account:
                            </p>
                            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">
                                    ${args.code}
                                </span>
                            </div>
                            <p style="color: #94a3b8; font-size: 14px;">
                                This code expires in 10 minutes.<br>
                                If you didn't request this, you can safely ignore this email.
                            </p>
                        </div>
                    `,
                }),
            });

            const responseText = await response.text();
            if (response.ok) {
                console.log(`[PROD_DEBUG] Email sent successfully | status=${response.status} | response=${responseText}`);
            } else {
                console.error(`[PROD_DEBUG] Resend API FAILED | status=${response.status} | response=${responseText} | from=${fromAddress} | to=${args.email}`);
            }

            return { success: response.ok };
        } catch (err: any) {
            console.error(`[PROD_DEBUG] sendEmailInternal EXCEPTION | error=${err.message} | email=${args.email}`);
            return { success: false };
        }
    },
});

/**
 * Step 2: Verify OTP code
 * Returns user info on success for account creation
 */
export const verifyCode = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        email: v.string(),
        code: v.string(),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase().trim();
        console.log("[verifyCode] email:", email);

        const verification = await ctx.db
            .query("emailVerifications")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (!verification) {
            return { success: false, error: "No verification found for this email" };
        }

        if (verification.attempts >= 5) {
            return { success: false, error: "Too many attempts. Please request a new code." };
        }

        if (Date.now() > verification.expiresAt) {
            return { success: false, error: "Code expired. Please request a new code." };
        }

        // Increment attempts
        await ctx.db.patch(verification._id, {
            attempts: verification.attempts + 1,
        });

        if (verification.code !== args.code) {
            const remaining = 5 - verification.attempts - 1;
            return { success: false, error: `Invalid code. ${remaining} attempts remaining.` };
        }

        // Mark as verified
        await ctx.db.patch(verification._id, { verified: true });

        return {
            success: true,
            name: verification.name,
            phone: verification.phone,
        };
    },
});

/**
 * Query to check if email is verified
 */
export const checkVerification = query({
    args: { sessionToken: v.optional(v.string()), email: v.string() },
    handler: async (ctx, args) => {
        const verification = await ctx.db
            .query("emailVerifications")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
            .first();

        return verification?.verified || false;
    },
});
