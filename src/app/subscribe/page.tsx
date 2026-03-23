import { getSiteSettings, getPricingPlans, getFAQs } from "@/lib/notion";
import { SubscribeClient } from "@/components/SubscribeClient";
import type { Metadata } from "next";

export const revalidate = 10;

export const metadata: Metadata = {
  title: "訂閱方案 — DCParty",
  description:
    "一個月費 NT$20,000，無限數位需求。網頁、軟體、UI/UX、品牌設計、音樂製作——一次提一項，做完換下一個。無限修改直到滿意。",
};

export default async function SubscribePage() {
  const [siteSettings, pricing, faqs] = await Promise.all([
    getSiteSettings(),
    getPricingPlans(),
    getFAQs(),
  ]);

  return (
    <SubscribeClient
      siteSettings={siteSettings}
      initialPricing={pricing}
      initialFAQs={faqs}
    />
  );
}
