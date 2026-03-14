"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { TechBackground } from "@/components/TechBackground";
import {
  Check,
  Menu,
  X,
  Zap,
  ArrowRight,
  Music,
  Code,
  Image as ImageIcon,
  Film,
  ChevronRight,
  Users,
  MessageCircle,
  Mail,
  Phone,
  PlayCircle,
  Quote,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { CustomCursor } from "@/components/CustomCursor";

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } };
const stagger = { initial: {}, animate: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } } };
const viewport = { once: true, amount: 0.15 };
const charReveal = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const heroTitleStagger = { initial: {}, animate: { transition: { staggerChildren: 0.032, delayChildren: 0.15 } } };

export type WorkItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  image?: string;
  url?: string;
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
  navServices: "我們的服務",
  navWork: "精選案例",
  navPricing: "合作方案",
  navCta: "線上諮詢",
  heroBadge: "AI 賦能的高效創意工作流",
  heroTitleLine1: "用技術與美學，",
  heroTitleLine2: "為品牌發起一場",
  heroTitleHighlight: "數位狂歡",
  heroDesc:
    "我們是 DCParty，專注於廣告影音、視覺設計與軟體開發。拒絕模板化生產，我們結合最新 AI 技術，為您打造細膩且具備影響力的數位資產。",
  heroCtaPrimary: "開始創意合作",
  heroCtaSecondary: "瀏覽精選作品",
  contactEmail: "jeremy@dcparty.co",
  contactPhone: "0935503966",
  contactModalLabel: "Let's Talk",
  contactModalTitle: "開啟您的專屬創意對話",
  contactModalDesc:
    "感謝您對 DCParty 的關注。無論是希望啟動品牌常駐合作，或是客製化大型專案，我們都已經準備好傾聽您的想法。",
  footerTagline: "技術為底，美學為魂。我們是您的全方位數位創意夥伴。",
  footerCopyright: "ALL RIGHTS RESERVED.",
};

const DEFAULT_SERVICES = [
  { id: "default-1", title: "動態影像與腳本企劃", desc: "從短影音到商業廣告，我們結合 AI 運鏡與精緻剪輯，為您的品牌訴說動人故事。", tag: "Video Production", slug: "video-production", icon: "Film" },
  { id: "default-2", title: "全案平面與社群素材", desc: "打破產能限制。利用 AI 工具快速產出具備一致性與美感的視覺素材，填補社群內容缺口。", tag: "Visual Assets", slug: "visual-assets", icon: "Image" },
  { id: "default-3", title: "專屬廣告配樂設計", desc: "為您的影像量身打造專屬配樂與音效，讓每一次的品牌曝光都有鮮明的聽覺記憶。", tag: "Sound Design", slug: "sound-design", icon: "Music" },
  { id: "default-4", title: "現代化網頁與軟體開發", desc: "運用流暢的現代框架，打造兼具 SEO 效能、美感與互動性的數位體驗空間。", tag: "Web & Dev", slug: "web-dev", icon: "Code" },
];

const DEFAULT_PRICING = [
  { name: "品牌視覺常駐計畫", price: "28,000", priceUnit: "月", desc: "適合需要穩定產出優質素材的中小型品牌。", features: ["每月 10 組精緻社群 / 廣告平面素材", "每月 1 支社群短影音 (長度 60 秒內)", "品牌專屬 AI 視覺風格庫建置", "單頁式網站基礎維護與效能監控", "各項目享 3 次大幅度修改保障"], btn: "了解常駐計畫", popular: false },
  { name: "全方位創意夥伴", price: "45,000", priceUnit: "月", desc: "最受歡迎。我們就是您專屬的「外部創意部門」。", features: ["每月 1 支專案級廣告或微 MV (長度 90 秒內)", "每月 15 組全案平面視覺素材", "搭配當月影像之原創配樂與混音設計", "網站功能擴充與基本技術支援", "專屬溝通群組，享有優先排程與彈性微調"], btn: "成為創意夥伴 (每月僅開放 2 席)", popular: true },
  { name: "大型專案與軟體開發", price: "客製化報價", priceUnit: "", desc: "針對深度需求量身打造，歡迎與我們聊聊。", features: ["依據專案規模提供專屬時數與報價", "大型網站或 App 軟體架構開發", "企業級 AI 工作流程導入與顧問", "年度品牌數位視覺系統重塑", "專案經理 1-on-1 深度策略對焦"], btn: "預約專案諮詢", popular: false },
];

const DEFAULT_NAV_LINKS = [
  { name: "我們的服務", href: "#services" },
  { name: "精選案例", href: "#work" },
  { name: "合作方案", href: "#pricing" },
];

const EXTRA_SOCIAL_LINKS = [
  { name: "LINE 官方帳號", url: "https://line.me/ti/p/@936qaahz", hoverColor: "hover:text-[#06C755]" },
  { name: "Vimeo", url: "https://vimeo.com/dreamcatcherstudio", hoverColor: "hover:text-[#1AB7EA]" },
  { name: "Facebook", url: "https://www.facebook.com/DCFILMS.TV/", hoverColor: "hover:text-[#1877F2]" },
] as const;

