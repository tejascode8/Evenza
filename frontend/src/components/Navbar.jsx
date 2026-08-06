

import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaTicketAlt } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
<header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-2xl ">
      <div className="max-w-7xl mx-auto h-10 px-1 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 text-white font-medium tracking-tight text-lg"
        >
          {/* <FaTicketAlt className="text-sm" /> */}
          <span>Evenza</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8 text-sm">
          <Link
            to="/"
            className="text-gray-200 hover:text-white transition-colors duration-200"
          >
            Events
          </Link>

          {user ? (
            <>
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                className="text-gray-200 hover:text-white transition-colors duration-200"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-full border border-white/15 px-4 py-1.5 text-gray-200 hover:bg-white hover:text-black transition-all duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-200 hover:text-white transition-colors duration-200"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-white px-5 py-1.5 text-black font-medium hover:bg-gray-200 transition-all duration-300"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;