import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../utils/axios";
import { useRealtime } from "../context/RealtimeContext";
import CustomDropdown from "../components/CustomDropdown";
import EventCardSkeleton from "../components/EventCardSkeleton";
import HeroSection from "../components/HeroSection";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSearch,
  FaRegClock,
  FaTicketAlt,
  FaShieldAlt,
  FaCompass,
  FaLock,
  FaQrcode,
  FaArrowRight,
  FaStar,
  FaCheckCircle,
  FaSortAmountDown,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaRupeeSign,
  FaChevronDown,
  FaChevronUp,
  FaLaptopCode,
  FaMusic,
  FaBriefcase,
  FaPalette,
  FaBolt,
  FaTimes,
  FaUsers,
  FaSyncAlt,
} from "react-icons/fa";

const BackgroundShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Tech Grid Background Texture */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    ></div>

    {/* Glowing Ambient Gradient Orbs */}
    <div className="absolute top-[-8%] left-[-8%] w-[45%] h-[45%] rounded-full bg-brand-300/20 blur-[120px] pointer-events-none"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/15 blur-[130px] pointer-events-none"></div>
    <div className="absolute top-[35%] right-[10%] w-[30%] h-[30%] rounded-full bg-brand-400/15 blur-[100px] pointer-events-none"></div>
  </div>
);

const SORT_OPTIONS = [
  { value: "date-asc", label: "Happening Soonest", description: "Performing first at the top", iconComponent: FaCalendarAlt },
  { value: "title-asc", label: "Alphabetical (A → Z)", description: "Order titles A to Z", iconComponent: FaSortAlphaDown },
  { value: "title-desc", label: "Alphabetical (Z → A)", description: "Reverse alphabetical order", iconComponent: FaSortAlphaUp },
  { value: "price-asc", label: "Price (Low to High)", description: "Free and lowest ticket first", iconComponent: FaRupeeSign },
  { value: "price-desc", label: "Price (High to Low)", description: "Premium tier tickets first", iconComponent: FaRupeeSign },
  { value: "date-desc", label: "Happening Latest", description: "Furthest upcoming dates", iconComponent: FaCalendarAlt },
];

const INITIAL_VISIBLE_COUNT = 6;

