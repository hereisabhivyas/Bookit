import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Users as UsersIcon, Mail, Calendar, Activity, X } from "lucide-react";
import Sidebar from "../components/Sidebar";

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  settings: Record<string, any>;
  lastActivity?: string;
  bookingsCount?: number;
  eventsAttended?: number;
  status?: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");

  const adminToken = localStorage.getItem("adminToken") || "";

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelectedUser(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await axios.get<User[]>("https://bookit-dijk.onrender.com/admin/users", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const sortedUsers = (resp.data || []).sort((a, b) => {
        if (sortBy === "recent") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          return a.name.localeCompare(b.name);
        }
      });
      setUsers(sortedUsers);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await axios.delete(`https://bookit-dijk.onrender.com/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSelectedUser(null);
    } catch (e: any) {
      alert(e?.response?.data?.error || "Failed to delete user");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600">Manage all registered users and their activities</p>
            </div>
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "recent" | "name")}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <option value="recent">Sort by Recent</option>
                <option value="name">Sort by Name</option>
              </select>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-500">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No users found</p>
              <p className="text-gray-400 text-sm mt-1">
                Users will appear here once they register.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="p-6">
                    {/* User Avatar and Basic Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user._id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Activity Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>

                      {user.bookingsCount !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <span>{user.bookingsCount} bookings made</span>
                        </div>
                      )}

                      {user.eventsAttended !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <UsersIcon className="w-4 h-4 text-orange-600" />
                          <span>{user.eventsAttended} events attended</span>
                        </div>
                      )}

                      {user.status && (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {user.status}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* USER DETAIL MODAL */}
      {selectedUser && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedUser(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedUser.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedUser.name}</h2>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Name</p>
                      <p className="font-medium text-gray-900">{selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Joined</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Member Since</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity & Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity & Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedUser.bookingsCount || 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Events Attended</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedUser.eventsAttended || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                {selectedUser.settings && Object.keys(selectedUser.settings).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-words">
                        {JSON.stringify(selectedUser.settings, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                {selectedUser.status && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                    <span className={`px-4 py-2 rounded-full font-medium ${
                      selectedUser.status === "active"
                        ? "bg-green-100 text-green-700"
                        : selectedUser.status === "inactive"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                    </span>
                  </div>
                )}

                {/* Last Activity */}
                {selectedUser.lastActivity && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Last Activity</h3>
                    <p className="text-gray-700">{selectedUser.lastActivity}</p>
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => {
                    handleDeleteUser(selectedUser._id);
                  }}
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Users;
