import { getSiteSettings, getPricingPlans, getFAQs } from "@/lib/notion";
import { SubscribeClient } from "@/components/SubscribeClient";
import type { Metadata } from "next";

export const revalidate = 3600;

const subscribeTitle = "訂閱方案 — DCParty";
const subscribeDescription =
  "一個月費 NT$4,999，無限數位需求。網頁、軟體、UI/UX、品牌設計、音樂製作——一次提一項，做完換下一個。無限修改直到滿意。";
const shareImage =
  "https://res.cloudinary.com/dkfbkya8e/image/upload/f_auto,q_auto/dcparty/works/mupeng-co.png";

export const metadata: Metadata = {
  title: subscribeTitle,
  description: subscribeDescription,
  openGraph: {
    title: subscribeTitle,
    description: subscribeDescription,
    url: "https://www.dcparty.co/subscribe",
    siteName: "DCParty",
    locale: "zh_TW",
    type: "website",
    images: [{ url: shareImage, width: 1200, height: 630, alt: subscribeTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: subscribeTitle,
    description: subscribeDescription,
    images: [shareImage],
  },
  alternates: { canonical: "/subscribe" },
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
