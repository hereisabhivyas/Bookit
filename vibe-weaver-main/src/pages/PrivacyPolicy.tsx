import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Cookie, UserCheck, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
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
                <Shield className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Privacy Policy</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              How we collect, use, and protect your personal information
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
                  <CardTitle>Our Commitment to Your Privacy</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  This privacy policy sets out how <strong className="text-foreground">ABHISHEK NIKHILESH VYAS</strong> uses and protects any information that you give when you visit our website and/or agree to purchase from us.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-2">🔒 Privacy Protection</p>
                  <p>
                    <strong className="text-foreground">ABHISHEK NIKHILESH VYAS</strong> is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, you can be assured that it will only be used in accordance with this privacy statement.
                  </p>
                </div>
                <p className="text-sm">
                  <strong className="text-foreground">ABHISHEK NIKHILESH VYAS</strong> may change this policy from time to time by updating this page. You should check this page periodically to ensure that you adhere to these changes.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-primary" />
                  <CardTitle>Information We Collect</CardTitle>
                </div>
                <CardDescription>What information we may gather from you</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">We may collect the following information:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <UserCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Name</p>
                      <p className="text-sm text-muted-foreground">Your full name for identification purposes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <Mail className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Contact Information</p>
                      <p className="text-sm text-muted-foreground">Including email address</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Demographic Information</p>
                      <p className="text-sm text-muted-foreground">Such as postcode, preferences and interests, if required</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                    <Eye className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Other Information</p>
                      <p className="text-sm text-muted-foreground">Relevant to customer surveys and/or offers</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card>
              <CardHeader>
                <CardTitle>What We Do With the Information We Gather</CardTitle>
                <CardDescription>How your information helps us serve you better</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span><strong className="text-foreground">Internal record keeping</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span>We may use the information to <strong className="text-foreground">improve our products and services</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span>We may periodically send <strong className="text-foreground">promotional emails</strong> about new products, special offers or other information which we think you may find interesting using the email address which you have provided</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span>From time to time, we may also use your information to contact you for <strong className="text-foreground">market research purposes</strong>. We may contact you by email, phone, fax or mail</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span>We may use the information to <strong className="text-foreground">customise the website</strong> according to your interests</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-primary" />
                  <CardTitle>Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <Lock className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground mb-2">Your Information is Secure</p>
                    <p>
                      We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure, we have put in place suitable measures to safeguard and secure the information we collect online.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Cookie className="w-5 h-5 text-primary" />
                  <CardTitle>How We Use Cookies</CardTitle>
                </div>
                <CardDescription>Understanding cookies and their purpose</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-2">🍪 What is a Cookie?</p>
                  <p>
                    A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site.
                  </p>
                </div>
                <p>
                  Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.
                </p>
                <p>
                  We use <strong className="text-foreground">traffic log cookies</strong> to identify which pages are being used. This helps us analyze data about webpage traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-2">ℹ️ Important Note</p>
                  <p>
                    Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us.
                  </p>
                </div>
                <p>
                  You can choose to <strong className="text-foreground">accept or decline cookies</strong>. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website.
                </p>
              </CardContent>
            </Card>

            {/* Controlling Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Controlling Your Personal Information</CardTitle>
                <CardDescription>You have choices about how your data is used</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>You may choose to restrict the collection or use of your personal information in the following ways:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span>Whenever you are asked to fill in a form on the website, look for the box that you can click to indicate that you do not want the information to be used by anybody for <strong className="text-foreground">direct marketing purposes</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span>If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at <a href="mailto:abhivyas571@gmail.com" className="text-primary hover:underline font-semibold">abhivyas571@gmail.com</a></span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card>
              <CardHeader>
                <CardTitle>Data Protection Commitment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-2">🛡️ We Will Not Sell Your Information</p>
                  <p>
                    We will <strong className="text-foreground">not sell, distribute or lease</strong> your personal information to third parties unless we have your permission or are required by law to do so.
                  </p>
                </div>
                <p>
                  We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen.
                </p>
              </CardContent>
            </Card>

            {/* Correction of Information */}
            <Card>
              <CardHeader>
                <CardTitle>Correcting Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  If you believe that any information we are holding on you is <strong className="text-foreground">incorrect or incomplete</strong>, please contact us as soon as possible:
                </p>
                <div className="bg-white rounded-lg border border-primary/20 p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">📍 Address</p>
                    <p className="text-sm">Changa, Vadgam, Banaskantha<br/>GUJARAT 385520, India</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">📞 Phone</p>
                    <a href="tel:+919601327978" className="text-sm text-primary hover:underline">+91 9601327978</a>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">📧 Email</p>
                    <a href="mailto:abhivyas571@gmail.com" className="text-sm text-primary hover:underline">abhivyas571@gmail.com</a>
                  </div>
                </div>
                <p className="font-semibold text-foreground">
                  We will promptly correct any information found to be incorrect.
                </p>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle>Questions About Privacy?</CardTitle>
                <CardDescription>We're here to help with any privacy concerns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <div className="pt-4">
                  <Link to="/contact">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm">
                      Contact Us
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
              <Link to="/shipping" className="hover:text-primary transition-colors">Shipping</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
