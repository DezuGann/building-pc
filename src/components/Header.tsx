import React from 'react';
import { Cpu, Sparkles, Sliders, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  mode: 'assisted' | 'free';
  setMode: (mode: 'assisted' | 'free') => void;
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  onReset
}) => {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-[1720px] 2xl:max-w-[1980px] mx-auto px-4 sm:px-8 lg:px-14 2xl:px-20 py-3 flex flex-wrap items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 text-white font-bold flex-shrink-0 border border-cyan-400/40">
            <Cpu className="w-5 h-5 2xl:w-6 2xl:h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl 2xl:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              {t.brandName}
            </span>
          </div>
        </div>

        {/* Controls: Mode Selector & Language Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
          {/* Mode Selector Tabs */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
            <button
              onClick={() => setMode('free')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 2xl:px-4 2xl:py-2 rounded-lg text-xs sm:text-sm 2xl:text-base font-semibold transition-all duration-200 ${
                mode === 'free'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
              <span>{t.modeWorkshop}</span>
            </button>

            <button
              onClick={() => setMode('assisted')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 2xl:px-4 2xl:py-2 rounded-lg text-xs sm:text-sm 2xl:text-base font-semibold transition-all duration-200 ${
                mode === 'assisted'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
              <span>{t.modePrebuilt}</span>
            </button>
          </div>

          {/* Global Language Switcher (ES / EN) */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
            <div className="pl-1.5 pr-1 text-slate-400">
              <Globe className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
            </div>
            <button
              onClick={() => setLang('es')}
              className={`px-2.5 py-1 2xl:px-3 2xl:py-1.5 rounded-lg text-xs 2xl:text-sm font-bold transition-all ${
                lang === 'es'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Cambiar idioma a Español"
            >
              ES
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 2xl:px-3 2xl:py-1.5 rounded-lg text-xs 2xl:text-sm font-bold transition-all ${
                lang === 'en'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Switch language to English"
            >
              EN
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
