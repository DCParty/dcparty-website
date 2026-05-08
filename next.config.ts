import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "prod-files-secure.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "*.notion.so" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "dcfilms.tv" },
      { protocol: "https", hostname: "www.dcfilms.tv" },
      { protocol: "https", hostname: "opengraph.githubassets.com" },
      { protocol: "https", hostname: "image.thum.io" },
      { protocol: "https", hostname: "api.microlink.io" },
    ],
  },
  async redirects() {
    return [
      // 舊 WordPress /portfolio/[slug]/ → 新 /projects/[slug]
      {
        source: "/portfolio/:slug/",
        destination: "/projects/:slug",
        permanent: true,
      },
      {
        source: "/portfolio/:slug",
        destination: "/projects/:slug",
        permanent: true,
      },
      // 舊作品列表頁
      { source: "/projects/", destination: "/projects", permanent: true },
      // 英文版
      { source: "/en/projects/", destination: "/projects", permanent: true },
      { source: "/en/projects", destination: "/projects", permanent: true },
      { source: "/en/", destination: "/", permanent: true },
      { source: "/en", destination: "/", permanent: true },
      // 舊頁面
      { source: "/contact-us/", destination: "/contact", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/dc-films-about/", destination: "/about", permanent: true },
      { source: "/dc-films-about", destination: "/about", permanent: true },
      { source: "/services/", destination: "/about", permanent: true },
      { source: "/services", destination: "/about", permanent: true },
      { source: "/process/", destination: "/about", permanent: true },
      { source: "/process", destination: "/about", permanent: true },
      { source: "/rent/", destination: "/contact", permanent: true },
      { source: "/rent", destination: "/contact", permanent: true },
      { source: "/solution/", destination: "/contact", permanent: true },
      { source: "/solution", destination: "/contact", permanent: true },
      { source: "/hr/", destination: "/about", permanent: true },
      { source: "/hr", destination: "/about", permanent: true },
    ];
  },
};

export default nextConfig;
