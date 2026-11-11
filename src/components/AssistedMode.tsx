import React, { useState } from 'react';
import { SelectedComponents, CaseType } from '../types/hardware';
import {
  CPUS_CATALOG,
  GPUS_CATALOG,
  MOTHERBOARDS_CATALOG,
  COOLERS_CATALOG,
  RAM_CATALOG,
  STORAGE_CATALOG,
  PSUS_CATALOG,
  CASES_CATALOG
} from '../data/hardwareCatalog';
import {
  Sparkles,
  Cpu,
  Tv,
  Layers,
  Box,
  HardDrive,
  MemoryStick,
  Zap,
  Fan,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sliders,
  Filter,
  List,
  LayoutGrid,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export type GeneralizedTier = 'todas' | 'entrada' | 'media' | 'alta' | 'entusiasta';

export interface PrebuiltPC {
  id: string;
  name: string;
  tagline: string;
  tier: 'entrada' | 'media' | 'alta' | 'entusiasta';
  tierLabel: string;
  targetResolution: '1080p' | '1440p' | '4K';
  badgeColor: string;
  accentBorder: string;
  accentGlow: string;
  featuredNote?: string;
  components: SelectedComponents;
}

interface AssistedModeProps {
  onSelectBuildAndCustomize: (build: SelectedComponents) => void;
}

export const AssistedMode: React.FC<AssistedModeProps> = ({ onSelectBuildAndCustomize }) => {
  const [selectedTierFilter, setSelectedTierFilter] = useState<GeneralizedTier>('todas');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [expandedBuilds, setExpandedBuilds] = useState<{ [id: string]: boolean }>({});

  const toggleExpand = (id: string) => {
    setExpandedBuilds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper safe finder
  const getCpu = (id: string) => CPUS_CATALOG.find((c) => c.id === id)!;
  const getGpu = (id: string) => GPUS_CATALOG.find((g) => g.id === id)!;
  const getMobo = (id: string) => MOTHERBOARDS_CATALOG.find((m) => m.id === id)!;
  const getCooler = (id: string) => COOLERS_CATALOG.find((c) => c.id === id)!;
  const getRam = (id: string) => RAM_CATALOG.find((r) => r.id === id)!;
  const getStorage = (id: string) => STORAGE_CATALOG.find((s) => s.id === id)!;
  const getPsu = (id: string) => PSUS_CATALOG.find((p) => p.id === id)!;
  const getCase = (id: string) => CASES_CATALOG.find((c) => c.id === id)!;

  // Curated Pre-built PCs generalized by Tier, featuring RTX 50 series
  const prebuiltConfigs: PrebuiltPC[] = [
    // 1. GAMA ENTRADA
    {
      id: 'build-entry-esports',
      name: 'Esports Económica 1080p',
      tagline: 'Configuración accesible ideal para Valorant, CS2, Fortnite y League of Legends con máxima fluidez por dólar.',
      tier: 'entrada',
      tierLabel: 'Gama Entrada',
      targetResolution: '1080p',
      badgeColor: 'bg-emerald-950/90 text-emerald-400 border-emerald-500/40',
      accentBorder: 'hover:border-emerald-500/50',
      accentGlow: 'hover:shadow-emerald-950/40',
      featuredNote: 'Excelente precio/calidad',
      components: {
        cpu: getCpu('cpu-r5-5600'),
        gpu: getGpu('gpu-rx-6600'),
        motherboard: getMobo('mobo-asus-prime-b550m-a-wifi'),
        cooler: getCooler('cooler-deepcool-ak400'),
        ram: getRam('ram-corsair-16-3200'),
        storage: getStorage('nvme-crucial-p3-1tb'),
        psu: getPsu('psu-evga-600br'),
        caseItem: getCase('case-ap201-matx')
      }
    },

    // 2. GAMA MEDIA (Con la nueva RTX 5060 Ti 8GB GDDR7)
    {
      id: 'build-mid-rtx5060ti',
      name: 'Gamer Nueva Generación RTX 5060 Ti',
      tagline: 'Arquitectura Blackwell con memoria GDDR7 ultrarrápida, DLSS 4 y trazado de rayos de última generación.',
      tier: 'media',
      tierLabel: 'Gama Media',
      targetResolution: '1440p',
      badgeColor: 'bg-cyan-950/90 text-cyan-400 border-cyan-500/40',
      accentBorder: 'hover:border-cyan-500/50',
      accentGlow: 'hover:shadow-cyan-950/40',
      featuredNote: '🔥 Nueva Serie 5000 (GDDR7)',
      components: {
        cpu: getCpu('cpu-i5-13400f'),
        gpu: getGpu('gpu-rtx-5060-ti-8gb'),
        motherboard: getMobo('mobo-msi-b760-gaming-plus-wifi'),
        cooler: getCooler('cooler-thermalright-peerless-assassin'),
        ram: getRam('ram-kingston-32-5600'),
        storage: getStorage('nvme-kingston-kc3000-1tb'),
        psu: getPsu('psu-corsair-rm750e'),
        caseItem: getCase('case-h5-flow')
      }
    },

    // 3. GAMA MEDIA-ALTA SWEETSPOT (1440P)
    {
      id: 'build-mid-am5-rtx5070',
      name: 'Sweetspot 1440p Ultra (RTX 5070 & AM5)',
      tagline: 'Plataforma AMD AM5 lista para el futuro combinada con la nueva GeForce RTX 5070 de 12GB GDDR7 para 1440p al máximo.',
      tier: 'media',
      tierLabel: 'Gama Media',
      targetResolution: '1440p',
      badgeColor: 'bg-blue-950/90 text-blue-400 border-blue-500/40',
      accentBorder: 'hover:border-blue-500/50',
      accentGlow: 'hover:shadow-blue-950/40',
      featuredNote: '🔥 Serie 5000 + Socket AM5',
      components: {
        cpu: getCpu('cpu-r5-7600'),
        gpu: getGpu('gpu-rtx-5070'),
        motherboard: getMobo('mobo-msi-b650-gaming-plus-wifi'),
        cooler: getCooler('cooler-thermalright-peerless-assassin'),
        ram: getRam('ram-gskill-32-6000'),
        storage: getStorage('nvme-kingston-kc3000-2tb'),
        psu: getPsu('psu-corsair-rm750e'),
        caseItem: getCase('case-h5-flow')
      }
    },

    // 4. GAMA ALTA (Competitivo & 4K con RTX 5080 16GB GDDR7)
    {
      id: 'build-high-rtx5080',
      name: 'Competitivo 240Hz & 4K (RTX 5080)',
      tagline: 'Potencia descomunal con la RTX 5080 de 16GB GDDR7 y el legendario Ryzen 7 7800X3D con 3D V-Cache.',
      tier: 'alta',
      tierLabel: 'Gama Alta',
      targetResolution: '4K',
      badgeColor: 'bg-purple-950/90 text-purple-300 border-purple-500/40',
      accentBorder: 'hover:border-purple-500/50',
      accentGlow: 'hover:shadow-purple-950/40',
      featuredNote: '⚡ Rendimiento 4K Puro',
      components: {
        cpu: getCpu('cpu-r7-7800x3d'),
        gpu: getGpu('gpu-rtx-5080'),
        motherboard: getMobo('mobo-asus-rog-x670e-f'),
        cooler: getCooler('cooler-arctic-liquid-iii-240'),
        ram: getRam('ram-gskill-trident-32-6000'),
        storage: getStorage('nvme-samsung-990pro-2tb'),
        psu: getPsu('psu-corsair-rm850x'),
        caseItem: getCase('case-lancool-216')
      }
    },

    // 5. GAMA ENTUSIASTA & EXTREMA (RTX 5090 32GB GDDR7 + 9800X3D)
    {
      id: 'build-enthusiast-rtx5090',
      name: 'Titán Extremo 4K / IA (RTX 5090 32GB & 9800X3D)',
      tagline: 'La cúspide del hardware mundial: procesador Ryzen 7 9800X3D (Zen 5 3D) y la bestial RTX 5090 de 32GB GDDR7 con refrigeración 360mm.',
      tier: 'entusiasta',
      tierLabel: 'Gama Entusiasta',
      targetResolution: '4K',
      badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-500/40',
      accentBorder: 'hover:border-amber-500/50',
      accentGlow: 'hover:shadow-amber-950/40',
      featuredNote: '👑 Máximo Ecosistema Mundial',
      components: {
        cpu: getCpu('cpu-r7-9800x3d'),
        gpu: getGpu('gpu-rtx-5090'),
        motherboard: getMobo('mobo-asus-rog-x670e-f'),
        cooler: getCooler('cooler-nzxt-kraken-360'),
        ram: getRam('ram-corsair-64-6000'),
        storage: getStorage('nvme-samsung-990pro-4tb'),
        psu: getPsu('psu-bequiet-darkpower-1200'),
        caseItem: getCase('case-o11-evo-xl')
      }
    }
  ];

  const filteredBuilds = prebuiltConfigs.filter((build) => {
    if (selectedTierFilter === 'todas') return true;
    return build.tier === selectedTierFilter;
  });

  return (
    <div className="space-y-6">
      {/* Control Banner: Title, Tier Filters & View Toggle */}
      <div className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Equipos Armados por Gama • Actualizado con Serie RTX 5000
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Configuraciones Curadas
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Equipos optimizados 100% compatibles sin cuello de botella. Puedes ver la lista completa de piezas y cargarlas en el <strong>Taller 3D</strong> para modificar cualquier componente.
            </p>
          </div>

          {/* View Mode Switcher (List vs Grid) */}
          <div className="flex items-center self-start md:self-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Vista Lista</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Vista Cuadrícula</span>
            </button>
          </div>
        </div>

        {/* Generalized Tiers Filter Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">Filtrar Gama:</span>
          </div>
          {[
            { id: 'todas', label: 'Todas las Gamas' },
            { id: 'entrada', label: 'Gama Entrada' },
            { id: 'media', label: 'Gama Media (RTX 5060 / 5070)' },
            { id: 'alta', label: 'Gama Alta (RTX 5080)' },
            { id: 'entusiasta', label: 'Gama Entusiasta (RTX 5090)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTierFilter(tab.id as GeneralizedTier)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTierFilter === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. LIST VIEW (VISTA LISTA - PRIMARY / RECOMENDADA)       */}
      {/* ========================================================= */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredBuilds.map((build) => {
            const isExpanded = Boolean(expandedBuilds[build.id]);
            const totalPrice = Object.values(build.components).reduce(
              (sum, item) => sum + (item?.priceUsd || 0),
              0
            );
            const totalTdp =
              (build.components.cpu?.maxPowerWatts || 0) +
              (build.components.gpu?.tdpWatts || 0) +
              60;

            return (
              <div
                key={build.id}
                className={`bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl transition-all duration-200 overflow-hidden ${build.accentBorder} ${build.accentGlow}`}
              >
                {/* Main Horizontal Row */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Tiers, Name & Purpose */}
                  <div className="lg:w-1/3 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${build.badgeColor}`}>
                        {build.tierLabel}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-semibold">
                        🎯 {build.targetResolution}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 font-semibold uppercase">
                        {build.components.caseItem?.caseType.replace('_', ' ')}
                      </span>
                      {build.featuredNote && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {build.featuredNote}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {build.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {build.tagline}
                    </p>
                  </div>

                  {/* Center Column: Clean Key Hardware Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:w-5/12 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                    {/* CPU */}
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-cyan-400" /> CPU
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate block mt-0.5" title={build.components.cpu?.model}>
                        {build.components.cpu?.model}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {build.components.cpu?.cores}C/{build.components.cpu?.threads}T
                      </span>
                    </div>

                    {/* GPU */}
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                        <Tv className="w-3 h-3 text-purple-400" /> GPU
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate block mt-0.5" title={build.components.gpu?.model}>
                        {build.components.gpu?.model}
                      </span>
                      <span className="text-[10px] text-purple-300 font-mono">
                        {build.components.gpu?.vramGb}GB {build.components.gpu?.vramType}
                      </span>
                    </div>

                    {/* RAM */}
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                        <MemoryStick className="w-3 h-3 text-blue-400" /> RAM
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate block mt-0.5">
                        {build.components.ram?.capacityGb}GB
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {build.components.ram?.speedMhz}MHz
                      </span>
                    </div>

                    {/* Storage */}
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-emerald-400" /> SSD NVMe
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate block mt-0.5">
                        {build.components.storage?.capacityGb ? `${build.components.storage.capacityGb / 1000}TB` : '1TB'}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Gen4 PCIe
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Price & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 lg:w-1/4">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Presupuesto
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white">${totalPrice}</span>
                        <span className="text-[11px] text-slate-400">USD</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">~{totalTdp}W Pico</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(build.id)}
                        className={`p-2 rounded-xl border text-xs font-semibold transition ${
                          isExpanded
                            ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                        title="Ver lista de componentes"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => onSelectBuildAndCustomize(build.components)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition group"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-950 transition-transform group-hover:rotate-45" />
                        <span className="whitespace-nowrap">Personalizar en 3D</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-950 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed 8-Component List */}
                {isExpanded && (
                  <div className="bg-slate-950/90 border-t border-slate-800 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" /> Desglose Completo (8 Componentes 100% Compatibles)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Haz clic en &quot;Personalizar en 3D&quot; para modificar cualquiera de estas piezas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* 1. CPU */}
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">1. Procesador (CPU)</span>
                        <span className="font-bold text-white block mt-0.5">{build.components.cpu?.brand} {build.components.cpu?.model}</span>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>{build.components.cpu?.socket} • {build.components.cpu?.tdpWatts}W</span>
                          <span className="font-semibold text-cyan-300">${build.components.cpu?.priceUsd}</span>
                        </div>
                      </div>

                      {/* 2. GPU */}
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">2. Tarjeta Gráfica (GPU)</span>
                        <span className="font-bold text-white block mt-0.5">{build.components.gpu?.brand} {build.components.gpu?.model}</span>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>{build.components.gpu?.vramGb}GB {build.components.gpu?.vramType}</span>
                          <span className="font-semibold text-purple-300">${build.components.gpu?.priceUsd}</span>
                        </div>
                      </div>

                      {/* 3. Motherboard */}
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">3. Placa Madre</span>
                        <span className="font-bold text-white block mt-0.5 truncate" title={build.components.motherboard?.model}>
                          {build.components.motherboard?.model}
                        </span>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>{build.components.motherboard?.formFactor}</span>
                          <span className="font-semibold text-blue-300">${build.components.motherboard?.priceUsd}</span>
                        </div>
                      </div>

                      {/* 4. Cooler */}
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">4. Disipador</span>
                        <span className="font-bold text-white block mt-0.5 truncate" title={build.components.cooler?.model}>
                          {build.components.cooler?.model}
                        </span>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>{build.components.cooler?.coolingType === 'aio_liquid' ? 'Líquida AIO' : 'Aire de Torre'}</span>
                          <span className="font-semibold text-cyan-300">${build.components.cooler?.priceUsd}</span>
                        </div>
                      </div>

                      {/* 5. RAM */}
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">5. Memoria RAM</span>
                        <span className="font-bold text-white block mt-0.5 truncate">
                          {build.components.ram?.brand} {build.components.ram?.capacityGb}GB
                        </span>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>{build.components.ram?.speedMhz}MHz</span>
                          <span className="font-semibold text-emerald-300">${build.components.ram?.priceUsd}</span>
                        </div>
                      </div>

                      {/* 6. Storage */}
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">6. Almacenamiento SSD</span>
                        <span className="font-bold text-white block mt-0.5 truncate">
                          {build.components.storage?.brand} {build.components.storage?.model}
                        </span>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>NVMe M.2 Gen4</span>
                          <span className="font-semibold text-amber-300">${build.components.storage?.priceUsd}</span>
                        </div>
                      </div>

                      {/* 7. PSU */}
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">7. Fuente de Poder (PSU)</span>
                        <span className="font-bold text-white block mt-0.5 truncate">
                          {build.components.psu?.model}
                        </span>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>{build.components.psu?.wattage}W {build.components.psu?.efficiencyRating}</span>
                          <span className="font-semibold text-yellow-300">${build.components.psu?.priceUsd}</span>
                        </div>
                      </div>

                      {/* 8. Case */}
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">8. Gabinete (Torre)</span>
                        <span className="font-bold text-white block mt-0.5 truncate">
                          {build.components.caseItem?.model}
                        </span>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span className="uppercase">{build.components.caseItem?.caseType.replace('_', ' ')}</span>
                          <span className="font-semibold text-indigo-300">${build.components.caseItem?.priceUsd}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================= */
        /* 2. GRID VIEW (VISTA CUADRÍCULA OPCIONAL)                 */
        /* ========================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuilds.map((build) => {
            const totalPrice = Object.values(build.components).reduce(
              (sum, item) => sum + (item?.priceUsd || 0),
              0
            );
            return (
              <div
                key={build.id}
                className={`bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl transition-all duration-200 flex flex-col justify-between ${build.accentBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${build.badgeColor}`}>
                      {build.tierLabel}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-semibold">
                      🎯 {build.targetResolution}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">{build.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{build.tagline}</p>

                  <div className="space-y-2 mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU:</span>
                      <span className="font-bold text-slate-200 truncate max-w-[170px]">{build.components.cpu?.model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5"><Tv className="w-3.5 h-3.5 text-purple-400" /> GPU:</span>
                      <span className="font-bold text-slate-200 truncate max-w-[170px]">{build.components.gpu?.model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5"><MemoryStick className="w-3.5 h-3.5 text-blue-400" /> RAM:</span>
                      <span className="font-bold text-slate-200">{build.components.ram?.capacityGb}GB {build.components.ram?.speedMhz}MHz</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-lg font-black text-white">${totalPrice} <span className="text-xs font-normal text-slate-400">USD</span></span>
                  <button
                    onClick={() => onSelectBuildAndCustomize(build.components)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                  >
                    <span>Personalizar en 3D</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
