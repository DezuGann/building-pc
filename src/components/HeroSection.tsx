import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowDown, Sparkles, Box, ShieldCheck, Zap, Gauge, Disc } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onPrebuiltClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onPrebuiltClick }) => {
  const { t } = useLanguage();

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden py-8 sm:py-12 lg:py-16 px-fluid-layout">
      {/* Subtle Cybernetic Grid Overlay that merges with the fluid smoke background */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#94a3b818_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none opacity-50" 
      />

      {/* Main Fluid Responsive Auto-detectable Container */}
      <div className="relative z-10 w-full max-w-[min(94vw,2200px)] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
        
        {/* Left Column: Interactive Massive Hero Typography */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-5 sm:space-y-6 lg:space-y-8">
          
          {/* Top Metallic Chromatic Tech Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900/80 border border-slate-600/60 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
            <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
            </span>
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-slate-200 uppercase">
              {t.heroBadge}
            </span>
          </div>

          {/* Main Display Title - Fluid auto-detectable font scaling */}
          <h1 className="text-fluid-title font-black tracking-tight text-white">
            <span className="text-metallic-silver">{t.heroTitlePrefix} </span>
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(34,211,238,0.45)]">
              {t.heroTitleHighlight}
            </span>
            <br />
            <span className="text-slate-300 font-extrabold">{t.heroTitleSuffix}</span>
          </h1>

          {/* Subtitle - Auto-detectable scale */}
          <p className="text-fluid-subtitle text-slate-300/90 max-w-3xl font-normal">
            {t.heroDescription}
          </p>

          {/* CTA Buttons with Metallic Finish */}
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 pt-1 sm:pt-2">
            <button
              onClick={onExploreClick}
              className="group flex items-center gap-2.5 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm sm:text-base tracking-wide shadow-2xl shadow-cyan-500/30 transition-all duration-300 hover:scale-105 active:scale-95 border border-cyan-300/60"
            >
              <Box className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 transition-transform group-hover:rotate-12" />
              <span>{t.heroCTAStart}</span>
              <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 transition-transform group-hover:translate-y-1" />
            </button>

            <button
              onClick={onPrebuiltClick}
              className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-400/60 text-sm sm:text-base font-bold backdrop-blur-md transition-all duration-200 shadow-lg shadow-black/40"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              <span>{t.heroCTAPrebuilt}</span>
            </button>
          </div>

          {/* Micro Stat Badges with Metallic Sheen */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-5 sm:pt-7 border-t border-slate-800/80 w-full max-w-xl">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-fluid-stat font-black text-white font-mono block">
                {t.heroStatsFPS}
              </span>
              <span className="text-xs sm:text-sm text-slate-400 block leading-tight">
                {t.heroStatsFPSDesc}
              </span>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-fluid-stat font-black text-cyan-400 font-mono block">
                {t.heroStatsAccuracy}
              </span>
              <span className="text-xs sm:text-sm text-slate-400 block leading-tight">
                {t.heroStatsAccuracyDesc}
              </span>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-fluid-stat font-black text-purple-400 font-mono block">
                {t.heroStatsCatalog}
              </span>
              <span className="text-xs sm:text-sm text-slate-400 block leading-tight">
                {t.heroStatsCatalogDesc}
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: AI-Rendered PC Gamer Showcase with Right-to-Left Dock Animation */}
        <div className="lg:col-span-5 flex items-center justify-center relative w-full mt-4 lg:mt-0">
          
          {/* Ambient Metallic Cyan & Violet Halo Aura */}
          <div className="absolute -inset-6 bg-gradient-to-r from-cyan-500/25 via-blue-600/20 to-purple-600/25 rounded-3xl blur-3xl opacity-75 pointer-events-none" />

          {/* Card Housing: Brushed Titanium & Steel with Right-to-Left Entrance & Docking */}
          <div className="relative group rounded-3xl p-2.5 sm:p-4 bg-metallic-titanium shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(34,211,238,0.25)] backdrop-blur-2xl transition-transform duration-500 hover:-translate-y-2 w-full animate-dock-right-main">
            
            {/* Top Metallic Chamfer Bar */}
            <div className="flex items-center justify-between px-3 py-1.5 sm:py-2 mb-2 bg-slate-950/70 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-rose-500/80 border border-rose-400/50"></span>
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-500/80 border border-amber-400/50"></span>
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500/80 border border-emerald-400/50"></span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400 ml-1 sm:ml-2">
                  AUTO-SCALING • ADAPTIVE DISPLAY
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] sm:text-xs font-mono">
                <Gauge className="w-3 sm:w-3.5 h-3 sm:h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>ONLINE</span>
              </div>
            </div>

            {/* AI Image with Fluid Auto-Scaling */}
            <div className="overflow-hidden rounded-2xl relative shadow-2xl border border-slate-700/50">
              <img
                src="/assets/hero-pc-gamer.jpg"
                alt="PC Gamer Ultra High-End Custom Build"
                className="w-full h-auto h-fluid-showcase object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />

              {/* Sequential Right-to-Left Sliding Telemetry Badges */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 sm:gap-2">
                <span className="animate-dock-badge-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-400/60 text-[10px] sm:text-xs font-mono font-bold text-cyan-300 shadow-xl flex items-center gap-1.5">
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                  <span>RTX 5090 Blackwell Ready</span>
                </span>
                <span className="animate-dock-badge-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-purple-400/60 text-[10px] sm:text-xs font-mono font-bold text-purple-300 shadow-xl flex items-center gap-1.5">
                  <Disc className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
                  <span>Hardline ARGB Liquid Loop</span>
                </span>
              </div>

              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 animate-dock-badge-3">
                <span className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-emerald-400/60 text-[10px] sm:text-xs font-mono font-bold text-emerald-300 shadow-xl flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  <span>Dual Tempered Glass • Titanium</span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
