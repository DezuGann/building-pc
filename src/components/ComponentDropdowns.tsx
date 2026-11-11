import React from 'react';
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
  CaseType
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
  CheckCircle2,
  AlertCircle,
  Plus,
  RotateCcw
} from 'lucide-react';

interface ComponentDropdownsProps {
  components: SelectedComponents;
  onUpdateComponent: <K extends keyof SelectedComponents>(key: K, value: SelectedComponents[K]) => void;
  onAutoRecommendRemaining?: () => void;
  onResetBuild?: () => void;
}

export const ComponentDropdowns: React.FC<ComponentDropdownsProps> = ({
  components,
  onUpdateComponent,
  onAutoRecommendRemaining,
  onResetBuild
}) => {
  // Helper to determine tower badge color
  const getTowerBadge = (caseType: CaseType) => {
    switch (caseType) {
      case 'mini_tower':
        return { label: 'Mini Tower', color: 'bg-emerald-950 text-emerald-400 border-emerald-500/40' };
      case 'mid_tower':
        return { label: 'Mid Tower', color: 'bg-cyan-950 text-cyan-400 border-cyan-500/40' };
      case 'full_tower':
        return { label: 'Full Tower', color: 'bg-purple-950 text-purple-400 border-purple-500/40' };
    }
  };

  const coreKeys: (keyof SelectedComponents)[] = ['cpu', 'gpu', 'motherboard', 'cooler', 'ram', 'storage', 'psu', 'caseItem'];
  const selectedCount = coreKeys.filter((k) => Boolean(components[k])).length;

  // Multi-storage management: maintain storageDrives array and sync storage (drive 0)
  const currentDrives: StorageDrive[] =
    components.storageDrives && components.storageDrives.length > 0
      ? components.storageDrives
      : components.storage
      ? [components.storage]
      : [];

  const handleDriveChange = (index: number, newDrive: StorageDrive) => {
    const updated = [...currentDrives];
    updated[index] = newDrive;
    onUpdateComponent('storageDrives', updated);
    onUpdateComponent('storage', updated[0]);
  };

  const handleAddDrive = () => {
    // Determine smart default for next drive: if 1 drive exists, suggest SATA SSD; if 2, HDD 3.5"
    let defaultDrive = STORAGE_CATALOG[0];
    if (currentDrives.length === 1) {
      defaultDrive = STORAGE_CATALOG.find((d) => d.driveType === 'SATA SSD') || STORAGE_CATALOG[0];
    } else if (currentDrives.length >= 2) {
      defaultDrive = STORAGE_CATALOG.find((d) => d.driveType === 'HDD') || STORAGE_CATALOG[0];
    }
    const updated = [...currentDrives, defaultDrive];
    onUpdateComponent('storageDrives', updated);
    onUpdateComponent('storage', updated[0]);
  };

  const handleRemoveDrive = (index: number) => {
    const updated = currentDrives.filter((_, i) => i !== index);
    onUpdateComponent('storageDrives', updated.length > 0 ? updated : undefined);
    onUpdateComponent('storage', updated[0] || undefined);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header bar of the list */}
      <div className="flex flex-col gap-1 px-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Configurar Componentes
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 whitespace-nowrap">
              {selectedCount}/8 Piezas
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {onResetBuild && (
              <button
                type="button"
                onClick={onResetBuild}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 text-[11px] font-semibold transition"
                title="Reiniciar todos los componentes"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reiniciar</span>
              </button>
            )}

            {onAutoRecommendRemaining && components.cpu && components.gpu && (
              <button
                onClick={onAutoRecommendRemaining}
                className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded-lg shadow-md shadow-cyan-600/25 transition-all hover:scale-105 active:scale-95"
                title="Auto-seleccionar el resto de piezas equilibradas según tu CPU y GPU"
              >
                <Sparkles className="w-3 h-3 flex-shrink-0" />
                <span>Auto-completar</span>
              </button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Cambia cualquier pieza; el modelo 3D y el diagnóstico se actualizan al instante.
        </p>
      </div>

      {/* 1. CPU (PROCESADOR) */}
      <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 transition-colors shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>PROCESADOR (CPU)</span>
          </label>
          {components.cpu && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {components.cpu.socket} • {components.cpu.tdpWatts}W
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                ${components.cpu.priceUsd} USD
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={components.cpu?.id || ''}
            onChange={(e) => {
              const item = CPUS_CATALOG.find((c) => c.id === e.target.value);
              onUpdateComponent('cpu', item);
            }}
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-200 font-medium transition-colors"
          >
            <option value="">-- Selecciona un Procesador --</option>
            {CPUS_CATALOG.map((c) => (
              <option key={c.id} value={c.id}>
                {c.brand} {c.model} ({c.socket}, {c.cores}C/{c.threads}T, {c.tdpWatts}W)
              </option>
            ))}
          </select>
          {components.cpu && (
            <button
              onClick={() => onUpdateComponent('cpu', undefined)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg border border-slate-800 transition-colors"
              title="Quitar CPU"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {components.cpu && (
          <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
            <span>Boost: <b className="text-slate-200">{components.cpu.boostClockGhz} GHz</b></span>
            <span>Memoria: <b className="text-slate-200">{components.cpu.memoryType}</b></span>
            <span>Pico Máx: <b className="text-slate-200">{components.cpu.maxPowerWatts || components.cpu.tdpWatts}W</b></span>
            <span>Precio ref: <b className="text-emerald-400 font-mono">${components.cpu.priceUsd} USD</b></span>
          </div>
        )}
      </div>

      {/* 2. GPU (TARJETA GRÁFICA) */}
      <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 transition-colors shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Tv className="w-4 h-4 text-cyan-400" />
            <span>TARJETA GRÁFICA (GPU)</span>
          </label>
          {components.gpu && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {components.gpu.vramGb}GB {components.gpu.vramType}
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                ${components.gpu.priceUsd} USD
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={components.gpu?.id || ''}
            onChange={(e) => {
              const item = GPUS_CATALOG.find((g) => g.id === e.target.value);
              onUpdateComponent('gpu', item);
            }}
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-200 font-medium transition-colors"
          >
            <option value="">-- Selecciona una Tarjeta Gráfica --</option>
            {GPUS_CATALOG.map((g) => (
              <option key={g.id} value={g.id}>
                {g.brand} {g.model} ({g.vramGb}GB, {g.tdpWatts}W, {g.lengthMm}mm)
              </option>
            ))}
          </select>
          {components.gpu && (
            <button
              onClick={() => onUpdateComponent('gpu', undefined)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg border border-slate-800 transition-colors"
              title="Quitar GPU"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {components.gpu && (
          <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
            <span>Consumo: <b className="text-slate-200">{components.gpu.tdpWatts}W</b></span>
            <span>Fuente Mínima: <b className="text-slate-200">{components.gpu.recommendedPsuWatts}W</b></span>
            <span>Conector: <b className="text-slate-200">{components.gpu.powerConnectors}</b></span>
            <span>Precio ref: <b className="text-emerald-400 font-mono">${components.gpu.priceUsd} USD</b></span>
          </div>
        )}
      </div>

      {/* 3. MOTHERBOARD (PLACA MADRE) */}
      <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 transition-colors shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>PLACA MADRE (MOTHERBOARD)</span>
          </label>
          {components.motherboard && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {components.motherboard.socket} • {components.motherboard.formFactor}
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                ${components.motherboard.priceUsd} USD
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={components.motherboard?.id || ''}
            onChange={(e) => {
              const item = MOTHERBOARDS_CATALOG.find((m) => m.id === e.target.value);
              onUpdateComponent('motherboard', item);
            }}
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-200 font-medium transition-colors"
          >
            <option value="">-- Selecciona una Placa Madre --</option>
            {MOTHERBOARDS_CATALOG.map((m) => (
              <option key={m.id} value={m.id}>
                {m.brand} {m.model} ({m.socket}, {m.formFactor}, {m.memoryType})
              </option>
            ))}
          </select>
          {components.motherboard && (
            <button
              onClick={() => onUpdateComponent('motherboard', undefined)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg border border-slate-800 transition-colors"
              title="Quitar Placa Madre"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {components.motherboard && (
          <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
            <span>Tipo Memoria: <b className="text-slate-200">{components.motherboard.memoryType}</b></span>
            <span>WiFi: <b className="text-slate-200">{components.motherboard.hasWifi ? 'Sí' : 'No'}</b></span>
            <span>Fases VRM: <b className="text-slate-200">Gama {components.motherboard.vrmQualityTier}</b></span>
            <span>Precio ref: <b className="text-emerald-400 font-mono">${components.motherboard.priceUsd} USD</b></span>
          </div>
        )}
      </div>

      {/* 4. COOLER (DISIPADOR) */}
      <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 transition-colors shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Fan className="w-4 h-4 text-cyan-400" />
            <span>DISIPADOR (COOLER)</span>
          </label>
          {components.cooler && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {components.cooler.coolingType === 'aio_liquid' ? 'Líquida' : 'Aire'}
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                ${components.cooler.priceUsd} USD
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={components.cooler?.id || ''}
            onChange={(e) => {
              const item = COOLERS_CATALOG.find((c) => c.id === e.target.value);
              onUpdateComponent('cooler', item);
            }}
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-200 font-medium transition-colors"
          >
            <option value="">-- Selecciona un Disipador --</option>
            {COOLERS_CATALOG.map((c) => (
              <option key={c.id} value={c.id}>
                {c.brand} {c.model} ({c.coolingType === 'aio_liquid' ? `Líquida ${c.radiatorSizeMm}mm` : `Aire ${c.heightMm}mm`}, hasta {c.maxTdpCoolingCapacity}W)
              </option>
            ))}
          </select>
          {components.cooler && (
            <button
              onClick={() => onUpdateComponent('cooler', undefined)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg border border-slate-800 transition-colors"
              title="Quitar Disipador"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {components.cooler && (
          <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
            <span>Tipo: <b className="text-slate-200">{components.cooler.coolingType === 'aio_liquid' ? 'AIO Líquida' : 'Torre de Aire'}</b></span>
            <span>Disipación: <b className="text-slate-200">Hasta {components.cooler.maxTdpCoolingCapacity}W</b></span>
            <span>Ruido: <b className="text-slate-200">{components.cooler.fanNoiseDb} dB</b></span>
            <span>Precio ref: <b className="text-emerald-400 font-mono">${components.cooler.priceUsd} USD</b></span>
          </div>
        )}
      </div>

      {/* 5. RAM (MEMORIA RAM) */}
      <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 transition-colors shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <CircuitBoard className="w-4 h-4 text-cyan-400" />
            <span>MEMORIA RAM</span>
          </label>
          {components.ram && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {components.ram.memoryType} • {components.ram.capacityGb}GB
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                ${components.ram.priceUsd} USD
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={components.ram?.id || ''}
            onChange={(e) => {
              const item = RAM_CATALOG.find((r) => r.id === e.target.value);
              onUpdateComponent('ram', item);
            }}
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-200 font-medium transition-colors"
          >
            <option value="">-- Selecciona Memoria RAM --</option>
            {RAM_CATALOG.map((r) => (
              <option key={r.id} value={r.id}>
                {r.brand} {r.model} ({r.memoryType}, {r.capacityGb}GB, {r.speedMhz}MHz, CL{r.casLatency})
              </option>
            ))}
          </select>
          {components.ram && (
            <button
              onClick={() => onUpdateComponent('ram', undefined)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg border border-slate-800 transition-colors"
              title="Quitar RAM"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {components.ram && (
          <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
            <span>Latencia: <b className="text-slate-200">CL{components.ram.casLatency}</b></span>
            <span>Módulos: <b className="text-slate-200">{components.ram.modulesCount}x ({components.ram.capacityGb / components.ram.modulesCount}GB c/u)</b></span>
            <span>Velocidad: <b className="text-slate-200">{components.ram.speedMhz} MHz</b></span>
            <span>Precio ref: <b className="text-emerald-400 font-mono">${components.ram.priceUsd} USD</b></span>
          </div>
        )}
      </div>

      {/* 6. STORAGE (ALMACENAMIENTO - MULTI-UNIDADES CON BOTÓN +) */}
      <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 transition-colors shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>ALMACENAMIENTO ({currentDrives.length} {currentDrives.length === 1 ? 'Unidad' : 'Unidades'})</span>
          </label>
          <button
            type="button"
            onClick={handleAddDrive}
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 hover:text-cyan-200 border border-cyan-700/60 rounded-lg text-[11px] font-bold shadow-sm transition hover:scale-105 active:scale-95"
            title="Agregar otra unidad de almacenamiento (SSD NVMe M.2, SATA SSD o HDD 3.5'')"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Agregar Unidad</span>
          </button>
        </div>

        {/* Subdivided Drive Slots */}
        {currentDrives.length === 0 ? (
          <div className="p-3 rounded-lg border border-dashed border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-2">No tienes ninguna unidad de almacenamiento configurada.</p>
            <button
              type="button"
              onClick={handleAddDrive}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Instalar Almacenamiento Principal</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {currentDrives.map((drive, driveIdx) => {
              const isPrimary = driveIdx === 0;
              const typeBadge =
                drive.driveType === 'NVMe M.2'
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50'
                  : drive.driveType === 'SATA SSD'
                  ? 'bg-purple-950/80 text-purple-300 border-purple-700/50'
                  : 'bg-amber-950/80 text-amber-300 border-amber-700/50';

              return (
                <div
                  key={driveIdx}
                  className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800/90 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-200">
                        {isPrimary ? 'Unidad 1 (Principal - Sistema Operativo)' : `Unidad ${driveIdx + 1} (Secundaria - Juegos / Datos)`}
                      </span>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${typeBadge}`}>
                        {drive.driveType} • {drive.capacityGb >= 1000 ? `${drive.capacityGb / 1000}TB` : `${drive.capacityGb}GB`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDrive(driveIdx)}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded border border-slate-800/60 transition"
                      title={isPrimary && currentDrives.length === 1 ? 'Quitar almacenamiento' : 'Eliminar esta unidad'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <select
                    value={drive.id}
                    onChange={(e) => {
                      const item = STORAGE_CATALOG.find((s) => s.id === e.target.value);
                      if (item) handleDriveChange(driveIdx, item);
                    }}
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium transition-colors"
                  >
                    <optgroup label="⚡ SSD NVMe M.2 (PCIe 4.0 / 5.0 - Ultra Rápidos)">
                      {STORAGE_CATALOG.filter((s) => s.driveType === 'NVMe M.2').map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.brand} {s.model} ({s.capacityGb >= 1000 ? `${s.capacityGb / 1000}TB` : `${s.capacityGb}GB`}, {s.readSpeedMbps}MB/s)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="💽 SSD SATA 2.5'' (Almacenamiento Rápido)">
                      {STORAGE_CATALOG.filter((s) => s.driveType === 'SATA SSD').map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.brand} {s.model} ({s.capacityGb >= 1000 ? `${s.capacityGb / 1000}TB` : `${s.capacityGb}GB`}, {s.readSpeedMbps}MB/s)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="💾 Disco Duro Mecánico 3.5'' (HDD Gran Capacidad)">
                      {STORAGE_CATALOG.filter((s) => s.driveType === 'HDD').map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.brand} {s.model} ({s.capacityGb >= 1000 ? `${s.capacityGb / 1000}TB` : `${s.capacityGb}GB`}, {s.readSpeedMbps}MB/s)
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  <div className="mt-1.5 text-[10px] text-slate-400 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                    <span>Velocidad: <b className="text-slate-200">{drive.readSpeedMbps} MB/s</b></span>
                    <span>Formato: <b className="text-slate-200">{drive.formFactor}</b></span>
                    <span>Precio ref: <b className="text-emerald-400 font-mono">${drive.priceUsd} USD</b></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. PSU (FUENTE DE PODER) */}
      <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 transition-colors shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>FUENTE DE PODER (PSU)</span>
          </label>
          {components.psu && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {components.psu.wattage}W • {components.psu.efficiencyRating}
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                ${components.psu.priceUsd} USD
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={components.psu?.id || ''}
            onChange={(e) => {
              const item = PSUS_CATALOG.find((p) => p.id === e.target.value);
              onUpdateComponent('psu', item);
            }}
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-200 font-medium transition-colors"
          >
            <option value="">-- Selecciona una Fuente de Poder --</option>
            {PSUS_CATALOG.map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand} {p.model} ({p.wattage}W, {p.efficiencyRating}, {p.has12VhpwrConnector ? '12VHPWR' : 'PCIe 8-pin'})
              </option>
            ))}
          </select>
          {components.psu && (
            <button
              onClick={() => onUpdateComponent('psu', undefined)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg border border-slate-800 transition-colors"
              title="Quitar Fuente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {components.psu && (
          <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
            <span>Eficiencia: <b className="text-slate-200">{components.psu.efficiencyRating}</b></span>
            <span>Formato: <b className="text-slate-200">{components.psu.formFactor || 'ATX'}</b></span>
            <span>Modular: <b className="text-slate-200">{components.psu.modularity || 'full-modular'}</b></span>
            <span>Precio ref: <b className="text-emerald-400 font-mono">${components.psu.priceUsd} USD</b></span>
          </div>
        )}
      </div>

      {/* 8. CASE (GABINETE: MINI / MID / FULL TOWER) */}
      <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-3 transition-colors shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Box className="w-4 h-4 text-cyan-400" />
            <span>GABINETE (CHASIS)</span>
          </label>
          {components.caseItem && (
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                  getTowerBadge(components.caseItem.caseType).color
                }`}
              >
                {getTowerBadge(components.caseItem.caseType).label}
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                ${components.caseItem.priceUsd} USD
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={components.caseItem?.id || ''}
            onChange={(e) => {
              const item = CASES_CATALOG.find((c) => c.id === e.target.value);
              onUpdateComponent('caseItem', item);
            }}
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-200 font-medium transition-colors"
          >
            <option value="">-- Selecciona un Gabinete --</option>
            {CASES_CATALOG.map((c) => (
              <option key={c.id} value={c.id}>
                {c.brand} {c.model} [{c.caseType === 'mini_tower' ? 'Mini Tower' : c.caseType === 'mid_tower' ? 'Mid Tower' : 'Full Tower'}]
              </option>
            ))}
          </select>
          {components.caseItem && (
            <button
              onClick={() => onUpdateComponent('caseItem', undefined)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg border border-slate-800 transition-colors"
              title="Quitar Gabinete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {components.caseItem && (
          <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
            <span>GPU Máx: <b className="text-slate-200">{components.caseItem.maxGpuLengthMm} mm</b></span>
            <span>Cooler Máx: <b className="text-slate-200">{components.caseItem.maxCoolerHeightMm} mm</b></span>
            <span>Placas: <b className="text-slate-200">{components.caseItem.supportedMotherboards.join(', ')}</b></span>
            <span>Precio ref: <b className="text-emerald-400 font-mono">${components.caseItem.priceUsd} USD</b></span>
          </div>
        )}
      </div>
    </div>
  );
};

