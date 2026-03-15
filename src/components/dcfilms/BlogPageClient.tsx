"use client";
import Link from "next/link";
import { useState } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollReveal } from "./ScrollReveal";
import type { DCBlogPost } from "@/lib/notion-dcfilms";

const FALLBACK_POSTS: DCBlogPost[] = [
  { id: "1", title: "如何拍出具備電影感的商業廣告？", slug: "how-to-shoot-cinematic-commercial", coverImage: "https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?auto=format&fit=crop&q=80&w=800", excerptZh: "探討燈光、運鏡與調色在商業廣告中的應用，讓你的作品脫穎而出。", excerptEn: "", tags: ["拍攝技巧", "業界觀點"], author: "DC Films", publishedDate: "2024-03-15", metaTitle: "", metaDescription: "", ogImage: "" },
  { id: "2", title: "ARRI Alexa 35：色彩科學的極致展現", slug: "arri-alexa-35-review", coverImage: "https://images.unsplash.com/photo-1518131672697-611eb14c10f8?auto=format&fit=crop&q=80&w=800", excerptZh: "升級旗艦攝影系統，探索更寬廣的動態範圍與真實膚色還原。", excerptEn: "", tags: ["器材解析", "後期調光"], author: "DC Films", publishedDate: "2024-02-10", metaTitle: "", metaDescription: "", ogImage: "" },
];

export function BlogPageClient({ posts }: { posts: DCBlogPost[] }) {
  const displayPosts = posts.length > 0 ? posts : FALLBACK_POSTS;
  const allTags = Array.from(new Set(displayPosts.flatMap((p) => p.tags)));
  const [activeTag, setActiveTag] = useState("All");
  const filtered = activeTag === "All" ? displayPosts : displayPosts.filter((p) => p.tags.includes(activeTag));

  const formatDate = (d: string) => {
    if (!d) return "";
    try { return new Date(d).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" }); }
    catch { return d; }
  };

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <div className="pt-48 pb-32 px-8 md:px-16 max-w-[1400px] mx-auto">
        <ScrollReveal>
          <div className="mb-24 text-center">
            <h1 className="text-6xl md:text-8xl font-serif text-white italic mb-8">Journal.</h1>
            <p className="text-zinc-400 tracking-widest uppercase text-sm">觀點、技術日誌與幕後紀實</p>
          </div>
        </ScrollReveal>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 mb-24">
            <button onClick={() => setActiveTag("All")} className={`text-sm tracking-widest uppercase pb-1 border-b transition-all ${activeTag === "All" ? "text-white border-white" : "text-zinc-600 border-transparent hover:text-zinc-400 hover:border-zinc-600"}`}>All</button>
            {allTags.map((tag) => (
              <button key={tag} onClick={() => setActiveTag(tag)} className={`text-sm tracking-widest uppercase pb-1 border-b transition-all ${activeTag === tag ? "text-white border-white" : "text-zinc-600 border-transparent hover:text-zinc-400 hover:border-zinc-600"}`}>{tag}</button>
            ))}
          </div>
        )}

        <div className="space-y-24">
          {filtered.map((post, idx) => (
            <ScrollReveal key={post.id} delay={idx * 200}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <article className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                  <div className="md:col-span-7 overflow-hidden bg-zinc-900 aspect-video">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-[1500ms] ease-out opacity-90 group-hover:opacity-100" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800" />
                    )}
                  </div>
                  <div className="md:col-span-5 md:pl-8">
                    <div className="text-xs text-zinc-500 tracking-widest mb-4 uppercase">{formatDate(post.publishedDate)}</div>
                    <h2 className="text-3xl font-serif text-white mb-6 group-hover:text-zinc-300 transition-colors leading-snug">{post.title}</h2>
                    <p className="text-zinc-400 font-light leading-relaxed mb-8">{post.excerptZh}</p>
                    <div className="flex gap-4 flex-wrap">
                      {post.tags.map((tag) => <span key={tag} className="text-xs text-zinc-500 italic">#{tag}</span>)}
                    </div>
                  </div>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
