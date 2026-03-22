/**
 * DC Films — Notion data layer
 * Uses @notionhq/client v2 (standard public databases API)
 */
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface DCProject {
  id: string;
  title: string;
  slug: string;
  category: string[];
  client: string;
  coverImage: string;
  vimeoUrl: string;
  descriptionZh: string;
  descriptionEn: string;
  featured: boolean;
  year: string;
  order: number;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

export interface DCBlogPost {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerptZh: string;
  excerptEn: string;
  tags: string[];
  author: string;
  publishedDate: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

// ─────────────────────────────────────────────
// Client factory
// ─────────────────────────────────────────────

function makeClient() {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is not set");
  return new Client({ auth: token });
}

// ─────────────────────────────────────────────
// Property readers
// ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rt(prop: any): string {
  if (!prop?.rich_text?.length) return "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prop.rich_text.map((t: any) => t.plain_text).join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function titleText(prop: any): string {
  if (!prop?.title?.length) return "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prop.title.map((t: any) => t.plain_text).join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fileUrl(prop: any): string {
  if (!prop) return "";
  if (prop.files?.length) {
    const f = prop.files[0];
    return f?.file?.url ?? f?.external?.url ?? "";
  }
  if (prop.url) return prop.url;
  return "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function multiSelect(prop: any): string[] {
  if (!prop?.multi_select?.length) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prop.multi_select.map((s: any) => s.name);
}

// Build URL-safe slug: title-kebab-XXXXXXXX (8-char id prefix)
function buildSlug(title: string, pageId: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 60);
  const idPart = pageId.replace(/-/g, "").slice(0, 8);
  return base ? `${base}-${idPart}` : idPart;
}

function extractIdPrefix(slug: string): string {
  const parts = slug.split("-");
  return parts[parts.length - 1] ?? "";
}

// ─────────────────────────────────────────────
// Projects DB
// ─────────────────────────────────────────────

let _projectsCache: DCProject[] | null = null;

export async function getPublishedProjects(): Promise<DCProject[]> {
  if (_projectsCache) return _projectsCache;
  const dbId = process.env.NOTION_PROJECTS_DB_ID;
  if (!dbId) return [];
  const notion = makeClient();

  try {
    const res = await notion.databases.query({
      database_id: dbId,
      filter: { property: "published", checkbox: { equals: true } },
      sorts: [{ property: "order", direction: "ascending" }],
      page_size: 100,
    });

    const projects: DCProject[] = res.results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((page: any) => page.properties)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((page: any) => {
        const p = page.properties;
        const title = titleText(p["title"]) || "Untitled";
        const cover = fileUrl(p["cover_image"]);
        const og = fileUrl(p["og_image"]) || cover;

        return {
          id: page.id,
          title,
          slug: rt(p["slug"]) || buildSlug(title, page.id),
          category: multiSelect(p["category"]),
          client: rt(p["client"]),
          coverImage: cover,
          vimeoUrl: p["vimeo_url"]?.url ?? "",
          descriptionZh: rt(p["description_zh"]),
          descriptionEn: rt(p["description_en"]),
          featured: p["featured"]?.checkbox === true,
          year: rt(p["year"]),
          order: p["order"]?.number ?? 999,
          metaTitle: rt(p["meta_title"]) || title,
          metaDescription: rt(p["meta_description"]),
          ogImage: og,
        };
      });

    _projectsCache = projects;
    return projects;
  } catch (err: unknown) {
    console.error("[DCFilms] getPublishedProjects error:", (err as Error).message);
    return [];
  }
}

export async function getFeaturedProjects(): Promise<DCProject[]> {
  const all = await getPublishedProjects();
  return all.filter((p) => p.featured).slice(0, 6);
}

export async function getProjectBySlug(slug: string): Promise<(DCProject & { markdown: string }) | null> {
  if (!process.env.NOTION_PROJECTS_DB_ID) return null;
  const notion = makeClient();
  const n2m = new NotionToMarkdown({ notionClient: notion });

  try {
    const all = await getPublishedProjects();
    const prefix = extractIdPrefix(slug);
    const match = all.find((p) => p.slug === slug || p.id.replace(/-/g, "").slice(0, 8) === prefix);
    if (!match) return null;

    const mdBlocks = await n2m.pageToMarkdown(match.id);
    const markdown = n2m.toMarkdownString(mdBlocks).parent;

    return { ...match, markdown };
  } catch (err: unknown) {
    console.error("[DCFilms] getProjectBySlug error:", (err as Error).message);
    return null;
  }
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const projects = await getPublishedProjects();
  return projects.map((p) => p.slug);
}

// ─────────────────────────────────────────────
// Blog DB
// ─────────────────────────────────────────────

let _blogCache: DCBlogPost[] | null = null;

export async function getPublishedBlogPosts(): Promise<DCBlogPost[]> {
  if (_blogCache) return _blogCache;
  const dbId = process.env.NOTION_BLOG_DB_ID;
  if (!dbId) return [];
  const notion = makeClient();

  try {
    const res = await notion.databases.query({
      database_id: dbId,
      filter: { property: "published", checkbox: { equals: true } },
      sorts: [{ property: "published_date", direction: "descending" }],
      page_size: 100,
    });

    const posts: DCBlogPost[] = res.results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((page: any) => page.properties)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((page: any) => {
        const p = page.properties;
        const title = titleText(p["title"]) || "Untitled";
        const cover = fileUrl(p["cover_image"]);
        const og = fileUrl(p["og_image"]) || cover;

        return {
          id: page.id,
          title,
          slug: rt(p["slug"]) || buildSlug(title, page.id),
          coverImage: cover,
          excerptZh: rt(p["excerpt_zh"]),
          excerptEn: rt(p["excerpt_en"]),
          tags: multiSelect(p["tags"]),
          author: rt(p["author"]) || "DC Films",
          publishedDate: p["published_date"]?.date?.start ?? "",
          metaTitle: rt(p["meta_title"]) || title,
          metaDescription: rt(p["meta_description"]),
          ogImage: og,
        };
      });

    _blogCache = posts;
    return posts;
  } catch (err: unknown) {
    console.error("[DCFilms] getPublishedBlogPosts error:", (err as Error).message);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<(DCBlogPost & { markdown: string }) | null> {
  const notion = makeClient();
  const n2m = new NotionToMarkdown({ notionClient: notion });

  try {
    const all = await getPublishedBlogPosts();
    const prefix = extractIdPrefix(slug);
    const match = all.find((p) => p.slug === slug || p.id.replace(/-/g, "").slice(0, 8) === prefix);
    if (!match) return null;

    const mdBlocks = await n2m.pageToMarkdown(match.id);
    const markdown = n2m.toMarkdownString(mdBlocks).parent;

    return { ...match, markdown };
  } catch (err: unknown) {
    console.error("[DCFilms] getBlogPostBySlug error:", (err as Error).message);
    return null;
  }
}

export async function getAllBlogSlugsForDCFilms(): Promise<string[]> {
  const posts = await getPublishedBlogPosts();
  return posts.map((p) => p.slug);
}
