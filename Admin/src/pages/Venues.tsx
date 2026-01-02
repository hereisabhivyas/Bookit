import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { Building2, Trash2, Calendar, MapPin, Zap, Users, DollarSign, X } from "lucide-react";

type Venue = {
  _id: string;
  venueName: string;
  city: string;
  address?: string;
  website?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  images?: string[];
  capacity?: number;
  pricePerHour?: number;
  amenities?: string[];
  phone?: string;
  email?: string;
};

type Event = {
  _id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  price?: number;
  image?: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  images?: string[];
  description?: string;
  tickets?: Array<{ type: string; price: number; available: number }>;
};

const Venues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"venues" | "events">("venues");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [imageGallery, setImageGallery] = useState<{
    images: string[];
    title: string;
    type: "venue" | "event";
  } | null>(null);

  const adminToken = localStorage.getItem("adminToken") || "";

  async function load() {
    setLoading(true);
    setError("");
    try {
      // Fetch venues
      const venuesResp = await axios.get<Venue[]>("http://localhost:3000/admin/host/requests", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const approved = (venuesResp.data || []).filter((r) => r.status === "approved");
      setVenues(approved);

      // Fetch events
      const eventsResp = await axios.get<Event[]>("http://localhost:3000/admin/events", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const approvedEvents = (eventsResp.data || []).filter((e) => e.status === "approved");
      setEvents(approvedEvents);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load venues and events");
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
        setImageGallery(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function deleteVenue(id: string) {
    if (!window.confirm("Delete this venue? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:3000/admin/host/requests/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setVenues((prev) => prev.filter((v) => v._id !== id));
      setSelectedVenue(null);
    } catch (e: any) {
      alert(e?.response?.data?.error || "Failed to delete venue");
    }
  }

  async function deleteEvent(id: string) {
    if (!window.confirm("Delete this event? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:3000/admin/events/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setSelectedEvent(null);
    } catch (e: any) {
      alert(e?.response?.data?.error || "Failed to delete event");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-8">Loading venues...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Venues & Events</h1>
              <p className="text-gray-600">Manage all approved venues and events</p>
            </div>
            <button
              onClick={load}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>
          )}

          {/* TAB NAVIGATION */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
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
                Venues ({venues.length})
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
                Events ({events.length})
              </div>
            </button>
          </div>

          {/* VENUES TAB */}
          {activeTab === "venues" && (
            <div>
              {venues.length === 0 && !error ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <p className="text-gray-500">No venues found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Approve host requests to see them listed here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {venues.map((venue) => (
                    <div
                      key={venue._id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                      {/* Image Section */}
                      <div className="relative h-48 bg-gradient-to-br from-purple-500 to-blue-500 overflow-hidden">
                        {venue.images && venue.images.length > 0 ? (
                          <img
                            src={venue.images[0]}
                            alt={venue.venueName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-16 h-16 text-white opacity-50" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                            Active
                          </span>
                          {venue.images && venue.images.length > 1 && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageGallery({
                                  images: venue.images!,
                                  title: venue.venueName,
                                  type: "venue",
                                });
                              }}
                              className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-medium cursor-pointer hover:bg-gray-800"
                            >
                              +{venue.images.length - 1} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {venue.venueName}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                          <MapPin className="w-4 h-4" />
                          {venue.city || "Unknown city"}
                        </div>

                        {/* Key Info */}
                        <div className="space-y-2 mb-4 text-sm">
                          {venue.capacity && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>Capacity: <span className="font-medium">{venue.capacity}</span></span>
                            </div>
                          )}
                          {venue.pricePerHour && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              <span>${venue.pricePerHour}/hour</span>
                            </div>
                          )}
                          {venue.amenities && venue.amenities.length > 0 && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Zap className="w-4 h-4" />
                              <span>{venue.amenities.length} amenities</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t">
                          <button
                            onClick={() => setSelectedVenue(venue)}
                            className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteVenue(venue._id);
                            }}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === "events" && (
            <div>
              {events.length === 0 && !error ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <p className="text-gray-500">No events found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Approve event requests to see them listed here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div
                      key={event._id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                      {/* Image Section */}
                      <div className="relative h-48 bg-gradient-to-br from-orange-500 to-red-500 overflow-hidden">
                        {event.images && event.images.length > 0 ? (
                          <img
                            src={event.images[0]}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : event.image ? (
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-16 h-16 text-white opacity-50" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                            Event
                          </span>
                          {event.images && event.images.length > 1 && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageGallery({
                                  images: event.images!,
                                  title: event.title,
                                  type: "event",
                                });
                              }}
                              className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-medium cursor-pointer hover:bg-gray-800"
                            >
                              +{event.images.length - 1} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {event.category}
                          </span>
                          <span className="text-xs text-gray-600">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Key Info */}
                        <div className="space-y-2 mb-4 text-sm">
                          {event.location && (
                            <div className="flex items-center gap-2 text-gray-600 truncate">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                          {event.capacity && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>Capacity: <span className="font-medium">{event.capacity}</span></span>
                            </div>
                          )}
                          {event.price ? (
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              <span>${event.price}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              <span>Free</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEvent(event._id);
                            }}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
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
                {/* Image Gallery */}
                {selectedVenue.images && selectedVenue.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Gallery</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedVenue.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${selectedVenue.venueName} ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            setImageGallery({
                              images: selectedVenue.images!,
                              title: selectedVenue.venueName,
                              type: "venue",
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">City</p>
                    <p className="font-medium text-gray-900">{selectedVenue.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Capacity</p>
                    <p className="font-medium text-gray-900">
                      {selectedVenue.capacity ? `${selectedVenue.capacity} people` : "Not specified"}
                    </p>
                  </div>
                  {selectedVenue.address && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="font-medium text-gray-900">{selectedVenue.address}</p>
                    </div>
                  )}
                  {selectedVenue.pricePerHour && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Price Per Hour</p>
                      <p className="font-medium text-gray-900">${selectedVenue.pricePerHour}</p>
                    </div>
                  )}
                  {selectedVenue.phone && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <p className="font-medium text-gray-900">{selectedVenue.phone}</p>
                    </div>
                  )}
                  {selectedVenue.email && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{selectedVenue.email}</p>
                    </div>
                  )}
                  {selectedVenue.website && (
                    <div className="col-span-2">
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

                {/* Amenities */}
                {selectedVenue.amenities && selectedVenue.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVenue.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="pt-4 border-t text-sm text-gray-500">
                  Added {new Date(selectedVenue.createdAt).toLocaleString()}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    deleteVenue(selectedVenue._id);
                  }}
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Venue
                </button>
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
                {/* Image Gallery */}
                {(selectedEvent.images?.length ?? 0) > 0 || selectedEvent.image ? (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Gallery</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {(selectedEvent.images || (selectedEvent.image ? [selectedEvent.image] : [])).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${selectedEvent.title} ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            setImageGallery({
                              images: selectedEvent.images || (selectedEvent.image ? [selectedEvent.image] : []),
                              title: selectedEvent.title,
                              type: "event",
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Category</p>
                    <p className="font-medium text-gray-900">{selectedEvent.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedEvent.date).toLocaleDateString()}
                    </p>
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
                  {selectedEvent.location && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="font-medium text-gray-900">{selectedEvent.location}</p>
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
                      <p className="font-medium text-gray-900">
                        {selectedEvent.price ? `$${selectedEvent.price}` : "Free"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedEvent.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Tickets */}
                {selectedEvent.tickets && selectedEvent.tickets.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Tickets</h3>
                    <div className="space-y-2">
                      {selectedEvent.tickets.map((ticket, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium text-gray-900">{ticket.type}</span>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${ticket.price}</p>
                            <p className="text-xs text-gray-500">{ticket.available} available</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="pt-4 border-t text-sm text-gray-500">
                  Added {new Date(selectedEvent.createdAt).toLocaleString()}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    deleteEvent(selectedEvent._id);
                  }}
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* IMAGE GALLERY MODAL */}
      {imageGallery && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-75 z-40"
            onClick={() => setImageGallery(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {imageGallery.title} - Gallery
                </h2>
                <button
                  onClick={() => setImageGallery(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageGallery.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Venues;
