import { Navbar } from "@/components/dcfilms/Navbar";
import { Footer } from "@/components/dcfilms/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "關於我們｜台北專業影片製作團隊｜DC Films 影像製作",
  },
  description:
    "DC Films 由具備 15 年深厚實拍經驗的導演領軍，結合頂尖動畫技術與電影美學，服務歐姆龍、岱宇國際等 50+ 知名品牌。",
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "DC Films 影像製作",
    title: "關於我們｜台北專業影片製作團隊｜DC Films 影像製作",
    description:
      "DC Films 由具備 15 年深厚實拍經驗的導演領軍，結合頂尖動畫技術與電影美學，服務歐姆龍、岱宇國際等 50+ 知名品牌。",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-[#F5F0E8] dark:bg-black min-h-screen">
      <Navbar />
      <div className="pt-48 pb-32 px-8 md:px-16 max-w-[1400px] mx-auto">
        <div className="text-center mb-32">
          <h1 className="text-6xl md:text-8xl font-serif text-stone-900 dark:text-white italic mb-8">The Studio.</h1>
          <p className="text-stone-400 dark:text-zinc-400 tracking-widest uppercase text-sm">關於 DREAM CATCHER FILMS</p>
        </div>
        <div className="mb-24 border-t border-stone-200 dark:border-white/10" />
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-stone-900 dark:text-white leading-relaxed mb-12 italic">
            &ldquo;好的影像不僅是視覺的震撼，<br />更是對品質近乎苛求的執著展現。&rdquo;
          </h2>
          <div className="space-y-8 text-stone-500 dark:text-zinc-400 font-light tracking-wide leading-loose text-lg text-left">
            <p>DREAM CATCHER FILMS 由具備 15 年深厚實拍經驗的導演領軍，是一支結合頂尖「動畫技術」與「電影美學」的專業影像製作團隊。</p>
            <p>我們不只是執行者，更是創意的把關者。在這 15 年的影像淬鍊中，我們深知如何將客戶的商業訴求與藝術質感完美融合。從前期企劃、分鏡規劃到最終成片，導演親自參與每一個環節，對影像品質有著絕不妥協的要求。</p>
            <p>預算與品質不該是天平的兩端。透過極致的流程控管，我們確保每一分製作成本都刀口向內，直接轉化為畫面的電影張力。無論是細膩動人的實拍廣告，或是突破物理限制的 3D 動畫特效，我們都承諾交付超出預期的視覺饗宴。</p>
          </div>
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-16 text-center border-t border-stone-200 dark:border-white/10 pt-24">
            <div><div className="text-5xl font-serif italic text-stone-900 dark:text-white mb-4">15+</div><p className="text-stone-400 dark:text-zinc-500 tracking-widest uppercase text-sm">Years Experience</p></div>
            <div><div className="text-5xl font-serif italic text-stone-900 dark:text-white mb-4">200+</div><p className="text-stone-400 dark:text-zinc-500 tracking-widest uppercase text-sm">Projects Completed</p></div>
            <div><div className="text-5xl font-serif italic text-stone-900 dark:text-white mb-4">50+</div><p className="text-stone-400 dark:text-zinc-500 tracking-widest uppercase text-sm">Brand Partners</p></div>
          </div>
          <div className="mt-24">
            <Link href="/contact" className="uppercase tracking-widest text-sm text-stone-900 dark:text-white border-b border-stone-400 dark:border-zinc-600 pb-2 hover:border-stone-900 dark:hover:border-white transition-colors">
              Start a Project
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
