import type { Metadata } from "next";
import { Geist_Mono, EB_Garamond } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Deep Reality — Investigation into Deeper Realms",
  description: "Tietoisuuden Kartografia. Maps of consciousness. An atlas documenting invisible systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} ${ebGaramond.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-neutral-300">
        {children}
      </body>
    </html>
  );
}
