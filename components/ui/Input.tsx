import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  glowType?: 'human' | 'ai';
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  glowType = 'human', 
  className = '', 
  ...props 
}) => {
  const focusClass = glowType === 'human' 
    ? 'focus:border-human focus:ring-human/20' 
    : 'focus:border-ai focus:ring-ai/20';

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-bold uppercase tracking-widest opacity-50 ml-1">
          {label}
        </label>
      )}
      <input
        className={`bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:ring-4 ${focusClass} ${className}`}
        {...props}
      />
    </div>
  );
};
