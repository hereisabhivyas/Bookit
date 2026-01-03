import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Globe, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Package className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Shipping & Delivery Policy</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Information about how we ship and deliver your orders
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last Updated: January 2026
            </p>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* International Shipping */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-primary" />
                  <CardTitle>International Shipping</CardTitle>
                </div>
                <CardDescription>For buyers outside of India</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <p>
                    For <strong className="text-foreground">International buyers</strong>, orders are shipped and delivered through <strong className="text-foreground">registered international courier companies</strong> and/or <strong className="text-foreground">International speed post only</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Domestic Shipping */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <CardTitle>Domestic Shipping (India)</CardTitle>
                </div>
                <CardDescription>For buyers within India</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <Truck className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <p>
                    For <strong className="text-foreground">domestic buyers</strong>, orders are shipped through <strong className="text-foreground">registered domestic courier companies</strong> and/or <strong className="text-foreground">speed post only</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Timeline */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <CardTitle>Shipping Timeline</CardTitle>
                </div>
                <CardDescription>When your order will be shipped</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Orders are shipped within <strong className="text-foreground">the timeframe agreed at the time of order confirmation</strong>, and delivery of the shipment is subject to courier company/post office norms.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-2">📦 Order Processing</p>
                  <p>
                    <strong className="text-foreground">ABHISHEK NIKHILESH VYAS</strong> guarantees to hand over the consignment to the courier company or postal authorities as per the delivery date agreed at the time of order confirmation.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Responsibility */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Delivery Responsibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                  <Package className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground mb-2">Important Notice</p>
                    <p>
                      <strong className="text-foreground">ABHISHEK NIKHILESH VYAS</strong> is <strong className="text-foreground">not liable for any delay in delivery</strong> by the courier company or postal authorities. We only guarantee to hand over the consignment to the courier company or postal authorities within the agreed timeframe.
                    </p>
                  </div>
                </div>
                <p>
                  Once the shipment is handed over to the courier service, the delivery timeline is subject to the courier company's operational schedule and service standards.
                </p>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <p>
                    Delivery of all orders will be to the <strong className="text-foreground">address provided by the buyer</strong>. Please ensure that you provide a complete and accurate shipping address at the time of placing your order.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Service Confirmation */}
            <Card>
              <CardHeader>
                <CardTitle>Service Delivery Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                  <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                  <p>
                    Delivery of our services will be confirmed on your <strong className="text-foreground">mail ID as specified during registration</strong>. Please check your email regularly for updates about your order.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Customer Support */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle>Need Help with Shipping?</CardTitle>
                <CardDescription>Contact our helpdesk for any shipping-related issues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  For any issues in utilizing our services, you may contact our helpdesk:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-primary/20">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a href="tel:+919601327978" className="text-foreground font-semibold hover:text-primary transition-colors">
                        +91 9601327978
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-primary/20">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a href="mailto:abhivyas571@gmail.com" className="text-foreground font-semibold hover:text-primary transition-colors break-all">
                        abhivyas571@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex gap-3 flex-wrap">
                  <Link to="/contact">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm">
                      Contact Support
                    </button>
                  </Link>
                  <Link to="/cancellation-refund">
                    <button className="px-4 py-2 border border-primary/20 text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold text-sm">
                      View Cancellation Policy
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>

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
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShippingPolicy;
