import { getProjectBySlug, getAllProjectSlugs } from "@/lib/notion-dcfilms";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/dcfilms/Navbar";
import { Footer } from "@/components/dcfilms/Footer";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dcfilms.tv";
  return {
    title: project.metaTitle || project.title,
    description: project.metaDescription || project.descriptionZh,
    openGraph: {
      title: project.metaTitle || project.title,
      description: project.metaDescription || project.descriptionZh,
      images: project.ogImage ? [project.ogImage] : [],
      url: `${baseUrl}/projects/${project.slug}`,
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: `${baseUrl}/projects/${project.slug}` },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const vimeoId = project.vimeoUrl ? project.vimeoUrl.match(/vimeo\.com\/(\d+)/)?.[1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.descriptionZh,
    creator: { "@type": "Organization", name: "DREAM CATCHER FILMS" },
    dateCreated: project.year,
  };

  return (
    <div className="bg-[#F5F0E8] dark:bg-black min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* Hero — 全螢幕封面 */}
      <div className="relative h-screen w-full overflow-hidden bg-stone-900">
        {project.coverImage && (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-75"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* 分類 + 標題 壓左下 */}
        <div className="absolute bottom-16 left-8 md:left-16 right-8 md:right-16 z-10">
          <div className="flex items-center gap-3 mb-5">
            {project.category.map((cat) => (
              <span key={cat} className="text-[10px] tracking-[0.35em] uppercase text-[#E23D28] border border-[#E23D28]/40 px-3 py-1">
                {cat}
              </span>
            ))}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white italic leading-tight max-w-4xl">
            {project.title}
          </h1>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 right-8 md:right-16 z-10 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-white animate-pulse" />
          <span className="text-white text-[9px] tracking-[0.3em] uppercase rotate-90 origin-center translate-y-4">Scroll</span>
        </div>
      </div>

      {/* 內容 */}
      <div className="max-w-6xl mx-auto px-8 md:px-16 py-20">

        {/* Back */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-stone-400 dark:text-zinc-600 hover:text-stone-900 dark:hover:text-white transition-colors mb-20"
        >
          <span className="w-10 h-px bg-current" />
          Return to Portfolio
        </Link>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-stone-200 dark:border-white/10 mb-20">
          {[
            { label: "Client", value: project.client || "—" },
            { label: "Category", value: project.category.join(" / ") },
            { label: "Year", value: project.year || "—" },
            { label: "Production", value: "Dream Catcher Films" },
          ].map(({ label, value }, i) => (
            <div key={label} className={`py-8 pr-8 ${i > 0 ? "border-l border-stone-200 dark:border-white/10 pl-8" : ""}`}>
              <p className="text-[9px] tracking-[0.3em] uppercase text-stone-400 dark:text-zinc-600 mb-3">{label}</p>
              <p className="text-stone-900 dark:text-white text-sm font-medium tracking-wide">{value}</p>
            </div>
          ))}
        </div>

        {/* 描述 */}
        {project.descriptionZh ? (
          <div className="max-w-3xl mb-20">
            <p className="text-stone-600 dark:text-zinc-300 text-xl md:text-2xl font-light leading-[1.9] tracking-wide">
              {project.descriptionZh}
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mb-20 border-l-2 border-[#E23D28]/30 pl-8 py-2">
            <p className="text-stone-300 dark:text-zinc-600 text-lg font-light italic">
              完整作品介紹即將上線。
            </p>
          </div>
        )}

        {/* Vimeo */}
        {vimeoId && (
          <div className="mb-20">
            <div className="aspect-video w-full overflow-hidden bg-black">
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}?dnt=1&title=0&byline=0&portrait=0&color=E23D28`}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-[9px] tracking-[0.3em] uppercase text-stone-300 dark:text-zinc-700 mt-4 text-right">
              © Dream Catcher Films
            </p>
          </div>
        )}

        {/* Footer nav */}
        <div className="border-t border-stone-200 dark:border-white/10 pt-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-4 text-[10px] tracking-[0.3em] uppercase text-stone-400 dark:text-zinc-600 hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            <span className="w-10 h-px bg-current" />
            All Works
          </Link>
          <div className="text-right">
            <p className="text-[9px] tracking-[0.3em] uppercase text-stone-400 dark:text-zinc-600 mb-3">有影像製作需求？</p>
            <Link
              href="/contact"
              className="text-sm tracking-[0.15em] uppercase text-stone-900 dark:text-white border-b border-stone-900 dark:border-white pb-0.5 hover:text-[#E23D28] hover:border-[#E23D28] transition-colors"
            >
              Start a Project →
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
