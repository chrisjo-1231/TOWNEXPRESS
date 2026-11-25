
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Store,
  CheckCircle,
  Clock,
  XCircle,
  Ban,
  Eye,
  MapPin,
  Mail,
  Phone,
  User,
  X,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../../services/auth";

type StoreStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

interface StoreOwner {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

interface StoreRecord {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status: StoreStatus;
  isActive: boolean;
  rejectionReason?: string | null;
  createdAt: string;
  owner: StoreOwner;
  _count?: {
    products?: number;
    orders?: number;
    members?: number;
  };
}

const statusStyles: Record<StoreStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  SUSPENDED: "bg-slate-100 text-slate-600 ring-slate-200",
};

function StatusBadge({ status }: { status: StoreStatus }) {
  const icons = {
    PENDING: Clock,
    APPROVED: CheckCircle,
    REJECTED: XCircle,
    SUSPENDED: Ban,
  };

  const Icon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[status]}`}
    >
      <Icon size={13} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function StoreManagement() {
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedStore, setSelectedStore] = useState<StoreRecord | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchStores = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await authAPI.get("/admin/stores");
      setStores(response.data.stores ?? []);
    } catch (error: any) {
      console.error("FETCH STORES ERROR:", error);
      toast.error(
        error.response?.data?.message || "Failed to load stores."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const counts = useMemo(() => ({
    total: stores.length,
    pending: stores.filter((s) => s.status === "PENDING").length,
    approved: stores.filter((s) => s.status === "APPROVED").length,
    rejected: stores.filter((s) => s.status === "REJECTED").length,
    suspended: stores.filter((s) => s.status === "SUSPENDED").length,
  }), [stores]);

  const filteredStores = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return stores.filter((store) => {
      const matchesStatus =
        statusFilter === "ALL" || store.status === statusFilter;

      const matchesSearch =
        !keyword ||
        store.name.toLowerCase().includes(keyword) ||
        store.owner?.name?.toLowerCase().includes(keyword) ||
        store.owner?.email?.toLowerCase().includes(keyword) ||
        store.address?.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [stores, search, statusFilter]);

  const handleSuspend = async (store: StoreRecord) => {
    const confirmed = window.confirm(
      `Are you sure you want to suspend "${store.name}"?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(store.id);

      const response = await authAPI.patch(
        `/admin/stores/${store.id}/suspend`
      );

      toast.success(
        response.data.message || "Store suspended successfully."
      );

      setSelectedStore(null);
      await fetchStores(true);
    } catch (error: any) {
      console.error("SUSPEND STORE ERROR:", error);
      toast.error(
        error.response?.data?.message || "Failed to suspend store."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const statCards = [
    {
      label: "Total Stores",
      value: counts.total,
      icon: Store,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending",
      value: counts.pending,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Approved",
      value: counts.approved,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Rejected",
      value: counts.rejected,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Suspended",
      value: counts.suspended,
      icon: Ban,
      color: "bg-slate-100 text-slate-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Store Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage all registered TownExpress stores.
          </p>
        </div>

        <button
          onClick={() => fetchStores(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Registered Stores</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredStores.length} store(s) found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search store or owner..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
            <Loader2 className="animate-spin" size={22} />
            Loading stores...
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <Store size={28} className="text-slate-400" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-800">
              No stores found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Store</th>
                  <th className="px-5 py-4 font-semibold">Owner</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Products</th>
                  <th className="px-5 py-4 font-semibold">Orders</th>
                  <th className="px-5 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Store size={19} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {store.name}
                          </p>
                          <p className="mt-1 max-w-52 truncate text-xs text-slate-500">
                            {store.address || "No address provided"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {store.owner?.name || "Unknown"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {store.owner?.email || "No email"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={store.status} />
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {store._count?.products ?? 0}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {store._count?.orders ?? 0}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setSelectedStore(store)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Eye size={15} />
                          View
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

      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Store Details
                </h2>
                <p className="text-sm text-slate-500">
                  Store information and account status
                </p>
              </div>

              <button
                onClick={() => setSelectedStore(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-50 p-4 text-blue-600">
                  <Store size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedStore.name}
                  </h3>
                  <div className="mt-2">
                    <StatusBadge status={selectedStore.status} />
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                <h4 className="text-sm font-bold text-slate-800">
                  Store Information
                </h4>

                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin size={17} className="mt-0.5 shrink-0" />
                  <span>
                    {selectedStore.address || "No address provided"}
                  </span>
                </div>

                {selectedStore.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail size={17} />
                    {selectedStore.email}
                  </div>
                )}

                {selectedStore.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone size={17} />
                    {selectedStore.phone}
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-bold text-slate-800">
                  Store Owner
                </h4>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-slate-100 p-3 text-slate-600">
                    <User size={19} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {selectedStore.owner?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedStore.owner?.email || "No email"}
                    </p>
                    {selectedStore.owner?.phone && (
                      <p className="mt-1 text-xs text-slate-500">
                        {selectedStore.owner.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900">
                    {selectedStore._count?.products ?? 0}
                  </p>
                  <p className="text-xs text-slate-500">Products</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900">
                    {selectedStore._count?.orders ?? 0}
                  </p>
                  <p className="text-xs text-slate-500">Orders</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900">
                    {selectedStore._count?.members ?? 0}
                  </p>
                  <p className="text-xs text-slate-500">Members</p>
                </div>
              </div>

              {selectedStore.rejectionReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2 font-semibold text-red-700">
                    <AlertCircle size={17} />
                    Rejection Reason
                  </div>
                  <p className="mt-2 text-sm text-red-600">
                    {selectedStore.rejectionReason}
                  </p>
                </div>
              )}

              <div className="text-xs text-slate-400">
                Registered:{" "}
                {new Date(selectedStore.createdAt).toLocaleDateString()}
              </div>

              {selectedStore.status === "APPROVED" && (
                <button
                  onClick={() => handleSuspend(selectedStore)}
                  disabled={processingId === selectedStore.id}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {processingId === selectedStore.id ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Ban size={17} />
                  )}
                  Suspend Store
                </button>
              )}

              {selectedStore.status === "SUSPENDED" && (
                <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
                  <ShieldCheck size={17} />
                  This store is currently suspended.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
