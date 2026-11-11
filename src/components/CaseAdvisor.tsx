import React, { useMemo } from 'react';
import { SelectedComponents, CaseType } from '../types/hardware';
import { Box, CheckCircle2, AlertTriangle, Info, Sparkles } from 'lucide-react';

interface CaseAdvisorProps {
  components: SelectedComponents;
  onSelectRecommendedCase?: (type: CaseType) => void;
}

export const CaseAdvisor: React.FC<CaseAdvisorProps> = ({ components, onSelectRecommendedCase }) => {
  const gpu = components.gpu;
  const mobo = components.motherboard;
  const cooler = components.cooler;
  const selectedCase = components.caseItem;

  // Compute recommended tower size based on physical requirements
  const evaluation = useMemo(() => {
    let recommended: CaseType = 'mid_tower';
    const reasons: string[] = [];
    let isCurrentCaseSuitable = true;
    let warningMessage = '';

    // 1. Motherboard constraint
    if (mobo) {
      if (mobo.formFactor === 'ATX') {
        reasons.push('Placa madre ATX requiere Mid Tower o Full Tower');
        if (selectedCase?.caseType === 'mini_tower') {
          isCurrentCaseSuitable = false;
          warningMessage = 'Tu placa ATX no cabe en gabinetes compactos Mini Tower.';
        }
      }
    }

    // 2. GPU constraint
    if (gpu) {
      if (gpu.lengthMm > 340) {
        recommended = 'full_tower';
        reasons.push(`Tarjeta gráfica muy larga (${gpu.lengthMm}mm): Se recomienda Full Tower para flujo de aire holgado.`);
        if (selectedCase && selectedCase.maxGpuLengthMm < gpu.lengthMm) {
          isCurrentCaseSuitable = false;
          warningMessage = `La GPU (${gpu.lengthMm}mm) supera el límite del gabinete (${selectedCase.maxGpuLengthMm}mm).`;
        }
      } else if (gpu.lengthMm > 300) {
        recommended = 'mid_tower';
        reasons.push(`GPU (${gpu.lengthMm}mm) cabe cómodamente en Mid Tower.`);
      }
    }

    // 3. Cooler constraint
    if (cooler) {
      if (cooler.coolingType === 'aio_liquid' && (cooler.radiatorSizeMm || 0) >= 360) {
        recommended = 'full_tower';
        reasons.push(`Refrigeración líquida con radiador de 360mm rinde mejor en Full Tower.`);
      } else if (cooler.coolingType === 'air' && (cooler.heightMm || 0) > 165) {
        reasons.push(`Disipador alto (${cooler.heightMm}mm) requiere gabinete ancho.`);
        if (selectedCase && (cooler.heightMm || 0) > selectedCase.maxCoolerHeightMm) {
          isCurrentCaseSuitable = false;
          warningMessage = `El disipador (${cooler.heightMm}mm) no dejará cerrar la tapa del gabinete.`;
        }
      }
    }

    // If components are compact:
    if (
      mobo &&
      (mobo.formFactor === 'Micro-ATX' || mobo.formFactor === 'Mini-ITX') &&
      (!gpu || gpu.lengthMm <= 320) &&
      (!cooler || cooler.coolingType === 'air' || (cooler.radiatorSizeMm || 0) <= 240)
    ) {
      recommended = 'mini_tower';
      reasons.push('Componentes compactos: Aptos para ensamble estilizado Mini Tower.');
    }

    return {
      recommended,
      reasons,
      isCurrentCaseSuitable,
      warningMessage
    };
  }, [gpu, mobo, cooler, selectedCase]);

  const towerLabels = {
    mini_tower: { title: 'Mini Tower', desc: 'Compacto & Escritorio', badge: 'bg-emerald-950 text-emerald-400 border-emerald-500/40' },
    mid_tower: { title: 'Mid Tower', desc: 'Estándar Más Popular', badge: 'bg-cyan-950 text-cyan-400 border-cyan-500/40' },
    full_tower: { title: 'Full Tower', desc: 'Máximo Espacio & Flujo', badge: 'bg-purple-950 text-purple-400 border-purple-500/40' }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Box className="w-4 h-4 text-cyan-400" />
          <span>Tamaño de Gabinete</span>
        </h3>
        <span
          className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
            towerLabels[evaluation.recommended].badge
          }`}
        >
          Sugerido: {towerLabels[evaluation.recommended].title}
        </span>
      </div>

      {/* 3 Tower Size Selector Cards (Clickable to switch case) */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {(['mini_tower', 'mid_tower', 'full_tower'] as CaseType[]).map((type) => {
          const isSelected = selectedCase?.caseType === type;
          const isSuggested = evaluation.recommended === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelectRecommendedCase?.(type)}
              className={`p-2.5 rounded-xl border transition-all text-center flex flex-col items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/60'
              }`}
              title={`Hacer clic para seleccionar un chasis ${towerLabels[type].title}`}
            >
              <div className="w-full flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-400">
                  {type === 'mini_tower' ? 'Compact' : type === 'mid_tower' ? 'Mid' : 'XL'}
                </span>
                {isSuggested && (
                  <span className="text-[9px] bg-cyan-500 text-slate-950 font-bold px-1 rounded">
                    IDEAL
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-white mb-0.5">
                {towerLabels[type].title}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                {towerLabels[type].desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Warning Alert if current case is inadequate */}
      {!evaluation.isCurrentCaseSuitable && (
        <div className="flex items-start gap-2 bg-red-950/50 border border-red-500/40 p-2.5 rounded-xl mb-2 text-xs text-red-200">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Incompatibilidad de Gabinete:</span>
            <span>{evaluation.warningMessage}</span>
          </div>
        </div>
      )}

      {/* Reason bullet points */}
      {evaluation.reasons.length > 0 && (
        <div className="space-y-1 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          {evaluation.reasons.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-cyan-400 flex-shrink-0" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
