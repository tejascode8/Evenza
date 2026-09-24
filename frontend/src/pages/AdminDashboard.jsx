import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRealtime } from "../context/RealtimeContext";
import api from "../utils/axios";
import { useNavigate, Link } from "react-router-dom";
import {
  FaPlus,
  FaTimes,
  FaRupeeSign,
  FaUsers,
  FaClock,
  FaCheck,
  FaTrash,
  FaImage,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTag,
  FaChair,
  FaMoneyBillWave,
  FaSearch,
  FaLayerGroup,
  FaEdit,
  FaDownload,
  FaFileExport,
  FaSyncAlt,
  FaQrcode,
  FaShieldAlt,
  FaTicketAlt,
  FaRegCheckCircle,
  FaHourglassHalf,
  FaExternalLinkAlt,
  FaArrowRight,
  FaSortAmountDown,
  FaSortAlphaDown,
  FaSortAlphaUp
} from "react-icons/fa";

import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import CustomDropdown from "../components/CustomDropdown";
import DashboardSkeleton from "../components/DashboardSkeleton";

const BackgroundShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-300/15 blur-[100px] animate-blob"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] animate-blob delay-200"></div>
  </div>
);

const CATEGORIES = ["Technology", "Music", "Business", "Design", "Gaming", "Art", "Health", "Education"];

const CATEGORY_OPTIONS = CATEGORIES.map((cat) => ({
  value: cat,
  label: cat,
}));

