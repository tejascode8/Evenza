// import React, { useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import { FaTicketAlt } from "react-icons/fa";

// const Navbar = () => {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <nav className="bg-gray-900 shadow-lg">
//       <div className="container mx-auto px-4">
//         <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
//           <Link
//             to="/"
//             className="text-white text-2xl font-bold flex items-center gap-2"
//           >
//             <FaTicketAlt /> Evenza
//           </Link>
//           <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
//             <Link
//               to="/"
//               className="text-gray-200 hover:text-white transition cursor-pointer"
//             >
//               Events
//             </Link>
//             {user ? (
//               <>
//                 <Link
//                   to={user.role === "admin" ? "/admin" : "/dashboard"}
//                   className="text-gray-200 hover:text-white transition"
//                 >
//                   Dashboard
//                 </Link>
//                 <button
//                   onClick={handleLogout}
//                   className="bg-gray-700 hover:bg-black text-white px-4 py-2 rounded-md transition"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <>
//                 <Link
//                   to="/login"
//                   className="text-gray-200 hover:text-white transition"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   to="/register"
//                   className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-md font-semibold transition"
//                 >
//                   Sign Up
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto h-14 px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 text-white font-medium tracking-tight text-lg"
        >
          <FaTicketAlt className="text-sm" />
          <span>Evenza</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8 text-sm">
          <Link
            to="/"
            className="text-gray-300 hover:text-white transition-colors duration-200"
          >
            Events
          </Link>

          {user ? (
            <>
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-full border border-white/15 px-4 py-1.5 text-gray-300 hover:bg-white hover:text-black transition-all duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors duration-200"
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