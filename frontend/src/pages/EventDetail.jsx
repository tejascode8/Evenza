import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import EventDetailSkeleton from '../components/EventDetailSkeleton';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaChair,
  FaArrowLeft,
  FaShieldAlt,
  FaCheckCircle,
  FaTicketAlt,
  FaRegClock,
  FaQrcode,
  FaCreditCard,
  FaShareAlt,
  FaInfoCircle,
  FaLock,
  FaUsers,
  FaCheck
} from 'react-icons/fa';

const BackgroundShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full bg-brand-300/15 blur-[100px] animate-blob"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] animate-blob delay-200"></div>
  </div>
);

const EventDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${slug}`);
        setEvent(data);
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  // Real-time Event Subscriptions (Live seat counters & event updates)
  useRealtime("BOOKING_CONFIRMED", (data) => {
    if (event && (data?.eventId === event._id || data?.eventId === event.slug)) {
      if (data.availableSeats !== undefined) {
        setEvent((prev) => (prev ? { ...prev, availableSeats: data.availableSeats } : prev));
      }
    }
  });

  useRealtime("BOOKING_CANCELLED", (data) => {
    if (event && (data?.eventId === event._id || data?.eventId === event.slug)) {
      if (data.availableSeats !== undefined) {
        setEvent((prev) => (prev ? { ...prev, availableSeats: data.availableSeats } : prev));
      }
    }
  });

  useRealtime("EVENT_UPDATED", (data) => {
    if (event && data?.event && (data.event._id === event._id || data.event.slug === event.slug)) {
      setEvent(data.event);
    }
  });

  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOTP = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const { data } = await api.post('/bookings/send-otp');
      setShowOTP(true);
      setOtp('');
      setResendCooldown(30);
      setSuccessMsg(data.message || `A 6-digit verification code has been sent to ${user.email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBooking = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!showOTP) {
      handleSendOTP();
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code sent to your email.');
      return;
    }

    setBookingLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const { data } = await api.post('/bookings', { eventId: event._id, otp });
      setSuccessMsg(data.message || 'Ticket reserved successfully! Your pass is ready.');
      setBookingSuccessData(data.booking || data);
      setShowOTP(false);
      setEvent((prev) => ({ ...prev, availableSeats: Math.max(0, prev.availableSeats - 1) }));
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelOTP = () => {
    setShowOTP(false);
    setOtp('');
    setError('');
    setSuccessMsg('');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="relative w-full overflow-x-hidden">
        <BackgroundShapes />
        <EventDetailSkeleton />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
        <BackgroundShapes />
        <div className="text-center bg-white border border-slate-200 p-8 sm:p-12 rounded-3xl max-w-md shadow-sm">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-2">Event Not Found</h2>
          <p className="text-slate-500 text-xs sm:text-sm mb-6">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  const isSoldOut = event.availableSeats <= 0;
  const isFree = event.ticketPrice === 0;

  return (
    <div className="flex flex-col relative w-full overflow-x-hidden min-h-screen bg-slate-50/50">
      <BackgroundShapes />

      <main className="relative z-10 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-24">
        
        {/* Navigation & Breadcrumbs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Events</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
              title="Copy event link"
            >
              <FaShareAlt className="text-xs" />
              <span>{copiedLink ? "Link Copied!" : "Share Event"}</span>
            </button>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              {event.category || "General"}
            </span>
          </div>
        </div>

        {/* 2-Column Event Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* Left Column (Main Event Overview & Details) - Span 7 */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Event Media Cover Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
              <div className="relative h-60 sm:h-80 md:h-[400px] w-full bg-slate-900 overflow-hidden">
                <img
                  src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"}
                  alt={event.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800";
                  }}
                  className="w-full h-full object-cover object-center"
                />
                
                {/* Floating category tag */}
                <div className="absolute top-4 left-4">
                  <span className="glass-dark px-3.5 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-md">
                    {event.category}
                  </span>
                </div>

                {/* Floating price badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-lg ${
                    isFree ? "bg-emerald-500 text-white" : "bg-white text-slate-900"
                  }`}>
                    {isFree ? "FREE PASS" : `₹${event.ticketPrice}`}
                  </span>
                </div>
              </div>

              {/* Title & Fast Info Bar */}
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-2">
                  <FaCheckCircle className="text-emerald-500" />
                  <span>Verified Evenza Experience</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-slate-900 leading-tight mb-4">
                  {event.title}
                </h1>

                {/* Quick 3-Pillar Meta Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                      <FaCalendarAlt className="text-sm" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase text-slate-400">Date & Schedule</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        {new Date(event.date).toLocaleDateString(undefined, {
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                      <FaMapMarkerAlt className="text-sm" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase text-slate-400">Venue Location</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                        {event.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About This Event Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <FaInfoCircle className="text-slate-400 text-base" />
                <span>About This Experience</span>
              </h2>
              
              <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                {event.description ? (
                  event.description.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))
                ) : (
                  <p>Join us for an extraordinary experience featuring premier speakers, engaging workshops, and world-class networking opportunities.</p>
                )}
              </div>

              {/* What's Included Section */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-3.5 font-display">
                  What's Included With Your Pass
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
                  {[
                    "Instant digital QR boarding pass",
                    "Full event admission & access",
                    "2FA verified attendee protection",
                    "Manage & download pass anytime",
                    "24/7 organizer & support desk",
                    "Access to official event updates"
                  ].map((perk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] shrink-0 font-bold">
                        <FaCheck />
                      </div>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Sticky Reservation & Checkout Card) - Span 5 */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              
              {/* Header: Price & Status */}
              <div className="flex items-start justify-between gap-3 pb-5 border-b border-slate-100 mb-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Admission Price
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
                      {isFree ? "Free Entry" : `₹${event.ticketPrice}`}
                    </span>
                    {!isFree && <span className="text-xs text-slate-400 font-medium">/ attendee</span>}
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  isSoldOut
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {isSoldOut ? "Sold Out" : "Available"}
                </span>
              </div>

              {/* Seat Capacity Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <FaChair className="text-slate-400" />
                    <span>Seats Remaining</span>
                  </span>
                  <span className={isSoldOut ? "text-rose-500 font-bold" : "text-slate-900 font-bold"}>
                    {event.availableSeats} / {event.totalSeats} seats
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      isSoldOut
                        ? "bg-rose-500"
                        : event.availableSeats / event.totalSeats < 0.2
                        ? "bg-amber-500"
                        : "bg-black"
                    }`}
                    style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Booking Feedback Alerts */}
              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}

              {successMsg && !bookingSuccessData && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
                  {successMsg}
                </div>
              )}

              {/* OTP Input Form State */}
              {showOTP && !bookingSuccessData && (
                <form onSubmit={handleBooking} className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <FaLock className="text-slate-500" />
                      <span>Enter 6-Digit Email OTP</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelOTP}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    placeholder="• • • • • •"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl font-mono text-center text-xl tracking-[0.35em] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && otp.length === 6) {
                        handleBooking(e);
                      }
                    }}
                  />
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 px-0.5">
                    <span>Sent to <span className="font-semibold text-slate-700">{user?.email}</span></span>
                    
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || bookingLoading}
                      onClick={handleSendOTP}
                      className={`font-semibold transition-colors ${
                        resendCooldown > 0
                          ? "text-slate-400 cursor-not-allowed"
                          : "text-slate-900 hover:underline"
                      }`}
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                  </div>
                </form>
              )}

              {/* Success State Card */}
              {bookingSuccessData ? (
                <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2.5 text-lg shadow-sm">
                    <FaCheck />
                  </div>
                  <h4 className="font-bold text-emerald-950 text-base mb-1">
                    {bookingSuccessData.status === 'confirmed' ? 'Booking Confirmed!' : 'Booking Request Submitted!'}
                  </h4>
                  <p className="text-emerald-800 text-xs mb-3 leading-relaxed">
                    {bookingSuccessData.status === 'confirmed'
                      ? 'Your digital boarding pass is active and confirmed.'
                      : 'Your 2FA verification was successful. Your pass is now pending admin confirmation.'}
                  </p>

                  <div className="bg-white/90 border border-emerald-200/80 rounded-xl p-3 mb-4 text-xs text-left space-y-1.5 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pass Reference:</span>
                      <span className="font-mono font-bold text-slate-800">
                        #{bookingSuccessData._id ? bookingSuccessData._id.slice(-8).toUpperCase() : 'PASS-PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-bold text-emerald-700 uppercase text-[11px]">
                        {bookingSuccessData.status || 'pending'}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-black hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    <FaTicketAlt className="text-xs" />
                    <span>View in Attendee Dashboard</span>
                  </Link>
                </div>
              ) : (
                /* Primary Checkout Action Button */
                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={isSoldOut || bookingLoading || (showOTP && otp.length !== 6)}
                  className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                    isSoldOut
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-black hover:bg-slate-800 text-white"
                  }`}
                >
                  <FaTicketAlt className="text-xs" />
                  <span>
                    {bookingLoading
                      ? "Processing Verification..."
                      : showOTP
                      ? "Verify OTP & Confirm Ticket"
                      : isSoldOut
                      ? "Sold Out"
                      : !user
                      ? "Sign In to Book Pass"
                      : isFree
                      ? "Claim Free Pass"
                      : "Reserve Ticket Pass"}
                  </span>
                </button>
              )}

              {/* Trust & Security Notes */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-slate-800 shrink-0" />
                  <span>256-bit encrypted 2FA booking protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaQrcode className="text-slate-800 shrink-0" />
                  <span>Instant digital pass generated upon confirmation</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default EventDetail;
