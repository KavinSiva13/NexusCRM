import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${sizes[size]} animate-slide-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="font-display text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
