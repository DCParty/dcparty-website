import { Navbar } from "@/components/dcfilms/Navbar";
import { Footer } from "@/components/dcfilms/Footer";
import Link from "next/link";
import type { Metadata } from "next";

const TITLE = "服務與報價｜企業形象影片・商業攝影費用｜DC Films 影像製作";
const DESC =
  "DC Films 影像製作服務與費用參考：企業形象影片 NT$80,000 起、商品影片 NT$40,000 起、商業攝影半天 NT$12,000 起。台北專業影像團隊，導演親自執導，提供影片與攝影一站式製作。";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "DC Films 影像製作",
    title: TITLE,
    description: DESC,
  },
  alternates: { canonical: "https://dcfilms.tv/services" },
};

/** 服務項目與費用參考 */
const SERVICES = [
  {
    en: "Corporate Film",
    zh: "企業形象影片",
    price: "NT$ 80,000",
    unit: "起",
    desc: "為品牌建立完整的形象敘事。從腳本企劃、分鏡設計到現場執導與後期調光，由導演全程把關。適合品牌官網主視覺、展會播放、投資人簡報。",
    includes: ["前期企劃與腳本", "分鏡設計", "專業攝影團隊", "後期剪輯調光", "配樂與音效"],
  },
  {
    en: "Product Film",
    zh: "商品／產品影片",
    price: "NT$ 40,000",
    unit: "起",
    desc: "聚焦單一產品的質感與功能演繹。適合電商上架、新品發表、社群投放。可搭配 3D 動畫呈現產品結構與使用情境。",
    includes: ["產品腳本規劃", "棚內拍攝", "動態運鏡", "後期合成", "多版本剪輯"],
  },
  {
    en: "Commercial Photography",
    zh: "商業攝影",
    price: "NT$ 12,000",
    unit: "起／半天",
    desc: "商業級平面攝影，涵蓋產品、形象與空間。全天方案 NT$ 25,000 起，適合需要大量素材的品牌改版或年度視覺更新。",
    includes: ["棚拍或外景", "專業燈光", "數位修圖", "多角度素材", "商用授權"],
  },
  {
    en: "Animation & VFX",
    zh: "動畫與視覺特效",
    price: "專案報價",
    unit: "",
    desc: "2D／3D 動畫與視覺特效製作。突破實拍限制，適合產品結構解說、抽象概念視覺化、科技感品牌敘事。可獨立製作或與實拍整合。",
    includes: ["概念設計", "3D 建模與算圖", "2D 動態圖像", "實拍合成", "動態識別"],
  },
];

const BUNDLE = {
  zh: "影片 ＋ 攝影包套",
  price: "NT$ 100,000",
  unit: "起",
  desc: "同一檔期完成影片與平面拍攝，共用團隊與場景，比分開發包節省約兩成成本，視覺調性也更一致。",
};

const FAQ = [
  {
    q: "報價包含哪些項目？",
    a: "上述費用涵蓋企劃、拍攝、後期製作與一次完整交付。不含演員、場地租借、特殊器材與商業音樂授權，這些會在報價單中分列，讓你清楚每一筆錢的去向。",
  },
  {
    q: "為什麼形象影片與商品影片價差這麼大？",
    a: "形象影片需要完整的品牌敘事建構，前期企劃與分鏡的投入通常是商品影片的兩到三倍，拍攝天數與場景數量也較多。商品影片聚焦單一產品，流程相對標準化。",
  },
  {
    q: "可以只做後期或只做拍攝嗎？",
    a: "可以。若你已有素材需要剪輯調光，或已有腳本只需執行拍攝，我們都能單獨承接，依實際工作量報價。",
  },
  {
    q: "從確認到交片需要多久？",
    a: "商品影片約 3 至 4 週，企業形象影片約 5 至 8 週，視前期確認速度與拍攝檔期而定。急件可另行討論。",
  },
];

