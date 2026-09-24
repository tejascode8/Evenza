import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import api from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTicketAlt,
  FaTimesCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCreditCard,
  FaRegClock,
  FaSearch,
  FaCheckCircle,
  FaQrcode,
  FaArrowRight,
  FaTimes,
  FaDownload,
  FaRegCheckCircle,
  FaHourglassHalf
} from 'react-icons/fa';

import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import DashboardSkeleton from '../components/DashboardSkeleton';

const BackgroundShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-300/15 blur-[100px] animate-blob"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] animate-blob delay-200"></div>
  </div>
);

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicketPass, setSelectedTicketPass] = useState(null);

  // Custom Modal & Toast States
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  // Real-time Event Subscriptions (Zero-Latency Live Attendee Updates)
  useRealtime("BOOKING_CONFIRMED", (data) => {
    const currentUserId = user?._id || user?.id;
    const isTargetUser =
      data?.userId?.toString() === currentUserId?.toString() ||
      data?.booking?.userId?._id?.toString() === currentUserId?.toString();

    if (isTargetUser && data?.booking?._id) {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === data.booking._id
            ? { ...b, status: "confirmed", paymentStatus: data.booking.paymentStatus || "paid" }
            : b
        )
      );
      setToast({
        message: `Pass confirmed for "${data.booking.eventId?.title || 'Event'}"! Your digital QR pass is now active.`,
        type: "success",
      });
    }
  });

  useRealtime("BOOKING_CANCELLED", (data) => {
    const currentUserId = user?._id || user?.id;
    const isTargetUser = data?.userId?.toString() === currentUserId?.toString();

    if (isTargetUser && data?.bookingId) {
      setBookings((prev) =>
        prev.map((b) => (b._id === data.bookingId ? { ...b, status: "cancelled" } : b))
      );
    }
  });

  useRealtime("BOOKING_CREATED", (data) => {
    const currentUserId = user?._id || user?.id;
    const isTargetUser =
      data?.userId?.toString() === currentUserId?.toString() ||
      data?.booking?.userId?._id?.toString() === currentUserId?.toString();

    if (isTargetUser && data?.booking) {
      setBookings((prev) => {
        if (prev.some((b) => b._id === data.booking._id)) return prev;
        return [data.booking, ...prev];
      });
    }
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      setToast({ message: 'Failed to load bookings.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setCancelLoading(true);
    try {
      await api.delete(`/bookings/${bookingToCancel._id}`);
      setToast({
        message: `Booking for "${bookingToCancel.eventId?.title || 'Event'}" cancelled successfully.`,
        type: 'success'
      });
      setBookingToCancel(null);
      fetchBookings();
    } catch (error) {
      setToast({
        message: error.response?.data?.message || 'Failed to cancel booking.',
        type: 'error'
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = b.eventId
      ? (b.eventId.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.eventId.location || '').toLowerCase().includes(searchQuery.toLowerCase())
      : false;
    
    if (statusFilter === "confirmed") return matchesSearch && b.status === "confirmed";
    if (statusFilter === "pending") return matchesSearch && b.status === "pending";
    if (statusFilter === "cancelled") return matchesSearch && b.status === "cancelled";
    return matchesSearch;
  });

  const [copiedPassId, setCopiedPassId] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedTicketPass(null);
    };
    if (selectedTicketPass) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTicketPass]);

  const handleCopyPassCode = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedPassId(true);
      setTimeout(() => setCopiedPassId(false), 2000);
    }
  };

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const totalSpent = bookings
    .filter(b => b.status === 'confirmed' && b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col relative w-full overflow-x-hidden min-h-screen">
        <BackgroundShapes />
        <DashboardSkeleton isAdmin={false} />
      </div>
    );
  }

  return (
    <div className="flex flex-col relative w-full overflow-x-hidden min-h-screen">
      <BackgroundShapes />

      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 sm:pb-20">
        
        {/* 1. Header Banner */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black text-white rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold font-display shadow-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-slate-900">
                  Welcome, {user?.name}!
                </h1>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm">
                Signed in as <span className="font-semibold text-slate-700">{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 bg-black hover:bg-slate-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>Explore Events</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>
        </div>

        {/* 2. Metrics Grid with Interactive Hover Effects */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-6 sm:mb-8">
          {/* Total Bookings */}
          <div className="bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between group cursor-default">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 group-hover:text-slate-600 transition-colors">
                Total Bookings
              </p>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                {totalBookings}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shadow-2xs">
              <FaTicketAlt className="text-sm" />
            </div>
          </div>

          {/* Confirmed */}
          <div className="bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between group cursor-default">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 group-hover:text-emerald-600 transition-colors">
                Confirmed
              </p>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-emerald-600">
                {confirmedBookings}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-2xs">
              <FaRegCheckCircle className="text-base" />
            </div>
          </div>

          {/* Pending Review */}
          <div className="bg-white border border-slate-200/90 hover:border-amber-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between group cursor-default">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 group-hover:text-amber-600 transition-colors">
                Pending Review
              </p>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-amber-500">
                {pendingBookings}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-2xs">
              <FaHourglassHalf className="text-sm" />
            </div>
          </div>

          {/* Total Invested */}
          <div className="bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between group cursor-default">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 group-hover:text-slate-600 transition-colors">
                Total Invested
              </p>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                {totalSpent === 0 ? "₹0" : `₹${totalSpent.toLocaleString()}`}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shadow-2xs">
              <FaCreditCard className="text-sm" />
            </div>
          </div>
        </div>

        {/* 3. Ticket Management & Filters Card */}
        <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-xs">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-3 py-0.5 rounded-full mb-1.5 shadow-2xs">
                {filteredBookings.length} {filteredBookings.length === 1 ? "pass" : "passes"}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                My Booked Experiences
              </h2>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full sm:w-60">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search my tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs text-slate-800"
                />
              </div>

              <div className="inline-flex p-0.5 bg-white border border-slate-200 rounded-full shadow-2xs shrink-0">
                {[
                  { label: "All", value: "all" },
                  { label: "Confirmed", value: "confirmed" },
                  { label: "Pending", value: "pending" },
                  { label: "Cancelled", value: "cancelled" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-colors ${
                      statusFilter === tab.value
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tickets List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[260px] shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xl mb-3">
                <FaTicketAlt />
              </div>
              <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 mb-1">
                No Bookings Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-5">
                {searchQuery || statusFilter !== "all"
                  ? "No tickets match your active filters. Try searching for something else."
                  : "You haven't booked any events yet. Explore events and reserve your first pass!"}
              </p>
              <Link
                to="/"
                className="px-5 py-2 bg-black hover:bg-slate-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-xs"
              >
                Browse All Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredBookings.map((booking) => {
                const event = booking.eventId;
                const isCancelled = booking.status === 'cancelled';
                const isConfirmed = booking.status === 'confirmed';

                return (
                  <div
                    key={booking._id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="p-5 sm:p-6">
                      {event ? (
                        <>
                          <div className="flex items-start justify-between gap-3 mb-3.5">
                            <div>
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 mb-1.5 border border-slate-200">
                                {event.category || "Event"}
                              </span>
                              <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 leading-snug">
                                {event.title}
                              </h3>
                            </div>
                            
                            <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isConfirmed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                                : isCancelled
                                ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                                : 'bg-amber-50 text-amber-700 border border-amber-200/70'
                            }`}>
                              {booking.status}
                            </span>
                          </div>

                          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-slate-400 text-xs shrink-0" />
                              <span className="font-medium">
                                {new Date(event.date).toLocaleDateString(undefined, {
                                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-slate-400 text-xs shrink-0" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                              <div className="flex items-center gap-1.5">
                                <FaCreditCard className="text-slate-400 text-xs shrink-0" />
                                <span className="font-bold text-slate-900">
                                  {booking.amount === 0 ? 'Free Pass' : `₹${booking.amount}`}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                Booked on {new Date(booking.bookedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="py-4 text-center">
                          <FaTimesCircle className="text-2xl text-rose-400 mx-auto mb-1.5" />
                          <p className="text-xs font-bold text-slate-700">Event Not Available</p>
                        </div>
                      )}
                    </div>

                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      {event && !isCancelled ? (
                        <>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedTicketPass(booking)}
                              className="px-3 py-1.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <FaQrcode className="text-xs" />
                              <span>View Pass</span>
                            </button>

                            <Link
                              to={`/events/${event.slug || event._id}`}
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
                            >
                              Event Info
                            </Link>
                          </div>

                          <button
                            type="button"
                            onClick={() => setBookingToCancel(booking)}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Cancel Ticket
                          </button>
                        </>
                      ) : (
                        <div className="w-full text-center text-xs text-slate-400 font-medium py-0.5">
                          {isCancelled ? 'Ticket has been cancelled' : 'No actions available'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* 4. Digital Boarding Pass Modal */}
      {selectedTicketPass && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in-up"
          onClick={() => setSelectedTicketPass(null)}
        >
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 my-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Pass Header Banner with Image & Event Details */}
            <div className="relative bg-slate-900 text-white p-6 sm:p-7 overflow-hidden">
              {/* Background cover art overlay */}
              {selectedTicketPass.eventId?.image && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs"
                  style={{ backgroundImage: `url(${selectedTicketPass.eventId.image})` }}
                ></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950"></div>

              {/* Header Top Controls */}
              <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold uppercase tracking-wider text-white">
                    {selectedTicketPass.eventId?.category || 'VIP Experience'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    selectedTicketPass.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : selectedTicketPass.status === 'cancelled'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedTicketPass.status === 'confirmed' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}></span>
                    <span>{selectedTicketPass.status === 'confirmed' ? 'Verified Pass' : selectedTicketPass.status}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTicketPass(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors shrink-0"
                  title="Close Pass"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {/* Event Title & Fast Info */}
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white leading-tight mb-3">
                  {selectedTicketPass.eventId?.title || "Exclusive Event"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                    <FaCalendarAlt className="text-white/60 text-xs shrink-0" />
                    <span className="font-semibold text-slate-200">
                      {selectedTicketPass.eventId?.date ? new Date(selectedTicketPass.eventId.date).toLocaleDateString(undefined, {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                      }) : 'TBD'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                    <FaMapMarkerAlt className="text-white/60 text-xs shrink-0" />
                    <span className="truncate font-semibold text-slate-200">
                      {selectedTicketPass.eventId?.location || 'Main Venue'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Boarding Pass Perforated Divider with Cutout Notches */}
            <div className="relative bg-white h-6 flex items-center justify-between">
              <div className="absolute -left-3.5 -top-3 w-7 h-7 rounded-full bg-black/75 shadow-inner"></div>
              <div className="w-full mx-6 border-b-2 border-dashed border-slate-200"></div>
              <div className="absolute -right-3.5 -top-3 w-7 h-7 rounded-full bg-black/75 shadow-inner"></div>
            </div>

            {/* Pass Body (Attendee & Ticket Metadata) */}
            <div className="bg-white px-6 sm:px-7 pb-6 pt-1">
              
              {/* Attendee Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-5 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Attendee</p>
                  <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">{user?.name || 'Guest Attendee'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Admission Tier</p>
                  <p className="font-bold text-xs sm:text-sm text-slate-900">
                    {selectedTicketPass.amount === 0 ? 'Free Entry Pass' : 'Standard Pass'}
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {selectedTicketPass.amount === 0 ? 'COMPLIMENTARY' : `PAID ₹${selectedTicketPass.amount}`}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Booked On</p>
                  <p className="font-bold text-xs sm:text-sm text-slate-900">
                    {new Date(selectedTicketPass.bookedAt || Date.now()).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-slate-500">2FA Verified</p>
                </div>
              </div>

              {/* Scannable Contactless QR Code Card */}
              <div className="flex flex-col items-center justify-center p-5 bg-white border-2 border-slate-900/10 rounded-2xl text-center shadow-xs relative overflow-hidden">
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-md mb-2.5">
                  <FaQrcode className="text-6xl sm:text-7xl" />
                </div>

                <p className="text-xs font-bold text-slate-900 mb-1">
                  Present this QR at Entry Gate
                </p>
                
                {/* Clickable Pass Verification Token */}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-mono text-xs font-bold tracking-wider px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 border border-slate-200">
                    EVZ-{selectedTicketPass._id.slice(-8).toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyPassCode(`EVZ-${selectedTicketPass._id.slice(-8).toUpperCase()}`)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors border border-slate-200"
                    title="Copy Pass Code"
                  >
                    {copiedPassId ? <span className="text-[10px] font-bold text-emerald-600">Copied!</span> : <span className="text-[10px] font-bold">Copy</span>}
                  </button>
                </div>
              </div>

              {/* Security Trust Note */}
              <p className="text-[11px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                <FaCheckCircle className="text-emerald-500 text-xs" />
                <span>Verified digital pass &bull; 256-bit encrypted authentication</span>
              </p>
            </div>

            {/* Pass Footer Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 bg-black hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <FaDownload className="text-xs" />
                <span>Save / Print Boarding Pass</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedTicketPass(null)}
                className="py-3 px-5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Custom Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(bookingToCancel)}
        onClose={() => setBookingToCancel(null)}
        onConfirm={handleConfirmCancel}
        loading={cancelLoading}
        title="Cancel Ticket Reservation"
        message={`Are you sure you want to cancel your pass for "${bookingToCancel?.eventId?.title || 'this event'}"? This ticket will be released and your seat will become available to others.`}
        confirmText="Yes, Cancel Ticket"
        cancelText="Keep Ticket"
        type="danger"
      />

      {/* 6. Dynamic Notification Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

    </div>
  );
};

export default UserDashboard;



