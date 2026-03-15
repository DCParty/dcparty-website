import { Navbar } from "@/components/dcfilms/Navbar";
import { Footer } from "@/components/dcfilms/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Studio",
  description: "關於 DREAM CATCHER FILMS。由具備 15 年深厚實拍經驗的導演領軍，結合頂尖動畫技術與電影美學的專業影像製作團隊。",
};

export default function AboutPage() {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <div className="pt-48 pb-32 px-8 md:px-16 max-w-[1400px] mx-auto">
        <div className="text-center mb-32">
          <h1 className="text-6xl md:text-8xl font-serif text-white italic mb-8">The Studio.</h1>
          <p className="text-zinc-400 tracking-widest uppercase text-sm">關於 DREAM CATCHER FILMS</p>
        </div>
        <div className="aspect-video bg-zinc-900 mb-24 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1588666308996-2f085ceaf2b5?auto=format&fit=crop&q=80&w=1920" alt="Team behind the scenes" className="w-full h-full object-cover opacity-80 mix-blend-luminosity grayscale-[0.3]" />
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-white leading-relaxed mb-12 italic">
            &ldquo;好的影像不僅是視覺的震撼，<br />更是對品質近乎苛求的執著展現。&rdquo;
          </h2>
          <div className="space-y-8 text-zinc-400 font-light tracking-wide leading-loose text-lg text-left">
            <p>DREAM CATCHER FILMS 由具備 15 年深厚實拍經驗的導演領軍，是一支結合頂尖「動畫技術」與「電影美學」的專業影像製作團隊。</p>
            <p>我們不只是執行者，更是創意的把關者。在這 15 年的影像淬鍊中，我們深知如何將客戶的商業訴求與藝術質感完美融合。從前期企劃、分鏡規劃到最終成片，導演親自參與每一個環節，對影像品質有著絕不妥協的要求。</p>
            <p>預算與品質不該是天平的兩端。透過極致的流程控管，我們確保每一分製作成本都刀口向內，直接轉化為畫面的電影張力。無論是細膩動人的實拍廣告，或是突破物理限制的 3D 動畫特效，我們都承諾交付超出預期的視覺饗宴。</p>
          </div>
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-16 text-center border-t border-white/10 pt-24">
            <div><div className="text-5xl font-serif italic text-white mb-4">15+</div><p className="text-zinc-500 tracking-widest uppercase text-sm">Years Experience</p></div>
            <div><div className="text-5xl font-serif italic text-white mb-4">200+</div><p className="text-zinc-500 tracking-widest uppercase text-sm">Projects Completed</p></div>
            <div><div className="text-5xl font-serif italic text-white mb-4">50+</div><p className="text-zinc-500 tracking-widest uppercase text-sm">Brand Partners</p></div>
          </div>
          <div className="mt-24">
            <Link href="/contact" className="uppercase tracking-widest text-sm text-white border-b border-zinc-600 pb-2 hover:border-white transition-colors">
              Start a Project
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
