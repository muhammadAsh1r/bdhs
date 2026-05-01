"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { MetricDisplay } from '@/components/ui/MetricDisplay';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';

export default function Home() {
  const [isWearableMode, setIsWearableMode] = useState(false);

  return (
    <main className="min-h-screen p-8 md:p-16 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 italic">
            BDHS <span className="text-human">v1.0</span>
          </h1>
          <p className="text-sm font-medium opacity-40 uppercase tracking-[0.2em]">
            Bio-Digital Hydration Synchronizer
          </p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <Toggle 
            enabled={isWearableMode} 
            setEnabled={setIsWearableMode}
            labelLeft="Manual Sync"
            labelRight="Wearable Sync"
          />
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Human Data Section */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-6">
          <GlassCard glow="human" className="col-span-2">
            <MetricDisplay 
              label="Human Bio-Output (Sweat)"
              value="842"
              unit="mL"
              type="human"
            />
            <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-human w-[65%] shadow-[0_0_10px_#00D4FF]" />
            </div>
          </GlassCard>

          <GlassCard className="col-span-1">
            <MetricDisplay 
              label="Electrolyte Loss"
              value="1.2"
              unit="g"
              type="human"
            />
          </GlassCard>

          <GlassCard className="col-span-1">
            <MetricDisplay 
              label="Hydration Level"
              value="72"
              unit="%"
              type="human"
            />
          </GlassCard>
        </div>

        {/* AI Data Section */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <GlassCard glow="ai" className="h-full">
            <MetricDisplay 
              label="AI Digital Cost (Water)"
              value="1,240"
              unit="L"
              type="ai"
            />
            <p className="mt-4 text-xs opacity-40 leading-relaxed">
              Total water consumed by compute nodes to process biological feedback loops in real-time.
            </p>
          </GlassCard>
        </div>

        {/* Interaction Panel */}
        <div className="col-span-12 lg:col-span-4">
          <GlassCard className="h-full">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-6">
              Parameter Calibration
            </h3>
            <div className="flex flex-col gap-6">
              <Input label="Biometric Tag" placeholder="PX-742-ALPHA" glowType="human" />
              <Input label="Sync Interval" placeholder="300ms" glowType="ai" />
              <button className="mt-2 w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
                Execute Sync
              </button>
            </div>
          </GlassCard>
        </div>

        {/* System Logs / Secondary Info */}
        <div className="col-span-12 lg:col-span-8">
          <GlassCard className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-6">
                Real-time Synchronization Log
              </h3>
              <div className="space-y-3 font-mono text-[10px] opacity-60">
                <div className="flex gap-4">
                  <span className="text-human">[OK]</span>
                  <span>BIO-SENSORS INITIALIZED...</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-ai">[WAIT]</span>
                  <span>CALCULATING DIGITAL OVERHEAD FOR REGION: US-EAST-1</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-human">[OK]</span>
                  <span>SWEAT RATE DETECTED: 14.2mL/min</span>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-between items-center text-[10px] uppercase tracking-widest opacity-30">
              <span>Status: Synchronized</span>
              <span>Uptime: 14:02:44</span>
            </div>
          </GlassCard>
        </div>

      </div>
    </main>
  );
}

