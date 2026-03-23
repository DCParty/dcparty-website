"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { DreamCatcherLogo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { name: "Works", href: "/projects" },
  { name: "Expertise", href: "/services" },
  { name: "Studio", href: "/about" },
  { name: "Journal", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-700 ${isScrolled ? "bg-[#F5F0E8]/95 dark:bg-black/90 backdrop-blur-xl py-4 border-b border-stone-200 dark:border-white/5" : "bg-transparent py-8"}`}>
      <div className="max-w-[1800px] mx-auto px-8 md:px-16 flex justify-between items-center">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <DreamCatcherLogo />
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
          <button className="text-stone-900 dark:text-white" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            {isMobileOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
          </button>
        </div>
      </div>
      <div className={`fixed inset-0 bg-[#F5F0E8] dark:bg-black z-40 transform transition-transform duration-700 ease-in-out ${isMobileOpen ? "translate-x-0" : "translate-x-full"} md:hidden flex flex-col justify-center items-center gap-10`}>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setIsMobileOpen(false)} className="text-3xl font-serif text-stone-400 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white italic transition-colors">
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
