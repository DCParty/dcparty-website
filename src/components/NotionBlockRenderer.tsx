type RichTextItem = {
  plain_text: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
  };
};

type NotionBlock = {
  id: string;
  type: string;
  paragraph?: { rich_text?: RichTextItem[] };
  heading_1?: { rich_text?: RichTextItem[] };
  heading_2?: { rich_text?: RichTextItem[] };
  heading_3?: { rich_text?: RichTextItem[] };
  bulleted_list_item?: { rich_text?: RichTextItem[] };
  numbered_list_item?: { rich_text?: RichTextItem[] };
  to_do?: { rich_text?: RichTextItem[]; checked?: boolean };
  image?: { file?: { url?: string }; external?: { url?: string }; caption?: { plain_text?: string }[] };
  code?: { rich_text?: { plain_text: string }[]; language?: string };
  quote?: { rich_text?: RichTextItem[] };
  callout?: { rich_text?: RichTextItem[] };
  [key: string]: unknown;
};

function getRichText(block: NotionBlock): RichTextItem[] {
  const type = block.type;
  const content = block[type as keyof NotionBlock];
  if (!content || typeof content !== "object") return [];
  const rt = (content as { rich_text?: RichTextItem[] }).rich_text;
  return Array.isArray(rt) ? rt : [];
}

function renderRichText(items: RichTextItem[]) {
  return items.map((item, i) => {
    let el: React.ReactNode = item.plain_text;
    if (item.href) el = <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-[#E23D28] underline hover:no-underline">{el}</a>;
    if (item.annotations?.code) el = <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-sm font-mono">{el}</code>;
    if (item.annotations?.bold) el = <strong>{el}</strong>;
    if (item.annotations?.italic) el = <em>{el}</em>;
    if (item.annotations?.strikethrough) el = <s>{el}</s>;
    if (item.annotations?.underline) el = <u>{el}</u>;
    return <span key={i}>{el}</span>;
  });
}

export function NotionBlockRenderer({ blocks }: { blocks: NotionBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        if (block.type === "paragraph") {
          const text = getRichText(block);
          if (text.length === 0) return <div key={block.id} className="h-2" />;
          return (
            <p key={block.id} className="text-neutral-300 leading-relaxed">
              {renderRichText(text)}
            </p>
          );
        }
        if (block.type === "heading_1") {
          const text = getRichText(block);
          return (
            <h2 key={block.id} className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4 first:mt-0">
              {renderRichText(text)}
            </h2>
          );
        }
        if (block.type === "heading_2") {
          const text = getRichText(block);
          return (
            <h3 key={block.id} className="text-xl sm:text-2xl font-semibold text-white mt-8 mb-3">
              {renderRichText(text)}
            </h3>
          );
        }
        if (block.type === "heading_3") {
          const text = getRichText(block);
          return (
            <h4 key={block.id} className="text-lg font-semibold text-white mt-6 mb-2">
              {renderRichText(text)}
            </h4>
          );
        }
        if (block.type === "bulleted_list_item") {
          const text = getRichText(block);
          return (
            <ul key={block.id} className="list-disc list-inside my-3 space-y-1 text-neutral-300 leading-relaxed">
              <li>{renderRichText(text)}</li>
            </ul>
          );
        }
        if (block.type === "numbered_list_item") {
          const text = getRichText(block);
          return (
            <ol key={block.id} className="list-decimal list-inside my-3 space-y-1 text-neutral-300 leading-relaxed">
              <li>{renderRichText(text)}</li>
            </ol>
          );
        }
        if (block.type === "to_do") {
          const content = block.to_do;
          const text = content?.rich_text ?? [];
          const checked = content?.checked ?? false;
          return (
            <label key={block.id} className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" checked={checked} readOnly className="mt-1.5 rounded border-neutral-600 bg-neutral-800 text-[#E23D28]" />
              <span className={`text-neutral-300 leading-relaxed ${checked ? "line-through text-neutral-500" : ""}`}>
                {renderRichText(text)}
              </span>
            </label>
          );
        }
        if (block.type === "image") {
          const img = block.image;
          const src = img?.file?.url ?? img?.external?.url ?? "";
          const cap = img?.caption?.[0]?.plain_text;
          if (!src) return null;
          return (
            <figure key={block.id} className="my-8">
              <img src={src} alt={cap ?? ""} className="rounded-2xl w-full border border-neutral-800" />
              {cap && <figcaption className="mt-2 text-sm text-neutral-500 text-center">{cap}</figcaption>}
            </figure>
          );
        }
        if (block.type === "code") {
          const content = block.code;
          const text = content?.rich_text?.map((t) => t.plain_text).join("") ?? "";
          const lang = content?.language ?? "plain";
          return (
            <pre key={block.id} className="my-6 overflow-x-auto rounded-2xl bg-neutral-900 border border-neutral-800 p-4 sm:p-6 text-sm">
              <code data-language={lang} className="text-neutral-300 font-mono">
                {text}
              </code>
            </pre>
          );
        }
        if (block.type === "quote") {
          const text = getRichText(block);
          return (
            <blockquote key={block.id} className="border-l-4 border-[#E23D28] pl-6 py-2 my-6 text-neutral-400 italic">
              {renderRichText(text)}
            </blockquote>
          );
        }
        if (block.type === "divider") {
          return <hr key={block.id} className="border-neutral-800 my-8" />;
        }
        if (block.type === "callout") {
          const content = block.callout;
          const text = content?.rich_text ?? [];
          return (
            <div key={block.id} className="rounded-2xl border border-[#E23D28]/30 bg-[#E23D28]/5 p-6 my-6">
              <div className="text-neutral-200 leading-relaxed">{renderRichText(text)}</div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
