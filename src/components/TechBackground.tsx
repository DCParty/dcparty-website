"use client";

import { useMemo } from "react";

const DIGITS = "010011010110100101100101";
const PARTICLE_COUNT = 28;

function useParticles() {
  return useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: `${(i * 37 + 13) % 100}%`,
      top: `${(i * 23 + 7) % 100}%`,
      size: 2 + (i % 3),
      delay: `${(i * 0.7) % 5}s`,
      duration: 8 + (i % 6),
    }));
  }, []);
}

function useDigitColumns() {
  return useMemo(() => {
    const rows = 40;
    const cols = 8;
    return Array.from({ length: cols }, (_, colIndex) => {
      const content = Array.from({ length: rows }, (_, rowIndex) =>
        DIGITS[(colIndex * 31 + rowIndex * 7) % DIGITS.length]
      ).join("");
      return { id: colIndex, left: `${8 + colIndex * 11}%`, content: content + content };
    });
  }, []);
}

export function TechBackground() {
  const particles = useParticles();
  const digitColumns = useDigitColumns();

  return (
    <>
      {/* 浮動粒子 */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[#E23D28] opacity-[0.12]"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animation: `float ${p.duration}s ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* 數字雨 */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden font-mono text-[10px] leading-[1.6] opacity-[0.07] text-white select-none" aria-hidden>
        {digitColumns.map((col) => (
          <div
            key={col.id}
            className="absolute top-0 w-4 overflow-hidden"
            style={{ left: col.left, height: "100%" }}
          >
            <div
              className="whitespace-pre tracking-widest"
              style={{
                animation: "digit-rain 28s linear infinite",
                animationDelay: `${col.id * 2.8}s`,
              }}
            >
              {col.content.split("").join("\n")}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

