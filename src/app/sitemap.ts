import { MetadataRoute } from "next";
import { getAllWorkSlugs, getAllBlogSlugs, getAllServiceSlugs } from "@/lib/notion";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dcparty.co";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [workSlugs, blogSlugs, serviceSlugs] = await Promise.all([
    getAllWorkSlugs().catch(() => [] as string[]),
    getAllBlogSlugs().catch(() => [] as string[]),
    getAllServiceSlugs().catch(() => [] as string[]),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/subscribe`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  const workRoutes: MetadataRoute.Sitemap = workSlugs.map((slug) => ({
    url: `${baseUrl}/works/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...workRoutes, ...blogRoutes, ...serviceRoutes];
}
