import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  SelectedComponents,
  CPU,
  GPU,
  Motherboard,
  Cooler,
  RAMModule,
  StorageDrive,
  PowerSupply,
  Case,
  CaseType,
  SocketType
} from '../types/hardware';
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
import { ComponentImageThumbnail } from './ComponentImageThumbnail';
import {
  Cpu,
  Tv,
  Layers,
  Fan,
  CircuitBoard,
  HardDrive,
  Zap,
  Box,
  Trash2,
  Sparkles,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';

export type ComponentCategoryKey =
  | 'caseItem'
  | 'cpu'
  | 'motherboard'
  | 'gpu'
  | 'ram'
  | 'cooler'
  | 'storage'
  | 'psu';

interface BuildPartsPanelProps {
  components: SelectedComponents;
  onUpdateComponent: <K extends keyof SelectedComponents>(key: K, value: SelectedComponents[K]) => void;
  onAutoRecommendRemaining?: () => void;
  onResetBuild?: () => void;
}

export const BuildPartsPanel: React.FC<BuildPartsPanelProps> = ({
  components,
  onUpdateComponent,
  onAutoRecommendRemaining,
  onResetBuild
}) => {
  const { t } = useLanguage();
  
  // In-place picker state: null means overview list, category key means picker window is open in this same spot
  const [activePicker, setActivePicker] = useState<ComponentCategoryKey | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterSocket, setFilterSocket] = useState<string>('all');

  const selectedCount = (['caseItem', 'cpu', 'motherboard', 'gpu', 'ram', 'cooler', 'storage', 'psu'] as ComponentCategoryKey[]).filter(
    (k) => Boolean(components[k])
  ).length;

  const openPicker = (category: ComponentCategoryKey) => {
    setActivePicker(category);
    setSearchQuery('');
    setFilterBrand('all');
    setFilterSocket('all');
  };

  const closePicker = () => {
    setActivePicker(null);
    setSearchQuery('');
  };

  // Check simple live compatibility for picker items against the currently selected build
  const checkCompatibility = (type: ComponentCategoryKey, item: any): { ok: boolean; reason?: string } => {
    if (type === 'cpu') {
      const cpu = item as CPU;
      if (components.motherboard && components.motherboard.socket !== cpu.socket) {
        return { ok: false, reason: `Incompatible: Requiere placa socket ${cpu.socket} (Tienes ${components.motherboard.socket})` };
      }
      return { ok: true };
    }

    if (type === 'motherboard') {
      const mobo = item as Motherboard;
      if (components.cpu && components.cpu.socket !== mobo.socket) {
        return { ok: false, reason: `Incompatible con tu CPU ${components.cpu.brand} (Socket ${components.cpu.socket})` };
      }
      if (components.ram && components.ram.memoryType !== mobo.memoryType) {
        return { ok: false, reason: `Incompatible con tu memoria ${components.ram.memoryType}` };
      }
      return { ok: true };
    }

    if (type === 'ram') {
      const ram = item as RAMModule;
      if (components.motherboard && components.motherboard.memoryType !== ram.memoryType) {
        return { ok: false, reason: `Tu placa solo admite memorias ${components.motherboard.memoryType}` };
      }
      return { ok: true };
    }

    if (type === 'cooler') {
      const cooler = item as Cooler;
      if (components.cpu && !cooler.supportedSockets.includes(components.cpu.socket)) {
        return { ok: false, reason: `No incluye anclaje para socket ${components.cpu.socket}` };
      }
      return { ok: true };
    }

    if (type === 'gpu') {
      const gpu = item as GPU;
      if (components.caseItem && gpu.lengthMm > components.caseItem.maxGpuLengthMm) {
        return { ok: false, reason: `Longitud (${gpu.lengthMm}mm) excede el gabinete (${components.caseItem.maxGpuLengthMm}mm)` };
      }
      return { ok: true };
    }

    return { ok: true };
  };

  // Filter items in active picker
  const filteredCatalog = useMemo(() => {
    if (!activePicker) return [];

    let list: any[] = [];
    if (activePicker === 'caseItem') list = CASES_CATALOG;
    if (activePicker === 'cpu') list = CPUS_CATALOG;
    if (activePicker === 'motherboard') list = MOTHERBOARDS_CATALOG;
    if (activePicker === 'gpu') list = GPUS_CATALOG;
    if (activePicker === 'ram') list = RAM_CATALOG;
    if (activePicker === 'cooler') list = COOLERS_CATALOG;
    if (activePicker === 'storage') list = STORAGE_CATALOG;
    if (activePicker === 'psu') list = PSUS_CATALOG;

    return list.filter((item) => {
      // Search text query
      const fullText = `${item.brand} ${item.model} ${item.socket || ''} ${item.memoryType || ''} ${item.vramGb ? `${item.vramGb}GB` : ''} ${item.wattage ? `${item.wattage}W` : ''}`.toLowerCase();
      if (searchQuery && !fullText.includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Brand filter
      if (filterBrand !== 'all' && item.brand !== filterBrand) {
        return false;
      }

      // Socket filter for CPU / Motherboard
      if (filterSocket !== 'all' && (item.socket !== filterSocket)) {
        return false;
      }

      return true;
    });
  }, [activePicker, searchQuery, filterBrand, filterSocket]);

  // Available brands for filter tabs in active picker
  const availableBrands = useMemo(() => {
    if (!activePicker) return [];
    let list: any[] = [];
    if (activePicker === 'caseItem') list = CASES_CATALOG;
    if (activePicker === 'cpu') list = CPUS_CATALOG;
    if (activePicker === 'motherboard') list = MOTHERBOARDS_CATALOG;
    if (activePicker === 'gpu') list = GPUS_CATALOG;
    if (activePicker === 'ram') list = RAM_CATALOG;
    if (activePicker === 'cooler') list = COOLERS_CATALOG;
    if (activePicker === 'storage') list = STORAGE_CATALOG;
    if (activePicker === 'psu') list = PSUS_CATALOG;

    const brands = Array.from(new Set(list.map((i) => i.brand)));
    return ['all', ...brands];
  }, [activePicker]);

  // Helper titles and icons
  const categoryMeta: Record<
    ComponentCategoryKey,
    { title: string; icon: React.FC<{ className?: string }> }
  > = {
    caseItem: { title: 'Gabinete (Case)', icon: Box },
    cpu: { title: 'Procesador (CPU)', icon: Cpu },
    motherboard: { title: 'Placa Madre (Motherboard)', icon: Layers },
    gpu: { title: 'Tarjeta Gráfica (GPU)', icon: Tv },
    ram: { title: 'Memoria RAM', icon: CircuitBoard },
    cooler: { title: 'Disipador (Cooler)', icon: Fan },
    storage: { title: 'Almacenamiento (Storage)', icon: HardDrive },
    psu: { title: 'Fuente de Poder (PSU)', icon: Zap }
  };

  // =========================================================================
  // RENDER: VISTA 2 - VENTANA DE SELECCIÓN Y SUGERENCIAS (IN-PLACE PICKER)
  // =========================================================================
  if (activePicker) {
    const meta = categoryMeta[activePicker];
    const Icon = meta.icon;

    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col h-full min-h-[580px] max-h-[820px] transition-all duration-300">
        {/* Top Header bar with Back button */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <button
            onClick={closePicker}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Volver a la lista</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-0.5 rounded-full">
              {filteredCatalog.length} disponibles
            </span>
          </div>
        </div>

        {/* Title and Active Category indicator */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/80 text-cyan-400 shadow-sm">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">{meta.title}</h3>
            <p className="text-[11px] text-slate-400">Selecciona el modelo ideal para tu ensamble</p>
          </div>
        </div>

        {/* Search input with sleek titanium styling and cyan focus */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar por modelo, marca o especificación...`}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
          />
        </div>

        {/* Filter Pills (Brands & Sockets) */}
        {availableBrands.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
            {availableBrands.map((b) => (
              <button
                key={b}
                onClick={() => setFilterBrand(b)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                  filterBrand === b
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {b === 'all' ? 'Todas las marcas' : b}
              </button>
            ))}
          </div>
        )}

        {/* List of Component Suggestions with Referential Images */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 no-scrollbar">
          {filteredCatalog.map((item: any) => {
            const isCurrent = components[activePicker]?.id === item.id;
            const compat = checkCompatibility(activePicker, item);

            return (
              <div
                key={item.id}
                onClick={() => {
                  onUpdateComponent(activePicker, item);
                  closePicker();
                }}
                className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 hover:bg-slate-850/80 border-slate-800/90 hover:border-slate-600'
                }`}
              >
                {/* Left: Referential Hardware Thumbnail */}
                <div className="flex items-center gap-3 min-w-0">
                  <ComponentImageThumbnail
                    type={activePicker}
                    item={item}
                    size="md"
                    className="flex-shrink-0"
                  />

                  {/* Middle: Name, Specs & Compatibility */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        {item.brand}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded">
                          Instalado
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {item.model}
                    </h4>

                    {/* Technical details badge */}
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                      {item.socket && <span>Socket {item.socket}</span>}
                      {item.cores && <span>• {item.cores}C/{item.threads}T</span>}
                      {item.vramGb && <span>• {item.vramGb}GB {item.vramType}</span>}
                      {item.capacityGb && <span>• {item.capacityGb >= 1000 ? `${item.capacityGb / 1000}TB` : `${item.capacityGb}GB`}</span>}
                      {item.wattage && <span>• {item.wattage}W {item.efficiencyRating}</span>}
                      {item.tdpWatts && <span>• {item.tdpWatts}W</span>}
                    </div>

                    {/* Real-time compatibility notice */}
                    <div className="mt-1 flex items-center gap-1 text-[10px]">
                      {compat.ok ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>100% Compatible</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{compat.reason}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Price & Selection Button */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-xs font-mono font-black text-slate-100 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                    ${item.priceUsd} <span className="text-[9px] text-slate-400 font-normal">USD</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateComponent(activePicker, item);
                      closePicker();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 shadow-sm'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Elegido</span>
                      </>
                    ) : (
                      <span>Elegir</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: VISTA 1 - LISTA PRINCIPAL DE COMPONENTES DEL ENSAMBLE (ESTILO BUILDCORES)
  // =========================================================================
  const slots: { key: ComponentCategoryKey; title: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'caseItem', title: 'Gabinete (Case)', icon: Box },
    { key: 'cpu', title: 'Procesador (CPU)', icon: Cpu },
    { key: 'motherboard', title: 'Placa Madre (Motherboard)', icon: Layers },
    { key: 'gpu', title: 'Tarjeta Gráfica (GPU)', icon: Tv },
    { key: 'ram', title: 'Memoria RAM', icon: CircuitBoard },
    { key: 'cooler', title: 'Disipador (Cooler)', icon: Fan },
    { key: 'storage', title: 'Almacenamiento (SSD / NVMe)', icon: HardDrive },
    { key: 'psu', title: 'Fuente de Poder (PSU)', icon: Zap }
  ];

  return (
    <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
      {/* Top Header of Parts List */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs 2xl:text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>Piezas del Ensamble</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                {selectedCount}/8
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onResetBuild && (
            <button
              onClick={onResetBuild}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="Reiniciar ensamble"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {onAutoRecommendRemaining && components.cpu && components.gpu && selectedCount < 8 && (
            <button
              onClick={onAutoRecommendRemaining}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 text-[11px] font-bold flex items-center gap-1 shadow-sm transition"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-completar</span>
            </button>
          )}
        </div>
      </div>

      {/* Component Slots (BuildCores Modular Design) */}
      <div className="space-y-2">
        {slots.map(({ key, title, icon: Icon }) => {
          const item = components[key] as any;

          if (!item) {
            // EMPTY SLOT -> Sleek "+ Agregar [Componente]" button
            return (
              <div
                key={key}
                onClick={() => openPicker(key)}
                className="group border border-dashed border-slate-800 hover:border-cyan-500/60 bg-slate-950/40 hover:bg-slate-900/60 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-cyan-400 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                    {title}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openPicker(key);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 group-hover:bg-cyan-500 text-slate-300 group-hover:text-slate-950 text-xs font-bold transition flex items-center gap-1 border border-slate-700/60 group-hover:border-cyan-400"
                >
                  <span>+ Agregar</span>
                </button>
              </div>
            );
          }

          // SELECTED COMPONENT SLOT -> Thumbnail, Model name, Specs, Price and Actions
          return (
            <div
              key={key}
              className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Referential Image */}
                <div
                  onClick={() => openPicker(key)}
                  className="cursor-pointer transition-transform group-hover:scale-105 flex-shrink-0"
                  title="Clic para cambiar componente"
                >
                  <ComponentImageThumbnail type={key} item={item} size="sm" />
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      {item.brand}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate">
                      • {title.split(' ')[0]}
                    </span>
                  </div>

                  <h4
                    onClick={() => openPicker(key)}
                    className="text-xs font-bold text-white truncate cursor-pointer hover:text-cyan-300 transition-colors"
                  >
                    {item.model}
                  </h4>

                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.socket && <span>{item.socket} </span>}
                    {item.cores && <span>• {item.cores}C/{item.threads}T </span>}
                    {item.vramGb && <span>• {item.vramGb}GB {item.vramType} </span>}
                    {item.capacityGb && <span>• {item.capacityGb >= 1000 ? `${item.capacityGb / 1000}TB` : `${item.capacityGb}GB`} </span>}
                    {item.wattage && <span>• {item.wattage}W </span>}
                  </div>
                </div>
              </div>

              {/* Right: Price & Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-mono font-bold text-slate-100 bg-slate-850 px-2 py-0.5 rounded border border-slate-700/80">
                  ${item.priceUsd} <span className="text-[9px] text-slate-400 font-normal">USD</span>
                </span>

                <button
                  onClick={() => openPicker(key)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 transition"
                  title="Cambiar componente"
                >
                  Cambiar
                </button>

                <button
                  onClick={() => onUpdateComponent(key, undefined)}
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
                  title="Quitar de este ensamble"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
