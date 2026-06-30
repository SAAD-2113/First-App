import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const colorClasses = {
    danger: {
      bg: 'bg-rose-500/20',
      border: 'border-rose-500/30',
      text: 'text-rose-300',
      button: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500',
      icon: 'text-rose-400'
    },
    warning: {
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/30',
      text: 'text-amber-300',
      button: 'bg-amber-500 hover:bg-amber-400 text-slate-950 focus:ring-amber-400',
      icon: 'text-amber-400'
    },
    info: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      text: 'text-blue-300',
      button: 'bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-500',
      icon: 'text-blue-400'
    }
  }[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 bg-slate-900/90 p-6 text-white shadow-2xl backdrop-blur-2xl animate-scaleIn">
        {/* Glow ambient background */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${variant === 'danger' ? 'bg-rose-500/10' : 'bg-amber-500/10'} blur-3xl rounded-full pointer-events-none`} />

        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`p-3.5 rounded-2xl ${colorClasses.bg} border ${colorClasses.border}`}>
            {variant === 'danger' ? (
              <Trash2 className={`h-6 w-6 ${colorClasses.icon}`} />
            ) : (
              <AlertTriangle className={`h-6 w-6 ${colorClasses.icon}`} />
            )}
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-base font-black tracking-tight text-white">{title}</h3>
            <p className="text-xs text-white/70 font-semibold leading-relaxed">{message}</p>
          </div>

          <div className="flex w-full gap-2.5 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl bg-white/10 border border-white/10 py-2.5 text-xs font-bold text-white/80 hover:bg-white/15 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-white/20"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 rounded-xl py-2.5 text-xs font-black transition-colors focus:outline-none focus:ring-1 ${colorClasses.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
