"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  MessageSquare,
  PackageCheck,
  ChevronDown,
} from "lucide-react";
import type { SiteSettings } from "@/components/HomeClient";

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } };
const stagger = { initial: {}, animate: { transition: { staggerChildren: 0.1 } } };
const viewport = { once: true, amount: 0.15 as const };

const DEFAULT_PRICING = [
  { name: "訂閱制方案", price: "20,000", priceUnit: "月", desc: "一個月費，無限需求。一次進行一項，做完換下一個。", features: ["無限需求，一次進行一項", "無限修改直到滿意", "隨時可暫停，剩餘天數保留", "第一週取消退還 75%", "專屬 LINE + Email 進度通知", "涵蓋：網頁、軟體、UI/UX、品牌設計、音樂製作"], btn: "立即諮詢", popular: true },
];

const DEFAULT_FAQs = [
  { id: "faq-1", question: "可以做哪些類型的需求？", answer: "涵蓋網頁設計與開發、軟體/App 開發、UI/UX 設計、品牌視覺設計、音樂製作等數位創作需求。" },
  { id: "faq-2", question: "一個月可以提幾個需求？", answer: "無限個！我們一次進行一項需求，完成後立即進行下一項。沒有數量上限。" },
  { id: "faq-3", question: "不滿意可以修改幾次？", answer: "無限修改，直到你滿意為止。我們不限修改次數。" },
  { id: "faq-4", question: "如何提交需求？", answer: "訂閱後我們會開立專屬 LINE 溝通群組，你可以隨時透過文字、圖片、影片說明來提交需求。" },
  { id: "faq-5", question: "可以暫停訂閱嗎？", answer: "可以。暫停後剩餘天數會保留，等你準備好了再繼續使用。" },
  { id: "faq-6", question: "取消訂閱可以退款嗎？", answer: "訂閱第一週內取消可退還 75%。超過一週則不退款，但你可以繼續使用至當月結束。" },
  { id: "faq-7", question: "訂閱包含哪些服務範圍？什麼不包含？", answer: "包含所有數位創作需求（網頁、軟體、設計、音樂）。不包含實體印刷品製作、影片拍攝（後製剪輯包含）、以及需要第三方授權的素材購買。" },
  { id: "faq-8", question: "每項需求多久會完成？", answer: "視需求複雜度而定。簡單的設計或修改通常 1-2 個工作天，較複雜的網站或軟體開發可能需要 1-2 週。我們會在收到需求後給出預估時程。" },
];

type PricingPlan = { name: string; price: string; priceUnit: string; desc: string; features: string[]; btn: string; popular: boolean };
type FAQ = { id: string; question: string; answer: string };

