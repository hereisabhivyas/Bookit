import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Home, User, Menu, X, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useCityLocation } from "@/hooks/use-city-location";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { cityInfo, loading, error, refresh } = useCityLocation();

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
      try {
        const decoded = (jwtDecode as any)(token);
        // Optionally check for exp, email, etc.
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/events", label: "Events", icon: Calendar },
    { path: "/communities", label: "Communities", icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">BookIt</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <div className="flex items-center mr-2 px-2 py-1 rounded-md border border-border/50 text-sm text-muted-foreground gap-1">
              <MapPin className="w-4 h-4" />
              {cityInfo.city || cityInfo.locality ? (
                <span>{cityInfo.city || cityInfo.locality}</span>
              ) : loading ? (
                <span>Detecting…</span>
              ) : (
                <button className="underline" onClick={refresh} aria-label="Detect location">Detect location</button>
              )}
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  My Profile
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="gradient" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in-up">
            <div className="flex flex-col gap-2">
              <div className="flex items-center px-3 py-2 rounded-md border border-border/50 text-sm text-muted-foreground gap-2">
                <MapPin className="w-4 h-4" />
                {cityInfo.city || cityInfo.locality ? (
                  <span>{cityInfo.city || cityInfo.locality}</span>
                ) : loading ? (
                  <span>Detecting…</span>
                ) : (
                  <button className="underline" onClick={refresh} aria-label="Detect location">Detect location</button>
                )}
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <div className="border-t border-border/50 pt-3 mt-2 flex flex-col gap-2">
                {isLoggedIn ? (
                  <Link to="/profile" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <User className="w-4 h-4" />
                      My Profile
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="gradient" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
