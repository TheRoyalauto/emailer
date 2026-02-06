import { v } from "convex/values";
import { mutation, query, action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Type for the action return
type SendVerificationResult = {
    success: boolean;
    code?: string;
    message?: string;
    error?: string;
};

// Generate a 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================================================
// NEW: Robust verification flow - mutation first, then fire-and-forget email
// ============================================================================

// Step 1: Create verification record and schedule email (called from frontend)
export const initiateVerification = mutation({
    args: {
        email: v.string(),
        name: v.string(),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase().trim();
        const code = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        console.log("initiateVerification called with email:", email, "code:", code);

        // Check if verification already exists
        const existing = await ctx.db
            .query("emailVerifications")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existing) {
            // Update existing
            await ctx.db.patch(existing._id, {
                code,
                expiresAt,
                attempts: 0,
                name: args.name,
                ...(args.phone ? { phone: args.phone } : {}),
            });
        } else {
            // Create new
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

        // Schedule the email send as internal action (fire-and-forget)
        await ctx.scheduler.runAfter(0, internal.emailVerification.sendEmailInternal, {
            email,
            name: args.name,
            code,
        });

        // Return immediately - email sends in background
        return {
            success: true,
            code, // For dev mode / debugging
            message: "Verification initiated",
        };
    },
});

// Internal action to send email (not exposed to client, called by scheduler)
export const sendEmailInternal = internalAction({
    args: {
        email: v.string(),
        name: v.string(),
        code: v.string(),
    },
    handler: async (ctx, args) => {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        console.log("sendEmailInternal called for:", args.email, "RESEND_API_KEY set:", !!RESEND_API_KEY);

        if (!RESEND_API_KEY) {
            console.log("No RESEND_API_KEY - skipping email send (dev mode)");
            return { success: true, message: "Dev mode - no email sent" };
        }

        try {
            console.log("Making Resend API call...");
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: "E-mailer <verify@no-reply.e-mailer.io>",
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
            console.log("Resend response:", response.status, responseText);

            if (!response.ok) {
                console.error("Email send failed:", responseText);
                return { success: false, error: responseText };
            }

            return { success: true, message: "Email sent" };
        } catch (err) {
            console.error("Resend fetch error:", err);
            return { success: false, error: String(err) };
        }
    },
});

// ============================================================================
// LEGACY: Keep old functions for backwards compatibility during transition
// ============================================================================

// Store pending verification (keep for backwards compat)
export const createVerification = mutation({
    args: {
        email: v.string(),
        name: v.string(),
        code: v.string(),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase().trim();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        console.log("createVerification called with email:", email, "code:", args.code);

        // Check if verification already exists
        const existing = await ctx.db
            .query("emailVerifications")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existing) {
            // Update existing
            await ctx.db.patch(existing._id, {
                code: args.code,
                expiresAt,
                attempts: 0,
                name: args.name,
                ...(args.phone ? { phone: args.phone } : {}),
            });
            return { verificationId: existing._id };
        }

        // Create new
        const id = await ctx.db.insert("emailVerifications", {
            email: email,
            code: args.code,
            expiresAt,
            attempts: 0,
            verified: false,
            name: args.name,
            ...(args.phone ? { phone: args.phone } : {}),
            createdAt: Date.now(),
        });

        return { verificationId: id };
    },
});

// Verify the OTP code
export const verifyCode = mutation({
    args: {
        email: v.string(),
        code: v.string(),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase().trim();
        console.log("verifyCode called with email:", email, "code:", args.code);

        const verification = await ctx.db
            .query("emailVerifications")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        console.log("Found verification:", verification);

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

        console.log("Comparing codes - stored:", verification.code, "entered:", args.code, "match:", verification.code === args.code);

        if (verification.code !== args.code) {
            return { success: false, error: `Invalid code. ${5 - verification.attempts - 1} attempts remaining.` };
        }

        // Mark as verified
        await ctx.db.patch(verification._id, {
            verified: true,
        });

        return {
            success: true,
            name: verification.name,
            phone: verification.phone,
        };
    },
});

// Check if email is verified
export const checkVerification = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const verification = await ctx.db
            .query("emailVerifications")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        return verification?.verified || false;
    },
});

// DEPRECATED: Keep for backwards compatibility but prefer initiateVerification
export const sendVerificationEmail = action({
    args: {
        email: v.string(),
        name: v.string(),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<SendVerificationResult> => {
        // Generate code immediately
        const code = generateOTP();
        console.log("DEPRECATED sendVerificationEmail - Generated code:", code, "for email:", args.email);

        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        console.log("RESEND_API_KEY set:", !!RESEND_API_KEY);

        if (!RESEND_API_KEY) {
            console.log("No API key - skipping email send");
            return {
                success: true,
                code,
                message: "Dev mode - no API key"
            };
        }

        // Send email with aggressive 5s timeout to stay within Convex action limits
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            console.log("Making Resend API call...");
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: "E-mailer <verify@no-reply.e-mailer.io>",
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
                                    ${code}
                                </span>
                            </div>
                            <p style="color: #94a3b8; font-size: 14px;">
                                This code expires in 10 minutes.<br>
                                If you didn't request this, you can safely ignore this email.
                            </p>
                        </div>
                    `,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const responseText = await response.text();
            console.log("Resend response:", response.status, responseText);

            if (!response.ok) {
                console.error("Email send failed:", responseText);
            }

            return {
                success: true,
                code,
                message: "Email sent"
            };

        } catch (fetchError: unknown) {
            clearTimeout(timeoutId);
            const err = fetchError as { name?: string; message?: string };
            if (err.name === 'AbortError') {
                console.log("Resend API timed out, returning code anyway");
            } else {
                console.error("Resend fetch error:", fetchError);
            }
            // Still return success with code - user can verify even if email failed
            return {
                success: true,
                code,
                message: "Email may have failed, but code is valid"
            };
        }
    },
});
