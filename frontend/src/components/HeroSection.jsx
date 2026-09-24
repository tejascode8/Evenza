import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import HeroThreeCanvas from "./HeroThreeCanvas";
import {
  FaArrowRight,
  FaBolt,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaStar,
  FaQrcode,
  FaUsers,
  FaRegCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTicketAlt,
} from "react-icons/fa";

const ROTATING_PHRASES = [
  "Extraordinary Moments.",
  "Premier Tech Summits.",
  "Live Music Festivals.",
  "Founder & Startup Forums.",
  "Masterclasses & Arts.",
];

const DEFAULT_FEATURED_EVENTS = [
  {
    _id: "featured-1",
    title: "Global Tech & AI Summit 2026",
    category: "Technology",
    location: "San Francisco, CA • Moscone Center",
    date: new Date(Date.now() + 86400000 * 14).toISOString(),
    ticketPrice: 1499,
    totalSeats: 300,
    availableSeats: 42,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "featured-2",
    title: "Neon Horizon Music & Arts Festival",
    category: "Music",
    location: "Tokyo, Japan • Shibuya Live Arena",
    date: new Date(Date.now() + 86400000 * 21).toISOString(),
    ticketPrice: 2499,
    totalSeats: 500,
    availableSeats: 85,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "featured-3",
    title: "Venture Founders & Web3 Forum",
    category: "Business",
    location: "London, UK • ExCeL Arena",
    date: new Date(Date.now() + 86400000 * 30).toISOString(),
    ticketPrice: 999,
    totalSeats: 250,
    availableSeats: 18,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
  },
];

