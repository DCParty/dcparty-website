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

  useEffect(() => {
    document.body.classList.remove("cursor-none");
    document.body.style.cursor = "";
    return () => { document.body.style.cursor = ""; };
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
      <nav
        className={`fixed w-full z-50 transition-all duration-700 ${
          isScrolled
            ? "bg-[#F5F0E8]/95 dark:bg-black/90 backdrop-blur-xl py-4 border-b border-stone-200 dark:border-white/5"
            : "bg-transparent py-8"
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-16 flex justify-between items-center">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <DreamCatcherLogo className={isScrolled ? "invert dark:invert-0" : "brightness-0 invert"} />
          </Link>

          {/* Desktop */}
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

          {/* Mobile 漢堡 */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileOpen(true)}
              aria-label="開啟選單"
              style={{ color: isScrolled ? "#1c1917" : "#ffffff" }}
            >
              <Menu size={28} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu — 完全用 inline style 避免 Tailwind / iOS 相容問題 */}
      {isMobileOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100svh",
            zIndex: 9999,
            backgroundColor: "#0a0a0a",
          }}
        >
          {/* 關閉按鈕 — 絕對定位，不佔垂直空間 */}
          <button
            onClick={() => setIsMobileOpen(false)}
            aria-label="關閉選單"
            style={{
              position: "absolute",
              top: "2rem",
              right: "2rem",
              color: "#ffffff",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.5rem",
              zIndex: 1,
            }}
          >
            <X size={32} strokeWidth={1.5} />
          </button>

          {/* 連結 — 佔滿全高後真正置中 */}
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "3rem",
          }}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                style={{ fontSize: "2.5rem", fontFamily: "Georgia, serif", fontStyle: "italic", color: "#ffffff", textDecoration: "none", display: "block" }}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* 底部小字 — 絕對定位 */}
          <div style={{ position: "absolute", bottom: "2rem", width: "100%", textAlign: "center", fontSize: "0.75rem", letterSpacing: "0.2em", color: "#666666" }}>
            DC FILMS · TAIPEI
          </div>
        </div>
      )}
    </>
  );
}
