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

/** 秒數 → ISO 8601 時長（schema.org 要求格式，例：PT1M42S）*/
function toISODuration(sec: number): string {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return "PT" + (h ? `${h}H` : "") + (m ? `${m}M` : "") + (s || (!h && !m) ? `${s}S` : "");
}

export interface VideoMeta {
  /** ISO 8601 日期，VideoObject 必填 */
  uploadDate?: string;
  /** ISO 8601 時長 */
  duration?: string;
  /** 平台縮圖 */
  thumbnailUrl?: string;
}

/**
 * 取得影片的上傳日期與時長，供 VideoObject 結構化資料使用。
 *
 * Vimeo 的 oEmbed 端點免金鑰即可取得 upload_date 與 duration。
 * YouTube 的 oEmbed 不含這兩項（需 Data API 金鑰），故回傳空值，
 * 由呼叫端以作品年份或建檔時間遞補。
 *
 * 結果快取一天，避免每次 ISR 重新產生頁面都打外部 API。
 */
export async function getVideoMeta(video: ParsedVideo): Promise<VideoMeta> {
  if (video.provider !== "vimeo") return {};
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${video.id}`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return {};
    const j = await res.json();
    return {
      // Vimeo 回 "2018-11-27 03:15:46"，轉成 ISO 8601
      uploadDate: j.upload_date ? j.upload_date.replace(" ", "T") + "Z" : undefined,
      duration: typeof j.duration === "number" ? toISODuration(j.duration) : undefined,
      thumbnailUrl: j.thumbnail_url || undefined,
    };
  } catch {
    return {};   // 外部服務失效不得中斷建置
  }
}
