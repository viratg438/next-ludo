import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { siteDescription, siteUrl } from "@/lib/site";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ludo — 2 to 4 Player Pass and Play",
  description: siteDescription,
  applicationName: "Ludo",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Ludo — 2 to 4 Player Pass and Play",
    description: siteDescription,
    type: "website",
    url: "/",
    siteName: "Ludo",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Ludo — 2 to 4 Player Pass and Play",
    description: siteDescription,
  },
  appleWebApp: {
    capable: true,
    title: "Ludo",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#04140f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
