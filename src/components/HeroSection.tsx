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
    <section className="relative w-full min-h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-4.5rem)] max-h-[1150px] flex items-center justify-center overflow-hidden px-fluid-layout py-4 lg:py-0">
      {/* Fondo de Estudio Atmosférico con Viñeta Suave */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Resplandor de Neón Ambiental tras la PC */}
        <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        {/* Cuadrícula sutil cibernética */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b814_1px,transparent_1px)] [background-size:36px_36px] opacity-40" />
      </div>

      {/* Grid de 2 Columnas Autoajustable: Texto a la Izquierda y PC Completa a la Derecha */}
      <div className="relative z-10 w-full max-w-[min(94vw,2200px)] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-14 items-center">
        
        {/* COLUMNA IZQUIERDA: Textos, Botones y Métricas (Siempre visible y sin cortes) */}
        <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-center items-start text-left space-y-[clamp(0.65rem,1.8vh,1.75rem)]">
          
          {/* Título Principal - Escalado fluido proporcional a alto y ancho */}
          <h1 className="text-fluid-title font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            <span className="text-metallic-silver">{t.heroTitlePrefix} </span>
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.45)]">
              {t.heroTitleHighlight}
            </span>
            <br />
            <span className="text-slate-200 font-extrabold">{t.heroTitleSuffix}</span>
          </h1>

          {/* Subtítulo amigable y natural */}
          <p className="text-fluid-subtitle text-slate-200/90 max-w-xl xl:max-w-2xl font-normal leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
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

          {/* Estadísticas Clave (Con altura adaptativa para que no se corten) */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-4 sm:pt-6 border-t border-slate-800/80 w-full max-w-lg">
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

        {/* COLUMNA DERECHA: Imagen de la PC Completa sin ningún corte */}
        <div className="lg:col-span-5 xl:col-span-6 flex items-center justify-center lg:justify-end h-full">
          <div className="relative group max-w-full">
            <img
              src="/assets/hero-pc-gamer.jpg"
              alt="Custom PC Gaming Rig Complete View"
              className="max-h-[clamp(320px,68vh,680px)] w-auto max-w-full object-contain rounded-2xl drop-shadow-[0_25px_60px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-102"
              loading="eager"
            />
          </div>
        </div>

      </div>
    </section>
  );
};
