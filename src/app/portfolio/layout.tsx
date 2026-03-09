import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "精選作品集",
  description:
    "DCParty 數位創意派的代表性專案：廣告影音、品牌視覺、網頁與軟體開發、商業攝影等案例展示。",
};

export default function PortfolioLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
