"use client";
import Link from "next/link";
import { useState } from "react";
import { Play } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollReveal } from "./ScrollReveal";
import type { DCProject } from "@/lib/notion-dcfilms";

const CATEGORIES = ["All", "商業廣告", "企業形象", "商業攝影", "MV", "動畫設計", "群眾募資"];

const FALLBACK_PROJECTS: DCProject[] = [
  { id: "1", title: "Omron 歐姆龍視覺規劃", slug: "omron-visual", client: "Omron Healthcare", category: ["商業廣告"], coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920", year: "2024", featured: true, vimeoUrl: "", descriptionZh: "為歐姆龍全新醫療設備打造的品牌視覺形象廣告。", descriptionEn: "", order: 1, metaTitle: "", metaDescription: "", ogImage: "" },
  { id: "2", title: "Gogoro 城市騎行", slug: "gogoro-city", client: "Gogoro", category: ["企業形象"], coverImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1920", year: "2023", featured: true, vimeoUrl: "", descriptionZh: "穿梭都市叢林，展現純電二輪的極致魅力。", descriptionEn: "", order: 2, metaTitle: "", metaDescription: "", ogImage: "" },
  { id: "3", title: "ASUS ROG 新品發布", slug: "asus-rog", client: "ASUS", category: ["商業廣告"], coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1920", year: "2024", featured: true, vimeoUrl: "", descriptionZh: "電競狂潮來襲，高幀率賽博龐克風格的完美融合。", descriptionEn: "", order: 3, metaTitle: "", metaDescription: "", ogImage: "" },
  { id: "4", title: "星空下的微光 MV", slug: "starlight-mv", client: "獨立樂團", category: ["MV"], coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1920", year: "2023", featured: true, vimeoUrl: "", descriptionZh: "獨立樂團年度單曲，採用 16mm 底片質感拍攝。", descriptionEn: "", order: 4, metaTitle: "", metaDescription: "", ogImage: "" },
];

export function ProjectsPageClient({ projects }: { projects: DCProject[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const displayProjects = projects.length > 0 ? projects : FALLBACK_PROJECTS;
  const filtered = activeCategory === "All" ? displayProjects : displayProjects.filter((p) => p.category.includes(activeCategory));

  return (
    <div className="bg-[#F5F0E8] dark:bg-black min-h-screen">
      <Navbar />
      <div className="pt-48 pb-32 px-8 md:px-16 max-w-[1800px] mx-auto">
        <div className="mb-24 text-center">
          <h1 className="text-6xl md:text-8xl font-serif text-stone-900 dark:text-white italic mb-8">Portfolio.</h1>
          <p className="text-stone-400 dark:text-zinc-400 tracking-widest uppercase text-sm">歷年影像作品與動畫案例</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-8 mb-24">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-sm tracking-widest uppercase transition-all duration-300 pb-1 border-b ${activeCategory === cat ? "text-stone-900 dark:text-white border-stone-900 dark:border-white" : "text-stone-400 dark:text-zinc-600 border-transparent hover:text-stone-600 dark:hover:text-zinc-400 hover:border-stone-400 dark:hover:border-zinc-600"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {filtered.map((project, idx) => (
            <ScrollReveal key={project.id} delay={(idx % 3) * 150}>
              <Link href={`/projects/${project.slug}`} className="group block cursor-pointer">
                <div className="overflow-hidden relative aspect-video mb-6 bg-stone-200 dark:bg-zinc-900">
                  {project.coverImage ? (
                    <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover transform scale-100 group-hover:scale-[1.05] transition-transform duration-[1500ms] ease-out opacity-80 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-full bg-stone-200 dark:bg-zinc-800" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-stone-900/40 dark:bg-black/40 backdrop-blur-[2px]">
                    <Play fill="currentColor" size={32} className="text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2 text-xs tracking-widest uppercase text-stone-400 dark:text-zinc-500">
                    <span>{project.client}</span>
                    <span>{project.year}</span>
                  </div>
                  <h3 className="text-xl font-serif text-stone-900 dark:text-white group-hover:text-stone-500 dark:group-hover:text-zinc-300 transition-colors">{project.title}</h3>
                  <p className="text-stone-400 dark:text-zinc-600 text-sm mt-1">{project.category.join(" / ")}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
