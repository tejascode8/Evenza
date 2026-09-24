import React, { useState, useEffect } from "react";
import { FaFire, FaTicketAlt, FaShieldAlt } from "react-icons/fa";

const RECENT_ACTIVITIES = [
  { icon: FaFire, text: "Just Booked: Global AI Tech Summit 2026", location: "Tokyo", time: "1 min ago", color: "text-amber-500" },
  { icon: FaTicketAlt, text: "Fast Selling: World Live Music Festival", location: "London", time: "3 mins ago", color: "text-indigo-500" },
  { icon: FaShieldAlt, text: "2FA Pass Issued: UI/UX Global Design Summit", location: "San Francisco", time: "5 mins ago", color: "text-emerald-500" },
  { icon: FaTicketAlt, text: "Reserved: International Startup Pitch Day", location: "Berlin", time: "8 mins ago", color: "text-purple-500" },
];

const LiveBookingTicker = ({ onSelectActivity }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % RECENT_ACTIVITIES.length);
        setFade(true);
      }, 300);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const current = RECENT_ACTIVITIES[currentIndex];
  const Icon = current.icon;

  return (
    <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs text-slate-700 text-xs font-medium hover:border-slate-300 transition-all cursor-pointer">
      <span className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>

      <div
        className={`flex items-center gap-1.5 transition-all duration-300 ${
          fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        }`}
      >
        <Icon className={`text-xs ${current.color} shrink-0`} />
        <span className="font-semibold text-slate-800">{current.text}</span>
        <span className="text-slate-400">&bull;</span>
        <span className="text-slate-500 font-normal">{current.location}</span>
        <span className="text-slate-400 font-light text-[10px]">({current.time})</span>
      </div>
    </div>
  );
};

export default LiveBookingTicker;
