"use client";
import Image from "next/image";

export function DreamCatcherLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/dc-logo.png"
      alt="Dream Catcher Films"
      width={180}
      height={72}
      className={`h-24 md:h-32 w-auto object-contain transition-all duration-700 ${className}`}
      priority
    />
  );
}
