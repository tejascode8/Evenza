import React, { useEffect } from 'react';
import {
  FaExclamationTriangle,
  FaTrashAlt,
  FaTimes,
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // 'danger' | 'warning' | 'info' | 'success'
  loading = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const getTheme = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
          icon: <FaTrashAlt className="text-lg" />,
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
          headerTag: 'text-rose-600 bg-rose-50 border-rose-200'
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
          icon: <FaExclamationTriangle className="text-lg" />,
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
          headerTag: 'text-amber-600 bg-amber-50 border-amber-200'
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          icon: <FaCheckCircle className="text-lg" />,
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200',
          headerTag: 'text-emerald-600 bg-emerald-50 border-emerald-200'
        };
      default:
        return {
          iconBg: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: <FaInfoCircle className="text-lg" />,
          confirmBtn: 'bg-black hover:bg-slate-800 text-white shadow-slate-200',
          headerTag: 'text-slate-600 bg-slate-100 border-slate-200'
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 my-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors text-xs"
        >
          <FaTimes />
        </button>

        {/* Modal Icon & Header */}
        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-2xs mb-4 ${theme.iconBg}`}>
            {theme.icon}
          </div>

          <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 mb-2">
            {title}
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 max-w-sm">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs sm:text-sm transition-colors"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 ${theme.confirmBtn} ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
