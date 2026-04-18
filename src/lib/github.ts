import type { WorkItem } from "@/components/HomeClient";

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  html_url: string;
  fork: boolean;
}

export interface GitHubRepoDetail {
  title: string;
  description: string;
  language: string;
  stars: number;
  topics: string[];
  url: string;
  readmeExcerpt: string;
  image: string;
}

function authHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** 取得 DCParty org 的公開 repos，映射為 WorkItem[] */
export async function getDCPartyGitHubRepos(): Promise<WorkItem[]> {
  try {
    const res = await fetch(
      "https://api.github.com/orgs/DCParty/repos?sort=updated&per_page=6&type=public",
      {
        headers: authHeaders(),
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const repos: GitHubRepo[] = await res.json();
    return repos
      .filter((r) => !r.fork)
      .map((r) => ({
        id: `github-${r.id}`,
        title: r.name,
        slug: `github-${r.name}`,
        category: r.language || "開源",
        image: `https://opengraph.githubassets.com/1/DCParty/${r.name}`,
        description: r.description || undefined,
      }));
  } catch {
    return [];
  }
}

/** 取得單一 GitHub repo 詳細資訊（用於 /works/github-{name} 詳細頁） */
export async function getGitHubRepoDetail(
  repoName: string
): Promise<GitHubRepoDetail | null> {
  try {
    const headers = authHeaders();
    const [repoRes, readmeRes] = await Promise.all([
      fetch(`https://api.github.com/repos/DCParty/${repoName}`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/repos/DCParty/${repoName}/readme`, {
        headers,
        next: { revalidate: 3600 },
      }),
    ]);
    if (!repoRes.ok) return null;
    const repo: GitHubRepo & { topics: string[] } = await repoRes.json();

    let readmeExcerpt = "";
    if (readmeRes.ok) {
      const data = await readmeRes.json();
      const decoded = Buffer.from(data.content, "base64").toString("utf-8");
      readmeExcerpt = decoded.replace(/#+\s/g, "").slice(0, 800);
    }

    return {
      title: repo.name,
      description: repo.description || "",
      language: repo.language || "",
      stars: repo.stargazers_count,
      topics: repo.topics || [],
      url: repo.html_url,
      readmeExcerpt,
      image: `https://opengraph.githubassets.com/1/DCParty/${repo.name}`,
    };
  } catch {
    return null;
  }
}
