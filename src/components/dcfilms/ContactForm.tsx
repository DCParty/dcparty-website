"use client";
import { useState, FormEvent } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact-dcfilms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          service: data.get("service"),
          budget: data.get("budget"),
          message: data.get("message"),
        }),
      });
      if (res.ok) { setStatus("success"); (e.target as HTMLFormElement).reset(); }
      else setStatus("error");
    } catch { setStatus("error"); }
  }

  return (
    <div className="bg-stone-100 dark:bg-zinc-900/30 p-10 md:p-16 border border-stone-200 dark:border-white/5">
      <h3 className="text-2xl font-serif text-stone-900 dark:text-white italic mb-10">Start a Project</h3>

      {status === "success" && (
        <div className="mb-8 p-4 border border-stone-400 dark:border-zinc-600 text-stone-600 dark:text-zinc-300 text-sm tracking-wide">
          感謝您的來信，我們將於 1-2 個工作天內回覆。
        </div>
      )}
      {status === "error" && (
        <div className="mb-8 p-4 border border-red-800 text-red-400 text-sm tracking-wide">
          送出失敗，請直接來信 hello@dcfilms.tv
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-400 dark:text-zinc-500 mb-3">Name / 姓名</label>
            <input name="name" type="text" required className="w-full bg-transparent border-b border-stone-300 dark:border-zinc-700 text-stone-900 dark:text-white px-0 py-2 focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors font-light" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-400 dark:text-zinc-500 mb-3">Email / 信箱</label>
            <input name="email" type="email" required className="w-full bg-transparent border-b border-stone-300 dark:border-zinc-700 text-stone-900 dark:text-white px-0 py-2 focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors font-light" />
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-400 dark:text-zinc-500 mb-3">Phone / 電話</label>
          <input name="phone" type="tel" className="w-full bg-transparent border-b border-stone-300 dark:border-zinc-700 text-stone-900 dark:text-white px-0 py-2 focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors font-light" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-400 dark:text-zinc-500 mb-3">Service / 需求類型</label>
          <select name="service" className="w-full bg-transparent border-b border-stone-300 dark:border-zinc-700 text-stone-900 dark:text-white px-0 py-2 focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors font-light appearance-none">
            <option className="bg-[#F5F0E8] dark:bg-black">商業廣告實拍</option>
            <option className="bg-[#F5F0E8] dark:bg-black">動畫與視覺特效</option>
            <option className="bg-[#F5F0E8] dark:bg-black">企業形象影片</option>
            <option className="bg-[#F5F0E8] dark:bg-black">MV 製作</option>
            <option className="bg-[#F5F0E8] dark:bg-black">其他製作需求</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-400 dark:text-zinc-500 mb-3">Budget / 預算範圍</label>
          <select name="budget" className="w-full bg-transparent border-b border-stone-300 dark:border-zinc-700 text-stone-900 dark:text-white px-0 py-2 focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors font-light appearance-none">
            <option className="bg-[#F5F0E8] dark:bg-black">請選擇預算範圍</option>
            <option className="bg-[#F5F0E8] dark:bg-black">10萬以內</option>
            <option className="bg-[#F5F0E8] dark:bg-black">10萬 - 30萬</option>
            <option className="bg-[#F5F0E8] dark:bg-black">30萬 - 50萬</option>
            <option className="bg-[#F5F0E8] dark:bg-black">50萬 - 100萬</option>
            <option className="bg-[#F5F0E8] dark:bg-black">100萬以上</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-400 dark:text-zinc-500 mb-3">Message / 專案簡述</label>
          <textarea name="message" rows={4} required className="w-full bg-transparent border-b border-stone-300 dark:border-zinc-700 text-stone-900 dark:text-white px-0 py-2 focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors font-light resize-none" />
        </div>
        <button type="submit" disabled={status === "sending"} className="text-sm uppercase tracking-widest font-medium text-white bg-stone-900 dark:text-black dark:bg-white px-10 py-4 hover:bg-stone-700 dark:hover:bg-zinc-300 transition-colors w-full disabled:opacity-50">
          {status === "sending" ? "Sending..." : "Submit Inquiry"}
        </button>
      </form>
    </div>
  );
}
