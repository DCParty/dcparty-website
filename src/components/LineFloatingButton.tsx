"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const LINE_URL = "https://line.me/ti/p/@936qaahz";

export function LineFloatingButton() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Trigger transition on next frame after visible
  const refCallback = useCallback(
    (node: HTMLAnchorElement | null) => {
      if (node && visible && !entered) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setEntered(true);
          });
        });
      }
    },
    [visible, entered]
  );

  if (!mounted || !visible) return null;

  return createPortal(
    <a
      ref={refCallback}
      href={LINE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="加入 LINE 官方帳號"
      data-magnetic
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 56,
        height: 56,
        borderRadius: "9999px",
        backgroundColor: "#06C755",
        boxShadow: "0 10px 15px -3px rgba(6,199,85,0.3)",
        textDecoration: "none",
        cursor: "pointer",
        // Transition-based entrance (no animation timeline needed)
        opacity: entered ? 1 : 0,
        transform: entered
          ? "translateY(0) scale(1)"
          : "translateY(20px) scale(0)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        width={28}
        height={28}
      >
        <path d="M12 2C6.48 2 2 5.83 2 10.45c0 4.15 3.67 7.63 8.63 8.28.34.07.79.22.91.51.1.26.07.67.03.93l-.15.88c-.04.26-.2 1.01.89.55.01 0 4.81-2.83 6.56-4.85C20.84 14.5 22 12.58 22 10.45 22 5.83 17.52 2 12 2zm-3.07 11.14H7.12a.53.53 0 01-.53-.53V8.24c0-.3.24-.53.53-.53.3 0 .53.24.53.53v3.84h1.28c.3 0 .53.24.53.53 0 .3-.24.53-.53.53zm1.79-.53a.53.53 0 01-1.06 0V8.24a.53.53 0 011.06 0v4.37zm4.01 0a.53.53 0 01-.37.5.53.53 0 01-.57-.15l-1.87-2.55v2.2a.53.53 0 01-1.06 0V8.24a.53.53 0 01.37-.5.53.53 0 01.57.15l1.87 2.55V8.24a.53.53 0 011.06 0v4.37zm3.15-2.78a.53.53 0 010 1.06h-1.28v.66h1.28a.53.53 0 010 1.06h-1.81a.53.53 0 01-.53-.53V8.24c0-.3.24-.53.53-.53h1.81a.53.53 0 010 1.06h-1.28v.66h1.28z" />
      </svg>
    </a>,
    document.body
  );
}
