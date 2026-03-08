"use client";

import { motion } from "framer-motion";

const plans = [
  {
    name: "基礎形象",
    price: "NT$ 12,000 起",
    highlight: false,
    features: [
      "單頁形象網站設計",
      "最多 5 組作品展示",
      "手機與平板響應式版型",
      "基本 SEO 設定",
    ],
  },
  {
    name: "專業品牌",
    price: "NT$ 32,000 起",
    highlight: true,
    features: [
      "多頁式作品集網站",
      "不限數量作品上架結構",
      "品牌風格客製設計",
      "部落格／動態發布區",
      "進階追蹤與分析整合",
    ],
  },
  {
    name: "全方位顧問",
    price: "專案報價",
    highlight: false,
    features: [
      "網站架構與內容策略顧問",
      "多語系與國際版規劃",
      "完整品牌與數位行銷整合",
      "一對一長期顧問合作",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
          服務與價格
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-slate-300">
          依照品牌階段與預算，選擇最適合你的方案。所有價格僅為示意，你可以依照實際服務內容自由調整。
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <motion.article
            key={plan.name}
            whileHover={{ scale: plan.highlight ? 1.04 : 1.02 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className={`flex flex-col rounded-2xl border bg-gradient-to-b p-6 shadow-lg ${
              plan.highlight
                ? "border-amber-400/80 from-zinc-950 via-zinc-900 to-zinc-900 shadow-amber-500/30"
                : "border-white/10 from-zinc-950 via-zinc-950 to-zinc-900/80 shadow-black/40"
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-50">
                {plan.name}
              </h2>
              {plan.highlight && (
                <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/40">
                  推薦方案
                </span>
              )}
            </div>
            <p className="mb-5 text-sm font-medium text-amber-300">
              {plan.price}
            </p>
            <ul className="mb-6 space-y-2 text-xs sm:text-sm text-slate-200">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-300" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <button
                type="button"
                className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                    : "border border-white/20 bg-white/5 text-slate-50 hover:bg-white/10"
                }`}
              >
                立即預約
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

