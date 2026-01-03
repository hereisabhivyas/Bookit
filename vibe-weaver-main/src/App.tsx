import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Communities from "./pages/Communities";
import CommunityChat from "./pages/CommunityChat";
import Auth from "./pages/Auth";
import Profile from "./pages/profile";
import HostRegistration from "./pages/HostRegistration";
import VenueManagement from "./pages/VenueManagement";
import EventManagement from "./pages/EventManagement";
import VenueBooking from "./pages/VenueBooking";
import EventBooking from "./pages/EventBooking";
import Billing from "./pages/Billing";
import BookingHistory from "./pages/BookingHistory";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import CancellationRefund from "./pages/CancellationRefund";
import ShippingPolicy from "./pages/ShippingPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import axios from "axios";

axios.defaults.baseURL = 'https://bookit-dijk.onrender.com';



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/events" element={<Events />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/communities/:id/chat" element={<CommunityChat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/host-registration" element={<HostRegistration />} />
          <Route path="/venue/:id" element={<VenueManagement />} />
          <Route path="/venues/:id/book" element={<VenueBooking />} />
          <Route path="/event/:id" element={<EventManagement />} />
          <Route path="/events/:id/book" element={<EventBooking />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/bookings" element={<BookingHistory />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cancellation-refund" element={<CancellationRefund />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
