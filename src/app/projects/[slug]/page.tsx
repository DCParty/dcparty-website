import { getProjectBySlug, getAllProjectSlugs } from "@/lib/notion-dcfilms";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/dcfilms/Navbar";
import { Footer } from "@/components/dcfilms/Footer";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";
import { Play } from "lucide-react";

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

  // Extract Vimeo ID from URL
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
    <div className="bg-black min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* Immersive Cover / Video */}
      <div className="w-full h-[75vh] bg-black relative flex items-center justify-center overflow-hidden">
        {project.coverImage && (
          <img src={project.coverImage} alt={project.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
        {vimeoId ? (
          <div className="relative z-10 w-full max-w-5xl aspect-video px-8">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?dnt=1&title=0&byline=0&portrait=0`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative z-10 w-24 h-24 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white">
            <Play fill="currentColor" size={32} className="ml-2" />
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-8 mt-24 pb-32">
        <Link href="/projects" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-4 mb-16 transition-colors text-sm uppercase tracking-widest">
          <span className="w-8 h-px bg-zinc-500" /> Return to Portfolio
        </Link>
        <h1 className="text-5xl md:text-7xl font-serif text-white mb-12 leading-tight italic">{project.title}</h1>

        {/* Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-white/10 mb-16">
          <div><h4 className="text-xs text-zinc-600 uppercase tracking-widest mb-2 font-semibold">Client</h4><p className="text-zinc-300">{project.client}</p></div>
          <div><h4 className="text-xs text-zinc-600 uppercase tracking-widest mb-2 font-semibold">Category</h4><p className="text-zinc-300">{project.category.join(", ")}</p></div>
          <div><h4 className="text-xs text-zinc-600 uppercase tracking-widest mb-2 font-semibold">Year</h4><p className="text-zinc-300">{project.year}</p></div>
          <div><h4 className="text-xs text-zinc-600 uppercase tracking-widest mb-2 font-semibold">Director</h4><p className="text-zinc-300">DC Films</p></div>
        </div>

        {project.descriptionZh && (
          <p className="text-zinc-400 font-light text-lg leading-relaxed mb-16">{project.descriptionZh}</p>
        )}

        {project.markdown && (
          <div className="prose prose-invert prose-zinc max-w-none prose-headings:font-serif prose-headings:italic prose-img:w-full">
            <ReactMarkdown>{project.markdown}</ReactMarkdown>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
