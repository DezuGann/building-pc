import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Cpu, CircuitBoard, HardDrive, Fan, Zap, Layers, ShieldCheck, Box } from 'lucide-react';

interface HardwareShowcaseItem {
  name: string;
  category: string;
  spec: string;
  icon: React.ReactNode;
  accent: string;
}

const SHOWCASE_ITEMS: HardwareShowcaseItem[] = [
  {
    name: 'AMD Ryzen 7 9800X3D',
    category: 'CPU GAMING',
    spec: '8 Cores • 16 Threads • 96MB 3D V-Cache',
    icon: <Cpu className="w-5 h-5" />,
    accent: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/40',
  },
  {
    name: 'NVIDIA GeForce RTX 5090',
    category: 'GPU TITAN',
    spec: '32GB GDDR7 • 512-bit • DLSS 4 AI',
    icon: <Zap className="w-5 h-5" />,
    accent: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/40',
  },
  {
    name: 'ASUS ROG Crosshair X870E HERO',
    category: 'MOTHERBOARD',
    spec: 'PCIe 5.0 • WiFi 7 • Dual USB4',
    icon: <CircuitBoard className="w-5 h-5" />,
    accent: 'border-purple-500/50 text-purple-400 bg-purple-950/40',
  },
  {
    name: 'G.Skill Trident Z5 RGB 64GB',
    category: 'RAM DDR5',
    spec: 'DDR5-6000 MT/s • CL30 • Dual Channel',
    icon: <Layers className="w-5 h-5" />,
    accent: 'border-rose-500/50 text-rose-400 bg-rose-950/40',
  },
  {
    name: 'Samsung 990 PRO 2TB',
    category: 'NVMe Gen4 SSD',
    spec: '7450 MB/s Lectura • Heatsink Integrado',
    icon: <HardDrive className="w-5 h-5" />,
    accent: 'border-blue-500/50 text-blue-400 bg-blue-950/40',
  },
  {
    name: 'Lian Li Galahad II LCD 360',
    category: 'AIO COOLER',
    spec: 'Radiador 360mm • Pantalla IPS LCD 2.88"',
    icon: <Fan className="w-5 h-5" />,
    accent: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/40',
  },
  {
    name: 'Seasonic Vertex GX-1000W',
    category: 'PSU ATX 3.0',
    spec: '80+ Gold • 12V-2x6 Nativo • Full Modular',
    icon: <ShieldCheck className="w-5 h-5" />,
    accent: 'border-amber-500/50 text-amber-400 bg-amber-950/40',
  },
  {
    name: 'Lian Li O11 Vision Chrome',
    category: 'GABINETE DUAL',
    spec: 'Triple Cristal Templado • Cámara Dual',
    icon: <Box className="w-5 h-5" />,
    accent: 'border-indigo-500/50 text-indigo-400 bg-indigo-950/40',
  },
];

export const ComponentShowcaseRibbon: React.FC = () => {
  const { t } = useLanguage();
  const [scrollOffset, setScrollOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            // Calculate progress relative to viewport
            const progress = (windowHeight - rect.top) * 0.45;
            setScrollOffset(progress);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Double items for infinite marquee illusion
  const items = [...SHOWCASE_ITEMS, ...SHOWCASE_ITEMS];

  return (
    <section ref={containerRef} className="relative w-full py-8 overflow-hidden border-y border-slate-800/80 bg-slate-950/50 backdrop-blur-sm">
      {/* Section Header */}
      <div className="max-w-[1720px] 2xl:max-w-[1980px] mx-auto px-4 sm:px-8 lg:px-14 2xl:px-20 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00f0ff]" />
          <h3 className="text-xs 2xl:text-sm font-mono font-bold uppercase tracking-widest text-slate-200">
            {t.showcaseTitle}
          </h3>
        </div>
        <p className="text-[11px] 2xl:text-xs text-slate-400 font-mono">
          {t.showcaseSubtitle}
        </p>
      </div>

      {/* Dynamic Right-to-Left Scroll Conveyor Track */}
      <div className="relative w-full overflow-hidden">
        {/* Soft Left & Right Fade Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#07090e] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#07090e] to-transparent z-10 pointer-events-none" />

        {/* Moving items strip with Right-to-Left glide */}
        <div
          className="flex items-center gap-5 will-change-transform transition-transform duration-100 ease-out py-3"
          style={{
            transform: `translateX(-${scrollOffset % 1800}px)`,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-72 sm:w-84 2xl:w-96 rounded-2xl p-4 2xl:p-5 bg-gradient-to-br from-slate-800/85 via-slate-900/90 to-slate-950/95 border border-slate-700/70 hover:border-cyan-400/60 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] 2xl:text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
                  {item.category}
                </span>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-700/80 text-cyan-300 shadow-inner">
                  {item.icon}
                </div>
              </div>
              <h4 className="text-sm 2xl:text-base font-bold text-white tracking-tight truncate mb-1">
                {item.name}
              </h4>
              <p className="text-[11px] 2xl:text-xs text-slate-300/80 truncate font-mono">
                {item.spec}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

