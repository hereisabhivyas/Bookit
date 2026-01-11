import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { API_URL } from "@/lib/api";
import { Users as UsersIcon, Trash2, X } from "lucide-react";

interface Community {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  members: number;
  isPrivate: boolean;
  requireApproval: boolean;
  createdBy?: string;
  createdAt?: string;
}

interface Member {
  _id: string;
  communityId: string;
  userEmail: string;
  userName: string;
  role: "admin" | "member";
  status: "active" | "pending" | "banned";
  joinedAt: string;
}

const Communities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const adminToken = localStorage.getItem("adminToken") || "";
  const apiBase = API_URL;

  const fetchCommunities = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await axios.get<Community[]>(`${apiBase}/admin/communities`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setCommunities(resp.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to fetch communities");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (communityId: string) => {
    setMembersLoading(true);
    try {
      const resp = await axios.get<Member[]>(`${apiBase}/admin/communities/${communityId}/members`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setMembers(resp.data || []);
    } catch (e: any) {
      alert(e?.response?.data?.error || "Failed to fetch members");
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleDeleteCommunity = async (id: string) => {
    if (!window.confirm("Delete this community? This cannot be undone.")) return;
    try {
      await axios.delete(`${apiBase}/admin/communities/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setCommunities((prev) => prev.filter((c) => c._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (e: any) {
      alert(e?.response?.data?.error || "Failed to delete community");
    }
  };

  const handleRemoveMember = async (communityId: string, email: string) => {
    if (!window.confirm(`Remove ${email} from this community?`)) return;
    try {
      await axios.delete(`${apiBase}/admin/communities/${communityId}/members/${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setMembers((prev) => prev.filter((m) => m.userEmail !== email));
      setCommunities((prev) => prev.map((c) =>
        c._id === communityId
          ? { ...c, members: Math.max(0, (c.members || 0) - 1) }
          : c
      ));
    } catch (e: any) {
      alert(e?.response?.data?.error || "Failed to remove member");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Management</h1>
              <p className="text-gray-600">Manage user-created communities and members</p>
            </div>
            <button
              onClick={fetchCommunities}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Refresh
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-500">Loading communities...</p>
            </div>
          ) : communities.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No communities found</p>
              <p className="text-gray-400 text-sm mt-1">Communities created by users will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
                  onClick={() => {
                    setSelected(c);
                    fetchMembers(c._id);
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <img src={c.image} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{c.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{c.category} · {c.members} members</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCommunity(c._id); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">{c.description}</p>
                    <button
                      onClick={() => { setSelected(c); fetchMembers(c._id); }}
                      className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                    >
                      View Members
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSelected(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={selected.image} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                    <p className="text-sm text-gray-600">{selected.category} · {selected.members} members</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                  <button
                    onClick={() => handleDeleteCommunity(selected._id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                  >
                    Delete Community
                  </button>
                </div>

                {membersLoading ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">Loading members...</div>
                ) : members.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">No members</div>
                ) : (
                  <div className="space-y-3">
                    {members.map((m) => (
                      <div key={m._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                        <div>
                          <p className="font-medium text-gray-900">{m.userName} <span className="text-gray-500">({m.userEmail})</span></p>
                          <p className="text-sm text-gray-600">{m.role} · {m.status}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(selected._id, m.userEmail)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Communities;