export default function ServicesPage() {
  // 報價與常見問題的結構化資料
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OfferCatalog",
        name: "DC Films 影像製作服務",
        url: "https://dcfilms.tv/services",
        provider: { "@id": "https://dcfilms.tv/#organization" },
        itemListElement: SERVICES.filter((s) => s.price !== "專案報價").map((s, i) => ({
          "@type": "Offer",
          position: i + 1,
          itemOffered: { "@type": "Service", name: s.zh, description: s.desc },
          priceCurrency: "TWD",
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "TWD",
            minPrice: Number(s.price.replace(/[^\d]/g, "")),
            valueAddedTaxIncluded: false,
          },
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="bg-[#F5F0E8] dark:bg-black min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Navbar />

      <div className="pt-48 pb-32 px-8 md:px-16 max-w-[1400px] mx-auto">
        <div className="text-center mb-32">
          <h1 className="text-6xl md:text-8xl font-serif text-stone-900 dark:text-white italic mb-8">
            Services.
          </h1>
          <p className="text-stone-400 dark:text-zinc-400 tracking-widest uppercase text-sm">
            服務項目與費用參考
          </p>
        </div>

        <div className="mb-24 border-t border-stone-200 dark:border-white/10" />

        <div className="max-w-3xl mx-auto text-center mb-32">
          <h2 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-white leading-relaxed mb-8 italic">
            &ldquo;每一支影片都由導演親自執導，<br />
            預算花在畫面上，不是花在溝通試錯上。&rdquo;
          </h2>
          <p className="text-stone-500 dark:text-zinc-400 leading-loose">
            DC Films 專注於商業影像製作 —— 企業形象、品牌廣告、產品影片與商業攝影。
            以下為各項服務的費用參考區間，實際報價依拍攝天數、場景數量、後期複雜度與素材授權範圍而定。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-stone-200 dark:bg-white/10 mb-32">
          {SERVICES.map((s) => (
            <div key={s.en} className="bg-[#F5F0E8] dark:bg-black p-10 md:p-14 flex flex-col">
              <p className="text-stone-400 dark:text-zinc-600 tracking-[0.2em] uppercase text-xs mb-4">
                {s.en}
              </p>
              <h3 className="text-3xl font-serif text-stone-900 dark:text-white italic mb-6">
                {s.zh}
              </h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-2xl md:text-3xl text-stone-900 dark:text-white font-light tracking-tight">
                  {s.price}
                </span>
                {s.unit && (
                  <span className="text-sm text-stone-400 dark:text-zinc-500">{s.unit}</span>
                )}
              </div>
              <p className="text-stone-500 dark:text-zinc-400 text-sm leading-loose mb-8 flex-1">
                {s.desc}
              </p>
              <ul className="space-y-2 border-t border-stone-200 dark:border-white/10 pt-6">
                {s.includes.map((item) => (
                  <li
                    key={item}
                    className="text-stone-500 dark:text-zinc-500 text-xs tracking-wide flex items-center gap-3"
                  >
                    <span className="w-1 h-1 bg-stone-400 dark:bg-zinc-600 rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-stone-900 dark:bg-white/5 p-12 md:p-20 text-center mb-32">
          <p className="text-stone-400 dark:text-zinc-500 tracking-[0.2em] uppercase text-xs mb-4">
            Bundle
          </p>
          <h3 className="text-3xl md:text-4xl font-serif text-white italic mb-6">{BUNDLE.zh}</h3>
          <div className="flex items-baseline justify-center gap-2 mb-8">
            <span className="text-3xl md:text-4xl text-white font-light tracking-tight">
              {BUNDLE.price}
            </span>
            <span className="text-sm text-stone-400 dark:text-zinc-500">{BUNDLE.unit}</span>
          </div>
          <p className="text-stone-300 dark:text-zinc-400 text-sm leading-loose max-w-xl mx-auto">
            {BUNDLE.desc}
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-32">
          <h2 className="text-2xl font-serif text-stone-900 dark:text-white italic mb-10 text-center">
            關於費用
          </h2>
          <dl className="space-y-8">
            {FAQ.map((f) => (
              <div key={f.q} className="border-t border-stone-200 dark:border-white/10 pt-8">
                <dt className="text-stone-900 dark:text-white mb-3 tracking-wide">{f.q}</dt>
                <dd className="text-stone-500 dark:text-zinc-400 text-sm leading-loose">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="text-center">
          <p className="text-stone-500 dark:text-zinc-400 mb-10 leading-loose">
            每個專案的需求都不同。<br />
            告訴我們你的目標與預算範圍，我們會給出具體的執行建議。
          </p>
          <Link
            href="/contact"
            className="inline-block border border-stone-900 dark:border-white text-stone-900 dark:text-white px-12 py-5 text-sm tracking-[0.2em] uppercase hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            索取專案報價
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
