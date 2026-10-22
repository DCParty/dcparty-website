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
      { protocol: "https", hostname: "opengraph.githubassets.com" },
      { protocol: "https", hostname: "image.thum.io" },
      { protocol: "https", hostname: "api.microlink.io" },
    ],
  },
  async redirects() {
    return [
      // 這幾個路徑曾是誤放在本站的 DC Films 頁面（DC Films 在 dcfilms-website repo），一律導回首頁
      { source: "/about", destination: "/", permanent: true },
      { source: "/contact", destination: "/", permanent: true },
      { source: "/projects/:path*", destination: "/", permanent: true },
      // 服務總覽在首頁 #services 區塊；用暫時轉址，日後若做獨立總覽頁不會被瀏覽器快取綁住
      { source: "/services", destination: "/#services", permanent: false },
    ];
  },
};

export default nextConfig;
