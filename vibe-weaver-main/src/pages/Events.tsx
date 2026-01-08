import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Search, Calendar, MapPin, SlidersHorizontal, Building2, Clock } from "lucide-react";
import { categories } from "@/data/mockData";
import { API_URL } from "@/lib/api";

interface Event {
  _id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  price?: number;
  image?: string;
  images?: string[];
  description: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  createdAt: string;
}

interface Venue {
  _id: string;
  venueName: string;
  businessType: string;
  city: string;
  address?: string;
  website?: string;
  description: string;
  images?: string[];
  createdAt: string;
}

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [venueTypeFilter, setVenueTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewType, setViewType] = useState<"all" | "events" | "venues">("all");
  const [selectedItem, setSelectedItem] = useState<Event | Venue | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [eventsRes, venuesRes] = await Promise.all([
          axios.get<Event[]>(`${API_URL}/api/events`),
          axios.get<Venue[]>(`${API_URL}/api/venues`),
        ]);
        setEvents(eventsRes.data || []);
        setVenues(venuesRes.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load events and venues");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isVenue = (item: Event | Venue): item is Venue => "venueName" in item;
  const isEvent = (item: Event | Venue): item is Event => "title" in item;

  const filteredEvents = events.filter((event) => {
    const matchesCategory = activeCategory === "All" || event.category === activeCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || event.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesDate = !dateFilter || new Date(event.date).toISOString().slice(0, 10) === dateFilter;
    const matchesPrice = priceFilter === "all" || (priceFilter === "free" ? !event.price : !!event.price);
    const matchesUpcoming = !upcomingOnly || new Date(event.date) >= new Date(new Date().toDateString());
    return matchesCategory && matchesSearch && matchesLocation && matchesDate && matchesPrice && matchesUpcoming;
  });

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch = venue.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || venue.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
                           venue.address?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = venueTypeFilter === "All" || venue.businessType === venueTypeFilter;
    return matchesSearch && matchesLocation && matchesType;
  });

  const venueTypes = Array.from(new Set(venues.map((v) => v.businessType))).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-lg text-muted-foreground">Loading events and venues...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              <span className="gradient-text">Events & Venues</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover amazing experiences and venues happening near you
            </p>
          </div>

          {/* Search & Filters */}
          <div className="glass-card p-4 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search events or venues..."
                  className="pl-12 h-12 bg-muted/50 border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1 md:w-40">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Location"
                    className="pl-12 h-12 bg-muted/50 border-border/50"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
                <div className="relative flex-1 md:w-40">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-12 h-12 bg-muted/50 border-border/50"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="gradient" size="lg" className="h-12">
                      <SlidersHorizontal className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">Price</p>
                      <div className="flex gap-2 flex-wrap">
                        {(["all", "free", "paid"] as const).map((option) => (
                          <Button
                            key={option}
                            variant={priceFilter === option ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPriceFilter(option)}
                          >
                            {option === "all" && "All"}
                            {option === "free" && "Free"}
                            {option === "paid" && "Paid"}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Upcoming only</p>
                        <p className="text-xs text-muted-foreground">Hide past dates</p>
                      </div>
                      <Switch checked={upcomingOnly} onCheckedChange={setUpcomingOnly} />
                    </div>

                    <div className="flex justify-between gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setPriceFilter("all");
                          setUpcomingOnly(false);
                          setDateFilter("");
                          setLocationFilter("");
                        }}
                      >
                        Clear filters
                      </Button>
                      <Button className="flex-1" type="button">
                        Apply
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* View Type Selector */}
      <section className="py-6 border-b border-border bg-white/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={viewType === "all" ? "default" : "ghost"}
              onClick={() => setViewType("all")}
              className="rounded-full"
            >
              All Items
            </Button>
            <Button
              variant={viewType === "events" ? "default" : "ghost"}
              onClick={() => setViewType("events")}
              className="rounded-full"
            >
              Events ({filteredEvents.length})
            </Button>
            <Button
              variant={viewType === "venues" ? "default" : "ghost"}
              onClick={() => setViewType("venues")}
              className="rounded-full"
            >
              Venues ({filteredVenues.length})
            </Button>
          </div>
        </div>
      </section>

      {/* Categories (for events) */}
      {viewType !== "venues" && (
        <section className="py-6 bg-white/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={activeCategory === "All" ? "default" : "ghost"}
                onClick={() => setActiveCategory("All")}
                className="rounded-full"
              >
                All Events
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.title ? "default" : "ghost"}
                  onClick={() => setActiveCategory(cat.title)}
                  className="rounded-full"
                >
                  {cat.icon} {cat.title}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {(viewType === "all" || viewType === "venues") && venueTypes.length > 0 && (
        <section className="py-6 bg-white/30 border-t border-border/60">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={venueTypeFilter === "All" ? "default" : "ghost"}
                onClick={() => setVenueTypeFilter("All")}
                className="rounded-full"
              >
                All Venues
              </Button>
              {venueTypes.map((type) => (
                <Button
                  key={type}
                  variant={venueTypeFilter === type ? "default" : "ghost"}
                  onClick={() => setVenueTypeFilter(type)}
                  className="rounded-full"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events Section */}
      {(viewType === "all" || viewType === "events") && filteredEvents.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Events ({filteredEvents.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <div
                  key={event._id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in-up border border-border/50 hover:border-primary/50"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Image Container */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                    {(event.images && event.images.length > 0) || event.image ? (
                      <img
                        src={(event.images && event.images.length > 0) ? event.images[0] : event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-80">
                        <Calendar className="w-12 h-12 text-white opacity-40" />
                      </div>
                    )}
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold shadow-lg">
                        {event.category}
                      </span>
                    </div>
                    {/* Price Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                        event.price ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {event.price ? `$${event.price}` : 'Free'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                      {event.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="font-medium truncate">{event.location}</span>
                      </div>
                      {event.startTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span>{event.startTime}</span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event._id}/book`);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-200 group-hover:from-blue-700 group-hover:to-purple-700"
                    >
                      Book Tickets
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Venues Section */}
      {(viewType === "all" || viewType === "venues") && filteredVenues.length > 0 && (
        <section className={`py-12 ${viewType === "all" ? "border-t border-border" : ""}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Venues ({filteredVenues.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue, index) => (
                <div
                  key={venue._id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in-up border border-border/50 hover:border-purple-500/50"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => setSelectedItem(venue)}
                >
                  {/* Header with Image */}
                  <div className="h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 relative overflow-hidden">
                    {venue.images && venue.images.length > 0 ? (
                      <img
                        src={venue.images[0]}
                        alt={venue.venueName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity" style={{backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,.1) 25%, rgba(255,255,255,.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,.1) 75%)', backgroundSize: '20px 20px'}} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-white opacity-40 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Type Badge */}
                    <div className="flex gap-2 mb-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-bold">
                        {venue.businessType}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {venue.venueName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                      {venue.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span className="font-medium">{venue.city}</span>
                      </div>
                      {venue.address && (
                        <div className="text-xs text-gray-500 px-6">
                          📍 {venue.address}
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/venues/${venue._id}/book`);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-200 group-hover:from-purple-700 group-hover:to-pink-700"
                    >
                      Book Seat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && ((viewType === "events" && filteredEvents.length === 0) || (viewType === "venues" && filteredVenues.length === 0) || (viewType === "all" && filteredEvents.length === 0 && filteredVenues.length === 0)) && (
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground text-lg mb-4">No items found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setActiveCategory("All");
                setVenueTypeFilter("All");
                setSearchQuery("");
                setLocationFilter("");
                setDateFilter("");
                setPriceFilter("all");
                setUpcomingOnly(false);
                setViewType("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </section>
      )}

      {/* Detailed Modal/Sidebar for selected item */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <button
                onClick={() => setSelectedItem(null)}
                className="float-right text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
              
              {isEvent(selectedItem) ? (
                <>
                  <h2 className="text-3xl font-bold mb-2">{selectedItem.title}</h2>
                  <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold mb-4">
                    {selectedItem.category}
                  </div>
                  
                  {selectedItem.image && (
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.title}
                      className="w-full h-96 object-cover rounded-lg mb-6"
                    />
                  )}

                  <div className="space-y-4 mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700">{selectedItem.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Date</p>
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          {new Date(selectedItem.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Location</p>
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          {selectedItem.location}
                        </p>
                      </div>
                      {selectedItem.startTime && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Start Time</p>
                          <p className="font-bold text-gray-900">{selectedItem.startTime}</p>
                        </div>
                      )}
                      {selectedItem.endTime && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">End Time</p>
                          <p className="font-bold text-gray-900">{selectedItem.endTime}</p>
                        </div>
                      )}
                      {selectedItem.capacity && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Capacity</p>
                          <p className="font-bold text-gray-900">{selectedItem.capacity}</p>
                        </div>
                      )}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Price</p>
                        <p className="font-bold text-gray-900">
                          {selectedItem.price ? `$${selectedItem.price}` : "Free"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white h-12 font-bold hover:shadow-lg">
                    Get Tickets
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedItem.venueName}</h2>
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-bold inline-block">
                        {selectedItem.businessType}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700">{selectedItem.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">City</p>
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          {selectedItem.city}
                        </p>
                      </div>
                      {selectedItem.address && (
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Address</p>
                          <p className="font-bold text-gray-900 text-sm">{selectedItem.address}</p>
                        </div>
                      )}
                    </div>

                    {selectedItem.website && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-500 mb-1">Website</p>
                        <a
                          href={selectedItem.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 hover:text-purple-700 font-bold underline break-all"
                        >
                          {selectedItem.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Contact Venue button removed per request */}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
