"use client";
export function DreamCatcherLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 120" className={`h-10 md:h-12 text-white ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="45" cy="45" r="32" stroke="currentColor" strokeWidth="4" />
      <polygon points="45,16 51,36 71,45 51,54 45,74 39,54 19,45 39,36" fill="currentColor" />
      <polygon points="45,26 50,40 64,45 50,50 45,64 40,50 26,45 40,40" fill="currentColor" transform="rotate(45 45 45)" />
      <rect x="38" y="86" width="14" height="14" fill="currentColor" transform="rotate(45 45 93)" />
      <rect x="20" y="73" width="12" height="12" fill="currentColor" transform="rotate(45 26 79)" />
      <rect x="58" y="73" width="12" height="12" fill="currentColor" transform="rotate(45 64 79)" />
      <text x="95" y="40" fontFamily="sans-serif" fontSize="24" fontWeight="600" fill="currentColor" letterSpacing="5">DREAM</text>
      <text x="95" y="68" fontFamily="sans-serif" fontSize="24" fontWeight="600" fill="currentColor" letterSpacing="5">CATCHER</text>
      <text x="95" y="96" fontFamily="sans-serif" fontSize="24" fontWeight="600" fill="currentColor" letterSpacing="5">FILMS</text>
    </svg>
  );
}
