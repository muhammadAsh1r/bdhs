"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { MetricDisplay } from '@/components/ui/MetricDisplay';
import { Toggle } from '@/components/ui/Toggle';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [isWearableMode, setIsWearableMode] = useState(false);
  const [humanSweat, setHumanSweat] = useState(80);
  const [aiWater, setAiWater] = useState(200);
  const [sessionTime, setSessionTime] = useState(42);
  const [aiPrompts, setAiPrompts] = useState(5);
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [hydrationLevel, setHydrationLevel] = useState(72);
  const [history, setHistory] = useState<{human: number, ai: number, time: number}[]>([]);
  const [sessionHistory, setSessionHistory] = useState<{
    id: string,
    date: string, 
    gap: number, 
    prompts: string, 
    sweat: number, 
    ai: number,
    converged: boolean
  }[]>([]);

  // Client-side initialization to prevent hydration mismatch
  useEffect(() => {
    setHistory([...Array(20)].map((_, i) => ({
      human: 60 + Math.random() * 40,
      ai: 180 + Math.random() * 40,
      time: Date.now() - (20 - i) * 1000
    })));
  }, []);

  // Bio-Intervention Logic
  const isAlertActive = hydrationLevel < 30;
  const alertIntensity = Math.max(0, (30 - hydrationLevel) / 30);

  // Derive AI Water from Prompts (1 prompt = 40mL water for compute)
  useEffect(() => {
    if (!isWearableMode) {
      setAiWater(aiPrompts * 40);
    }
  }, [aiPrompts, isWearableMode]);

  // Derive Hydration Gap
  const hydrationGap = aiWater - humanSweat;
  const isPositive = hydrationGap >= 0;

  // Prompt Equivalency Logic
  const WATER_PER_PROMPT = 25;
  const promptsTotal = humanSweat / WATER_PER_PROMPT;
  
  const getPromptMessage = () => {
    if (humanSweat >= WATER_PER_PROMPT) {
      return `Your sweat today could power ${promptsTotal.toFixed(2)} prompts`;
    } else if (humanSweat >= 6) {
      return "Your sweat today could power 1/4 of a typical AI prompt";
    } else {
      return "You’re building up — keep moving!";
    }
  };

  const promptProgress = (humanSweat % WATER_PER_PROMPT) / WATER_PER_PROMPT;

  // Metabolic Convergence Point (MCP) Logic
  const sweatRatePerMin = useMemo(() => {
    const baseRate = 8; // mL per minute at moderate
    const multiplier = activityLevel === 'high' ? 2 : activityLevel === 'moderate' ? 1 : 0.5;
    return baseRate * multiplier;
  }, [activityLevel]);

  const isConverged = humanSweat >= aiWater;
  const remainingWater = Math.max(0, aiWater - humanSweat);
  const timeToConvergence = sweatRatePerMin > 0 ? remainingWater / sweatRatePerMin : Infinity;

  // Fetch Session History from Supabase
  useEffect(() => {
    async function fetchHistory() {
      const { data, error } = await supabase
        .from('sync_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setSessionHistory(data.map(d => ({
          id: d.id,
          date: new Date(d.created_at).toLocaleTimeString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          gap: d.hydration_gap,
          prompts: d.ai_prompts.toFixed(1),
          sweat: d.human_sweat,
          ai: d.ai_water,
          converged: d.human_sweat >= d.ai_water
        })));
      }
    }
    fetchHistory();
  }, []);

  // Save Session Function
  const saveSession = async () => {
    const { error } = await supabase
      .from('sync_sessions')
      .insert({
        human_sweat: Math.round(humanSweat),
        ai_water: Math.round(aiWater),
        hydration_gap: Math.round(aiWater - humanSweat),
        ai_prompts: promptsTotal,
      });

    if (!error) {
      // Refresh local history
      const date = new Date().toLocaleTimeString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      setSessionHistory(prev => [{
        id: Math.random().toString(),
        date,
        gap: Math.round(aiWater - humanSweat),
        prompts: promptsTotal.toFixed(1),
        sweat: Math.round(humanSweat),
        ai: Math.round(aiWater),
        converged: humanSweat >= aiWater
      }, ...prev].slice(0, 10));
    }
  };

  // Simulation & Real-Time Persistence Logic
  useEffect(() => {
    // 1. Live Simulation Interval (1s)
    const simulationInterval = setInterval(() => {
      if (isWearableMode) {
        const activityMultiplier = activityLevel === 'high' ? 2 : activityLevel === 'moderate' ? 1 : 0.5;
        // Realistic sweat increase: base rate + small random jitter
        const deltaSweat = (0.5 + Math.random() * 0.5) * activityMultiplier;
        const deltaAiWater = Math.random() * 0.8; // AI water also fluctuates slightly based on "compute load"
        
        setHumanSweat(prev => Math.max(0, prev + deltaSweat));
        setAiWater(prev => Math.max(0, prev + deltaAiWater));
        setSessionTime(prev => prev + 1);
        setHydrationLevel(prev => Math.max(0, prev - (0.05 * activityMultiplier)));
      }
      
      // Update history for graph
      setHistory(prev => {
        const next = [...prev, { human: humanSweat, ai: aiWater, time: Date.now() }];
        return next.slice(-30);
      });
    }, 1000);

    // 2. Auto-Archive/Refresh Interval (60s)
    const archiveInterval = setInterval(() => {
      if (isWearableMode) {
        console.log("BDHS: Auto-archiving longitudinal data point...");
        saveSession();
      }
    }, 60000);

    return () => {
      clearInterval(simulationInterval);
      clearInterval(archiveInterval);
    };
  }, [isWearableMode, humanSweat, aiWater, activityLevel]);

  // Graph Calculations (SVG Path)
  const graphData = useMemo(() => {
    if (history.length < 2) return { humanPath: '', aiPath: '' };
    
    const width = 600;
    const height = 150;
    const maxVal = Math.max(...history.map(d => Math.max(d.human, d.ai, 100))) * 1.2;
    const xStep = width / (history.length - 1);

    const getPoints = (key: 'human' | 'ai') => 
      history.map((d, i) => `${i * xStep},${height - (d[key] / maxVal * height)}`).join(' L ');

    return { humanPath: `M ${getPoints('human')}`, aiPath: `M ${getPoints('ai')}` };
  }, [history]);

  // Find Convergence Point for Graph
  const convergenceIndex = useMemo(() => {
    for (let i = 1; i < history.length; i++) {
      if ((history[i-1].human < history[i-1].ai && history[i].human >= history[i].ai) ||
          (history[i-1].human > history[i-1].ai && history[i].human <= history[i].ai)) {
        return i;
      }
    }
    return -1;
  }, [history]);

  return (
    <main className={`min-h-screen bg-background text-foreground font-sans p-6 md:p-12 overflow-x-hidden transition-colors duration-1000 ${isAlertActive ? 'alert-active' : ''}`}>
      <div className="alert-overlay" style={{ opacity: alertIntensity * 0.8 }} />
      
      {/* 1. Top Header */}
      <header className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-top duration-700 relative z-10">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-[0.2em] italic">BDHS</h1>
        </div>

        <div className="hidden md:block text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40">
              {isAlertActive ? 'CRITICAL SYSTEM ALERT' : 'Your Body vs AI'}
            </p>
            {isWearableMode && (
              <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-human/10 border border-human/20">
                <div className="w-1.5 h-1.5 bg-human rounded-full animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-human">Live</span>
              </div>
            )}
          </div>
          {isAlertActive && (
            <p className="text-[8px] font-black alert-text uppercase tracking-widest mt-1">
              Hydration deficit detected • Consider rehydration
            </p>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest">Simulation Level</span>
            <input 
              type="range" min="0" max="100" value={hydrationLevel} 
              onChange={(e) => setHydrationLevel(Number(e.target.value))}
              className="w-24 accent-white"
            />
          </div>
          <div className="avatar-placeholder cursor-pointer hover:ring-2 ring-white/20 transition-all" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center max-w-5xl mx-auto mb-16 relative z-10">
        <GlassCard 
          glow={isAlertActive ? 'none' : (isPositive ? 'ai' : 'human')} 
          className={`w-full py-12 px-8 md:px-16 flex flex-col items-center relative overflow-hidden transition-all duration-500 ${isAlertActive ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] metric-pulse-alert' : ''}`}
        >
          <div className={`absolute inset-0 opacity-10 pointer-events-none transition-all duration-1000 ${
            isAlertActive ? 'bg-red-600' : (isPositive ? 'bg-ai' : 'bg-human')
          }`} style={{ filter: 'blur(100px)' }} />

          <div className="relative z-10 flex flex-col items-center w-full">
            <h2 className={`text-xs font-black uppercase tracking-[0.4em] mb-2 ${isAlertActive ? 'text-red-500 opacity-100' : 'opacity-40'}`}>
              {isAlertActive ? 'HYDRATION GAP (CRITICAL)' : 'Hydration Gap'}
            </h2>
            
            <div className={`text-7xl md:text-9xl font-black tracking-tighter mb-12 animate-count transition-colors duration-500 ${
              isAlertActive ? 'text-red-500' : (isPositive ? 'text-ai text-glow-ai' : 'text-human text-glow-human')
            }`}>
              {isPositive ? '+' : ''}{Math.round(hydrationGap)}
              <span className="text-xl md:text-2xl opacity-30 ml-2 uppercase font-medium">mL</span>
            </div>

            {/* Dual Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 w-full items-center gap-8 md:gap-0">
              <div className="flex flex-col items-center md:items-start relative">
                {isWearableMode && (
                  <div className="absolute -top-6 -left-2 text-[6px] font-black uppercase tracking-widest text-human/40 animate-pulse">
                    Streaming Bio-Data
                  </div>
                )}
                <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1 ${isAlertActive ? 'text-red-400' : 'text-human'}`}>
                  Human Sweat
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl md:text-5xl font-black ${isAlertActive ? 'text-red-500' : 'text-human text-glow-human'}`}>
                    {Math.round(humanSweat)}
                  </span>
                  <span className="text-sm opacity-30 font-medium">mL</span>
                </div>
              </div>

              <div className="md:absolute md:left-1/2 md:-translate-x-1/2 flex flex-col items-center w-full md:w-32">
                <div className={`connection-line w-full rounded-full ${isAlertActive ? 'bg-red-500 opacity-50' : ''}`} />
                <div className="text-[8px] font-black uppercase tracking-widest opacity-20 mt-2">
                  Cross-Domain Sync
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end">
                <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1 ${isAlertActive ? 'text-red-400' : 'text-ai'}`}>
                  AI Water Usage
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl md:text-5xl font-black ${isAlertActive ? 'text-red-500' : 'text-ai text-glow-ai'}`}>
                    {Math.round(aiWater)}
                  </span>
                  <span className="text-sm opacity-30 font-medium">mL</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Primary Dashboard Grid */}
      <section className="grid grid-cols-12 gap-6 max-w-5xl mx-auto mb-16 relative z-10">
        
        {/* Prompt Equivalency */}
        <div className="col-span-12 lg:col-span-4">
          <GlassCard className={`h-full flex flex-col items-center justify-center py-10 px-8 text-center relative overflow-hidden transition-all duration-500 ${isAlertActive ? 'metric-pulse-alert' : ''}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-human/20 to-ai/20 blur-3xl -z-10" />
            
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-6">
              Prompt Equivalency
            </h3>

            <p className={`text-xs font-bold mb-8 px-4 transition-all duration-500 ${humanSweat < 6 ? 'animate-pulse text-human' : 'opacity-80'}`}>
              {getPromptMessage()}
            </p>

            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              {/* SVG Circular Progress */}
              <svg className="w-full h-full">
                <circle
                  className="text-white/5"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="80"
                  cy="80"
                />
                <circle
                  className={`progress-ring-circle transition-all duration-1000 ${isAlertActive ? 'text-red-500' : 'text-ai'}`}
                  strokeWidth="8"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * (humanSweat >= WATER_PER_PROMPT ? (promptsTotal % 1 || 0.999) : promptProgress))}
                  strokeLinecap="round"
                  stroke="url(#ringGradient)"
                  fill="transparent"
                  r="70"
                  cx="80"
                  cy="80"
                />
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-human)" />
                    <stop offset="100%" stopColor="var(--color-ai)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-4xl font-black tracking-tighter ${isAlertActive ? 'text-red-500' : 'text-glow-ai'}`}>
                  {humanSweat >= WATER_PER_PROMPT ? promptsTotal.toFixed(1) : Math.round(promptProgress * 100)}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">
                  {humanSweat >= WATER_PER_PROMPT ? 'AI Prompts' : '% to Prompt'}
                </span>
              </div>
            </div>

            {humanSweat < 6 && (
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-human transition-all duration-500" 
                  style={{ width: `${(humanSweat / WATER_PER_PROMPT) * 100}%` }} 
                />
              </div>
            )}
          </GlassCard>
        </div>

        {/* Real-Time Graph */}
        <div className="col-span-12 lg:col-span-8">
          <GlassCard className="h-full py-8">
            <div className="flex justify-between items-center mb-8 px-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Synchronicity Trend</h3>
              <div className="flex gap-4 text-[8px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${isAlertActive ? 'bg-red-500' : 'bg-human'}`} /> Human</div>
                <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${isAlertActive ? 'bg-red-400' : 'bg-ai'}`} /> AI</div>
              </div>
            </div>
            <div className="relative w-full h-[150px] px-6">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 150">
                <path className={`graph-line ${isAlertActive ? 'text-red-500/50' : 'text-human'}`} d={graphData.humanPath} stroke="currentColor" />
                <path className={`graph-line ${isAlertActive ? 'text-red-400/50' : 'text-ai'}`} d={graphData.aiPath} stroke="currentColor" />
                
                {/* Convergence Point Marker */}
                {convergenceIndex !== -1 && (
                  <g>
                    <circle 
                      cx={(convergenceIndex / (history.length - 1)) * 600} 
                      cy={150 - (history[convergenceIndex].human / (Math.max(...history.map(d => Math.max(d.human, d.ai, 100))) * 1.2) * 150)} 
                      r="4" 
                      className="fill-white animate-pulse"
                    />
                    <text 
                      x={(convergenceIndex / (history.length - 1)) * 600} 
                      y={150 - (history[convergenceIndex].human / (Math.max(...history.map(d => Math.max(d.human, d.ai, 100))) * 1.2) * 150) - 10} 
                      className="text-[8px] font-black uppercase tracking-widest fill-white/60 text-center"
                      textAnchor="middle"
                    >
                      Convergence
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Metabolic Convergence Point Section */}
      <section className="grid grid-cols-12 gap-6 max-w-5xl mx-auto mb-16 relative z-10">
        <div className="col-span-12">
          <GlassCard className={`p-8 relative overflow-hidden transition-all duration-500 ${isAlertActive ? 'metric-pulse-alert' : ''}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="max-w-md">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-4">Metabolic Convergence Point</h3>
                <div className="flex items-baseline gap-4">
                  <span className={`text-4xl md:text-5xl font-black italic tracking-tighter ${isConverged ? 'text-white text-glow-white' : 'text-human'}`}>
                    {isConverged ? 'Convergence Achieved' : `In ${Math.ceil(timeToConvergence)} minutes`}
                  </span>
                  {isWearableMode && !isConverged && (
                    <div className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 rounded border border-white/10 animate-pulse">
                      Recalculating...
                    </div>
                  )}
                  {!isWearableMode && !isConverged && sweatRatePerMin === 0 && (
                    <span className="text-xs opacity-40">No activity detected</span>
                  )}
                </div>
                <p className="text-xs opacity-40 mt-4 leading-relaxed">
                  {isConverged 
                    ? "Your biological output has successfully synchronized with your digital footprint." 
                    : `Maintaining your current ${activityLevel} activity level will balance your AI impact in approximately ${Math.ceil(timeToConvergence)} minutes.`}
                </p>
              </div>

              <div className="flex-1 w-full max-w-sm">
                <div className="relative h-12 w-full bg-white/5 rounded-2xl overflow-hidden border border-white/10 px-2 flex items-center">
                  {/* Current Position Marker */}
                  <div 
                    className="absolute h-8 rounded-xl bg-gradient-to-r from-human to-ai transition-all duration-1000 shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                    style={{ width: `${Math.min(100, (humanSweat / aiWater) * 100)}%` }}
                  />
                  <div className="relative z-10 w-full flex justify-between px-4 text-[8px] font-black uppercase tracking-[0.2em]">
                    <span className="opacity-60">Human Base</span>
                    <span className={isConverged ? 'text-white' : 'opacity-60'}>Convergence Node</span>
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-[8px] font-bold uppercase tracking-widest opacity-20">
                  <span>{Math.round(humanSweat)} mL</span>
                  <span>{Math.round(aiWater)} mL</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 1. Input Control Panel */}
      <section className="max-w-5xl mx-auto mb-16 relative z-10">
        <GlassCard className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">System Calibration Panel</h3>
            <Toggle 
              enabled={isWearableMode} 
              setEnabled={setIsWearableMode}
              labelLeft="Manual Mode"
              labelRight="Wearable Mode"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* AI Input Section */}
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-4 block text-ai">AI Usage (Cost Node)</label>
                <div className="flex items-center gap-6">
                  <input 
                    type="number" value={aiPrompts} 
                    onChange={(e) => setAiPrompts(Number(e.target.value))}
                    disabled={isWearableMode}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-black w-24 focus:border-ai outline-none transition-all disabled:opacity-30"
                  />
                  <div className="flex-1">
                    <input 
                      type="range" min="0" max="100" value={aiPrompts} 
                      onChange={(e) => setAiPrompts(Number(e.target.value))}
                      disabled={isWearableMode}
                      className="w-full accent-ai disabled:opacity-30"
                    />
                    <div className="flex justify-between mt-2 text-[8px] font-bold opacity-30 uppercase tracking-widest">
                      <span>0 Prompts</span>
                      <span>100 Prompts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Human Input Section */}
            <div className="flex flex-col gap-6">
              {isWearableMode ? (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-human/20 rounded-2xl p-6">
                  <div className="w-3 h-3 bg-human rounded-full animate-pulse mb-3" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-human">Connected to Bio-Wearable PX-1</span>
                  <span className="text-[8px] opacity-40 mt-1 uppercase">Streaming high-fidelity physiological data</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 text-human">Sweat (mL)</label>
                    <input 
                      type="number" value={humanSweat} 
                      onChange={(e) => setHumanSweat(Number(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-black focus:border-human outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 text-human">Activity Level</label>
                    <select 
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value as any)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-black focus:border-human outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="low" className="bg-background text-foreground">Low</option>
                      <option value="moderate" className="bg-background text-foreground">Moderate</option>
                      <option value="high" className="bg-background text-foreground">High</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={saveSession}
              className="px-8 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.05] active:scale-[0.95] transition-all"
            >
              Archive Synchronization Session
            </button>
          </div>
        </GlassCard>
      </section>

      {/* Session History & Longitudinal Tracking */}
      <section className="max-w-5xl mx-auto pb-24 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-4">Longitudinal Tracking System</h3>
            <h4 className="text-3xl font-black italic tracking-tighter">Sync History Archive</h4>
          </div>
          <div className="flex gap-4 text-[8px] font-bold uppercase tracking-widest opacity-40">
            <span>Total Sessions: {sessionHistory.length}</span>
            <span>•</span>
            <span>Efficiency: {Math.round((sessionHistory.filter(s => s.converged).length / (sessionHistory.length || 1)) * 100)}%</span>
          </div>
        </div>

        {/* Historical Trend Graph */}
        <GlassCard className="p-8 mb-12 h-64 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Historical Hydration Trend</span>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest opacity-40">
                <div className="w-2 h-2 rounded-full bg-human" /> Sweat
              </div>
              <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest opacity-40">
                <div className="w-2 h-2 rounded-full bg-ai" /> AI Water
              </div>
            </div>
          </div>
          <div className="relative w-full h-32">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              {sessionHistory.length >= 2 && (
                <>
                  <path 
                    d={`M ${sessionHistory.slice().reverse().map((s, i) => `${(i / (sessionHistory.length - 1)) * 800},${120 - (s.sweat / Math.max(...sessionHistory.map(d => Math.max(d.sweat, d.ai, 200))) * 100)}`).join(' L ')}`}
                    className="stroke-human fill-none stroke-2 opacity-50"
                  />
                  <path 
                    d={`M ${sessionHistory.slice().reverse().map((s, i) => `${(i / (sessionHistory.length - 1)) * 800},${120 - (s.ai / Math.max(...sessionHistory.map(d => Math.max(d.sweat, d.ai, 200))) * 100)}`).join(' L ')}`}
                    className="stroke-ai fill-none stroke-2 opacity-50"
                  />
                  {sessionHistory.slice().reverse().map((s, i) => (
                    s.converged && (
                      <circle 
                        key={i}
                        cx={(i / (sessionHistory.length - 1)) * 800}
                        cy={120 - (s.sweat / Math.max(...sessionHistory.map(d => Math.max(d.sweat, d.ai, 200))) * 100)}
                        r="3"
                        className="fill-white shadow-[0_0_10px_white]"
                      />
                    )
                  ))}
                </>
              )}
            </svg>
          </div>
        </GlassCard>

        {/* Detailed Session List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessionHistory.map((session) => (
            <GlassCard key={session.id} className={`p-6 border-l-4 transition-all hover:bg-white/5 ${session.gap >= 0 ? 'border-l-ai' : 'border-l-human'}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[9px] font-bold opacity-30 mb-1">{session.date}</div>
                  <div className={`text-xl font-black ${session.gap >= 0 ? 'text-ai text-glow-ai' : 'text-human text-glow-human'}`}>
                    {session.gap >= 0 ? '+' : ''}{session.gap} mL
                  </div>
                </div>
                {session.converged && (
                  <div className="bg-white/10 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest text-white animate-pulse">
                    Converged
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[8px] font-bold uppercase opacity-30 mb-1">Equivalency</div>
                  <div className="text-sm font-black italic">{session.prompts} Prompts</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-bold uppercase opacity-30 mb-1">Efficiency</div>
                  <div className="text-sm font-black">
                    {Math.round((session.sweat / session.ai) * 100)}%
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-all duration-1000 ${isAlertActive ? 'bg-red-500/10' : 'bg-human/5'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-all duration-1000 ${isAlertActive ? 'bg-red-600/10' : 'bg-ai/5'}`} />
      </div>
    </main>
  );
}
