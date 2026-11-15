import React from 'react';
import { CPU, GPU, Motherboard, Cooler, RAMModule, StorageDrive, PowerSupply, Case } from '../types/hardware';

interface ComponentImageThumbnailProps {
  type: 'cpu' | 'gpu' | 'motherboard' | 'cooler' | 'ram' | 'storage' | 'psu' | 'caseItem';
  item?: CPU | GPU | Motherboard | Cooler | RAMModule | StorageDrive | PowerSupply | Case;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ComponentImageThumbnail: React.FC<ComponentImageThumbnailProps> = ({
  type,
  item,
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-10 h-10 min-w-[2.5rem]',
    md: 'w-14 h-14 min-w-[3.5rem]',
    lg: 'w-20 h-20 min-w-[5rem]'
  };

  const currentSizeClass = sizeMap[size];

  // ==========================================
  // 1. CPU RENDER (AMD Ryzen or Intel Core)
  // ==========================================
  if (type === 'cpu') {
    const isAmd = item ? (item as CPU).brand === 'AMD' : true;
    const model = item ? (item as CPU).model : 'Ryzen 7 9800X3D';
    const isX3D = model.includes('X3D');

    return (
      <div className={`relative ${currentSizeClass} rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center p-1 shadow-inner group ${className}`}>
        {isAmd ? (
          // AMD Ryzen Box & Chip Visual
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="amdBoxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="amdOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff5722" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="heatSpreader" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="60%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
            {/* Box Body */}
            <rect x="10" y="10" width="80" height="80" rx="8" fill="url(#amdBoxGrad)" stroke="#334155" strokeWidth="2" />
            {/* Orange Corner Accent */}
            <path d="M 60 10 L 90 10 L 90 40 Z" fill="url(#amdOrange)" />
            {/* Inner Metallic IHS (Integrated Heat Spreader) */}
            <rect x="24" y="24" width="52" height="52" rx="4" fill="url(#heatSpreader)" stroke="#475569" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="16" fill="none" stroke="#ea580c" strokeWidth="3" opacity="0.9" />
            <path d="M 40 45 L 60 45 L 50 62 Z" fill="#f97316" />
            {/* CPU Brand text */}
            <text x="50" y="86" textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="900" fontFamily="system-ui">
              RYZEN
            </text>
            {isX3D && (
              <rect x="28" y="70" width="44" height="7" rx="2" fill="#ef4444" />
            )}
            {isX3D && (
              <text x="50" y="76" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">3D V-CACHE</text>
            )}
          </svg>
        ) : (
          // Intel Core Box & Chip Visual
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="intelBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="50%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#075985" />
              </linearGradient>
              <linearGradient id="intelSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
            <rect x="10" y="10" width="80" height="80" rx="8" fill="url(#intelBlue)" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Intel Hologram facet */}
            <path d="M 12 12 L 45 12 L 12 45 Z" fill="#38bdf8" opacity="0.4" />
            <rect x="25" y="25" width="50" height="50" rx="4" fill="url(#intelSilver)" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="50" y="48" textAnchor="middle" fill="#0369a1" fontSize="13" fontWeight="900" fontFamily="sans-serif">
              intel
            </text>
            <text x="50" y="64" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="800">
              CORE
            </text>
          </svg>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. GPU RENDER (Triple Fan Graphics Card)
  // ==========================================
  if (type === 'gpu') {
    const isNvidia = item ? (item as GPU).brand === 'NVIDIA' : true;

    return (
      <div className={`relative ${currentSizeClass} rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center p-1 shadow-inner group ${className}`}>
        <svg viewBox="0 0 120 70" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="gpuShroud" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="fanRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="geforceGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>

          {/* GPU Shroud Chassis */}
          <rect x="5" y="10" width="110" height="50" rx="6" fill="url(#gpuShroud)" stroke="#475569" strokeWidth="1.5" />
          
          {/* Top LED Bar (Cyan or Geforce Green) */}
          <rect x="15" y="12" width="90" height="4" rx="2" fill={isNvidia ? 'url(#fanRim)' : '#ef4444'} opacity="0.9" />

          {/* Fan 1 */}
          <circle cx="28" cy="36" r="16" fill="#090d16" stroke="url(#fanRim)" strokeWidth="1.8" />
          <circle cx="28" cy="36" r="5" fill="#475569" />
          {/* Fan 1 blades */}
          <line x1="28" y1="23" x2="28" y2="49" stroke="#334155" strokeWidth="2" />
          <line x1="15" y1="36" x2="41" y2="36" stroke="#334155" strokeWidth="2" />

          {/* Fan 2 (Center) */}
          <circle cx="60" cy="36" r="16" fill="#090d16" stroke="url(#fanRim)" strokeWidth="1.8" />
          <circle cx="60" cy="36" r="5" fill="#475569" />
          <line x1="60" y1="23" x2="60" y2="49" stroke="#334155" strokeWidth="2" />
          <line x1="47" y1="36" x2="73" y2="36" stroke="#334155" strokeWidth="2" />

          {/* Fan 3 */}
          <circle cx="92" cy="36" r="16" fill="#090d16" stroke="url(#fanRim)" strokeWidth="1.8" />
          <circle cx="92" cy="36" r="5" fill="#475569" />
          <line x1="92" y1="23" x2="92" y2="49" stroke="#334155" strokeWidth="2" />
          <line x1="79" y1="36" x2="105" y2="36" stroke="#334155" strokeWidth="2" />

          {/* PCIe Connector gold teeth at bottom */}
          <rect x="25" y="60" width="45" height="3" fill="#eab308" />
        </svg>
      </div>
    );
  }

  // ==========================================
  // 3. MOTHERBOARD RENDER (Placa Madre)
  // ==========================================
  if (type === 'motherboard') {
    return (
      <div className={`relative ${currentSizeClass} rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center p-1 shadow-inner group ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* PCB Board */}
          <rect x="10" y="10" width="80" height="80" rx="4" fill="#0a0f1d" stroke="#334155" strokeWidth="1.5" />
          {/* Circuit lines */}
          <path d="M 20 20 L 40 20 L 45 25 L 45 40" stroke="#00f0ff" strokeWidth="0.8" opacity="0.4" fill="none" />
          <path d="M 75 75 L 55 75 L 50 70 L 50 55" stroke="#38bdf8" strokeWidth="0.8" opacity="0.4" fill="none" />
          
          {/* CPU Socket in upper-center */}
          <rect x="36" y="24" width="28" height="28" rx="2" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.2" />
          <rect x="42" y="30" width="16" height="16" rx="1" fill="#475569" />

          {/* VRM Heatsinks with Titanium Finish */}
          <rect x="16" y="20" width="15" height="36" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <rect x="34" y="16" width="32" height="6" rx="1" fill="#334155" stroke="#64748b" strokeWidth="1" />

          {/* RAM Slots (4 vertical bars) */}
          <rect x="69" y="22" width="3" height="32" fill="#1e293b" stroke="#00f0ff" strokeWidth="0.8" />
          <rect x="74" y="22" width="3" height="32" fill="#1e293b" stroke="#00f0ff" strokeWidth="0.8" />
          <rect x="79" y="22" width="3" height="32" fill="#1e293b" stroke="#64748b" strokeWidth="0.6" />
          <rect x="84" y="22" width="3" height="32" fill="#1e293b" stroke="#64748b" strokeWidth="0.6" />

          {/* PCIe Reinforced Steel Slot */}
          <rect x="20" y="62" width="60" height="6" rx="1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
          <rect x="22" y="64" width="56" height="2" fill="#020617" />

          {/* M.2 Heatsink Shield */}
          <rect x="30" y="73" width="42" height="11" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <text x="51" y="81" textAnchor="middle" fill="#00f0ff" fontSize="5" fontWeight="bold">M.2 NVMe</text>
        </svg>
      </div>
    );
  }

  // ==========================================
  // 4. RAM MODULES RENDER (DDR5 Dual RGB Sticks)
  // ==========================================
  if (type === 'ram') {
    return (
      <div className={`relative ${currentSizeClass} rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center p-1 shadow-inner group ${className}`}>
        <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="ramRgb" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Stick 1 (Back) */}
          <rect x="15" y="15" width="70" height="32" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          {/* Top RGB Light Bar */}
          <rect x="15" y="15" width="70" height="6" rx="2" fill="url(#ramRgb)" />
          {/* Gold pins */}
          <rect x="22" y="47" width="56" height="3" fill="#eab308" />

          {/* Stick 2 (Front) */}
          <rect x="20" y="28" width="70" height="34" rx="3" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />
          {/* Top RGB Light Bar */}
          <rect x="20" y="28" width="70" height="6" rx="2" fill="url(#ramRgb)" />
          {/* Aluminum Heatspreader Cutouts */}
          <path d="M 35 40 L 45 40 L 50 48 L 40 48 Z" fill="#334155" />
          <path d="M 60 40 L 70 40 L 75 48 L 65 48 Z" fill="#334155" />
          {/* Gold pins */}
          <rect x="27" y="62" width="56" height="3" fill="#eab308" />
        </svg>
      </div>
    );
  }

  // ==========================================
  // 5. COOLER RENDER (Liquid AIO or Air Tower)
  // ==========================================
  if (type === 'cooler') {
    const isLiquid = item ? (item as Cooler).coolingType === 'aio_liquid' : true;

    return (
      <div className={`relative ${currentSizeClass} rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center p-1 shadow-inner group ${className}`}>
        {isLiquid ? (
          // Liquid AIO with Radiator, Tubes & Infinity Mirror Pump
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Top 360 Radiator */}
            <rect x="10" y="12" width="80" height="20" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {/* 3 Radiator Fans */}
            <circle cx="25" cy="22" r="7" fill="#090d16" stroke="#00f0ff" strokeWidth="1" />
            <circle cx="50" cy="22" r="7" fill="#090d16" stroke="#00f0ff" strokeWidth="1" />
            <circle cx="75" cy="22" r="7" fill="#090d16" stroke="#00f0ff" strokeWidth="1" />

            {/* Braided Coolant Tubes */}
            <path d="M 30 32 Q 25 55 45 68" stroke="#334155" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 40 32 Q 35 52 52 68" stroke="#475569" strokeWidth="3.5" fill="none" strokeLinecap="round" />

            {/* Infinity Mirror CPU Pump Block */}
            <circle cx="58" cy="72" r="18" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="58" cy="72" r="14" fill="#020617" stroke="#00f0ff" strokeWidth="1.8" />
            <circle cx="58" cy="72" r="9" fill="#090d16" stroke="#38bdf8" strokeWidth="1.2" />
            <circle cx="58" cy="72" r="4" fill="#00f0ff" />
          </svg>
        ) : (
          // Air Cooler: Twin Tower with Heatpipes & Fan
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Copper Base */}
            <rect x="35" y="78" width="30" height="8" rx="2" fill="#d97706" />
            {/* Heatpipes */}
            <line x1="42" y1="78" x2="42" y2="25" stroke="#b45309" strokeWidth="2.5" />
            <line x1="58" y1="78" x2="58" y2="25" stroke="#b45309" strokeWidth="2.5" />
            {/* Aluminum Fin Stack */}
            <rect x="25" y="24" width="50" height="50" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            {/* Horizontal cooling fins */}
            <line x1="26" y1="34" x2="74" y2="34" stroke="#475569" strokeWidth="1" />
            <line x1="26" y1="44" x2="74" y2="44" stroke="#475569" strokeWidth="1" />
            <line x1="26" y1="54" x2="74" y2="54" stroke="#475569" strokeWidth="1" />
            <line x1="26" y1="64" x2="74" y2="64" stroke="#475569" strokeWidth="1" />
            {/* Front Fan */}
            <circle cx="50" cy="49" r="18" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.5" />
            <circle cx="50" cy="49" r="6" fill="#475569" />
          </svg>
        )}
      </div>
    );
  }

  // ==========================================
  // 6. STORAGE RENDER (M.2 NVMe SSD)
  // ==========================================
  if (type === 'storage') {
    return (
      <div className={`relative ${currentSizeClass} rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center p-1 shadow-inner group ${className}`}>
        <svg viewBox="0 0 110 50" className="w-full h-full drop-shadow-md">
          {/* M.2 2280 PCB Stick */}
          <rect x="8" y="12" width="94" height="26" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
          
          {/* Aluminum Grooved Heatsink */}
          <rect x="18" y="14" width="70" height="22" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <line x1="25" y1="18" x2="80" y2="18" stroke="#334155" strokeWidth="1" />
          <line x1="25" y1="25" x2="80" y2="25" stroke="#334155" strokeWidth="1" />
          <line x1="25" y1="32" x2="80" y2="32" stroke="#334155" strokeWidth="1" />

          {/* Model badge */}
          <text x="52" y="27" textAnchor="middle" fill="#00f0ff" fontSize="6" fontWeight="bold">
            990 PRO NVMe
          </text>

          {/* Gold Connector Pins */}
          <rect x="8" y="19" width="4" height="12" fill="#eab308" />
          {/* Screw Mounting Notch */}
          <circle cx="102" cy="25" r="3" fill="#020617" stroke="#475569" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  // ==========================================
  // 7. PSU RENDER (Power Supply Modular)
  // ==========================================
  if (type === 'psu') {
    return (
      <div className={`relative ${currentSizeClass} rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center p-1 shadow-inner group ${className}`}>
        <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-md">
          {/* Metal Housing */}
          <rect x="12" y="12" width="76" height="56" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
          {/* Honeycomb fan intake */}
          <circle cx="50" cy="40" r="22" fill="#020617" stroke="#64748b" strokeWidth="1.2" />
          <circle cx="50" cy="40" r="7" fill="#334155" />
          <line x1="50" y1="20" x2="50" y2="60" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="30" y1="40" x2="70" y2="40" stroke="#1e293b" strokeWidth="1.5" />
          {/* 80 Plus Gold Badge */}
          <rect x="64" y="16" width="20" height="9" rx="1.5" fill="#ca8a04" />
          <text x="74" y="23" textAnchor="middle" fill="#ffffff" fontSize="5" fontWeight="900">80+ GOLD</text>
        </svg>
      </div>
    );
  }

  // ==========================================
  // 8. CASE RENDER (Gabinete Panorámico Acuario)
  // ==========================================
  return (
    <div className={`relative ${currentSizeClass} rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center p-1 shadow-inner group ${className}`}>
      <svg viewBox="0 0 80 100" className="w-full h-full drop-shadow-md">
        {/* Chassis Frame */}
        <rect x="12" y="10" width="56" height="80" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
        {/* Panoramic Tempered Glass Window */}
        <rect x="16" y="14" width="48" height="58" rx="3" fill="#020617" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" opacity="0.8" />
        {/* Glass Reflection Shimmer */}
        <line x1="20" y1="16" x2="54" y2="68" stroke="#38bdf8" strokeWidth="1" opacity="0.3" />
        {/* Lower PSU Shroud */}
        <rect x="16" y="74" width="48" height="12" rx="2" fill="#1e293b" />
        {/* Front I/O Port / Power Button */}
        <circle cx="60" cy="79" r="1.5" fill="#00f0ff" />
        {/* Interior Illuminated Fans */}
        <circle cx="32" cy="30" r="7" fill="none" stroke="#00f0ff" strokeWidth="1.2" />
        <circle cx="32" cy="48" r="7" fill="none" stroke="#00f0ff" strokeWidth="1.2" />
      </svg>
    </div>
  );
};
