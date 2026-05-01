"use client";

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { MetricDisplay } from '@/components/ui/MetricDisplay';
import { Toggle } from '@/components/ui/Toggle';

export default function Home() {
  const [isWearableMode, setIsWearableMode] = useState(false);
  const [humanSweat, setHumanSweat] = useState(80);
  const [aiWater, setAiWater] = useState(200);
  const [sessionTime, setSessionTime] = useState(42);

  // Derive Hydration Gap
  const hydrationGap = aiWater - humanSweat;
  const isPositive = hydrationGap >= 0;

  // Simulate real-time data in Wearable Mode
  useEffect(() => {
    if (!isWearableMode) return;

    const interval = setInterval(() => {
      setHumanSweat(prev => Math.max(0, prev + (Math.random() * 4 - 2)));
      setAiWater(prev => Math.max(0, prev + (Math.random() * 6 - 2)));
      setSessionTime(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [isWearableMode]);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-6 md:p-12 overflow-hidden">
      {/* 1. Top Header */}
      <header className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-top duration-700">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-[0.2em] italic">BDHS</h1>
        </div>

        <div className="hidden md:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40">
            Your Body vs AI
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Toggle 
            enabled={isWearableMode} 
            setEnabled={setIsWearableMode}
            labelLeft="Manual"
            labelRight="Wearable"
          />
          <div className="avatar-placeholder cursor-pointer hover:ring-2 ring-white/20 transition-all" />
        </div>
      </header>

      {/* 2. Main Hero Section */}
      <section className="flex flex-col items-center justify-center max-w-4xl mx-auto mb-16">
        <GlassCard 
          glow={isPositive ? 'ai' : 'human'} 
          className="w-full py-12 px-8 md:px-16 flex flex-col items-center relative overflow-hidden"
        >
          {/* Background Decorative Gradient */}
          <div className={`absolute inset-0 opacity-10 pointer-events-none transition-all duration-1000 ${
            isPositive ? 'bg-ai' : 'bg-human'
          }`} style={{ filter: 'blur(100px)' }} />

          <div className="relative z-10 flex flex-col items-center w-full">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] opacity-40 mb-2">
              Hydration Gap
            </h2>
            
            <div className={`text-7xl md:text-9xl font-black tracking-tighter mb-12 animate-count ${
              isPositive ? 'text-ai text-glow-ai' : 'text-human text-glow-human'
            }`}>
              {isPositive ? '+' : ''}{Math.round(hydrationGap)}
              <span className="text-xl md:text-2xl opacity-30 ml-2 uppercase font-medium">mL</span>
            </div>

            {/* Dual Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 w-full items-center gap-8 md:gap-0">
              {/* Left Side: Human */}
              <div className="flex flex-col items-center md:items-start order-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-human opacity-60 mb-1">
                  Human Sweat
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-human text-glow-human">
                    {Math.round(humanSweat)}
                  </span>
                  <span className="text-sm opacity-30 font-medium">mL</span>
                </div>
              </div>

              {/* Connection Element (Mobile only shows vertical line, desktop horizontal) */}
              <div className="md:absolute md:left-1/2 md:-translate-x-1/2 flex flex-col items-center order-2 md:order-none w-full md:w-32">
                <div className="connection-line w-full rounded-full" />
                <div className="text-[8px] font-black uppercase tracking-widest opacity-20 mt-2">
                  Cross-Domain Sync
                </div>
              </div>

              {/* Right Side: AI */}
              <div className="flex flex-col items-center md:items-end order-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ai opacity-60 mb-1">
                  AI Water Usage
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-ai text-glow-ai">
                    {Math.round(aiWater)}
                  </span>
                  <span className="text-sm opacity-30 font-medium">mL</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Manual Controls (Only shown in Manual Mode) */}
        {!isWearableMode && (
          <div className="mt-8 flex gap-4 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase tracking-widest opacity-30">Adj. Human</label>
              <input 
                type="range" min="0" max="1000" value={humanSweat} 
                onChange={(e) => setHumanSweat(Number(e.target.value))}
                className="w-32 accent-human"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase tracking-widest opacity-30">Adj. AI</label>
              <input 
                type="range" min="0" max="1000" value={aiWater} 
                onChange={(e) => setAiWater(Number(e.target.value))}
                className="w-32 accent-ai"
              />
            </div>
          </div>
        )}
      </section>

      {/* 4. Supporting Mini Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <GlassCard className="flex flex-col items-center md:items-start">
          <MetricDisplay 
            label="AI Water Total" 
            value={Math.round(aiWater * 1.5)} 
            unit="mL" 
            type="ai" 
            className="scale-75 origin-left"
          />
        </GlassCard>
        
        <GlassCard className="flex flex-col items-center md:items-start">
          <MetricDisplay 
            label="Sweat Recorded" 
            value={Math.round(humanSweat)} 
            unit="mL" 
            type="human" 
            className="scale-75 origin-left"
          />
        </GlassCard>

        <GlassCard className="flex flex-col items-center md:items-start">
          <MetricDisplay 
            label="Session Duration" 
            value={sessionTime} 
            unit="min" 
            type="ai" 
            className="scale-75 origin-left"
          />
        </GlassCard>
      </section>

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-human/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-ai/5 blur-[120px]" />
      </div>
    </main>
  );
}

