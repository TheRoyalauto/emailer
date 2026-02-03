import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
    try {
        const { configId, host, port, secure, user, pass, from, fromName } = await request.json();

        // Create transporter with provided config
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
        });

        // Verify connection
        await transporter.verify();

        return NextResponse.json({
            success: true,
            message: "SMTP connection successful! Your credentials are working.",
        });
    } catch (error: any) {
        console.error("SMTP test error:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "SMTP connection failed. Check your credentials.",
        });
    }
}
