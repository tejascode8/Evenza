import React, { useEffect } from 'react';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes
} from 'react-icons/fa';

const Toast = ({
  message,
  type = 'info', // 'success' | 'error' | 'info'
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/40 text-white',
          icon: <FaCheckCircle className="text-emerald-400 text-sm shrink-0" />
        };
      case 'error':
        return {
          bg: 'bg-rose-950/90 border-rose-500/40 text-white',
          icon: <FaExclamationCircle className="text-rose-400 text-sm shrink-0" />
        };
      default:
        return {
          bg: 'bg-slate-900/90 border-slate-700 text-white',
          icon: <FaInfoCircle className="text-slate-300 text-sm shrink-0" />
        };
    }
  };

  const style = getStyle();

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right max-w-sm w-full">
      <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 ${style.bg}`}>
        <div className="flex items-center gap-3 min-w-0">
          {style.icon}
          <p className="text-xs sm:text-sm font-semibold truncate leading-tight">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
