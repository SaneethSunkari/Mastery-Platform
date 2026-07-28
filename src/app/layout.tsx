import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mastery-platform.onrender.com"),
  title: "Mastery — Adaptive AI Coding Tutor",
  description: "Focused, adaptive practice for SQL, Python, and PySpark.",
  openGraph: {
    title: "Mastery",
    description: "Adaptive practice for SQL, Python & PySpark",
    type: "website",
    images: [{ url: "/og.png", width: 1729, height: 910, alt: "Mastery adaptive coding tutor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mastery",
    description: "Adaptive practice for SQL, Python & PySpark",
    images: ["/og.png"],
  },
};

const rootClassName = `${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={rootClassName} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
