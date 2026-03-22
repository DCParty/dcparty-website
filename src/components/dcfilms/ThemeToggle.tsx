"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("dcfilms-theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("dcfilms-theme", next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "切換為亮色主題" : "切換為暗色主題"}
      className="text-zinc-500 dark:text-zinc-500 hover:text-stone-900 dark:hover:text-white transition-colors duration-300"
    >
      {theme === "dark" ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
    </button>
  );
}
