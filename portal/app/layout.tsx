import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yincumin Citadel",
  description: "Sentence Fortress",
  icons: {
    icon: "/kilang/Kilang_5_nobg_noring2.png",
    shortcut: "/kilang/Kilang_5_nobg_noring2.png",
    apple: "/kilang/Kilang_5_nobg_noring2.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
