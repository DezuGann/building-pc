import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SelectedComponents, Resolution, CaseType } from './types/hardware';
import {
  CPUS_CATALOG,
  GPUS_CATALOG,
  MOTHERBOARDS_CATALOG,
  COOLERS_CATALOG,
  PSUS_CATALOG,
  CASES_CATALOG,
  RAM_CATALOG,
  STORAGE_CATALOG
} from './data/hardwareCatalog';
import { calculateBottleneck, validateCompatibility, generateAssistedBuild } from './services/engine';
import { initPricingEngine, syncComponentPrices } from './services/pricingService';
import { Header } from './components/Header';
import { BottleneckCard } from './components/BottleneckCard';
import { PowerCard } from './components/PowerCard';
import { CompatibilityList } from './components/CompatibilityList';
import { PCViewer3D } from './components/PCViewer3D';
import { ComponentDropdowns } from './components/ComponentDropdowns';
import { CaseAdvisor } from './components/CaseAdvisor';
import { AssistedMode } from './components/AssistedMode';
import { AtmosphereBackground } from './components/AtmosphereBackground';
import { SkeletonCockpit } from './components/SkeletonCockpit';
import { IncompatibilityToastContainer, IncompatibilityNotification } from './components/IncompatibilityToast';
import { Copy, Check, Play, Sparkles, SlidersHorizontal, Layers, Cpu, Tv, ArrowLeft, Box, Activity } from 'lucide-react';

