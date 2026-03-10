"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CursorLabel = "PLAY" | "VIEW" | null;

export function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [label, setLabel] = useState<CursorLabel>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isMagnet, setIsMagnet] = useState(false);
  const [magnetScale, setMagnetScale] = useState(1);

  const pointerRef = useRef({ x: 0, y: 0 });
  const renderPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const magnetQuery = useMemo(() => "[data-magnetic]", []);

  useEffect(() => {
    const isPointerFine = window.matchMedia("(pointer: fine)").matches;
    setIsPointer(isPointerFine);
    if (!isPointerFine) return;

    document.body.classList.add("cursor-none");

    const handleMove = (e: MouseEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cursorEl = el?.closest("[data-cursor]");
      const value = cursorEl?.getAttribute("data-cursor") as CursorLabel | null;
      setLabel(value === "PLAY" || value === "VIEW" ? value : null);
    };

    const tick = () => {
      const { x, y } = pointerRef.current;
      let targetX = x;
      let targetY = y;
      let magnet = false;
      let scale = 1;

      const magnets = Array.from(document.querySelectorAll<HTMLElement>(magnetQuery));
      let best: { el: HTMLElement; d: number; cx: number; cy: number } | null = null;
      for (const el of magnets) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const d = Math.hypot(dx, dy);
        const radius = Math.max(90, Math.min(160, rect.width));
        if (d <= radius && (!best || d < best.d)) best = { el, d, cx, cy };
      }
      if (best) {
        magnet = true;
        const rect = best.el.getBoundingClientRect();
        const radius = Math.max(90, Math.min(160, rect.width));
        const t = Math.max(0, Math.min(1, 1 - best.d / radius));
        targetX = best.cx;
        targetY = best.cy;
        scale = 1 + t * 2.2;
      }

      const rp = renderPosRef.current;
      const lerp = magnet ? 0.22 : 0.16;
      rp.x += (targetX - rp.x) * lerp;
      rp.y += (targetY - rp.y) * lerp;
      renderPosRef.current = rp;

      setPos({ x: rp.x, y: rp.y });
      setIsMagnet(magnet);
      setMagnetScale(scale);

      rafRef.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      document.body.classList.remove("cursor-none");
    };
  }, []);

  if (!isPointer) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-9999"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      aria-hidden
    >
      <div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-white shadow-lg shadow-[#E23D28]/40 transition-all duration-200 ease-out ${
          label ? "border-[#E23D28] bg-[#E23D28]" : isMagnet ? "border-white/40 bg-white/10" : "border-white/30 bg-white/10"
        }`}
        style={{
          width: label ? 72 : 10,
          height: label ? 72 : 10,
          opacity: label ? 1 : 0.85,
          transform: `translate(-50%, -50%) scale(${label ? 1 : magnetScale})`,
        }}
      >
        {label && (
          <span className="text-xs font-bold tracking-[0.2em]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
