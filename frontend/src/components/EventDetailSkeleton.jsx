import React from "react";

const EventDetailSkeleton = () => {
  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-16 h-4 bg-slate-200 rounded"></div>
        <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
        <div className="w-24 h-4 bg-slate-200 rounded"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Event Media & Detailed Overview */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Cover Image Skeleton */}
          <div className="w-full h-80 sm:h-[420px] rounded-3xl bg-slate-200/90 relative overflow-hidden">
            <div className="absolute top-4 left-4 w-28 h-7 bg-slate-300 rounded-full"></div>
          </div>

          {/* Title & Key Highlights Skeleton */}
          <div className="bg-white/80 border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="w-32 h-6 bg-slate-200 rounded-full"></div>
            <div className="w-full h-10 bg-slate-300 rounded-xl"></div>
            <div className="w-2/3 h-10 bg-slate-300 rounded-xl"></div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <div className="w-12 h-3 bg-slate-200 rounded"></div>
                <div className="w-20 h-4 bg-slate-300 rounded"></div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <div className="w-12 h-3 bg-slate-200 rounded"></div>
                <div className="w-20 h-4 bg-slate-300 rounded"></div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1 col-span-2 sm:col-span-1">
                <div className="w-12 h-3 bg-slate-200 rounded"></div>
                <div className="w-20 h-4 bg-slate-300 rounded"></div>
              </div>
            </div>
          </div>

          {/* Detailed Description Skeleton */}
          <div className="bg-white/80 border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-3">
            <div className="w-40 h-6 bg-slate-300 rounded-lg mb-4"></div>
            <div className="w-full h-4 bg-slate-200 rounded"></div>
            <div className="w-full h-4 bg-slate-200 rounded"></div>
            <div className="w-4/5 h-4 bg-slate-200 rounded"></div>
            <div className="w-3/5 h-4 bg-slate-200 rounded"></div>
          </div>
        </div>

        {/* Right Column: Checkout Ticket Widget */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-lg space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="w-20 h-4 bg-slate-200 rounded"></div>
              <div className="w-24 h-7 bg-slate-300 rounded-lg"></div>
            </div>

            <div className="space-y-3">
              <div className="w-full h-12 bg-slate-100 rounded-2xl"></div>
              <div className="w-full h-12 bg-slate-100 rounded-2xl"></div>
            </div>

            <div className="w-full h-12 bg-slate-300 rounded-2xl mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailSkeleton;
