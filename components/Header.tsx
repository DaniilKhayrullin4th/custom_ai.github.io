import React from 'react';
import { Gamepad2, Mic2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-brand-dark/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Gamepad2 className="w-8 h-8 text-brand-neon" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-hot rounded-full animate-pulse"></div>
          </div>
          <h1 className="font-display font-bold text-2xl tracking-wider text-white">
            CASTER<span className="text-brand-neon">AI</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
          <Mic2 className="w-4 h-4 text-brand-hot" />
          <span className="text-xs font-mono text-gray-400 uppercase">Live Studio</span>
        </div>
      </div>
    </header>
  );
};