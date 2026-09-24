import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaTicketAlt, FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaCalendarAlt, FaChevronDown } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle Scroll to toggle glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle clicking outside of dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEventsClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("featured-events");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/#featured-events");
    }
  };

  // Helper to check if link is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all duration-200 text-xs sm:text-sm font-semibold shadow-2xs ${
        isActive(to) 
          ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
          : 'bg-white/90 border-slate-200/90 text-slate-700 hover:bg-white hover:border-slate-300 hover:text-slate-900'
      }`}
    >
      <Icon className={isActive(to) ? 'text-white text-xs' : 'text-slate-400 text-xs'} />
      <span>{children}</span>
    </Link>
  );

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass py-2 sm:py-2.5 border-b border-white/20 shadow-xs' : 'bg-transparent py-2.5 sm:py-3.5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 text-black font-bold tracking-tight text-xl sm:text-2xl hover:opacity-90 transition-opacity origin-left group"
        >
          <div className="bg-black text-white p-1.5 sm:p-2 rounded-xl shadow-md shadow-black/20 group-hover:rotate-12 transition-transform duration-300">
            <FaTicketAlt className="text-xs sm:text-sm text-white" />
          </div>
          <span className="font-display tracking-tighter text-slate-900 text-lg sm:text-xl font-bold">Evenza</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 mr-1">
            <button
              type="button"
              onClick={handleEventsClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200/90 bg-white/90 hover:bg-white hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-all duration-200 text-xs sm:text-sm font-semibold shadow-2xs"
            >
              <FaCalendarAlt className="text-slate-400 text-xs" />
              <span>Events</span>
            </button>
            {user && (
              <NavLink to={user.role === "admin" ? "/admin" : "/dashboard"} icon={FaTachometerAlt}>
                Dashboard
              </NavLink>
            )}
          </div>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-slate-200/90 bg-white shadow-xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm max-w-[95px] truncate">{user.name || 'User'}</span>
                  <FaChevronDown className={`text-[10px] text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-slate-800' : 'group-hover:text-slate-600'}`} />
                </div>
              </button>

              {/* Profile Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 glass bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden animate-fade-in-up origin-top-right z-50">
                  <div className="p-3.5 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account</p>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        user.role === "admin"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-brand-50 text-brand-700 border-brand-200"
                      }`}>
                        {user.role === "admin" ? "Admin" : "Member"}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name || "User"}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <Link
                      to={user.role === "admin" ? "/admin" : "/dashboard"}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <FaTachometerAlt className="text-slate-400 text-xs" />
                      <span>{user.role === "admin" ? "Admin Command Center" : "My Bookings"}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => { handleLogout(); setDropdownOpen(false); }}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <FaSignOutAlt className="text-rose-400 text-xs" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="rounded-xl bg-slate-900 px-4 sm:px-4.5 py-1.5 sm:py-2 text-xs sm:text-sm text-white font-semibold hover:bg-black shadow-xs hover:shadow-md transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden relative w-8 h-8 sm:w-9 sm:h-9 flex flex-col items-center justify-center gap-1 glass rounded-lg text-slate-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className={`block w-4 h-0.5 bg-current transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-4 h-0.5 bg-current transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-4 h-0.5 bg-current transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div className={`md:hidden absolute top-full left-0 w-full glass bg-white/95 border-b border-white/20 shadow-2xl transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-[500px] opacity-100 py-3' : 'max-h-0 opacity-0 py-0'}`}>
        <div className="px-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => {
              handleEventsClick(e);
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold transition-all text-slate-700 hover:bg-slate-50 text-left w-full shadow-2xs"
          >
            <FaCalendarAlt className="text-slate-400 text-xs" />
            <span>Explore Events</span>
          </button>

          {user ? (
            <>
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
                  isActive('/admin') || isActive('/dashboard')
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaTachometerAlt className={isActive('/admin') || isActive('/dashboard') ? 'text-white text-xs' : 'text-slate-400 text-xs'} />
                <span>{user.role === "admin" ? "Admin Command Center" : "Dashboard"}</span>
              </Link>

              <div className="h-px bg-slate-100 my-1"></div>
              
              <div className="flex items-center gap-2.5 p-2 bg-slate-50/80 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-800">{user.name || 'User'}</p>
                  <p className="text-[11px] text-slate-400">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2.5 w-full text-left p-2.5 rounded-xl border border-rose-100 bg-rose-50/50 text-xs text-rose-600 font-semibold hover:bg-rose-50 transition-colors"
              >
                <FaSignOutAlt className="text-xs text-rose-500" />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100">
              <Link
                to="/login"
                className="w-full text-center rounded-xl bg-slate-900 py-2.5 text-xs text-white font-semibold hover:bg-black shadow-sm transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;