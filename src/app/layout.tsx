import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "DCParty";
const siteTitle = `${siteName} — AI 訂閱制數位服務`;
const siteDesc =
  "一個月費，無限數位需求。網頁、軟體、設計、音樂——訂閱制，做完換下一個。無限修改直到滿意。";
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

export const metadata: Metadata = {
  metadataBase: baseUrl ? new URL(baseUrl) : undefined,
  title: { default: siteTitle, template: `%s | ${siteName}` },
  description: siteDesc,
  keywords: [
    "訂閱制",
    "數位服務",
    "網頁設計",
    "軟體開發",
    "UI/UX",
    "品牌設計",
    "音樂製作",
    "AI",
    "DCParty",
    "無限需求",
  ],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName,
    title: siteTitle,
    description: siteDesc,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDesc,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl || "https://example.com"}/#organization`,
      name: siteName,
      url: baseUrl || "https://example.com",
      description: siteDesc,
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl || "https://example.com"}/#website`,
      url: baseUrl || "https://example.com",
      name: siteName,
      description: siteDesc,
      inLanguage: "zh-Hant",
      publisher: { "@id": `${baseUrl || "https://example.com"}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
