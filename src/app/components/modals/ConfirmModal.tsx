import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmModal({ 
  isOpen, onClose, onConfirm, 
  title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', 
  isDestructive = false 
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      // Pequeno delay para a animação funcionar após montar
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${visible ? 'bg-brand-5/80 backdrop-blur-sm' : 'bg-transparent backdrop-blur-none pointer-events-none'}`}>
      <div 
        className={`bg-brand-4 border border-brand-3/20 rounded-[32px] p-8 max-w-md w-full shadow-2xl transition-all duration-300 transform ${visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-black text-brand-1 mb-4">{title}</h2>
        <p className="text-brand-2 text-lg mb-8 leading-relaxed font-medium">{message}</p>
        
        <div className="flex gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-brand-2 bg-brand-3/30 hover:bg-brand-3/50 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onConfirm(); onClose(); }} 
            className={`flex-1 py-4 px-6 rounded-2xl font-black transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${isDestructive ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-brand-2 hover:bg-brand-1 text-brand-5 shadow-brand-2/20'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
