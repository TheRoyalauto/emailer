import type { Metadata } from "next";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

export const metadata: Metadata = {
    title: "Emailer - Email Campaign Platform",
    description: "Professional email campaign management platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <ConvexClientProvider>{children}</ConvexClientProvider>
            </body>
        </html>
    );
}
