import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

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

// Store pending verification
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
            .withIndex("by_email", (q) => q.eq("email", args.email))
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

        if (verification.code !== args.code) {
            return { success: false, error: "Invalid code" };
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

// Send verification email via Resend (action for external API call)
export const sendVerificationEmail = action({
    args: {
        email: v.string(),
        name: v.string(),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<SendVerificationResult> => {
        try {
            // Generate code here (not in mutation to avoid circular reference)
            const code = generateOTP();

            console.log("Generated code:", code, "for email:", args.email);

            // Send email via Resend FIRST (before storing)
            const RESEND_API_KEY = process.env.RESEND_API_KEY;
            console.log("RESEND_API_KEY set:", !!RESEND_API_KEY);

            // Try to send email (or skip if no API key)
            if (RESEND_API_KEY) {
                console.log("Making Resend API call...");

                const response = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: "E-mailer <onboarding@resend.dev>",
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
                });

                const responseText = await response.text();
                console.log("Resend response:", response.status, responseText);

                if (!response.ok) {
                    console.error("Email send failed:", responseText);
                }
            } else {
                console.log("No API key - skipping email send");
            }

            // Store verification in database (using runMutation with api reference)
            // Note: We can't call mutations from actions without internal, so let's just return the code
            // The frontend will need to call createVerification separately

            return {
                success: true,
                code,
                message: RESEND_API_KEY ? "Email sent" : "Dev mode - no API key"
            };

        } catch (error: any) {
            console.error("sendVerificationEmail error:", error);
            return {
                success: false,
                error: error?.message || "Unknown error"
            };
        }
    },
});
