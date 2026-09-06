export type VideoProvider = "youtube" | "vimeo";

export interface ParsedVideo {
  provider: VideoProvider;
  id: string;
  /** 點擊播放後載入的 embed 網址 */
  embedUrl: string;
  /** 觀看頁網址，供 VideoObject schema 使用 */
  watchUrl: string;
  /** 平台縮圖；Vimeo 無法從 ID 推得，回空字串改用封面圖 */
  thumbnailUrl: string;
}

/**
 * 解析 YouTube 或 Vimeo 網址。兩種都支援，讓作品可以逐筆搬遷不斷線。
 */
export function parseVideoUrl(raw: string): ParsedVideo | null {
  if (!raw) return null;
  const url = raw.trim();

  const yt =
    url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
    url.match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
    url.match(/youtube\.com\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
  if (yt) {
    const id = yt[1];
    return {
      provider: "youtube",
      id,
      // nocookie：使用者按播放前不種追蹤 cookie
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    };
  }

  const vimeo =
    url.match(/vimeo\.com\/(?:.*\/)?(\d+)/) ||
    url.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (vimeo) {
    const id = vimeo[1];
    return {
      provider: "vimeo",
      id,
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1&title=0&byline=0&portrait=0&color=E23D28`,
      watchUrl: `https://vimeo.com/${id}`,
      thumbnailUrl: "",
    };
  }
  return null;
}
