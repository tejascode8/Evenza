import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaTicketAlt,
  FaShieldAlt,
  FaQrcode,
  FaStar,
  FaArrowLeft,
  FaMagic,
  FaCheckCircle,
} from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!showOTP) {
        const data = await login(email, password);
        if (data.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      } else {
        const data = await verifyOTP(email, otp);
        if (data.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      }
    } catch (err) {
      if (err.needsVerification) {
        setShowOTP(true);
        setError("Account verification required. A new OTP has been sent to your email.");
      } else {
        setError(err.message || err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillAdmin = () => {
    setEmail("admin@evenza.com");
    setPassword("Admin@12345");
    setError("");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-gradient-to-b from-slate-50 via-white to-slate-100/60">
      {/* Subtle Background Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-200/30 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-slate-200/50 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* Left Side: Luxury Dark Showcase Panel */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-8 xl:p-10 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Backlight */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            {/* Top Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold tracking-wide text-slate-200 mb-8 backdrop-blur-md">
              <FaTicketAlt className="text-brand-400 text-xs" />
              <span>Evenza Premier Access</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl xl:text-4xl font-bold font-display leading-tight tracking-tight text-white mb-4">
              Step Into Extraordinary <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-200 to-white">
                Live Experiences.
              </span>
            </h1>

            <p className="text-slate-400 text-sm xl:text-base leading-relaxed mb-8">
              Access your digital ticket vault, discover premier summits and masterclasses, and manage your bookings effortlessly.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
                  <FaQrcode className="text-sm" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instant QR Passes</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">One-tap entry verification at every venue.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <FaShieldAlt className="text-sm" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Guaranteed Seat Protection</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Real-time inventory with zero double-booking.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Footer */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between mt-8">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img
                  className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                  alt="User"
                />
                <img
                  className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
                  alt="User"
                />
                <img
                  className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
                  alt="User"
                />
              </div>
              <span className="text-xs text-slate-300 font-medium">Joined by 10,000+ members</span>
            </div>

            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <FaStar className="text-[10px]" />
              <span>4.9 / 5</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Authentication Form Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto flex flex-col justify-center">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-900/5 relative">
            
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <FaArrowLeft className="text-[10px]" />
                <span>Back to Home</span>
              </Link>

              {/* Demo Admin Quick-Fill Pill */}
              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200/80 cursor-pointer"
                title="Fill Demo Admin Credentials"
              >
                <FaMagic className="text-brand-500 text-[10px]" />
                <span>Demo Admin</span>
              </button>
            </div>

            {/* Header */}
            <div className="text-left mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                {showOTP ? "Verify Your Account" : "Welcome Back"}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
                {showOTP
                  ? "Enter the 6-digit verification code sent to your email."
                  : "Sign in to access your bookings and dashboard."}
              </p>
            </div>

            {/* Error / Alert Banner */}
            {error && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-2xl text-xs font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                <span>{error}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!showOTP ? (
                <>
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <FaEnvelope className="text-xs" />
                      </div>
                      <input
                        type="email"
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition-all text-xs sm:text-sm text-slate-900 placeholder-slate-400"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password Input with Show/Hide Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <FaLock className="text-xs" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition-all text-xs sm:text-sm text-slate-900 placeholder-slate-400"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* OTP Verification Step */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                      6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <FaKey className="text-xs" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="000000"
                        className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition-all font-mono font-bold tracking-[0.4em] text-center text-xl text-slate-900 shadow-2xs"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength="6"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOTP(false);
                      setOtp("");
                      setError("");
                    }}
                    className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    ← Back to Email & Password
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (showOTP && otp.length !== 6)}
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition-all duration-200 shadow-xs flex items-center justify-center gap-2 mt-2 cursor-pointer ${
                  loading || (showOTP && otp.length !== 6)
                    ? "bg-slate-300 cursor-not-allowed shadow-none text-slate-500"
                    : "bg-slate-900 hover:bg-black active:scale-[0.99]"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : showOTP ? (
                  <>
                    <FaCheckCircle className="text-xs" />
                    <span>Verify & Continue</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Switch to Sign Up */}
            {!showOTP && (
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-slate-900 font-bold hover:underline transition-all"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
