'use client';

import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast = ({ message, onClose }: ToastProps) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <CheckCircle className="w-4 h-4 text-emerald-400" />
        <span className="text-[12px] font-black uppercase tracking-widest text-white/90">
          {message}
        </span>
      </div>
    </div>
  );
};
