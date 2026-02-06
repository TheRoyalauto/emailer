import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-jakarta",
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
        <html lang="en" className={plusJakarta.variable}>
            <body className="antialiased font-sans">
                <ConvexClientProvider>{children}</ConvexClientProvider>
            </body>
        </html>
    );
}
