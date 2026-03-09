import {
  getSiteSettings,
  getServices,
  getPublishedWorks,
  getPricingPlans,
  getSocialLinks,
  getNavLinks,
  getTestimonials,
  getPartnerLogos,
} from "@/lib/notion";
import { HomeClient } from "@/components/HomeClient";

/** 每 10 秒可重新向 Notion 拉取，變更會盡快同步到網站 */
export const revalidate = 10;

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

export async function generateMetadata() {
  return baseUrl ? { alternates: { canonical: baseUrl } } : {};
}

/**
 * 首頁為 Server Component：在伺服器端從 Notion 拉取全站 CMS 資料，
 * 再傳給 HomeClient 渲染。
 */
export default async function Home() {
  const [siteSettings, services, works, pricing, socialLinks, navLinks, testimonials, partnerLogos] =
    await Promise.all([
      getSiteSettings(),
      getServices(),
      getPublishedWorks(),
      getPricingPlans(),
      getSocialLinks(),
      getNavLinks(),
      getTestimonials(),
      getPartnerLogos(),
    ]);

  return (
    <HomeClient
      siteSettings={siteSettings}
      initialServices={services}
      initialWorks={works}
      initialPricing={pricing}
      socialLinks={socialLinks}
      navLinks={navLinks}
      testimonials={testimonials}
      partnerLogos={partnerLogos}
    />
  );
}
