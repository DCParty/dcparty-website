"use client";
import Image from "next/image";

export function DreamCatcherLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/dc-logo.png"
      alt="Dream Catcher Films"
      width={180}
      height={72}
      className={`h-16 md:h-20 w-auto object-contain invert dark:invert-0 ${className}`}
      priority
    />
  );
}
