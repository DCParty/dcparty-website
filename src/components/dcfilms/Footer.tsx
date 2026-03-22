import Link from "next/link";
import { DreamCatcherLogo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-[#F5F0E8] dark:bg-black text-stone-500 dark:text-zinc-500 py-32 px-8 md:px-16 border-t border-stone-200 dark:border-white/5">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
        <div className="md:col-span-5">
          <div className="mb-10">
            <DreamCatcherLogo />
          </div>
          <p className="text-lg font-serif italic text-stone-400 dark:text-zinc-400 max-w-sm leading-relaxed">
            &ldquo;Crafting visual stories that resonate. Blending the art of cinematography with cutting-edge animation.&rdquo;
          </p>
        </div>
        <div className="md:col-span-2 md:col-start-8">
          <h3 className="text-stone-900 dark:text-white text-xs tracking-[0.2em] uppercase mb-8 font-semibold">Studio</h3>
          <ul className="text-sm space-y-4 tracking-wide">
            <li>114 台北市內湖區<br />新湖二路166號2F</li>
            <li><a href="mailto:hello@dcfilms.tv" className="hover:text-stone-900 dark:hover:text-white transition-colors">hello@dcfilms.tv</a></li>
            <li><a href="tel:+886227290939" className="hover:text-stone-900 dark:hover:text-white transition-colors">02-2729-0939</a></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h3 className="text-stone-900 dark:text-white text-xs tracking-[0.2em] uppercase mb-8 font-semibold">Social</h3>
          <ul className="text-sm space-y-4 tracking-wide">
            <li><a href="https://vimeo.com/dcfilms" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 dark:hover:text-white transition-colors">Vimeo</a></li>
            <li><a href="https://www.instagram.com/dcfilms" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 dark:hover:text-white transition-colors">Instagram</a></li>
            <li><a href="https://www.facebook.com/dcfilms" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 dark:hover:text-white transition-colors">Facebook</a></li>
            <li><a href="https://www.behance.net/dcfilms" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 dark:hover:text-white transition-colors">Behance</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1800px] mx-auto mt-32 pt-8 border-t border-stone-200 dark:border-white/5 text-xs tracking-widest flex flex-col md:flex-row justify-between items-center gap-4 text-stone-400 dark:text-zinc-600">
        <p>© {new Date().getFullYear()} DREAM CATCHER FILMS. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-8">
          <Link href="/projects" className="hover:text-stone-500 dark:hover:text-zinc-400 transition-colors">Works</Link>
          <Link href="/about" className="hover:text-stone-500 dark:hover:text-zinc-400 transition-colors">Studio</Link>
          <Link href="/contact" className="hover:text-stone-500 dark:hover:text-zinc-400 transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
