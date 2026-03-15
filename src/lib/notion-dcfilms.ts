/**
 * DC Films — Notion data layer
 * Uses @notionhq/client v5 (dataSources API)
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
// v5 SDK helpers
// ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDataSourceId(notion: Client, databaseId: string): Promise<string | null> {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any)?.data_sources?.[0]?.id ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSchemaProps(notion: Client, dataSourceId: string): Promise<Record<string, any>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ds = await (notion as any).dataSources.retrieve({ data_source_id: dataSourceId });
  const raw = ds?.properties;
  return raw && typeof raw === "object" ? raw : {};
}

// Build nameToId map: { "human-readable name": "internal id" }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildNameToId(props: Record<string, any>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [id, prop] of Object.entries(props)) {
    if (prop?.name) map[prop.name] = id;
  }
  return map;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function queryDataSource(notion: Client, dataSourceId: string, filter?: any, sorts?: any[]): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await (notion as any).dataSources.query({
    data_source_id: dataSourceId,
    ...(filter && { filter }),
    ...(sorts && { sorts }),
    page_size: 100,
  });
  return res?.results ?? [];
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
    const dataSourceId = await getDataSourceId(notion, dbId);
    if (!dataSourceId) return [];
    const props = await getSchemaProps(notion, dataSourceId);
    const n2id = buildNameToId(props);

    const propPublished = n2id["published"] ?? n2id["Published"] ?? n2id["發布狀態"];
    if (!propPublished) return [];

    const results = await queryDataSource(
      notion,
      dataSourceId,
      { property: propPublished, checkbox: { equals: true } },
      n2id["order"] ? [{ property: n2id["order"], direction: "ascending" }] : []
    );

    const projects: DCProject[] = results.map((page) => {
      const p = page.properties;
      const titleProp = n2id["title"] ?? n2id["Title"] ?? n2id["作品名稱"];
      const title = titleProp ? titleText(p[titleProp]) : "Untitled";
      const slugProp = n2id["slug"] ?? n2id["Slug"];
      const cover = fileUrl(n2id["cover_image"] ? p[n2id["cover_image"]] : null);
      const og = fileUrl(n2id["og_image"] ? p[n2id["og_image"]] : null) || cover;

      return {
        id: page.id,
        title,
        slug: (slugProp ? rt(p[slugProp]) : "") || buildSlug(title, page.id),
        category: n2id["category"] ? multiSelect(p[n2id["category"]]) : [],
        client: n2id["client"] ? rt(p[n2id["client"]]) : "",
        coverImage: cover,
        vimeoUrl: n2id["vimeo_url"] ? (p[n2id["vimeo_url"]]?.url ?? "") : "",
        descriptionZh: n2id["description_zh"] ? rt(p[n2id["description_zh"]]) : "",
        descriptionEn: n2id["description_en"] ? rt(p[n2id["description_en"]]) : "",
        featured: n2id["featured"] ? (p[n2id["featured"]]?.checkbox === true) : false,
        year: n2id["year"] ? rt(p[n2id["year"]]) : "",
        order: n2id["order"] ? (p[n2id["order"]]?.number ?? 999) : 999,
        metaTitle: n2id["meta_title"] ? rt(p[n2id["meta_title"]]) : title,
        metaDescription: n2id["meta_description"] ? rt(p[n2id["meta_description"]]) : "",
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
  const dbId = process.env.NOTION_PROJECTS_DB_ID;
  if (!dbId) return null;
  const notion = makeClient();
  const n2m = new NotionToMarkdown({ notionClient: notion });

  try {
    // Find the project in the list first (works for both direct slug and id-prefix slug)
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
    const dataSourceId = await getDataSourceId(notion, dbId);
    if (!dataSourceId) return [];
    const props = await getSchemaProps(notion, dataSourceId);
    const n2id = buildNameToId(props);

    const propPublished = n2id["published"] ?? n2id["Published"] ?? n2id["發布狀態"];
    if (!propPublished) return [];

    const results = await queryDataSource(
      notion,
      dataSourceId,
      { property: propPublished, checkbox: { equals: true } },
      n2id["published_date"] ? [{ property: n2id["published_date"], direction: "descending" }] : [{ timestamp: "last_edited_time", direction: "descending" }]
    );

    const posts: DCBlogPost[] = results.map((page) => {
      const p = page.properties;
      const titleProp = n2id["title"] ?? n2id["Title"] ?? n2id["標題"];
      const title = titleProp ? titleText(p[titleProp]) : "Untitled";
      const slugProp = n2id["slug"] ?? n2id["Slug"];
      const cover = fileUrl(n2id["cover_image"] ? p[n2id["cover_image"]] : null);
      const og = fileUrl(n2id["og_image"] ? p[n2id["og_image"]] : null) || cover;

      return {
        id: page.id,
        title,
        slug: (slugProp ? rt(p[slugProp]) : "") || buildSlug(title, page.id),
        coverImage: cover,
        excerptZh: n2id["excerpt_zh"] ? rt(p[n2id["excerpt_zh"]]) : "",
        excerptEn: n2id["excerpt_en"] ? rt(p[n2id["excerpt_en"]]) : "",
        tags: n2id["tags"] ? multiSelect(p[n2id["tags"]]) : [],
        author: n2id["author"] ? rt(p[n2id["author"]]) || "DC Films" : "DC Films",
        publishedDate: n2id["published_date"] ? (p[n2id["published_date"]]?.date?.start ?? "") : "",
        metaTitle: n2id["meta_title"] ? rt(p[n2id["meta_title"]]) : title,
        metaDescription: n2id["meta_description"] ? rt(p[n2id["meta_description"]]) : "",
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
