import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileCheck,
  Receipt,
  CreditCard,
  LogOut 
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/users", label: "Users", icon: Users },
    { path: "/venues", label: "Venues", icon: Building2 },
    { path: "/host-requests", label: "Host Requests", icon: FileCheck },
    { path: "/bookings", label: "Booking History", icon: Receipt },
    { path: "/payments", label: "Payment History", icon: CreditCard },
    { path: "/communities", label: "Communities", icon: Users },
  ];

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          BookIt Admin
        </h2>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
