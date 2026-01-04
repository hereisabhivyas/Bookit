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
  Building2,
  Save,
  Trash2,
  Upload,
  X,
  CheckCircle,
  ArrowLeft,
  Armchair,
} from "lucide-react";

const VenueManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [venueData, setVenueData] = useState({
    venueName: "",
    businessType: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    website: "",
    description: "",
    capacity: 0,
    amenities: "",
    pricePerHour: 0,
    images: [] as string[],
  });

  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Seat/Capacity management
  const [seats, setSeats] = useState<Array<{ id: number; label: string; price?: number; bookings: Array<{ date: string; startTime: string; endTime: string; hours?: number; createdBy?: 'user' | 'owner'; createdByEmail?: string; createdByName?: string }> }>>([]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [seatDialogOpen, setSeatDialogOpen] = useState(false);
  const [seatBooking, setSeatBooking] = useState({
    date: "",
    startTime: "",
    hours: 1,
  });

  // Date & time helpers for seat dialog (match booking page UI)
  const todayDate = () => new Date().toISOString().slice(0, 10);
  const getTodaysBookingCount = (bookings: Array<{ date: string; startTime: string; endTime: string; hours?: number; createdBy?: 'user' | 'owner'; createdByEmail?: string; createdByName?: string }>) => {
    const today = todayDate();
    return bookings.filter(booking => booking.date === today).length;
  };
  const currentTime24 = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };
  const to12HourParts = (timeStr: string) => {
    const [hStr, mStr] = (timeStr || '00:00').split(':');
    let h = parseInt(hStr || '0', 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return { hour: String(h).padStart(2, '0'), minute: m.padStart(2, '0'), ampm } as const;
  };
  const to24Hour = (hour: string, minute: string, ampm: 'AM' | 'PM') => {
    let h = parseInt(hour || '0', 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(minute || '00').padStart(2, '0')}`;
  };
  const clampToNow = (dateStr: string, timeStr: string) => {
    try {
      const today = todayDate();
      if (dateStr !== today) return timeStr;
      const now = currentTime24();
      const [sh, sm] = (timeStr || '00:00').split(':').map((x) => parseInt(x, 10));
      const [nh, nm] = now.split(':').map((x) => parseInt(x, 10));
      const selMin = sh * 60 + sm;
      const nowMin = nh * 60 + nm;
      return selMin < nowMin ? now : timeStr;
    } catch {
      return timeStr;
    }
  };
  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteOptions = ['00','05','10','15','20','25','30','35','40','45','50','55'];
  const bookingHoursOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const [startParts, setStartParts] = useState(() => to12HourParts(currentTime24()));

  useEffect(() => {
    fetchVenueDetails();
  }, [id]);

  const fetchVenueDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.get(`https://bookit-dijk.onrender.com/host/my-requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (resp.data) {
        setVenueData({
          venueName: resp.data.venueName || "",
          businessType: resp.data.businessType || "",
          contactPerson: resp.data.contactPerson || "",
          email: resp.data.email || "",
          phone: resp.data.phone || "",
          address: resp.data.address || "",
          city: resp.data.city || "",
          website: resp.data.website || "",
          description: resp.data.description || "",
          capacity: resp.data.capacity || 0,
          amenities: resp.data.amenities || "",
          pricePerHour: resp.data.pricePerHour || 0,
          images: resp.data.images || [],
        });
        
        // Initialize seats based on capacity
        const existingSeats = resp.data.seats || [];
        const capacity = resp.data.capacity || 0;
        const initializedSeats = Array.from({ length: capacity }, (_, i) => {
          const existingSeat = existingSeats.find((s: any) => s.id === i + 1);
          return existingSeat || { id: i + 1, label: "", price: resp.data.pricePerHour || 0, bookings: [] };
        });
        setSeats(initializedSeats);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load venue details");
    } finally {
      setLoading(false);
    }
  };

  const refreshVenueDetails = async () => {
    setRefreshing(true);
    try {
      await fetchVenueDetails();
    } finally {
      setRefreshing(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setVenueData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // If capacity changes, update seats array
      if (field === 'capacity') {
        const newCapacity = parseInt(value) || 0;
        const currentSeats = [...seats];
        
        if (newCapacity > currentSeats.length) {
          // Add new seats
          const newSeats = Array.from({ length: newCapacity - currentSeats.length }, (_, i) => ({
            id: currentSeats.length + i + 1,
            label: "",
                        price: updated.pricePerHour || 0,
            bookings: []
          }));
          setSeats([...currentSeats, ...newSeats]);
        } else if (newCapacity < currentSeats.length) {
          // Remove extra seats
          setSeats(currentSeats.slice(0, newCapacity));
        }
      }
      
      return updated;
    });
  };

  const handleSeatLabelChange = (seatId: number, label: string) => {
    setSeats(prev => prev.map(seat => 
      seat.id === seatId ? { ...seat, label } : seat
    ));
  };

  const handleSeatPriceChange = (seatId: number, price: number) => {
    setSeats(prev => prev.map(seat => 
      seat.id === seatId ? { ...seat, price } : seat
    ));
  };

  const applyPriceToAllSeats = () => {
    const basePrice = venueData.pricePerHour || 0;
    setSeats(prev => prev.map(seat => ({ ...seat, price: basePrice })));
    setSuccess("Base price applied to all seats!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSeatClick = (seatId: number) => {
    setSelectedSeat(seatId);
    setSeatDialogOpen(true);
    const today = todayDate();
    // Initialize to 09:00 AM as default, not current time
    const defaultTime = "09:00";
    const sp = to12HourParts(defaultTime);
    setStartParts(sp);
    setSeatBooking({ date: today, startTime: defaultTime, hours: 1 });
    console.log('DEBUG: Dialog opened, initialized to:', defaultTime);
  };

  const handleSeatBookingDateChange = (value: string) => {
    setSeatBooking((prev) => ({ ...prev, date: value }));
    let start24 = to24Hour(startParts.hour, startParts.minute, startParts.ampm as 'AM' | 'PM');
    // Don't clamp for management - allow any time to be set
    const newStart = to12HourParts(start24);
    setStartParts(newStart);
    setSeatBooking((prev) => ({ ...prev, startTime: start24 }));
  };

  const updateSeatStartTime = (hour?: string, minute?: string, ampm?: 'AM' | 'PM') => {
    // Use new values if provided, otherwise keep current
    const h = hour !== undefined ? hour : startParts.hour;
    const m = minute !== undefined ? minute : startParts.minute;
    const ap = ampm !== undefined ? ampm : startParts.ampm;
    
    console.log('DEBUG updateSeatStartTime:', { provided: { hour, minute, ampm }, used: { h, m, ap } });
    
    let start24 = to24Hour(h, m, ap);
    // Don't clamp for management - allow any time to be set
    const newParts = to12HourParts(start24);
    
    console.log('DEBUG updateSeatStartTime result:', { start24, newParts });
    
    setStartParts(newParts);
    setSeatBooking((prev) => {
      const updated = { ...prev, startTime: start24 };
      console.log('DEBUG setSeatBooking:', updated);
      return updated;
    });
  };

  const handleAddSeatBooking = async () => {
    if (!selectedSeat || !seatBooking.date || !seatBooking.startTime || !seatBooking.hours) {
      setError("Please fill all booking details");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Client-side overlap check to avoid conflicting bookings
    try {
      const seat = seats.find(s => s.id === selectedSeat);
      const [sh, sm] = String(seatBooking.startTime).split(':').map((x) => parseInt(x, 10));
      const selStart = (sh * 60) + (sm || 0);
      const selEnd = selStart + (seatBooking.hours * 60);
      const conflict = (seat?.bookings || []).some((b) => {
        if (!b || String(b.date) !== String(seatBooking.date)) return false;
        const [bsH, bsM] = String(b.startTime || '00:00').split(':').map((x) => parseInt(x, 10));
        const [beH, beM] = String(b.endTime || '00:00').split(':').map((x) => parseInt(x, 10));
        const bStart = (bsH * 60) + (bsM || 0);
        const bEnd = (beH * 60) + (beM || 0);
        return selStart < bEnd && selEnd > bStart;
      });
      if (conflict) {
        setError('Selected time overlaps with an existing booking');
        setTimeout(() => setError(''), 3000);
        return;
      }
    } catch {}

    try {
      const token = localStorage.getItem("token");
      const resp = await axios.post(
        `https://bookit-dijk.onrender.com/host/my-requests/${id}/seats/${selectedSeat}/bookings`,
        { date: seatBooking.date, startTime: seatBooking.startTime, hours: seatBooking.hours },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Always re-fetch host request to ensure owner bookings appear in upcoming list
      await fetchVenueDetails();
      setSuccess("Booking added successfully!");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to add booking");
    } finally {
      setSeatDialogOpen(false);
      setSelectedSeat(null);
      setSeatBooking({ date: "", startTime: "", hours: 1 });
      setTimeout(() => setSuccess(""), 3000);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleRemoveSeatBooking = async (seatId: number, bookingIndex: number) => {
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.delete(
        `https://bookit-dijk.onrender.com/host/my-requests/${id}/seats/${seatId}/bookings/${bookingIndex}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Re-fetch to sync UI and ensure upcoming list reflects deletion
      await fetchVenueDetails();
      setSuccess("Booking removed successfully!");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to remove booking";
      setError(msg);
      setTimeout(() => setError(""), 3000);
    }
  };

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
        `https://bookit-dijk.onrender.com/upload/images`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (resp.data && resp.data.urls) {
        setVenueData((prev) => ({
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
      const imgUrl = venueData.images[index];
      if (!imgUrl) return;
      const token = localStorage.getItem("token");
      await axios.delete(`https://bookit-dijk.onrender.com/host/my-requests/${id}/images`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { url: imgUrl },
      });
      setVenueData((prev) => ({
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
        `https://bookit-dijk.onrender.com/host/my-requests/${id}`,
        { ...venueData, seats },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (resp.data) {
        setSuccess("Venue updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update venue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://bookit-dijk.onrender.com/host/my-requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/profile");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to delete venue");
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Navbar />
        <span>Loading venue details...</span>
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
            <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center gap-3">
              <Building2 className="w-10 h-10" />
              Manage Venue
            </h1>
            <p className="text-muted-foreground">
              Update your venue details and manage availability
            </p>
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
              <h2 className="text-2xl font-semibold mb-6">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venueName">Venue Name *</Label>
                  <Input
                    id="venueName"
                    value={venueData.venueName}
                    onChange={(e) => handleInputChange("venueName", e.target.value)}
                    placeholder="Enter venue name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Input
                    id="businessType"
                    value={venueData.businessType}
                    onChange={(e) => handleInputChange("businessType", e.target.value)}
                    placeholder="e.g., Restaurant, Hall, Theater"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={venueData.contactPerson}
                    onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    placeholder="Contact person name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={venueData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="contact@venue.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={venueData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={venueData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City name"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={venueData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Full address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={venueData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Total Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={venueData.capacity}
                    onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
                    placeholder="Total capacity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerHour">Price Per Hour ($)</Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    value={venueData.pricePerHour}
                    onChange={(e) => handleInputChange("pricePerHour", parseFloat(e.target.value) || 0)}
                    placeholder="Hourly rate"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="amenities">Amenities (comma separated)</Label>
                  <Input
                    id="amenities"
                    value={venueData.amenities}
                    onChange={(e) => handleInputChange("amenities", e.target.value)}
                    placeholder="WiFi, Parking, AC, Projector"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    value={venueData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your venue"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-[100px]"
                  />
                </div>
              </div>
            </Card>
            {/* Upcoming Bookings Section */}
            {seats.length > 0 && (() => {
              const now = new Date();
              const today = now.toISOString().slice(0, 10);
              const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
              const upcomingBookings = seats.flatMap((seat) =>
                (seat.bookings || []).map((booking) => ({ ...booking, seatId: seat.id, seatLabel: seat.label }))
              ).filter((b) => {
                if (b.date > today) return true;
                if (b.date === today) {
                  // For today's bookings, only show if end time hasn't passed yet
                  const endTime = b.endTime || b.startTime;
                  return endTime >= nowTime;
                }
                return false;
              }).sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date);
                return a.startTime.localeCompare(b.startTime);
              });

              return upcomingBookings.length > 0 ? (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Upcoming Bookings</h2>
                    <Button variant="outline" size="sm" onClick={refreshVenueDetails} disabled={refreshing}>
                      {refreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {upcomingBookings.map((booking, idx) => {
                      const [sh, sm] = booking.startTime.split(':');
                      const [eh, em] = (booking.endTime || '00:00').split(':');
                      const startParts12 = to12HourParts(booking.startTime);
                      const endParts12 = to12HourParts(booking.endTime || '00:00');
                      return (
                        <div key={idx} className="flex items-start justify-between p-4 bg-muted/40 border border-border/60 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Armchair className="w-4 h-4 text-primary" />
                              <span className="font-semibold">Seat {booking.seatId}</span>
                              {booking.seatLabel && <span className="text-xs text-muted-foreground">({booking.seatLabel})</span>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              📅 {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              🕒 {startParts12.hour}:{startParts12.minute} {startParts12.ampm} - {endParts12.hour}:{endParts12.minute} {endParts12.ampm}
                              {booking.hours && <span className="ml-2">({booking.hours} {booking.hours === 1 ? 'hour' : 'hours'})</span>}
                            </div>
                            {booking.createdBy === 'user' && (
                              <div className="text-sm mt-1">
                                <span className="font-medium">Booked by:</span>
                                {booking.createdByName ? (
                                  <span> {booking.createdByName} </span>
                                ) : null}
                                {booking.createdByEmail && (
                                  <span className="text-muted-foreground">({booking.createdByEmail})</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ) : null;
            })()}


            {/* Image Gallery */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Image Gallery</h2>
              
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

                {venueData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {venueData.images.map((img, idx) => (
                      <div key={idx} className="relative group cursor-pointer">
                        <img
                          src={img}
                          alt={`Venue ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
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

            {/* Availability Management */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Armchair className="w-6 h-6" />
                Seat & Capacity Management
              </h2>

              {venueData.capacity > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Base Price Per Hour: ${venueData.pricePerHour}</p>
                      <p className="text-xs text-blue-700">You can set different prices for individual seats below</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={applyPriceToAllSeats}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Apply to All Seats
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {seats.map((seat) => {
                      const todayBookings = getTodaysBookingCount(seat.bookings);
                      return (
                      <div key={seat.id} className="space-y-2 p-4 border-2 border-gray-200 rounded-lg hover:border-primary/50 transition-all">
                        <div className="flex items-center justify-between">
                          <button
                          onClick={() => handleSeatClick(seat.id)}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                            todayBookings > 0 
                              ? 'border-orange-500 bg-orange-50' 
                              : 'border-gray-300 bg-white hover:border-primary'
                          }`}
                          title={`Seat ${seat.id} - ${todayBookings} booking(s) today`}
                          >
                          <div className="flex flex-col items-center gap-1">
                            <Armchair className={`w-6 h-6 ${todayBookings > 0 ? 'text-orange-600' : 'text-gray-600'}`} />
                            <span className="text-xs font-semibold">Seat {seat.id}</span>
                            {todayBookings > 0 && (
                              <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">
                                {todayBookings}
                              </span>
                            )}
                          </div>
                          </button>
                        </div>
                        <Input
                          type="text"
                          placeholder="Label (e.g., Window seat)"
                          value={seat.label}
                          onChange={(e) => handleSeatLabelChange(seat.id, e.target.value)}
                          className="text-xs"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">$/hr:</span>
                          <Input
                            type="number"
                            placeholder="Price/hour"
                            value={seat.price || 0}
                            onChange={(e) => handleSeatPriceChange(seat.id, parseFloat(e.target.value) || 0)}
                            className="text-xs"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    );
                    })}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 border-2 border-gray-300 bg-white rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <div className="w-4 h-4 border-2 border-orange-500 bg-orange-50 rounded"></div>
                      <span>Has Bookings</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Set a capacity above to manage seats</p>
                </div>
              )}
            </Card>

            {/* Seat Booking Dialog */}
            <AlertDialog open={seatDialogOpen} onOpenChange={setSeatDialogOpen}>
              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Book Seat {selectedSeat}</AlertDialogTitle>
                  <AlertDialogDescription>
                    Add booking timings for this seat. You can add multiple bookings per seat.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="space-y-4 py-4">
                  {selectedSeat && seats.find(s => s.id === selectedSeat)?.bookings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Current Bookings:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {seats.find(s => s.id === selectedSeat)?.bookings.map((booking, idx) => {
                          const startParts12 = to12HourParts(booking.startTime);
                          const endParts12 = to12HourParts(booking.endTime);
                          const startDisplay = `${startParts12.hour}:${startParts12.minute} ${startParts12.ampm}`;
                          const endDisplay = `${endParts12.hour}:${endParts12.minute} ${endParts12.ampm}`;
                          const hoursDisplay = booking.hours ? ` (${booking.hours}h)` : '';
                          return (
                            <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                              <span>{new Date(booking.date).toLocaleDateString()} | {startDisplay} - {endDisplay}{hoursDisplay}</span>
                              {booking.createdBy !== 'user' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => selectedSeat && handleRemoveSeatBooking(selectedSeat, idx)}
                                  className="h-6 px-2 text-red-600 hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="bookingDate">Booking Date</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="bookingDate"
                        type="date"
                        value={seatBooking.date}
                        onChange={(e) => handleSeatBookingDateChange(e.target.value)}
                        className="bg-muted/40 border-border/60 text-foreground"
                      />
                      <Button variant="outline" className="border-primary/60 text-primary" onClick={() => handleSeatBookingDateChange(todayDate())}>Today</Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <select value={startParts.hour} onChange={(e) => updateSeatStartTime(e.target.value)} className="h-10 w-16 border border-border/60 bg-muted/40 rounded px-2 text-foreground">
                          {hourOptions.map((h) => (<option key={h} value={h}>{h}</option>))}
                        </select>
                        <span className="text-lg">:</span>
                        <select value={startParts.minute} onChange={(e) => updateSeatStartTime(undefined, e.target.value)} className="h-10 w-16 border border-border/60 bg-muted/40 rounded px-2 text-foreground">
                          {minuteOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
                        </select>
                        <select value={startParts.ampm} onChange={(e) => updateSeatStartTime(undefined, undefined, e.target.value as 'AM' | 'PM')} className="h-10 w-16 border border-border/60 bg-muted/40 rounded px-2 text-foreground">
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                        <Button type="button" variant="outline" size="sm" className="border-primary/60 text-primary ml-2" onClick={() => {
                          const now24 = currentTime24();
                          const sp = to12HourParts(now24);
                          setStartParts(sp);
                          setSeatBooking((prev) => ({ ...prev, startTime: now24 }));
                        }}>Now</Button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ℹ️ Booking will be saved as: {seatBooking.startTime}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Booking Hours</Label>
                      <div className="flex items-center gap-2">
                        <select 
                          value={seatBooking.hours} 
                          onChange={(e) => setSeatBooking((prev) => ({ ...prev, hours: parseInt(e.target.value) }))} 
                          className="h-10 flex-1 border border-border/60 bg-muted/40 rounded px-2 text-foreground"
                        >
                          {bookingHoursOptions.map((h) => (
                            <option key={h} value={h}>{h} {h === 1 ? 'hour' : 'hours'}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAddSeatBooking} className="bg-primary">
                    Add Booking
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Action Buttons */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Venue
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your venue and all associated data.
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

export default VenueManagement;
