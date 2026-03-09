import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服務項目",
  description:
    "DCParty 提供的廣告影音、視覺設計、配樂音效與網頁／軟體開發服務。從企劃到交付的完整數位解決方案。",
};

export default function ServicesLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
