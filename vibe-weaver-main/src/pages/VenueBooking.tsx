import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Armchair, ArrowLeft, Building2, CheckCircle, Calendar, Clock, RefreshCw } from "lucide-react";

interface SeatBooking {
  date: string;
  startTime: string;
  endTime: string;
}

interface Seat {
  id: number;
  label: string;
    price?: number;
  bookings: SeatBooking[];
}

interface VenueDetail {
  _id: string;
  venueName: string;
  businessType: string;
  city: string;
  address?: string;
  website?: string;
  description: string;
  capacity: number;
  pricePerHour?: number;
  seats?: Seat[];
  images?: string[];
  image?: string;
}

const VenueBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingStartTime, setBookingStartTime] = useState<string>("");
  const [bookingHours, setBookingHours] = useState<number>(1);

  // Date & Time helpers (12h AM/PM UI like management)
  const todayDate = () => new Date().toISOString().slice(0, 10);
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

  const [startParts, setStartParts] = useState(() => to12HourParts("09:00"));

  useEffect(() => {
    const t = todayDate();
    let startTime = "09:00";
    startTime = clampToNow(t, startTime);
    const sp = to12HourParts(startTime);
    setBookingDate(t);
    setStartParts(sp);
    setBookingStartTime(startTime);
    setBookingHours(1);
  }, []);

  const handleBookingDateChange = (value: string) => {
    setBookingDate(value);
    let start24 = to24Hour(startParts.hour, startParts.minute, startParts.ampm as 'AM' | 'PM');
    start24 = clampToNow(value, start24);
    const newStart = to12HourParts(start24);
    setStartParts(newStart);
    setBookingStartTime(start24);
  };

  const updateStartTime = (hour?: string, minute?: string, ampm?: 'AM' | 'PM') => {
    const h = hour ?? startParts.hour;
    const m = minute ?? startParts.minute;
    const ap = (ampm ?? startParts.ampm) as 'AM' | 'PM';
    let start24 = to24Hour(h, m, ap);
    start24 = clampToNow(bookingDate || todayDate(), start24);
    const newParts = to12HourParts(start24);
    setStartParts(newParts);
    setBookingStartTime(start24);
  };

  useEffect(() => {
    const fetchVenue = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const resp = await axios.get(`/api/venues/${id}`);
        setVenue(resp.data);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load venue details");
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  const refreshVenue = async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      const resp = await axios.get(`/api/venues/${id}`);
      setVenue(resp.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to refresh venue details");
      setTimeout(() => setError(""), 3000);
    } finally {
      setRefreshing(false);
    }
  };

  const totalPrice = useMemo(() => {
    if (!venue?.seats) return 0;
    return selectedSeatIds.reduce((sum, seatId) => {
      const seat = venue.seats?.find(s => s.id === seatId);
      const seatPrice = seat?.price ?? venue.pricePerHour ?? 0;
      return sum + (seatPrice * bookingHours);
    }, 0);
  }, [venue, selectedSeatIds, bookingHours]);

  const isSeatBooked = (bookings: SeatBooking[]) => {
    if (!bookingDate || !bookingStartTime || !bookingHours) return false;
    const [sh, sm] = bookingStartTime.split(":").map((x) => parseInt(x, 10));
    const selStart = sh * 60 + sm;
    const selEnd = selStart + (bookingHours * 60);
    return bookings.some((b) => {
      if (b.date !== bookingDate) return false;
      const [bsH, bsM] = (b.startTime || "0:0").split(":").map((x) => parseInt(x, 10));
      const bStart = bsH * 60 + bsM;
      // Calculate end time from start + hours to handle cross-midnight
      const [beH, beM] = (b.endTime || "0:0").split(":").map((x) => parseInt(x, 10));
      let bEnd = beH * 60 + beM;
      // If end appears before start, it crossed midnight
      if (bEnd < bStart) bEnd += 24 * 60;
      return selStart < bEnd && selEnd > bStart;
    });
  };

  const toggleSeatSelection = (seatId: number, hasBookings: boolean) => {
    if (hasBookings) return; // simple rule: block seats with existing bookings
    setSelectedSeatIds((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      return [...prev, seatId];
    });
  };

  const proceedToPayment = () => {
    if (!venue) return;
    const start24 = to24Hour(startParts.hour, startParts.minute, startParts.ampm as 'AM' | 'PM');
    if (!bookingDate || !start24 || !bookingHours) {
      setError("Please select booking date, time and hours");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (selectedSeatIds.length === 0) {
      setError("Please select at least one seat to proceed");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Navigate to Billing page with computed details (defer API call to Billing)
    const seatsForPricing = (venue?.seats || []).filter(s => selectedSeatIds.includes(s.id)).map(s => ({ id: s.id, price: s.price }));
    navigate('/billing', {
      state: {
        type: 'venue',
        details: {
          venueId: venue._id,
          venueName: venue.venueName,
          seatIds: selectedSeatIds,
          seats: seatsForPricing,
          basePrice: venue.pricePerHour || 0,
          date: bookingDate,
          startTime: start24,
          hours: bookingHours,
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Navbar />
        <span>Loading venue...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 max-w-4xl">
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center gap-3">
              <Building2 className="w-10 h-10" />
              Book Seats at {venue?.venueName}
            </h1>
            <p className="text-muted-foreground">{venue?.businessType} • {venue?.city}</p>
            {venue?.address && <p className="text-xs text-muted-foreground mt-1">📍 {venue.address}</p>}
          </div>

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Venue Images and Description */}
          <Card className="p-6 mb-6 bg-card/80 border border-border/60 shadow-lg backdrop-blur">
            <div className="space-y-6">
              {/* Images Gallery */}
              {(venue?.images && venue.images.length > 0) || venue?.image ? (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold">Venue Gallery</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {venue?.images && venue.images.length > 0 ? (
                      venue.images.map((img, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden aspect-video">
                          <img
                            src={img}
                            alt={`${venue.venueName} - Image ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))
                    ) : venue?.image ? (
                      <div className="relative rounded-lg overflow-hidden aspect-video md:col-span-2 lg:col-span-3">
                        <img
                          src={venue.image}
                          alt={venue.venueName}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Description */}
              {venue?.description && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold">About This Venue</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {venue.description}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              {venue?.website && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Website:</span>
                  <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {venue.website}
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Date & Time Selection */}
          <Card className="p-6 mb-6 bg-card/80 border border-border/60 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <h2 className="text-2xl font-semibold">Enter date and time for bookings</h2>
              <span className="text-sm text-muted-foreground">We will fetch live seat status after you set date & time.</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookingDate">Booking Date</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="bookingDate"
                      type="date"
                      min={todayDate()}
                      value={bookingDate}
                      onChange={(e) => handleBookingDateChange(e.target.value)}
                      className="pl-9 bg-muted/40 border-border/60 text-foreground"
                    />
                  </div>
                  <Button type="button" variant="outline" className="border-primary/60 text-primary" onClick={() => handleBookingDateChange(todayDate())}>Today</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <select value={startParts.hour} onChange={(e) => updateStartTime(e.target.value)} className="h-10 border border-border/60 bg-muted/40 rounded px-2 text-foreground">
                    {hourOptions.map((h) => (<option key={h} value={h}>{h}</option>))}
                  </select>
                  <span>:</span>
                  <select value={startParts.minute} onChange={(e) => updateStartTime(undefined, e.target.value)} className="h-10 border border-border/60 bg-muted/40 rounded px-2 text-foreground">
                    {minuteOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
                  </select>
                  <select value={startParts.ampm} onChange={(e) => updateStartTime(undefined, undefined, e.target.value as 'AM' | 'PM')} className="h-10 border border-border/60 bg-muted/40 rounded px-2 text-foreground">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                  <Button type="button" variant="outline" className="border-primary/60 text-primary" onClick={() => {
                    const now24 = currentTime24();
                    const sp = to12HourParts(now24);
                    setStartParts(sp);
                    setBookingStartTime(now24);
                  }}>Now</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Booking Hours</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <select 
                    value={bookingHours} 
                    onChange={(e) => setBookingHours(parseInt(e.target.value))} 
                    className="h-10 flex-1 border border-border/60 bg-muted/40 rounded px-2 text-foreground"
                  >
                    {bookingHoursOptions.map((h) => (
                      <option key={h} value={h}>{h} {h === 1 ? 'hour' : 'hours'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Seats Grid (mirroring Management visuals) */}
          <Card className="p-6 bg-card/80 border border-border/60 shadow-lg backdrop-blur">
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Armchair className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-semibold">Available seats</h2>
                  <p className="text-sm text-muted-foreground">Live status after selecting date & time. Sofa icons show owner labels.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={refreshVenue} disabled={refreshing}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
                {venue?.pricePerHour !== undefined && venue.pricePerHour > 0 && (
                  <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">
                    Base price: ${venue.pricePerHour.toFixed(2)}/hr
                  </span>
                )}
              </div>
            </div>

            {(() => {
              const seatList = (venue?.seats && venue.seats.length > 0)
                ? venue.seats
                : Array.from({ length: venue?.capacity || 0 }, (_, i) => ({ id: i + 1, label: "", bookings: [], price: venue?.pricePerHour || 0 }));
              return seatList.length > 0;
            })() ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {((venue?.seats && venue.seats.length > 0)
                      ? venue.seats
                      : Array.from({ length: venue?.capacity || 0 }, (_, i) => ({ id: i + 1, label: "", bookings: [], price: venue?.pricePerHour || 0 }))
                    ).map((seat) => {
                    const seatBookings = seat.bookings || [];
                    const hasBookings = isSeatBooked(seatBookings);
                    const selected = selectedSeatIds.includes(seat.id);
                    // Build tooltip showing conflicting bookings
                    const conflictDetails = hasBookings && seatBookings.length > 0 
                      ? seatBookings
                          .filter(b => b.date === bookingDate && b.startTime && b.endTime)
                          .map(b => {
                            const sp12 = to12HourParts(b.startTime);
                            const ep12 = to12HourParts(b.endTime);
                            return `${sp12.hour}:${sp12.minute}${sp12.ampm} - ${ep12.hour}:${ep12.minute}${ep12.ampm}`;
                          })
                          .join(', ')
                      : '';
                    const tooltipText = hasBookings 
                      ? `Booked: ${conflictDetails}` 
                      : 'Available';
                    return (
                      <div key={seat.id} className="space-y-2">
                        <button
                          onClick={() => toggleSeatSelection(seat.id, hasBookings)}
                          className={`w-full p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                            hasBookings
                              ? 'border-orange-500 bg-orange-50 cursor-not-allowed'
                              : selected
                                ? 'border-primary bg-primary/10'
                                : 'border-gray-300 bg-white hover:border-primary'
                          }`}
                          title={tooltipText}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Armchair className={`w-8 h-8 ${hasBookings ? 'text-orange-600' : selected ? 'text-primary' : 'text-gray-600'}`} />
                            <span className="text-xs font-semibold">Seat {seat.id}</span>
                            {seat.label && <span className="text-[10px] text-muted-foreground">{seat.label}</span>}
                            <span className="text-[10px] font-medium text-green-700">
                              ${(seat.price ?? venue.pricePerHour ?? 0).toFixed(2)}/hr
                            </span>
                            {hasBookings && (
                              <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded-full">Booked</span>
                            )}
                            {selected && !hasBookings && (
                              <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">Selected</span>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-muted/40 border border-border/60 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 border-2 border-gray-300 bg-white rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <div className="w-4 h-4 border-2 border-primary bg-primary/10 rounded"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <div className="w-4 h-4 border-2 border-orange-500 bg-orange-50 rounded"></div>
                    <span>Booked</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">No seat layout available</p>
              </div>
            )}
          </Card>

          {/* Bottom CTA */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-lg font-bold">Total: ${totalPrice.toFixed(2)}</div>
            <Button onClick={proceedToPayment} className="bg-gradient-to-r from-primary to-secondary">
              Confirm Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueBooking;
