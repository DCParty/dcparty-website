import {
  getSiteSettings,
  getServices,
  getPublishedWorks,
  getPricingPlans,
  getSocialLinks,
  getNavLinks,
  getTestimonials,
  getPartnerLogos,
  getFAQs,
} from "@/lib/notion";
import { getDCPartyGitHubRepos } from "@/lib/github";
import { HomeClient } from "@/components/HomeClient";

/** 每小時向 Notion 拉取一次，減少冷啟動頻率 */
export const revalidate = 3600;

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
  const [siteSettings, services, works, pricing, socialLinks, navLinks, testimonials, partnerLogos, faqs, githubRepos] =
    await Promise.all([
      getSiteSettings(),
      getServices(),
      getPublishedWorks(),
      getPricingPlans(),
      getSocialLinks(),
      getNavLinks(),
      getTestimonials(),
      getPartnerLogos(),
      getFAQs(),
      getDCPartyGitHubRepos(),
    ]);

  return (
    <HomeClient
      siteSettings={siteSettings}
      initialServices={services}
      initialWorks={[...works, ...githubRepos]}
      initialPricing={pricing}
      socialLinks={socialLinks}
      navLinks={navLinks}
      testimonials={testimonials}
      partnerLogos={partnerLogos}
      initialFAQs={faqs}
    />
  );
}
