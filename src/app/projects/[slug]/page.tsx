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

      {/* Hero — 全螢幕封面圖，標題壓左下 */}
      <div className="relative h-screen w-full overflow-hidden bg-stone-900">
        {project.coverImage && (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* 標題左下角 */}
        <div className="absolute bottom-16 left-8 md:left-16 right-8 md:right-16 z-10">
          <p className="text-xs tracking-[0.3em] uppercase text-zinc-400 mb-4">
            {project.category.join(" · ")}
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white italic leading-tight max-w-4xl">
            {project.title}
          </h1>
        </div>
      </div>

      {/* 內容區 */}
      <div className="max-w-5xl mx-auto px-8 md:px-16 py-24">

        {/* Back */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-stone-400 dark:text-zinc-500 hover:text-stone-900 dark:hover:text-white transition-colors mb-20"
        >
          <span className="w-8 h-px bg-current" />
          Return to Portfolio
        </Link>

        {/* Meta bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-200 dark:bg-white/10 border border-stone-200 dark:border-white/10 mb-20">
          {[
            { label: "Client", value: project.client || "—" },
            { label: "Category", value: project.category.join(", ") },
            { label: "Year", value: project.year || "—" },
            { label: "Director", value: "DC Films" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#F5F0E8] dark:bg-black px-8 py-6">
              <p className="text-[10px] tracking-[0.25em] uppercase text-stone-400 dark:text-zinc-600 mb-2">{label}</p>
              <p className="text-stone-900 dark:text-white text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {project.descriptionZh ? (
          <p className="text-stone-600 dark:text-zinc-300 text-xl font-light leading-relaxed tracking-wide mb-20 max-w-3xl">
            {project.descriptionZh}
          </p>
        ) : (
          <p className="text-stone-300 dark:text-zinc-600 text-lg font-light italic mb-20">
            詳細說明即將上線。
          </p>
        )}

        {/* Vimeo 影片 */}
        {vimeoId && (
          <div className="aspect-video w-full mb-20 bg-black">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?dnt=1&title=0&byline=0&portrait=0&color=E23D28`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Bottom nav */}
        <div className="border-t border-stone-200 dark:border-white/10 pt-16 flex justify-between items-center">
          <Link
            href="/projects"
            className="text-xs tracking-[0.2em] uppercase text-stone-400 dark:text-zinc-500 hover:text-stone-900 dark:hover:text-white transition-colors flex items-center gap-3"
          >
            <span className="w-8 h-px bg-current" />
            All Works
          </Link>
          <Link
            href="/contact"
            className="text-xs tracking-[0.2em] uppercase text-stone-900 dark:text-white border-b border-stone-900 dark:border-white pb-0.5 hover:text-[#E23D28] hover:border-[#E23D28] transition-colors"
          >
            Start a Project →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
