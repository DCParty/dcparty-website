import { getFeaturedProjects } from "@/lib/notion-dcfilms";
import { HomePageClient } from "@/components/dcfilms/HomePageClient";
import type { Metadata } from "next";

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dcfilms.tv";

export const metadata: Metadata = {
  title: "DREAM CATCHER FILMS | 電影級影像製作",
  description: "結合深厚實拍底蘊與頂尖動畫特效，在精準預算內綻放無限的視覺張力。",
  alternates: { canonical: baseUrl, languages: { "zh-TW": baseUrl, en: `${baseUrl}/en` } },
};

export default async function HomePage() {
  const featuredProjects = await getFeaturedProjects();
  return <HomePageClient featuredProjects={featuredProjects} />;
}
