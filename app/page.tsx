"use client";

import React from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-human/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-ai/10 blur-[120px]" />
      </div>

      {/* 1. Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic mb-6">
            YOUR BODY <span className="text-human font-light">vs</span> <span className="text-ai">AI</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl font-medium opacity-60 tracking-tight leading-relaxed mb-12">
            See how your physical energy translates into AI resource consumption. 
            The world's first cross-domain hydration synchronizer.
          </p>

          <Link href="/onboarding">
            <button className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-human to-ai opacity-0 group-hover:opacity-20 transition-opacity" />
              Start Simulation
            </button>
          </Link>
        </div>

        {/* Central Visual Element */}
        <div className="mt-20 relative w-full max-w-4xl h-[400px] flex items-center justify-center animate-in fade-in zoom-in duration-1000 delay-300">
          {/* Human Side */}
          <div className="absolute left-0 md:left-10 flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full border-2 border-human shadow-[0_0_30px_#00D4FF] flex items-center justify-center">
              <div className="w-12 h-12 bg-human/20 rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-human">Biological State</span>
          </div>

          {/* AI Side */}
          <div className="absolute right-0 md:right-10 flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full border-2 border-ai shadow-[0_0_30px_#7C3AED] flex items-center justify-center">
              <div className="w-12 h-12 bg-ai/20 rounded-full animate-pulse delay-700" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-ai">Digital Infrastructure</span>
          </div>

          {/* Connection Line */}
          <div className="relative w-1/2 h-1 hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-r from-human to-ai rounded-full opacity-30" />
            <div className="absolute inset-0 connection-line rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-background px-4 py-1 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-[0.4em] opacity-40">
              Cross-Domain Sync
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="text-center mb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-ai mb-4">The Patent Mechanism</h2>
          <h3 className="text-4xl font-black italic tracking-tighter">How It Works</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "You use AI", desc: "Every prompt you send requires significant compute nodes and cooling water in remote data centers.", glow: "ai" },
            { step: "02", title: "Your body produces sweat", desc: "As you work, your biological output mirrors the intensity of the digital processing loops.", glow: "human" },
            { step: "03", title: "We calculate the Gap", desc: "Our algorithm synchronizes the hydration deficit between your cells and the AI data center.", glow: "none" }
          ].map((item, i) => (
            <GlassCard key={i} glow={item.glow as any} className="flex flex-col gap-6 py-12 px-8 h-full">
              <span className="text-4xl font-black italic opacity-10">{item.step}</span>
              <h4 className="text-xl font-bold tracking-tight">{item.title}</h4>
              <p className="text-sm opacity-40 leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 3. Key Metrics */}
      <section className="bg-white/[0.02] py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-6">
            <div className="max-w-md">
              <h3 className="text-4xl font-black italic tracking-tighter mb-4">Core Metrics</h3>
              <p className="text-sm opacity-40 uppercase tracking-widest font-bold">The variables that define our biological-digital connection.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Hydration Gap", desc: "The mismatch between AI water consumption and your biological sweat production." },
              { title: "Prompt Equivalency", desc: "How many AI queries your physical sweat could power in real-world energy terms." },
              { title: "Convergence Point", desc: "The exact moment where your biological output perfectly mirrors AI digital cost." }
            ].map((metric, i) => (
              <GlassCard key={i} className="py-10 px-8 border-l-2 border-human/30">
                <h4 className="text-lg font-black uppercase tracking-widest mb-4">{metric.title}</h4>
                <p className="text-xs opacity-40 leading-relaxed">{metric.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why It Matters */}
      <section className="max-w-3xl mx-auto px-6 py-32 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-human/5 blur-[100px] -z-10" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 mb-8">Synchronicity Ethics</h3>
        <p className="text-2xl md:text-3xl font-medium tracking-tight leading-snug mb-12">
          AI is not invisible. Every digital interaction has a <span className="text-human font-black">physical impact</span> on the planet and, through BDHS, a <span className="text-ai font-black">direct connection</span> to your own body.
        </p>
        <Link href="/onboarding">
          <button className="text-[10px] font-black uppercase tracking-[0.4em] underline decoration-human underline-offset-8 hover:opacity-60 transition-opacity">
            Explore the Simulation
          </button>
        </Link>
      </section>

      {/* 5. Footer CTA */}
      <section className="py-32 px-6 border-t border-white/5 flex flex-col items-center text-center">
        <h3 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-12 opacity-10">BDHS</h3>
        <div className="flex flex-col md:flex-row gap-6">
          <Link href="/onboarding">
            <button className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-105 transition-all">
              Enter Dashboard
            </button>
          </Link>
          <button className="px-12 py-5 bg-transparent border border-white/20 text-white font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white/5 transition-all">
            Try Demo
          </button>
        </div>
        <p className="mt-12 text-[8px] font-bold uppercase tracking-[0.5em] opacity-20">
          © 2024 Bio-Digital Hydration Synchronizer • Patent Pending
        </p>
      </section>
    </main>
  );
}
