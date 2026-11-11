import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, SlidersHorizontal } from 'lucide-react';
import { CompatibilityCheck } from '../types/hardware';

interface CompatibilityListProps {
  checks: CompatibilityCheck[];
}

export const CompatibilityList: React.FC<CompatibilityListProps> = ({ checks }) => {
  const [filter, setFilter] = useState<'all' | 'failed' | 'warning' | 'passed'>('all');

  if (checks.length === 0) {
    return (
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 text-center text-slate-500 py-6 text-xs">
        <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        Selecciona componentes para ejecutar las verificaciones de compatibilidad física y eléctrica.
      </div>
    );
  }

  const failedCount = checks.filter(c => c.status === 'failed').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const passedCount = checks.filter(c => c.status === 'passed').length;

  const filteredChecks = checks.filter(c => {
    if (filter === 'failed') return c.status === 'failed';
    if (filter === 'warning') return c.status === 'warning';
    if (filter === 'passed') return c.status === 'passed';
    return true;
  });

  // Dynamic visual aura depending on system health
  const containerStyle = failedCount > 0
    ? 'border-rose-500/70 shadow-[0_0_30px_rgba(244,63,94,0.25)] bg-gradient-to-b from-rose-950/35 via-slate-900/95 to-slate-950'
    : warningCount > 0
    ? 'border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.2)] bg-gradient-to-b from-amber-950/25 via-slate-900/95 to-slate-950'
    : 'border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.16)] bg-gradient-to-b from-emerald-950/20 via-slate-900/95 to-slate-950';

  const badgeIconStyle = failedCount > 0
    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
    : warningCount > 0
    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

  return (
    <div className={`rounded-2xl p-5 border shadow-2xl transition-all duration-300 relative overflow-hidden ${containerStyle}`}>
      {/* Background radial glow */}
      <div 
        className={`absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40 ${
          failedCount > 0 ? 'bg-rose-500' : warningCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'
        }`} 
      />

      {/* Main Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl border transition-colors ${badgeIconStyle}`}>
            {failedCount > 0 ? (
              <XCircle className="w-5 h-5 text-rose-400" />
            ) : warningCount > 0 ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
              <span>Validación de Compatibilidad</span>
            </h3>
            <p className="text-[11px] text-slate-400">Verificación física, mecánica y eléctrica en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Hero Status Callout Banner */}
      <div className="relative z-10 mb-3">
        {failedCount > 0 ? (
          <div className="px-3.5 py-2.5 rounded-xl bg-rose-950/70 border border-rose-500/70 flex items-center justify-between text-xs shadow-md shadow-rose-950/60 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="font-bold text-rose-200">
                {failedCount === 1 ? '1 Incompatibilidad Crítica Detectada' : `${failedCount} Incompatibilidades Críticas Detectadas`}
              </span>
            </div>
            <span className="text-[10px] font-mono font-black bg-rose-500 text-slate-950 px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
              No Ensamblar
            </span>
          </div>
        ) : warningCount > 0 ? (
          <div className="px-3.5 py-2.5 rounded-xl bg-amber-950/60 border border-amber-500/60 flex items-center justify-between text-xs shadow-md shadow-amber-950/40">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-amber-200">
                {warningCount === 1 ? '1 Advertencia Técnica de Ensamble' : `${warningCount} Advertencias Técnicas de Ensamble`}
              </span>
            </div>
            <span className="text-[10px] font-mono font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
              Revisar
            </span>
          </div>
        ) : (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-950/50 border border-emerald-500/50 flex items-center justify-between text-xs shadow-md shadow-emerald-950/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-emerald-200">Ensamble 100% Compatible y Seguro</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
              Aprobado
            </span>
          </div>
        )}
      </div>

      {/* Segmented Visual Health Meter */}
      <div className="relative z-10 mb-3.5 space-y-1">
        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex gap-0.5 border border-slate-800">
          {passedCount > 0 && (
            <div
              style={{ width: `${(passedCount / checks.length) * 100}%` }}
              className="bg-emerald-400 transition-all duration-500 rounded-l-full"
              title={`${passedCount} verificaciones correctas`}
            />
          )}
          {warningCount > 0 && (
            <div
              style={{ width: `${(warningCount / checks.length) * 100}%` }}
              className="bg-amber-400 transition-all duration-500"
              title={`${warningCount} advertencias`}
            />
          )}
          {failedCount > 0 && (
            <div
              style={{ width: `${(failedCount / checks.length) * 100}%` }}
              className="bg-rose-500 transition-all duration-500 rounded-r-full"
              title={`${failedCount} incompatibilidades`}
            />
          )}
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="relative z-10 flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition ${
            filter === 'all'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Todos ({checks.length})
        </button>

        {failedCount > 0 && (
          <button
            onClick={() => setFilter('failed')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              filter === 'failed'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/30'
                : 'bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Incompatibles ({failedCount})</span>
          </button>
        )}

        {warningCount > 0 && (
          <button
            onClick={() => setFilter('warning')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 ${
              filter === 'warning'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-amber-950/50 text-amber-300 border border-amber-500/40 hover:bg-amber-900/50'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Avisos ({warningCount})</span>
          </button>
        )}

        <button
          onClick={() => setFilter('passed')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 ${
            filter === 'passed'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
              : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>OK ({passedCount})</span>
        </button>
      </div>

      {/* Checks Items List */}
      <div className="relative z-10 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredChecks.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
            No hay elementos en esta categoría.
          </div>
        ) : (
          filteredChecks.map((check) => {
            const isFailed = check.status === 'failed';
            const isWarning = check.status === 'warning';

            const cardBorder = isFailed
              ? 'border-l-4 border-l-rose-500 border-rose-500/50 bg-rose-950/30 shadow-sm shadow-rose-950/30'
              : isWarning
              ? 'border-l-4 border-l-amber-500 border-amber-500/40 bg-amber-950/20 shadow-sm shadow-amber-950/20'
              : 'border-l-4 border-l-emerald-500/60 border-slate-800/80 bg-slate-950/70 hover:border-slate-700';

            const statusBadge = isFailed
              ? 'bg-rose-500/25 text-rose-300 border-rose-500/40'
              : isWarning
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

            const statusLabel = isFailed
              ? 'Incompatible'
              : isWarning
              ? 'Advertencia'
              : 'Verificado';

            return (
              <div
                key={check.id}
                className={`p-3 rounded-xl border transition-all text-xs ${cardBorder}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {isFailed && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                    {!isFailed && !isWarning && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    <h4 className="font-bold text-white text-[12px]">{check.title}</h4>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${statusBadge}`}>
                    {statusLabel}
                  </span>
                </div>
                <p className={`mt-1 pl-6 leading-relaxed text-[11px] ${isFailed ? 'text-rose-100 font-medium' : isWarning ? 'text-amber-100' : 'text-slate-400'}`}>
                  {check.details}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
