import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { CheckCircle, XCircle, Calendar, Building2, Clock, DollarSign, Users, MapPin, X } from "lucide-react";

type Request = {
  _id: string;
  venueName: string;
  businessType: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  website?: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type EventRequest = {
  _id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  startTime?: string;
  endTime?: string;
  description: string;
  capacity?: number;
  price?: number;
  image?: string;
  status: "pending" | "approved" | "rejected";
  createdBy: string;
  createdAt: string;
};

const HostRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"venues" | "events">("venues");
  const [selectedVenue, setSelectedVenue] = useState<Request | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const adminToken = localStorage.getItem("adminToken") || "";

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [venuesResp, eventsResp] = await Promise.all([
        axios.get<Request[]>("https://bookit-dijk.onrender.com/admin/host/requests", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        axios.get<EventRequest[]>("https://bookit-dijk.onrender.com/admin/events", {
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      ]);
      setRequests(venuesResp.data);
      setEventRequests(eventsResp.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedVenue(null);
        setSelectedEvent(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function updateStatus(id: string, status: "approved" | "rejected", type: "venue" | "event") {
    if (!window.confirm(`${status === "approved" ? "Approve" : "Reject"} this ${type}?`)) return;
    try {
      const endpoint = type === "venue" 
        ? `https://bookit-dijk.onrender.com/admin/host/requests/${id}/status`
        : `https://bookit-dijk.onrender.com/admin/events/${id}/status`;
      
      const resp = await axios.put<Request | EventRequest>(
        endpoint,
        { status },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      if (type === "venue") {
        setRequests((prev) => prev.map((r) => (r._id === id ? resp.data as Request : r)));
        setSelectedVenue(null);
      } else {
        setEventRequests((prev) => prev.map((r) => (r._id === id ? resp.data as EventRequest : r)));
        setSelectedEvent(null);
      }
    } catch (e: any) {
      alert(e?.response?.data?.error || "Failed to update status");
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredRequests = filterStatus === "all" 
    ? requests 
    : requests.filter((r) => r.status === filterStatus);

  const filteredEvents = filterStatus === "all" 
    ? eventRequests 
    : eventRequests.filter((e) => e.status === filterStatus);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const pendingEventsCount = eventRequests.filter((e) => e.status === "pending").length;

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Host Requests</h1>
              <p className="text-gray-600">Review and approve new venue and event registrations</p>
            </div>
            <button
              onClick={load}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Refresh
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-600 mb-2">Pending Venue Requests</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-600 mb-2">Pending Event Requests</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingEventsCount}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-600 mb-2">Total Requests</p>
              <p className="text-3xl font-bold text-purple-600">{requests.length + eventRequests.length}</p>
            </div>
          </div>

          {/* Tab Navigation and Filter */}
          <div className="flex items-center justify-between mb-8 border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("venues")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "venues"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Venue Requests ({requests.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "events"
                    ? "border-b-2 border-orange-600 text-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Event Requests ({eventRequests.length})
                </div>
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* VENUE REQUESTS TAB */}
          {activeTab === "venues" && (
            <div>
              {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No venue requests</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {filterStatus === "all" ? "Hosts will appear here once they submit" : `No ${filterStatus} venue requests`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div
                      key={request._id}
                      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {request.venueName}
                              </h3>
                              <p className="text-sm text-gray-600">{request.businessType}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Contact Person</p>
                              <p className="font-medium text-gray-900">{request.contactPerson}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Email</p>
                              <p className="font-medium text-gray-900 break-all">{request.email}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Phone</p>
                              <p className="font-medium text-gray-900">{request.phone}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Location</p>
                              <p className="font-medium text-gray-900">{request.city}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedVenue(request)}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                          >
                            View Full Details →
                          </button>
                        </div>

                        {request.status === "pending" && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => updateStatus(request._id, "approved", "venue")}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(request._id, "rejected", "venue")}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EVENT REQUESTS TAB */}
          {activeTab === "events" && (
            <div>
              {filteredEvents.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No event requests</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {filterStatus === "all" ? "Events will appear here once they are submitted" : `No ${filterStatus} event requests`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <div
                      key={event._id}
                      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {event.title}
                              </h3>
                              <p className="text-sm text-gray-600">{event.category}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(event.status)}`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Date</p>
                              <p className="font-medium text-gray-900">{new Date(event.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Location</p>
                              <p className="font-medium text-gray-900 truncate">{event.location}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Created By</p>
                              <p className="font-medium text-gray-900">{event.createdBy}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Price</p>
                              <p className="font-medium text-gray-900">{event.price ? `$${event.price}` : "Free"}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                          >
                            View Full Details →
                          </button>
                        </div>

                        {event.status === "pending" && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => updateStatus(event._id, "approved", "event")}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(event._id, "rejected", "event")}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* VENUE DETAIL MODAL */}
      {selectedVenue && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedVenue(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedVenue.venueName}</h2>
                <button
                  onClick={() => setSelectedVenue(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className={`inline-block px-4 py-2 rounded-full font-medium border ${getStatusColor(selectedVenue.status)}`}>
                  {selectedVenue.status.charAt(0).toUpperCase() + selectedVenue.status.slice(1)}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Business Type</p>
                      <p className="font-medium text-gray-900">{selectedVenue.businessType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">City</p>
                      <p className="font-medium text-gray-900">{selectedVenue.city}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="font-medium text-gray-900">{selectedVenue.address}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Contact Person</p>
                      <p className="font-medium text-gray-900">{selectedVenue.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-900 break-all">{selectedVenue.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <p className="font-medium text-gray-900">{selectedVenue.phone}</p>
                    </div>
                    {selectedVenue.website && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Website</p>
                        <a
                          href={selectedVenue.website}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-purple-600 hover:text-purple-700 break-all"
                        >
                          {selectedVenue.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedVenue.description}</p>
                </div>

                <div className="pt-4 border-t text-sm text-gray-500">
                  Submitted {new Date(selectedVenue.createdAt).toLocaleString()}
                </div>

                {selectedVenue.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus(selectedVenue._id, "approved", "venue")}
                      className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Venue
                    </button>
                    <button
                      onClick={() => updateStatus(selectedVenue._id, "rejected", "venue")}
                      className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Venue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className={`inline-block px-4 py-2 rounded-full font-medium border ${getStatusColor(selectedEvent.status)}`}>
                  {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Category</p>
                      <p className="font-medium text-gray-900">{selectedEvent.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date</p>
                      <p className="font-medium text-gray-900">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                    </div>
                    {selectedEvent.startTime && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Start Time</p>
                        <p className="font-medium text-gray-900">{selectedEvent.startTime}</p>
                      </div>
                    )}
                    {selectedEvent.endTime && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">End Time</p>
                        <p className="font-medium text-gray-900">{selectedEvent.endTime}</p>
                      </div>
                    )}
                    {selectedEvent.capacity && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Capacity</p>
                        <p className="font-medium text-gray-900">{selectedEvent.capacity} people</p>
                      </div>
                    )}
                    {selectedEvent.price !== undefined && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Price</p>
                        <p className="font-medium text-gray-900">{selectedEvent.price ? `$${selectedEvent.price}` : "Free"}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="font-medium text-gray-900">{selectedEvent.location}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Created By</p>
                      <p className="font-medium text-gray-900">{selectedEvent.createdBy}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>

                <div className="pt-4 border-t text-sm text-gray-500">
                  Submitted {new Date(selectedEvent.createdAt).toLocaleString()}
                </div>

                {selectedEvent.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus(selectedEvent._id, "approved", "event")}
                      className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Event
                    </button>
                    <button
                      onClick={() => updateStatus(selectedEvent._id, "rejected", "event")}
                      className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HostRequests;
