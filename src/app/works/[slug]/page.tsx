import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkBySlug, getAllWorkSlugs } from "@/lib/notion";
import { getGitHubRepoDetail, getDCPartyGitHubRepos } from "@/lib/github";
import { ArrowLeft, ExternalLink, Target, Lightbulb, TrendingUp, Star, Tag } from "lucide-react";

export const revalidate = 3600;

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const [notionSlugs, githubRepos] = await Promise.all([
    getAllWorkSlugs(),
    getDCPartyGitHubRepos(),
  ]);
  return [
    ...notionSlugs.map((slug: string) => ({ slug })),
    ...githubRepos.map((r) => ({ slug: r.slug })),
  ];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  if (slug.startsWith("github-")) {
    const repoName = slug.replace("github-", "");
    const repo = await getGitHubRepoDetail(repoName);
    if (!repo) return { title: "專案 | DCParty" };
    const title = `${repo.title} | DCParty 開源專案`;
    return {
      title,
      description: repo.description || `${repo.language} · ${repo.title}`,
      alternates: { canonical: `/works/${slug}` },
      openGraph: {
        title,
        description: repo.description,
        url: baseUrl ? `${baseUrl}/works/${slug}` : undefined,
        images: [repo.image],
      },
    };
  }

  const work = await getWorkBySlug(slug);
  if (!work) return { title: "案例 | DCParty" };
  const title = `${work.title} | DCParty 案例分析`;
  const desc =
    work.challenge || work.solution || work.result
      ? [work.challenge, work.solution, work.result].filter(Boolean).join(" ").slice(0, 160) + "…"
      : `${work.category} · ${work.title}`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/works/${slug}` },
    openGraph: {
      title,
      description: desc,
      url: baseUrl ? `${baseUrl}/works/${slug}` : undefined,
      ...(work.image && { images: [work.image] }),
    },
  };
}

export default async function WorkCasePage({ params }: Props) {
  const { slug } = await params;

  // ── GitHub 路徑 ──────────────────────────────────────────────────
  if (slug.startsWith("github-")) {
    const repoName = slug.replace("github-", "");
    const repo = await getGitHubRepoDetail(repoName);
    if (!repo) notFound();

    return (
      <div className="min-h-screen bg-[#F5F0E8] dark:bg-[#0A0A0A] text-stone-900 dark:text-white">
        <header className="border-b border-stone-200 dark:border-neutral-800/80 bg-[#F5F0E8]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href="/#work"
              className="inline-flex items-center gap-2 text-stone-400 dark:text-neutral-400 hover:text-[#E23D28] transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              返回精選案例
            </Link>
          </div>
        </header>

        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mb-8">
            <span className="text-xs font-bold text-[#E23D28] uppercase tracking-widest">
              {repo.language || "開源"}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight mt-2">
              {repo.title}
            </h1>
          </div>

          {/* OG Image */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-stone-200 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 mb-12">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${repo.image})` }}
            />
          </div>

          {/* Description */}
          {repo.description && (
            <section className="mb-10">
              <p className="text-stone-600 dark:text-neutral-300 font-light leading-relaxed text-lg">
                {repo.description}
              </p>
            </section>
          )}

          {/* Stars + Topics */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <span className="inline-flex items-center gap-1.5 text-stone-500 dark:text-neutral-400 text-sm font-medium">
              <Star className="w-4 h-4 text-amber-400" />
              {repo.stars.toLocaleString()} stars
            </span>
            {repo.topics.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 bg-stone-100 dark:bg-neutral-800 text-stone-600 dark:text-neutral-300 text-xs font-medium px-3 py-1 rounded-full"
              >
                <Tag className="w-3 h-3" />
                {t}
              </span>
            ))}
          </div>

          {/* README excerpt */}
          {repo.readmeExcerpt && (
            <section className="mb-12">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">README</h2>
              <pre className="bg-stone-100 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-6 text-sm text-stone-600 dark:text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed overflow-auto">
                {repo.readmeExcerpt}
              </pre>
            </section>
          )}

          {/* CTA */}
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#E23D28] hover:bg-[#c93623] text-white font-bold px-6 py-3 rounded-full transition-colors shadow-lg shadow-[#E23D28]/25"
          >
            在 GitHub 上查看
            <ExternalLink className="w-4 h-4" />
          </a>
        </article>
      </div>
    );
  }

  // ── Notion 路徑 ──────────────────────────────────────────────────
  const work = await getWorkBySlug(slug);
  if (!work) notFound();

  const hasStory = !!(work.challenge || work.solution || work.result);

  return (
    <div className="min-h-screen bg-[#F5F0E8] dark:bg-[#0A0A0A] text-stone-900 dark:text-white">
      <header className="border-b border-stone-200 dark:border-neutral-800/80 bg-[#F5F0E8]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 text-stone-400 dark:text-neutral-400 hover:text-[#E23D28] transition-colors text-sm font-medium"
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
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight mt-2">
            {work.title}
          </h1>
        </div>

        {work.image && (
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-stone-200 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 mb-12">
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
                <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-white mb-4">
                  <Target className="w-5 h-5 text-[#E23D28]" />
                  客戶痛點 (Challenge)
                </h2>
                <p className="text-stone-600 dark:text-neutral-300 font-light leading-relaxed whitespace-pre-line">
                  {work.challenge}
                </p>
              </section>
            )}
            {work.solution && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-white mb-4">
                  <Lightbulb className="w-5 h-5 text-[#E23D28]" />
                  創意解法 (Solution)
                </h2>
                <p className="text-stone-600 dark:text-neutral-300 font-light leading-relaxed whitespace-pre-line">
                  {work.solution}
                </p>
              </section>
            )}
            {work.result && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-white mb-4">
                  <TrendingUp className="w-5 h-5 text-[#E23D28]" />
                  最終成效 (Result)
                </h2>
                <p className="text-stone-600 dark:text-neutral-300 font-light leading-relaxed whitespace-pre-line">
                  {work.result}
                </p>
              </section>
            )}
          </div>
        )}

        {!hasStory && (
          <p className="text-stone-400 dark:text-neutral-500 font-light mb-12">
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
