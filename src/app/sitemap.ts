import { MetadataRoute } from "next";
import { getAllWorkEntries, getAllBlogEntries, getAllServiceEntries } from "@/lib/notion";

// 每小時重新產生 sitemap（ISR），避免 lastmod 凍結在 build 時間
export const revalidate = 3600;

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dcparty.co").replace(/\/$/, "");

type Entry = { slug: string; lastEdited?: string };

/** 將路徑做 percent-encoding；先 decode 避免已編碼的 slug 被二次編碼 */
function toUrl(path: string): string {
  let raw = path;
  try {
    raw = decodeURI(path);
  } catch {
    // 非合法編碼序列，維持原字串
  }
  return `${baseUrl}${encodeURI(raw)}`;
}

function toDate(iso?: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function latest(...lists: Entry[][]): Date | undefined {
  let max: number | undefined;
  for (const list of lists) {
    for (const e of list) {
      const t = toDate(e.lastEdited)?.getTime();
      if (t !== undefined && (max === undefined || t > max)) max = t;
    }
  }
  return max === undefined ? undefined : new Date(max);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [works, blogs, services] = await Promise.all([
    getAllWorkEntries().catch(() => [] as Entry[]),
    getAllBlogEntries().catch(() => [] as Entry[]),
    getAllServiceEntries().catch(() => [] as Entry[]),
  ]);

  const siteLatest = latest(works, blogs, services);
  const blogLatest = latest(blogs) ?? siteLatest;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: siteLatest, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/subscribe`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: blogLatest, changeFrequency: "weekly", priority: 0.8 },
  ];

  const routes = (prefix: string, list: Entry[], priority: number): MetadataRoute.Sitemap =>
    list.map(({ slug, lastEdited }) => ({
      url: toUrl(`/${prefix}/${slug}`),
      lastModified: toDate(lastEdited),
      changeFrequency: "monthly" as const,
      priority,
    }));

  return [
    ...staticPages,
    ...routes("works", works, 0.8),
    ...routes("blog", blogs, 0.7),
    ...routes("services", services, 0.7),
  ];
}
