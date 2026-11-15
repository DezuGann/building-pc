import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowDown, Sparkles, Box, ShieldCheck, Zap } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onPrebuiltClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onPrebuiltClick }) => {
  const { t } = useLanguage();

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Subtle Cybernetic Grid Overlay that blends with the Atmosphere Smoke */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#00f0ff15_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none opacity-40" 
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Interactive Massive Hero Typography */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
          
          {/* Top Tech Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
              {t.heroBadge}
            </span>
          </div>

          {/* Main Display Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
            <span>{t.heroTitlePrefix} </span>
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.4)]">
              {t.heroTitleHighlight}
            </span>
            <br />
            <span className="text-slate-200">{t.heroTitleSuffix}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300/90 max-w-2xl font-normal leading-relaxed">
            {t.heroDescription}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onExploreClick}
              className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Box className="w-4 h-4 text-slate-950 transition-transform group-hover:rotate-12" />
              <span>{t.heroCTAStart}</span>
              <ArrowDown className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-y-0.5" />
            </button>

            <button
              onClick={onPrebuiltClick}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-cyan-500/50 text-sm font-bold backdrop-blur-md transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t.heroCTAPrebuilt}</span>
            </button>
          </div>

          {/* Micro Stat Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 w-full max-w-lg">
            <div>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">{t.heroStatsFPS}</span>
              <span className="text-[11px] text-slate-400 block">{t.heroStatsFPSDesc}</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">{t.heroStatsAccuracy}</span>
              <span className="text-[11px] text-slate-400 block">{t.heroStatsAccuracyDesc}</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono">{t.heroStatsCatalog}</span>
              <span className="text-[11px] text-slate-400 block">{t.heroStatsCatalogDesc}</span>
            </div>
          </div>

        </div>

        {/* Right Column: AI-Rendered PC Gamer Showcase */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          
          {/* Ambient Background Aura */}
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl opacity-70 pointer-events-none" />

          {/* Card Housing */}
          <div className="relative group rounded-3xl p-2 bg-gradient-to-b from-slate-700/60 via-slate-800/40 to-slate-900/80 border border-cyan-500/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(34,211,238,0.2)] backdrop-blur-xl transition-transform duration-500 hover:-translate-y-2">
            
            {/* AI Image */}
            <div className="overflow-hidden rounded-2xl relative">
              <img
                src="/assets/hero-pc-gamer.jpg"
                alt="PC Gamer Ultra High-End Custom Build"
                className="w-full h-auto max-h-[460px] object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />

              {/* Floating Tech Badges over Image */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-cyan-500/50 text-[10px] font-mono font-bold text-cyan-300 shadow-md">
                  ⚡ RTX 5090 Blackwell Ready
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-purple-500/50 text-[10px] font-mono font-bold text-purple-300 shadow-md">
                  💧 Hardline ARGB Liquid Loop
                </span>
              </div>

              <div className="absolute bottom-3 right-3">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-emerald-500/50 text-[10px] font-mono font-bold text-emerald-300 shadow-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Dual Tempered Glass</span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