const ADVANTAGE_FEATURES = [
  {
    icon: FaBolt,
    title: "Instant Digital Pass",
    desc: "Generated immediately upon reservation with direct email dispatch and live dashboard QR code synchronization.",
    badge: "Under 200ms",
  },
  {
    icon: FaShieldAlt,
    title: "2FA Anti-Scalping",
    desc: "Mandatory two-factor authentication safeguards genuine attendees and permanently blocks automated ticket scalping.",
    badge: "100% Verified",
  },
  {
    icon: FaRegClock,
    title: "Real-Time Seat Engine",
    desc: "Zero-latency concurrency engine guaranteeing accurate real-time seat availability without overbooking conflicts.",
    badge: "Live Sync",
  },
  {
    icon: FaTicketAlt,
    title: "Digital Attendee Hub",
    desc: "Manage bookings, download verification passes, and seamlessly present QR credentials directly from your personal portal.",
    badge: "Self-Service",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    icon: FaCompass,
    title: "Discover Premier Events",
    desc: "Browse curated conferences, music festivals, summits, and exhibitions filtered by category, price, and date.",
  },
  {
    step: "02",
    icon: FaLock,
    title: "Reserve with 2FA Protection",
    desc: "Secure your reservation in seconds with verified dual-factor email OTP authentication and zero booking latency.",
  },
  {
    step: "03",
    icon: FaQrcode,
    title: "Scan & Enter Instantly",
    desc: "Access your digital QR ticket pass from your dashboard or email inbox and present it for swift entry at the venue.",
  },
];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-asc");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const hasScrolledRef = useRef(false);

  // Fetch initial pool of all events
  useEffect(() => {
    const fetchInitialEvents = async () => {
      try {
        const { data } = await api.get("/events");
        setAllEvents(data);
      } catch (err) {
        // Handled silently
      }
    };
    fetchInitialEvents();
  }, []);

  // Real-time Event Subscriptions (Live seat counters & catalog updates)
  useRealtime("BOOKING_CONFIRMED", (data) => {
    if (data?.eventId && data.availableSeats !== undefined) {
      setAllEvents((prev) =>
        prev.map((e) => (e._id === data.eventId ? { ...e, availableSeats: data.availableSeats } : e))
      );
      setEvents((prev) =>
        prev.map((e) => (e._id === data.eventId ? { ...e, availableSeats: data.availableSeats } : e))
      );
    }
  });

  useRealtime("BOOKING_CANCELLED", (data) => {
    if (data?.eventId && data.availableSeats !== undefined) {
      setAllEvents((prev) =>
        prev.map((e) => (e._id === data.eventId ? { ...e, availableSeats: data.availableSeats } : e))
      );
      setEvents((prev) =>
        prev.map((e) => (e._id === data.eventId ? { ...e, availableSeats: data.availableSeats } : e))
      );
    }
  });

  useRealtime("EVENT_CREATED", (data) => {
    if (data?.event) {
      setAllEvents((prev) => {
        if (prev.some((e) => e._id === data.event._id)) return prev;
        return [data.event, ...prev];
      });
      setEvents((prev) => {
        if (prev.some((e) => e._id === data.event._id)) return prev;
        return [data.event, ...prev];
      });
    }
  });

  useRealtime("EVENT_UPDATED", (data) => {
    if (data?.event) {
      setAllEvents((prev) => prev.map((e) => (e._id === data.event._id ? data.event : e)));
      setEvents((prev) => prev.map((e) => (e._id === data.event._id ? data.event : e)));
    }
  });

  useRealtime("EVENT_DELETED", (data) => {
    if (data?.eventId) {
      setAllEvents((prev) => prev.filter((e) => e._id !== data.eventId));
      setEvents((prev) => prev.filter((e) => e._id !== data.eventId));
    }
  });

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [search, selectedCategory, priceFilter, sortBy]);

  useEffect(() => {
    if ((location.hash === "#featured-events" || location.hash === "#events") && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      const el = document.getElementById("featured-events");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }, 600);
      }
    }
  }, []);

  const categories = ["", "Technology", "Music", "Business", "Art"];

  const filteredEvents = events
    .filter((event) => {
      if (priceFilter === "free") return event.ticketPrice === 0;
      if (priceFilter === "paid") return event.ticketPrice > 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "title-asc") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "title-desc") return (b.title || "").localeCompare(a.title || "");
      if (sortBy === "price-asc") return (a.ticketPrice || 0) - (b.ticketPrice || 0);
      if (sortBy === "price-desc") return (b.ticketPrice || 0) - (a.ticketPrice || 0);
      return 0;
    });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 350); // 350ms debounce
    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory]);

  const fetchEvents = async (customQuery) => {
    try {
      setLoading(true);
      const query = customQuery !== undefined ? customQuery : search;
      let url = `/events?search=${query}`;
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      const { data } = await api.get(url);
      setEvents(data);
      if (allEvents.length === 0) setAllEvents(data);
    } catch (error) {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  const scrollToEvents = () => {
    const el = document.getElementById("featured-events");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col relative w-full overflow-x-hidden">
      <BackgroundShapes />

      {/* 1. Ultra-Modern Three.js & GSAP Hero Section (Left & Right Split) */}
      <HeroSection
        allEvents={allEvents}
        scrollToEvents={scrollToEvents}
      />

      {/* 2. The Evenza Advantage Section (4-Card High-End Grid) */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="max-w-7xl w-full mx-auto bg-white/70 backdrop-blur-xl border border-slate-200/90 rounded-[2rem] sm:rounded-[2.5rem] py-10 sm:py-14 md:py-16 px-4 sm:px-8 md:px-12 flex flex-col items-center shadow-lg shadow-slate-900/5">
          
          <div className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
            <span className="inline-block text-[10px] sm:text-xs font-bold tracking-widest uppercase text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-3.5 py-1 rounded-full mb-3 shadow-2xs">
              The Evenza Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-display text-slate-900 mb-3 tracking-tight">
              Architected for Seamless Live Ticketing
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed">
              Enterprise-grade speed, ironclad authentication, and direct organizer-to-attendee ticketing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full">
            {ADVANTAGE_FEATURES.map((feat, idx) => {
              const IconComponent = feat.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-white border border-slate-200/80 hover:border-indigo-300 p-6 sm:p-7 rounded-2xl sm:rounded-3xl hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between text-left shadow-xs overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-indigo-600 group-hover:scale-105 transition-all duration-300 shadow-md">
                        <IconComponent className="text-lg text-white shrink-0" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 transition-colors bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/60">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 font-display group-hover:text-indigo-600 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed text-xs sm:text-sm font-normal">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Learn more</span>
                    <FaArrowRight className="text-[10px] ml-1.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. Main Featured Events Section */}
      <section id="featured-events" className="relative z-10 w-full flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 py-6 sm:py-8 scroll-mt-24">
        <div className="max-w-7xl w-full mx-auto bg-white/80 backdrop-blur-2xl border border-slate-200/90 rounded-[2rem] sm:rounded-[2.5rem] py-10 sm:py-14 md:py-16 px-4 sm:px-8 md:px-12 flex flex-col items-center shadow-xl shadow-slate-900/5">
          
          {/* Section Header */}
          <div className="flex flex-col items-center justify-center text-center mb-8 sm:mb-10 w-full max-w-3xl">
            <span className="inline-block text-[10px] sm:text-xs font-bold tracking-widest uppercase text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-1 rounded-full mb-3 shadow-2xs">
              {filteredEvents.length} {filteredEvents.length === 1 ? "Event" : "Events"} Available
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-display text-slate-900 tracking-tight mb-2">
              Featured Events &amp; Passes
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm md:text-base">
              Browse premier conferences, live concerts, masterclasses, and arts exhibitions.
            </p>
          </div>

          {/* Catalog Search & Filtering Toolbar */}
          <div className="w-full flex flex-col gap-4 mb-8 sm:mb-10">
            
            {/* Search Input Box */}
            <div className="w-full max-w-xl mx-auto">
              <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 transition-all p-1.5">
                <FaSearch className="text-slate-400 text-sm ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Filter events by title, artist, venue, or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-2 px-3 text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400 font-medium"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="p-1.5 text-slate-400 hover:text-slate-700 text-xs mr-1"
                    title="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Bar (Categories on Left, Price Toggle + Sort on Right) */}
            <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4 pt-2">
              
              {/* Category Navigation Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  const count = cat ? allEvents.filter((e) => e.category === cat).length : allEvents.length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedCategory(cat);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                        isActive
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm scale-102"
                          : "bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-50 border-slate-200 shadow-2xs hover:border-slate-300"
                      }`}
                    >
                      <span>{cat === "" ? "All Categories" : cat}</span>
                      {count > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Price Filter Toggle + Sort By */}
              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                {/* Price Filter Toggle (Paid | All | Free) */}
                <div className="inline-flex p-1 bg-white border border-slate-200 rounded-full shadow-2xs">
                  {[
                    { label: "All", value: "all" },
                    { label: "Paid", value: "paid" },
                    { label: "Free", value: "free" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPriceFilter(option.value);
                      }}
                      className={`px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                        priceFilter === option.value
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Custom Sort By Dropdown */}
                <CustomDropdown
                  options={SORT_OPTIONS}
                  value={sortBy}
                  onChange={setSortBy}
                  icon={FaSortAmountDown}
                  variant="pill"
                  align="right"
                />
              </div>

            </div>

          </div>

          {/* Events Grid Container */}
          <div className="w-full min-h-[500px]">
            {loading ? (
              <EventCardSkeleton count={6} />
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-20 bg-white/70 rounded-3xl text-slate-500 font-medium w-full flex flex-col items-center justify-center border border-slate-200 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <FaSearch className="text-lg" />
                </div>
                <p className="font-bold text-slate-900 text-base sm:text-lg mb-1">No Matching Events Found</p>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-4">
                  No experiences match your current filters. Try resetting the search or exploring other categories.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("");
                    setPriceFilter("all");
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
                  {filteredEvents.slice(0, visibleCount).map((event) => {
                    const isSoldOut = event.availableSeats <= 0;
                    const total = event.totalSeats || 100;
                    const available = event.availableSeats !== undefined ? event.availableSeats : 50;
                    const percentBooked = Math.min(100, Math.max(5, Math.round(((total - available) / total) * 100)));

                    return (
                      <div
                        key={event._id}
                        className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 h-full min-h-[460px]"
                      >
                        {/* Image Area */}
                        <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-900">
                          <img
                            src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"}
                            alt={event.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800";
                            }}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 opacity-95"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <span className="bg-slate-900/85 backdrop-blur-md border border-white/20 px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-white tracking-wider uppercase">
                              {event.category || "General"}
                            </span>
                          </div>

                          {/* Price Tag */}
                          <div className="absolute top-4 right-4">
                            <span className={`px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold tracking-wider shadow-md ${
                              event.ticketPrice === 0
                                ? "bg-emerald-500 text-white"
                                : "bg-white text-slate-950"
                            }`}>
                              {event.ticketPrice === 0 ? "FREE" : `₹${event.ticketPrice}`}
                            </span>
                          </div>
                        </div>

                        {/* Info Area */}
                        <div className="flex flex-col flex-grow p-5 sm:p-6 justify-between text-left">
                          <div>
                            <h3 className="text-base sm:text-lg md:text-xl font-bold font-display text-slate-900 leading-snug line-clamp-2 mb-3 group-hover:text-indigo-600 transition-colors">
                              {event.title}
                            </h3>

                            <div className="space-y-2 text-slate-500 text-xs sm:text-sm font-medium mb-5">
                              <div className="flex items-center gap-2.5">
                                <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600 text-xs shrink-0">
                                  <FaCalendarAlt />
                                </div>
                                <span className="line-clamp-1 text-slate-700">
                                  {new Date(event.date).toLocaleDateString(undefined, {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <div className="bg-rose-50 p-1.5 rounded-lg text-rose-500 text-xs shrink-0">
                                  <FaMapMarkerAlt />
                                </div>
                                <span className="line-clamp-1 text-slate-600">{event.location}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            {/* Seat Availability Progress Bar */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center text-[11px] mb-1.5 font-medium">
                                <span className="text-slate-500">Seat Capacity</span>
                                {isSoldOut ? (
                                  <span className="text-rose-600 font-bold uppercase text-[10px] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                                    Sold Out
                                  </span>
                                ) : (event.availableSeats / (event.totalSeats || 1)) <= 0.25 ? (
                                  <span className="text-amber-700 font-bold text-[10px] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                    Only {event.availableSeats} Left
                                  </span>
                                ) : (
                                  <span className="text-slate-700 font-bold text-[11px]">
                                    {event.availableSeats} / {event.totalSeats} seats
                                  </span>
                                )}
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isSoldOut
                                      ? "bg-rose-500 w-full"
                                      : (event.availableSeats / (event.totalSeats || 1)) <= 0.25
                                      ? "bg-amber-500"
                                      : "bg-indigo-600"
                                  }`}
                                  style={{ width: `${percentBooked}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Ticket Action Button */}
                            <Link
                              to={`/events/${event.slug || event._id}`}
                              className={`group/btn flex items-center justify-center gap-2 w-full text-center font-bold py-3 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                                isSoldOut
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : "bg-slate-900 hover:bg-indigo-600 text-white shadow-md hover:shadow-indigo-600/25 active:scale-98"
                              }`}
                            >
                              <span>{isSoldOut ? "Sold Out" : "Get Tickets"}</span>
                              {!isSoldOut && (
                                <FaArrowRight className="text-[10px] transition-transform group-hover/btn:translate-x-1" />
                              )}
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination (Load More / Show Less) */}
                {filteredEvents.length > INITIAL_VISIBLE_COUNT && (
                  <div className="flex flex-col items-center justify-center mt-10 sm:mt-12 pt-6 border-t border-slate-200/70 w-full">
                    {visibleCount < filteredEvents.length ? (
                      <div className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setLoadingMore(true);
                            setTimeout(() => {
                              setVisibleCount(filteredEvents.length);
                              setLoadingMore(false);
                            }, 250);
                          }}
                          disabled={loadingMore}
                          className="group px-6 py-2.5 rounded-full bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer"
                        >
                          {loadingMore ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Loading...</span>
                            </>
                          ) : (
                            <>
                              <span>Load More Experiences</span>
                              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">
                                +{filteredEvents.length - visibleCount}
                              </span>
                              <FaChevronDown className="text-[10px] text-slate-300 group-hover:translate-y-0.5 transition-transform" />
                            </>
                          )}
                        </button>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Showing {visibleCount} of {filteredEvents.length} events
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setVisibleCount(INITIAL_VISIBLE_COUNT);
                            scrollToEvents();
                          }}
                          className="group px-5 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                        >
                          <span>Show Less</span>
                          <FaChevronUp className="text-[10px] text-slate-400 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Showing all {filteredEvents.length} events
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </section>

      {/* 4. How Evenza Works Section */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl w-full mx-auto bg-white/70 backdrop-blur-xl border border-slate-200/90 rounded-[2rem] sm:rounded-[2.5rem] py-10 sm:py-14 md:py-16 px-4 sm:px-8 md:px-12 flex flex-col items-center shadow-lg shadow-slate-900/5">
          
          <div className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
            <span className="inline-block text-[10px] sm:text-xs font-bold tracking-widest uppercase text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-3.5 py-1 rounded-full mb-3 shadow-2xs">
              Simple &amp; Effortless
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-display text-slate-900 mb-3 tracking-tight">
              How Evenza Works
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed">
              Get your digital pass in 3 straightforward steps and start making unforgettable memories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full">
            {HOW_IT_WORKS_STEPS.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-slate-50/90 hover:bg-white border border-slate-200/90 hover:border-indigo-300 p-6 sm:p-8 rounded-3xl flex flex-col items-start text-left hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <span className="text-5xl sm:text-6xl font-extrabold font-display text-slate-200/70 absolute top-4 right-6 select-none group-hover:text-indigo-100 transition-colors">
                    {item.step}
                  </span>

                  <div className="w-12 h-12 rounded-2xl bg-slate-900 group-hover:bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md transition-all duration-300 group-hover:scale-105">
                    <IconComp className="text-lg text-white shrink-0" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2.5 font-display group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. Call To Action (Host & Attend) */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="relative max-w-7xl w-full mx-auto bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] py-12 sm:py-16 md:py-20 px-6 sm:px-12 md:px-16 flex flex-col items-center text-center shadow-2xl shadow-indigo-950/20 overflow-hidden">
          
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <span className="inline-block text-[10px] sm:text-xs font-bold tracking-widest uppercase text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 rounded-full mb-4 shadow-sm">
              Live Ticketing Platform
            </span>

            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white mb-4 leading-tight">
              Ready to Experience the Next Extraordinary Event?
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed mb-8 max-w-2xl font-normal">
              Join thousands of attendees discovering extraordinary live concerts, tech summits, masterclasses, and arts exhibitions.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={scrollToEvents}
                className="w-full sm:w-auto px-7 sm:px-9 py-3.5 sm:py-4 bg-white hover:bg-indigo-50 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm transition-all duration-200 shadow-lg hover:shadow-white/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <FaCompass className="text-indigo-600 text-sm" />
                <span>Explore Featured Events</span>
                <FaArrowRight className="text-xs text-indigo-600" />
              </button>

              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl text-xs sm:text-sm border border-white/15 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 active:scale-95"
              >
                <FaTicketAlt className="text-indigo-300 text-xs" />
                <span>My Ticket Dashboard</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Comprehensive Responsive Footer */}
      <footer className="relative z-10 w-full border-t border-slate-200/90 bg-white/95 backdrop-blur-md pt-10 sm:pt-14 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-8 sm:mb-12 text-left">
            
            {/* Brand Column (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-start">
              <Link
                to="/"
                onClick={(e) => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2.5 text-black font-bold tracking-tight text-xl sm:text-2xl hover:opacity-90 transition-opacity origin-left group mb-3 inline-flex"
              >
                <div className="bg-black text-white p-2 rounded-xl shadow-md shadow-black/20 group-hover:rotate-12 transition-transform duration-300">
                  <FaTicketAlt className="text-xs sm:text-sm text-white" />
                </div>
                <span className="font-display tracking-tighter text-slate-900 text-xl sm:text-2xl">Evenza</span>
              </Link>

              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4 max-w-sm">
                The premier event booking and digital pass management platform powered by 2FA verification and instant digital QR ticketing.
              </p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] sm:text-xs font-semibold text-emerald-700">
                <FaCheckCircle className="text-emerald-500 text-xs shrink-0" />
                <span>Verified &amp; 2FA Secure Platform</span>
              </div>
            </div>

            {/* Quick Links & Categories (5 cols) */}
            <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:col-span-5">
              
              {/* Explore Column */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3 sm:mb-4 font-display">
                  Explore
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li>
                    <button
                      type="button"
                      onClick={scrollToEvents}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      Featured Events
                    </button>
                  </li>
                  <li>
                    <Link to="/login" className="hover:text-indigo-600 transition-colors">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="hover:text-indigo-600 transition-colors">
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
                      Attendee Portal
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Categories Column */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3 sm:mb-4 font-display">
                  Categories
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {["Technology", "Music", "Business", "Art"].map((cat) => (
                    <li key={cat}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          scrollToEvents();
                        }}
                        className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                      >
                        {cat} Events
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Security Trust Column (3 cols) */}
            <div className="lg:col-span-3 flex flex-col justify-start">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3 sm:mb-4 font-display">
                Security &amp; Encryption
              </h4>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-3">
                All booking passes, transfers, and accounts are protected with mandatory 2FA OTP verification.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 flex items-center gap-3 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FaShieldAlt className="text-sm text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">256-Bit Encrypted</p>
                  <p className="text-[11px] text-slate-500">End-to-end ticketing security</p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Legal Bar */}
          <div className="border-t border-slate-200 pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-slate-500 text-center sm:text-left">
            <p className="order-2 sm:order-1">
              &copy; {new Date().getFullYear()} Evenza Inc. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 order-1 sm:order-2">
              <span className="hover:text-slate-900 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="text-slate-300">&bull;</span>
              <span className="hover:text-slate-900 cursor-pointer transition-colors">Terms of Service</span>
              <span className="text-slate-300">&bull;</span>
              <span className="hover:text-slate-900 cursor-pointer transition-colors">Security Overview</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Home;
