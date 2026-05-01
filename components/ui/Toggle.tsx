import React from 'react';

interface ToggleProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  labelLeft: string;
  labelRight: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  enabled,
  setEnabled,
  labelLeft,
  labelRight,
}) => {
  return (
    <div className="flex items-center gap-4 bg-black/40 p-1 rounded-2xl border border-white/10 w-fit">
      <button
        onClick={() => setEnabled(false)}
        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
          !enabled 
          ? 'bg-human text-black shadow-[0_0_15px_rgba(0,212,255,0.5)]' 
          : 'opacity-40 hover:opacity-70'
        }`}
      >
        {labelLeft}
      </button>
      <button
        onClick={() => setEnabled(true)}
        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
          enabled 
          ? 'bg-ai text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]' 
          : 'opacity-40 hover:opacity-70'
        }`}
      >
        {labelRight}
      </button>
    </div>
  );
};
