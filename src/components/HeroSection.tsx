import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowDown, Sparkles, Box } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onPrebuiltClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onPrebuiltClick }) => {
  const { t } = useLanguage();

  return (
    <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden py-12 lg:py-20 px-fluid-layout">
      {/* 1. Fondo completo extendido solo para esta sección de presentación */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <img
          src="/assets/hero-pc-gamer.jpg"
          alt="Custom PC Gaming Studio Backdrop"
          className="w-full h-full object-cover object-center md:object-[82%_center] lg:object-[86%_center] opacity-90 scale-105 transition-transform duration-1000"
          loading="eager"
        />

        {/* Gradiente horizontal suave: Contraste oscuro a la izquierda para el texto, revelando la PC a la derecha */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/85 md:via-[#07090e]/70 to-[#07090e]/25" />

        {/* Gradientes verticales suaves: Arriba se funde con el Header, Abajo se funde con el humo fluido */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#07090e] via-[#07090e]/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#07090e] via-[#07090e]/85 to-transparent" />
      </div>

      {/* 2. Contenedor de contenido sin marcos ni textos innecesarios */}
      <div className="relative z-10 w-full max-w-[min(94vw,2200px)] mx-auto flex flex-col items-start text-left space-y-6 sm:space-y-8 lg:space-y-10 max-w-4xl lg:max-w-5xl">
        
        {/* Título de Pantalla Principal - Escala Fluida Auto-detectable */}
        <h1 className="text-fluid-title font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          <span className="text-metallic-silver">{t.heroTitlePrefix} </span>
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(34,211,238,0.45)]">
            {t.heroTitleHighlight}
          </span>
          <br />
          <span className="text-slate-200 font-extrabold">{t.heroTitleSuffix}</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-fluid-subtitle text-slate-200 max-w-3xl font-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          {t.heroDescription}
        </p>

        {/* Botones de Acción con Acabado Metálico */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
          <button
            onClick={onExploreClick}
            className="group flex items-center gap-3 px-7 py-3.5 sm:px-9 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm sm:text-base tracking-wide shadow-2xl shadow-cyan-500/30 transition-all duration-300 hover:scale-105 active:scale-95 border border-cyan-300/60"
          >
            <Box className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 transition-transform group-hover:rotate-12" />
            <span>{t.heroCTAStart}</span>
            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 transition-transform group-hover:translate-y-1" />
          </button>

          <button
            onClick={onPrebuiltClick}
            className="flex items-center gap-2.5 px-7 py-3.5 sm:px-9 sm:py-4 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-400/60 text-sm sm:text-base font-bold backdrop-blur-md transition-all duration-200 shadow-xl shadow-black/50"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            <span>{t.heroCTAPrebuilt}</span>
          </button>
        </div>

        {/* Estadísticas Clave */}
        <div className="grid grid-cols-3 gap-6 sm:gap-10 pt-6 sm:pt-8 border-t border-slate-700/60 w-full max-w-xl">
          <div className="space-y-1">
            <span className="text-fluid-stat font-black text-white font-mono block drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {t.heroStatsFPS}
            </span>
            <span className="text-xs sm:text-sm text-slate-300 block leading-tight font-medium">
              {t.heroStatsFPSDesc}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-fluid-stat font-black text-cyan-400 font-mono block drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              {t.heroStatsAccuracy}
            </span>
            <span className="text-xs sm:text-sm text-slate-300 block leading-tight font-medium">
              {t.heroStatsAccuracyDesc}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-fluid-stat font-black text-purple-400 font-mono block drop-shadow-[0_0_15px_rgba(192,132,252,0.4)]">
              {t.heroStatsCatalog}
            </span>
            <span className="text-xs sm:text-sm text-slate-300 block leading-tight font-medium">
              {t.heroStatsCatalogDesc}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
