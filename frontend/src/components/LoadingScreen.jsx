import React from "react";
import { FaTicketAlt } from "react-icons/fa";

const LoadingScreen = ({
  message = "Loading...",
  subtitle = "Please wait a moment",
  fullScreen = true,
  className = "",
}) => {
  const content = (
    <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 max-w-xs mx-auto">
      {/* Sleek Minimalist Brand Icon with Smooth Spinner Ring */}
      <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
        {/* Subtle spinning track ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-slate-200 border-t-slate-900 animate-spin"></div>

        {/* Center Minimal Icon */}
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-xs">
          <FaTicketAlt className="text-slate-900 text-sm" />
        </div>
      </div>

      {/* Clean Typography */}
      <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
        {message}
      </h3>
      {subtitle && (
        <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`min-h-[70vh] w-full flex items-center justify-center bg-slate-50/40 ${className}`}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={`w-full py-10 flex items-center justify-center ${className}`}
    >
      {content}
    </div>
  );
};

export default LoadingScreen;
