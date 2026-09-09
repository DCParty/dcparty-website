import { MetadataRoute } from "next";
import { getAllProjectSlugs } from "@/lib/notion-dcfilms";

// sitemap 若無 revalidate 會凍結在 build 當下；
// 一旦該次建置的 Notion 呼叫失敗，就會長期停留在只有靜態頁的殘缺狀態。
export const revalidate = 3600;

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://dcfilms.tv")
).trim();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projectSlugs = await getAllProjectSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...projectRoutes];
}
