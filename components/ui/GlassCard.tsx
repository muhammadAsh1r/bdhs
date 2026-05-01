import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'human' | 'ai' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  glow = 'none' 
}) => {
  const glowClass = glow === 'human' ? 'glow-human' : glow === 'ai' ? 'glow-ai' : '';
  
  return (
    <div className={`glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${glowClass} ${className}`}>
      {children}
    </div>
  );
};
