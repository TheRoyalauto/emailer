import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
    contactId?: string;
}

interface SmtpConfig {
    provider?: "smtp" | "resend" | "sendgrid" | "mailgun";
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    pass?: string;
    apiKey?: string;
}

interface SendBulkRequest {
    emails: EmailPayload[];
    from: { name: string; email: string };
    smtp: SmtpConfig;
    delayBetweenMs?: number;
}

// Send via Resend API
async function sendWithResend(
    apiKey: string,
    from: { name: string; email: string },
    email: EmailPayload
): Promise<{ success: boolean; error?: string }> {
    try {
        const resend = new Resend(apiKey);
        const { error } = await resend.emails.send({
            from: `${from.name} <${from.email}>`,
            to: email.to,
            subject: email.subject,
            html: email.html,
        });

        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Resend error" };
    }
}

// Send via SendGrid API
async function sendWithSendGrid(
    apiKey: string,
    from: { name: string; email: string },
    email: EmailPayload
): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: email.to }] }],
                from: { email: from.email, name: from.name },
                subject: email.subject,
                content: [{ type: "text/html", value: email.html }],
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            return { success: false, error: errText };
        }
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "SendGrid error" };
    }
}

// Send via Mailgun API
async function sendWithMailgun(
    apiKey: string,
    domain: string,
    from: { name: string; email: string },
    email: EmailPayload
): Promise<{ success: boolean; error?: string }> {
    try {
        const auth = Buffer.from(`api:${apiKey}`).toString("base64");
        const formData = new URLSearchParams({
            from: `${from.name} <${from.email}>`,
            to: email.to,
            subject: email.subject,
            html: email.html,
        });

        const response = await fetch(
            `https://api.mailgun.net/v3/${domain}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            return { success: false, error: errText };
        }
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Mailgun error" };
    }
}

// Send via SMTP (Nodemailer)
async function sendWithSmtp(
    config: SmtpConfig,
    from: { name: string; email: string },
    email: EmailPayload
): Promise<{ success: boolean; error?: string }> {
    try {
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port || 587,
            secure: config.secure || false,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        });

        await transporter.sendMail({
            from: `"${from.name}" <${from.email}>`,
            to: email.to,
            subject: email.subject,
            html: email.html,
        });

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "SMTP error" };
    }
}

// Delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
    try {
        const body: SendBulkRequest = await request.json();
        const { emails, from, smtp, delayBetweenMs = 1000 } = body;

        if (!emails || emails.length === 0) {
            return NextResponse.json({ error: "No emails to send" }, { status: 400 });
        }

        const results: Array<{
            email: string;
            success: boolean;
            error?: string;
            contactId?: string;
        }> = [];

        for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            let result: { success: boolean; error?: string };

            // Choose provider
            const provider = smtp.provider || "smtp";

            switch (provider) {
                case "resend":
                    if (!smtp.apiKey) {
                        result = { success: false, error: "Resend API key required" };
                    } else {
                        result = await sendWithResend(smtp.apiKey, from, email);
                    }
                    break;

                case "sendgrid":
                    if (!smtp.apiKey) {
                        result = { success: false, error: "SendGrid API key required" };
                    } else {
                        result = await sendWithSendGrid(smtp.apiKey, from, email);
                    }
                    break;

                case "mailgun":
                    if (!smtp.apiKey) {
                        result = { success: false, error: "Mailgun API key required" };
                    } else {
                        // Extract domain from from email
                        const domain = from.email.split("@")[1];
                        result = await sendWithMailgun(smtp.apiKey, domain, from, email);
                    }
                    break;

                case "smtp":
                default:
                    if (!smtp.host || !smtp.user || !smtp.pass) {
                        result = { success: false, error: "SMTP config incomplete" };
                    } else {
                        result = await sendWithSmtp(smtp, from, email);
                    }
                    break;
            }

            results.push({
                email: email.to,
                success: result.success,
                error: result.error,
                contactId: email.contactId,
            });

            // Delay between emails (except for last one)
            if (i < emails.length - 1 && delayBetweenMs > 0) {
                await delay(delayBetweenMs);
            }
        }

        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        return NextResponse.json({
            success: true,
            results,
            summary: {
                total: emails.length,
                sent: successful,
                failed,
            },
        });
    } catch (error: any) {
        console.error("Bulk send error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to send emails" },
            { status: 500 }
        );
    }
}
