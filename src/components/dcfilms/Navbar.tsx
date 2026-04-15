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

  // 開選單時鎖定 body scroll
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  return (
    <>
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-700 ${
        isScrolled
          ? "bg-[#F5F0E8]/95 dark:bg-black/90 backdrop-blur-xl py-4 border-b border-stone-200 dark:border-white/5"
          : "bg-transparent py-8"
      }`}>
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 flex justify-between items-center">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <DreamCatcherLogo className={isScrolled ? "invert dark:invert-0" : "brightness-0 invert"} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-widest uppercase transition-all duration-500 font-medium ${
                  pathname.startsWith(link.href)
                    ? "text-stone-900 dark:text-white"
                    : "text-stone-400 dark:text-zinc-500 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <ThemeToggle />
          </div>

          {/* Mobile: ThemeToggle + 漢堡 */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              className={isScrolled ? "text-stone-900 dark:text-white" : "text-white"}
              onClick={() => setIsMobileOpen(true)}
              aria-label="開啟選單"
            >
              <Menu size={28} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu — 條件渲染，完全不存在於 DOM 當 closed */}
      {isMobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999 }}
          className="bg-stone-100 dark:bg-neutral-900 flex flex-col"
        >
          {/* 頂部列：關閉按鈕 */}
          <div className="flex justify-end p-8">
            <button
              onClick={() => setIsMobileOpen(false)}
              aria-label="關閉選單"
              className="text-stone-900 dark:text-white"
            >
              <X size={32} strokeWidth={1.5} />
            </button>
          </div>

          {/* 連結 */}
          <div className="flex-1 flex flex-col justify-center items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="text-4xl font-serif italic text-stone-800 dark:text-white"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
