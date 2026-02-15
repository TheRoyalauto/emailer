import type { Metadata } from "next";
import { Sora, Figtree } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

const sora = Sora({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-heading",
    display: "swap",
});

const figtree = Figtree({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-body",
    display: "swap",
});

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
        <html lang="en" className={`${sora.variable} ${figtree.variable}`}>
            <body className="antialiased font-sans">
                <ConvexClientProvider>{children}</ConvexClientProvider>
            </body>
        </html>
    );
}
