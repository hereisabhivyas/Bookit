import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Save,
  Trash2,
  Upload,
  X,
  CheckCircle,
  ArrowLeft,
  Ticket,
  MapPin,
  Clock,
} from "lucide-react";
import { API_URL } from "@/lib/api";

const EventManagement = () => {
  const apiBase = API_URL;
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [eventData, setEventData] = useState({
    title: "",
    category: "",
    location: "",
    mapLink: "",
    date: "",
    startTime: "",
    endTime: "",
    durationHours: 0,
    durationMinutes: 0,
    description: "",
    capacity: 0,
    price: 0,
    ticketsAvailable: 0,
    venue: "",
    amenities: "",
    images: [] as string[],
  });

  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    // Align behavior with VenueManagement: load once, refresh only on manual action
    fetchEventDetails();

    return () => {
      // No auto-refresh listeners/intervals
    };
  }, [id]);

  const refreshEventDetails = async () => {
    setRefreshing(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.get(`${apiBase}/host/my-events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (resp.data) {
        const dateObj = new Date(resp.data.date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        const safeDate = formattedDate < todayDate ? todayDate : formattedDate;

        const baseStart = resp.data.startTime || currentTime;
        const baseEnd = resp.data.endTime || baseStart;
        const safeStart = clampToNow(safeDate, baseStart);
        const safeEnd = baseEnd < safeStart ? safeStart : baseEnd;
        
        // Calculate duration from startTime and endTime
        const calculateDuration = (start: string, end: string) => {
          const [sh, sm] = start.split(':').map(Number);
          const [eh, em] = end.split(':').map(Number);
          const startMins = sh * 60 + sm;
          const endMins = eh * 60 + em;
          let diffMins = endMins - startMins;
          if (diffMins <= 0) diffMins = 60; // Default to 1 hour
          return { hours: Math.floor(diffMins / 60), minutes: diffMins % 60 };
        };
        
        const { hours, minutes } = calculateDuration(safeStart, safeEnd);
        
        setEventData({
          title: resp.data.title || "",
          category: resp.data.category || "",
          location: resp.data.location || "",
          mapLink: resp.data.mapLink || "",
          date: safeDate,
          startTime: safeStart,
          endTime: safeEnd,
          durationHours: hours,
          durationMinutes: minutes,
          description: resp.data.description || "",
          capacity: resp.data.capacity || 0,
          price: resp.data.price || 0,
          ticketsAvailable: resp.data.ticketsAvailable || resp.data.capacity || 0,
          venue: resp.data.venue || "",
          amenities: resp.data.amenities || "",
          images: resp.data.images || (resp.data.image ? [resp.data.image] : []),
        });
        setLastRefresh(new Date());
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to refresh event details");
      setTimeout(() => setError(""), 3000);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchEventDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.get(`${apiBase}/host/my-events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (resp.data) {
        // Format date for input (YYYY-MM-DD)
        const dateObj = new Date(resp.data.date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        const safeDate = formattedDate < todayDate ? todayDate : formattedDate;

        const baseStart = resp.data.startTime || currentTime;
        const baseEnd = resp.data.endTime || baseStart;
        const safeStart = clampToNow(safeDate, baseStart);
        const safeEnd = baseEnd < safeStart ? safeStart : baseEnd;
        
        // Calculate duration from startTime and endTime
        const calculateDuration = (start: string, end: string) => {
          const [sh, sm] = start.split(':').map(Number);
          const [eh, em] = end.split(':').map(Number);
          const startMins = sh * 60 + sm;
          const endMins = eh * 60 + em;
          let diffMins = endMins - startMins;
          if (diffMins <= 0) diffMins = 60; // Default to 1 hour
          return { hours: Math.floor(diffMins / 60), minutes: diffMins % 60 };
        };
        
        const { hours, minutes } = calculateDuration(safeStart, safeEnd);
        
        setEventData({
          title: resp.data.title || "",
          category: resp.data.category || "",
          location: resp.data.location || "",
          mapLink: resp.data.mapLink || "",
          date: safeDate,
          startTime: safeStart,
          endTime: safeEnd,
          durationHours: hours,
          durationMinutes: minutes,
          description: resp.data.description || "",
          capacity: resp.data.capacity || 0,
          price: resp.data.price || 0,
          ticketsAvailable: resp.data.ticketsAvailable || resp.data.capacity || 0,
          venue: resp.data.venue || "",
          amenities: resp.data.amenities || "",
          images: resp.data.images || (resp.data.image ? [resp.data.image] : []),
        });        setLastRefresh(new Date());      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (value: string) => {
    if (!value) return;
    setEventData((prev) => {
      const nextDate = value < todayDate ? todayDate : value;
      let nextStart = clampToNow(nextDate, prev.startTime || currentTime);
      let nextEnd = prev.endTime || nextStart;
      if (nextEnd < nextStart) nextEnd = nextStart;
      return { ...prev, date: nextDate, startTime: nextStart, endTime: nextEnd };
    });
  };

  const updateStartTime = (hour: string, minute: string, ampm: string) => {
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

  const updateDuration = (hours: number, minutes: number) => {
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

  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteOptions = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  const startParts = to12HourParts(eventData.startTime || currentTime);
  const endParts = to12HourParts(eventData.endTime || eventData.startTime || currentTime);

  const handleImageUpload = async () => {
    if (!imageFiles || imageFiles.length === 0) {
      setError("Please select at least one image file");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setUploadingImages(true);
    setError("");
    setSuccess("");
    
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append("images", imageFiles[i]);
      }

      const resp = await axios.post(
        `${apiBase}/upload/images`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (resp.data && resp.data.urls) {
        setEventData((prev) => ({
          ...prev,
          images: [...prev.images, ...resp.data.urls],
        }));
        setSuccess(`${resp.data.urls.length} image(s) uploaded successfully!`);
        setTimeout(() => setSuccess(""), 3000);
        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      const errorMsg = err?.response?.data?.error || err?.message || "Failed to upload images";
      setError(errorMsg);
      setTimeout(() => setError(""), 5000);
    } finally {
      setUploadingImages(false);
      setImageFiles(null);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const imgUrl = eventData.images[index];
      if (!imgUrl) return;
      const token = localStorage.getItem("token");
      await axios.delete(`${apiBase}/host/my-events/${id}/images`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { url: imgUrl },
      });
      setEventData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
      setSuccess("Image removed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Failed to remove image";
      setError(msg);
      setTimeout(() => setError(""), 4000);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const resp = await axios.put(
        `${apiBase}/host/my-events/${id}`,
        eventData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (resp.data) {
        setSuccess("Event updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
        // Refresh data to sync with booking page
        await refreshEventDetails();
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiBase}/host/my-events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/profile");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to delete event");
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Navbar />
        <span>Loading event details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center gap-3">
                  <Calendar className="w-10 h-10" />
                  Manage Event
                </h1>
                <p className="text-muted-foreground">
                  Update your event details and manage tickets
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Updated {lastRefresh.toLocaleTimeString()}
                </span>
                <Button variant="outline" onClick={refreshEventDetails} disabled={refreshing}>
                  {refreshing ? "Refreshing..." : "Refresh Data"}
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Event Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={eventData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter event title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={eventData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    placeholder="e.g., Music, Sports, Conference"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={eventData.venue}
                    onChange={(e) => handleInputChange("venue", e.target.value)}
                    placeholder="Venue name"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location *
                  </Label>
                  <Input
                    id="location"
                    value={eventData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Event location/address"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!navigator.geolocation) {
                          setError("Geolocation not supported");
                          setTimeout(() => setError(""), 3000);
                          return;
                        }
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            const { latitude, longitude } = pos.coords;
                            const link = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                            handleInputChange("mapLink", link);
                          },
                          (err) => {
                            setError(err?.message || "Failed to get location");
                            setTimeout(() => setError(""), 3000);
                          },
                          { enableHighAccuracy: true, timeout: 10000 }
                        );
                      }}
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
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <span>Event Date *</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">Future only</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="date"
                      type="date"
                      min={todayDate}
                      value={eventData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDateChange(todayDate)}
                      className="text-sm"
                    >
                      Today
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="flex items-center gap-2">
                    <span>Start Time</span>
                    <span className="text-xs text-muted-foreground">No past time</span>
                  </Label>
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3 bg-muted/40">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <select
                      className="rounded-md border px-2 py-1 bg-background"
                      value={startParts.hour}
                      onChange={(e) => updateStartTime(e.target.value, startParts.minute, startParts.ampm)}
                    >
                      {hourOptions.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-sm text-muted-foreground">:</span>
                    <select
                      className="rounded-md border px-2 py-1 bg-background"
                      value={startParts.minute}
                      onChange={(e) => updateStartTime(startParts.hour, e.target.value, startParts.ampm)}
                    >
                      {minuteOptions.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      className="rounded-md border px-2 py-1 bg-background"
                      value={startParts.ampm}
                      onChange={(e) => updateStartTime(startParts.hour, startParts.minute, e.target.value)}
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
                        handleDateChange(targetDate);
                        const nowParts = to12HourParts(targetDate === todayDate ? currentTime : '09:00');
                        updateStartTime(nowParts.hour, nowParts.minute, nowParts.ampm);
                      }}
                    >
                      Now
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <span>Event Duration</span>
                    <span className="text-xs text-muted-foreground">Hours and minutes</span>
                  </Label>
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3 bg-muted/40">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <select
                      className="rounded-md border px-2 py-1 bg-background"
                      value={eventData.durationHours}
                      onChange={(e) => updateDuration(parseInt(e.target.value) || 0, eventData.durationMinutes)}
                    >
                      {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                        <option key={h} value={h}>{String(h).padStart(2, '0')} hour{h !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    <span className="text-sm text-muted-foreground">+</span>
                    <select
                      className="rounded-md border px-2 py-1 bg-background"
                      value={eventData.durationMinutes}
                      onChange={(e) => updateDuration(eventData.durationHours, parseInt(e.target.value) || 0)}
                    >
                      {minuteOptions.map((m) => (
                        <option key={m} value={m}>{m} min</option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateDuration(1, 0)}
                    >
                      1 hour
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    value={eventData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your event"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-[100px]"
                  />
                </div>
              </div>
            </Card>

            {/* Tickets & Pricing */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Ticket className="w-6 h-6" />
                Tickets & Pricing
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Total Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={eventData.capacity}
                    onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
                    placeholder="Total capacity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticketsAvailable">Tickets Available</Label>
                  <Input
                    id="ticketsAvailable"
                    type="number"
                    value={eventData.ticketsAvailable}
                    onChange={(e) => handleInputChange("ticketsAvailable", parseInt(e.target.value) || 0)}
                    placeholder="Available tickets"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={eventData.price}
                    onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                    placeholder="Ticket price (0 for free)"
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="amenities">Amenities (comma separated)</Label>
                  <Input
                    id="amenities"
                    value={eventData.amenities}
                    onChange={(e) => handleInputChange("amenities", e.target.value)}
                    placeholder="WiFi, Food, Parking, Merchandise"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="text-sm space-y-1">
                  <p><strong>Total Capacity:</strong> {eventData.capacity}</p>
                  <p><strong>Tickets Sold:</strong> {eventData.capacity - eventData.ticketsAvailable}</p>
                  <p><strong>Tickets Remaining:</strong> {eventData.ticketsAvailable}</p>
                  <p><strong>Revenue:</strong> ₹{((eventData.capacity - eventData.ticketsAvailable) * eventData.price).toFixed(2)}</p>
                </div>
              </div>
            </Card>

            {/* Image Gallery */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Event Images</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(e.target.files)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleImageUpload}
                    disabled={!imageFiles || uploadingImages}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImages ? "Uploading..." : "Upload"}
                  </Button>
                </div>

                {eventData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {eventData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Event ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveImage(idx); }}
                          type="button"
                          className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 duration-200 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Event
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your event and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagement;
