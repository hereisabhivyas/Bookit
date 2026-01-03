import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, Shield, FileText, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
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
                <ScrollText className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Terms and Conditions</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Please read these terms carefully before using our services
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last Updated: January 2026
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Definitions */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Definitions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  For the purpose of these Terms and Conditions:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>
                    The term <strong className="text-foreground">"we"</strong>, <strong className="text-foreground">"us"</strong>, <strong className="text-foreground">"our"</strong> used anywhere on this page shall mean <strong className="text-foreground">ABHISHEK NIKHILESH VYAS</strong>, whose registered/operational office is <strong className="text-foreground">Changa, Vadgam, Banaskantha, GUJARAT 385520</strong>.
                  </li>
                  <li>
                    <strong className="text-foreground">"You"</strong>, <strong className="text-foreground">"your"</strong>, <strong className="text-foreground">"user"</strong>, <strong className="text-foreground">"visitor"</strong> shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Agreement */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle>Agreement to Terms</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Your use of the website and/or purchase from us are governed by the following Terms and Conditions. By accessing and using our services, you acknowledge that you have read, understood, and agree to be bound by these terms.
                </p>
              </CardContent>
            </Card>

            {/* Website Content */}
            <Card>
              <CardHeader>
                <CardTitle>1. Website Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  The content of the pages of this website is subject to change without notice.
                </p>
                <p>
                  Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose.
                </p>
                <p>
                  You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
                </p>
              </CardContent>
            </Card>

            {/* Use at Your Own Risk */}
            <Card>
              <CardHeader>
                <CardTitle>2. Use at Your Own Risk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable.
                </p>
                <p>
                  It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.
                </p>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle>3. Intellectual Property Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Our website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics.
                </p>
                <p className="font-semibold text-foreground">
                  Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
                </p>
                <p>
                  All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.
                </p>
              </CardContent>
            </Card>

            {/* Unauthorized Use */}
            <Card>
              <CardHeader>
                <CardTitle>4. Unauthorized Use</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p>
                    Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* External Links */}
            <Card>
              <CardHeader>
                <CardTitle>5. Links to Other Websites</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information.
                </p>
                <p>
                  You may not create a link to our website from another website or document without <strong className="text-foreground">ABHISHEK NIKHILESH VYAS</strong>'s prior written consent.
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardHeader>
                <CardTitle>6. Governing Law and Jurisdiction</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the <strong className="text-foreground">laws of India</strong>.
                </p>
              </CardContent>
            </Card>

            {/* Payment Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>7. Payment Transactions</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  We shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any transaction, on account of the cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle>Questions About These Terms?</CardTitle>
                <CardDescription>If you have any questions about these Terms and Conditions, please contact us:</CardDescription>
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
                <div className="pt-4">
                  <Link to="/contact">
                    <button className="text-sm text-primary hover:underline font-semibold">
                      → Visit our Contact Page
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
              <Link to="/cancellation-refund" className="hover:text-primary transition-colors">Refunds</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
