import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  Building2,
  TrendingUp,
  DollarSign,
  User,
  Loader2,
  Filter,
  Download,
} from "lucide-react";
import { API_URL } from "@/lib/api";

interface VenueBooking {
  type: "venue";
  venueId: string;
  venueName: string;
  seatId: number;
  seatLabel: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  pricePerHour: number;
  totalPrice: number;
  address: string;
  city: string;
  userEmail: string;
  bookingType: string;
  bookedAt: string;
}

interface EventBooking {
  type: "event";
  eventId: string;
  eventTitle: string;
  quantity: number;
  pricePerTicket: number;
  totalPrice: number;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  venue: string;
  userEmail: string;
  userName: string;
  bookedAt: string;
}

type Booking = VenueBooking | EventBooking;

interface Summary {
  totalBookings: number;
  totalRevenue: number;
  venueBookings: number;
  eventBookings: number;
  uniqueUsers: number;
}

type DateFilter = "all" | "today" | "yesterday" | "week" | "month" | "last7days" | "last30days";

const BookingHistory = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "venue" | "event">("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await axios.get(`${API_URL}/admin/bookings/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(response.data.bookings || []);
      setSummary(response.data.summary || null);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.response?.data?.error || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isBookingInDateRange = (booking: Booking): boolean => {
    if (dateFilter === "all") return true;

    const bookingDate = new Date(booking.bookedAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case "today": {
        const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
        return bookingDay.getTime() === today.getTime();
      }
      case "yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
        return bookingDay.getTime() === yesterday.getTime();
      }
      case "week": {
        // Start of this week (Sunday)
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day);
        return bookingDate >= startOfWeek && bookingDate <= now;
      }
      case "month": {
        // Start of this month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return bookingDate >= startOfMonth && bookingDate <= now;
      }
      case "last7days": {
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        return bookingDate >= last7Days && bookingDate <= now;
      }
      case "last30days": {
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        return bookingDate >= last30Days && bookingDate <= now;
      }
      default:
        return true;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === "all" || booking.type === filter;
    const matchesDateFilter = isBookingInDateRange(booking);
    const matchesSearch =
      searchTerm === "" ||
      booking.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.type === "venue" &&
        (booking as VenueBooking).venueName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (booking.type === "event" &&
        (booking as EventBooking).eventTitle
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesDateFilter && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = [
      "Type",
      "Name",
      "User Email",
      "Date",
      "Time",
      "Price",
      "Location",
    ];
    const rows = filteredBookings.map((booking) => {
      if (booking.type === "venue") {
        const vb = booking as VenueBooking;
        return [
          "Venue",
          vb.venueName,
          vb.userEmail,
          vb.date,
          `${vb.startTime} - ${vb.endTime}`,
          `$${vb.totalPrice}`,
          `${vb.city}`,
        ];
      } else {
        const eb = booking as EventBooking;
        return [
          "Event",
          eb.eventTitle,
          eb.userEmail,
          eb.date,
          `${eb.startTime} - ${eb.endTime}`,
          `$${eb.totalPrice}`,
          eb.location,
        ];
      }
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking History
            </h1>
            <p className="text-gray-600">
              View and manage all platform bookings
            </p>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summary.totalBookings}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${summary.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Venue Bookings</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {summary.venueBookings}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Event Bookings</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {summary.eventBookings}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Ticket className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Unique Users</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {summary.uniqueUsers}
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by user email or booking name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              {/* Date Range Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700 mr-2">Time Period:</span>
                <button
                  onClick={() => setDateFilter("all")}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    dateFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setDateFilter("today")}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    dateFilter === "today"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setDateFilter("yesterday")}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    dateFilter === "yesterday"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Yesterday
                </button>
                <button
                  onClick={() => setDateFilter("last7days")}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    dateFilter === "last7days"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setDateFilter("week")}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    dateFilter === "week"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setDateFilter("last30days")}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    dateFilter === "last30days"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => setDateFilter("month")}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    dateFilter === "month"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  This Month
                </button>
              </div>

              {/* Type Filters and Export */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Type:</span>
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    filter === "all"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("venue")}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    filter === "venue"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Venues
                </button>
                <button
                  onClick={() => setFilter("event")}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    filter === "event"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Events
                </button>
                <div className="ml-auto">
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-1.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              {(dateFilter !== "all" || filter !== "all" || searchTerm) && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {dateFilter !== "all" && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {dateFilter === "today" && "Today"}
                      {dateFilter === "yesterday" && "Yesterday"}
                      {dateFilter === "week" && "This Week"}
                      {dateFilter === "month" && "This Month"}
                      {dateFilter === "last7days" && "Last 7 Days"}
                      {dateFilter === "last30days" && "Last 30 Days"}
                    </span>
                  )}
                  {filter !== "all" && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full capitalize">
                      {filter}s
                    </span>
                  )}
                  {searchTerm && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setDateFilter("all");
                      setFilter("all");
                      setSearchTerm("");
                    }}
                    className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800">{error}</p>
              <button
                onClick={fetchBookings}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your filters"
                  : "No bookings have been made yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking, index) => {
                if (booking.type === "venue") {
                  const vb = booking as VenueBooking;
                  return (
                    <div
                      key={`venue-${index}`}
                      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Building2 className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {vb.venueName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Venue Booking
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">
                            ${vb.totalPrice.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${vb.pricePerHour}/hour
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="w-4 h-4 text-gray-500" />
                            <span>{vb.userEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>
                              {vb.address}, {vb.city}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{formatDate(vb.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>
                              {formatTime(vb.startTime)} -{" "}
                              {formatTime(vb.endTime)} ({vb.hours}h)
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>
                              Seat {vb.seatId}
                              {vb.seatLabel && `: ${vb.seatLabel}`}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Booked: {new Date(vb.bookedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const eb = booking as EventBooking;
                  return (
                    <div
                      key={`event-${index}`}
                      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Ticket className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {eb.eventTitle}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Event Booking
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600">
                            ${eb.totalPrice.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${eb.pricePerTicket}/ticket
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="w-4 h-4 text-gray-500" />
                            <span>
                              {eb.userName || eb.userEmail}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{eb.location}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{formatDate(eb.date)}</span>
                          </div>
                          {eb.startTime && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span>
                                {formatTime(eb.startTime)}
                                {eb.endTime && ` - ${formatTime(eb.endTime)}`}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Ticket className="w-4 h-4 text-gray-500" />
                            <span>
                              {eb.quantity} Ticket{eb.quantity > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Booked: {new Date(eb.bookedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
