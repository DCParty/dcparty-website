import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* 背景紋理線條 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            display: "flex",
          }}
        />

        {/* 上方：品牌名 */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "4px",
              height: "32px",
              backgroundColor: "#E23D28",
              display: "flex",
            }}
          />
          <span
            style={{
              fontSize: "18px",
              letterSpacing: "0.4em",
              color: "#666666",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            DREAM CATCHER FILMS
          </span>
        </div>

        {/* 中間：主標題 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "72px",
              fontStyle: "italic",
              color: "#ffffff",
              lineHeight: 1.1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>光影流轉</span>
            <span style={{ color: "#aaaaaa", fontWeight: 300 }}>成就經典</span>
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#555555",
              letterSpacing: "0.15em",
              display: "flex",
            }}
          >
            台北企業形象影片 · 品牌廣告 · 動畫特效製作
          </div>
        </div>

        {/* 下方：網址 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              fontSize: "16px",
              letterSpacing: "0.2em",
              color: "#444444",
              display: "flex",
            }}
          >
            dcfilms.tv
          </span>
          <div
            style={{
              fontSize: "14px",
              color: "#E23D28",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            DC FILMS · TAIPEI
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