const DEFAULT_PARTNER_LOGOS: { id: string; name: string; logo?: string }[] = [
  { id: "default-logo-1", name: "品牌夥伴 A" },
  { id: "default-logo-2", name: "品牌夥伴 B" },
  { id: "default-logo-3", name: "品牌夥伴 C" },
  { id: "default-logo-4", name: "品牌夥伴 D" },
  { id: "default-logo-5", name: "品牌夥伴 E" },
  { id: "default-logo-6", name: "品牌夥伴 F" },
];

const DEFAULT_TESTIMONIALS: { id: string; name: string; quote: string; role: string; avatar?: string }[] = [
  { id: "default-t-1", name: "王經理", quote: "DCParty 的效率真的救了我們的發表會，從腳本到成片一氣呵成。", role: "品牌總監／科技公司" },
  { id: "default-t-2", name: "陳總監", quote: "合作過很多團隊，他們是少數能同時兼顧創意與執行力的。", role: "行銷總監" },
  { id: "default-t-3", name: "林小姐", quote: "視覺風格一致、交件準時，非常推薦給需要長期內容產出的品牌。", role: "社群負責人" },
];

const DEFAULT_FAQs: { id: string; question: string; answer: string }[] = [
  { id: "faq-1", question: "從簽約到專案交付，通常需要多長的製作週期？", answer: "歸功於我們獨特的 AI 賦能工作流，DCParty 的交付速度通常是業界的 1.5 倍。一般而言，社群短影音與平面視覺素材約需 7-10 個工作天；而品牌形象片或中大型網站開發則約需 3-4 週。確切的專案時程，我們都會在正式報價單與合約中明確標示，確保準時交付。" },
  { id: "faq-2", question: "專案包含幾次修改額度？如果成品不如預期怎麼辦？", answer: "為了確保最高品質的產出，我們多數的專案與常駐計畫皆包含「2 次免費大幅度修改」與「1 次細節微調」。在進入正式製作前，我們會先利用 AI 生成概念圖 (Concept Art) 或動態分鏡與您「精準對焦」，這能大幅降低後期期待不符的風險，讓每一次的修改都在刀口上。" },
  { id: "faq-3", question: "專案的收費流程與付款方式是如何進行的？", answer: "單次性專案通常採兩期請款：50% 訂金（專案啟動前）與 50% 尾款（確認結案並交付無浮水印檔案時）。若是選擇「品牌視覺常駐計畫」等包月型方案，則採每月月初固定匯款。我們目前支援公司帳戶匯款與主流信用卡支付，並可開立符合報帳規範之發票。" },
  { id: "faq-4", question: "我目前只有初步的想法，還沒有具體的企劃案，可以找你們嗎？", answer: "絕對可以，這正是我們的強項！您只需要準備好「品牌目標」與「預算範圍」，我們的專案團隊會與您進行 1-on-1 的線上策略對焦。接著，我們會透過 AI 快速具象化 2~3 種不同的視覺提案，協助您從模糊的概念中，梳理出最吸睛的創意方向。" },
  { id: "faq-5", question: "最終交付的作品與 AI 生成的素材，版權歸誰所有？", answer: "在專案尾款結清後，所有最終交付的視覺成品、影片檔案與網頁前端程式碼之「商業使用權與修改權」皆全數歸屬於客戶。若您的專案有註冊商標的需求，或希望買斷我們為您訓練的專屬 AI 風格模型 (LoRA)，我們也能提供對應的客製化授權方案。" },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  Film: <Film className="w-7 h-7 text-[#E23D28]" />,
  Image: <ImageIcon className="w-7 h-7 text-[#E23D28]" />,
  ImageIcon: <ImageIcon className="w-7 h-7 text-[#E23D28]" />,
  Music: <Music className="w-7 h-7 text-[#E23D28]" />,
  Code: <Code className="w-7 h-7 text-[#E23D28]" />,
};

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
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [workCategoryFilter, setWorkCategoryFilter] = useState<string | null>(null);
  const [contactStep, setContactStep] = useState(1);
  const [contactServiceType, setContactServiceType] = useState("");
  const [contactBudget, setContactBudget] = useState("");
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroParallaxY = useTransform(heroScrollProgress, [0, 1], [0, -120]);
  const { scrollYProgress: pageScrollProgress } = useScroll();
  const workImageParallaxY = useTransform(pageScrollProgress, [0, 0.25, 0.6], [24, 0, -20]);

  useEffect(() => {
    if (isContactModalOpen) {
      setContactStatus("idle");
      setContactError("");
      setContactStep(1);
      setContactServiceType("");
      setContactBudget("");
    }
  }, [isContactModalOpen]);

  const CONTACT_SERVICE_OPTIONS = [
    "動態影像 / 廣告",
    "品牌平面 / 視覺",
    "配樂音效設計",
    "網頁 / 軟體開發",
    "其他或複合需求",
  ];
  const CONTACT_BUDGET_OPTIONS = [
    { value: "under5", label: "5 萬以下" },
    { value: "5-10", label: "5–10 萬" },
    { value: "over10", label: "10 萬以上" },
    { value: "undecided", label: "尚未確定" },
  ];

  const site = siteSettings ?? DEFAULT_SITE;
  const servicesList = initialServices?.length ? initialServices : DEFAULT_SERVICES;
  const services = servicesList.map((s) => ({ ...s, iconNode: ICON_MAP[s.icon] ?? ICON_MAP.Film }));
  const partnerLogosList = partnerLogos?.length ? partnerLogos : DEFAULT_PARTNER_LOGOS;
  const testimonialsList = testimonials?.length ? testimonials : DEFAULT_TESTIMONIALS;
  const faqsList = initialFAQs?.length ? initialFAQs : DEFAULT_FAQs;
  const works = initialWorks ?? [];
  const normalizeCategory = (c: string | undefined) =>
    (c ?? "")
      .trim()
      .replace(/\uFF0F/g, "/")
      .replace(/\s+/g, " ");
  const workCategories = useMemo(
    () => [...new Set(works.map((w) => normalizeCategory(w.category)).filter(Boolean))].sort() as string[],
    [works]
  );
  useEffect(() => {
    if (workCategoryFilter !== null && !workCategories.includes(workCategoryFilter)) setWorkCategoryFilter(null);
  }, [workCategories, workCategoryFilter]);
  const filteredWorks =
    workCategoryFilter === null
      ? works
      : works.filter((w) => normalizeCategory(w.category) === workCategoryFilter);
  const pricing = initialPricing?.length ? initialPricing : DEFAULT_PRICING;
  const nav = navLinks?.length ? navLinks : DEFAULT_NAV_LINKS;
  const navWithBlog = [...nav, { name: "部落格", href: "/blog" }];
  const placeholderImage = "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=800";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (testimonialsList.length <= 1) return;
    const t = setInterval(() => setTestimonialIndex((i) => (i === testimonialsList.length - 1 ? 0 : i + 1)), 6000);
    return () => clearInterval(t);
  }, [testimonialsList.length]);

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-[#E23D28] selection:text-white" style={{ backgroundColor: site.backgroundColor }}>
      <CustomCursor />
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? `${site.backgroundColor}/95 backdrop-blur-md border-b border-neutral-900 py-5` : "bg-transparent py-7"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="/" className="flex items-center gap-4 cursor-pointer shrink-0">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt={site.brandName} className="h-12 w-auto max-w-[220px] object-contain object-left" referrerPolicy="no-referrer" />
            ) : (
              <>
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 15H50C69.33 15 85 30.67 85 50C85 69.33 69.33 85 50 85H20V15Z" fill="transparent" stroke={site.brandColor} strokeWidth="12" />
                  <path d="M20 50H50C58.28 50 65 43.28 65 35C65 26.72 58.28 20 50 20H32" fill="transparent" stroke={site.brandColor} strokeWidth="12" />
                  <path d="M50 80C33.43 80 20 66.57 20 50V40" fill="transparent" stroke={site.brandColor} strokeWidth="12" />
                </svg>
                <span className="text-3xl font-black tracking-widest text-white mt-0.5">{site.brandName}</span>
              </>
            )}
          </a>
          <div className="hidden md:flex items-center gap-12 text-base font-medium text-neutral-400">
            {navWithBlog.map((link) => (
              <a key={link.href + link.name} href={link.href} className="nav-link-tech hover:text-[#E23D28] transition-colors duration-200">
                {link.name}
              </a>
            ))}
            <motion.button data-magnetic type="button" onClick={() => setIsContactModalOpen(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="btn-tech-hover bg-white text-black px-8 py-3.5 rounded-full hover:bg-[#E23D28] hover:text-white transition-all duration-300 font-bold flex items-center gap-2.5 shadow-lg shadow-black/20 text-[15px]">
              <MessageCircle className="w-5 h-5" />
              {site.navCta}
            </motion.button>
          </div>
          <button type="button" className="md:hidden text-neutral-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="md:hidden absolute top-full left-0 w-full bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-neutral-900 p-6 flex flex-col gap-6 shadow-2xl overflow-hidden">
              {navWithBlog.map((link) => (
                <a key={link.href + link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-neutral-300 hover:text-[#E23D28] font-medium text-xl">
                  {link.name}
                </a>
              ))}
              <button data-magnetic onClick={() => { setIsContactModalOpen(true); setIsMenuOpen(false); }} className="bg-[#E23D28] text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full mt-2">
                <MessageCircle className="w-5 h-5" />
                {site.navCta} / 預約
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* 全站掃描線（固定層・手機隱藏以節省效能） */}
      <div className="pointer-events-none fixed inset-0 z-40 hidden md:block" aria-hidden>
        <div className="absolute left-0 right-0 h-[2px] rounded-full bg-linear-to-r from-transparent via-[#E23D28]/30 to-transparent shadow-[0_0_24px_rgba(226,61,40,0.25)]" style={{ animation: "scan-line 6s linear infinite", willChange: "transform" }} />
      </div>

      {/* Hero */}
      <section ref={heroRef} className="relative pt-40 pb-24 px-6 overflow-hidden">
        <TechBackground />
        {/* 六角形／電路紋背景（SVG pattern・手機隱藏） */}
        <div className="absolute inset-0 -z-10 opacity-[0.06] hidden md:block" aria-hidden>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
            <defs>
              <pattern id="hex-grid" width="52" height="45" patternUnits="userSpaceOnUse">
                <path d="M26 0L52 15v30L26 45L0 30V15L26 0z" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
              </pattern>
              <pattern id="circuit-lines" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M0 60h120 M60 0v120 M0 0l120 120 M120 0L0 120" fill="none" stroke="rgba(226,61,40,0.4)" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex-grid)" />
            <rect width="100%" height="100%" fill="url(#circuit-lines)" />
          </svg>
        </div>
        {/* 科技感網格背景 + 脈動（手機隱藏） */}
        <div className="absolute inset-0 -z-10 hidden md:block" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "56px 56px", animation: "grid-pulse 4s ease-in-out infinite" }} />
        {/* 光帶掃過（手機隱藏） */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none hidden md:block">
          <div className="absolute inset-0 bg-linear-to-br from-transparent via-[#E23D28]/10 to-transparent w-[200%] h-[200%] -left-1/2 -top-1/2" style={{ animation: "hero-shine 8s ease-in-out infinite" }} />
        </div>
        {/* 雷達掃描弧（右上角・手機隱藏） */}
        <div className="absolute top-8 right-8 w-28 h-28 sm:w-36 sm:h-36 -z-10 opacity-40 hidden md:block" aria-hidden>
          <div className="w-full h-full rounded-full border-2 border-[#E23D28] border-b-transparent border-l-transparent" style={{ animation: "radar-sweep 12s linear infinite" }} />
        </div>
        {/* 多層光效（視差：滾動時略慢於畫面） */}
        <motion.div className="absolute inset-0 -z-10 pointer-events-none" style={{ y: heroParallaxY }}>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-20 blur-[150px] rounded-full animate-pulse" style={{ backgroundColor: site.brandColor }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] opacity-10 blur-[120px] rounded-full hidden md:block" style={{ backgroundColor: site.brandColor }} />
          <div className="absolute top-1/2 left-0 w-[400px] h-[300px] opacity-[0.07] blur-[100px] rounded-full hidden md:block" style={{ backgroundColor: site.brandColor }} />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] opacity-[0.08] blur-[80px] rounded-full" style={{ backgroundColor: "#E23D28" }} />
        </motion.div>
        <div className="max-w-4xl mx-auto relative z-10">
          {/* 科技感四角框 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,480px)] h-px bg-[#E23D28]/40" style={{ animation: "corner-draw 0.8s ease-out 0.2s both" }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(100%,480px)] h-px bg-[#E23D28]/30" style={{ animation: "corner-draw 0.8s ease-out 0.5s both" }} />
          <div className="absolute top-1/2 left-0 w-px h-16 -translate-y-1/2 bg-linear-to-b from-transparent via-[#E23D28]/30 to-transparent" style={{ animation: "corner-draw 0.6s ease-out 0.3s both" }} />
          <div className="absolute top-1/2 right-0 w-px h-16 -translate-y-1/2 bg-linear-to-b from-transparent via-[#E23D28]/30 to-transparent" style={{ animation: "corner-draw 0.6s ease-out 0.4s both" }} />
          <motion.div className="text-center relative" variants={stagger} initial="initial" animate="animate">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 bg-neutral-900/80 border border-[#E23D28]/30 px-5 py-2 rounded-full text-sm font-bold mb-8 uppercase tracking-widest" style={{ color: site.brandColor, animation: "badge-glow 3s ease-in-out infinite" }}>
              <Zap className="w-4 h-4 fill-current shrink-0" />
              <span>{site.heroBadge}</span>
            </motion.div>
            <motion.h1
              variants={heroTitleStagger}
              initial="initial"
              animate="animate"
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.05] text-white"
            >
              {site.heroTitleLine1.split("").map((char, i) => (
                <motion.span key={`l1-${i}`} variants={charReveal} className="inline-block">
                  {char}
                </motion.span>
              ))}
              <br />
              {site.heroTitleLine2.split("").map((char, i) => (
                <motion.span key={`l2-${i}`} variants={charReveal} className="inline-block">
                  {char}
                </motion.span>
              ))}
              {" "}
              <span className="inline-flex items-baseline" style={{ color: site.brandColor, animation: "glitch-subtle 8s ease-in-out infinite" }}>
                {site.heroTitleHighlight.split("").map((char, i) => (
                  <motion.span key={`hl-${i}`} variants={charReveal} className="inline-block">
                    {char}
                  </motion.span>
                ))}
                <span className="inline-block w-[0.12em] h-[0.9em] ml-0.5 bg-[#E23D28] align-middle" style={{ animation: "cursor-blink 1.2s step-end infinite" }} aria-hidden />
              </span>
            </motion.h1>
          <motion.p variants={fadeUp} className="text-neutral-400 text-lg md:text-xl mb-12 leading-relaxed font-light px-4 max-w-3xl mx-auto">
            {site.heroDesc}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button data-magnetic onClick={() => setIsContactModalOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="btn-tech-hover text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg group text-base" style={{ backgroundColor: site.brandColor }}>
              {site.heroCtaPrimary} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button type="button" onClick={() => document.querySelector("#work")?.scrollIntoView({ behavior: "auto" })} whileHover={{ scale: 1.02, borderColor: "rgba(226,61,40,0.4)", boxShadow: "0 0 20px rgba(226,61,40,0.1)" }} whileTap={{ scale: 0.98 }} className="bg-transparent hover:bg-neutral-900 text-neutral-300 border border-neutral-700 px-8 py-4 rounded-full font-medium transition-all text-base">
              {site.heroCtaSecondary}
            </motion.button>
          </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 合作品牌跑馬燈 */}
      {partnerLogosList.length > 0 && (
        <section className="py-10 border-y border-neutral-800/80 bg-neutral-950/50 overflow-hidden" aria-label="合作品牌">
          <div className="flex w-max animate-marquee gap-16 px-8">
            {[...partnerLogosList, ...partnerLogosList].map((brand, i) => (
              <div key={`partner-logo-${i}`} className="flex shrink-0 items-center justify-center grayscale opacity-60 hover:opacity-80 transition-opacity duration-300">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="h-8 w-auto max-w-[140px] object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-sm font-semibold text-neutral-500">{brand.name}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services */}
      <motion.section id="services" className="py-24 px-6 relative border-t border-neutral-900" style={{ backgroundColor: site.backgroundColor }} initial="initial" whileInView="animate" viewport={viewport} variants={stagger}>
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="mb-16 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-white tracking-tight">服務範疇</h2>
              <p className="text-neutral-400 text-lg font-light max-w-2xl">將繁瑣的製作流程交給我們與 AI，讓您能更專注於品牌的長期策略。</p>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((s, i) => (
              <motion.div key={s.id} variants={fadeUp}>
                <Link href={s.id.startsWith("default-") ? "/#pricing" : `/services/${s.slug}`} className="card-scan-wrap card-glow-hover block group p-8 md:p-10 rounded-4xl bg-neutral-900/30 border border-neutral-800 hover:border-[#E23D28]/40 hover:bg-neutral-900/60 transition-all duration-500 relative">
                  <div className="card-scan-line" aria-hidden />
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#E23D28]/5 rounded-full blur-3xl group-hover:bg-[#E23D28]/10 group-hover:scale-150 transition-all duration-500" />
                  <motion.div className="flex flex-col sm:flex-row gap-6 items-start relative z-10" whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                    <div className="bg-neutral-950 p-4 rounded-2xl shrink-0 group-hover:scale-105 transition-transform duration-300 border border-neutral-800">
                      {s.iconNode}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[#E23D28] uppercase tracking-widest mb-2">{s.tag}</div>
                      <h3 className="text-2xl font-bold mb-3 text-white">{s.title}</h3>
                      <p className="text-neutral-400 leading-relaxed text-sm mb-6 font-light">{s.desc}</p>
                      <div className="inline-flex items-center text-xs font-bold text-neutral-500 group-hover:text-[#E23D28] transition-colors gap-1 uppercase tracking-wider">
                        了解詳情 <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Works */}
      <motion.section id="work" className="py-24 px-6 bg-neutral-950 relative border-t border-neutral-900" initial="initial" whileInView="animate" viewport={viewport} variants={stagger}>
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[#E23D28] mb-4 text-sm font-bold tracking-widest uppercase">
                <span className="w-8 h-[2px] bg-[#E23D28]" />
                Our Works
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">精選案例</h2>
            </div>
            <motion.button type="button" whileHover={{ x: 4 }} className="text-neutral-400 hover:text-white font-medium flex items-center gap-2 transition-colors">
              查看完整作品集 <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
          {workCategories.length > 0 && (
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-10">
              <button
                type="button"
                onClick={() => setWorkCategoryFilter(null)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${workCategoryFilter === null ? "bg-[#E23D28] text-white" : "bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-700"}`}
              >
                全部 ALL
              </button>
              {workCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setWorkCategoryFilter(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${workCategoryFilter === cat ? "bg-[#E23D28] text-white" : "bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-700"}`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredWorks.length === 0 ? (
              <motion.div variants={fadeUp} className="col-span-full py-16 text-center">
                <p className="text-neutral-500 mb-4">
                  {workCategoryFilter === null ? "目前尚無作品" : "此分類尚無作品，請試試其他分類"}
                </p>
                {workCategoryFilter !== null && (
                  <button
                    type="button"
                    onClick={() => setWorkCategoryFilter(null)}
                    className="text-[#E23D28] font-medium hover:underline"
                  >
                    顯示全部
                  </button>
                )}
              </motion.div>
            ) : (
              filteredWorks.map((work) => (
                <Link key={work.id} href={`/works/${work.slug}`} data-cursor={work.url ? "VIEW" : "PLAY"} className="block">
                  <motion.div variants={fadeUp} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="card-scan-wrap card-glow-hover group cursor-pointer">
                    <div className="card-scan-line" aria-hidden />
                    <div className="relative overflow-hidden rounded-4xl bg-neutral-900 aspect-video mb-6 border border-neutral-800 group-hover:border-[#E23D28]/30 transition-colors duration-300">
                      <motion.div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" style={{ backgroundImage: `url(${work.image || placeholderImage})`, y: workImageParallaxY }} />
                      <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.div initial={{ scale: 0.8 }} whileHover={{ scale: 1.1 }} className="bg-[#E23D28] text-white p-4 rounded-full shadow-lg shadow-[#E23D28]/40">
                          <PlayCircle className="w-8 h-8" />
                        </motion.div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#E23D28] uppercase tracking-widest mb-2">{work.category}</div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-[#E23D28] transition-colors">{work.title}</h3>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* Pricing */}
      <motion.section id="pricing" className="py-24 px-6 border-t border-neutral-900" style={{ backgroundColor: site.backgroundColor }} initial="initial" whileInView="animate" viewport={viewport} variants={stagger}>
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white tracking-tight">透明且永續的合作方案</h2>
            <p className="text-neutral-400 text-lg font-light max-w-2xl mx-auto">我們相信長期合作能帶來最好的品質。合理的定價，確保每一次的產出都充滿細節與心意。</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
            {pricing.map((p, i) => (
              <div key={i} className={`relative ${p.popular ? "pt-4" : ""}`}>
                {p.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-[#E23D28] text-white text-[11px] font-bold px-5 py-1.5 rounded-full tracking-widest shadow-lg uppercase whitespace-nowrap">
                    推薦方案
                  </div>
                )}
              <motion.div variants={fadeUp} whileHover={{ y: -8, transition: { type: "spring", stiffness: 260, damping: 20 } }} className={`card-scan-wrap card-glow-hover relative p-10 rounded-[2.5rem] border h-full ${p.popular ? "bg-neutral-900 border-[#E23D28]/50 shadow-2xl shadow-[#E23D28]/10" : "bg-neutral-950 border-neutral-800"} transition-colors duration-300 flex flex-col`}>
                <div className="card-scan-line" aria-hidden />
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-3">{p.name}</h3>
                  <p className="text-neutral-400 text-sm mb-6 font-light leading-relaxed min-h-[40px]">{p.desc}</p>
                  {i !== pricing.length - 1 || (p.priceUnit && p.price !== "客製化報價") ? (
                    <div className="flex items-end gap-1">
                      <span className="text-neutral-500 text-lg font-light mb-1">NT$</span>
                      <span className="text-5xl font-black tracking-tight text-white">{p.price}</span>
                      {p.priceUnit && <span className="text-neutral-500 text-sm ml-1 mb-1">/ {p.priceUnit}</span>}
                    </div>
                  ) : (
                    <div className="flex items-end h-[60px]">
                      <span className="text-3xl font-black tracking-tight text-white">{p.price}</span>
                    </div>
                  )}
                </div>
                <div className="h-px bg-neutral-800 w-full mb-8" />
                <ul className="space-y-4 mb-10 grow">
                  {(p.features ?? []).map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-neutral-300">
                      <div className="mt-1 shrink-0">
                        <Check className="w-4 h-4 text-[#E23D28]" strokeWidth={3} />
                      </div>
                      <span className="text-sm leading-relaxed font-light">{f}</span>
                    </li>
                  ))}
                </ul>
                <motion.button data-magnetic onClick={() => setIsContactModalOpen(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full py-4 rounded-full font-bold transition-colors text-sm mt-auto ${p.popular ? "bg-[#E23D28] hover:bg-[#c93623] text-white shadow-lg shadow-[#E23D28]/25" : "bg-white text-black hover:bg-neutral-200"}`}>
                  {p.btn}
                </motion.button>
              </motion.div>
              </div>
            ))}
          </div>
          <motion.div variants={fadeUp} className="mt-16 text-center">
            <div className="inline-flex items-center justify-center gap-3 bg-neutral-900 border border-neutral-800 px-6 py-3 rounded-full">
              <Users className="w-4 h-4 text-[#E23D28]" />
              <span className="text-neutral-400 text-sm font-light">為了維持服務品質，我們每月控制固定合作的品牌數量，歡迎提早預約討論。</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ 常見問題 */}
      {faqsList.length > 0 && (
        <motion.section id="faq" className="py-24 px-6 border-t border-neutral-900 bg-neutral-950/50" initial="initial" whileInView="animate" viewport={viewport} variants={stagger}>
          <div className="max-w-3xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 text-[#E23D28] mb-4 text-sm font-bold tracking-widest uppercase">
                <span className="w-8 h-[2px] bg-[#E23D28]" />
                FAQ
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">常見問題</h2>
            </motion.div>
            <div className="space-y-3">
              {faqsList.map((faq, i) => (
                <motion.div
                  key={faq.id}
                  variants={fadeUp}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden transition-colors hover:border-neutral-700"
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpenIndex(faqOpenIndex === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 text-white font-semibold"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-[#E23D28] transition-transform duration-200 ${faqOpenIndex === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {faqOpenIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-0 text-neutral-400 font-light leading-relaxed whitespace-pre-line border-t border-neutral-800/80">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* 客戶見證 */}
      {testimonialsList.length > 0 && (
        <motion.section id="testimonials" className="py-24 px-6 border-t border-neutral-900 bg-neutral-950" initial="initial" whileInView="animate" viewport={viewport} variants={stagger}>
          <div className="max-w-4xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 text-[#E23D28] mb-4 text-sm font-bold tracking-widest uppercase">
                <span className="w-8 h-[2px] bg-[#E23D28]" />
                Testimonials
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">客戶見證</h2>
            </motion.div>
            <motion.div variants={fadeUp} className="relative rounded-3xl border border-neutral-800 bg-neutral-900/50 p-8 md:p-12">
              <Quote className="absolute top-6 left-6 w-10 h-10 text-[#E23D28]/30" aria-hidden />
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                <div className="flex-1">
                  <blockquote className="text-xl md:text-2xl font-light text-neutral-200 leading-relaxed italic">
                    「{testimonialsList[testimonialIndex]?.quote || ""}」
                  </blockquote>
                  <footer className="mt-6 flex flex-wrap items-center gap-3">
                    {testimonialsList[testimonialIndex]?.avatar ? (
                      <img src={testimonialsList[testimonialIndex].avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#E23D28]/30" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#E23D28]/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-[#E23D28]">{(testimonialsList[testimonialIndex]?.name || "?")[0]}</span>
                      </div>
                    )}
                    <div>
                      <cite className="not-italic font-semibold text-white">{testimonialsList[testimonialIndex]?.name}</cite>
                      {testimonialsList[testimonialIndex]?.role && (
                        <p className="text-sm text-neutral-500">{testimonialsList[testimonialIndex].role}</p>
                      )}
                    </div>
                  </footer>
                </div>
              </div>
              {testimonialsList.length > 1 && (
                <div className="flex items-center justify-between mt-8 pt-8 border-t border-neutral-800">
                  <button type="button" onClick={() => setTestimonialIndex((i) => (i === 0 ? testimonialsList.length - 1 : i - 1))} className="p-2 rounded-full text-neutral-400 hover:text-[#E23D28] hover:bg-neutral-800 transition-colors" aria-label="上一則">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="flex gap-2">
                    {testimonialsList.map((_, i) => (
                      <button key={i} type="button" onClick={() => setTestimonialIndex(i)} className={`h-2 rounded-full transition-all ${i === testimonialIndex ? "w-8 bg-[#E23D28]" : "w-2 bg-neutral-600 hover:bg-neutral-500"}`} aria-label={`第 ${i + 1} 則`} />
                    ))}
                  </div>
                  <button type="button" onClick={() => setTestimonialIndex((i) => (i === testimonialsList.length - 1 ? 0 : i + 1))} className="p-2 rounded-full text-neutral-400 hover:text-[#E23D28] hover:bg-neutral-800 transition-colors" aria-label="下一則">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Footer */}
      <motion.footer className="py-16 px-6 border-t border-neutral-900 bg-[#050505]" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-black tracking-widest text-white">{site.brandName}</span>
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed font-light max-w-xs whitespace-pre-line">{site.footerTagline}</p>
          </div>
          <div className="flex gap-10 text-sm font-light">
            <div className="flex flex-col gap-3">
              {nav.map((link) => (
                <a key={link.href} href={link.href} className="link-tech-underline text-neutral-400 hover:text-[#E23D28] transition-colors duration-200 pl-0 hover:pl-2">
                  {link.name}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {socialLinks?.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="link-tech-underline text-neutral-400 hover:text-[#E23D28] transition-colors duration-200 pl-0 hover:pl-2">
                  {s.name}
                </a>
              ))}
              {EXTRA_SOCIAL_LINKS.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className={`link-tech-underline text-neutral-400 ${s.hoverColor} transition-colors duration-200 pl-0 hover:pl-2`}>
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-neutral-900 text-center md:text-left text-neutral-600 text-xs font-light tracking-wider uppercase">
          © {new Date().getFullYear()} {site.brandName}. {site.footerCopyright}
        </div>
      </motion.footer>

      {/* Contact Modal */}
      <AnimatePresence>
        {isContactModalOpen && (
          <motion.div key="contact-modal" className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-[#0A0A0A]/90 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <motion.div className="absolute inset-0" onClick={() => setIsContactModalOpen(false)} aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
            <motion.div className="bg-neutral-900 border border-neutral-800 p-8 sm:p-12 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl shadow-[#E23D28]/10 max-h-[90vh] overflow-y-auto" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <button onClick={() => setIsContactModalOpen(false)} className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="inline-flex items-center gap-2 text-[#E23D28] text-xs font-bold tracking-widest uppercase mb-6">
              <span className="w-6 h-[2px] bg-[#E23D28]" />
              {site.contactModalLabel}
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight whitespace-pre-line">{site.contactModalTitle}</h3>
            <p className="text-neutral-400 font-light leading-relaxed mb-6">{site.contactModalDesc}</p>

            {/* 多步驟詢價表單 */}
            <div className="mb-8">
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-colors ${contactStep >= s ? "bg-[#E23D28]" : "bg-neutral-800"}`}
                    aria-hidden
                  />
                ))}
              </div>

              {contactStep === 1 && (
                <>
                  <p className="text-white font-semibold mb-4">您需要什麼服務？</p>
                  <div className="space-y-2 mb-6">
                    {CONTACT_SERVICE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setContactServiceType(opt)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${contactServiceType === opt ? "bg-[#E23D28]/20 border-[#E23D28] text-white" : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-600"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => contactServiceType && setContactStep(2)}
                    disabled={!contactServiceType}
                    className="w-full py-4 rounded-full font-bold text-white bg-[#E23D28] hover:bg-[#c93623] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    下一步
                  </button>
                </>
              )}

              {contactStep === 2 && (
                <>
                  <p className="text-white font-semibold mb-4">預估的預算範圍落在？</p>
                  <div className="space-y-2 mb-6">
                    {CONTACT_BUDGET_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setContactBudget(value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${contactBudget === value ? "bg-[#E23D28]/20 border-[#E23D28] text-white" : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-600"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setContactStep(1)}
                      className="flex-1 py-4 rounded-full font-bold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition-all"
                    >
                      上一步
                    </button>
                    <button
                      type="button"
                      onClick={() => contactBudget && setContactStep(3)}
                      disabled={!contactBudget}
                      className="flex-1 py-4 rounded-full font-bold text-white bg-[#E23D28] hover:bg-[#c93623] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      下一步
                    </button>
                  </div>
                </>
              )}

              {contactStep === 3 && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setContactStatus("sending");
                    setContactError("");
                    const budgetLabel = CONTACT_BUDGET_OPTIONS.find((o) => o.value === contactBudget)?.label ?? contactBudget;
                    const fullMessage = `[服務類型] ${contactServiceType}\n[預算範圍] ${budgetLabel}\n\n${contactForm.message.trim()}`;
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
                    <label className="block">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">姓名</span>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:border-[#E23D28]/50 focus:outline-none"
                        placeholder="您的姓名或公司名稱"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Email</span>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:border-[#E23D28]/50 focus:outline-none"
                        placeholder="email@example.com"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">電話（選填）</span>
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:border-[#E23D28]/50 focus:outline-none"
                        placeholder="0912 345 678"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">需求說明（選填）</span>
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:border-[#E23D28]/50 focus:outline-none resize-none"
                        placeholder="簡單描述您的需求或想詢問的內容"
                      />
                    </label>
                  </div>
                  {contactStatus === "success" && (
                    <p className="mt-4 flex items-center gap-2 text-green-400 text-sm">
                      <Check className="w-4 h-4 shrink-0" /> 已送出，我們會盡快回覆。
                    </p>
                  )}
                  {contactStatus === "error" && contactError && (
                    <p className="mt-4 text-red-400 text-sm">{contactError}</p>
                  )}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setContactStep(2)}
                      className="flex-1 py-4 rounded-full font-bold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition-all"
                    >
                      上一步
                    </button>
                    <button
                      type="submit"
                      disabled={contactStatus === "sending"}
                      className="flex-1 py-4 rounded-full font-bold text-white bg-[#E23D28] hover:bg-[#c93623] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {contactStatus === "sending" ? "送出中…" : "送出表單"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="border-t border-neutral-800 pt-6">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">或直接聯繫</div>
              <div className="space-y-4">
                <a href={`mailto:${site.contactEmail}`} className="flex items-center gap-5 p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-[#E23D28]/50 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#E23D28] transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                  <div className="bg-neutral-900 p-3 rounded-xl group-hover:bg-[#E23D28] transition-colors">
                    <Mail className="w-6 h-6 text-neutral-400 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Email 聯繫</div>
                    <div className="text-neutral-200 font-medium text-lg">{site.contactEmail}</div>
                  </div>
                </a>
                <a href={`tel:${site.contactPhone.replace(/\s/g, "")}`} className="flex items-center gap-5 p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-[#E23D28]/50 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#E23D28] transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                  <div className="bg-neutral-900 p-3 rounded-xl group-hover:bg-[#E23D28] transition-colors">
                    <Phone className="w-6 h-6 text-neutral-400 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Phone / LINE ID</div>
                    <div className="text-neutral-200 font-medium text-lg">{site.contactPhone}</div>
                  </div>
                </a>
              </div>
            </div>
            <div className="mt-6 text-center text-xs text-neutral-500 font-light">團隊將於營業時間內盡快與您聯繫。</div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
