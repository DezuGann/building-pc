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
    <section className="relative w-full min-h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-4.5rem)] max-h-[1150px] flex items-center justify-start overflow-hidden px-fluid-layout py-8 lg:py-0">
      {/* 1. Imagen Panorámica 16:9 de la PC Gamer Extendida en Todo el Espacio de la Portada */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <img
          src="/assets/hero-pc-gamer.jpg"
          alt="Custom PC Gamer Panoramic Studio Background"
          className="w-full h-full object-cover object-center scale-100"
          loading="eager"
        />

        {/* Gradiente cinematográfico: Oscuridad suave en el tercio izquierdo para texto nítido, dejando la PC descubierta a la derecha */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/95 via-[#07090e]/75 sm:via-[#07090e]/50 to-transparent" />

        {/* Transiciones suaves superior e inferior para conectar con el Header y el humo fluido continuo */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#07090e] via-[#07090e]/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#07090e] via-[#07090e]/85 to-transparent" />
      </div>

      {/* 2. Contenido Textual Anclado a la Izquierda sobre el Espacio del Estudio */}
      <div className="relative z-10 w-full max-w-[min(94vw,2200px)] mx-auto">
        <div className="w-full max-w-xl xl:max-w-2xl 2xl:max-w-3xl flex flex-col justify-center items-start text-left space-y-[clamp(0.65rem,1.8vh,1.75rem)]">
          
          {/* Título Principal */}
          <h1 className="text-fluid-title font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
            <span className="text-metallic-silver">{t.heroTitlePrefix} </span>
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.45)]">
              {t.heroTitleHighlight}
            </span>
            <br />
            <span className="text-slate-200 font-extrabold">{t.heroTitleSuffix}</span>
          </h1>

          {/* Subtítulo natural y amigable */}
          <p className="text-fluid-subtitle text-slate-200 font-normal leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            {t.heroDescription}
          </p>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 pt-0.5">
            <button
              onClick={onExploreClick}
              className="group flex items-center gap-2.5 sm:gap-3 px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm 2xl:text-base tracking-wide shadow-2xl shadow-cyan-500/30 transition-all duration-300 hover:scale-105 active:scale-95 border border-cyan-300/60"
            >
              <Box className="w-4 h-4 2xl:w-5 2xl:h-5 text-slate-950 transition-transform group-hover:rotate-12" />
              <span>{t.heroCTAStart}</span>
              <ArrowDown className="w-4 h-4 2xl:w-5 2xl:h-5 text-slate-950 transition-transform group-hover:translate-y-1" />
            </button>

            <button
              onClick={onPrebuiltClick}
              className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-400/60 text-xs sm:text-sm 2xl:text-base font-bold backdrop-blur-md transition-all duration-200 shadow-xl shadow-black/50"
            >
              <Sparkles className="w-4 h-4 2xl:w-5 2xl:h-5 text-cyan-400" />
              <span>{t.heroCTAPrebuilt}</span>
            </button>
          </div>

          {/* Estadísticas Clave */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-4 sm:pt-6 border-t border-slate-700/60 w-full max-w-lg">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-fluid-stat font-black text-white font-mono block drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {t.heroStatsFPS}
              </span>
              <span className="text-[11px] sm:text-xs 2xl:text-sm text-slate-300 block leading-tight font-medium">
                {t.heroStatsFPSDesc}
              </span>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-fluid-stat font-black text-cyan-400 font-mono block drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                {t.heroStatsAccuracy}
              </span>
              <span className="text-[11px] sm:text-xs 2xl:text-sm text-slate-300 block leading-tight font-medium">
                {t.heroStatsAccuracyDesc}
              </span>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-fluid-stat font-black text-purple-400 font-mono block drop-shadow-[0_0_15px_rgba(192,132,252,0.4)]">
                {t.heroStatsCatalog}
              </span>
              <span className="text-[11px] sm:text-xs 2xl:text-sm text-slate-300 block leading-tight font-medium">
                {t.heroStatsCatalogDesc}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
