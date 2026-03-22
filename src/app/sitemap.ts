import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/notion";
import { getServices } from "@/lib/notion";
import { getPublishedWorks } from "@/lib/notion";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://example.com");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, services, works] = await Promise.all([
    getBlogPosts(),
    getServices(),
    getPublishedWorks(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/portfolio`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const blogUrls: MetadataRoute.Sitemap = posts.map((post: { slug: string }) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const serviceUrls: MetadataRoute.Sitemap = services.map((s: { slug: string }) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const workUrls: MetadataRoute.Sitemap = works.map((w: { slug: string }) => ({
    url: `${baseUrl}/works/${w.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticPages, ...blogUrls, ...serviceUrls, ...workUrls];
}
