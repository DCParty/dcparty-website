"use client";
import Link from "next/link";
import { Play, ArrowRight, Aperture } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollReveal } from "./ScrollReveal";
import type { DCProject } from "@/lib/notion-dcfilms";

const SERVICES = [
  { id: "commercial", title: "Live Action Commercial", subtitle: "商業廣告實拍", desc: "憑藉深厚的實拍經驗，精準掌握燈光、運鏡與美術設定，為品牌打造極具感染力的視覺敘事。" },
  { id: "animation", title: "Animation & VFX", subtitle: "動畫與視覺特效", desc: "無縫結合 2D/3D 動畫與實拍畫面。突破現實物理限制，以極致的創意擴展影像的無限可能。" },
  { id: "cinematic", title: "Cinematic Aesthetics", subtitle: "電影級質感塑形", desc: "採用好萊塢規格的攝影系統與後期色彩科學，確保每一幀畫面都散發深邃且優雅的電影美學。" },
  { id: "workflow", title: "Strategic Execution", subtitle: "精準溝通與預算控管", desc: "透過高效的前期溝通與透明的製作流程，將每一分預算最大化轉化為畫面質感。" },
];

const FALLBACK_PROJECTS = [
  { id: "1", title: "Omron 歐姆龍視覺規劃", slug: "omron-visual", client: "Omron Healthcare", category: ["商業廣告"], coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920", year: "2024", featured: true, vimeoUrl: "", descriptionZh: "", descriptionEn: "", order: 1, metaTitle: "", metaDescription: "", ogImage: "" },
  { id: "2", title: "Gogoro 城市騎行", slug: "gogoro-city", client: "Gogoro", category: ["企業形象"], coverImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1920", year: "2023", featured: true, vimeoUrl: "", descriptionZh: "", descriptionEn: "", order: 2, metaTitle: "", metaDescription: "", ogImage: "" },
  { id: "3", title: "ASUS ROG 新品發布", slug: "asus-rog", client: "ASUS", category: ["商業廣告"], coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1920", year: "2024", featured: true, vimeoUrl: "", descriptionZh: "", descriptionEn: "", order: 3, metaTitle: "", metaDescription: "", ogImage: "" },
  { id: "4", title: "星空下的微光 MV", slug: "starlight-mv", client: "獨立樂團", category: ["MV"], coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1920", year: "2023", featured: true, vimeoUrl: "", descriptionZh: "", descriptionEn: "", order: 4, metaTitle: "", metaDescription: "", ogImage: "" },
];

const ASPECT_MAP = ["aspect-[16/9]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[16/9]"];

export function HomePageClient({ featuredProjects }: { featuredProjects: DCProject[] }) {
  const projects = featuredProjects.length > 0 ? featuredProjects : FALLBACK_PROJECTS;

  return (
    <div className="w-full bg-black">
      <style>{`
        @keyframes kenburns { 0% { transform: scale(1.05); } 100% { transform: scale(1.15); } }
        .animate-kenburns { animation: kenburns 30s ease-out forwards; }
        .text-shadow-cinematic { text-shadow: 0 10px 30px rgba(0,0,0,0.9); }
        .fade-in-up { animation: fadeInUp 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; transform: translateY(30px); }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      <Navbar />

      {/* Hero */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=2500" alt="Hero" className="w-full h-full object-cover animate-kenburns opacity-60 grayscale-[0.3]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black mix-blend-multiply" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />
        </div>
        <div className="relative z-10 text-center px-6 mt-20">
          <h1 className="text-6xl md:text-[8rem] text-white font-serif leading-[1.1] text-shadow-cinematic fade-in-up">
            光影流轉<br /><span className="italic font-light text-zinc-300">成就經典</span>
          </h1>
          <p className="mt-10 text-lg md:text-xl text-zinc-400 font-light tracking-widest max-w-2xl mx-auto fade-in-up delay-300 text-shadow-cinematic">
            結合深厚實拍底蘊與頂尖動畫特效<br />在精準預算內，綻放無限的視覺張力。
          </p>
          <div className="mt-16 fade-in-up delay-500 flex justify-center">
            <Link href="/projects" className="group relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/20 hover:border-white transition-colors duration-700">
              <div className="absolute inset-0 bg-white/5 rounded-full backdrop-blur-sm group-hover:bg-white/10 transition-colors duration-700" />
              <Play fill="currentColor" className="text-white/70 group-hover:text-white ml-1 transition-colors duration-700" size={32} />
            </Link>
          </div>
        </div>
      </section>

      {/* Selected Works */}
      <section className="py-40 px-8 md:px-16 max-w-[1800px] mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-end mb-24">
            <div>
              <h2 className="text-zinc-500 tracking-[0.3em] text-xs uppercase mb-4 font-semibold">Selected Works</h2>
              <h3 className="text-4xl md:text-5xl font-serif text-white italic">精選影像作品</h3>
            </div>
            <Link href="/projects" className="hidden md:flex items-center gap-3 text-sm tracking-widest uppercase text-zinc-400 hover:text-white transition-colors group">
              View Portfolio <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
          {projects.slice(0, 4).map((project, idx) => (
            <ScrollReveal key={project.id} delay={idx * 200}>
              <Link href={`/projects/${project.slug}`} className={`group block cursor-pointer ${idx % 2 !== 0 ? "md:mt-32" : ""}`}>
                <div className={`overflow-hidden relative ${ASPECT_MAP[idx] || "aspect-video"} mb-8 bg-zinc-900`}>
                  {project.coverImage ? (
                    <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover transform scale-100 group-hover:scale-[1.03] transition-transform duration-[1500ms] ease-out opacity-90 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-full bg-zinc-800" />
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs tracking-widest uppercase text-zinc-500">
                    <span>{project.client}</span>
                    <span>{project.year}</span>
                  </div>
                  <h3 className="text-2xl font-serif text-white group-hover:text-zinc-300 transition-colors mt-2">{project.title}</h3>
                  <p className="text-zinc-500 text-sm tracking-wide">{project.category.join(" / ")}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-40 bg-zinc-950 border-y border-white/5">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          <ScrollReveal>
            <div className="mb-24 text-center">
              <h2 className="text-zinc-500 tracking-[0.3em] text-xs uppercase mb-4 font-semibold">Our Expertise</h2>
              <h3 className="text-4xl md:text-5xl font-serif text-white italic">服務範疇與執行力</h3>
            </div>
          </ScrollReveal>
          <div className="max-w-5xl mx-auto space-y-16">
            {SERVICES.map((service, idx) => (
              <ScrollReveal key={service.id} delay={idx * 150}>
                <div className="group border-b border-white/10 pb-16 flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 hover:border-zinc-500 transition-colors duration-500">
                  <div className="text-5xl font-serif italic text-zinc-700 group-hover:text-zinc-400 transition-colors duration-500">0{idx + 1}</div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-serif text-white mb-2">{service.title}</h4>
                    <h5 className="text-zinc-400 tracking-widest text-sm mb-6 uppercase">{service.subtitle}</h5>
                    <p className="text-zinc-500 leading-relaxed font-light max-w-2xl group-hover:text-zinc-300 transition-colors duration-500">{service.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-40 px-8 md:px-16 max-w-[1800px] mx-auto text-center flex flex-col items-center">
        <ScrollReveal delay={100} className="flex flex-col items-center">
          <Aperture size={48} strokeWidth={1} className="text-zinc-600 mb-12" />
          <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight max-w-4xl italic mb-12">
            &ldquo;真正的電影質感，<br className="md:hidden" />來自於 15 年對光影的無數次淬鍊。&rdquo;
          </h2>
          <p className="text-zinc-400 max-w-2xl font-light leading-relaxed mb-12">
            憑藉導演 15 年深厚的實拍經驗，我們親自為客戶的創意把關，對每一幀畫面的品質有著近乎苛求的執著。結合頂尖動畫技術，我們確保每一分資源都化為強烈的視覺衝擊。
          </p>
          <Link href="/about" className="uppercase tracking-widest text-sm text-white border-b border-zinc-600 pb-2 hover:border-white transition-colors">
            Discover Our Studio
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
