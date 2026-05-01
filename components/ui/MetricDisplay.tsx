import React from 'react';

interface MetricDisplayProps {
  value: string | number;
  label: string;
  unit?: string;
  type?: 'human' | 'ai';
  className?: string;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  value,
  label,
  unit,
  type = 'human',
  className = '',
}) => {
  const colorClass = type === 'human' ? 'text-human text-glow-human' : 'text-ai text-glow-ai';
  
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-widest opacity-50">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className={`text-5xl font-black tracking-tighter ${colorClass}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xl font-medium opacity-30">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};
