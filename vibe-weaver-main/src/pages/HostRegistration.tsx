import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe, FileText, Clock } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/api";

const venueTypes = [
  "Restaurant",
  "Bar & Lounge",
  "Concert Hall",
  "Conference Center",
  "Banquet Hall",
  "Rooftop Venue",
  "Art Gallery",
  "Theater",
  "Sports Arena",
  "Nightclub",
  "Community Center",
  "Hotel Ballroom",
  "Outdoor Garden",
  "Co-working Space",
  "Private Estate",
  "Other",
];

const apiBase = API_URL;

const HostRegistration = () => {
  const navigate = useNavigate();
  const todayDate = new Date().toISOString().split("T")[0];
  const currentTime = (() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  })();

  const to12HourParts = (timeStr?: string) => {
    const safe = timeStr && timeStr.includes(":") ? timeStr : currentTime;
    const [hStr = "00", mStr = "00"] = safe.split(":");
    let h = parseInt(hStr, 10);
    const minute = mStr.padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const hour = String(h).padStart(2, '0');
    return { hour, minute, ampm };
  };

  const to24Hour = (hour12: string, minute: string, ampm: string) => {
    let h = parseInt(hour12, 10) % 12;
    if (ampm === 'PM') h += 12;
    const hh = String(h).padStart(2, '0');
    const mm = minute.padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const clampToNow = (dateStr: string, timeStr: string) => {
    if (!timeStr) return currentTime;
    if (dateStr === todayDate && timeStr < currentTime) return currentTime;
    return timeStr;
  };
  const [registrationType, setRegistrationType] = useState<"venue" | "event">("venue");
  const [venueData, setVenueData] = useState({
    venueName: "",
    businessType: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    mapLink: "",
    website: "",
    description: "",
  });
  const [eventData, setEventData] = useState({
    title: "",
    category: "",
    location: "",
    mapLink: "",
    date: "",
    startTime: "",
    endTime: "",
    durationHours: 1,
    durationMinutes: 0,
    description: "",
    capacity: "",
    price: "",
    image: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteOptions = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  const startParts = to12HourParts(eventData.startTime || currentTime);
  const endParts = to12HourParts(eventData.endTime || eventData.startTime || currentTime);

  const handleVenueChange = (field: string, value: string) => {
    setVenueData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEventChange = (field: string, value: string) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
  };

  const getCurrentLocationLink = async (onLink: (url: string) => void) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const link = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        onLink(link);
      },
      (err) => {
        alert(err?.message || "Failed to get current location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleEventDateChange = (value: string) => {
    if (!value) return;
    setEventData((prev) => {
      const nextDate = value < todayDate ? todayDate : value;
      let nextStart = clampToNow(nextDate, prev.startTime || currentTime);
      let nextEnd = prev.endTime || nextStart;
      if (nextEnd < nextStart) nextEnd = nextStart;
      return { ...prev, date: nextDate, startTime: nextStart, endTime: nextEnd };
    });
  };

  const updateEventStartTime = (hour: string, minute: string, ampm: string) => {
    const candidate = to24Hour(hour, minute, ampm);
    setEventData((prev) => {
      const minStart = prev.date === todayDate ? currentTime : '00:00';
      const safeStart = candidate < minStart ? minStart : candidate;
      // Recalculate endTime based on new startTime + duration
      const [sh, sm] = safeStart.split(':').map(Number);
      const totalMins = sh * 60 + sm + (prev.durationHours * 60) + prev.durationMinutes;
      const eh = Math.floor(totalMins / 60) % 24;
      const em = totalMins % 60;
      const safeEnd = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
      return { ...prev, startTime: safeStart, endTime: safeEnd };
    });
  };

  const updateEventDuration = (hours: number, minutes: number) => {
    setEventData((prev) => {
      // Recalculate endTime based on startTime + new duration
      const [sh, sm] = (prev.startTime || currentTime).split(':').map(Number);
      const totalMins = sh * 60 + sm + (hours * 60) + minutes;
      const eh = Math.floor(totalMins / 60) % 24;
      const em = totalMins % 60;
      const safeEnd = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
      return { ...prev, durationHours: hours, durationMinutes: minutes, endTime: safeEnd };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to submit a registration.");
        setSubmitting(false);
        return;
      }

      if (registrationType === "venue") {
        await axios.post(
          `${apiBase}/host/requests`,
          {
            venueName: venueData.venueName,
            businessType: venueData.businessType,
            contactPerson: venueData.contactPerson,
            email: venueData.email,
            phone: venueData.phone,
            address: venueData.address,
            city: venueData.city,
            mapLink: venueData.mapLink,
            website: venueData.website,
            description: venueData.description,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Venue registration submitted! We'll review your application and get back to you soon.");
      } else {
        await axios.post(
          `${apiBase}/host/events`,
          {
            title: eventData.title,
            category: eventData.category,
            location: eventData.location,
            mapLink: eventData.mapLink,
            date: eventData.date,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            description: eventData.description,
            capacity: eventData.capacity,
            price: eventData.price ? parseFloat(eventData.price) : null,
            image: eventData.image,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Event registration submitted! We'll review your application and get back to you soon.");
      }
      navigate("/profile");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to submit registration. Please try again.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="outline"
            size="sm"
            className="mb-6 gap-2"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 gradient-text">
              Register with Us
            </h1>
            <p className="text-muted-foreground">
              Choose whether you want to register a venue or create an event
            </p>
          </div>

          {/* Registration Type Selector */}
          <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer flex-1 p-4 rounded-lg" style={{backgroundColor: registrationType === "venue" ? "white" : "transparent"}}>
                <input
                  type="radio"
                  name="type"
                  value="venue"
                  checked={registrationType === "venue"}
                  onChange={(e) => setRegistrationType(e.target.value as "venue" | "event")}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold text-gray-900">Register a Venue</p>
                  <p className="text-sm text-gray-600">Host events at your venue</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer flex-1 p-4 rounded-lg" style={{backgroundColor: registrationType === "event" ? "white" : "transparent"}}>
                <input
                  type="radio"
                  name="type"
                  value="event"
                  checked={registrationType === "event"}
                  onChange={(e) => setRegistrationType(e.target.value as "venue" | "event")}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold text-gray-900">Create an Event</p>
                  <p className="text-sm text-gray-600">Organize and host an event</p>
                </div>
              </label>
            </div>
          </Card>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* VENUE REGISTRATION FORM */}
              {registrationType === "venue" && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="venueName" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Venue Name
                      </Label>
                      <Input
                        id="venueName"
                        value={venueData.venueName}
                        onChange={(e) => handleVenueChange("venueName", e.target.value)}
                        placeholder="Enter venue name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Venue Type</Label>
                      <Select
                        value={venueData.businessType}
                        onValueChange={(value) => handleVenueChange("businessType", value)}
                        required
                      >
                        <SelectTrigger id="businessType">
                          <SelectValue placeholder="Select venue type" />
                        </SelectTrigger>
                        <SelectContent>
                          {venueTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={venueData.contactPerson}
                        onChange={(e) => handleVenueChange("contactPerson", e.target.value)}
                        placeholder="Full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={venueData.email}
                        onChange={(e) => handleVenueChange("email", e.target.value)}
                        placeholder="contact@venue.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={venueData.phone}
                        onChange={(e) => handleVenueChange("phone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Website (Optional)
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={venueData.website}
                        onChange={(e) => handleVenueChange("website", e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Street Address
                    </Label>
                    <Input
                      id="address"
                      value={venueData.address}
                      onChange={(e) => handleVenueChange("address", e.target.value)}
                      placeholder="123 Main Street"
                      required
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => getCurrentLocationLink((url) => setVenueData(prev => ({ ...prev, mapLink: url })))}
                      >
                        Use my location
                      </Button>
                      {venueData.mapLink && (
                        <a href={venueData.mapLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          Preview on Maps
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={venueData.city}
                      onChange={(e) => handleVenueChange("city", e.target.value)}
                      placeholder="City, State/Province"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Venue Description
                    </Label>
                    <textarea
                      id="description"
                      value={venueData.description}
                      onChange={(e) => handleVenueChange("description", e.target.value)}
                      placeholder="Tell us about your venue, capacity, amenities, and types of events you host..."
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-[120px]"
                      required
                    />
                  </div>
                </>
              )}

              {/* EVENT REGISTRATION FORM */}
              {registrationType === "event" && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="eventTitle">Event Title</Label>
                      <Input
                        id="eventTitle"
                        value={eventData.title}
                        onChange={(e) => handleEventChange("title", e.target.value)}
                        placeholder="Enter event title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventCategory">Category</Label>
                      <Select
                        value={eventData.category}
                        onValueChange={(value) => handleEventChange("category", value)}
                        required
                      >
                        <SelectTrigger id="eventCategory">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Music", "Sports", "Arts", "Business", "Technology", "Food", "Entertainment", "Other"].map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventLocation">Event Location</Label>
                    <Input
                      id="eventLocation"
                      value={eventData.location}
                      onChange={(e) => handleEventChange("location", e.target.value)}
                      placeholder="City, venue name, or address"
                      required
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => getCurrentLocationLink((url) => setEventData(prev => ({ ...prev, mapLink: url })))}
                      >
                        Use my location
                      </Button>
                      {eventData.mapLink && (
                        <a href={eventData.mapLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          Preview on Maps
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="eventDate">Event Date</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="eventDate"
                          type="date"
                          min={todayDate}
                          value={eventData.date}
                          onChange={(e) => handleEventDateChange(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleEventDateChange(todayDate)}
                          className="text-sm"
                        >
                          Today
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventCapacity">Capacity (optional)</Label>
                      <Input
                        id="eventCapacity"
                        type="number"
                        value={eventData.capacity}
                        onChange={(e) => handleEventChange("capacity", e.target.value)}
                        placeholder="Number of attendees"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="eventStartTime" className="flex items-center gap-2">
                        <span>Start Time</span>
                        <span className="text-xs text-muted-foreground">No past time</span>
                      </Label>
                      <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3 bg-muted/40">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <select
                          className="rounded-md border px-2 py-1 bg-background"
                          value={startParts.hour}
                          onChange={(e) => updateEventStartTime(e.target.value, startParts.minute, startParts.ampm)}
                        >
                          {hourOptions.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-sm text-muted-foreground">:</span>
                        <select
                          className="rounded-md border px-2 py-1 bg-background"
                          value={startParts.minute}
                          onChange={(e) => updateEventStartTime(startParts.hour, e.target.value, startParts.ampm)}
                        >
                          {minuteOptions.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          className="rounded-md border px-2 py-1 bg-background"
                          value={startParts.ampm}
                          onChange={(e) => updateEventStartTime(startParts.hour, startParts.minute, e.target.value)}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const targetDate = eventData.date || todayDate;
                            handleEventDateChange(targetDate);
                            const nowParts = to12HourParts(targetDate === todayDate ? currentTime : '09:00');
                            updateEventStartTime(nowParts.hour, nowParts.minute, nowParts.ampm);
                          }}
                        >
                          Now
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventDuration" className="flex items-center gap-2">
                        <span>Event Duration</span>
                        <span className="text-xs text-muted-foreground">Hours and minutes</span>
                      </Label>
                      <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3 bg-muted/40">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <select
                          className="rounded-md border px-2 py-1 bg-background"
                          value={eventData.durationHours}
                          onChange={(e) => updateEventDuration(parseInt(e.target.value) || 0, eventData.durationMinutes)}
                        >
                          {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                            <option key={h} value={h}>{String(h).padStart(2, '0')} hour{h !== 1 ? 's' : ''}</option>
                          ))}
                        </select>
                        <span className="text-sm text-muted-foreground">+</span>
                        <select
                          className="rounded-md border px-2 py-1 bg-background"
                          value={eventData.durationMinutes}
                          onChange={(e) => updateEventDuration(eventData.durationHours, parseInt(e.target.value) || 0)}
                        >
                          {minuteOptions.map((m) => (
                            <option key={m} value={m}>{m} min</option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updateEventDuration(1, 0)}
                        >
                          1 hour
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="eventPrice">Price (optional)</Label>
                      <Input
                        id="eventPrice"
                        type="number"
                        step="0.01"
                        value={eventData.price}
                        onChange={(e) => handleEventChange("price", e.target.value)}
                        placeholder="0.00 for free event"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventImage">Image URL (optional)</Label>
                      <Input
                        id="eventImage"
                        type="url"
                        value={eventData.image}
                        onChange={(e) => handleEventChange("image", e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventDescription">Event Description</Label>
                    <textarea
                      id="eventDescription"
                      value={eventData.description}
                      onChange={(e) => handleEventChange("description", e.target.value)}
                      placeholder="Tell us about your event, what attendees can expect, highlights, etc..."
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-[120px]"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary h-12"
                >
                  {submitting ? "Submitting..." : `Submit ${registrationType === "venue" ? "Venue" : "Event"} Registration`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/profile")}
                  className="h-12"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 mt-6 bg-muted/50">
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Our team will review your application within 2-3 business days</li>
              <li>• You'll receive an email with next steps and verification details</li>
              <li>• Once approved, you can start creating and hosting events</li>
              <li>• Access your host dashboard to manage bookings and track analytics</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HostRegistration;
