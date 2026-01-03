import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, AlertTriangle, Clock, Shield, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const CancellationRefund = () => {
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
                <RefreshCw className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Cancellation & Refund Policy</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              We believe in helping our customers and have a liberal cancellation policy
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
            
            {/* Introduction */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle>Our Commitment</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  <strong className="text-foreground">ABHISHEK NIKHILESH VYAS</strong> believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. We understand that sometimes plans change, and we're here to make the process as smooth as possible.
                </p>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-primary" />
                  <CardTitle>Cancellation Policy</CardTitle>
                </div>
                <CardDescription>When and how you can cancel your order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground mb-2">Cancellation Window</p>
                    <p className="text-muted-foreground">
                      Cancellations will be considered only if the request is made <strong className="text-foreground">within 3-5 days of placing the order</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground mb-2">Important Notice</p>
                    <p className="text-muted-foreground">
                      The cancellation request may <strong className="text-foreground">not be entertained if the orders have been communicated to the vendors/merchants</strong> and they have initiated the process of shipping them.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground mb-2">Perishable Items</p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">ABHISHEK NIKHILESH VYAS</strong> does not accept cancellation requests for <strong className="text-foreground">perishable items</strong> like flowers, eatables, etc.
                    </p>
                    <p className="text-muted-foreground mt-2">
                      However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Damaged or Defective Items */}
            <Card>
              <CardHeader>
                <CardTitle>1. Damaged or Defective Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  In case of receipt of damaged or defective items, please report the same to our Customer Service team.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-2">⏰ Reporting Timeline</p>
                  <p>
                    This should be reported <strong className="text-foreground">within 3-5 days of receipt of the products</strong>.
                  </p>
                </div>
                <p>
                  The request will, however, be entertained once the merchant has checked and determined the same at his own end.
                </p>
              </CardContent>
            </Card>

            {/* Product Not as Expected */}
            <Card>
              <CardHeader>
                <CardTitle>2. Product Not as Expected</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-2">📅 Complaint Window</p>
                  <p>
                    Complaints must be submitted <strong className="text-foreground">within 3-5 days of receiving the product</strong>.
                  </p>
                </div>
                <p>
                  The Customer Service Team after looking into your complaint will take an appropriate decision.
                </p>
              </CardContent>
            </Card>

            {/* Manufacturer Warranty */}
            <Card>
              <CardHeader>
                <CardTitle>3. Products with Manufacturer Warranty</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  In case of complaints regarding products that come with a <strong className="text-foreground">warranty from manufacturers</strong>, please refer the issue to them directly.
                </p>
              </CardContent>
            </Card>

            {/* Refund Processing */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <CardTitle>Refund Processing</CardTitle>
                </div>
                <CardDescription>How long will it take to receive your refund?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-5 border border-primary/20">
                  <p className="text-muted-foreground mb-4">
                    In case of any refunds approved by <strong className="text-foreground">ABHISHEK NIKHILESH VYAS</strong>:
                  </p>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <Clock className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-bold text-lg text-foreground">3-5 Days</p>
                      <p className="text-sm text-muted-foreground">for the refund to be processed to the end customer</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Summary */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
              <CardHeader>
                <CardTitle>Quick Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Key Timelines
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>✓ Cancellation request: 3-5 days from order</li>
                      <li>✓ Report damaged items: 3-5 days from receipt</li>
                      <li>✓ Complaint about quality: 3-5 days from receipt</li>
                      <li>✓ Refund processing: 3-5 days</li>
                    </ul>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      Important Notes
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>✗ No cancellation after shipping starts</li>
                      <li>✗ Perishable items not eligible for cancellation</li>
                      <li>✓ Refund possible for quality issues</li>
                      <li>✓ Warranty items: contact manufacturer</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Need Help with Cancellation or Refund?</CardTitle>
                <CardDescription>Our customer service team is here to assist you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-semibold text-foreground">ABHISHEK NIKHILESH VYAS</p>
                  <p className="text-muted-foreground">Changa, Vadgam, Banaskantha</p>
                  <p className="text-muted-foreground">GUJARAT 385520, India</p>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Phone:</strong>{" "}
                    <a href="tel:+919601327978" className="text-primary hover:underline">
                      +91 9601327978
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Email:</strong>{" "}
                    <a href="mailto:abhivyas571@gmail.com" className="text-primary hover:underline">
                      abhivyas571@gmail.com
                    </a>
                  </p>
                </div>
                <div className="pt-4 flex gap-3">
                  <Link to="/contact">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm">
                      Contact Support
                    </button>
                  </Link>
                  <Link to="/terms">
                    <button className="px-4 py-2 border border-primary/20 text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold text-sm">
                      View Terms & Conditions
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
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CancellationRefund;
