import React from "react";

const DashboardSkeleton = ({ isAdmin = false }) => {
  return (
    <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 animate-pulse">
      
      {/* Header Banner Skeleton */}
      <div className="bg-white/80 border border-slate-200/90 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-2.5 w-full md:w-2/3">
          <div className="w-28 h-5 bg-slate-200 rounded-full"></div>
          <div className="w-64 h-8 bg-slate-300 rounded-xl"></div>
          <div className="w-96 h-4 bg-slate-200 rounded-md"></div>
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="w-24 h-10 bg-slate-200 rounded-xl"></div>
          <div className="w-32 h-10 bg-slate-300 rounded-xl"></div>
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: isAdmin ? 5 : 4 }).map((_, i) => (
          <div key={i} className="bg-white/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <div className="w-20 h-3.5 bg-slate-200 rounded"></div>
              <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
            </div>
            <div>
              <div className="w-16 h-6 bg-slate-300 rounded-md mb-1"></div>
              <div className="w-24 h-3 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Split Panels or Table Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Section */}
        <div className="xl:col-span-6 bg-slate-100/70 border border-slate-200/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-36 h-6 bg-slate-300 rounded-lg"></div>
            <div className="w-28 h-8 bg-slate-200 rounded-full"></div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200/90 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-3/4">
                <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>
                <div className="space-y-1.5 w-full">
                  <div className="w-16 h-3 bg-slate-200 rounded"></div>
                  <div className="w-3/4 h-4 bg-slate-300 rounded"></div>
                  <div className="w-1/2 h-3 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="w-16 h-8 bg-slate-200 rounded-xl shrink-0"></div>
            </div>
          ))}
        </div>

        {/* Right Section */}
        <div className="xl:col-span-6 bg-slate-100/70 border border-slate-200/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-40 h-6 bg-slate-300 rounded-lg"></div>
            <div className="w-24 h-6 bg-slate-200 rounded-full"></div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200/90 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-3/4">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                <div className="space-y-1.5 w-full">
                  <div className="w-28 h-4 bg-slate-300 rounded"></div>
                  <div className="w-40 h-3 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="w-20 h-7 bg-slate-200 rounded-lg shrink-0"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
