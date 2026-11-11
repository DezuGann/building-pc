import React, { useEffect, useState } from 'react';
import { AlertOctagon, X } from 'lucide-react';

export interface IncompatibilityNotification {
  id: string;
  checkId: string;
  title: string;
  details: string;
  duration?: number; // ms, default 5500
}

interface IncompatibilityToastContainerProps {
  notifications: IncompatibilityNotification[];
  onDismiss: (id: string) => void;
}

export const IncompatibilityToastContainer: React.FC<IncompatibilityToastContainerProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] pointer-events-none"
      role="alert"
      aria-live="assertive"
    >
      {notifications.map((toast) => (
        <SingleIncompatibilityToast key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const SingleIncompatibilityToast: React.FC<{
  toast: IncompatibilityNotification;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  const duration = toast.duration || 5500;
  const [progress, setProgress] = useState(100);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onDismiss();
    }, 250);
  };

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-xl border border-rose-500/80 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-xl transition-all duration-250 ${
        isClosing
          ? 'opacity-0 scale-95 translate-x-4'
          : 'opacity-100 scale-100 translate-x-0 animate-in fade-in slide-in-from-top-3 duration-300'
      } shadow-[0_0_30px_rgba(244,63,94,0.35)]`}
    >
      {/* Background glow accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-600/30 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-3 relative z-10">
        <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex-shrink-0 animate-pulse mt-0.5">
          <AlertOctagon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40">
              Incompatibilidad Crítica
            </span>
          </div>
          <h4 className="text-xs font-bold text-white tracking-tight leading-snug mb-1">
            {toast.title}
          </h4>
          <p className="text-[11px] text-rose-200/90 leading-relaxed">
            {toast.details}
          </p>
        </div>

        <button
          onClick={handleClose}
          className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-white transition flex-shrink-0"
          title="Cerrar aviso"
          aria-label="Cerrar aviso"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Shrinking countdown progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-950/80">
        <div
          className="h-full bg-rose-500 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

