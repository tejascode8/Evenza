import React from "react";

const EventCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white/80 border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-[450px] relative overflow-hidden animate-pulse"
        >
          {/* Top Shimmer Overlay */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]"></div>

          <div>
            {/* Image Placeholder */}
            <div className="w-full h-48 rounded-2xl bg-slate-200/80 mb-4 relative overflow-hidden">
              <div className="absolute top-3 left-3 w-20 h-6 bg-slate-300 rounded-full"></div>
              <div className="absolute top-3 right-3 w-16 h-6 bg-slate-300 rounded-full"></div>
            </div>

            {/* Date & Location Line */}
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-24 h-4 bg-slate-200 rounded-md"></div>
              <div className="w-2 h-2 rounded-full bg-slate-200"></div>
              <div className="w-20 h-4 bg-slate-200 rounded-md"></div>
            </div>

            {/* Title Placeholder */}
            <div className="w-full h-6 bg-slate-200 rounded-lg mb-2"></div>
            <div className="w-3/4 h-6 bg-slate-200 rounded-lg mb-3"></div>

            {/* Description Placeholder */}
            <div className="w-full h-3.5 bg-slate-100 rounded mb-1.5"></div>
            <div className="w-5/6 h-3.5 bg-slate-100 rounded"></div>
          </div>

          {/* Footer Line: Price & CTA Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
            <div className="space-y-1">
              <div className="w-12 h-3 bg-slate-100 rounded"></div>
              <div className="w-16 h-5 bg-slate-200 rounded-md"></div>
            </div>
            <div className="w-28 h-9 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventCardSkeleton;