export function SubscribeClient({
  siteSettings,
  initialPricing,
  initialFAQs,
}: {
  siteSettings?: SiteSettings | null;
  initialPricing?: PricingPlan[];
  initialFAQs?: FAQ[];
}) {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const site = siteSettings ?? { brandName: "DCPARTY", brandColor: "#E23D28", backgroundColor: "#0A0A0A", contactEmail: "jeremy@dcparty.co" };
  const pricing = initialPricing?.length ? initialPricing : DEFAULT_PRICING;
  const faqs = initialFAQs?.length ? initialFAQs : DEFAULT_FAQs;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Back nav */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> 回首頁
          </Link>
          <span className="text-xl font-black tracking-widest text-white">DCPARTY</span>
          <Link href="/#contact" className="text-sm font-medium text-[#E23D28] hover:text-[#c93623] transition-colors">
            聯絡我們
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
            訂閱制數位服務
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            一個月費，<br />無限數位需求
          </motion.h1>
          <motion.p variants={fadeUp} className="text-neutral-400 text-lg font-light max-w-xl mx-auto">
            網頁、軟體、設計、音樂——一次提一項，做完換下一個。無限修改直到滿意。
          </motion.p>
        </motion.div>
      </section>

      {/* How it works */}
      <motion.section className="py-20 px-6" initial="initial" whileInView="animate" viewport={viewport} variants={stagger}>
        <div className="max-w-5xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-white tracking-tight text-center mb-16">如何運作？</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <CreditCard className="w-8 h-8 text-[#E23D28]" />, step: "Step 1", title: "訂閱", desc: "訂閱月費方案，開立專屬溝通群組（LINE）。" },
              { icon: <MessageSquare className="w-8 h-8 text-[#E23D28]" />, step: "Step 2", title: "提需求", desc: "隨時透過 LINE 提交需求，文字、圖片、影片說明都可以。一次進行一項，完成後自動進行下一項。" },
              { icon: <PackageCheck className="w-8 h-8 text-[#E23D28]" />, step: "Step 3", title: "交付", desc: "收到成品，不滿意可無限修改直到滿意為止。" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="relative p-8 rounded-[2rem] bg-neutral-900/50 border border-neutral-800 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 mb-6">
                  {item.icon}
                </div>
                <div className="text-[11px] font-bold text-[#E23D28] uppercase tracking-widest mb-2">{item.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-neutral-400 text-sm font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing */}
      <motion.section className="py-20 px-6 border-t border-neutral-900" initial="initial" whileInView="animate" viewport={viewport} variants={stagger}>
        <div className="max-w-xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-white tracking-tight text-center mb-16">單一定價，簡單透明</motion.h2>
          {pricing.map((p, i) => (
            <motion.div key={i} variants={fadeUp} className="relative pt-4">
              {p.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-[#E23D28] text-white text-[11px] font-bold px-5 py-1.5 rounded-full tracking-widest shadow-lg uppercase whitespace-nowrap">
                  推薦方案
                </div>
              )}
              <div className="relative p-10 rounded-[2.5rem] border bg-neutral-900 border-[#E23D28]/50 shadow-2xl shadow-[#E23D28]/10">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-3">{p.name}</h3>
                  <p className="text-neutral-400 text-sm mb-6 font-light leading-relaxed">{p.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-neutral-500 text-lg font-light mb-1">NT$</span>
                    <span className="text-5xl font-black tracking-tight text-white">{p.price}</span>
                    {p.priceUnit && <span className="text-neutral-500 text-sm ml-1 mb-1">/ {p.priceUnit}</span>}
                  </div>
                </div>
                <div className="h-px bg-neutral-800 w-full mb-8" />
                <ul className="space-y-4 mb-10">
                  {(p.features ?? []).map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-neutral-300">
                      <div className="mt-1 shrink-0">
                        <Check className="w-4 h-4 text-[#E23D28]" strokeWidth={3} />
                      </div>
                      <span className="text-sm leading-relaxed font-light">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/#contact">
                  <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="block w-full py-4 rounded-full font-bold text-sm text-center bg-[#E23D28] hover:bg-[#c93623] text-white shadow-lg shadow-[#E23D28]/25 transition-colors">
                    {p.btn}
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section className="py-20 px-6 border-t border-neutral-900 bg-neutral-950/50" initial="initial" whileInView="animate" viewport={viewport} variants={stagger}>
        <div className="max-w-3xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-white tracking-tight text-center mb-16">常見問題</motion.h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <motion.div key={faq.id} variants={fadeUp} className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900/50">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                >
                  <span className="text-white font-semibold text-sm">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform ${openFaq === faq.id ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === faq.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <div className="px-6 pb-5 text-neutral-400 text-sm font-light leading-relaxed">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 border-t border-neutral-900 text-center">
        <motion.div initial="initial" whileInView="animate" viewport={viewport} variants={stagger} className="max-w-2xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-white tracking-tight mb-6">準備好開始了嗎？</motion.h2>
          <motion.p variants={fadeUp} className="text-neutral-400 text-lg font-light mb-10">一個月費，無限可能。</motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/#contact">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg text-base bg-[#E23D28] hover:bg-[#c93623]">
                立即諮詢 <ArrowRight className="w-5 h-5" />
              </motion.span>
            </Link>
            <Link href="/" className="bg-transparent hover:bg-neutral-900 text-neutral-300 border border-neutral-700 px-8 py-4 rounded-full font-medium transition-all text-base text-center">
              回首頁
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-neutral-900 text-center text-neutral-600 text-xs font-light tracking-wider uppercase">
        © {new Date().getFullYear()} DCPARTY. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
