"use client";

import { motion } from "framer-motion";

const projects = [
  { title: "城市光影形象影片", category: "影片 / 品牌", thumbnail: "Video Reel" },
  { title: "Minimalist 品牌識別", category: "平面 / Logo", thumbnail: "Brand Design" },
  { title: "互動式產品登陸頁", category: "Web / UI", thumbnail: "Landing Page" },
  { title: "劇照級商業攝影", category: "攝影 / 商業", thumbnail: "Photo Set" },
];

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
          精選作品集
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-slate-300">
          這裡將展示你的代表性專案，可依照「廣告／影片／照片／網站」等類別做區分。
          目前是範例資料，之後可以依照你的實際作品替換。
        </p>
      </div>

      <motion.div
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
      >
        {projects.map((project) => (
          <motion.article
            key={project.title}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 shadow-md shadow-black/30"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-black text-xs font-medium uppercase tracking-wide text-slate-300">
                {project.thumbnail}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-slate-50 backdrop-blur">
                  查看專案
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 px-4 py-4">
              <h2 className="text-sm font-semibold text-slate-50">
                {project.title}
              </h2>
              <p className="text-xs text-slate-400">{project.category}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
}

