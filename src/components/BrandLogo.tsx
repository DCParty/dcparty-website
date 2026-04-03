'use client';

import React from 'react';
import { Clapperboard } from 'lucide-react';

interface Props {
  theme?: 'dark' | 'light';
}

const BrandLogo = ({ theme = 'dark' }: Props) => {
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2 select-none">
      <div className={`flex items-center justify-center w-8 h-8 rounded border-2 ${isDark ? 'border-white' : 'border-slate-900'} shrink-0`}>
        <Clapperboard
          className={`w-4 h-4 ${isDark ? 'text-white' : 'text-slate-900'}`}
          strokeWidth={2.5}
        />
      </div>
      <div className={`font-black text-xl tracking-tight hidden sm:block ${isDark ? 'text-white' : 'text-slate-900'}`}>
        AdScript<span className="font-light">.AI</span>
      </div>
    </div>
  );
};

export default BrandLogo;
