"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

export type WorkItem = {
  id: string;
  title: string;
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
  { title: "動態影像與腳本企劃", desc: "從短影音到商業廣告，我們結合 AI 運鏡與精緻剪輯，為您的品牌訴說動人故事。", tag: "Video Production", icon: "Film" },
  { title: "全案平面與社群素材", desc: "打破產能限制。利用 AI 工具快速產出具備一致性與美感的視覺素材，填補社群內容缺口。", tag: "Visual Assets", icon: "Image" },
  { title: "專屬廣告配樂設計", desc: "為您的影像量身打造專屬配樂與音效，讓每一次的品牌曝光都有鮮明的聽覺記憶。", tag: "Sound Design", icon: "Music" },
  { title: "現代化網頁與軟體開發", desc: "運用流暢的現代框架，打造兼具 SEO 效能、美感與互動性的數位體驗空間。", tag: "Web & Dev", icon: "Code" },
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

const ICON_MAP: Record<string, React.ReactNode> = {
  Film: <Film className="w-7 h-7 text-[#E23D28]" />,
  Image: <ImageIcon className="w-7 h-7 text-[#E23D28]" />,
  ImageIcon: <ImageIcon className="w-7 h-7 text-[#E23D28]" />,
  Music: <Music className="w-7 h-7 text-[#E23D28]" />,
  Code: <Code className="w-7 h-7 text-[#E23D28]" />,
};

type HomeClientProps = {
  siteSettings: SiteSettings | null;
  initialServices: { title: string; desc: string; tag: string; icon: string }[];
  initialWorks: WorkItem[];
  initialPricing: { name: string; price: string; priceUnit?: string; desc: string; features: string[]; btn: string; popular: boolean }[];
  socialLinks: { name: string; url: string }[];
  navLinks: { name: string; href: string }[];
};

export function HomeClient({
  siteSettings,
  initialServices,
  initialWorks,
  initialPricing,
  socialLinks,
  navLinks,
}: HomeClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    if (isContactModalOpen) {
      setContactStatus("idle");
      setContactError("");
    }
  }, [isContactModalOpen]);

  const site = siteSettings ?? DEFAULT_SITE;
  const servicesList = initialServices?.length ? initialServices : DEFAULT_SERVICES;
  const services = servicesList.map((s) => ({ ...s, iconNode: ICON_MAP[s.icon] ?? ICON_MAP.Film }));
  const works = initialWorks ?? [];
  const pricing = initialPricing?.length ? initialPricing : DEFAULT_PRICING;
  const nav = navLinks?.length ? navLinks : DEFAULT_NAV_LINKS;
  const navWithBlog = [...nav, { name: "部落格", href: "/blog" }];
  const placeholderImage = "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=800";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-[#E23D28] selection:text-white" style={{ backgroundColor: site.backgroundColor }}>
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? `${site.backgroundColor}/95 backdrop-blur-md border-b border-neutral-900 py-4` : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="/" className="flex items-center gap-3 cursor-pointer shrink-0">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt={site.brandName} className="h-9 w-auto max-w-[180px] object-contain object-left" />
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 15H50C69.33 15 85 30.67 85 50C85 69.33 69.33 85 50 85H20V15Z" fill="transparent" stroke={site.brandColor} strokeWidth="12" />
                  <path d="M20 50H50C58.28 50 65 43.28 65 35C65 26.72 58.28 20 50 20H32" fill="transparent" stroke={site.brandColor} strokeWidth="12" />
                  <path d="M50 80C33.43 80 20 66.57 20 50V40" fill="transparent" stroke={site.brandColor} strokeWidth="12" />
                </svg>
                <span className="text-2xl font-black tracking-widest text-white mt-1">{site.brandName}</span>
              </>
            )}
          </a>
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-neutral-400">
            {navWithBlog.map((link) => (
              <a key={link.href + link.name} href={link.href} className="hover:text-white transition-colors">
                {link.name}
              </a>
            ))}
            <button type="button" onClick={() => setIsContactModalOpen(true)} className="bg-white text-black px-6 py-2.5 rounded-full hover:bg-[#E23D28] hover:text-white transition-all duration-300 font-bold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {site.navCta}
            </button>
          </div>
          <button type="button" className="md:hidden text-neutral-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-neutral-900 p-6 flex flex-col gap-6 shadow-2xl">
            {navWithBlog.map((link) => (
              <a key={link.href + link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-neutral-300 hover:text-[#E23D28] font-medium text-lg">
                {link.name}
              </a>
            ))}
            <button onClick={() => { setIsContactModalOpen(true); setIsMenuOpen(false); }} className="bg-[#E23D28] text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full mt-2">
              <MessageCircle className="w-5 h-5" />
              {site.navCta} / 預約
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-10 blur-[150px] rounded-full -z-10 animate-pulse" style={{ backgroundColor: site.brandColor }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] opacity-5 blur-[120px] rounded-full -z-10" style={{ backgroundColor: site.brandColor }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 px-4 py-1.5 rounded-full text-xs font-bold mb-8 uppercase tracking-widest" style={{ color: site.brandColor }}>
            <Zap className="w-3 h-3 fill-current" />
            <span>{site.heroBadge}</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.05] text-white">
            {site.heroTitleLine1}
            <br />
            {site.heroTitleLine2} <span style={{ color: site.brandColor }}>{site.heroTitleHighlight}</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl mb-12 leading-relaxed font-light px-4 max-w-3xl mx-auto">
            {site.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => setIsContactModalOpen(true)} className="text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg group text-base hover:opacity-90" style={{ backgroundColor: site.brandColor }}>
              {site.heroCtaPrimary} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button type="button" onClick={() => document.querySelector("#work")?.scrollIntoView({ behavior: "smooth" })} className="bg-transparent hover:bg-neutral-900 text-neutral-300 border border-neutral-700 px-8 py-4 rounded-full font-medium transition-all text-base">
              {site.heroCtaSecondary}
            </button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6 relative border-t border-neutral-900" style={{ backgroundColor: site.backgroundColor }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-white tracking-tight">服務範疇</h2>
              <p className="text-neutral-400 text-lg font-light max-w-2xl">將繁瑣的製作流程交給我們與 AI，讓您能更專注於品牌的長期策略。</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((s, i) => (
              <div key={i} className="group p-8 md:p-10 rounded-4xl bg-neutral-900/30 border border-neutral-800 hover:border-[#E23D28]/40 hover:bg-neutral-900/60 transition-all duration-500 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#E23D28]/5 rounded-full blur-3xl group-hover:bg-[#E23D28]/10 transition-colors" />
                <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
                  <div className="bg-neutral-950 p-4 rounded-2xl shrink-0 group-hover:scale-105 transition-transform duration-300 border border-neutral-800">
                    {s.iconNode}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#E23D28] uppercase tracking-widest mb-2">{s.tag}</div>
                    <h3 className="text-2xl font-bold mb-3 text-white">{s.title}</h3>
                    <p className="text-neutral-400 leading-relaxed text-sm mb-6 font-light">{s.desc}</p>
                    <div className="inline-flex items-center text-xs font-bold text-neutral-500 group-hover:text-[#E23D28] transition-colors cursor-pointer gap-1 uppercase tracking-wider">
                      Explore <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Works */}
      <section id="work" className="py-24 px-6 bg-neutral-950 relative border-t border-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[#E23D28] mb-4 text-sm font-bold tracking-widest uppercase">
                <span className="w-8 h-[2px] bg-[#E23D28]" />
                Our Works
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">精選案例</h2>
            </div>
            <button type="button" className="text-neutral-400 hover:text-white font-medium flex items-center gap-2 transition-colors">
              查看完整作品集 <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {works.map((work) =>
              work.url ? (
                <a key={work.id} href={work.url} target="_blank" rel="noopener noreferrer" className="group cursor-pointer block">
                  <div className="relative overflow-hidden rounded-4xl bg-neutral-900 aspect-video mb-6 border border-neutral-800">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-100" style={{ backgroundImage: `url(${work.image || placeholderImage})` }} />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-[#E23D28] text-white p-4 rounded-full transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-[#E23D28]/30">
                        <PlayCircle className="w-8 h-8" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#E23D28] uppercase tracking-widest mb-2">{work.category}</div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-[#E23D28] transition-colors">{work.title}</h3>
                  </div>
                </a>
              ) : (
                <div key={work.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-4xl bg-neutral-900 aspect-video mb-6 border border-neutral-800">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-100" style={{ backgroundImage: `url(${work.image || placeholderImage})` }} />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-[#E23D28] text-white p-4 rounded-full transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-[#E23D28]/30">
                        <PlayCircle className="w-8 h-8" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#E23D28] uppercase tracking-widest mb-2">{work.category}</div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-[#E23D28] transition-colors">{work.title}</h3>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-neutral-900" style={{ backgroundColor: site.backgroundColor }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white tracking-tight">透明且永續的合作方案</h2>
            <p className="text-neutral-400 text-lg font-light max-w-2xl mx-auto">我們相信長期合作能帶來最好的品質。合理的定價，確保每一次的產出都充滿細節與心意。</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricing.map((p, i) => (
              <div key={i} className={`relative p-10 rounded-[2.5rem] border ${p.popular ? "bg-neutral-900 border-[#E23D28]/50 shadow-2xl shadow-[#E23D28]/10" : "bg-neutral-950 border-neutral-800"} transition-all hover:-translate-y-2 duration-300 flex flex-col`}>
                {p.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E23D28] text-white text-[11px] font-bold px-5 py-1.5 rounded-full tracking-widest shadow-lg uppercase">
                    推薦方案
                  </div>
                )}
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
                <button onClick={() => setIsContactModalOpen(true)} className={`w-full py-4 rounded-full font-bold transition-all text-sm mt-auto ${p.popular ? "bg-[#E23D28] hover:bg-[#c93623] text-white shadow-lg shadow-[#E23D28]/25" : "bg-white text-black hover:bg-neutral-200"}`}>
                  {p.btn}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center gap-3 bg-neutral-900 border border-neutral-800 px-6 py-3 rounded-full">
              <Users className="w-4 h-4 text-[#E23D28]" />
              <span className="text-neutral-400 text-sm font-light">為了維持服務品質，我們每月控制固定合作的品牌數量，歡迎提早預約討論。</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-neutral-900 bg-[#050505]">
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
                <a key={link.href} href={link.href} className="text-neutral-400 hover:text-[#E23D28] transition-colors">
                  {link.name}
                </a>
              ))}
            </div>
            {socialLinks?.length > 0 && (
              <div className="flex flex-col gap-3">
                {socialLinks.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#E23D28] transition-colors">
                    {s.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-neutral-900 text-center md:text-left text-neutral-600 text-xs font-light tracking-wider uppercase">
          © {new Date().getFullYear()} {site.brandName}. {site.footerCopyright}
        </div>
      </footer>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-[#0A0A0A]/90 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsContactModalOpen(false)} aria-hidden="true" />
          <div className="bg-neutral-900 border border-neutral-800 p-8 sm:p-12 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl shadow-[#E23D28]/10 transform transition-all max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsContactModalOpen(false)} className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="inline-flex items-center gap-2 text-[#E23D28] text-xs font-bold tracking-widest uppercase mb-6">
              <span className="w-6 h-[2px] bg-[#E23D28]" />
              {site.contactModalLabel}
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight whitespace-pre-line">{site.contactModalTitle}</h3>
            <p className="text-neutral-400 font-light leading-relaxed mb-6">{site.contactModalDesc}</p>

            {/* 聯絡表單：送出後寫入 Notion */}
            <form
              className="mb-8"
              onSubmit={async (e) => {
                e.preventDefault();
                setContactStatus("sending");
                setContactError("");
                try {
                  const res = await fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: contactForm.name.trim(),
                      email: contactForm.email.trim(),
                      phone: contactForm.phone.trim(),
                      message: contactForm.message.trim(),
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
                    rows={4}
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
              <button
                type="submit"
                disabled={contactStatus === "sending"}
                className="mt-6 w-full py-4 rounded-full font-bold text-white bg-[#E23D28] hover:bg-[#c93623] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {contactStatus === "sending" ? "送出中…" : "送出表單"}
              </button>
            </form>

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
          </div>
        </div>
      )}
    </div>
  );
}
