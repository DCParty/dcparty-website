import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dcfilms.tv";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/blog"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
