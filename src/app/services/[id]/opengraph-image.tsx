import { ImageResponse } from "next/og";
import { getServiceById } from "@/lib/notion";

export const alt = "DCParty 服務";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  const service = await getServiceById(id);
  const title = service?.title ?? "服務介紹";
  const tag = service?.tag ?? "DCParty 服務";

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
          {tag}
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            color: "white",
            fontSize: title.length > 30 ? 44 : 56,
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
