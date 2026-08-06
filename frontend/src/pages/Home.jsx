import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSearch,
  FaRegClock,
  FaTicketAlt,
  FaShieldAlt,
} from "react-icons/fa";

const SparkleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.reset();
      }

      reset() {
        this.x = Math.random() * this.width;
        this.y = Math.random() * this.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.speedY = -Math.random() * 0.25 - 0.05;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.fadeSpeed = Math.random() * 0.003 + 0.001;
        
        // Premium Apple style colors (Blue, Purple, Silver)
        const rand = Math.random();
        if (rand > 0.6) this.color = "#0071e3"; // Apple Blue
        else if (rand > 0.3) this.color = "#5856d6"; // Apple Purple
        else this.color = "#86868b"; // Apple Silver
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= this.fadeSpeed;

        if (this.opacity <= 0 || this.y < 0 || this.x < 0 || this.x > this.width) {
          this.reset();
        }
      }

      draw(context) {
        context.save();
        context.globalAlpha = this.opacity;
        context.shadowBlur = this.size * 2;
        context.shadowColor = this.color;
        
        // Occasionally draw 4-pointed stars/sparkles
        if (this.size > 1.8 && Math.random() > 0.99) {
          context.beginPath();
          context.moveTo(this.x, this.y - this.size * 2.5);
          context.lineTo(this.x + this.size / 2, this.y - this.size / 2);
          context.lineTo(this.x + this.size * 2.5, this.y);
          context.lineTo(this.x + this.size / 2, this.y + this.size / 2);
          context.lineTo(this.x, this.y + this.size * 2.5);
          context.lineTo(this.x - this.size / 2, this.y + this.size / 2);
          context.lineTo(this.x - this.size * 2.5, this.y);
          context.lineTo(this.x - this.size / 2, this.y - this.size / 2);
          context.closePath();
          context.fillStyle = this.color;
          context.fill();
        } else {
          context.beginPath();
          context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          context.fillStyle = this.color;
          context.fill();
        }
        context.restore();
      }
    }

    const particles = Array.from({ length: 35 }, () => new Particle(canvas.width, canvas.height));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

