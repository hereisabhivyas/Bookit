import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  CreditCard,
  IndianRupee,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Search,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";

const API_URL = "https://bookit-dijk.onrender.com";

type PaymentStatus = "captured" | "paid" | "created" | "failed" | "pending" | "refunded" | string;

type Payment = {
  _id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  email: string;
  method: string;
  contact: string;
  notes?: Record<string, unknown>;
  createdAt: string;
  capturedAt?: string;
};

type Summary = {
  totalPayments: number;
  totalAmount: number;
  captured: number;
  failed: number;
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("No authentication token found");
        return;
      }
      const resp = await axios.get(`${API_URL}/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(resp.data.payments || []);
      setSummary(resp.data.summary || null);
    } catch (err: any) {
      console.error("Error fetching payments", err);
      setError(err?.response?.data?.error || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesStatus =
        statusFilter === "all" || (p.status || "").toLowerCase() === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        p.orderId.toLowerCase().includes(q) ||
        (p.paymentId || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.method || "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [payments, statusFilter, search]);

  const formatAmount = (amt: number, currency: string) => {
    const value = Number.isFinite(amt) ? amt : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
              <p className="text-gray-600">Track all Razorpay payments across the platform.</p>
            </div>
            <button
              onClick={fetchPayments}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary.totalPayments}</p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <div className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {formatAmount(summary.totalAmount, "INR")}
                  </p>
                </div>
                <IndianRupee className="w-8 h-8 text-green-600" />
              </div>
              <div className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Captured / Paid</p>
                  <p className="text-2xl font-semibold text-emerald-600">{summary.captured}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-semibold text-red-600">{summary.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order, payment, email, or method"
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { key: "all", label: "All" },
                  { key: "captured", label: "Captured" },
                  { key: "paid", label: "Paid" },
                  { key: "pending", label: "Pending" },
                  { key: "failed", label: "Failed" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setStatusFilter(item.key)}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                      statusFilter === item.key
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold text-gray-600 px-4 py-3">
                <span className="col-span-2">Payment ID</span>
                <span className="col-span-2">Order ID</span>
                <span className="col-span-2">User</span>
                <span className="col-span-2">Amount</span>
                <span className="col-span-1">Status</span>
                <span className="col-span-1">Method</span>
                <span className="col-span-2">Created</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading payments...
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 px-4 py-6 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="px-4 py-10 text-center text-gray-500">
                  No payments found for this filter.
                </div>
              ) : (
                <div className="divide-y">
                  {filteredPayments.map((p) => (
                    <div key={p._id || p.orderId} className="grid grid-cols-12 px-4 py-3 text-sm">
                      <div className="col-span-2 truncate" title={p.paymentId}>
                        {p.paymentId || "-"}
                      </div>
                      <div className="col-span-2 truncate" title={p.orderId}>
                        {p.orderId}
                      </div>
                      <div className="col-span-2 flex flex-col">
                        <span className="flex items-center gap-1 text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" /> {p.email || ""}
                        </span>
                        {p.contact && (
                          <span className="flex items-center gap-1 text-gray-500 text-xs">
                            <Phone className="w-3 h-3 text-gray-400" /> {p.contact}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 font-semibold text-gray-900">
                        {formatAmount(p.amount || 0, p.currency || "INR")}
                      </div>
                      <div className="col-span-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                            (p.status || "").toLowerCase() === "failed"
                              ? "bg-red-100 text-red-700"
                              : ["captured", "paid"].includes((p.status || "").toLowerCase())
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {(p.status || "").toUpperCase() || "-"}
                        </span>
                      </div>
                      <div className="col-span-1 text-gray-700 uppercase">{p.method || ""}</div>
                      <div className="col-span-2 text-gray-600">
                        {formatDateTime(p.capturedAt || p.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
