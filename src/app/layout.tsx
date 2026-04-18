import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist_Mono, EB_Garamond } from "next/font/google";
import { LangSync } from "@/components/LangSync";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Deep Reality — Cartography of Consciousness",
    template: "%s — Deep Reality",
  },
  description:
    "Tietoisuuden Kartografia. Pages from the atlas of Johannes Kamikaze, found and presented by V.P.",
  openGraph: {
    title: "Deep Reality — Cartography of Consciousness",
    description:
      "Pages from the atlas of Johannes Kamikaze, found and presented by V.P.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deep Reality — Cartography of Consciousness",
    description:
      "Pages from the atlas of Johannes Kamikaze, found and presented by V.P.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} ${ebGaramond.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-neutral-300">
        <Suspense fallback={null}>
          <LangSync />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
