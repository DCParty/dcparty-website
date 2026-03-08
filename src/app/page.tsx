import {
  getSiteSettings,
  getServices,
  getPublishedWorks,
  getPricingPlans,
  getSocialLinks,
  getNavLinks,
} from "@/lib/notion";
import { HomeClient } from "@/components/HomeClient";

/** 每 60 秒可重新向 Notion 拉取，變更會自動同步到網站，無需重新部署 */
export const revalidate = 60;

/**
 * 首頁為 Server Component：在伺服器端從 Notion 拉取全站 CMS 資料，
 * 再傳給 HomeClient 渲染。
 */
export default async function Home() {
  const [siteSettings, services, works, pricing, socialLinks, navLinks] =
    await Promise.all([
      getSiteSettings(),
      getServices(),
      getPublishedWorks(),
      getPricingPlans(),
      getSocialLinks(),
      getNavLinks(),
    ]);

  return (
    <HomeClient
      siteSettings={siteSettings}
      initialServices={services}
      initialWorks={works}
      initialPricing={pricing}
      socialLinks={socialLinks}
      navLinks={navLinks}
    />
  );
}
