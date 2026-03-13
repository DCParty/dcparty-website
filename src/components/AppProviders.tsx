"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { ErrorBoundary } from "./ErrorBoundary";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (typeof window === "undefined") return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.2,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReducedMotion]);

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={prefersReducedMotion ? false : { opacity: 0, filter: "blur(6px)" }}
          animate={prefersReducedMotion ? {} : { opacity: 1, filter: "blur(0px)" }}
          exit={prefersReducedMotion ? {} : { opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.25, ease: "easeOut" as const }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

