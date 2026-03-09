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

const siteName = "DCParty 數位創意派";
const siteTitle = `${siteName} | 廣告影音・視覺設計・軟體開發`;
const siteDesc =
  "用技術與美學為品牌發起數位狂歡。專注廣告影音、視覺設計與軟體開發，結合 AI 打造細膩且具影響力的數位資產。";
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

export const metadata: Metadata = {
  metadataBase: baseUrl ? new URL(baseUrl) : undefined,
  title: { default: siteTitle, template: `%s | ${siteName}` },
  description: siteDesc,
  keywords: [
    "廣告製作",
    "影音製作",
    "視覺設計",
    "品牌設計",
    "網頁開發",
    "軟體開發",
    "數位行銷",
    "AI 視覺",
    "DCParty",
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
        {children}
      </body>
    </html>
  );
}
