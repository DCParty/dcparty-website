import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceBySlug, getAllServiceSlugs } from "@/lib/notion";
import { ArrowLeft, Film, Image as ImageIcon, Music, Code, MessageCircle } from "lucide-react";

export const revalidate = 10;

const ICON_MAP: Record<string, React.ReactNode> = {
  Film: <Film className="w-12 h-12 text-[#E23D28]" />,
  Image: <ImageIcon className="w-12 h-12 text-[#E23D28]" />,
  ImageIcon: <ImageIcon className="w-12 h-12 text-[#E23D28]" />,
  Music: <Music className="w-12 h-12 text-[#E23D28]" />,
  Code: <Code className="w-12 h-12 text-[#E23D28]" />,
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "服務 | DCParty" };
  return {
    title: `${service.title} | DCParty 服務`,
    description: service.desc || undefined,
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const iconNode = ICON_MAP[service.icon] ?? ICON_MAP.Film;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="border-b border-neutral-800/80 bg-[#0A0A0A]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/#services"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#E23D28] transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回服務範疇
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-10">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shrink-0">
            {iconNode}
          </div>
          <div>
            {service.tag && (
              <span className="inline-flex items-center rounded-full bg-[#E23D28]/20 text-[#E23D28] px-3 py-1 text-xs font-bold tracking-wider uppercase mb-4">
                {service.tag}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
              {service.title}
            </h1>
            {service.desc && (
              <p className="text-neutral-400 text-lg leading-relaxed">
                {service.desc}
              </p>
            )}
          </div>
        </div>

        {service.detail && (
          <div className="border-t border-neutral-800 pt-10">
            <h2 className="text-lg font-bold text-white mb-4">詳細說明</h2>
            <div className="text-neutral-300 leading-relaxed whitespace-pre-line">
              {service.detail}
            </div>
          </div>
        )}

        <div className="mt-14 pt-10 border-t border-neutral-800 flex flex-col gap-6">
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 text-[#E23D28] hover:underline font-medium text-sm w-fit"
          >
            查看合作方案
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto max-w-xs bg-[#E23D28] hover:bg-[#c93623] text-white font-bold py-4 px-8 rounded-full transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            線上諮詢
          </Link>
        </div>
      </article>

      <footer className="border-t border-neutral-800/80 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-neutral-500 hover:text-[#E23D28] text-sm transition-colors">
            DCParty 數位創意派
          </Link>
        </div>
      </footer>
    </div>
  );
}
