"use client";
import Image from "next/image";

export function DreamCatcherLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/dc-logo.png"
      alt="Dream Catcher Films"
      width={180}
      height={72}
      className={`h-10 md:h-12 w-auto object-contain
        dark-logo
        ${className}`}
      priority
    />
  );
}
