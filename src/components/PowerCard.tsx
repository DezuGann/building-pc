import React from 'react';
import { Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SelectedComponents } from '../types/hardware';
import { calculatePowerMetrics } from '../services/engine';

interface PowerCardProps {
  components: SelectedComponents;
}

export const PowerCard: React.FC<PowerCardProps> = ({ components }) => {
  const { cpuWatts, gpuWatts, systemBaseWatts, totalEstimatedWatts, recommendedPsuWatts } =
    calculatePowerMetrics(components);

  const selectedPsu = components.psu;
  const isPsuSufficient = selectedPsu ? selectedPsu.wattage >= recommendedPsuWatts : true;

  return (
    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Demanda Energética</h3>
            <p className="text-xs text-slate-400">Cálculo de consumo y fuente sugerida</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-amber-400">{totalEstimatedWatts}W</span>
          <p className="text-[10px] text-slate-500 font-medium">Consumo pico estimado</p>
        </div>
      </div>

      {/* Watts breakdown badges */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-0.5">CPU (Pico)</span>
          <span className="font-bold text-white">{cpuWatts}W</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-0.5">GPU (TDP)</span>
          <span className="font-bold text-white">{gpuWatts}W</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-0.5">Placa + RAM + SSD</span>
          <span className="font-bold text-white">{systemBaseWatts}W</span>
        </div>
      </div>

      {/* Recommended PSU bar */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-slate-300 font-medium">Fuente mínima recomendada (+30% margen):</span>
          <span className="font-black text-emerald-400 text-sm">{recommendedPsuWatts}W</span>
        </div>
        
        {selectedPsu && (
          <div className="mt-2.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400">
                Fuente: <strong className="text-white">{selectedPsu.brand} {selectedPsu.wattage}W</strong> ({selectedPsu.efficiencyRating})
              </span>
              {isPsuSufficient ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Adecuada
                </span>
              ) : (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Insuficiente
                </span>
              )}
            </div>

            {/* PSU Load Bar */}
            {selectedPsu.wattage > 0 && (
              <div className="space-y-1">
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      totalEstimatedWatts / selectedPsu.wattage > 0.85
                        ? 'bg-rose-500'
                        : totalEstimatedWatts / selectedPsu.wattage > 0.70
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((totalEstimatedWatts / selectedPsu.wattage) * 100))}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Carga estimada: {Math.round((totalEstimatedWatts / selectedPsu.wattage) * 100)}%</span>
                  <span>Zona óptima 80 PLUS: 50% - 75%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
