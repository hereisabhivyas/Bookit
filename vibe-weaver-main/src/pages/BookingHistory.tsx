import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Users, Ticket, ArrowLeft, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface VenueBooking {
  type: 'venue';
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
  bookedAt: string;
}

interface EventBooking {
  type: 'event';
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
  bookedAt: string;
}

type Booking = VenueBooking | EventBooking;

const BookingHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axios.get('/api/bookings/history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookings(response.data);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch booking history",
        variant: "destructive"
      });
      
      if (error.response?.status === 401) {
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTotalSpent = () => {
    return bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  };

  const renderVenueBooking = (booking: VenueBooking) => (
    <Card key={`venue-${booking.venueId}-${booking.seatId}-${booking.date}`} className="hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{booking.venueName}</CardTitle>
              <CardDescription>Venue Booking</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Confirmed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{booking.address}, {booking.city}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)} ({booking.hours} hour{booking.hours > 1 ? 's' : ''})</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>Seat {booking.seatId}{booking.seatLabel && `: ${booking.seatLabel}`}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Rate: ${booking.pricePerHour}/hour</div>
              <div className="text-lg font-bold text-primary mt-1">
                Total: ${booking.totalPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Booked on {new Date(booking.bookedAt).toLocaleDateString()}</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/venues/${booking.venueId}/book`)}
          >
            View Venue
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEventBooking = (booking: EventBooking) => (
    <Card key={`event-${booking.eventId}-${booking.bookedAt}`} className="hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Ticket className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{booking.eventTitle}</CardTitle>
              <CardDescription>Event Booking</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Confirmed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{booking.location}</span>
            </div>
            {booking.venue && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{booking.venue}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{formatDate(booking.date)}</span>
            </div>
            {booking.startTime && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{formatTime(booking.startTime)}{booking.endTime && ` - ${formatTime(booking.endTime)}`}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Ticket className="w-4 h-4 text-muted-foreground" />
              <span>{booking.quantity} Ticket{booking.quantity > 1 ? 's' : ''}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Price: ${booking.pricePerTicket}/ticket</div>
              <div className="text-lg font-bold text-purple-600 mt-1">
                Total: ${booking.totalPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Booked on {new Date(booking.bookedAt).toLocaleDateString()}</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/events/${booking.eventId}/book`)}
          >
            View Event
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-4xl font-bold gradient-text mb-2">Booking History</h1>
          <p className="text-muted-foreground">View all your past and upcoming bookings</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">Start exploring venues and events to make your first booking!</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/events')}>
                  Browse Events
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Browse Venues
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 p-6 bg-gradient-to-r from-primary/10 to-purple-100/50 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Total Bookings</h3>
                  <p className="text-3xl font-bold text-primary">{bookings.length}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-right">Total Spent</h3>
                  <p className="text-3xl font-bold text-purple-600">${getTotalSpent().toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((booking) => 
                booking.type === 'venue' 
                  ? renderVenueBooking(booking as VenueBooking)
                  : renderEventBooking(booking as EventBooking)
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
