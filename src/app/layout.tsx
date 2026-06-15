import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";

const GA_ID = "G-21SELK56GY";

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
    url: baseUrl || "https://www.dcparty.co",
    title: siteTitle,
    description: siteDesc,
    images: [
      {
        url: "https://res.cloudinary.com/dkfbkya8e/image/upload/f_auto,q_auto/dcparty/works/mupeng-co.png",
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDesc,
    images: ["https://res.cloudinary.com/dkfbkya8e/image/upload/f_auto,q_auto/dcparty/works/mupeng-co.png"],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;700;900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
