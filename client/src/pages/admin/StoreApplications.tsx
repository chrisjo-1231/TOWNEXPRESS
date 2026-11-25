
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Store,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  MapPin,
  Mail,
  Phone,
  User,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../../services/auth";

// ============================================
// TYPES
// ============================================

interface StoreOwner {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt?: string;
}

interface StoreApplication {
  id: string;
  name: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
  owner: StoreOwner;
  _count?: {
    products: number;
    orders: number;
    members: number;
  };
}

// ============================================
// COMPONENT
// ============================================

export default function StoreApplications() {
  const [stores, setStores] = useState<StoreApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedStore, setSelectedStore] =
    useState<StoreApplication | null>(null);

  const [rejectingStore, setRejectingStore] =
    useState<StoreApplication | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ============================================
  // FETCH PENDING APPLICATIONS
  // ============================================

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);

      const response = await authAPI.get("/admin/stores/pending");

      setStores(response.data.stores ?? []);
    } catch (error: any) {
      console.error("FETCH STORE APPLICATIONS ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load store applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ============================================
  // APPROVE STORE
  // ============================================

  const handleApprove = async (store: StoreApplication) => {
    const confirmed = window.confirm(
      `Are you sure you want to approve "${store.name}"?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(store.id);

      const response = await authAPI.patch(
        `/admin/stores/${store.id}/approve`
      );

      toast.success(
        response.data.message || "Store approved successfully."
      );

      setSelectedStore(null);

      await fetchApplications();
    }  catch (error: any) {
  console.error("APPROVE STORE ERROR:", error);
  console.error("BACKEND RESPONSE:", error.response?.data);
  console.error("HTTP STATUS:", error.response?.status);

  toast.error(
    error.response?.data?.message ||
      "Failed to approve store."
  );
} finally {
  setProcessingId(null);
}
  };

  // ============================================
  // REJECT STORE
  // ============================================

  const handleReject = async () => {
    if (!rejectingStore) return;

    const reason = rejectionReason.trim();

    if (reason.length < 5) {
      toast.error(
        "Rejection reason must be at least 5 characters."
      );
      return;
    }

    if (reason.length > 500) {
      toast.error(
        "Rejection reason must not exceed 500 characters."
      );
      return;
    }

    try {
      setProcessingId(rejectingStore.id);

      const response = await authAPI.patch(
        `/admin/stores/${rejectingStore.id}/reject`,
        { reason }
      );

      toast.success(
        response.data.message ||
          "Store application rejected."
      );

      setRejectingStore(null);
      setSelectedStore(null);
      setRejectionReason("");

      await fetchApplications();
    } catch (error: any) {
      console.error("REJECT STORE ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to reject application."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================
  // SEARCH
  // ============================================

  const filteredStores = stores.filter((store) => {
    const keyword = search.toLowerCase();

    return (
      store.name?.toLowerCase().includes(keyword) ||
      store.owner?.name?.toLowerCase().includes(keyword) ||
      store.owner?.email?.toLowerCase().includes(keyword) ||
      store.address?.toLowerCase().includes(keyword)
    );
  });

  // ============================================
  // FORMAT DATE
  // ============================================

  const formatDate = (date: string) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ============================================
  // PAGE UI
  // ============================================

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-blue-600" />

            <h1 className="text-2xl font-bold text-slate-900">
              Store Applications
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Review and manage store registration requests.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending Applications
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "..." : stores.length}
              </h2>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Search Results
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "..." : filteredStores.length}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Search size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Awaiting Review
              </p>

              <h2 className="mt-2 text-3xl font-bold text-amber-600">
                {loading ? "..." : stores.length}
              </h2>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>

      </div>

      {/* APPLICATIONS TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Pending Store Requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review each application before approval.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores or owners..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
            <Loader2 className="animate-spin" size={22} />
            Loading applications...
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
            <div className="rounded-full bg-slate-100 p-5">
              <Store size={32} className="text-slate-400" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              {search
                ? "No matching applications"
                : "No pending applications"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search
                ? "Try searching with a different store or owner name."
                : "New store registration requests will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Store</th>
                  <th className="px-6 py-4 font-semibold">Store Owner</th>
                  <th className="px-6 py-4 font-semibold">Date Applied</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStores.map((store) => (
                  <tr
                    key={store.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Store size={21} />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {store.name}
                          </p>

                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {store.address || "No address provided"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        {store.owner?.name || "Unknown"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {store.owner?.email || "No email"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(store.createdAt)}
                    </td>

                    <td className="px-6 py-4">
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
      store.status === "APPROVED"
        ? "bg-emerald-50 text-emerald-700"
        : store.status === "REJECTED"
        ? "bg-red-50 text-red-700"
        : store.status === "SUSPENDED"
        ? "bg-slate-100 text-slate-700"
        : "bg-amber-50 text-amber-700"
    }`}
  >
    {store.status === "APPROVED" ? (
      <CheckCircle size={13} />
    ) : (
      <Clock size={13} />
    )}

    {store.status || "PENDING"}
  </span>
</td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">

                        <button
                          onClick={() => setSelectedStore(store)}
                          title="View details"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => handleApprove(store)}
                          disabled={processingId === store.id}
                          title="Approve"
                          className="rounded-lg bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <CheckCircle size={17} />
                        </button>

                        <button
                          onClick={() => {
                            setRejectingStore(store);
                            setRejectionReason("");
                          }}
                          disabled={processingId === store.id}
                          title="Reject"
                          className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <XCircle size={17} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* STORE DETAILS MODAL */}

      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Store Application Details
                </h2>

                <p className="text-sm text-slate-500">
                  Review the submitted information.
                </p>
              </div>

              <button
                onClick={() => setSelectedStore(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">

              {/* STORE INFORMATION */}

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Store size={19} className="text-blue-600" />

                  <h3 className="font-semibold text-slate-900">
                    Store Information
                  </h3>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <h4 className="text-lg font-bold text-slate-900">
                    {selectedStore.name}
                  </h4>

                  <p className="mt-2 text-sm text-slate-600">
                    {selectedStore.description ||
                      "No store description provided."}
                  </p>

                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p className="flex items-start gap-2">
                      <MapPin size={17} className="mt-0.5 shrink-0" />
                      {selectedStore.address || "No address provided"}
                    </p>

                    <p className="flex items-center gap-2">
                      <Phone size={17} />
                      {selectedStore.phone || "No store phone provided"}
                    </p>

                    <p className="flex items-center gap-2">
                      <Mail size={17} />
                      {selectedStore.email || "No store email provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* OWNER INFORMATION */}

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <User size={19} className="text-blue-600" />

                  <h3 className="font-semibold text-slate-900">
                    Owner Information
                  </h3>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">
                    {selectedStore.owner?.name || "Unknown"}
                  </p>

                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <Mail size={16} />
                      {selectedStore.owner?.email || "No email"}
                    </p>

                    <p className="flex items-center gap-2">
                      <Phone size={16} />
                      {selectedStore.owner?.phone || "No phone provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* STORE COUNTS */}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Products</p>
                  <p className="mt-1 text-xl font-bold">
                    {selectedStore._count?.products ?? 0}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Orders</p>
                  <p className="mt-1 text-xl font-bold">
                    {selectedStore._count?.orders ?? 0}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Members</p>
                  <p className="mt-1 text-xl font-bold">
                    {selectedStore._count?.members ?? 0}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Date Applied</p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatDate(selectedStore.createdAt)}
                  </p>
                </div>
              </div>

              {/* APPROVE / REJECT */}

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
                <button
                  onClick={() => handleApprove(selectedStore)}
                  disabled={processingId === selectedStore.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle size={17} />
                  Approve Application
                </button>

                <button
                  onClick={() => {
                    setRejectingStore(selectedStore);
                    setRejectionReason("");
                  }}
                  disabled={processingId === selectedStore.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle size={17} />
                  Reject Application
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}

      {rejectingStore && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Reject Application
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Store: {rejectingStore.name}
                </p>
              </div>

              <button
                onClick={() => setRejectingStore(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <label
                htmlFor="rejectionReason"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Reason for rejection
              </label>

              <textarea
                id="rejectionReason"
                rows={4}
                maxLength={500}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this application is being rejected..."
                className="w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {rejectionReason.length}/500 characters
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setRejectingStore(null);
                  setRejectionReason("");
                }}
                disabled={processingId === rejectingStore.id}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={processingId === rejectingStore.id}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {processingId === rejectingStore.id ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <XCircle size={17} />
                )}
                Confirm Reject
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
