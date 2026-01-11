import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import CategoryCard from "@/components/cards/CategoryCard";
import EventCard from "@/components/cards/EventCard";
import CommunityCard from "@/components/cards/CommunityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DistancePill from "@/components/ui/distance-pill";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Sparkles, User, Search, MapPin, Calendar, Filter, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface Category {
  _id?: string;
  icon?: string;
  title: string;
  count?: number;
}

interface EventItem {
  _id?: string;
  title: string;
  category: string;
  date: string;
  location: string;
  price?: number;
  image?: string;
  images?: string[];
  rating?: number;
  attendees?: number;
  badge?: string;
}

interface CommunityItem {
  _id?: string;
  name: string;
  icon?: string;
  description: string;
  members: number;
  events?: number;
  posts?: number;
  tags?: string[];
  badge?: string;
}

interface Venue {
  _id?: string;
  venueName: string;
  businessType: string;
  city: string;
  address?: string;
  website?: string;
  description: string;
  images?: string[];
}

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [eventSort, setEventSort] = useState<"date" | "popular">("date");

  const [venueSearch, setVenueSearch] = useState("");

  const [communitySearch, setCommunitySearch] = useState("");
  const [communityTag, setCommunityTag] = useState("All");
  const [minMembers, setMinMembers] = useState(0);
  const [communitySort, setCommunitySort] = useState<"members" | "events">("members");

  useEffect(() => {
    // Verify auth token with backend before deciding UI
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          // Invalid/expired token: clean up and treat as logged out
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };

    // Fetch data from API
    const fetchData = async () => {
      try {
        setError("");
        const [venuesRes, eventsRes, communitiesRes] = await Promise.all([
          fetch(`${API_URL}/api/venues`),
          fetch(`${API_URL}/api/events`),
          fetch(`${API_URL}/api/communities`)
        ]);

        const venuesData = await venuesRes.json();
        const eventsData = await eventsRes.json();
        const communitiesData = await communitiesRes.json();

        setVenues(venuesData);
        setEvents(eventsData);
        setCommunities(communitiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
    fetchData();
  }, []);

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const normalizedLocation = locationQuery.toLowerCase().trim();

  const filteredVenues = venues
    .filter((venue) => {
      const searchText = venueSearch.toLowerCase().trim();
      if (!searchText) return true;
      return venue.venueName.toLowerCase().includes(searchText) ||
             venue.city.toLowerCase().includes(searchText) ||
             venue.businessType.toLowerCase().includes(searchText) ||
             (venue.address?.toLowerCase() || "").includes(searchText);
    })
    .slice(0, 12);

  const filteredEvents = events
    .filter((event) => {
      const matchesSearch = !normalizedQuery ||
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.location.toLowerCase().includes(normalizedQuery) ||
        event.category.toLowerCase().includes(normalizedQuery);
      const matchesLocation = !normalizedLocation || event.location.toLowerCase().includes(normalizedLocation);
      const matchesDate = !dateFilter || new Date(event.date).toISOString().slice(0, 10) === dateFilter;
      const matchesCategory = categoryFilter === "All" || event.category === categoryFilter;
      const matchesPrice = priceFilter === "all" || (priceFilter === "free" ? !event.price : !!event.price);
      return matchesSearch && matchesLocation && matchesDate && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (eventSort === "popular") {
        const aScore = (a.attendees || 0) + (a.rating || 0);
        const bScore = (b.attendees || 0) + (b.rating || 0);
        return bScore - aScore;
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  const topEvents = filteredEvents.slice(0, 6);

  const communitySearchText = communitySearch.toLowerCase().trim();
  const filteredCommunities = communities
    .filter((community) => {
      const matchesSearch = !communitySearchText ||
        community.name.toLowerCase().includes(communitySearchText) ||
        community.description.toLowerCase().includes(communitySearchText) ||
        (community.tags || []).some((tag) => tag.toLowerCase().includes(communitySearchText));
      const matchesTag = communityTag === "All" || (community.tags || []).includes(communityTag);
      const matchesMembers = community.members >= minMembers;
      return matchesSearch && matchesTag && matchesMembers;
    })
    .sort((a, b) => {
      if (communitySort === "events") {
        return (b.events || 0) - (a.events || 0);
      }
      return (b.members || 0) - (a.members || 0);
    });

  const topCommunities = filteredCommunities.slice(0, 3);

  const allTags = Array.from(new Set(communities.flatMap((c) => c.tags || [])));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection
        searchQuery={searchQuery}
        locationQuery={locationQuery}
        onSearchQueryChange={setSearchQuery}
        onLocationChange={setLocationQuery}
        onSubmit={() => {
          // no-op; state updates trigger filtering
        }}
        onTagSelect={(tag) => setSearchQuery(tag)}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="container mx-auto px-4 mt-6">
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3">
                {error}
              </div>
            </div>
          )}
          {/* Venues Section */}
          <section className="py-20 relative">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    <span className="gradient-text">Featured Venues</span>
                  </h2>
                  <p className="text-muted-foreground max-w-2xl">
                    Discover amazing venues for your next event
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <Search className="w-4 h-4 text-primary/70" />
                    </span>
                    <Input
                      placeholder="Search venues"
                      className="pl-10"
                      value={venueSearch}
                      onChange={(e) => setVenueSearch(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" onClick={() => setVenueSearch("")}>Clear</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map((venue, index) => (
                  <div
                    key={venue._id || index}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in-up border border-border/50 hover:border-purple-500/50"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => {
                      if (venue._id) navigate(`/venues/${venue._id}/book`);
                    }}
                  >
                    {/* Header image for venue */}
                    <div className="relative h-48 overflow-hidden">
                      {venue.images && venue.images.length > 0 ? (
                        <img
                          src={venue.images[0]}
                          alt={venue.venueName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 relative overflow-hidden">
                          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity" style={{backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,.1) 25%, rgba(255,255,255,.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,.1) 75%)', backgroundSize: '20px 20px'}} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-white opacity-40 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
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
                      <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                        <div className="flex items-center justify-between gap-2 text-sm text-gray-700">
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span className="font-medium truncate">{venue.city}</span>
                          </div>
                          <DistancePill destination={`${venue.address || ""} ${venue.city || ""}`.trim()} />
                        </div>
                        {venue.address && (
                          <div className="text-xs text-gray-500 px-6">
                            📍 {venue.address}
                          </div>
                        )}
                      </div>
                      {venue.website ? (
                        <a
                          href={venue.website}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full block py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-sm text-center hover:shadow-lg transition-all duration-200 group-hover:from-purple-700 group-hover:to-pink-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Visit Website
                        </a>
                      ) : (
                        <Link
                          to={venue._id ? `/venues/${venue._id}/book` : `#`}
                          className="w-full block py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-sm text-center hover:shadow-lg transition-all duration-200 group-hover:from-purple-700 group-hover:to-pink-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Book Now
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredVenues.length === 0 && (
                <div className="text-center text-muted-foreground mt-8">
                  No venues found.
                </div>
              )}
            </div>
          </section>

          {/* Featured Events Section */}
          <section className="py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
            <div className="container mx-auto px-4 relative">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-primary font-semibold">Featured</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Trending Events
                  </h2>
                  <p className="text-muted-foreground">{filteredEvents.length} events available</p>
                </div>
                <div className="flex gap-2">
                  <Link to="/events">
                    <Button variant="outline" className="gap-2">
                      View All <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {topEvents.map((event, index) => (
                  <div
                    key={event._id || index}
                    className="animate-fade-in-up w-full"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <EventCard
                      id={event._id || String(index)}
                      title={event.title}
                      category={event.category}
                      date={event.date}
                      location={event.location}
                      price={event.price}
                      image={event.images && event.images.length > 0 ? event.images[0] : (event.image || "")}
                      rating={event.rating}
                      attendees={event.attendees}
                      badge={event.badge as "hot" | "new" | "featured" | "trending" | undefined}
                    />
                  </div>
                ))}
              </div>

              {topEvents.length === 0 && (
                <div className="text-center text-muted-foreground mt-8">No events match your filters.</div>
              )}
            </div>
          </section>

          {/* Communities Section */}
          <section className="py-20 relative">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👥</span>
                    <span className="text-secondary font-semibold">Connect</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Popular Communities
                  </h2>
                  <p className="text-muted-foreground">{filteredCommunities.length} communities available</p>
                </div>
                <Link to="/communities">
                  <Button variant="outline" className="gap-2">
                    Explore All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topCommunities.map((community, index) => (
                  <div
                    key={community._id || index}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CommunityCard
                      id={community._id || String(index)}
                      name={community.name}
                      icon={community.icon}
                      description={community.description}
                      members={community.members}
                      events={community.events || 0}
                      posts={community.posts || 0}
                      tags={community.tags || []}
                      badge={community.badge as "new" | "featured" | undefined}
                    />
                  </div>
                ))}
              </div>

              {topCommunities.length === 0 && (
                <div className="text-center text-muted-foreground mt-8">No communities match your filters.</div>
              )}
            </div>
          </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="glass-card p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to <span className="gradient-text">Level Up</span> Your Experience?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of people discovering amazing events and connecting with incredible communities every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <Link to="/profile">
                  <Button variant="gradient" size="xl" className="gap-2">
                    <User className="w-5 h-5" />
                    My Profile
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="xl">
                    Get Started Free
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold gradient-text">BookIt</span>
              <span className="text-muted-foreground">© 2025</span>
            </div>
            <div className="flex gap-6 text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/shipping" className="hover:text-primary transition-colors">Shipping</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
        </>
      )}
    </div>
  );
};

export default Index;