const HeroSection = ({
  allEvents = [],
  scrollToEvents,
}) => {
  const navigate = useNavigate();
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });

  const heroContainerRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const cardRef = useRef(null);
  const rotatingPhraseRef = useRef(null);

  // Pool of featured events from API with diverse mix of Paid and Free experiences
  const featuredList = React.useMemo(() => {
    if (!allEvents || allEvents.length === 0) return DEFAULT_FEATURED_EVENTS;
    
    // Sort & interleave to guarantee both paid experiences with prices and popular free passes
    const paidEvents = allEvents.filter((e) => (Number(e.ticketPrice) || Number(e.price) || 0) > 0);
    const freeEvents = allEvents.filter((e) => (Number(e.ticketPrice) || Number(e.price) || 0) === 0);

    const pool = [];
    const maxItems = Math.min(6, allEvents.length);
    let pIdx = 0;
    let fIdx = 0;

    while (pool.length < maxItems && (pIdx < paidEvents.length || fIdx < freeEvents.length)) {
      if (pIdx < paidEvents.length) pool.push(paidEvents[pIdx++]);
      if (pool.length < maxItems && fIdx < freeEvents.length) pool.push(freeEvents[fIdx++]);
    }

    return pool.length > 0 ? pool : allEvents.slice(0, 6);
  }, [allEvents]);

  const currentFeatured = featuredList[activeSlideIdx % featuredList.length] || DEFAULT_FEATURED_EVENTS[0];

  // Price calculations for current event
  const rawPrice = currentFeatured.ticketPrice !== undefined ? currentFeatured.ticketPrice : currentFeatured.price;
  const numPrice = Number(rawPrice) || 0;
  const isPaid = numPrice > 0;

  // Auto-cycle through featured passes on right side
  useEffect(() => {
    if (isPaused || featuredList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIdx((prev) => (prev + 1) % featuredList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, featuredList.length]);

  // Rotate headline phrases with smooth GSAP animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (rotatingPhraseRef.current) {
        gsap.to(rotatingPhraseRef.current, {
          y: -15,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            setPhraseIdx((prev) => (prev + 1) % ROTATING_PHRASES.length);
            gsap.fromTo(
              rotatingPhraseRef.current,
              { y: 15, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
            );
          },
        });
      }
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  // GSAP Entrance Sequence
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        leftColRef.current ? leftColRef.current.children : [],
        { opacity: 0, y: 24, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.65, stagger: 0.09 }
      ).fromTo(
        rightColRef.current,
        { opacity: 0, scale: 0.92, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.75, ease: "back.out(1.2)" },
        "-=0.45"
      );
    }, heroContainerRef);

    return () => ctx.revert();
  }, []);

  // 3D Card Tilt Physics with Dynamic Holographic Glare
  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -11;
    const rotateY = ((x - centerX) / centerX) * 11;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setCardTilt({ x: rotateX, y: rotateY, glareX, glareY });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
    setIsPaused(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Upcoming Date";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Upcoming Date";
    }
  };

  const handleTicketPassClick = () => {
    if (currentFeatured?._id && !currentFeatured._id.startsWith("featured-")) {
      navigate(`/events/${currentFeatured._id}`);
    } else {
      if (scrollToEvents) scrollToEvents();
    }
  };

  // Calculate seat occupancy percentage
  const totalSeats = currentFeatured.totalSeats || 100;
  const availableSeats = currentFeatured.availableSeats !== undefined ? currentFeatured.availableSeats : 42;
  const bookedPercent = Math.min(100, Math.max(10, Math.round(((totalSeats - availableSeats) / totalSeats) * 100)));

  return (
    <section
      ref={heroContainerRef}
      className="relative z-10 w-full px-3 sm:px-6 lg:px-8 pt-20 sm:pt-22 md:pt-24 lg:pt-26 pb-4 sm:pb-8 overflow-hidden"
    >
      {/* Outer Hero Card with Frosted Depth */}
      <div className="relative max-w-7xl w-full mx-auto bg-white/85 backdrop-blur-2xl border border-slate-200/90 rounded-2xl sm:rounded-[2.5rem] lg:rounded-[3rem] p-4 sm:p-8 md:p-10 lg:p-12 xl:p-14 shadow-2xl shadow-slate-900/5 overflow-hidden">
        
        {/* Three.js Interactive 3D WebGL Background Canvas */}
        <HeroThreeCanvas />

        {/* Dynamic Glowing Ambient Lighting */}
        <div className="absolute -top-32 -left-32 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-tl from-cyan-400/15 to-rose-400/10 blur-3xl pointer-events-none"></div>

        {/* 2-Column Split Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          
          {/* ================= LEFT COLUMN ================= */}
          <div ref={leftColRef} className="lg:col-span-7 flex flex-col items-start text-left w-full">
            
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-slate-900 text-white shadow-md border border-slate-700/60 mb-4 sm:mb-5 backdrop-blur-md hover:scale-105 transition-transform duration-200 cursor-default">
              <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">
                Live Global Ticketing System
              </span>
            </div>

            {/* Main Dynamic Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-slate-900 leading-[1.16] mb-3 sm:mb-4">
              Discover, Book &amp; Experience{" "}
              <span
                ref={rotatingPhraseRef}
                className="block sm:inline bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
              >
                {ROTATING_PHRASES[phraseIdx]}
              </span>
            </h1>

            {/* Subtitle */}
<p className="text-gray-500 text-xs sm:text-sm md:text-[15px] font-medium leading-relaxed mb-5 sm:mb-6 max-w-xl">
  Discover premium events, festivals, masterclasses, and exhibitions with secure 2FA verification and instant digital QR ticketing.
</p>


            {/* Quick Value Proof Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 md:gap-3 mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-[11px] sm:text-xs font-semibold shadow-2xs">
                <FaBolt className="text-[10px] sm:text-[11px] text-indigo-600 shrink-0" />
                <span>Instant QR Pass</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-50/80 border border-emerald-100 text-emerald-700 text-xs font-semibold shadow-2xs">
                <FaShieldAlt className="text-[10px] sm:text-[11px] text-emerald-600 shrink-0" />
                <span>2FA Anti-Scalping</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-purple-50/80 border border-purple-100 text-purple-700 text-[11px] sm:text-xs font-semibold shadow-2xs">
                <FaTicketAlt className="text-[10px] sm:text-[11px] text-purple-600 shrink-0" />
                <span>Official Organizers</span>
              </div>
            </div>

            {/* Social Proof & Trust Metrics Bar */}
            <div className="w-full max-w-xl pt-4 sm:pt-6 border-t border-slate-200/80">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900">50K+</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-medium">Passes Issued</span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900">4.9</span>
                    <FaStar className="text-amber-400 text-xs sm:text-sm shrink-0" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-medium">Attendee Rating</span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-emerald-600">100%</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-medium">2FA Protected</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (Ultra-Premium 3D Holographic Event Ticket Pass) ================= */}
          <div
            ref={rightColRef}
            className="lg:col-span-5 relative flex items-center justify-center py-4 sm:py-6 lg:py-2 w-full"
          >
            {/* Multi-Layer Ambient Depth Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/25 via-purple-500/25 to-cyan-400/20 rounded-[3rem] filter blur-3xl opacity-80 transform -rotate-2 scale-95 pointer-events-none"></div>

            {/* 3D Holographic Tilt Ticket Card */}
            <div
              ref={cardRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                transform: `perspective(1100px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
                transition: "transform 0.18s ease-out, box-shadow 0.2s ease-out",
              }}
              className="relative w-full max-w-[340px] sm:max-w-[380px] bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 text-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 md:p-6 shadow-2xl border border-indigo-500/30 overflow-hidden group select-none"
            >
              {/* Dynamic Holographic Glare Sheen */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${cardTilt.glareX}% ${cardTilt.glareY}%, rgba(255,255,255,0.8) 0%, rgba(99,102,241,0.2) 40%, transparent 70%)`,
                }}
              ></div>

              {/* Ticket Top Ribbon */}
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-indigo-300 truncate">
                    Pass #EVZ-{1000 + activeSlideIdx}
                  </span>
                </div>

                {/* Interactive Carousel Slide Indicators & Switchers */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1 mr-1">
                    {featuredList.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveSlideIdx(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeSlideIdx === i ? "w-3.5 sm:w-4 bg-indigo-400" : "w-1.5 bg-white/20 hover:bg-white/40"
                        }`}
                        title={`Go to event ${i + 1}`}
                      />
                    ))}
                  </div>

                  {featuredList.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSlideIdx(
                            (prev) => (prev - 1 + featuredList.length) % featuredList.length
                          )
                        }
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white text-[9px] sm:text-[10px] transition-colors cursor-pointer"
                        title="Previous event"
                      >
                        <FaChevronLeft className="shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSlideIdx((prev) => (prev + 1) % featuredList.length)
                        }
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white text-[9px] sm:text-[10px] transition-colors cursor-pointer"
                        title="Next event"
                      >
                        <FaChevronRight className="shrink-0" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Visual Poster */}
              <div
                onClick={handleTicketPassClick}
                className="relative h-36 sm:h-42 md:h-44 rounded-xl sm:rounded-2xl overflow-hidden mb-3 bg-slate-800 border border-indigo-500/25 cursor-pointer shadow-md group/poster"
              >
                <img
                  src={
                    currentFeatured.image ||
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={currentFeatured.title}
                  className="w-full h-full object-cover group-hover/poster:scale-108 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent"></div>

                {/* Top Category Badge */}
                <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-slate-900/85 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold text-indigo-300 border border-indigo-500/30 flex items-center gap-1 shadow-sm">
                  <FaBolt className="text-amber-400 text-[9px] sm:text-[10px] shrink-0" />
                  <span>{currentFeatured.category || "Featured"}</span>
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 text-left">
                  <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-white leading-snug drop-shadow-md truncate">
                    {currentFeatured.title}
                  </h3>
                </div>
              </div>

              {/* Event Metadata & Live Availability Meter */}
              <div className="space-y-1.5 sm:space-y-2 mb-3 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/10 text-xs text-left">
                <div className="flex items-center justify-between text-slate-300 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FaRegCalendarAlt className="text-indigo-400 text-xs shrink-0" />
                    <span className="font-semibold text-slate-200 text-[11px] sm:text-xs truncate">{formatDate(currentFeatured.date)}</span>
                  </div>
                  <span className="font-bold text-emerald-400 text-[9px] sm:text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                    {availableSeats > 0 ? `${availableSeats} Left` : "Sold Out"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <FaMapMarkerAlt className="text-rose-400 text-xs shrink-0" />
                  <span className="truncate text-slate-300 font-medium text-[11px] sm:text-xs">{currentFeatured.location}</span>
                </div>

                {/* Live Availability Progress Bar */}
                <div className="pt-0.5">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 font-medium mb-1">
                    <span>Demand</span>
                    <span className="text-indigo-300 font-bold">{bookedPercent}% Reserved</span>
                  </div>
                  <div className="w-full h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${bookedPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Realistic Ticket Perforation Line */}
              <div className="relative flex items-center my-2.5 sm:my-3">
                <div className="absolute -left-7 sm:-left-9 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white shadow-inner"></div>
                <div className="w-full border-t-2 border-dashed border-white/20"></div>
                <div className="absolute -right-7 sm:-right-9 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white shadow-inner"></div>
              </div>

              {/* Ticket Pass Stub Footer (QR + Price + Action) */}
              <div className="flex items-center justify-between pt-0.5 text-left gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Digital QR Code */}
                  <div className="relative w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-lg sm:rounded-xl p-1 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <FaQrcode className="text-slate-950 text-xl sm:text-2xl" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Pass Price
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm md:text-base font-extrabold text-white truncate font-mono">
                      {isPaid ? `₹${numPrice.toLocaleString("en-IN")}` : "Free"}
                    </div>
                  </div>
                </div>

                {/* High-Impact Reserve Button */}
                <button
                  type="button"
                  onClick={handleTicketPassClick}
                  className="group/btn bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-[11px] sm:text-xs px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-indigo-600/35 transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 shrink-0"
                >
                  <span>Reserve</span>
                  <FaArrowRight className="text-[9px] sm:text-[10px] transition-transform group-hover/btn:translate-x-0.5 shrink-0" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
