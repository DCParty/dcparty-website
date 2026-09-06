import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";

const siteName = "DC Films 影像製作";
const siteTitle = "台北企業形象影片製作｜品牌廣告影片｜DC Films 影像製作";
const siteDesc =
  "DC Films 專注服務台灣中大型企業，提供企業形象影片、品牌廣告、商業攝影一站式製作。歐姆龍、岱宇國際、PAUL SMITH 皆為合作客戶。立即諮詢專案報價。";
// 環境變數尾端可能帶換行，會污染 canonical 與 schema 的 @id
const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
).trim();

export const metadata: Metadata = {
  metadataBase: baseUrl ? new URL(baseUrl) : undefined,
  // 各頁 meta_title 已自帶「｜DC Films」品牌後綴，故不再重複附加
  title: { default: siteTitle, template: "%s" },
  description: siteDesc,
  keywords: [
    "企業形象影片",
    "形象影片製作",
    "品牌廣告影片",
    "商業攝影",
    "產品攝影",
    "動畫設計",
    "群眾募資影片",
    "影片製作公司",
    "台北影片製作",
    "DC Films",
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
  // 不在此設全域 canonical —— 會讓所有未覆寫的頁面都宣告自己是首頁的
  // 替代版本，導致 Google 以「替代網頁（有適當的標準標記）」為由跳過索引。
  // 各頁須自行宣告相對路徑的 canonical，由 metadataBase 解析為完整網址。
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
      "@type": ["Organization", "LocalBusiness"],
      "@id": `${baseUrl || "https://example.com"}/#organization`,
      name: siteName,
      alternateName: "Dream Catcher Films",
      url: baseUrl || "https://example.com",
      description: siteDesc,
      email: "hello@dcfilms.tv",
      telephone: "+886-935-503-966",
      address: {
        "@type": "PostalAddress",
        streetAddress: "新湖二路166號2F",
        addressLocality: "內湖區",
        addressRegion: "台北市",
        postalCode: "114",
        addressCountry: "TW",
      },
      areaServed: { "@type": "Country", name: "台灣" },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TYH62PY83D"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-TYH62PY83D');`}
        </Script>
      </body>
    </html>
  );
}
