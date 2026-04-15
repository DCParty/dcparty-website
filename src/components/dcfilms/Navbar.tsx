"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { DreamCatcherLogo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { name: "Works", href: "/projects" },
  { name: "Studio", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // DC Films 不使用 DCParty 的自訂游標，強制還原預設游標
  useEffect(() => {
    document.body.classList.remove("cursor-none");
    document.body.style.cursor = "";
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-700 ${isScrolled ? "bg-[#F5F0E8]/95 dark:bg-black/90 backdrop-blur-xl py-4 border-b border-stone-200 dark:border-white/5" : "bg-transparent py-8"}`}>
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 flex justify-between items-center">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <DreamCatcherLogo className={isScrolled || isMobileOpen ? "invert dark:invert-0" : "brightness-0 invert"} />
          </Link>
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`text-sm tracking-widest uppercase transition-all duration-500 font-medium ${pathname.startsWith(link.href) ? "text-stone-900 dark:text-white" : "text-stone-400 dark:text-zinc-500 hover:text-stone-900 dark:hover:text-white"}`}>
                {link.name}
              </Link>
            ))}
            <ThemeToggle />
          </div>
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              className={`relative z-[110] transition-colors ${isMobileOpen ? "text-stone-900 dark:text-white" : "text-stone-900 dark:text-white"}`}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label={isMobileOpen ? "關閉選單" : "開啟選單"}
            >
              {isMobileOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu — 獨立在 nav 外，z-[100] 確保高於所有頁面內容 */}
      <div
        className={`fixed inset-0 bg-[#F5F0E8] dark:bg-black z-[100] transform transition-transform duration-500 ease-in-out ${isMobileOpen ? "translate-x-0" : "translate-x-full"} md:hidden flex flex-col justify-center items-center gap-10`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsMobileOpen(false)}
            className="text-3xl font-serif text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white italic transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </>
  );
}
