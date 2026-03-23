import { getBlogPostBySlug, getAllBlogSlugsForDCFilms } from "@/lib/notion-dcfilms";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/dcfilms/Navbar";
import { Footer } from "@/components/dcfilms/Footer";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dcfilms.tv";
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerptZh,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerptZh,
      images: post.ogImage ? [post.ogImage] : [],
      url: `${baseUrl}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedDate,
      authors: [post.author],
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: `${baseUrl}/blog/${post.slug}` },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugsForDCFilms();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dcfilms.tv";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerptZh,
    datePublished: post.publishedDate,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "DREAM CATCHER FILMS", url: baseUrl },
    image: post.ogImage || post.coverImage,
  };

  const formatDate = (d: string) => {
    if (!d) return "";
    try { return new Date(d).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" }); }
    catch { return d; }
  };

  return (
    <div className="bg-[#F5F0E8] dark:bg-black min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {post.coverImage && (
        <div className="w-full h-[60vh] relative overflow-hidden">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F5F0E8] dark:from-black via-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-8 py-24">
        <Link href="/blog" className="text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 flex items-center gap-4 mb-16 transition-colors text-sm uppercase tracking-widest">
          <span className="w-8 h-px bg-stone-400 dark:bg-zinc-500" /> Back to Journal
        </Link>

        <div className="flex gap-3 flex-wrap mb-6">
          {post.tags.map((tag) => <span key={tag} className="text-xs text-stone-400 dark:text-zinc-500 italic">#{tag}</span>)}
        </div>
        <h1 className="text-4xl md:text-6xl font-serif text-stone-900 dark:text-white italic leading-tight mb-8">{post.title}</h1>
        <div className="flex items-center gap-6 text-stone-400 dark:text-zinc-500 text-sm tracking-wide border-b border-stone-200 dark:border-white/10 pb-8 mb-16">
          <span>{formatDate(post.publishedDate)}</span>
          <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-zinc-600" />
          <span>{post.author}</span>
        </div>

        {post.markdown ? (
          <div className="prose prose-stone dark:prose-invert dark:prose-zinc max-w-none prose-headings:font-serif prose-headings:italic prose-img:w-full prose-a:text-stone-700 dark:prose-a:text-zinc-300">
            <ReactMarkdown>{post.markdown}</ReactMarkdown>
          </div>
        ) : (
          post.excerptZh && <p className="text-stone-500 dark:text-zinc-400 text-xl leading-relaxed font-light">{post.excerptZh}</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
