'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

interface ToastProps {
  toast: { message: string; type: 'success' | 'info' } | null;
  onClose: () => void;
}

export const Toast = ({ toast, onClose }: ToastProps) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none animate-in slide-in-from-bottom-8 duration-500">
      <div className={`flex items-center gap-6 px-10 py-6 bg-[var(--kilang-toast-bg)] backdrop-blur-3xl border rounded-[32px] shadow-[0_32px_128px_-16px_var(--kilang-shadow-color)] border-b-8 transition-all ${isSuccess ? 'border-[var(--kilang-toast-border)] border-b-[var(--kilang-primary)]/60' : 'border-[var(--kilang-toast-border)] border-b-[var(--kilang-secondary)]/60'}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center animate-bounce ${isSuccess ? 'bg-[var(--kilang-primary)]/10 border border-[var(--kilang-primary)]/20' : 'bg-[var(--kilang-primary)]/10 border border-[var(--kilang-primary)]/20'}`}>
          {isSuccess ? (
            <CheckCircle2 className="w-8 h-8 text-[var(--kilang-primary)]" />
          ) : (
            <Zap className="w-8 h-8 text-[var(--kilang-secondary)]" />
          )}
        </div>
        <span className="text-xs font-black text-[var(--kilang-text)] uppercase tracking-[0.3em]">
          {toast.message}
        </span>
      </div>
    </div>
  );
};
