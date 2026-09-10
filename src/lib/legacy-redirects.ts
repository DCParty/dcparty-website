/**
 * 舊 WordPress 作品網址對應表
 *
 * 舊站 /portfolio/{slug} 與新站 /projects/{slug} 的 slug 並非全部一致：
 * 部分作品在 Notion 改用了更完整的命名，另有一批作品未移轉。
 * 若僅以 /portfolio/:slug → /projects/:slug 概括，未對應者會形成
 * 「301 導向 404」——比直接 404 更糟，Search Console 亦會同時計入
 * 「頁面會重新導向」與「找不到網頁」。
 *
 * 此表由 4/23 的 WordPress 資料庫備份比對產生，須置於概括規則之前。
 */
export const legacyProjectRedirects: { source: string; destination: string; permanent: true }[] = [
  // ── slug 改名，導向對應作品 ──
  { source: "/portfolio/queen", destination: "/projects/queenwei-puppet-mv", permanent: true },
  { source: "/portfolio/electricity", destination: "/projects/new-taipei-electricity-festival", permanent: true },
  { source: "/portfolio/pusan", destination: "/projects/pusan-village-documentary", permanent: true },
  { source: "/portfolio/dyaco", destination: "/projects/dyaco-brand-film", permanent: true },
  { source: "/portfolio/rc-release", destination: "/projects/rc-release-visual", permanent: true },
  { source: "/portfolio/paul-smith", destination: "/projects/paul-smith-visual", permanent: true },
  { source: "/portfolio/3dmaxtrac", destination: "/projects/3dmaxtrac-car-mat", permanent: true },
  { source: "/portfolio/omron", destination: "/projects/omron-visual-planning", permanent: true },
  { source: "/portfolio/amogoodfood", destination: "/projects/amogoodfood-pineapple-cake", permanent: true },
  { source: "/portfolio/dynamic", destination: "/projects/dynamic-picosecond-visual", permanent: true },
  { source: "/portfolio/milano", destination: "/projects/milano-visual-planning", permanent: true },
  { source: "/portfolio/citiesocialold", destination: "/projects/citiesocialatakama", permanent: true },

  // ── 未移轉至 Notion，導向作品集列表 ──
  { source: "/portfolio/%e4%bc%81%e6%a5%ad%e5%bd%a2%e8%b1%a1-%e7%b2%be%e9%81%b8", destination: "/projects", permanent: true },
  { source: "/portfolio/crowdfunding", destination: "/projects", permanent: true },
  { source: "/portfolio/mv-%e7%b2%be%e9%81%b8-2", destination: "/projects", permanent: true },
  { source: "/portfolio/%e5%8b%95%e7%95%ab%e8%a8%ad%e8%a8%88-%e7%b2%be%e9%81%b8", destination: "/projects", permanent: true },
  { source: "/portfolio/solar_prize", destination: "/projects", permanent: true },
  { source: "/portfolio/advertising", destination: "/projects", permanent: true },
  { source: "/portfolio/mode_fashion", destination: "/projects", permanent: true },
  { source: "/portfolio/moncoeur", destination: "/projects", permanent: true },
  { source: "/portfolio/kai_deluxe", destination: "/projects", permanent: true },
  { source: "/portfolio/hometown", destination: "/projects", permanent: true },
  { source: "/portfolio/dc%e5%ae%b6%e5%ba%ad%e7%b3%bb%e5%88%97dear-dad", destination: "/projects", permanent: true },
  { source: "/portfolio/error_design", destination: "/projects", permanent: true },
  { source: "/portfolio/poindus", destination: "/projects", permanent: true },
  { source: "/portfolio/achb", destination: "/projects", permanent: true },
  { source: "/portfolio/urban-trance", destination: "/projects", permanent: true },
  { source: "/portfolio/siruba", destination: "/projects", permanent: true },
  { source: "/portfolio/urban-trance-%e5%9f%8e%e5%b8%82%e8%bf%b7%e8%b5%b0", destination: "/projects", permanent: true },
  { source: "/portfolio/error-design%e5%bd%a2%e8%b1%a1%e5%bd%b1%e7%89%87", destination: "/projects", permanent: true },
  { source: "/portfolio/%e8%b3%80%e6%9c%a8%e5%a0%82%e8%8c%b6%e9%85%92%e7%a6%ae%e7%89%a9%e5%bf%ab%e9%81%9e%ef%bc%88%e6%9c%aa%e5%ae%8c%ef%bc%89", destination: "/projects", permanent: true },
  { source: "/portfolio/achb%e4%bc%81%e6%a5%ad%e5%bd%a2%e8%b1%a1%e5%bd%b1%e7%89%87", destination: "/projects", permanent: true },
  { source: "/portfolio/%e5%bf%83%e4%b9%8b%e8%8a%b3%e5%ba%ad%e5%85%ac%e5%9c%92%e7%89%8c%e6%89%8b%e5%b7%a5%e7%b4%94%e9%87%80%e9%86%ac%e6%b2%b9", destination: "/projects", permanent: true },
  { source: "/portfolio/%e5%a1%ab%e5%85%a5%e5%b0%88%e6%a1%88%e5%90%8d%e7%a8%b1%ef%bc%bf%ef%bc%bf", destination: "/projects", permanent: true },
  { source: "/portfolio/%e5%a1%ab%e5%85%a5%e8%8b%b1%e6%96%87%e5%b0%88%e6%a1%88%e5%90%8d%e7%a8%b1%ef%bc%bf", destination: "/projects", permanent: true },
  { source: "/portfolio/%e5%a1%ab%e5%85%a5%e8%8b%b1%e6%96%87%e5%b0%88%e6%a1%88%e5%90%8d%e7%a8%b1", destination: "/projects", permanent: true },
  { source: "/portfolio/%e8%8b%b1%e6%96%87%e5%b0%88%e6%a1%88%e5%90%8d", destination: "/projects", permanent: true },
  { source: "/portfolio/%e5%b9%b3%e9%9d%a2%e7%85%a7%e7%89%88%e5%9e%8b2", destination: "/projects", permanent: true },
  { source: "/portfolio/%e5%b9%b3%e9%9d%a2%e7%85%a7%e7%89%88%e5%9e%8b3", destination: "/projects", permanent: true },
  { source: "/portfolio/tientien", destination: "/projects", permanent: true },
  { source: "/portfolio/foodsafety", destination: "/projects", permanent: true },
  { source: "/portfolio/shellentang", destination: "/projects", permanent: true },
  { source: "/portfolio/loka-niren", destination: "/projects", permanent: true },
  { source: "/portfolio/viida", destination: "/projects", permanent: true },
  { source: "/portfolio/near_branddesign", destination: "/projects", permanent: true },
  { source: "/portfolio/tact_commercial", destination: "/projects", permanent: true },
  { source: "/portfolio/roche_commercial", destination: "/projects", permanent: true },
];
