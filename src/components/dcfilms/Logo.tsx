"use client";
import Image from "next/image";

export function DreamCatcherLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/dc-logo.png"
      alt="Dream Catcher Films"
      width={180}
      height={72}
      className={`h-20 md:h-24 w-auto object-contain transition-all duration-700 ${className}`}
      priority
    />
  );
}