const ADMIN_SORT_OPTIONS = [
  { value: "date-asc", label: "Happening First", description: "Performing soonest at the top", iconComponent: FaCalendarAlt },
  { value: "title-asc", label: "Alphabetical (A → Z)", description: "Order titles A to Z", iconComponent: FaSortAlphaDown },
  { value: "title-desc", label: "Alphabetical (Z → A)", description: "Reverse alphabetical order", iconComponent: FaSortAlphaUp },
  { value: "price-asc", label: "Price (Low to High)", description: "Free & lowest ticket first", iconComponent: FaRupeeSign },
  { value: "price-desc", label: "Price (High to Low)", description: "Highest ticket first", iconComponent: FaRupeeSign },
  { value: "date-desc", label: "Latest Date", description: "Furthest upcoming dates", iconComponent: FaCalendarAlt },
];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState("all");
  const [eventSearch, setEventSearch] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [eventSortBy, setEventSortBy] = useState("date-asc");

  // Modal States
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteEventLoading, setDeleteEventLoading] = useState(false);
  const [bookingToReject, setBookingToReject] = useState(null);
  const [rejectBookingLoading, setRejectBookingLoading] = useState(false);
  const [inspectBooking, setInspectBooking] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: "", type: "info" });

  // Event Form State
  const initialFormState = {
    title: "",
    description: "",
    date: "",
    location: "",
    category: "Technology",
    totalSeats: "",
    ticketPrice: "",
    image: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate]);

  // Real-time Event Subscriptions (Zero-Latency Live Auto-Sync)
  useRealtime("BOOKING_CREATED", (data) => {
    if (data?.booking) {
      setBookings((prev) => {
        if (prev.some((b) => b._id === data.booking._id)) return prev;
        return [data.booking, ...prev];
      });
      setToast({
        message: `New booking submitted for "${data.booking.eventId?.title || 'Event'}" by ${data.booking.userId?.name || 'an attendee'}!`,
        type: "info",
      });
    }
  });

  useRealtime("BOOKING_CONFIRMED", (data) => {
    if (data?.booking?._id) {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === data.booking._id
            ? { ...b, status: "confirmed", paymentStatus: data.booking.paymentStatus || b.paymentStatus }
            : b
        )
      );
      if (data.eventId && data.availableSeats !== undefined) {
        setEvents((prev) =>
          prev.map((e) => (e._id === data.eventId ? { ...e, availableSeats: data.availableSeats } : e))
        );
      }
    }
  });

  useRealtime("BOOKING_CANCELLED", (data) => {
    if (data?.bookingId) {
      setBookings((prev) =>
        prev.map((b) => (b._id === data.bookingId ? { ...b, status: "cancelled" } : b))
      );
      if (data.eventId && data.availableSeats !== undefined) {
        setEvents((prev) =>
          prev.map((e) => (e._id === data.eventId ? { ...e, availableSeats: data.availableSeats } : e))
        );
      }
    }
  });

  useRealtime("EVENT_CREATED", (data) => {
    if (data?.event) {
      setEvents((prev) => {
        if (prev.some((e) => e._id === data.event._id)) return prev;
        return [data.event, ...prev];
      });
    }
  });

  useRealtime("EVENT_UPDATED", (data) => {
    if (data?.event) {
      setEvents((prev) => prev.map((e) => (e._id === data.event._id ? data.event : e)));
    }
  });

  useRealtime("EVENT_DELETED", (data) => {
    if (data?.eventId) {
      setEvents((prev) => prev.filter((e) => e._id !== data.eventId));
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, bookingsRes] = await Promise.all([
        api.get("/events"),
        api.get("/bookings/my"),
      ]);
      setEvents(eventsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      setToast({ message: "Failed to fetch admin dashboard data.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        api.get("/events"),
        api.get("/bookings/my"),
      ]);
      setEvents(eventsRes.data);
      setBookings(bookingsRes.data);
      setToast({ message: "Dashboard refreshed successfully!", type: "success" });
    } catch (error) {
      setToast({ message: "Refresh failed. Please check network connection.", type: "error" });
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData(initialFormState);
    setShowEventModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      date: event.date ? new Date(event.date).toISOString().split("T")[0] : "",
      location: event.location || "",
      category: event.category || "Technology",
      totalSeats: event.totalSeats || "",
      ticketPrice: event.ticketPrice !== undefined ? event.ticketPrice : "",
      image: event.image || "",
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent._id}`, formData);
        setToast({ message: `Experience "${formData.title}" updated successfully!`, type: "success" });
      } else {
        await api.post("/events", formData);
        setToast({ message: `Experience "${formData.title}" published successfully!`, type: "success" });
      }
      setShowEventModal(false);
      setFormData(initialFormState);
      fetchData();
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Error saving event details.",
        type: "error",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleConfirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    setDeleteEventLoading(true);
    try {
      await api.delete(`/events/${eventToDelete._id}`);
      setToast({
        message: `Experience "${eventToDelete.title}" deleted permanently.`,
        type: "success",
      });
      setEventToDelete(null);
      fetchData();
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Error deleting event.",
        type: "error",
      });
    } finally {
      setDeleteEventLoading(false);
    }
  };

  const handleConfirmBooking = async (id, paymentStatus) => {
    try {
      await api.put(`/bookings/${id}/confirm`, { paymentStatus });
      setToast({
        message: "Booking confirmed and official pass dispatched!",
        type: "success",
      });
      fetchData();
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Error confirming booking.",
        type: "error",
      });
    }
  };

  const handleConfirmRejectBooking = async () => {
    if (!bookingToReject) return;
    setRejectBookingLoading(true);
    try {
      await api.delete(`/bookings/${bookingToReject._id}`);
      setToast({
        message: "Booking request rejected and seat restored.",
        type: "success",
      });
      setBookingToReject(null);
      fetchData();
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Error rejecting booking.",
        type: "error",
      });
    } finally {
      setRejectBookingLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) {
      setToast({ message: "No attendee records available to export.", type: "info" });
      return;
    }

    const headers = ["Booking ID", "Event Title", "Attendee Name", "Attendee Email", "Status", "Payment Status", "Amount (INR)", "Date Booked"];
    const rows = bookings.map((b) => [
      `"${b._id}"`,
      `"${b.eventId?.title || 'Archived Event'}"`,
      `"${b.userId?.name || 'Guest'}"`,
      `"${b.userId?.email || 'N/A'}"`,
      `"${b.status}"`,
      `"${b.paymentStatus}"`,
      b.amount || 0,
      `"${new Date(b.bookedAt).toLocaleDateString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Evenza_Attendee_Guestlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: "Guestlist report exported successfully!", type: "success" });
  };

  // Filtered & Sorted Events
  const filteredEvents = events
    .filter((e) => {
      const matchesSearch =
        (e.title || "").toLowerCase().includes(eventSearch.toLowerCase()) ||
        (e.location || "").toLowerCase().includes(eventSearch.toLowerCase()) ||
        (e.category || "").toLowerCase().includes(eventSearch.toLowerCase());
      const matchesCategory = selectedCategory === "all" || (e.category || "").toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (eventSortBy === "date-asc") {
        return new Date(a.date) - new Date(b.date);
      }
      if (eventSortBy === "date-desc") {
        return new Date(b.date) - new Date(a.date);
      }
      if (eventSortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      }
      if (eventSortBy === "title-desc") {
        return b.title.localeCompare(a.title);
      }
      if (eventSortBy === "price-asc") {
        return (a.ticketPrice || 0) - (b.ticketPrice || 0);
      }
      if (eventSortBy === "price-desc") {
        return (b.ticketPrice || 0) - (a.ticketPrice || 0);
      }
      return 0;
    });

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      (b.eventId?.title || "").toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.userId?.name || "").toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.userId?.email || "").toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b._id.toLowerCase().includes(bookingSearch.toLowerCase());

    if (activeTab === "pending") return matchesSearch && b.status === "pending";
    if (activeTab === "confirmed") return matchesSearch && b.status === "confirmed";
    if (activeTab === "cancelled") return matchesSearch && b.status === "cancelled";
    return matchesSearch;
  });

  // Analytical Metrics
  const totalRevenue = bookings.reduce(
    (sum, b) => (b.paymentStatus === "paid" && b.status === "confirmed" ? sum + b.amount : sum),
    0
  );
  const paidBookingsCount = bookings.filter((b) => b.paymentStatus === "paid" && b.status === "confirmed").length;
  const confirmedAttendeesCount = bookings.filter((b) => b.status === "confirmed").length;
  const pendingRequestsCount = bookings.filter((b) => b.status === "pending").length;
  const totalCapacityAcrossEvents = events.reduce((sum, e) => sum + (e.totalSeats || 0), 0);
  const totalOccupiedSeats = events.reduce((sum, e) => sum + ((e.totalSeats || 0) - (e.availableSeats || 0)), 0);
  const occupancyPercentage = totalCapacityAcrossEvents > 0 ? Math.round((totalOccupiedSeats / totalCapacityAcrossEvents) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col relative w-full overflow-x-hidden min-h-screen bg-slate-50/50">
        <BackgroundShapes />
        <DashboardSkeleton isAdmin={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col relative w-full overflow-x-hidden min-h-screen bg-slate-50/50">
      <BackgroundShapes />

      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 sm:pb-24">
        
        {/* 1. Command Center Header Banner */}
        <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="text-center md:text-left">
            
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-slate-900 tracking-tight mb-1.5">
              Admin Operations Hub
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl">
              Publish live experiences, oversee incoming attendee bookings, approve tickets, and manage platform capacity.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all shadow-2xs text-xs font-semibold flex items-center gap-1.5"
              title="Refresh Data"
            >
              <FaSyncAlt className={`text-xs ${refreshing ? "animate-spin text-black" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all shadow-2xs text-xs sm:text-sm font-semibold flex items-center gap-2"
              title="Export Attendee Guestlist as CSV"
            >
              <FaFileExport className="text-xs text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <FaPlus className="text-xs" />
              <span>Create Event</span>
            </button>
          </div>
        </div>

        {/* 2. 5-Pillar Analytical Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-6 sm:mb-8">
          
          {/* Gross Revenue */}
          <div className="bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between group cursor-default">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-600 transition-colors">
                Gross Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-2xs">
                <FaRupeeSign className="text-xs" />
              </div>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-emerald-600">
                ₹{totalRevenue.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {paidBookingsCount} paid {paidBookingsCount === 1 ? "pass" : "passes"}
              </p>
            </div>
          </div>

          {/* Confirmed Attendees */}
          <div className="bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between group cursor-default">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
                Confirmed Guests
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-2xs">
                <FaUsers className="text-xs" />
              </div>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                {confirmedAttendeesCount}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Verified tickets
              </p>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="bg-white border border-slate-200/90 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between group cursor-default">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-600 transition-colors">
                Pending Actions
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-2xs ${
                pendingRequestsCount > 0 ? "bg-amber-500 text-white animate-pulse" : "bg-amber-50 text-amber-500"
              }`}>
                <FaClock className="text-xs" />
              </div>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-amber-500">
                {pendingRequestsCount}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Requires approval
              </p>
            </div>
          </div>

          {/* Active Events */}
          <div className="bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between group cursor-default">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
                Live Experiences
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-2xs">
                <FaLayerGroup className="text-xs" />
              </div>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                {events.length}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Published events
              </p>
            </div>
          </div>

          {/* Seat Utilization */}
          <div className="col-span-2 lg:col-span-1 bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between group cursor-default">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
                Seat Occupancy
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-2xs">
                <FaChair className="text-xs" />
              </div>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                {occupancyPercentage}%
              </h3>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-slate-900 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${occupancyPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Dual-Panel Workspace (Events Portfolio & Attendee Hub) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Panel: Event Portfolio (Span 6) */}
          <div className="xl:col-span-6 bg-slate-100/70 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col shadow-xs">
            
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full mb-1">
                  {filteredEvents.length} Active
                </span>
                <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
                  Experiences Portfolio
                </h2>
              </div>

              <div className="relative w-full sm:w-52">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 shadow-2xs"
                />
              </div>
            </div>

            {/* Filter & Sort Controls Container */}
            <div className="flex flex-col gap-2.5 mb-3.5">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors shrink-0 ${
                    selectedCategory === "all"
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors shrink-0 ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort By Filter Toggle Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
                  <FaSortAmountDown className="text-xs text-slate-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sort By:</span>
                </div>

                <div className="flex items-center gap-2">
                  <CustomDropdown
                    options={ADMIN_SORT_OPTIONS}
                    value={eventSortBy}
                    onChange={setEventSortBy}
                    variant="pill"
                    align="right"
                  />
                </div>
              </div>
            </div>

            {/* Event Cards List */}
            <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1">
              {filteredEvents.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400 flex flex-col items-center justify-center">
                  <FaLayerGroup className="text-2xl text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">No events found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try searching for a different keyword or create a new event.</p>
                </div>
              ) : (
                filteredEvents.map((event) => {
                  const isSoldOut = event.availableSeats <= 0;
                  const percentLeft = Math.round((event.availableSeats / event.totalSeats) * 100);

                  return (
                    <div
                      key={event._id}
                      className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-2xs hover:shadow-md transition-all flex flex-col gap-3 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 shadow-2xs relative">
                            <img
                              src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"}
                              alt=""
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800";
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                {event.category || "Experience"}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                {event.ticketPrice === 0 ? "FREE" : `₹${event.ticketPrice}`}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-sm truncate leading-tight">
                              {event.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt className="text-[10px] text-slate-400" />
                                {new Date(event.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 truncate max-w-[140px]">
                                <FaMapMarkerAlt className="text-[10px] text-slate-400 shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            to={`/events/${event.slug || event._id}`}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs transition-colors border border-transparent hover:border-slate-200"
                            title="View Public Event Page"
                          >
                            <FaExternalLinkAlt />
                          </Link>

                          <button
                            type="button"
                            onClick={() => openEditModal(event)}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs transition-colors border border-transparent hover:border-slate-200"
                            title="Edit Event Details"
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEventToDelete(event)}
                            className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl text-xs transition-colors"
                            title="Delete Event"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 w-full max-w-[200px]">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                isSoldOut ? "bg-rose-500" : percentLeft < 20 ? "bg-amber-500" : "bg-slate-900"
                              }`}
                              style={{ width: `${100 - percentLeft}%` }}
                            ></div>
                          </div>
                        </div>

                        <span className={`text-[11px] font-semibold ${
                          isSoldOut ? "text-rose-500 font-bold" : "text-slate-600"
                        }`}>
                          {event.availableSeats} / {event.totalSeats} seats left
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Attendee Requests & Management Hub (Span 6) */}
          <div className="xl:col-span-6 bg-slate-100/70 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col shadow-xs">
            
            {/* Header & Status Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3.5">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full mb-1">
                  {bookings.filter((b) => b.status === "pending").length} Awaiting Approval
                </span>
                <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
                  Attendee Verification Hub
                </h2>
              </div>

              <div className="inline-flex p-0.5 bg-white border border-slate-200 rounded-full shadow-2xs">
                {[
                  { id: "all", label: "All" },
                  { id: "pending", label: "Pending" },
                  { id: "confirmed", label: "Confirmed" },
                  { id: "cancelled", label: "Cancelled" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition-colors ${
                      activeTab === tab.id
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full mb-3.5">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search by attendee name, email, or event title..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 shadow-2xs"
              />
            </div>

            {/* Bookings List */}
            <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1">
              {filteredBookings.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400 flex flex-col items-center justify-center">
                  <FaTicketAlt className="text-2xl text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">No booking requests found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No attendee orders match your current filter.</p>
                </div>
              ) : (
                filteredBookings.map((booking) => {
                  const isConfirmed = booking.status === "confirmed";
                  const isCancelled = booking.status === "cancelled";
                  const isPending = booking.status === "pending";

                  return (
                    <div
                      key={booking._id}
                      className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col gap-2.5"
                    >
                      {/* Top Row: Status & Event */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`inline-block px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                              isConfirmed
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isCancelled
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {booking.status}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              #{booking._id.slice(-8).toUpperCase()}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm leading-tight">
                            {booking.eventId?.title || "Archived Event"}
                          </h4>
                        </div>

                        <span className="font-bold text-xs text-slate-900 shrink-0 bg-slate-100 px-2 py-1 rounded-lg">
                          {booking.amount === 0 ? "FREE PASS" : `₹${booking.amount}`}
                        </span>
                      </div>

                      {/* Attendee Profile Row */}
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{booking.userId?.name || "Attendee"}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{booking.userId?.email}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-slate-400">
                            {new Date(booking.bookedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                          <span className={`text-[10px] font-bold uppercase ${
                            booking.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-slate-500'
                          }`}>
                            {booking.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setInspectBooking(booking)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <FaQrcode className="text-[10px]" />
                          <span>Inspect Pass</span>
                        </button>

                        {isPending && (
                          <div className="flex items-center gap-1.5 flex-1 justify-end">
                            {booking.amount === 0 ? (
                              <button
                                type="button"
                                onClick={() => handleConfirmBooking(booking._id, "paid")}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                                title="Approve free pass and dispatch confirmation"
                              >
                                <FaCheck className="text-[9px]" />
                                <span>Approve Free Pass</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmBooking(booking._id, "paid")}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                                  title="Confirm booking and mark payment as Paid"
                                >
                                  <FaCheck className="text-[9px]" />
                                  <span>Confirm as Paid</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleConfirmBooking(booking._id, "not_paid")}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                                  title="Confirm booking with pending payment"
                                >
                                  <span>Confirm as Unpaid</span>
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => setBookingToReject(booking)}
                              className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
                              title="Reject booking request"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* 4. Experience Creator & Editor Modal */}
      {/* ========================================================================= */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md overflow-y-auto animate-fade-in-up">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto animate-scale-in">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {editingEvent ? "Update Experience" : "New Experience"}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                  {editingEvent ? "Edit Event Details" : "Publish Live Experience"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Next-Gen Tech Summit 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none text-xs sm:text-sm text-slate-900"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <CustomDropdown
                    label="Category *"
                    options={CATEGORY_OPTIONS}
                    value={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: val })}
                    variant="input"
                    align="left"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Date *</label>
                  <input
                    required
                    type="date"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none text-xs sm:text-sm text-slate-900"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Venue Location *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Grand Arena, Cyber City, Bangalore"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none text-xs sm:text-sm text-slate-900"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Capacity *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 250"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none text-xs sm:text-sm text-slate-900"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ticket Price (₹) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="0 for Free Pass"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none text-xs sm:text-sm text-slate-900"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none text-xs sm:text-sm text-slate-900"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience Description *</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Provide overview, speaker schedule, and pass inclusions..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none text-xs sm:text-sm text-slate-900 resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Image Live Preview */}
              {formData.image && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.target.style.display = 'none')} />
                  </div>
                  <div className="min-w-0 text-xs">
                    <p className="font-bold text-slate-800">Cover Art Preview</p>
                    <p className="text-[11px] text-slate-500 truncate">{formData.image}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 py-3 bg-black hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  {formSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Experience...</span>
                    </>
                  ) : (
                    <span>{editingEvent ? "Save Changes" : "Publish Event"}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs sm:text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. Attendee Pass Inspector Modal */}
      {/* ========================================================================= */}
      {inspectBooking && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in-up"
          onClick={() => setInspectBooking(null)}
        >
          <div 
            className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black text-white p-6 pb-6 text-center relative">
              <button
                type="button"
                onClick={() => setInspectBooking(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>

              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-2">
                <FaTicketAlt className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-bold font-display">Attendee Pass Details</h3>
              <p className="text-slate-400 text-xs">Official Evenza Verified Record</p>
            </div>

            <div className="p-6 bg-white space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Event</span>
                  <span className="font-bold text-slate-900">{inspectBooking.eventId?.title}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Attendee</span>
                  <span className="font-bold text-slate-900">{inspectBooking.userId?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-800">{inspectBooking.userId?.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold uppercase text-emerald-600">{inspectBooking.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment</span>
                  <span className="font-bold text-slate-900">
                    {inspectBooking.amount === 0 ? "FREE" : `₹${inspectBooking.amount} (${inspectBooking.paymentStatus})`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <FaQrcode className="text-5xl text-slate-900 mb-1" />
                <p className="font-mono text-xs font-bold text-slate-700">
                  PASS-ID: EVZ-{inspectBooking._id.slice(-8).toUpperCase()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectBooking(null)}
                className="w-full py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. Confirmation Modals & Toasts */}
      {/* ========================================================================= */}
      <ConfirmModal
        isOpen={Boolean(eventToDelete)}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleConfirmDeleteEvent}
        loading={deleteEventLoading}
        title="Delete Experience"
        message={`Are you sure you want to permanently delete "${eventToDelete?.title}"? This action cannot be undone and will remove the event for all users.`}
        confirmText="Yes, Delete Event"
        cancelText="Keep Event"
        type="danger"
      />

      <ConfirmModal
        isOpen={Boolean(bookingToReject)}
        onClose={() => setBookingToReject(null)}
        onConfirm={handleConfirmRejectBooking}
        loading={rejectBookingLoading}
        title="Reject Booking Request"
        message={`Are you sure you want to reject the booking request from "${bookingToReject?.userId?.name || 'this attendee'}" (${bookingToReject?.userId?.email}) for "${bookingToReject?.eventId?.title || 'Event'}"?`}
        confirmText="Yes, Reject Request"
        cancelText="Cancel"
        type="danger"
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />
    </div>
  );
};

export default AdminDashboard;
