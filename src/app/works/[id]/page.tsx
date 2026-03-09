import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkById } from "@/lib/notion";
import { ArrowLeft, ExternalLink, Target, Lightbulb, TrendingUp } from "lucide-react";

export const revalidate = 10;

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const work = await getWorkById(id);
  if (!work) return { title: "案例 | DCParty" };
  const title = `${work.title} | DCParty 案例分析`;
  const desc =
    work.challenge || work.solution || work.result
      ? [work.challenge, work.solution, work.result].filter(Boolean).join(" ").slice(0, 160) + "…"
      : `${work.category} · ${work.title}`;
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: baseUrl ? `${baseUrl}/works/${id}` : undefined,
      ...(work.image && { images: [work.image] }),
    },
  };
}

export default async function WorkCasePage({ params }: Props) {
  const { id } = await params;
  const work = await getWorkById(id);
  if (!work) notFound();

  const hasStory = !!(work.challenge || work.solution || work.result);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="border-b border-neutral-800/80 bg-[#0A0A0A]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#E23D28] transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回精選案例
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-8">
          <span className="text-xs font-bold text-[#E23D28] uppercase tracking-widest">
            {work.category || "案例"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            {work.title}
          </h1>
        </div>

        {work.image && (
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 mb-12">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${work.image})` }}
            />
          </div>
        )}

        {hasStory && (
          <div className="space-y-12 mb-12">
            {work.challenge && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <Target className="w-5 h-5 text-[#E23D28]" />
                  客戶痛點 (Challenge)
                </h2>
                <p className="text-neutral-300 font-light leading-relaxed whitespace-pre-line">
                  {work.challenge}
                </p>
              </section>
            )}
            {work.solution && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <Lightbulb className="w-5 h-5 text-[#E23D28]" />
                  創意解法 (Solution)
                </h2>
                <p className="text-neutral-300 font-light leading-relaxed whitespace-pre-line">
                  {work.solution}
                </p>
              </section>
            )}
            {work.result && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <TrendingUp className="w-5 h-5 text-[#E23D28]" />
                  最終成效 (Result)
                </h2>
                <p className="text-neutral-300 font-light leading-relaxed whitespace-pre-line">
                  {work.result}
                </p>
              </section>
            )}
          </div>
        )}

        {!hasStory && (
          <p className="text-neutral-500 font-light mb-12">
            此案例的詳細過程說明將於日後補上，歡迎與我們聯繫了解更多。
          </p>
        )}

        {work.url && (
          <a
            href={work.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#E23D28] hover:bg-[#c93623] text-white font-bold px-6 py-3 rounded-full transition-colors shadow-lg shadow-[#E23D28]/25"
          >
            前往觀看完整作品
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </article>
    </div>
  );
}
