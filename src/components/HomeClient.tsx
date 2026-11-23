"use client";

import { useState, useEffect, useRef, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { Check, Menu, X, ArrowRight, ArrowUpRight, Mail, Phone, MessageCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types & defaults (Notion 讀不到時才會用到)                           */
/* ------------------------------------------------------------------ */

export type WorkItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  image?: string;
  url?: string;
  description?: string;
};

export type SiteSettings = {
  brandName: string;
  logoUrl: string;
  brandColor: string;
  backgroundColor: string;
  navServices: string;
  navWork: string;
  navPricing: string;
  navCta: string;
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroTitleHighlight: string;
  heroDesc: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  contactEmail: string;
  contactPhone: string;
  contactModalLabel: string;
  contactModalTitle: string;
  contactModalDesc: string;
  footerTagline: string;
  footerCopyright: string;
};

const DEFAULT_SITE: SiteSettings = {
  brandName: "DCPARTY",
  logoUrl: "",
  brandColor: "#E23D28",
  backgroundColor: "#0A0A0A",
  navServices: "服務",
  navWork: "作品",
  navPricing: "訂閱方案",
  navCta: "線上諮詢",
  heroBadge: "AI 驅動的訂閱制數位服務",
  heroTitleLine1: "訂閱一個月費，",
  heroTitleLine2: "無限數位需求",
  heroTitleHighlight: "立即開始",
  heroDesc: "網頁、軟體、設計、音樂——一次提一項，做完換下一個。無限修改直到滿意。",
  heroCtaPrimary: "立即訂閱",
  heroCtaSecondary: "了解更多",
  contactEmail: "jeremy@dcparty.co",
  contactPhone: "0935503966",
  contactModalLabel: "Let's Talk",
  contactModalTitle: "有興趣訂閱？先聊聊",
  contactModalDesc: "留下你的聯絡方式，我們會在 24 小時內回覆。",
  footerTagline: "AI 驅動，訂閱制。你的全方位數位創作夥伴。",
  footerCopyright: "ALL RIGHTS RESERVED.",
};

const DEFAULT_SERVICES = [
  { id: "default-1", title: "網頁設計與開發", desc: "一頁式網站、品牌形象網站、Landing Page，從設計到上線一手包辦。", tag: "Web Design", slug: "web-design", icon: "Code" },
  { id: "default-2", title: "軟體 / App 開發", desc: "Web App、工具型軟體、API 串接、自動化流程建置。", tag: "Software Dev", slug: "software-dev", icon: "Code" },
  { id: "default-3", title: "UI/UX 設計", desc: "介面設計、互動原型、使用者流程規劃。", tag: "UI/UX Design", slug: "ui-ux-design", icon: "Image" },
  { id: "default-4", title: "品牌視覺設計", desc: "Logo、品牌識別系統、社群素材、廣告視覺。", tag: "Brand Design", slug: "brand-design", icon: "Image" },
  { id: "default-5", title: "音樂製作", desc: "原創配樂、廣告音效、Podcast 片頭、混音製作。", tag: "Music Production", slug: "music-production", icon: "Music" },
];

const DEFAULT_PRICING = [
  { name: "訂閱制方案", price: "4,999", priceUnit: "月", desc: "一個月費，無限需求。一次進行一項，做完換下一個。", features: ["無限需求，一次進行一項", "無限修改直到滿意", "隨時可暫停，剩餘天數保留", "專屬 LINE + Email 進度通知", "涵蓋：網頁、軟體、UI/UX、品牌設計、音樂製作"], btn: "立即訂閱", popular: true },
];

const DEFAULT_NAV_LINKS = [
  { name: "服務", href: "#services" },
  { name: "作品", href: "#work" },
  { name: "訂閱方案", href: "/subscribe" },
];

const EXTRA_SOCIAL_LINKS = [
  { name: "LINE 官方帳號", url: "https://line.me/ti/p/@936qaahz" },
  { name: "Vimeo", url: "https://vimeo.com/dreamcatcherstudio" },
  { name: "Facebook", url: "https://www.facebook.com/DCFILMS.TV/" },
] as const;

const LINE_URL = "https://line.me/ti/p/@936qaahz";

const DEFAULT_WORKS: WorkItem[] = [
  { id: "default-work-1", title: "沐朋室內設計", slug: "mupeng", category: "網頁設計", image: "https://res.cloudinary.com/dkfbkya8e/image/upload/f_auto,q_auto/dcparty/works/mupeng-co.png", url: "https://mupeng.co", description: "室內設計公司品牌網站，展現空間美學與設計理念。" },
  { id: "default-work-2", title: "麗晨建設 Live True", slug: "livetrue", category: "品牌設計", image: "https://res.cloudinary.com/dkfbkya8e/image/upload/f_auto,q_auto/dcparty/works/livetrue-com-tw.png", url: "https://livetrue.com.tw", description: "高端建設品牌形象網站，強化市場定位與購屋體驗。" },
  { id: "default-work-3", title: "影製所 DC Film School", slug: "dcfilmschool", category: "網頁設計", image: "https://res.cloudinary.com/dkfbkya8e/image/upload/f_auto,q_auto/dcparty/works/dcfilmschool-com.png", url: "https://dcfilmschool.com", description: "影視教育機構官網，展示課程特色與學員作品成果。" },
];

const DEFAULT_FAQs: { id: string; question: string; answer: string }[] = [
  { id: "faq-1", question: "可以做哪些類型的需求？", answer: "涵蓋網頁設計與開發、軟體/App 開發、UI/UX 設計、品牌視覺設計、音樂製作等數位創作需求。" },
  { id: "faq-2", question: "一個月可以提幾個需求？", answer: "無限個！我們一次進行一項需求，完成後立即進行下一項。沒有數量上限。" },
  { id: "faq-3", question: "不滿意可以修改幾次？", answer: "無限修改，直到你滿意為止。我們不限修改次數。" },
  { id: "faq-4", question: "如何提交需求？", answer: "訂閱後我們會開立專屬 LINE 溝通群組，你可以隨時透過文字、圖片、影片說明來提交需求。" },
  { id: "faq-5", question: "可以暫停訂閱嗎？", answer: "可以。暫停後剩餘天數會保留，等你準備好了再繼續使用。" },
];

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const EASE = [0.2, 0.7, 0.2, 1] as const;

const noopSubscribe = () => () => {};

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p className="m-0 text-sm tracking-[0.12em]" style={{ color }}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Hero：即時示意需求看板                                              */
/* ------------------------------------------------------------------ */

type Task = { name: string; tag: string };

const POOL: Task[] = [
  { name: "活動 Landing Page", tag: "網頁" },
  { name: "菜單與海報設計", tag: "品牌" },
  { name: "會員後台介面", tag: "UI/UX" },
  { name: "庫存自動化流程", tag: "軟體" },
  { name: "品牌形象影片配樂", tag: "音樂" },
  { name: "官網部落格頁", tag: "網頁" },
  { name: "年度社群視覺", tag: "品牌" },
];

type BoardState = {
  cur: Task;
  progress: number;
  queue: Task[];
  done: string[];
  cursor: number;
  toast: string;
  toastTicks: number;
};

const INITIAL_BOARD: BoardState = {
  cur: { name: "品牌官網首頁改版", tag: "網頁" },
  progress: 24,
  queue: [
    { name: "Logo 延伸應用", tag: "品牌" },
    { name: "IG 貼文素材 ×6", tag: "品牌" },
    { name: "Podcast 片頭配樂", tag: "音樂" },
  ],
  done: ["Landing Page 上線", "預約表單串接", "名片設計"],
  cursor: 0,
  toast: "",
  toastTicks: 0,
};

function stepBoard(s: BoardState): BoardState {
  const p = s.progress + 7;
  const toastTicks = Math.max(0, s.toastTicks - 1);
  if (p < 100) return { ...s, progress: p, toastTicks };
  const queue = s.queue.slice();
  let cursor = s.cursor;
  let next = queue.shift();
  if (!next) {
    next = POOL[cursor % POOL.length];
    cursor++;
  }
  while (queue.length < 3) {
    queue.push(POOL[cursor % POOL.length]);
    cursor++;
  }
  return {
    cur: next,
    progress: 0,
    queue,
    cursor,
    done: [s.cur.name, ...s.done].slice(0, 3),
    toast: s.cur.name,
    toastTicks: 5,
  };
}

function LiveBoard({ accent, incoming }: { accent: string; incoming: { key: number; items: Task[] } }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [s, setS] = useState<BoardState>(INITIAL_BOARD);
  const [seenKey, setSeenKey] = useState(0);
  if (incoming.key !== seenKey) {
    setSeenKey(incoming.key);
    setS((p) => ({ ...p, queue: [...p.queue, ...incoming.items].slice(0, 10) }));
  }

  useEffect(() => {
    if (!inView || reduce) return;
    const t = setInterval(() => setS(stepBoard), 520);
    return () => clearInterval(t);
  }, [inView, reduce]);

  const p = Math.min(100, s.progress);
  const verLabel = p < 45 ? "第 1 版 · 設計中" : p < 80 ? "第 2 版 · 依回饋修改" : "最終確認中";
  const toastOn = s.toastTicks > 0;

  const addTask = () =>
    setS((prev) => (prev.queue.length >= 6 ? prev : { ...prev, queue: [...prev.queue, POOL[prev.cursor % POOL.length]], cursor: prev.cursor + 1 }));

  return (
    <div ref={ref} className="relative flex min-w-0 flex-[1_1_420px] flex-col gap-4 rounded-[20px] border border-[#26262A] bg-[#131315] p-6">
      <div
        aria-live="polite"
        className="pointer-events-none absolute -top-4 right-5 z-10 rounded-full px-3.5 py-2 text-[13px] font-bold text-[#0B0B0C] shadow-[0_10px_24px_rgba(0,0,0,.4)] transition-all duration-300"
        style={{ background: accent, opacity: toastOn ? 1 : 0, transform: `translateY(${toastOn ? 0 : 8}px)` }}
      >
        ✓ 已交付：{s.toast}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <p className="m-0 text-base font-bold">需求看板</p>
          <p className="m-0 flex items-center gap-1.5 text-xs text-[#A1A1A6]">
            <span className="dc-pulse h-[7px] w-[7px] rounded-full" style={{ background: accent }} aria-hidden />
            即時示意
          </p>
        </div>
        <button
          type="button"
          onClick={addTask}
          className="min-h-11 cursor-pointer rounded-full border border-[#2E2E33] bg-[#1E1E22] px-3.5 py-2 text-[13px] text-[#F2F1EE] transition hover:opacity-90 active:scale-95"
        >
          ＋ 新增需求
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-[14px] border border-[#2E2E33] bg-[#1A1A1D] p-[18px]">
        <div className="flex items-center justify-between gap-3">
          <p className="m-0 text-xs font-bold tracking-[0.08em]" style={{ color: accent }}>
            ● 進行中 · {s.cur.tag}
          </p>
          <p className="m-0 text-xs text-[#A1A1A6]">{verLabel}</p>
        </div>
        <p className="m-0 text-lg font-bold">{s.cur.name}</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#2A2A2E]">
          <div className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${p}%`, background: accent }} />
        </div>
        <div className="flex justify-between text-[13px] text-[#A1A1A6]">
          <span>完成後自動接續下一項</span>
          <span>{p}%</span>
        </div>
      </div>

      <p className="m-0 mt-1 text-xs tracking-[0.08em] text-[#8E8E93]">排隊中 · {s.queue.length} 項</p>
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {s.queue.map((q, i) => (
            <motion.div
              key={`${q.name}-${i}-${s.cursor}`}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between gap-3 rounded-[10px] border border-[#222226] px-3.5 py-3 text-sm transition-colors hover:bg-[#1A1A1D]"
            >
              <span>{q.name}</span>
              <span className="text-[#8E8E93]">{q.tag}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p className="m-0 mt-1 text-xs tracking-[0.08em] text-[#8E8E93]">已交付</p>
      <div className="flex flex-wrap gap-2">
        {s.done.map((d, i) => (
          <span key={`${d}-${i}`} className="rounded-full bg-[#1A1A1D] px-3 py-1.5 text-[13px] text-[#A1A1A6]">
            ✓ {d}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 需求試算                                                            */
/* ------------------------------------------------------------------ */

const PICKS = [
  { id: "site", label: "品牌官網", cat: "網頁", tag: "網頁" },
  { id: "lp", label: "活動 Landing Page", cat: "網頁", tag: "網頁" },
  { id: "logo", label: "Logo 與識別", cat: "品牌視覺", tag: "品牌" },
  { id: "social", label: "社群貼文素材", cat: "品牌視覺", tag: "品牌" },
  { id: "ad", label: "廣告視覺", cat: "品牌視覺", tag: "品牌" },
  { id: "ui", label: "App 介面設計", cat: "UI/UX", tag: "UI/UX" },
  { id: "app", label: "Web App／工具", cat: "軟體", tag: "軟體" },
  { id: "auto", label: "自動化流程", cat: "軟體", tag: "軟體" },
  { id: "bgm", label: "廣告配樂", cat: "音樂", tag: "音樂" },
  { id: "pod", label: "Podcast 片頭", cat: "音樂", tag: "音樂" },
];

function Estimator({ accent, priceLabel, onSend }: { accent: string; priceLabel: string; onSend: (items: Task[]) => void }) {
  const [picked, setPicked] = useState<Record<string, boolean>>({ site: true, logo: true, social: true });
  const [sent, setSent] = useState(0);
  const chosen = PICKS.filter((it) => picked[it.id]);
  const catCount = new Set(chosen.map((c) => c.cat)).size;
  const hasSoftware = chosen.some((c) => c.cat === "軟體");

  return (
    <section id="estimate" className="border-t border-[#1F1F23]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-12 px-8 py-[104px]">
        <Reveal className="flex min-w-0 flex-[999_1_560px] flex-col gap-7">
          <div className="flex flex-col gap-3">
            <Eyebrow color={accent}>需求試算</Eyebrow>
            <h2 className="m-0 text-[clamp(32px,3.6vw,48px)] font-black leading-[1.2]">你接下來想做哪些事？</h2>
            <p className="m-0 text-[#A1A1A6]">點選最近想做的項目，看看用訂閱制處理會是什麼樣子。</p>
          </div>
          <div role="group" aria-label="選擇需求項目" className="flex flex-wrap gap-2.5">
            {PICKS.map((it) => {
              const on = !!picked[it.id];
              return (
                <button
                  key={it.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setPicked((p) => ({ ...p, [it.id]: !p[it.id] }));
                    setSent(0);
                  }}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-[18px] py-2.5 text-[15px] transition active:scale-95"
                  style={
                    on
                      ? { background: accent, color: "#0B0B0C", border: `1px solid ${accent}`, fontWeight: 700 }
                      : { background: "transparent", color: "#D8D8DC", border: "1px solid #2E2E33" }
                  }
                >
                  <span aria-hidden>{on ? "✓" : "＋"}</span>
                  {it.label}
                  <span className="text-xs opacity-70">{it.cat}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex min-w-0 flex-[1_1_360px] flex-col gap-[22px] rounded-3xl border border-[#26262A] bg-[#131315] p-8">
          {chosen.length === 0 ? (
            <p className="m-0 text-[#A1A1A6]">先點選左邊幾個你最近想做的項目。</p>
          ) : (
            <>
              <p className="m-0 flex items-baseline gap-2.5">
                <motion.span key={chosen.length} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[64px] font-bold leading-none" style={{ color: accent }}>
                  {chosen.length}
                </motion.span>
                <span className="text-lg">項需求</span>
              </p>
              <div className="flex flex-col gap-1.5 rounded-[14px] border border-[#26262A] p-4">
                <p className="m-0 text-xs tracking-[0.08em] text-[#8E8E93]">傳統做法</p>
                <p className="m-0 text-[#C7C7CC]">
                  分別找 {catCount} 類廠商，逐案詢價 {chosen.length} 次
                </p>
              </div>
              <div className="flex flex-col gap-1.5 rounded-[14px] p-4" style={{ border: `1px solid ${accent}` }}>
                <p className="m-0 text-xs tracking-[0.08em]" style={{ color: accent }}>
                  DCPARTY 訂閱
                </p>
                <p className="m-0">1 個窗口 · {priceLabel} · 排進看板依序完成</p>
              </div>
              {hasSoftware && <p className="m-0 text-[13px] text-[#A1A1A6]">提醒：Web App 或系統規模較大時，可能需要改用客製報價。</p>}
              <button
                type="button"
                onClick={() => {
                  onSend(chosen.map((c) => ({ name: c.label, tag: c.tag })));
                  setSent(chosen.length);
                }}
                className="min-h-11 cursor-pointer rounded-full border-0 p-[15px] font-bold text-[#0B0B0C] transition hover:opacity-90 active:scale-[.97]"
                style={{ background: accent }}
              >
                丟進上方示意看板
              </button>
              {sent > 0 && (
                <a href="#top" className="text-center text-sm" style={{ color: accent }}>
                  已加入 {sent} 項，回首屏看看 ↑
                </a>
              )}
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 服務範疇：動態圖版                                                  */
/* ------------------------------------------------------------------ */

function ArtWeb({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden>
      <g className="dc-float">
        <rect x="60" y="80" width="230" height="160" rx="10" fill="none" stroke="#F2F1EE" strokeWidth="2" />
        <line x1="60" y1="106" x2="290" y2="106" stroke="#F2F1EE" strokeWidth="2" />
        <circle cx="76" cy="93" r="4" fill="#F2F1EE" />
        <circle cx="90" cy="93" r="4" fill="#F2F1EE" />
      </g>
      <g className="dc-float dc-delay">
        <rect x="112" y="152" width="230" height="168" rx="10" fill={accent} />
        <rect x="134" y="188" width="112" height="14" rx="7" fill="#0B0B0C" />
        <rect x="134" y="214" width="168" height="8" rx="4" fill="#0B0B0C" opacity="0.45" />
        <rect x="134" y="230" width="140" height="8" rx="4" fill="#0B0B0C" opacity="0.45" />
        <rect x="134" y="270" width="72" height="28" rx="14" fill="#0B0B0C" />
      </g>
    </svg>
  );
}
function ArtSoftware({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden>
      <circle cx="200" cy="200" r="150" fill="none" stroke="#3A3A40" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="100" fill="none" stroke="#3A3A40" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="50" fill="none" stroke="#F2F1EE" strokeWidth="2" />
      <circle cx="200" cy="200" r="16" fill={accent} />
      <g className="dc-spin">
        <circle cx="350" cy="200" r="11" fill="#F2F1EE" />
      </g>
      <g className="dc-spin-r">
        <circle cx="200" cy="100" r="8" fill={accent} />
      </g>
      <g className="dc-spin-slow">
        <circle cx="150" cy="200" r="5" fill="#F2F1EE" />
      </g>
    </svg>
  );
}
function ArtUI({ accent }: { accent: string }) {
  const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const bright = new Set([1, 5, 6]);
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden>
      {cells.map((i) => {
        const x = 65 + (i % 3) * 100;
        const y = 65 + Math.floor(i / 3) * 100;
        if (i === 4) return <rect key={i} className="dc-pop" x={x} y={y} width="70" height="70" rx="16" fill={accent} />;
        return <rect key={i} x={x} y={y} width="70" height="70" rx="16" fill="none" stroke={bright.has(i) ? "#F2F1EE" : "#3A3A40"} strokeWidth="2" />;
      })}
      <g className="dc-float">
        <path d="M222 214 L222 268 L236 254 L247 278 L257 273 L246 250 L266 250 Z" fill="#F2F1EE" stroke="#0B0B0C" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
function ArtBrand({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden>
      <rect x="70" y="160" width="170" height="170" fill="#F2F1EE" />
      <circle className="dc-float" cx="250" cy="160" r="92" fill={accent} />
      <g className="dc-spin-slow">
        <polygon points="200,92 318,296 82,296" fill="none" stroke="#F2F1EE" strokeWidth="2" />
      </g>
    </svg>
  );
}
function ArtMusic({ accent }: { accent: string }) {
  const bars = [140, 100, 160, 120, 180, 200, 170, 110, 150, 90, 130];
  const delays = [-0.1, -0.5, -0.3, -0.7, -0.2, -0.6, -0.4, -0.8, -0.15, -0.55, -0.35];
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden>
      <path className="dc-float" d="M40 116 Q 90 56 140 116 T 240 116 T 340 116 T 440 116" fill="none" stroke="#F2F1EE" strokeWidth="2" />
      {bars.map((h, i) => (
        <rect key={i} className="dc-eq" x={60 + i * 28} y={320 - h} width="14" height={h} rx="7" fill={i >= 4 && i <= 6 ? accent : "#F2F1EE"} style={{ animationDelay: `${delays[i]}s` }} />
      ))}
    </svg>
  );
}
const ARTS = [ArtWeb, ArtSoftware, ArtUI, ArtBrand, ArtMusic];

function artIndexFor(s: { slug?: string; tag?: string; title?: string }, i: number) {
  const key = `${s.slug ?? ""} ${s.tag ?? ""} ${s.title ?? ""}`.toLowerCase();
  if (/music|音樂|配樂/.test(key)) return 4;
  if (/brand|品牌|logo/.test(key)) return 3;
  if (/ui|ux|介面/.test(key)) return 2;
  if (/software|app|軟體|開發/.test(key) && !/web|網頁/.test(key)) return 1;
  if (/web|網頁|網站/.test(key)) return 0;
  return i % ARTS.length;
}

function ServiceIndex({ services, accent }: { services: { id: string; title: string; desc: string; tag: string; slug: string }[]; accent: string }) {
  const [active, setActive] = useState(0);
  const cur = services[active] ?? services[0];
  const Art = ARTS[artIndexFor(cur, active)];
  const num = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <section id="services" className="overflow-hidden bg-[#F2F1EE] text-[#0B0B0C]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-16 px-8 py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-[680px] flex-col gap-3">
            <Eyebrow color="#55555A">01 · 服務範疇</Eyebrow>
            <h2 className="m-0 text-[clamp(40px,5vw,72px)] font-black leading-[1.08] tracking-[-0.03em]">
              {services.length === 5 ? "五種手藝，" : "多種手藝，"}
              <br />
              一個工作室。
            </h2>
          </div>
          <p className="m-0 max-w-[340px] text-[#3A3A3F]">全部包含在同一個月費裡。點選任一項，看它能為你交付什麼。</p>
        </Reveal>

        <div className="flex flex-wrap items-start gap-16">
          <Reveal className="flex min-w-0 flex-[999_1_560px] flex-col border-b border-[#0B0B0C]">
            {services.map((s, i) => {
              const on = i === active;
              return (
                <div key={s.id} className="border-t border-[#0B0B0C]">
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => setActive(i)}
                    className="group flex min-h-11 w-full cursor-pointer items-baseline gap-6 border-0 bg-transparent py-[26px] text-left"
                  >
                    <span className="w-9 shrink-0 text-sm text-[#55555A]">{num(i)}</span>
                    <span
                      className="flex-1 text-[clamp(28px,3.8vw,54px)] font-black leading-[1.1] tracking-[-0.02em] transition-all duration-300 group-hover:text-[#0B0B0C]"
                      style={{ color: on ? "#0B0B0C" : "#8A8984", transform: `translateX(${on ? 14 : 0}px)` }}
                    >
                      {s.title}
                    </span>
                    <span className="text-[28px] leading-none transition-all duration-300" style={{ opacity: on ? 1 : 0.25, transform: `rotate(${on ? 45 : 0}deg)` }} aria-hidden>
                      ↗
                    </span>
                  </button>
                  <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]" style={{ gridTemplateRows: on ? "1fr" : "0fr" }}>
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-[18px] pb-9 pl-[60px]">
                        <p className="m-0 max-w-[520px] text-[17px] text-[#3A3A3F]">{s.desc}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          {s.tag && <span className="rounded-full border border-[#0B0B0C] px-3.5 py-[7px] text-sm">{s.tag}</span>}
                          {s.slug && (
                            <Link href={`/services/${s.slug}`} className="inline-flex items-center gap-1.5 border-b border-[#0B0B0C] text-sm font-bold text-[#0B0B0C]">
                              了解更多 <ArrowRight className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Reveal>

          <Reveal delay={0.1} className="m-0 flex min-w-0 flex-[1_1_380px] flex-col gap-3.5">
            <div className="relative aspect-square overflow-hidden rounded-[4px] bg-[#0B0B0C]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.03 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <Art accent={accent} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex justify-between gap-4 text-[13px] tracking-[0.06em] text-[#55555A]">
              <span>Fig. {num(active)}</span>
              <span>{cur?.title}</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 精選案例：畫廊式瀑布流                                              */
/* ------------------------------------------------------------------ */

const PALETTES = [
  { bg: "#1F2A24", fg: "#C9B79C" },
  { bg: "#E9E6DF", fg: "#0B0B0C" },
  { bg: "#1B2130", fg: "#8FA6C9" },
  { bg: "#2A1E19", fg: "ACCENT" },
  { bg: "#25241C", fg: "#D9C46A" },
  { bg: "#16181A", fg: "#F2F1EE" },
];
const ASPECTS = ["4 / 5", "1 / 1", "4 / 3", "3 / 4", "1 / 1", "4 / 5", "4 / 3", "3 / 4", "5 / 6"];
const SHAPES: ((c: string) => React.CSSProperties)[] = [
  (c) => ({ left: "22%", top: "22%", width: "56%", aspectRatio: "1", borderRadius: "50%", background: c }),
  (c) => ({ left: "25%", bottom: 0, width: "50%", height: "68%", borderRadius: "999px 999px 0 0", background: c }),
  (c) => ({ right: "10%", top: 0, width: "62%", aspectRatio: "2 / 1", borderRadius: "0 0 999px 999px", background: c }),
  (c) => ({ left: "18%", top: "18%", width: "64%", aspectRatio: "1", borderRadius: "50%", border: `22px solid ${c}`, boxSizing: "border-box" }),
  (c) => ({ left: "27%", top: "26%", width: "46%", aspectRatio: "1", background: c, transform: "rotate(14deg)" }),
  (c) => ({ left: "12%", top: "44%", width: "76%", height: "14%", borderRadius: "999px", background: c }),
];

function WorkGallery({ works, accent }: { works: WorkItem[]; accent: string }) {
  const [filter, setFilter] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const normalize = (c: string | undefined) => (c ?? "").trim().replace(/／/g, "/").replace(/\s+/g, " ");
  const categories = useMemo(() => [...new Set(works.map((w) => normalize(w.category)).filter(Boolean))].sort() as string[], [works]);
  const filtered = filter === null ? works : works.filter((w) => normalize(w.category) === filter);
  const LIMIT = 9;
  const visible = showAll ? filtered : filtered.slice(0, LIMIT);

  const tabStyle = (on: boolean): React.CSSProperties =>
    on ? { background: "#F2F1EE", color: "#0B0B0C", border: "1px solid #F2F1EE", fontWeight: 700 } : { background: "transparent", color: "#C7C7CC", border: "1px solid #2E2E33" };

  return (
    <section id="work" className="overflow-hidden border-t border-[#1F1F23]">
      <div aria-hidden className="overflow-hidden pt-[88px]">
        <div
          className="dc-marquee flex w-max whitespace-nowrap text-[clamp(80px,12vw,176px)] font-bold leading-none tracking-[-0.03em] text-transparent"
          style={{ WebkitTextStroke: "1px #3A3A40", animationDuration: "70s" }}
        >
          <span className="pr-16">SELECTED WORK — 精選案例 —</span>
          <span className="pr-16">SELECTED WORK — 精選案例 —</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-8 pb-[104px] pt-14">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <Eyebrow color={accent}>03 · 精選案例</Eyebrow>
            <h2 className="m-0 text-[clamp(32px,3.6vw,48px)] font-black leading-[1.2]">做過的，比說的更有說服力。</h2>
          </div>
          {categories.length > 0 && (
            <div role="group" aria-label="作品分類" className="flex flex-wrap gap-2">
              {[null, ...categories].map((cat) => {
                const on = filter === cat;
                const count = cat === null ? works.length : works.filter((w) => normalize(w.category) === cat).length;
                return (
                  <button
                    key={cat ?? "all"}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setFilter(cat);
                      setShowAll(false);
                    }}
                    className="min-h-11 cursor-pointer rounded-full px-[18px] py-2.5 text-sm transition active:scale-95"
                    style={tabStyle(on)}
                  >
                    {cat ?? "全部"} <span className="text-xs opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </Reveal>

        {visible.length === 0 ? (
          <p className="py-16 text-center text-[#8E8E93]">此分類尚無作品</p>
        ) : (
          <div className="[column-gap:32px] [columns:3_300px]">
            {visible.map((w, i) => {
              const k = works.indexOf(w);
              const pal = PALETTES[k % PALETTES.length];
              const fg = pal.fg === "ACCENT" ? accent : pal.fg;
              const href = w.url || `/works/${w.slug}`;
              const external = !!w.url;
              const no = String(i + 1).padStart(2, "0");
              return (
                <motion.div
                  key={w.id}
                  className="mb-12 break-inside-avoid"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.7, ease: EASE, delay: (i % 3) * 0.08 }}
                >
                  <Link href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} data-cursor="VIEW" className="dc-tile group block">
                    <div className="relative overflow-hidden rounded-[4px]" style={{ aspectRatio: ASPECTS[k % ASPECTS.length], background: pal.bg }}>
                      <div className="dc-shapewrap absolute inset-0">
                        <div className="absolute" style={SHAPES[k % SHAPES.length](fg)} />
                      </div>
                      {w.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={w.image}
                          alt={w.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      )}
                      <span className="absolute left-[18px] top-4 rounded-full bg-black/55 px-2.5 py-1 text-xs tracking-[0.12em] text-[#F2F1EE] backdrop-blur-sm">No. {no}</span>
                      <span className="absolute bottom-4 left-4 inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-[#0B0B0C] px-[15px] py-[9px] text-[13px] font-bold text-[#F2F1EE] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        查看案例 <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-[18px]">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="m-0 text-2xl font-black tracking-[-0.01em] underline decoration-transparent decoration-1 underline-offset-[6px] transition-colors group-hover:decoration-current">{w.title}</h3>
                        <span className="whitespace-nowrap text-xs tracking-[0.08em] text-[#A1A1A6]">{w.category}</span>
                      </div>
                      {w.description && <p className="m-0 text-sm text-[#A1A1A6]">{w.description}</p>}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-6">
          {filtered.length > LIMIT && (
            <button type="button" onClick={() => setShowAll((v) => !v)} className="min-h-11 cursor-pointer rounded-full border border-[#2E2E33] bg-transparent px-6 text-[15px] text-[#F2F1EE] transition hover:border-[#3A3A40]">
              {showAll ? "收合" : `再看 ${filtered.length - LIMIT} 件作品`}
            </button>
          )}
          <Link href="/portfolio" className="group inline-flex items-center gap-1.5 border-b border-[#F2F1EE] pb-0.5 text-[15px]">
            查看完整作品集 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type HomeClientProps = {
  siteSettings: SiteSettings | null;
  initialServices: { id: string; title: string; desc: string; tag: string; slug: string; icon: string }[];
  initialWorks: WorkItem[];
  initialPricing: { name: string; price: string; priceUnit?: string; desc: string; features: string[]; btn: string; popular: boolean }[];
  socialLinks: { name: string; url: string }[];
  navLinks: { name: string; href: string }[];
  testimonials: { id: string; name: string; quote: string; role: string; avatar?: string }[];
  partnerLogos: { id: string; name: string; logo?: string }[];
  initialFAQs?: { id: string; question: string; answer: string }[];
};

export function HomeClient({
  siteSettings,
  initialServices,
  initialWorks,
  initialPricing,
  socialLinks,
  navLinks,
  testimonials = [],
  partnerLogos = [],
  initialFAQs = [],
}: HomeClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactStep, setContactStep] = useState(1);
  const [contactServiceType, setContactServiceType] = useState("");
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");
  const portalMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const [incoming, setIncoming] = useState<{ key: number; items: Task[] }>({ key: 0, items: [] });

  const openContact = () => {
    setContactStatus("idle");
    setContactError("");
    setContactStep(1);
    setContactServiceType("");
    setIsContactModalOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const CONTACT_SERVICE_OPTIONS = ["網頁設計與開發", "軟體 / App 開發", "UI/UX 設計", "品牌視覺設計", "音樂製作", "其他"];

  const site = siteSettings ?? DEFAULT_SITE;
  const accent = site.brandColor || "#E23D28";
  const bg = site.backgroundColor || "#0A0A0A";
  const services = initialServices?.length ? initialServices : DEFAULT_SERVICES;
  const faqsList = initialFAQs?.length ? initialFAQs : DEFAULT_FAQs;
  const works = initialWorks?.length ? initialWorks : DEFAULT_WORKS;
  const pricing = initialPricing?.length ? initialPricing : DEFAULT_PRICING;
  const nav = navLinks?.length ? navLinks : DEFAULT_NAV_LINKS;

  const mainPlan = pricing.find((p) => p.popular) ?? pricing[0];
  const isNumericPrice = (price: string) => /\d/.test(price ?? "");
  const priceLabel = mainPlan && isNumericPrice(mainPlan.price) ? `NT$${mainPlan.price}／${mainPlan.priceUnit || "月"}` : "固定月費";

  // 跑馬燈：優先用 Notion「合作品牌」，否則用真實客戶作品名稱（排除 GitHub 開源專案）
  const marqueeNames = useMemo(() => {
    const fromLogos = (partnerLogos ?? []).map((p) => p.name).filter(Boolean);
    if (fromLogos.length) return fromLogos;
    return [...new Set(works.filter((w) => !w.id.startsWith("github-") && !/軟體|software|clone/i.test(`${w.category} ${w.title}`)).map((w) => w.title))].slice(0, 12);
  }, [partnerLogos, works]);

  const realTestimonials = (testimonials ?? []).filter((t) => t.quote?.trim());

  const heroTitle = [site.heroTitleLine1, site.heroTitleLine2].filter(Boolean);

  return (
    <div className="min-h-screen text-[#F2F1EE] selection:bg-[#F2F1EE] selection:text-[#0B0B0C]" style={{ backgroundColor: bg, fontFamily: "'Space Grotesk', 'Noto Sans TC', sans-serif", lineHeight: 1.6 }}>
      {/* Navigation */}
      <nav className={`fixed z-50 w-full transition-all duration-300 ${isScrolled ? "border-b border-[#1F1F23] bg-[rgba(11,11,12,0.86)] py-3 backdrop-blur-md" : "bg-transparent py-5"}`}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            {site.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.logoUrl} alt={site.brandName} className="h-10 w-auto max-w-[200px] object-contain object-left" referrerPolicy="no-referrer" />
            ) : (
              <>
                <span className="dc-pulse h-2.5 w-2.5 rounded-full" style={{ background: accent }} aria-hidden />
                <span className="text-xl font-bold tracking-[0.08em]">{site.brandName}</span>
              </>
            )}
          </Link>
          <div className="hidden items-center gap-7 text-[15px] md:flex">
            {nav.map((link) => (
              <a key={link.href + link.name} href={link.href} className="dc-navlink text-[#C7C7CC] hover:text-white">
                {link.name}
              </a>
            ))}
            <a href="#faq" className="dc-navlink text-[#C7C7CC] hover:text-white">
              常見問題
            </a>
          </div>
          <div className="hidden items-center gap-2.5 md:flex">
            <button type="button" onClick={() => openContact()} className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-[#2E2E33] bg-transparent px-[18px] text-sm text-[#F2F1EE] transition hover:opacity-90">
              {site.navCta}
            </button>
            <Link href="/subscribe" className="inline-flex min-h-11 items-center rounded-full px-[18px] text-sm font-bold text-[#0B0B0C] transition hover:opacity-90" style={{ background: accent }}>
              開始訂閱
            </Link>
          </div>
          <button type="button" aria-label={isMenuOpen ? "關閉選單" : "開啟選單"} className="min-h-11 min-w-11 text-[#C7C7CC] md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="absolute left-0 top-full flex w-full flex-col gap-6 overflow-hidden border-b border-[#1F1F23] bg-[#0B0B0C]/95 p-6 backdrop-blur-xl md:hidden">
              {nav.map((link) => (
                <a key={link.href + link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-xl font-medium text-[#D8D8DC]">
                  {link.name}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  openContact();
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-bold text-[#0B0B0C]"
                style={{ background: accent }}
              >
                <MessageCircle className="h-5 w-5" />
                {site.navCta}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section id="top" className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-14 px-8 pb-[88px] pt-40">
        <motion.div className="flex min-w-0 flex-[1_1_520px] flex-col gap-7" initial="initial" animate="animate" variants={{ initial: {}, animate: { transition: { staggerChildren: 0.08 } } }}>
          <motion.p variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }} className="m-0 flex items-center gap-2.5 text-sm tracking-[0.12em] text-[#A1A1A6]">
            <span className="h-px w-6" style={{ background: accent }} aria-hidden />
            {site.heroBadge}
          </motion.p>
          <motion.h1 variants={{ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }} className="m-0 text-[clamp(42px,5.4vw,80px)] font-black leading-[1.12] tracking-[-0.02em]">
            {heroTitle.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
            {site.heroTitleHighlight && (
              <span className="block" style={{ color: accent }}>
                {site.heroTitleHighlight}
              </span>
            )}
          </motion.h1>
          <motion.p variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }} className="m-0 max-w-[520px] text-[19px] text-[#C7C7CC]">
            {site.heroDesc}
          </motion.p>
          <motion.div variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }} className="flex flex-wrap items-center gap-3">
            <Link href="/subscribe" className="group inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-base font-bold text-[#0B0B0C] transition hover:opacity-90 active:scale-[.97]" style={{ background: accent }}>
              {site.heroCtaPrimary}
              {mainPlan && isNumericPrice(mainPlan.price) ? ` · ${priceLabel}` : ""}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#estimate" className="rounded-full border border-[#2E2E33] px-6 py-4 text-base transition hover:border-[#3A3A40]">
              試算我的需求
            </a>
          </motion.div>
          <motion.p variants={{ initial: { opacity: 0 }, animate: { opacity: 1 } }} className="m-0 text-sm text-[#8E8E93]">
            隨時暫停，剩餘天數保留 · 專屬 LINE 進度通知
          </motion.p>
        </motion.div>
        <motion.div className="flex min-w-0 flex-[1_1_420px]" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}>
          <LiveBoard accent={accent} incoming={incoming} />
        </motion.div>
      </section>

      {/* 合作品牌跑馬燈 */}
      {marqueeNames.length > 0 && (
        <section aria-label="合作品牌" className="dc-marquee-wrap overflow-hidden border-y border-[#1F1F23] py-[30px]">
          <div className="dc-marquee flex w-max">
            {[0, 1].map((dup) => (
              <div key={dup} aria-hidden={dup === 1} className="flex items-center gap-16 whitespace-nowrap pr-16 text-lg font-medium text-[#A1A1A6]">
                <span className="text-[13px] tracking-[0.1em] text-[#8E8E93]">合作過的品牌</span>
                {marqueeNames.map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      <Reveal className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 px-8 py-[72px]">
        {[
          { num: "50+", label: "完成專案" },
          { num: "10+", label: "合作品牌" },
          { num: String(services.length), label: "服務領域，一個窗口" },
          { num: "∞", label: "修改次數", accent: true },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <p className="m-0 text-[56px] font-bold leading-none" style={s.accent ? { color: accent } : undefined}>
              {s.num}
            </p>
            <p className="m-0 text-[#A1A1A6]">{s.label}</p>
          </div>
        ))}
      </Reveal>

      {/* 為什麼是訂閱制 */}
      <section className="mx-auto flex max-w-[1200px] flex-col gap-10 px-8 pb-24 pt-12">
        <Reveal className="flex max-w-[720px] flex-col gap-3">
          <Eyebrow color={accent}>為什麼是訂閱制</Eyebrow>
          <h2 className="m-0 text-[clamp(32px,3.6vw,48px)] font-black leading-[1.2]">
            把「找廠商、等報價、談追加」
            <br />
            換成一個固定月費。
          </h2>
        </Reveal>
        <Reveal className="overflow-x-auto rounded-[20px] border border-[#26262A]">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[1.1fr_1.4fr_1.4fr] border-b border-[#26262A] bg-[#131315]">
              <p className="m-0 px-6 py-[18px]" />
              <p className="m-0 px-6 py-[18px] text-sm text-[#A1A1A6]">傳統專案外包</p>
              <p className="m-0 px-6 py-[18px] text-sm font-bold" style={{ color: accent }}>
                DCParty 訂閱
              </p>
            </div>
            {[
              ["啟動速度", "詢價、報價、簽約、付訂金", "訂閱後即可提出第一個需求"],
              ["費用", "每案議價，追加另計", priceLabel === "固定月費" ? "固定月費" : `固定 ${priceLabel}`],
              ["修改", "多半限次數，超過要加價", "無限修改，直到滿意"],
              ["彈性", "以專案綁定", "隨時暫停，剩餘天數保留"],
              ["服務範圍", "網站、設計、音樂各找一家", "同一個窗口全部處理"],
            ].map(([k, a, b], i, arr) => (
              <div key={k} className={`grid grid-cols-[1.1fr_1.4fr_1.4fr] transition-colors hover:bg-[#1A1A1D] ${i < arr.length - 1 ? "border-b border-[#1F1F23]" : ""}`}>
                <p className="m-0 px-6 py-5 font-bold">{k}</p>
                <p className="m-0 px-6 py-5 text-[#A1A1A6]">{a}</p>
                <p className="m-0 px-6 py-5">{b}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <Estimator accent={accent} priceLabel={priceLabel} onSend={(items) => setIncoming((p) => ({ key: p.key + 1, items }))} />

      <ServiceIndex services={services} accent={accent} />

      {/* 如何開始 */}
      <section id="process" className="mx-auto flex max-w-[1200px] flex-col gap-12 px-8 py-[104px]">
        <Reveal className="flex flex-col gap-3">
          <Eyebrow color={accent}>02 · 如何開始</Eyebrow>
          <h2 className="m-0 text-[clamp(32px,3.6vw,48px)] font-black leading-[1.2]">三步驟，今天就能開工。</h2>
        </Reveal>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {[
            { step: "01", title: "訂閱", desc: "訂閱月費方案，開立專屬溝通群組（LINE）。" },
            { step: "02", title: "提需求", desc: "隨時透過 LINE 提交需求，數量不限。一次專注一項，完成後自動進行下一項。" },
            { step: "03", title: "交付與修改", desc: "收到成品，不滿意可無限修改，直到你完全滿意為止。" },
          ].map((it, i) => (
            <Reveal key={it.step} delay={i * 0.1} className="group flex flex-col gap-3 border-t-2 border-[#2E2E33] pt-6 transition-colors" >
              <p className="m-0 text-[44px] font-bold leading-none transition-colors group-hover:text-[var(--dc-accent)]" style={{ ["--dc-accent" as string]: accent }}>
                {it.step}
              </p>
              <h3 className="m-0 text-[22px]">{it.title}</h3>
              <p className="m-0 text-[#A1A1A6]">{it.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <WorkGallery works={works} accent={accent} />

      {/* 客戶見證：只有 Notion 裡有真實資料才顯示 */}
      {realTestimonials.length > 0 && (
        <section aria-label="客戶評價" className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 px-8 pb-[104px] pt-8">
          {realTestimonials.slice(0, 3).map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08}>
              <figure className="m-0 flex h-full flex-col gap-6 rounded-[20px] border border-[#222226] bg-[#131315] p-9 transition hover:-translate-y-1 hover:border-[#3A3A40]">
                <blockquote className="m-0 text-[22px] font-medium leading-[1.6]">「{t.quote}」</blockquote>
                <figcaption className="mt-auto flex items-center gap-3 text-sm text-[#A1A1A6]">
                  {t.avatar && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatar} alt="" className="h-10 w-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                  )}
                  <span>
                    {t.name}
                    {t.role ? ` · ${t.role}` : ""}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </section>
      )}

      {/* Pricing */}
      <section id="pricing" className="border-y border-[#1F1F23] bg-[#131315]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-8 py-[104px]">
          <Reveal className="flex flex-col items-center gap-3 text-center">
            <Eyebrow color={accent}>04 · 定價</Eyebrow>
            <h2 className="m-0 text-[clamp(32px,3.6vw,48px)] font-black leading-[1.2]">單一定價，簡單透明。</h2>
            <p className="m-0 text-[#A1A1A6]">不用比較方案。一個月費，涵蓋所有服務。</p>
          </Reveal>
          <div className={`mx-auto grid w-full gap-5 ${pricing.length === 1 ? "max-w-[560px]" : "max-w-[980px] grid-cols-[repeat(auto-fit,minmax(340px,1fr))]"}`}>
            {pricing.map((p, i) => {
              const numeric = isNumericPrice(p.price);
              return (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="flex h-full flex-col gap-6 rounded-3xl bg-[#0B0B0C] p-10 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,.35)]" style={{ border: `1px solid ${p.popular ? accent : "#26262A"}` }}>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="m-0 text-[22px]">{p.name}</h3>
                      {p.popular && (
                        <span className="rounded-full px-3 py-[5px] text-xs font-bold text-[#0B0B0C]" style={{ background: accent }}>
                          推薦
                        </span>
                      )}
                    </div>
                    {numeric ? (
                      <p className="m-0 flex items-baseline gap-2">
                        <span className="text-[56px] font-bold leading-none">NT${p.price}</span>
                        {p.priceUnit && <span className="text-[#A1A1A6]">／{p.priceUnit}</span>}
                      </p>
                    ) : (
                      <p className="m-0 text-[40px] font-bold leading-[1.1]">{p.price || "客製報價"}</p>
                    )}
                    {p.desc && <p className="m-0 text-[#A1A1A6]">{p.desc}</p>}
                    <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[#D8D8DC]">
                      {(p.features ?? []).map((f, j) => (
                        <li key={j} className="flex gap-2.5">
                          <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: p.popular ? accent : "#8E8E93" }} strokeWidth={3} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    {p.popular ? (
                      <Link href="/subscribe" className="group mt-auto inline-flex items-center justify-center gap-2 rounded-full p-4 font-bold text-[#0B0B0C] transition hover:opacity-90" style={{ background: accent }}>
                        {p.btn || "立即訂閱"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    ) : (
                      <button type="button" onClick={() => openContact()} className="mt-auto min-h-11 cursor-pointer rounded-full border border-[#3A3A40] bg-transparent p-4 font-bold text-[#F2F1EE] transition hover:border-[#F2F1EE]">
                        {p.btn || "預約專案諮詢"}
                      </button>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqsList.length > 0 && (
        <section id="faq" className="mx-auto flex max-w-[1200px] flex-wrap gap-12 px-8 py-[104px]">
          <Reveal className="flex flex-[1_1_300px] flex-col gap-4">
            <Eyebrow color={accent}>05 · 常見問題</Eyebrow>
            <h2 className="m-0 text-[clamp(32px,3.6vw,44px)] font-black leading-[1.2]">還有疑問？</h2>
            <p className="m-0 text-[#A1A1A6]">找不到答案，直接在 LINE 問我們。</p>
            <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="font-bold" style={{ color: accent }}>
              LINE @936qaahz →
            </a>
          </Reveal>
          <Reveal className="flex min-w-0 flex-[999_1_560px] flex-col">
            {faqsList.map((faq, i) => {
              const open = faqOpenIndex === i;
              return (
                <div key={faq.id} className="border-b border-[#26262A]">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setFaqOpenIndex(open ? null : i)}
                    className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-6 border-0 bg-transparent py-6 text-left text-lg font-medium text-[#F2F1EE]"
                  >
                    <span>{faq.question}</span>
                    <span className="text-[26px] leading-none transition-all duration-300" style={{ color: open ? accent : "#8E8E93", transform: `rotate(${open ? 45 : 0}deg)` }} aria-hidden>
                      +
                    </span>
                  </button>
                  <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
                    <div className="overflow-hidden">
                      <p className="m-0 whitespace-pre-line pb-6 pr-12 text-[#A1A1A6]">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-8 pb-[104px]">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-8 rounded-[28px] p-[clamp(40px,6vw,80px)] text-[#0B0B0C]" style={{ background: accent }}>
            <div className="flex max-w-[640px] flex-col gap-4">
              <h2 className="m-0 text-[clamp(34px,4.4vw,60px)] font-black leading-[1.15]">
                準備好把待辦清單
                <br />
                交給我們了嗎？
              </h2>
              <p className="m-0 text-lg">一個月費，無限可能。今天訂閱，今天提出第一個需求。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/subscribe" className="group inline-flex items-center gap-2 rounded-full bg-[#0B0B0C] px-7 py-4 font-bold text-[#F2F1EE] transition hover:opacity-90">
                立即訂閱 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button type="button" onClick={() => openContact()} className="cursor-pointer rounded-full border-[1.5px] border-[#0B0B0C] bg-transparent px-7 py-4 font-bold text-[#0B0B0C] transition hover:bg-[#0B0B0C]/10">
                先聊聊
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1F1F23]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-10 px-8 py-14">
          <div className="flex max-w-[360px] flex-col gap-3">
            <p className="m-0 text-xl font-bold tracking-[0.08em]">{site.brandName}</p>
            <p className="m-0 whitespace-pre-line text-sm text-[#A1A1A6]">{site.footerTagline}</p>
            <a href="https://dcfilms.tv" target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: accent }}>
              需要 AI 廣告影片？前往 DC Films →
            </a>
          </div>
          <div className="flex flex-wrap gap-14 text-sm">
            <div className="flex flex-col gap-2.5">
              <p className="m-0 text-[#8E8E93]">導覽</p>
              {nav.map((link) => (
                <a key={link.href + link.name} href={link.href} className="dc-navlink self-start">
                  {link.name}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="m-0 text-[#8E8E93]">聯絡</p>
              <a href={`mailto:${site.contactEmail}`} className="dc-navlink self-start">
                {site.contactEmail}
              </a>
              <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="dc-navlink self-start">
                LINE 官方帳號
              </a>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="m-0 text-[#8E8E93]">社群</p>
              {socialLinks?.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="dc-navlink self-start">
                  {s.name}
                </a>
              ))}
              {EXTRA_SOCIAL_LINKS.filter((s) => s.name !== "LINE 官方帳號").map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="dc-navlink self-start">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1200px] px-8 pb-10 pt-5 text-xs tracking-[0.08em] text-[#8E8E93]">
          © {new Date().getFullYear()} {site.brandName}. {site.footerCopyright}
        </div>
      </footer>

      {/* Contact Modal — portal 到 body，避免 AppProviders 的 filter 容器破壞 fixed 定位 */}
      {portalMounted &&
        createPortal(
          <AnimatePresence>
            {isContactModalOpen && (
              <motion.div key="contact-modal" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A]/90 p-4 backdrop-blur-sm sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <motion.div className="absolute inset-0" onClick={() => setIsContactModalOpen(false)} aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label={site.contactModalTitle}
                  className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[#26262A] bg-[#131315] p-8 shadow-2xl sm:p-12"
                  style={{ fontFamily: "'Space Grotesk', 'Noto Sans TC', sans-serif" }}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <button type="button" aria-label="關閉" onClick={() => setIsContactModalOpen(false)} className="absolute right-6 top-6 rounded-full p-2 text-[#A1A1A6] transition-colors hover:bg-[#1E1E22] hover:text-white">
                    <X className="h-6 w-6" />
                  </button>
                  <div className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
                    <span className="h-[2px] w-6" style={{ background: accent }} />
                    {site.contactModalLabel}
                  </div>
                  <h3 className="mb-4 whitespace-pre-line text-3xl font-black tracking-tight text-white">{site.contactModalTitle}</h3>
                  <p className="mb-6 leading-relaxed text-[#A1A1A6]">{site.contactModalDesc}</p>

                  <div className="mb-8">
                    <div className="mb-6 flex gap-2">
                      {[1, 2].map((s) => (
                        <div key={s} className="h-1 flex-1 rounded-full transition-colors" style={{ background: contactStep >= s ? accent : "#26262A" }} aria-hidden />
                      ))}
                    </div>

                    {contactStep === 1 && (
                      <>
                        <p className="mb-4 font-semibold text-white">您需要什麼服務？</p>
                        <div className="mb-6 space-y-2">
                          {CONTACT_SERVICE_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              aria-pressed={contactServiceType === opt}
                              onClick={() => setContactServiceType(opt)}
                              className="w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors"
                              style={contactServiceType === opt ? { borderColor: accent, background: "#1E1E22", color: "#fff" } : { borderColor: "#26262A", background: "#0B0B0C", color: "#D8D8DC" }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => contactServiceType && setContactStep(2)}
                          disabled={!contactServiceType}
                          className="w-full rounded-full py-4 font-bold text-[#0B0B0C] transition-all disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ background: accent }}
                        >
                          下一步
                        </button>
                      </>
                    )}

                    {contactStep === 2 && (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setContactStatus("sending");
                          setContactError("");
                          const fullMessage = `[服務類型] ${contactServiceType}\n\n${contactForm.message.trim()}`;
                          try {
                            const res = await fetch("/api/contact", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                name: contactForm.name.trim(),
                                email: contactForm.email.trim(),
                                phone: contactForm.phone.trim(),
                                message: fullMessage,
                              }),
                            });
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok) {
                              setContactError(data.error || "送出失敗");
                              setContactStatus("error");
                              return;
                            }
                            setContactStatus("success");
                            setContactForm({ name: "", email: "", phone: "", message: "" });
                          } catch {
                            setContactError("網路錯誤，請稍後再試");
                            setContactStatus("error");
                          }
                        }}
                      >
                        <div className="space-y-4">
                          {(
                            [
                              { key: "name", label: "姓名", type: "text", required: true, placeholder: "您的姓名或公司名稱" },
                              { key: "email", label: "Email", type: "email", required: true, placeholder: "email@example.com" },
                              { key: "phone", label: "電話（選填）", type: "tel", required: false, placeholder: "0912 345 678" },
                            ] as const
                          ).map((f) => (
                            <label key={f.key} className="block">
                              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#8E8E93]">{f.label}</span>
                              <input
                                type={f.type}
                                required={f.required}
                                value={contactForm[f.key]}
                                onChange={(e) => setContactForm((p) => ({ ...p, [f.key]: e.target.value }))}
                                className="w-full rounded-xl border border-[#26262A] bg-[#0B0B0C] px-4 py-3 text-white placeholder-[#6E6E73] focus:border-[#3A3A40] focus:outline-none"
                                placeholder={f.placeholder}
                              />
                            </label>
                          ))}
                          <label className="block">
                            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#8E8E93]">需求說明（選填）</span>
                            <textarea
                              value={contactForm.message}
                              onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                              rows={3}
                              className="w-full resize-none rounded-xl border border-[#26262A] bg-[#0B0B0C] px-4 py-3 text-white placeholder-[#6E6E73] focus:border-[#3A3A40] focus:outline-none"
                              placeholder="簡單描述您的需求或想詢問的內容"
                            />
                          </label>
                        </div>
                        {contactStatus === "success" && (
                          <p className="mt-4 flex items-center gap-2 text-sm text-green-400">
                            <Check className="h-4 w-4 shrink-0" /> 已送出，我們會盡快回覆。
                          </p>
                        )}
                        {contactStatus === "error" && contactError && <p className="mt-4 text-sm text-red-400">{contactError}</p>}
                        <div className="mt-6 flex gap-3">
                          <button type="button" onClick={() => setContactStep(1)} className="flex-1 rounded-full bg-[#1E1E22] py-4 font-bold text-[#D8D8DC] transition-all hover:bg-[#26262A]">
                            上一步
                          </button>
                          <button type="submit" disabled={contactStatus === "sending"} className="flex-1 rounded-full py-4 font-bold text-[#0B0B0C] transition-all disabled:cursor-not-allowed disabled:opacity-50" style={{ background: accent }}>
                            {contactStatus === "sending" ? "送出中…" : "送出表單"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  <div className="border-t border-[#26262A] pt-6">
                    <div className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8E8E93]">或直接聯繫</div>
                    <div className="space-y-4">
                      <a href={`mailto:${site.contactEmail}`} className="flex items-center gap-5 rounded-2xl border border-[#26262A] bg-[#0B0B0C] p-5 transition-all hover:border-[#3A3A40]">
                        <div className="rounded-xl bg-[#1E1E22] p-3">
                          <Mail className="h-6 w-6 text-[#A1A1A6]" />
                        </div>
                        <div>
                          <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[#8E8E93]">Email 聯繫</div>
                          <div className="text-lg font-medium text-[#D8D8DC]">{site.contactEmail}</div>
                        </div>
                      </a>
                      <a href={`tel:${site.contactPhone.replace(/\s/g, "")}`} className="flex items-center gap-5 rounded-2xl border border-[#26262A] bg-[#0B0B0C] p-5 transition-all hover:border-[#3A3A40]">
                        <div className="rounded-xl bg-[#1E1E22] p-3">
                          <Phone className="h-6 w-6 text-[#A1A1A6]" />
                        </div>
                        <div>
                          <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[#8E8E93]">Phone / LINE ID</div>
                          <div className="text-lg font-medium text-[#D8D8DC]">{site.contactPhone}</div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className="mt-6 text-center text-xs text-[#8E8E93]">團隊將於營業時間內盡快與您聯繫。</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
