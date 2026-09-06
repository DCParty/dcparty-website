"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { parseVideoUrl } from "@/lib/video";

interface Props {
  url: string;
  title: string;
  /** 封面圖；Vimeo 無平台縮圖時作為海報 */
  posterImage?: string;
}

/**
 * Facade 播放器：先只渲染海報＋播放鍵，點擊才掛載 iframe。
 * 讓 YouTube/Vimeo 播放器（約 1MB）不佔用首屏載入。
 */
export function VideoEmbed({ url, title, posterImage }: Props) {
  const [playing, setPlaying] = useState(false);
  const video = parseVideoUrl(url);
  if (!video) return null;

  const poster = posterImage || video.thumbnailUrl;

  return (
    <div className="mb-20">
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {playing ? (
          <iframe
            src={video.embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={title}
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 w-full h-full cursor-pointer"
            aria-label={`播放影片：${title}`}
          >
            {poster && (
              <Image
                src={poster}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 1024px"
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              />
            )}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#E23D28] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Play fill="currentColor" size={28} className="ml-1" />
              </div>
            </div>
          </button>
        )}
      </div>
      <p className="text-[9px] tracking-[0.3em] uppercase text-stone-300 dark:text-zinc-700 mt-4 text-right">
        © Dream Catcher Films
      </p>
    </div>
  );
}