const Home = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Categories list
  const categories = ["", "Technology", "Music", "Business", "Art"];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 400); // 400ms debounce
    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let url = `/events?search=${search}`;
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      const { data } = await api.get(url);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-[#1d1d1f] font-sans selection:bg-[#0071e3] selection:text-white">
      {/* Hero Section - Apple Reveal Style with Sparkle Canvas */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#f5f5f7] to-white border border-[#e8e8ed] py-16 md:py-24 px-6 text-center flex flex-col items-center mb-16 shadow-sm">
        <SparkleCanvas />
        
        {/* Relative z-10 wrapper to make sure text is on top of canvas */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#86868b] uppercase mb-4 animate-fade-in-up opacity-0">
            <span className="w-2 h-2 rounded-full bg-[#30d158] shadow-[0_0_8px_#30d158] animate-pulse"></span>
            what's next?
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1d1d1f] leading-none mb-6 animate-fade-in-up delay-100 opacity-0">
            Discover remarkable experiences<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] to-[#4198ff]">
              Closer than ever
            </span>
          </h1>
          <p className="text-[#86868b] text-lg md:text-xl max-w-2xl mx-auto font-normal leading-relaxed mb-10 px-4 animate-fade-in-up delay-200 opacity-0">
            A destination for premium events, meaningful connections, and extraordinary experiences designed around you.
          </p>

          {/* Apple Style Search Bar */}
          <div className="w-full max-w-xl mx-auto px-4 animate-fade-in-up delay-300 opacity-0">
            <div className="relative flex items-center shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-[#0071e3] focus-within:ring-4 focus-within:ring-[#0071e3]/10 transition-all duration-300 rounded-full bg-white border border-[#d2d2d7] overflow-hidden">
              <FaSearch className="absolute left-5 text-[#86868b] text-lg transition-transform duration-300" />
              <input
                type="text"
                placeholder="Search by event title..."
                className="w-full pl-14 pr-6 py-4 rounded-full text-base text-[#1d1d1f] bg-white focus:outline-none transition-all placeholder-[#86868b] font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid - Apple Spec-style Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 px-2 animate-fade-in-up delay-400 opacity-0">
        <div className="group bg-white p-8 rounded-[24px] border border-[#e8e8ed] flex flex-col items-start text-left hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:border-[#d2d2d7] transition-all duration-500 ease-out">
          <div className="w-12 h-12 bg-[#f5f5f7] text-[#1d1d1f] rounded-full flex items-center justify-center text-lg mb-6 group-hover:bg-[#0071e3] group-hover:text-white transition-colors duration-500">
            <FaRegClock />
          </div>
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">Instant Booking</h3>
          <p className="text-[#86868b] text-sm leading-relaxed">
            Secure tickets instantly with our streamlined checkout infrastructure.
          </p>
        </div>
        <div className="group bg-white p-8 rounded-[24px] border border-[#e8e8ed] flex flex-col items-start text-left hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:border-[#d2d2d7] transition-all duration-500 ease-out">
          <div className="w-12 h-12 bg-[#f5f5f7] text-[#1d1d1f] rounded-full flex items-center justify-center text-lg mb-6 group-hover:bg-[#0071e3] group-hover:text-white transition-colors duration-500">
            <FaTicketAlt />
          </div>
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">My Tickets Dashboard</h3>
          <p className="text-[#86868b] text-sm leading-relaxed">
            Access and manage all your booking requests directly from one secure personal portal.
          </p>
        </div>
        <div className="group bg-white p-8 rounded-[24px] border border-[#e8e8ed] flex flex-col items-start text-left hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:border-[#d2d2d7] transition-all duration-500 ease-out">
          <div className="w-12 h-12 bg-[#f5f5f7] text-[#1d1d1f] rounded-full flex items-center justify-center text-lg mb-6 group-hover:bg-[#0071e3] group-hover:text-white transition-colors duration-500">
            <FaShieldAlt />
          </div>
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">Verified Registrations</h3>
          <p className="text-[#86868b] text-sm leading-relaxed">
            All user signups and critical bookings are secured with mandatory 2FA OTP technology.
          </p>
        </div>
      </div>

      {/* Category Navigation (Apple Store Pills) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12 px-2 animate-scale-in delay-200 opacity-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 transform active:scale-95 ${
              selectedCategory === cat
                ? "bg-[#1d1d1f] text-white shadow-md scale-102"
                : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed] hover:text-[#1d1d1f] border border-transparent"
            }`}
          >
            {cat === "" ? "All Events" : cat}
          </button>
        ))}
      </div>

      {/* Upcoming Section Header */}
      <div className="flex items-end justify-between mb-8 px-4 animate-scale-in delay-300 opacity-0">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
          Featured Events
        </h2>
        <div className="text-sm text-[#86868b] font-medium transition-all duration-300">
          {events.length} {events.length === 1 ? "event" : "events"} found
        </div>
      </div>

      {/* Events Grid with smooth fade-in loading */}
      {loading ? (
        <div className="text-center py-24 text-lg font-medium text-[#86868b] animate-pulse">
          Loading catalog...
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[24px] border border-[#e8e8ed] text-lg text-[#86868b] font-medium px-4 animate-scale-in">
          No matches found. Try searching for something else.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24 animate-scale-in">
          {events.map((event) => {
            const isSoldOut = event.availableSeats <= 0;
            return (
              <div
                key={event._id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-white border border-[#e8e8ed] hover:border-[#d2d2d7] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-500 ease-out h-[440px]"
              >
                {/* Image & Price Area */}
                <div className="relative h-52 overflow-hidden bg-[#f5f5f7]">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-104"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#86868b] font-bold text-lg uppercase tracking-wider">
                      {event.category || "Event"}
                    </div>
                  )}
                  {/* Category Pill */}
                  <div className="absolute top-4 left-4 transition-transform duration-300 group-hover:translate-x-0.5">
                    <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold tracking-wider text-white border border-white/10 uppercase">
                      {event.category}
                    </span>
                  </div>
                  {/* Price Tag */}
                  <div className="absolute top-4 right-4 transition-transform duration-300 group-hover:-translate-x-0.5">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider ${
                      event.ticketPrice === 0 
                        ? "bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20" 
                        : "bg-white text-[#1d1d1f] shadow-sm border border-[#e8e8ed]"
                    }`}>
                      {event.ticketPrice === 0 ? "FREE" : `₹${event.ticketPrice}`}
                    </span>
                  </div>
                </div>

                {/* Information Area */}
                <div className="flex flex-col flex-grow p-6 justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#1d1d1f] tracking-tight leading-snug line-clamp-2 mb-3 group-hover:text-[#0071e3] transition-colors duration-300">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 text-[#86868b] text-xs font-medium mb-4">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-[#86868b]/70 shrink-0" />
                        <span className="line-clamp-1">
                          {new Date(event.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-[#86868b]/70 shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seat availability progress & Link */}
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between text-[11px] text-[#86868b] mb-1.5 font-semibold">
                        <span>Available Seats</span>
                        <span>{event.availableSeats} / {event.totalSeats}</span>
                      </div>
                      <div className="w-full bg-[#e8e8ed] rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-1 rounded-full transition-all duration-1000 ease-out ${
                            isSoldOut
                              ? "bg-red-500"
                              : (event.availableSeats / event.totalSeats) < 0.2
                              ? "bg-[#ff9500]"
                              : "bg-[#0071e3]"
                          }`}
                          style={{
                            width: `${(event.availableSeats / event.totalSeats) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <Link
                      to={`/events/${event.slug || event._id}`}
                      className={`block w-full text-center font-semibold py-2.5 rounded-full text-xs transition-all duration-300 transform active:scale-98 ${
                        isSoldOut
                          ? "bg-[#f5f5f7] text-[#86868b] cursor-not-allowed"
                          : "bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm hover:shadow-md hover:scale-[1.01]"
                      }`}
                    >
                      {isSoldOut ? "Sold Out" : "View Ticket Details"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Section - Apple Style Directory Footer */}
      <footer className="mt-auto pt-16 pb-8 border-t border-[#e8e8ed] text-xs text-[#86868b] animate-scale-in delay-400 opacity-0">
        {/* Directory Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 px-2">
          <div>
            <h4 className="text-[#1d1d1f] font-semibold mb-3">Explore Events</h4>
            <ul className="space-y-2.5">
              <li><button onClick={() => setSelectedCategory("Technology")} className="hover:text-[#1d1d1f] hover:underline transition-colors text-left focus:outline-none">Technology</button></li>
              <li><button onClick={() => setSelectedCategory("Music")} className="hover:text-[#1d1d1f] hover:underline transition-colors text-left focus:outline-none">Music</button></li>
              <li><button onClick={() => setSelectedCategory("Business")} className="hover:text-[#1d1d1f] hover:underline transition-colors text-left focus:outline-none">Business</button></li>
              <li><button onClick={() => setSelectedCategory("Art")} className="hover:text-[#1d1d1f] hover:underline transition-colors text-left focus:outline-none">Art</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#1d1d1f] font-semibold mb-3">Account</h4>
            <ul className="space-y-2.5">
              <li><Link to="/dashboard" className="hover:text-[#1d1d1f] hover:underline transition-colors">Manage Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-[#1d1d1f] hover:underline transition-colors">Login / Sign In</Link></li>
              <li><Link to="/register" className="hover:text-[#1d1d1f] hover:underline transition-colors">Create Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#1d1d1f] font-semibold mb-3">Evenza Values</h4>
            <ul className="space-y-2.5">
              <li className="cursor-default hover:text-[#1d1d1f] transition-colors">Verified Attendees</li>
              <li className="cursor-default hover:text-[#1d1d1f] transition-colors">Fraud Prevention</li>
              <li className="cursor-default hover:text-[#1d1d1f] transition-colors">2FA Security</li>
              <li className="cursor-default hover:text-[#1d1d1f] transition-colors">Seamless Booking</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#1d1d1f] font-semibold mb-3">About Evenza</h4>
            <p className="leading-relaxed text-[#86868b]">
              The simplest, most dynamic way to manage, discover, and host world-class events in your local area. Designed for modern creators.
            </p>
          </div>
        </div>

        {/* Bottom Copyright & Legal links */}
        <div className="pt-8 border-t border-[#e8e8ed] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[11px]">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
            <span className="text-[#1d1d1f] font-semibold flex items-center gap-1.5 mb-1 md:mb-0">
              <FaTicketAlt className="text-xs animate-pulse" /> Evenza
            </span>
            <span>Copyright &copy; {new Date().getFullYear()} Evenza Inc. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="hover:text-[#1d1d1f] transition-colors duration-200 cursor-pointer">Privacy Policy</span>
            <span className="text-gray-300">|</span>
            <span className="hover:text-[#1d1d1f] transition-colors duration-200 cursor-pointer">Terms of Use</span>
            <span className="text-gray-300">|</span>
            <span className="hover:text-[#1d1d1f] transition-colors duration-200 cursor-pointer">Sales and Refunds</span>
            <span className="text-gray-300">|</span>
            <span className="hover:text-[#1d1d1f] transition-colors duration-200 cursor-pointer">Legal</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
