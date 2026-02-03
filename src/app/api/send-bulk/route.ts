import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface BulkEmailRequest {
    emails: Array<{
        to: string;
        subject: string;
        html: string;
        contactId?: string;
    }>;
    from: {
        name: string;
        email: string;
    };
    replyTo?: string;
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
    };
    // Sending options
    delayBetweenMs?: number; // Delay between emails (default: 500ms)
    campaignId?: string;
}

interface SendResult {
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
    contactId?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: BulkEmailRequest = await request.json();

        // Validate
        if (!body.emails || body.emails.length === 0) {
            return NextResponse.json(
                { error: "No emails to send" },
                { status: 400 }
            );
        }

        if (!body.from || !body.smtp) {
            return NextResponse.json(
                { error: "Missing from or smtp configuration" },
                { status: 400 }
            );
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: body.smtp.host,
            port: body.smtp.port,
            secure: body.smtp.secure,
            auth: {
                user: body.smtp.user,
                pass: body.smtp.pass,
            },
            pool: true, // Use connection pooling for bulk sending
            maxConnections: 5,
            maxMessages: 100,
        });

        // Verify connection
        try {
            await transporter.verify();
        } catch {
            return NextResponse.json(
                { error: "SMTP connection failed. Check credentials." },
                { status: 400 }
            );
        }

        const delay = body.delayBetweenMs || 500;
        const results: SendResult[] = [];

        // Send emails with throttling
        for (let i = 0; i < body.emails.length; i++) {
            const email = body.emails[i];

            try {
                const info = await transporter.sendMail({
                    from: `"${body.from.name}" <${body.from.email}>`,
                    to: email.to,
                    replyTo: body.replyTo || body.from.email,
                    subject: email.subject,
                    html: email.html,
                    text: email.html.replace(/<[^>]*>/g, ""),
                });

                results.push({
                    email: email.to,
                    success: true,
                    messageId: info.messageId,
                    contactId: email.contactId,
                });
            } catch (error) {
                results.push({
                    email: email.to,
                    success: false,
                    error: error instanceof Error ? error.message : "Send failed",
                    contactId: email.contactId,
                });
            }

            // Throttle between emails to avoid rate limiting
            if (i < body.emails.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        // Close the connection pool
        transporter.close();

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        return NextResponse.json({
            success: true,
            total: body.emails.length,
            successful,
            failed,
            results,
        });
    } catch (error) {
        console.error("Bulk send error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Bulk send failed" },
            { status: 500 }
        );
    }
}
