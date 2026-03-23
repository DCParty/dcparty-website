import { getPublishedBlogPosts } from "@/lib/notion-dcfilms";
import { BlogPageClient } from "@/components/dcfilms/BlogPageClient";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Journal",
  description: "觀點、技術日誌與幕後紀實。影像製作知識分享。",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  return <BlogPageClient posts={posts} />;
}
