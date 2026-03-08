import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostById } from "@/lib/notion";
import { NotionBlockRenderer } from "@/components/NotionBlockRenderer";
import { ArrowLeft, Tag } from "lucide-react";

const placeholderCover = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='630' viewBox='0 0 1200 630'%3E%3Crect fill='%23171717' width='1200' height='630'/%3E%3Ctext fill='%234a4a4a' font-family='system-ui' font-size='32' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3E封面圖%3C/text%3E%3C/svg%3E";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) return { title: "文章不存在 | DCParty" };
  return {
    title: `${post.title} | DCParty 部落格`,
    description: post.excerpt || undefined,
    openGraph: post.coverImage ? { images: [post.coverImage] } : undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) notFound();

  const blocks = Array.isArray(post.blocks) ? post.blocks : [];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="border-b border-neutral-800/80 bg-[#0A0A0A]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#E23D28] transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回部落格
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {post.coverImage && (
          <div className="rounded-3xl overflow-hidden border border-neutral-800 mb-10 aspect-2/1 bg-neutral-900">
            <img
              src={post.coverImage}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {!post.coverImage && (
          <div className="rounded-3xl overflow-hidden border border-neutral-800 mb-10 aspect-2/1 bg-neutral-900 flex items-center justify-center">
            <img src={placeholderCover} alt="" className="w-full h-full object-cover opacity-60" />
          </div>
        )}

        {post.category && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E23D28]/20 text-[#E23D28] px-3 py-1 text-xs font-bold tracking-wide mb-6">
            <Tag className="w-3 h-3" />
            {post.category}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-neutral-400 leading-relaxed mb-10 border-l-4 border-[#E23D28]/50 pl-6">
            {post.excerpt}
          </p>
        )}

        <div className="prose prose-invert max-w-none">
          <NotionBlockRenderer blocks={blocks} />
        </div>
      </article>

      <footer className="border-t border-neutral-800/80 mt-20 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#E23D28] hover:underline font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            回部落格列表
          </Link>
        </div>
      </footer>
    </div>
  );
}