export function App() {
  const [mode, setMode] = useState<'assisted' | 'free'>('free');
  const [resolution, setResolution] = useState<Resolution>('1440p');
  const [copied, setCopied] = useState(false);
  const [isVisualLoading, setIsVisualLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<'3d' | 'components' | 'diagnostics' | 'all'>('3d');

  // Initial visual skeleton feed loading effect (~0.9s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisualLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  // Initialize with balanced default preset: Ryzen 5 7600 + RTX 5060 Ti 8GB
  const [components, setComponents] = useState<SelectedComponents>(() => {
    const defaultCpu = CPUS_CATALOG.find((c) => c.id === 'cpu-r5-7600')!;
    const defaultGpu = GPUS_CATALOG.find((g) => g.id === 'gpu-rtx-5060-ti-8gb')!;
    const { recommended } = generateAssistedBuild(defaultCpu, defaultGpu);
    return {
      cpu: defaultCpu,
      gpu: defaultGpu,
      ...recommended
    };
  });

  // Silently initialize live market pricing engine in the background
  useEffect(() => {
    initPricingEngine((freshPrices) => {
      setComponents((prev) => syncComponentPrices(prev, freshPrices));
    });
  }, []);

  // Calculate real-time bottleneck
  const bottleneckEvaluation = useMemo(() => {
    if (components.cpu && components.gpu) {
      return calculateBottleneck(components.cpu, components.gpu, resolution, components.ram);
    }
    return undefined;
  }, [components.cpu, components.gpu, resolution, components.ram]);

  // Real-time compatibility checks
  const compatibilityChecks = useMemo(() => {
    return validateCompatibility(components);
  }, [components]);

  const compatibilityCount = useMemo(() => {
    return {
      passed: compatibilityChecks.filter((c) => c.status === 'passed').length,
      warnings: compatibilityChecks.filter((c) => c.status === 'warning').length,
      failed: compatibilityChecks.filter((c) => c.status === 'failed').length
    };
  }, [compatibilityChecks]);

  // Toast notifications for detected critical incompatibilities
  const [incompatibilityToasts, setIncompatibilityToasts] = useState<IncompatibilityNotification[]>([]);
  const prevFailedKeysRef = useRef<string[]>([]);

  useEffect(() => {
    const failedChecks = compatibilityChecks.filter((c) => c.status === 'failed');
    const currentFailKeys = failedChecks.map((c) => `${c.id}::${c.details}`);

    // If resolved, remove toast
    setIncompatibilityToasts((prev) =>
      prev.filter((t) => failedChecks.some((c) => c.id === t.checkId))
    );

    // Trigger toast for any newly failed check or newly changed incompatibility details
    failedChecks.forEach((check) => {
      const key = `${check.id}::${check.details}`;
      if (!prevFailedKeysRef.current.includes(key)) {
        setIncompatibilityToasts((prev) => {
          const filtered = prev.filter((t) => t.checkId !== check.id);
          return [
            ...filtered,
            {
              id: `${check.id}-${Date.now()}`,
              checkId: check.id,
              title: check.title,
              details: check.details,
              duration: 5500,
            },
          ];
        });
      }
    });

    prevFailedKeysRef.current = currentFailKeys;
  }, [compatibilityChecks]);

  const handleDismissToast = (toastId: string) => {
    setIncompatibilityToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  // Helper to update a specific component from dropdowns
  const handleUpdateComponent = <K extends keyof SelectedComponents>(
    key: K,
    value: SelectedComponents[K]
  ) => {
    setComponents((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSelectCaseType = (type: CaseType) => {
    const matchCase = CASES_CATALOG.find((c) => c.caseType === type);
    if (matchCase) {
      handleUpdateComponent('caseItem', matchCase);
    }
  };

  // Auto recommend remaining parts when CPU and GPU are present
  const handleAutoRecommendRemaining = () => {
    if (components.cpu && components.gpu) {
      const { recommended } = generateAssistedBuild(components.cpu, components.gpu);
      setComponents((prev) => ({
        ...prev,
        ...recommended
      }));
    }
  };

  // Quick Preset Scenarios for instant testing
  const loadScenario = (type: 'balanced' | 'budget' | 'bottleneck_cpu' | 'extreme' | 'rtx5090') => {
    if (type === 'budget') {
      const cpu = CPUS_CATALOG.find((c) => c.id === 'cpu-r5-5600')!;
      const gpu = GPUS_CATALOG.find((g) => g.id === 'gpu-rx-6600')!;
      const { recommended } = generateAssistedBuild(cpu, gpu);
      setComponents({ cpu, gpu, ...recommended });
    } else if (type === 'balanced') {
      const cpu = CPUS_CATALOG.find((c) => c.id === 'cpu-i5-13400f')!;
      const gpu = GPUS_CATALOG.find((g) => g.id === 'gpu-rtx-5060')!;
      const { recommended } = generateAssistedBuild(cpu, gpu);
      setComponents({ cpu, gpu, ...recommended });
    } else if (type === 'extreme') {
      const cpu = CPUS_CATALOG.find((c) => c.id === 'cpu-r7-7800x3d')!;
      const gpu = GPUS_CATALOG.find((g) => g.id === 'gpu-rtx-5080')!;
      const { recommended } = generateAssistedBuild(cpu, gpu);
      setComponents({ cpu, gpu, ...recommended });
    } else if (type === 'rtx5090') {
      const cpu = CPUS_CATALOG.find((c) => c.id === 'cpu-r7-9800x3d')!;
      const gpu = GPUS_CATALOG.find((g) => g.id === 'gpu-rtx-5090')!;
      const { recommended } = generateAssistedBuild(cpu, gpu);
      setComponents({ cpu, gpu, ...recommended });
    } else if (type === 'bottleneck_cpu') {
      const cpu = CPUS_CATALOG.find((c) => c.id === 'cpu-i3-12100f')!;
      const gpu = GPUS_CATALOG.find((g) => g.id === 'gpu-rtx-5090')!;
      const { recommended } = generateAssistedBuild(cpu, gpu);
      setComponents({ cpu, gpu, ...recommended });
    }
  };

  const resetBuild = () => {
    setComponents({});
  };

  // Safe Multi-drive reference
  const drives = useMemo(() => {
    return components.storageDrives && components.storageDrives.length > 0
      ? components.storageDrives
      : components.storage
      ? [components.storage]
      : [];
  }, [components.storageDrives, components.storage]);

  const totalCost = useMemo(() => {
    const storageCost = drives.reduce((sum, d) => sum + (d?.priceUsd || 0), 0);
    const baseCost =
      (components.cpu?.priceUsd || 0) +
      (components.gpu?.priceUsd || 0) +
      (components.motherboard?.priceUsd || 0) +
      (components.cooler?.priceUsd || 0) +
      (components.ram?.priceUsd || 0) +
      (components.psu?.priceUsd || 0) +
      (components.caseItem?.priceUsd || 0);
    return baseCost + storageCost;
  }, [components, drives]);

  const copyBuildSummary = () => {
    const lines = [
      '🛠️ PRESUPUESTO Y ENSAMBLE - PC BUILDER 3D',
      '==================================================',
      `• Procesador: ${components.cpu ? `${components.cpu.brand} ${components.cpu.model} ($${components.cpu.priceUsd} USD)` : 'No seleccionado'}`,
      `• Tarjeta Gráfica: ${components.gpu ? `${components.gpu.brand} ${components.gpu.model} ($${components.gpu.priceUsd} USD)` : 'No seleccionada'}`,
      `• Placa Madre: ${components.motherboard ? `${components.motherboard.brand} ${components.motherboard.model} ($${components.motherboard.priceUsd} USD)` : 'No seleccionada'}`,
      `• Disipador: ${components.cooler ? `${components.cooler.brand} ${components.cooler.model} ($${components.cooler.priceUsd} USD)` : 'No seleccionado'}`,
      `• Memoria RAM: ${components.ram ? `${components.ram.brand} ${components.ram.model} ($${components.ram.priceUsd} USD)` : 'No seleccionada'}`,
      `• Almacenamiento: ${drives.length > 0 ? drives.map((d) => `${d.brand} ${d.model} ($${d.priceUsd} USD)`).join(', ') : 'No seleccionado'}`,
      `• Fuente de Poder: ${components.psu ? `${components.psu.brand} ${components.psu.model} ($${components.psu.priceUsd} USD)` : 'No seleccionada'}`,
      `• Gabinete: ${components.caseItem ? `${components.caseItem.brand} ${components.caseItem.model} ($${components.caseItem.priceUsd} USD)` : 'No seleccionado'}`,
      '--------------------------------------------------',
      `• Balance / Cuello de Botella: ${bottleneckEvaluation ? `${bottleneckEvaluation.percentage}% (${bottleneckEvaluation.limitingComponent})` : 'N/A'}`,
      `• Compatibilidad: ${compatibilityCount.failed === 0 ? '100% Compatible' : `${compatibilityCount.failed} Incompatibilidades`}`,
      `• Costo Estimado: $${totalCost} USD`
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelectBuildFromAssisted = (newComponents: SelectedComponents) => {
    setComponents(newComponents);
    setMode('free');
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 lg:h-screen lg:overflow-hidden">
      {/* Floating Red Incompatibility Toast Alerts in Upper Right Corner */}
      <IncompatibilityToastContainer
        notifications={incompatibilityToasts}
        onDismiss={handleDismissToast}
      />

      {/* Hardware-Accelerated Dynamic Grey Metallic Fluid Smoke & Light Shafts */}
      <AtmosphereBackground />

      {/* Header */}
      <Header
        mode={mode}
        setMode={setMode}
        onReset={resetBuild}
      />

      {/* When in Assisted Mode: Show Mosaic Grid of Prebuilt PCs */}
      {mode === 'assisted' ? (
        <main className="relative z-10 max-w-[1700px] mx-auto px-3 sm:px-4 lg:px-6 py-6 flex-1 w-full lg:overflow-y-auto">
          <AssistedMode onSelectBuildAndCustomize={handleSelectBuildFromAssisted} />
        </main>
      ) : (
        <div className="relative z-10 flex-1 flex flex-col min-h-0 lg:overflow-hidden">
          {/* Preset quick test buttons & Resolution Bar for 3D Workshop */}
          <div className="bg-slate-900/60 border-b border-cyan-500/20 px-3 sm:px-4 py-2 flex-shrink-0">
            <div className="max-w-[1750px] mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-400 overflow-hidden">
                <button
                  onClick={() => setMode('assisted')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/80 transition font-semibold flex-shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ir a Equipos Armados</span>
                </button>
                <div className="h-4 w-px bg-slate-800 mx-1 hidden md:block" />
                <Play className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="font-semibold text-slate-300 hidden sm:inline flex-shrink-0">Pruebas:</span>

                {/* Horizontal touch scrollable carousel for test presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap py-0.5 flex-1 max-w-full">
                  <button
                    onClick={() => loadScenario('budget')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition whitespace-nowrap flex-shrink-0 text-xs"
                  >
                    💵 Económico <span className="hidden md:inline">(R5 5600 + RX 6600)</span>
                  </button>
                  <button
                    onClick={() => loadScenario('balanced')}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/50 hover:bg-cyan-900/60 text-cyan-300 transition whitespace-nowrap flex-shrink-0 text-xs"
                  >
                    🔥 Gama Media <span className="hidden md:inline">(i5-13400F + RTX 5060)</span>
                  </button>
                  <button
                    onClick={() => loadScenario('extreme')}
                    className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/50 hover:bg-purple-900/60 text-purple-300 transition whitespace-nowrap flex-shrink-0 text-xs"
                  >
                    ⚡ Gama Alta <span className="hidden md:inline">(7800X3D + RTX 5080)</span>
                  </button>
                  <button
                    onClick={() => loadScenario('rtx5090')}
                    className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/50 hover:bg-amber-900/60 text-amber-300 transition font-bold whitespace-nowrap flex-shrink-0 text-xs"
                  >
                    👑 Titán 4K <span className="hidden md:inline">(9800X3D + RTX 5090)</span>
                  </button>
                  <button
                    onClick={() => loadScenario('bottleneck_cpu')}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/40 text-rose-300 transition whitespace-nowrap flex-shrink-0 text-xs"
                  >
                    ⚠️ Cuello Botella
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs flex-shrink-0 pt-1 sm:pt-0 border-t border-slate-800/60 sm:border-t-0">
                <span className="text-slate-400 font-medium">Resolución:</span>
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  {(['1080p', '1440p', '4k'] as Resolution[]).map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase transition-colors ${
                        resolution === res
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Facebook-style Visual Skeleton Load or Active Cockpit */}
          {isVisualLoading ? (
            <SkeletonCockpit />
          ) : (
            <main className="max-w-[1750px] mx-auto px-3 sm:px-4 lg:px-6 py-3 flex-1 w-full min-h-0 lg:overflow-hidden flex flex-col">
              {/* Mobile Navigation Tabs for real smartphones (< lg) */}
              <div className="lg:hidden bg-slate-900/95 border-b border-slate-800 p-2 mb-3 rounded-2xl flex items-center justify-between gap-1 shadow-md">
                <button
                  onClick={() => setMobileTab('3d')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    mobileTab === '3d'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Visor 3D</span>
                </button>

                <button
                  onClick={() => setMobileTab('components')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    mobileTab === 'components'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Piezas</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 font-mono">
                    {Object.values(components).filter(Boolean).length}/8
                  </span>
                </button>

                <button
                  onClick={() => setMobileTab('diagnostics')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition relative ${
                    mobileTab === 'diagnostics'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Diagnóstico</span>
                  {compatibilityCount.failed > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-400/50 animate-ping absolute top-1 right-1" />
                  )}
                </button>

                <button
                  onClick={() => setMobileTab('all')}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${
                    mobileTab === 'all'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Ver todo en scroll corrido"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Todo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1 min-h-0">
              
              {/* COLUMN 1: LEFT COMPONENT DROPDOWNS (Independently scrollable - Extended width for full visibility) */}
              <div className={`lg:col-span-5 xl:col-span-5 2xl:col-span-4 lg:h-full lg:overflow-y-auto pr-1.5 space-y-3 ${
                mobileTab === 'components' || mobileTab === 'all' ? 'block' : 'max-lg:hidden'
              }`}>
                <ComponentDropdowns
                  components={components}
                  onUpdateComponent={handleUpdateComponent}
                  onAutoRecommendRemaining={handleAutoRecommendRemaining}
                  onResetBuild={resetBuild}
                />
              </div>

              {/* COLUMN 2: CENTER HARDWARE-ACCELERATED 3D VIEWER (Static & Always in View) */}
              <div className={`lg:col-span-4 xl:col-span-4 2xl:col-span-5 lg:h-full flex flex-col justify-start lg:justify-between gap-3 overflow-hidden ${
                mobileTab === '3d' || mobileTab === 'all' ? 'flex' : 'max-lg:hidden'
              }`}>
                <div className="h-[380px] sm:h-[440px] lg:flex-1 lg:min-h-[380px] w-full rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30 flex-shrink-0 lg:flex-shrink">
                  <PCViewer3D components={components} />
                </div>

                {/* Price & Summary quick strip under 3D */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 shadow-lg">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Presupuesto Estimado</span>
                    <span className="text-xl font-black text-white">${totalCost} <span className="text-xs text-slate-400 font-normal">USD</span></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetBuild}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                    >
                      Limpiar Todo
                    </button>
                    <button
                      onClick={copyBuildSummary}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? '¡Copiado!' : 'Copiar Configuración'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* COLUMN 3: RIGHT DIAGNOSTICS & ADVISOR (Independently scrollable) */}
              <div className={`lg:col-span-3 xl:col-span-3 lg:h-full lg:overflow-y-auto pr-1.5 space-y-3.5 ${
                mobileTab === 'diagnostics' || mobileTab === 'all' ? 'block' : 'max-lg:hidden'
              }`}>
                {/* Case Advisor (Mini / Mid / Full Tower) */}
                <CaseAdvisor 
                  components={components} 
                  onSelectRecommendedCase={handleSelectCaseType} 
                />

                {/* Bottleneck Card */}
                <BottleneckCard
                  evaluation={bottleneckEvaluation}
                  resolution={resolution}
                  setResolution={setResolution}
                  hasCpuAndGpu={Boolean(components.cpu && components.gpu)}
                />

                {/* Power Metrics Card */}
                <PowerCard components={components} />

                {/* Real-time Compatibility Checks */}
                <CompatibilityList checks={compatibilityChecks} />
              </div>

            </div>
          </main>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
