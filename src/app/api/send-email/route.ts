import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface EmailRequest {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from: {
        name: string;
        email: string;
    };
    replyTo?: string;
    // SMTP credentials
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: EmailRequest = await request.json();

        // Validate required fields
        if (!body.to || !body.subject || !body.html || !body.from || !body.smtp) {
            return NextResponse.json(
                { error: "Missing required fields: to, subject, html, from, smtp" },
                { status: 400 }
            );
        }

        // Create transporter with user's SMTP credentials
        const transporter = nodemailer.createTransport({
            host: body.smtp.host,
            port: body.smtp.port,
            secure: body.smtp.secure, // true for 465, false for 587
            auth: {
                user: body.smtp.user,
                pass: body.smtp.pass,
            },
        });

        // Verify connection configuration
        try {
            await transporter.verify();
        } catch (verifyError) {
            console.error("SMTP verification failed:", verifyError);
            return NextResponse.json(
                { error: "SMTP connection failed. Please check your credentials." },
                { status: 400 }
            );
        }

        // Send email
        const info = await transporter.sendMail({
            from: `"${body.from.name}" <${body.from.email}>`,
            to: body.to,
            replyTo: body.replyTo || body.from.email,
            subject: body.subject,
            text: body.text || body.html.replace(/<[^>]*>/g, ""), // Strip HTML for plain text
            html: body.html,
        });

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
        });
    } catch (error) {
        console.error("Email send error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to send email" },
            { status: 500 }
        );
    }
}
