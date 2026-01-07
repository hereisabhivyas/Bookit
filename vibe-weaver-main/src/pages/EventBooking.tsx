import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Building2, CheckCircle, Calendar, Clock, Ticket } from "lucide-react";

interface EventDetail {
  _id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  mapLink?: string;
  price?: number;
  image?: string;
  images?: string[];
  description: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  ticketsAvailable?: number;
}

const EventBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [ticketQty, setTicketQty] = useState<number>(1);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const resp = await axios.get(`/api/events/${id}`);
        setEvent(resp.data);
        // Clamp initial qty to available
        const avail = resp.data?.ticketsAvailable ?? 0;
        setTicketQty(avail > 0 ? 1 : 0);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const refreshEvent = async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      const resp = await axios.get(`/api/events/${id}`);
      setEvent(resp.data);
      const avail = resp.data?.ticketsAvailable ?? 0;
      setTicketQty((q) => (avail === 0 ? 0 : Math.min(Math.max(q, 1), avail)));
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to refresh event details");
      setTimeout(() => setError(""), 3000);
    } finally {
      setRefreshing(false);
    }
  };

  const unitPrice = useMemo(() => event?.price || 0, [event]);
  const totalPrice = useMemo(() => (unitPrice || 0) * (ticketQty || 0), [unitPrice, ticketQty]);

  const proceedToBooking = () => {
    if (!event) return;
    if (!ticketQty || ticketQty <= 0) {
      setError("Please select at least 1 ticket");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Navigate to Billing page with event details
    navigate('/billing', {
      state: {
        type: 'event',
        details: {
          eventId: event._id,
          title: event.title,
          quantity: ticketQty,
          unitPrice: event.price || 0,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Navbar />
        <span>Loading event...</span>
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
              Book Tickets for {event?.title}
            </h1>
            <p className="text-muted-foreground">{event?.category} • {event?.location}</p>
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = event?.mapLink || (event?.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}` : '');
                  if (!url) return;
                  window.open(url, '_blank');
                }}
              >
                See on maps
              </Button>
            </div>
          </div>

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Event Images and Description */}
          <Card className="p-6 mb-6 bg-card/80 border border-border/60 shadow-lg backdrop-blur">
            <div className="space-y-6">
              {/* Images Gallery */}
              {(event?.images && event.images.length > 0) || event?.image ? (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold">Event Gallery</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {event?.images && event.images.length > 0 ? (
                      event.images.map((img, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden aspect-video">
                          <img
                            src={img}
                            alt={`${event.title} - Image ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))
                    ) : event?.image ? (
                      <div className="relative rounded-lg overflow-hidden aspect-video md:col-span-2 lg:col-span-3">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Description */}
              {event?.description && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold">About This Event</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Event Details */}
          <Card className="p-6 mb-6 bg-card/80 border border-border/60 shadow-lg backdrop-blur">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Event Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{event ? new Date(event.date).toLocaleDateString() : '-'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{event?.startTime || '-'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{event?.endTime || '-'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tickets */}
          <Card className="p-6 bg-card/80 border border-border/60 shadow-lg backdrop-blur">
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Ticket className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-semibold">Tickets</h2>
                  <p className="text-sm text-muted-foreground">Select quantity and confirm booking.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={refreshEvent} disabled={refreshing}>
                  {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
                {unitPrice > 0 && (
                  <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">₹{unitPrice.toFixed(2)} per ticket</span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tickets Available</Label>
                <Input readOnly value={event?.ticketsAvailable ?? 0} />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <select 
                  value={ticketQty}
                  onChange={(e) => setTicketQty(parseInt(e.target.value) || 1)}
                  disabled={(event?.ticketsAvailable ?? 0) === 0}
                  className="h-10 border border-border/60 bg-muted/40 rounded px-2 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(event?.ticketsAvailable ?? 0) === 0 ? (
                    <option value={0}>No tickets available</option>
                  ) : (
                    Array.from({ length: event?.ticketsAvailable ?? 0 }, (_, i) => i + 1).map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <Input readOnly value={`₹${totalPrice.toFixed(2)}`} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <Button onClick={proceedToBooking} disabled={!ticketQty || (event?.ticketsAvailable ?? 0) === 0} className="bg-gradient-to-r from-primary to-secondary">
                Confirm Booking
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventBooking;
