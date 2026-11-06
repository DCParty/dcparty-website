import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服務項目",
  description:
    "DCParty 訂閱制數位服務：網頁設計與開發、軟體／App、UI/UX、品牌視覺設計、音樂製作。一次一項需求，做完換下一個。",
};

export default function ServicesLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
