"use client";

import { useState, useEffect } from "react";

type CursorLabel = "PLAY" | "VIEW" | null;

export function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [label, setLabel] = useState<CursorLabel>(null);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const isPointerFine = window.matchMedia("(pointer: fine)").matches;
    setIsPointer(isPointerFine);
    if (!isPointerFine) return;

    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cursorEl = el?.closest("[data-cursor]");
      const value = cursorEl?.getAttribute("data-cursor") as CursorLabel | null;
      setLabel(value === "PLAY" || value === "VIEW" ? value : null);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    if (!isPointer) return;
    if (label) document.body.classList.add("cursor-none");
    else document.body.classList.remove("cursor-none");
    return () => document.body.classList.remove("cursor-none");
  }, [label, isPointer]);

  if (!isPointer) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-9999"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      aria-hidden
    >
      <div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#E23D28] bg-[#E23D28] text-white shadow-lg shadow-[#E23D28]/40 transition-all duration-200 ease-out"
        style={{
          width: label ? 72 : 10,
          height: label ? 72 : 10,
          opacity: label ? 1 : 0.6,
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
