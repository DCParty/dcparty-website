import { getPublishedProjects } from "@/lib/notion-dcfilms";
import { ProjectsPageClient } from "@/components/dcfilms/ProjectsPageClient";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Portfolio",
  description: "歷年影像作品與動畫案例。商業廣告、企業形象、MV、動畫設計。",
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  return <ProjectsPageClient projects={projects} />;
}
