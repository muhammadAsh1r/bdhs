"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';

type Mode = 'manual' | 'wearable';
type AIUsage = 'light' | 'moderate' | 'heavy';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<Mode | null>(null);
  const [activity, setActivity] = useState('moderate');
  const [duration, setDuration] = useState(60);
  const [weight, setWeight] = useState(70); // Default 70kg
  const [aiUsage, setAiUsage] = useState<AIUsage>('moderate');
  const [prompts, setPrompts] = useState(15);
  const [isConnecting, setIsConnecting] = useState(false);

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  useEffect(() => {
    if (step === 2 && mode === 'wearable') {
      setIsConnecting(true);
      const timer = setTimeout(() => setIsConnecting(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [step, mode]);

  const finishOnboarding = () => {
    // Pass weight to dashboard
    router.push(`/dashboard?weight=${weight}`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-human/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-ai/5 blur-[120px]" />

      {/* Progress Indicator */}
      <div className="mb-12 flex gap-4">
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={`h-1 w-12 rounded-full transition-all duration-500 ${
              s <= step ? (s === step ? 'bg-white w-16' : 'bg-human/40') : 'bg-white/10'
            }`} 
          />
        ))}
      </div>

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Step 1: Mode Selection */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black italic tracking-tighter mb-2">Initialize Bio-Digital Sync</h1>
            <p className="text-sm opacity-40 uppercase tracking-widest font-bold mb-10">Choose how your biological data will be captured</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <button 
                onClick={() => setMode('manual')}
                className={`text-left group transition-all duration-300 ${mode === 'manual' ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
              >
                <GlassCard glow={mode === 'manual' ? 'human' : 'none'} className={`h-full py-8 px-8 border-2 ${mode === 'manual' ? 'border-human/50' : 'border-transparent'}`}>
                  <div className="w-12 h-12 bg-human/10 rounded-xl flex items-center justify-center mb-6 text-human">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Manual Mode</h3>
                  <p className="text-xs opacity-40 leading-relaxed">Enter activity levels and sweat measurements manually through the control panel.</p>
                </GlassCard>
              </button>

              <button 
                onClick={() => setMode('wearable')}
                className={`text-left group transition-all duration-300 ${mode === 'wearable' ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
              >
                <GlassCard glow={mode === 'wearable' ? 'human' : 'none'} className={`h-full py-8 px-8 border-2 ${mode === 'wearable' ? 'border-human/50' : 'border-transparent'}`}>
                  <div className="w-12 h-12 bg-human/10 rounded-xl flex items-center justify-center mb-6 text-human">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Wearable Mode</h3>
                  <p className="text-xs opacity-40 leading-relaxed">Automatically stream live physiological data from your connected smartwatch or sensor.</p>
                </GlassCard>
              </button>
            </div>
            
            <button 
              disabled={!mode}
              onClick={nextStep}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl disabled:opacity-20 transition-all hover:scale-[1.02]"
            >
              Continue Configuration
            </button>
          </div>
        )}

        {/* Step 2: Configure Inputs */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black italic tracking-tighter mb-2">Configure Human Inputs</h2>
            <p className="text-sm opacity-40 uppercase tracking-widest font-bold mb-10">
              {mode === 'manual' ? 'Define your current physiological parameters' : 'Establishing bio-link with external hardware'}
            </p>

            <GlassCard className="p-10 mb-10">
              {mode === 'manual' ? (
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-human mb-4 block">Activity Level: <span className="text-white">{activity}</span></label>
                    <input 
                      type="range" min="0" max="2" step="1" value={activity === 'low' ? 0 : activity === 'moderate' ? 1 : 2}
                      onChange={(e) => setActivity(['low', 'moderate', 'high'][parseInt(e.target.value)])}
                      className="w-full accent-human"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-human mb-4 block">Body Weight (kg)</label>
                      <input 
                        type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xl font-black focus:border-human outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-human mb-4 block">Session Duration</label>
                      <input 
                        type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xl font-black focus:border-human outline-none"
                      />
                      <span className="text-[8px] opacity-20 uppercase mt-2 block tracking-widest">Minutes</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-human mb-4 block">Initial Sweat Rate (mL)</label>
                    <input 
                      type="number" placeholder="Optional"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xl font-black focus:border-human outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  {isConnecting ? (
                    <>
                      <div className="w-16 h-16 border-4 border-human/20 border-t-human rounded-full animate-spin mb-6" />
                      <p className="text-sm font-bold uppercase tracking-[0.2em] animate-pulse">Syncing with Wearable Device...</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-human/20 rounded-full flex items-center justify-center mb-6 text-human shadow-[0_0_20px_rgba(0,212,255,0.4)]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-human mb-2">Live Sweat Data Detected</p>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest">PX-Wearable 7.2 | 0.85mL/min detected</p>
                    </>
                  )}
                </div>
              )}
            </GlassCard>

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-5 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Back</button>
              <button onClick={nextStep} disabled={isConnecting} className="flex-[2] py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-20">Continue</button>
            </div>
          </div>
        )}

        {/* Step 3: AI Usage Profile */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black italic tracking-tighter mb-2">AI Usage Profile</h2>
            <p className="text-sm opacity-40 uppercase tracking-widest font-bold mb-10">How often do you interact with digital agents?</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {(['light', 'moderate', 'heavy'] as AIUsage[]).map((type) => (
                <button 
                  key={type}
                  onClick={() => {
                    setAiUsage(type);
                    setPrompts(type === 'light' ? 5 : type === 'moderate' ? 20 : 50);
                  }}
                  className={`text-center transition-all ${aiUsage === type ? 'scale-105' : 'hover:scale-[1.02] opacity-60 hover:opacity-100'}`}
                >
                  <GlassCard glow={aiUsage === type ? 'ai' : 'none'} className={`py-8 border-2 ${aiUsage === type ? 'border-ai/50' : 'border-transparent'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">{type} User</span>
                    <span className="text-2xl font-black tracking-tighter italic">
                      {type === 'light' ? '1-10' : type === 'moderate' ? '10-40' : '40+'}
                    </span>
                    <span className="text-[8px] block mt-1 opacity-40 uppercase font-bold">Prompts / Session</span>
                  </GlassCard>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-5 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Back</button>
              <button onClick={nextStep} className="flex-[2] py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all">Review Sync</button>
            </div>
          </div>
        )}

        {/* Step 4: Summary Screen */}
        {step === 4 && (
          <div className="animate-in fade-in zoom-in duration-500">
            <h2 className="text-4xl font-black italic tracking-tighter mb-2 text-center">Ready to Sync</h2>
            <p className="text-sm opacity-40 uppercase tracking-[0.3em] font-bold mb-12 text-center">Final configuration check complete</p>

            <GlassCard className="p-10 mb-12 bg-gradient-to-br from-human/5 to-ai/5">
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Capture Mode</span>
                  <span className="text-sm font-black uppercase text-human tracking-wider">{mode} mode</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Physiological Load</span>
                  <span className="text-sm font-black uppercase tracking-wider">{activity} ({weight}kg)</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Digital Demand</span>
                  <span className="text-sm font-black uppercase text-ai tracking-wider">{aiUsage} AI Usage</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Status</span>
                  <span className="text-[10px] font-black uppercase text-green-500 animate-pulse tracking-widest">Synchronized • Online</span>
                </div>
              </div>
            </GlassCard>

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-5 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Edit</button>
              <button onClick={finishOnboarding} className="flex-[3] py-6 bg-white text-black font-black uppercase tracking-[0.4em] rounded-2xl hover:scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">Start Dashboard</button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
