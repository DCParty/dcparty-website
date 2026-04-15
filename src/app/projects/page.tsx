import { getPublishedProjects } from "@/lib/notion-dcfilms";
import { ProjectsPageClient } from "@/components/dcfilms/ProjectsPageClient";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: "影片製作作品集｜企業形象｜商業廣告｜DC Films",
  },
  description:
    "瀏覽 DC Films 超過 80 件影像作品，涵蓋企業形象影片、品牌廣告、商業攝影、動畫設計。服務客戶橫跨醫療、科技、消費品、政府機關。",
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "DC Films 影像製作",
    title: "影片製作作品集｜企業形象｜商業廣告｜DC Films",
    description:
      "瀏覽 DC Films 超過 80 件影像作品，涵蓋企業形象影片、品牌廣告、商業攝影、動畫設計。服務客戶橫跨醫療、科技、消費品、政府機關。",
  },
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  return <ProjectsPageClient projects={projects} />;
}
