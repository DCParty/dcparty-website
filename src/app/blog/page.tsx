import Link from "next/link";
import { getBlogPosts } from "@/lib/notion";
import { ArrowRight, Tag } from "lucide-react";

export const metadata = {
  title: "部落格 | DCParty 數位創意派",
  description: "DCParty 的觀點、案例與產業洞察。廣告影音、視覺設計與軟體開發的實戰分享。",
};

/** 每 10 秒重新向 Notion 拉取文章列表 */
export const revalidate = 10;

const placeholderCover = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect fill='%23171717' width='800' height='450'/%3E%3Ctext fill='%234a4a4a' font-family='system-ui' font-size='24' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3E封面圖%3C/text%3E%3C/svg%3E";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="border-b border-neutral-800/80 bg-[#0A0A0A]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#E23D28] transition-colors text-sm font-medium mb-6">
            <ArrowRight className="w-4 h-4 rotate-180" />
            返回首頁
          </Link>
          <div className="flex flex-col gap-2">
            <span className="text-[#E23D28] text-xs font-bold tracking-[0.2em] uppercase">Blog</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              觀點與洞察
            </h1>
            <p className="text-neutral-400 max-w-xl text-sm sm:text-base mt-1">
              廣告影音、視覺設計與軟體開發的實戰分享與產業觀察。
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 py-24 text-center">
            <p className="text-neutral-500 mb-2">尚無文章</p>
            <p className="text-sm text-neutral-600">
              在 Notion 建立「H) DCParty_Blog」資料庫並將發布狀態勾選為 true 後，文章會顯示於此。
            </p>
          </div>
        ) : (
          <ul className="grid gap-8 sm:gap-10 md:grid-cols-2">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.id}`}
                  className="group block rounded-3xl border border-neutral-800 bg-neutral-950/80 overflow-hidden transition-all duration-300 hover:border-[#E23D28]/40 hover:shadow-xl hover:shadow-[#E23D28]/5"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-neutral-900">
                    <img
                      src={post.coverImage || placeholderCover}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent opacity-90" />
                    {post.category && (
                      <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[#E23D28]/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                        <Tag className="w-3 h-3" />
                        {post.category}
                      </span>
                    )}
                  </div>
                  <div className="p-6 sm:p-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#E23D28] transition-colors line-clamp-2 mb-3">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-[#E23D28]">
                      閱讀全文
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="border-t border-neutral-800/80 mt-24 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-neutral-500 text-sm">
          <Link href="/" className="hover:text-[#E23D28] transition-colors">
            DCParty 數位創意派
          </Link>
        </div>
      </footer>
    </div>
  );
}
