import { ImageResponse } from "next/og";
import { getBlogPostById } from "@/lib/notion";

export const alt = "DCParty 部落格";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  const post = await getBlogPostById(id);
  const title = post?.title ?? "部落格文章";
  const category = post?.category ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0A0A0A 0%, #171717 100%)",
          padding: 48,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
            fontSize: 18,
            color: "#E23D28",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 32, height: 2, backgroundColor: "#E23D28" }} />
          {category || "DCParty 部落格"}
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            color: "white",
            fontSize: title.length > 40 ? 42 : 56,
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 24,
            fontSize: 20,
            color: "#737373",
          }}
        >
          DCParty 數位創意派
        </div>
      </div>
    ),
    { ...size }
  );
}
