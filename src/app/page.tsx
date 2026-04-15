import { getPublishedProjects } from "@/lib/notion-dcfilms";
import { HomePageClient } from "@/components/dcfilms/HomePageClient";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Dream Catcher Films — 影像製作公司",
  description: "DC Films 夢想捕手影像，台灣專業影像製作公司。商業廣告、企業形象、MV、動畫設計。",
};

export default async function HomePage() {
  const projects = await getPublishedProjects();
  const featured = projects.filter((p) => p.featured).slice(0, 4);
  return <HomePageClient featuredProjects={featured} />;
}
