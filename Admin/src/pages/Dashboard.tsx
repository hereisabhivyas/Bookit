import { 
  Users, 
  Building2, 
  FileCheck, 
  TrendingUp,
  UserCheck,
  Calendar,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  ArrowUpRight,
  AlertCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

interface Stats {
  totalUsers: number;
  activeVenues: number;
  pendingRequests: number;
  totalEvents: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface HostRequest {
  _id: string;
  venueName: string;
  status: string;
  createdAt: string;
  businessType?: string;
  city?: string;
}

interface DashboardData {
  stats: Stats;
  recentUsers: User[];
  pendingHostRequests: HostRequest[];
}

const API_URL = 'https://bookit-dijk.onrender.com';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allRequests, setAllRequests] = useState<HostRequest[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchAdditionalData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      console.log('Fetching dashboard stats from:', `${API_URL}/admin/dashboard/stats`);
      console.log('Using token:', token.substring(0, 20) + '...');

      const response = await axios.get(`${API_URL}/admin/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Dashboard data received:', response.data);
      setDashboardData(response.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      console.error('Error response:', err.response);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please make sure the API is running on port 3000.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Redirecting to login...');
        localStorage.removeItem('adminToken');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAdditionalData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      console.log('Fetching additional data...');

      const [usersRes, requestsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/host/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('Users received:', usersRes.data.length);
      console.log('Requests received:', requestsRes.data.length);

      setAllUsers(usersRes.data);
      setAllRequests(requestsRes.data);
    } catch (err: any) {
      console.error('Error fetching additional data:', err);
    }
  };

  const getGrowthPercentage = (current: number, total: number) => {
    if (total === 0) return 0;
    return ((current / total) * 100).toFixed(1);
  };

  const getRecentGrowth = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUsers = allUsers.filter(u => new Date(u.createdAt) > oneDayAgo);
    return recentUsers.length;
  };

  const stats = dashboardData ? [
    { 
      label: "Total Users", 
      value: dashboardData.stats.totalUsers.toString(), 
      icon: Users, 
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
      change: getRecentGrowth(),
      changeLabel: "new today"
    },
    { 
      label: "Active Venues", 
      value: dashboardData.stats.activeVenues.toString(), 
      icon: Building2, 
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600",
      change: allRequests.filter(r => r.status === 'approved' && 
        new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      changeLabel: "this week"
    },
    { 
      label: "Pending Requests", 
      value: dashboardData.stats.pendingRequests.toString(), 
      icon: FileCheck, 
      color: "bg-yellow-500",
      gradient: "from-yellow-500 to-yellow-600",
      change: dashboardData.stats.pendingRequests,
      changeLabel: "awaiting review"
    },
    { 
      label: "Total Events", 
      value: dashboardData.stats.totalEvents.toString(), 
      icon: Calendar, 
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
      change: 0,
      changeLabel: "this month"
    },
  ] : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
            <p className="text-sm text-gray-500 mt-2">Connecting to {API_URL}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-6">{error}</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-gray-700 mb-2">Troubleshooting:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Check if API server is running on port 3000</li>
                <li>✓ Verify you're logged in as admin</li>
                <li>✓ Check browser console for detailed errors</li>
                <li>✓ Ensure CORS is configured for port 5173</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={fetchDashboardData}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Re-login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const approvedCount = allRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = allRequests.filter(r => r.status === 'rejected').length;
  const approvalRate = allRequests.length > 0 ? ((approvedCount / allRequests.length) * 100).toFixed(1) : '0';

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                <Activity className="w-5 h-5 text-green-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-700">System Online</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-bl-full`}></div>
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  {stat.change > 0 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-semibold">+{stat.change}</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-2">{stat.change} {stat.changeLabel}</p>
              </div>
            ))}
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Approval Rate</h3>
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{approvalRate}%</div>
              <p className="text-purple-100 text-sm">
                {approvedCount} approved, {rejectedCount} rejected
              </p>
              <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${approvalRate}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold">User Growth</h3>
                <Users className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2">+{getRecentGrowth()}</div>
              <p className="text-blue-100 text-sm">New users in last 24 hours</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-full rounded-full"
                    style={{ width: `${getGrowthPercentage(getRecentGrowth(), dashboardData?.stats.totalUsers || 0)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold">{getGrowthPercentage(getRecentGrowth(), dashboardData?.stats.totalUsers || 0)}%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Active Venues</h3>
                <Building2 className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{dashboardData?.stats.activeVenues || 0}</div>
              <p className="text-green-100 text-sm">Venues ready for booking</p>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Capacity</span>
                  <span className="font-semibold">
                    {((dashboardData?.stats.activeVenues || 0) / Math.max(allRequests.length, 1) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-full rounded-full"
                    style={{ width: `${((dashboardData?.stats.activeVenues || 0) / Math.max(allRequests.length, 1) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                  <button 
                    onClick={() => navigate('/users')}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {dashboardData?.recentUsers && dashboardData.recentUsers.length > 0 ? (
                    dashboardData.recentUsers.map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-purple-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <UserCheck className="w-5 h-5 text-green-500 mb-1 ml-auto" />
                          <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No recent users</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Host Requests */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Host Requests</h3>
                  <button 
                    onClick={() => navigate('/host-requests')}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {dashboardData?.pendingHostRequests && dashboardData.pendingHostRequests.length > 0 ? (
                    dashboardData.pendingHostRequests.map((request) => (
                      <div key={request._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-white rounded-lg border border-yellow-100 hover:border-yellow-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{request.venueName}</p>
                            <p className="text-sm text-gray-500">{request.city || 'Location pending'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <button 
                            onClick={() => navigate('/host-requests')}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md mb-1"
                          >
                            Review
                          </button>
                          <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No pending requests</p>
                      <p className="text-xs text-gray-400 mt-1">All caught up! 🎉</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button 
                onClick={() => navigate('/users')}
                className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200 hover:border-purple-300"
              >
                <Users className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-gray-700">Manage Users</span>
              </button>
              <button 
                onClick={() => navigate('/venues')}
                className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200 hover:border-purple-300"
              >
                <Building2 className="w-6 h-6 text-green-600" />
                <span className="font-medium text-gray-700">View Venues</span>
              </button>
              <button 
                onClick={() => navigate('/host-requests')}
                className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200 hover:border-purple-300"
              >
                <FileCheck className="w-6 h-6 text-yellow-600" />
                <span className="font-medium text-gray-700">Review Requests</span>
              </button>
              <button 
                onClick={() => {
                  fetchDashboardData();
                  fetchAdditionalData();
                }}
                className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200 hover:border-purple-300"
              >
                <Activity className="w-6 h-6 text-purple-600" />
                <span className="font-medium text-gray-700">Refresh Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;