import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteName = "DREAM CATCHER FILMS";
const siteTitle = `${siteName} | 電影級影像製作`;
const siteDesc =
  "結合深厚實拍底蘊與頂尖動畫特效，在精準預算內綻放無限的視覺張力。專業商業廣告、企業形象、MV 及動畫製作。";
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://dcfilms.tv");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: siteTitle, template: `%s | ${siteName}` },
  description: siteDesc,
  keywords: ["影像製作", "商業廣告", "企業形象", "MV製作", "動畫設計", "電影質感", "DC Films", "Dream Catcher Films"],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName,
    title: siteTitle,
    description: siteDesc,
    url: baseUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDesc,
  },
  alternates: {
    canonical: baseUrl,
    languages: { "zh-TW": baseUrl, en: `${baseUrl}/en` },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${baseUrl}/#organization`,
  name: siteName,
  url: baseUrl,
  description: siteDesc,
  address: {
    "@type": "PostalAddress",
    streetAddress: "新湖二路166號2F",
    addressLocality: "內湖區",
    addressRegion: "台北市",
    postalCode: "114",
    addressCountry: "TW",
  },
  telephone: "+886-2-2729-0939",
  email: "hello@dcfilms.tv",
  geo: { "@type": "GeoCoordinates", latitude: 25.065, longitude: 121.578 },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
  sameAs: ["https://vimeo.com/dcfilms", "https://www.instagram.com/dcfilms"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('dcfilms-theme');document.documentElement.dataset.theme=t||'dark';})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} antialiased bg-[#F5F0E8] dark:bg-black text-stone-900 dark:text-white overflow-x-hidden`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
