import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-heading",
    display: "swap",
});

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-body",
    display: "swap",
});

import { SuperAdminFab } from "../components/SuperAdminFab";

export const metadata: Metadata = {
    title: "E-mailer - Email Campaign Platform",
    description: "Professional email campaign management platform",
    icons: {
        icon: "/favicon.png",
        shortcut: "/favicon.png",
        apple: "/logo.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${spaceGrotesk.variable} ${outfit.variable}`}>
            <body className="antialiased font-sans bg-slate-50">
                <ConvexClientProvider>
                    <SuperAdminFab />
                    {children}
                </ConvexClientProvider>
            </body>
        </html>
    );
}
