"use client";

import { useEffect, useRef, useState } from "react";

type CursorLabel = "PLAY" | "VIEW" | null;

export function CustomCursor() {
  // 只用一次 state 判斷是否為 pointer 裝置（touch 設備不渲染）
  const [isPointer, setIsPointer] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const pointerRef = useRef({ x: -200, y: -200 });
  const renderPosRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number | null>(null);
  // 快取 magnetic 元素，避免每 frame 查 DOM
  const magnetElsRef = useRef<HTMLElement[]>([]);
  // 追蹤前一狀態，只在改變時才操作 DOM
  const prevStateRef = useRef<{ label: CursorLabel; isMagnet: boolean; scale: number }>({
    label: null, isMagnet: false, scale: 1,
  });

  useEffect(() => {
    const isPointerFine = window.matchMedia("(pointer: fine)").matches;
    if (!isPointerFine) return;
    setIsPointer(true);
    document.body.classList.add("cursor-none");

    // 快取 magnetic 元素，用 MutationObserver 在 DOM 改變時更新
    const refreshMagnets = () => {
      magnetElsRef.current = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    };
    refreshMagnets();
    const mo = new MutationObserver(refreshMagnets);
    mo.observe(document.body, { childList: true, subtree: true });

    const handleMove = (e: MouseEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const tick = () => {
      const { x, y } = pointerRef.current;
      let targetX = x, targetY = y;
      let magnet = false, scale = 1;
      let label: CursorLabel = null;

      // Magnet 吸附計算（用快取陣列，不查 DOM）
      let best: { d: number; cx: number; cy: number } | null = null;
      for (const el of magnetElsRef.current) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const d = Math.hypot(x - cx, y - cy);
        const radius = Math.max(90, Math.min(160, rect.width));
        if (d <= radius && (!best || d < best.d)) best = { d, cx, cy };
      }
      if (best) {
        magnet = true;
        const radius = 120;
        const t = Math.max(0, Math.min(1, 1 - best.d / radius));
        targetX = best.cx;
        targetY = best.cy;
        scale = 1 + t * 2.2;
      }

      // data-cursor label
      const el = document.elementFromPoint(x, y);
      const cursorEl = el?.closest("[data-cursor]");
      const v = cursorEl?.getAttribute("data-cursor") as CursorLabel | null;
      label = v === "PLAY" || v === "VIEW" ? v : null;

      // lerp：0.92 = 幾乎即時跟手，僅保留極短緩動讓視覺不硬
      const rp = renderPosRef.current;
      const lerp = magnet ? 0.32 : 0.92;
      rp.x += (targetX - rp.x) * lerp;
      rp.y += (targetY - rp.y) * lerp;

      // 直接操作 DOM style，完全繞過 React re-render
      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${rp.x}px, ${rp.y}px)`;
      }

      // 只在狀態改變時才更新 dot 樣式（減少不必要的 DOM 寫入）
      const prev = prevStateRef.current;
      const scaleDiff = Math.abs(scale - prev.scale) > 0.01;
      if (label !== prev.label || magnet !== prev.isMagnet || scaleDiff) {
        prevStateRef.current = { label, isMagnet: magnet, scale };
        const dot = dotRef.current;
        if (dot) {
          const s = dot.style;
          s.width = label ? "72px" : "10px";
          s.height = label ? "72px" : "10px";
          s.opacity = label ? "1" : "0.85";
          s.transform = `translate(-50%, -50%) scale(${label ? 1 : scale})`;
          s.borderColor = label
            ? "#E23D28"
            : magnet
            ? "rgba(255,255,255,0.4)"
            : "rgba(255,255,255,0.3)";
          s.backgroundColor = label ? "#E23D28" : "rgba(255,255,255,0.1)";
        }
        // span label 文字
        if (spanRef.current) {
          spanRef.current.textContent = label ?? "";
          spanRef.current.style.display = label ? "" : "none";
        }
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      mo.disconnect();
      document.body.classList.remove("cursor-none");
    };
  }, []);

  if (!isPointer) return null;

  return (
    <div
      ref={outerRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{ transform: "translate(-200px, -200px)", willChange: "transform" }}
      aria-hidden
    >
      <div
        ref={dotRef}
        className="flex items-center justify-center rounded-full border-2 text-white shadow-lg shadow-[#E23D28]/40 transition-[width,height,background-color,border-color,opacity] duration-150 ease-out"
        style={{
          width: 10,
          height: 10,
          opacity: 0.85,
          transform: "translate(-50%, -50%) scale(1)",
          borderColor: "rgba(255,255,255,0.3)",
          backgroundColor: "rgba(255,255,255,0.1)",
        }}
      >
        <span
          ref={spanRef}
          className="text-xs font-bold tracking-[0.2em]"
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
