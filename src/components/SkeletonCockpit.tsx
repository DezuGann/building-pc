import React from 'react';
import { Box, Gauge } from 'lucide-react';

/**
 * SkeletonCockpit
 * High-performance visual skeleton loading state inspired by Facebook / YouTube feeds.
 * Renders the exact 3-column cockpit layout with metallic shimmering placeholder containers.
 */
export const SkeletonCockpit: React.FC = () => {
  return (
    <div className="max-w-[1750px] mx-auto px-3 sm:px-4 lg:px-6 py-3 flex-1 w-full min-h-0 lg:overflow-hidden flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1 min-h-0">

        {/* COLUMN 1: LEFT COMPONENT SKELETON CARDS (Extended width for full visibility) */}
        <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 lg:h-full lg:overflow-y-auto pr-1.5 space-y-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <div className="h-5 w-40 bg-slate-800/80 rounded-lg shimmer-wave" />
            <div className="h-4 w-16 bg-slate-800/60 rounded-full shimmer-wave" />
          </div>

          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-sm relative overflow-hidden space-y-2.5 shimmer-wave"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-800" />
                  <div className="h-3.5 w-28 bg-slate-800/90 rounded" />
                </div>
                <div className="h-4 w-20 bg-slate-800/70 rounded" />
              </div>

              <div className="h-9 w-full bg-slate-950/80 rounded-lg border border-slate-800/80 flex items-center px-3 justify-between">
                <div className="h-3 w-48 bg-slate-800/60 rounded" />
                <div className="w-3 h-3 bg-slate-800/50 rounded" />
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <div className="h-2.5 w-16 bg-slate-800/50 rounded" />
                <div className="h-2.5 w-20 bg-slate-800/50 rounded" />
                <div className="h-2.5 w-14 bg-slate-800/50 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* COLUMN 2: CENTER 3D CHASSIS VIEWPORT SKELETON */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-5 lg:h-full flex flex-col justify-between gap-3 overflow-hidden">
          <div className="flex-1 min-h-[380px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950/80 relative flex flex-col items-center justify-center p-6 shimmer-wave">
            <div className="w-28 h-28 rounded-full border border-dashed border-slate-700/80 flex items-center justify-center mb-4">
              <Box className="w-10 h-10 text-slate-700 animate-pulse" />
            </div>
            <div className="h-4 w-44 bg-slate-800/80 rounded mb-2" />
            <div className="h-3 w-64 bg-slate-800/50 rounded" />
          </div>

          {/* Price & Summary quick strip skeleton */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-lg shimmer-wave">
            <div>
              <div className="h-3 w-28 bg-slate-800/80 rounded mb-1.5" />
              <div className="h-6 w-36 bg-slate-800 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 bg-slate-800/70 rounded-xl" />
              <div className="h-8 w-36 bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>

        {/* COLUMN 3: RIGHT DIAGNOSTICS & ADVISOR SKELETON */}
        <div className="lg:col-span-3 xl:col-span-3 lg:h-full lg:overflow-y-auto pr-1.5 space-y-3.5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 shimmer-wave">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-slate-800 rounded" />
              <div className="h-4 w-20 bg-slate-800/70 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-14 bg-slate-950 rounded-xl border border-slate-800" />
              <div className="h-14 bg-slate-950 rounded-xl border border-slate-800" />
              <div className="h-14 bg-slate-950 rounded-xl border border-slate-800" />
            </div>
          </div>

          <div className="bg-slate-900/95 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4 shimmer-wave">
            <div className="flex items-center justify-between">
              <div className="h-4 w-36 bg-slate-800 rounded" />
              <div className="h-6 w-24 bg-slate-800/80 rounded-lg" />
            </div>
            <div className="h-32 w-full bg-slate-950/70 rounded-2xl border border-slate-800/60 flex items-center justify-center">
              <Gauge className="w-10 h-10 text-slate-800 animate-pulse" />
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3 shimmer-wave">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-slate-800 rounded" />
              <div className="h-6 w-16 bg-slate-800 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-11 bg-slate-950 rounded-xl border border-slate-800" />
              <div className="h-11 bg-slate-950 rounded-xl border border-slate-800" />
              <div className="h-11 bg-slate-950 rounded-xl border border-slate-800" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

