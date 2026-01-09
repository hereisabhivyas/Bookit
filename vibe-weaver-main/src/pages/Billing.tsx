import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMemo, useState } from "react";
import axios from "axios";
import { API_URL } from "@/lib/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Billing page expects navigation with location.state containing booking info
// { type: 'venue' | 'event', details: {...}, total: number }
// For venue: { venueId, venueName, seatIds, hours, date, startTime, seats: [{id, price}], basePrice }
// For event: { eventId, title, quantity, unitPrice }

export default function Billing() {
  const navigate = useNavigate();
  const location = useLocation();
  const state: any = location.state || {};
  const type: 'venue' | 'event' = state?.type || 'venue';
  const details = state?.details || {};

  const [billingName, setBillingName] = useState<string>("");
  const [billingEmail, setBillingEmail] = useState<string>("");
  const [billingPhone, setBillingPhone] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const subtotal = useMemo(() => {
    if (type === 'venue') {
      const hours = details.hours || 0;
      const seatIds: number[] = details.seatIds || [];
      const seats: Array<{ id: number; price?: number }> = details.seats || [];
      const basePrice = details.basePrice || 0;
      return seatIds.reduce((sum, id) => {
        const s = seats.find((x) => x.id === id);
        const price = (s?.price ?? basePrice ?? 0) * hours;
        return sum + price;
      }, 0);
    } else {
      const qty = details.quantity || 0;
      const unit = details.unitPrice || 0;
      return qty * unit;
    }
  }, [type, details]);

  const platformFee = useMemo(() => subtotal * 0.05, [subtotal]);
  const total = useMemo(() => subtotal + platformFee, [subtotal, platformFee]);

  const loadRazorpay = () => new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!billingName || !billingEmail) {
      setError("Please enter billing name and email");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setSubmitting(true);

    try {
      // 1) Load Razorpay checkout
      const ok = await loadRazorpay();
      if (!ok) throw new Error('Failed to load Razorpay');

      // 2) Create order on backend (amount in paise)
      const { data: orderData } = await api.post('/payments/order', {
        amount: Math.round(total * 100),
        currency: 'INR'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        }
      });
      const { order, keyId } = orderData;

      // 3) Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: type === 'venue' ? (details.venueName || 'Venue Booking') : (details.title || 'Event Booking'),
        description: 'Payment',
        order_id: order.id,
        prefill: {
          name: billingName,
          email: billingEmail,
          contact: billingPhone,
        },
        notes: {
          type,
        },
        handler: async (resp: any) => {
          try {
            // 4) Verify payment signature
            const { data: verData } = await api.post('/payments/verify', {
              orderId: resp.razorpay_order_id,
              paymentId: resp.razorpay_payment_id,
              signature: resp.razorpay_signature,
            }, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
              }
            });
            if (!verData?.verified) throw new Error(verData?.error || 'Payment verification failed');

            // 5) Proceed with booking on success
            if (type === 'venue') {
              const payload = {
                date: details.date,
                startTime: details.startTime,
                hours: details.hours,
                seatIds: details.seatIds,
              };
              await api.post(`/api/venues/${details.venueId}/book-seats`, payload, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                }
              });
              setSuccess('✓ Payment successful & seats booked');
            } else {
              const payload = { quantity: details.quantity };
              await api.post(`/api/events/${details.eventId}/book-tickets`, payload, {
                headers: {
                  Authorization: `${localStorage.getItem('token') || ''}` ? `Bearer ${localStorage.getItem('token')}` : '',
                }
              });
              setSuccess('✓ Payment successful & tickets booked');
            }

            setTimeout(() => {
              setSuccess('');
              navigate(-1);
            }, 2500);
          } catch (err: any) {
            setError(err?.message || 'Payment succeeded but booking failed');
            setTimeout(() => setError(''), 4000);
          }
        },
        theme: { color: '#7c3aed' },
      });
      rzp.open();
    } catch (e: any) {
      setError(e?.message || 'Failed to complete booking');
      setTimeout(() => setError(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Billing</h1>

          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Billing Person Details</h2>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={billingName} onChange={(e) => setBillingName(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input value={billingPhone} onChange={(e) => setBillingPhone(e.target.value)} placeholder="+1 555-123-4567" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              {type === 'venue' ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Venue</span><span className="font-medium">{details.venueName}</span></div>
                  <div className="flex justify-between"><span>Date</span><span className="font-medium">{details.date}</span></div>
                  <div className="flex justify-between"><span>Time</span><span className="font-medium">{details.startTime} ({details.hours}h)</span></div>
                  <div className="flex justify-between"><span>Seats</span><span className="font-medium">{(details.seatIds || []).join(', ')}</span></div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Event</span><span className="font-medium">{details.title}</span></div>
                  <div className="flex justify-between"><span>Tickets</span><span className="font-medium">{details.quantity}</span></div>
                  <div className="flex justify-between"><span>Unit Price</span><span className="font-medium">₹{(details.unitPrice || 0).toFixed(2)}</span></div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee & Convenience Fee (5%)</span>
                  <span className="font-medium">₹{platformFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-md flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Total Amount</span>
                <span className="text-2xl font-bold text-white">₹{total.toFixed(2)}</span>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleSubmit} disabled={submitting} className="bg-gradient-to-r from-primary to-secondary">
                  {submitting ? 'Processing…' : 'Pay & Confirm'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
