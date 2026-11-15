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
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">

        {/* Brand */}
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={onReset}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold flex-shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              {t.brandName}
            </span>
          </div>
        </div>

        {/* Controls: Mode Selector & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Mode Selector Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setMode('free')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                mode === 'free'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.modeWorkshop}</span>
            </button>

            <button
              onClick={() => setMode('assisted')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                mode === 'assisted'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.modePrebuilt}</span>
            </button>
          </div>

          {/* Global Language Switcher (ES / EN) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            <div className="pl-1.5 pr-1 text-slate-500">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <button
              onClick={() => setLang('es')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'es'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Cambiar idioma a Español"
            >
              ES
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'en'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
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
