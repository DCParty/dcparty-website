import { getPublishedProjects } from "@/lib/notion-dcfilms";
import { HomePageClient } from "@/components/dcfilms/HomePageClient";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: "台北企業形象影片製作｜品牌廣告影片｜DC Films 影像製作",
  },
  description:
    "DC Films 專注服務台灣中大型企業，提供企業形象影片、品牌廣告、商業攝影一站式製作。歐姆龍、岱宇國際、PAUL SMITH 皆為合作客戶。立即諮詢專案報價。",
  keywords: [
    "企業形象影片製作",
    "台北影片製作公司",
    "品牌廣告影片",
    "商業攝影",
    "企業宣傳影片",
    "影片製作推薦",
    "DC Films",
    "夢想捕手影像",
    "動畫設計台北",
    "MV拍攝製作",
  ],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "DC Films 影像製作",
    title: "台北企業形象影片製作｜品牌廣告影片｜DC Films 影像製作",
    description:
      "DC Films 專注服務台灣中大型企業，提供企業形象影片、品牌廣告、商業攝影一站式製作。歐姆龍、岱宇國際、PAUL SMITH 皆為合作客戶。",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "DC Films 影像製作",
  alternateName: "DREAM CATCHER FILMS",
  url: "https://dcfilms.tv",
  telephone: "+886-2-2729-0939",
  email: "hello@dcfilms.tv",
  address: {
    "@type": "PostalAddress",
    streetAddress: "新湖二路166號2F",
    addressLocality: "內湖區",
    addressRegion: "台北市",
    postalCode: "114",
    addressCountry: "TW",
  },
  description:
    "台北專業影片製作公司，提供企業形象影片、品牌廣告、商業攝影、動畫設計服務。",
  priceRange: "$$$$",
  serviceArea: {
    "@type": "Country",
    name: "台灣",
  },
  knowsAbout: [
    "企業形象影片",
    "品牌廣告",
    "商業攝影",
    "動畫設計",
    "MV製作",
  ],
  sameAs: ["https://vimeo.com/dcfilms"],
};

export default async function HomePage() {
  const projects = await getPublishedProjects();
  const featured = projects.filter((p) => p.featured).slice(0, 4);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <HomePageClient featuredProjects={featured} />
    </>
  );
}
