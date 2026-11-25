
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Truck,
  Package,
  MapPin,
  User,
  Store,
  Clock,
  CheckCircle,
  Eye,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Phone,
  CreditCard,
  UserPlus,
  Bike,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../../services/auth";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "ASSIGNED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

interface Rider {
  id: string;
  vehicleType: string | null;
  plateNumber: string | null;
  availability: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

interface DeliveryRecord {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number | string;
  deliveryFee: number | string;
  totalAmount: number | string;
  deliveryAddress: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  store: {
    id: string;
    name: string;
    address: string;
    phone?: string | null;
  };
  zone: {
    id: string;
    name: string;
    barangay: string;
    deliveryFee: number | string;
  };
  delivery: {
    id: string;
    pickupTime?: string | null;
    deliveredAt?: string | null;
    notes?: string | null;
    rider?: {
      user: {
        id: string;
        name: string;
        email: string;
        phone?: string | null;
      };
    } | null;
  } | null;
  payment?: {
    method: string;
    status: string;
    amount: number | string;
  } | null;
  _count?: {
    items: number;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "ASSIGNED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-orange-100 text-orange-700",
  READY_FOR_PICKUP: "bg-purple-100 text-purple-700",
  ASSIGNED: "bg-indigo-100 text-indigo-700",
  PICKED_UP: "bg-cyan-100 text-cyan-700",
  OUT_FOR_DELIVERY: "bg-sky-100 text-sky-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function formatCurrency(value: number | string) {
  return Number(value || 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
}

function formatDate(value?: string | null) {
  if (!value) return "Not yet recorded";

  return new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getErrorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || fallback;
}

export default function DeliveryMonitoring() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedDelivery, setSelectedDelivery] =
    useState<DeliveryRecord | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [assigningOrder, setAssigningOrder] =
    useState<DeliveryRecord | null>(null);
  const [availableRiders, setAvailableRiders] = useState<Rider[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [ridersLoading, setRidersLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // ==========================================
  // FETCH DELIVERIES
  // ==========================================

  const fetchDeliveries = useCallback(
    async (page = 1, showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const response = await authAPI.get("/admin/deliveries", {
          params: {
            search: search.trim() || undefined,
            status,
            page,
            limit: 20,
          },
        });

        setDeliveries(response.data.deliveries ?? []);

        setPagination(
          response.data.pagination ?? {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
          }
        );
      } catch (error: any) {
        console.error("Fetch deliveries error:", error);
        toast.error(
          getErrorMessage(error, "Unable to load delivery records.")
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, status]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDeliveries(1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [fetchDeliveries]);

  // ==========================================
  // VIEW DELIVERY DETAILS
  // ==========================================

  const viewDetails = async (id: string) => {
    try {
      setDetailsLoading(true);
      setSelectedDelivery(null);

      const response = await authAPI.get(`/admin/deliveries/${id}`);

      setSelectedDelivery(response.data.delivery);
    } catch (error: any) {
      console.error("Delivery details error:", error);
      toast.error(
        getErrorMessage(error, "Unable to load delivery details.")
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // ==========================================
  // FETCH AVAILABLE RIDERS
  // ==========================================

  const openAssignModal = async (order: DeliveryRecord) => {
    setAssigningOrder(order);
    setSelectedRiderId("");
    setAvailableRiders([]);

    try {
      setRidersLoading(true);

      const response = await authAPI.get(
        "/admin/deliveries/available-riders"
      );

      const riders: Rider[] = response.data.riders ?? [];

      setAvailableRiders(riders);

      if (riders.length === 0) {
        toast.error("No available riders found.");
      }
    } catch (error: any) {
      console.error("Available riders error:", error);
      toast.error(
        getErrorMessage(error, "Unable to load available riders.")
      );
    } finally {
      setRidersLoading(false);
    }
  };

  // ==========================================
  // ASSIGN RIDER
  // ==========================================

  const handleAssignRider = async () => {
    if (!assigningOrder || !selectedRiderId) {
      toast.error("Please select a rider.");
      return;
    }

    try {
      setAssigning(true);

      const response = await authAPI.patch(
        `/admin/deliveries/${assigningOrder.id}/assign-rider`,
        {
          riderId: selectedRiderId,
        }
      );

      toast.success(
        response.data.message || "Rider assigned successfully."
      );

      setAssigningOrder(null);
      setSelectedRiderId("");
      setAvailableRiders([]);

      await fetchDeliveries(pagination.page, false);
    } catch (error: any) {
      console.error("Assign rider error:", error);

      toast.error(
        getErrorMessage(error, "Failed to assign rider.")
      );
    } finally {
      setAssigning(false);
    }
  };

  // ==========================================
  // SUMMARY
  // Counts below are based on the currently
  // loaded page, not all database records.
  // ==========================================

  const summaryCards = [
    {
      label: "Total Records",
      value: pagination.total,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Ready for Pickup",
      value: deliveries.filter(
        (item) => item.status === "READY_FOR_PICKUP"
      ).length,
      icon: Clock,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Out for Delivery",
      value: deliveries.filter(
        (item) => item.status === "OUT_FOR_DELIVERY"
      ).length,
      icon: Truck,
      color: "bg-sky-100 text-sky-600",
    },
    {
      label: "Delivered",
      value: deliveries.filter(
        (item) => item.status === "DELIVERED"
      ).length,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
  ];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Delivery Monitoring
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor orders, delivery progress, and rider assignments.
          </p>
        </div>

        <button
          onClick={() => fetchDeliveries(pagination.page, false)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {card.label}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-800">
                    {card.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${card.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SEARCH AND FILTER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, customer, store, or rider..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-8 text-sm outline-none focus:border-blue-500 md:w-64"
            >
              <option value="ALL">All Statuses</option>

              {statuses.map((item) => (
                <option key={item} value={item}>
                  {formatStatus(item)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DELIVERY TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-800">
              Delivery Records
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {pagination.total} total records
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2
              className="animate-spin text-blue-600"
              size={32}
            />
          </div>
        ) : deliveries.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
            <Package size={42} className="text-slate-300" />
            <h3 className="mt-3 font-semibold text-slate-700">
              No delivery records found
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Store</th>
                    <th className="px-5 py-4">Rider</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {deliveries.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {item.orderNumber}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(item.createdAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {item.customer?.name || "Unknown customer"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.customer?.phone || item.customer?.email}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {item.store?.name || "Unknown store"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.zone?.barangay || "No zone"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        {item.delivery?.rider?.user ? (
                          <>
                            <p className="font-medium text-slate-700">
                              {item.delivery.rider.user.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {item.delivery.rider.user.phone ||
                                item.delivery.rider.user.email}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-amber-600">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {formatCurrency(item.totalAmount)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                        >
                          {formatStatus(item.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {item.status === "READY_FOR_PICKUP" &&
                            !item.delivery?.rider && (
                              <button
                                onClick={() => openAssignModal(item)}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                              >
                                <UserPlus size={15} />
                                Assign Rider
                              </button>
                            )}

                          <button
                            onClick={() => viewDetails(item.id)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
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

            {/* PAGINATION */}
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of{" "}
                {Math.max(1, pagination.totalPages)}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    fetchDeliveries(pagination.page - 1)
                  }
                  disabled={pagination.page <= 1}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  onClick={() =>
                    fetchDeliveries(pagination.page + 1)
                  }
                  disabled={
                    pagination.page >= pagination.totalPages ||
                    pagination.totalPages === 0
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ASSIGN RIDER MODAL */}
      {assigningOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Assign Rider
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select an available rider for this order.
                </p>
              </div>

              <button
                onClick={() => setAssigningOrder(null)}
                disabled={assigning}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Order Number
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-800">
                  {assigningOrder.orderNumber}
                </h3>

                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>
                    Customer:{" "}
                    <strong>{assigningOrder.customer.name}</strong>
                  </p>
                  <p>
                    Store:{" "}
                    <strong>{assigningOrder.store.name}</strong>
                  </p>
                  <p>
                    Amount:{" "}
                    <strong>
                      {formatCurrency(assigningOrder.totalAmount)}
                    </strong>
                  </p>
                  <p>
                    Address: {assigningOrder.deliveryAddress}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select Available Rider
                </label>

                {ridersLoading ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
                    <Loader2 size={18} className="animate-spin" />
                    Loading available riders...
                  </div>
                ) : availableRiders.length === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    No available riders found. Check Rider Management.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableRiders.map((rider) => (
                      <button
                        key={rider.id}
                        type="button"
                        onClick={() => setSelectedRiderId(rider.id)}
                        disabled={assigning}
                        className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                          selectedRiderId === rider.id
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                          <Bike size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800">
                            {rider.user.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {rider.vehicleType || "Vehicle not specified"}
                            {rider.plateNumber
                              ? ` · ${rider.plateNumber}`
                              : ""}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {rider.user.phone || rider.user.email}
                          </p>
                        </div>

                        {selectedRiderId === rider.id ? (
                          <CheckCircle
                            size={22}
                            className="shrink-0 text-blue-600"
                          />
                        ) : (
                          <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                            Available
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                onClick={() => setAssigningOrder(null)}
                disabled={assigning}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleAssignRider}
                disabled={
                  assigning ||
                  ridersLoading ||
                  !selectedRiderId
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus size={17} />
                    Confirm Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS LOADING */}
      {detailsLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="rounded-2xl bg-white p-8">
            <Loader2
              size={32}
              className="mx-auto animate-spin text-blue-600"
            />
            <p className="mt-3 text-sm text-slate-600">
              Loading delivery details...
            </p>
          </div>
        </div>
      )}

      {/* DELIVERY DETAILS MODAL */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Delivery Details
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedDelivery.orderNumber}
                </p>
              </div>

              <button
                onClick={() => setSelectedDelivery(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${statusStyles[selectedDelivery.status]}`}
                >
                  {formatStatus(selectedDelivery.status)}
                </span>

                <p className="text-sm font-bold text-slate-800">
                  {formatCurrency(selectedDelivery.totalAmount)}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center gap-2 text-blue-600">
                    <User size={18} />
                    <h3 className="font-semibold text-slate-800">
                      Customer
                    </h3>
                  </div>
                  <p className="font-semibold text-slate-700">
                    {selectedDelivery.customer.name}
                  </p>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {selectedDelivery.customer.email}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedDelivery.customer.phone || "No phone"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center gap-2 text-purple-600">
                    <Store size={18} />
                    <h3 className="font-semibold text-slate-800">
                      Store
                    </h3>
                  </div>
                  <p className="font-semibold text-slate-700">
                    {selectedDelivery.store.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedDelivery.store.address}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedDelivery.store.phone || "No phone"}
                  </p>
                </div>
              </div>

              {/* RIDER */}
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-sky-600">
                  <Truck size={18} />
                  <h3 className="font-semibold text-slate-800">
                    Assigned Rider
                  </h3>
                </div>

                {selectedDelivery.delivery?.rider?.user ? (
                  <div>
                    <p className="font-semibold text-slate-700">
                      {selectedDelivery.delivery.rider.user.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedDelivery.delivery.rider.user.email}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <Phone size={14} />
                      {selectedDelivery.delivery.rider.user.phone ||
                        "No phone"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-amber-600">
                      No rider assigned to this delivery.
                    </p>

                    {selectedDelivery.status === "READY_FOR_PICKUP" && (
                      <button
                        onClick={() => {
                          const order = selectedDelivery;
                          setSelectedDelivery(null);
                          openAssignModal(order);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        <UserPlus size={15} />
                        Assign Rider
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ADDRESS */}
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-2 flex items-center gap-2 text-red-500">
                  <MapPin size={18} />
                  <h3 className="font-semibold text-slate-800">
                    Delivery Address
                  </h3>
                </div>
                <p className="text-sm text-slate-600">
                  {selectedDelivery.deliveryAddress}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Zone: {selectedDelivery.zone.name} ·{" "}
                  {selectedDelivery.zone.barangay}
                </p>
              </div>

              {/* TIMELINE */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-4 font-semibold text-slate-800">
                  Delivery Timeline
                </h3>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Clock
                      size={18}
                      className="mt-0.5 text-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Order Created
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(selectedDelivery.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Package
                      size={18}
                      className="mt-0.5 text-purple-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Picked Up
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(
                          selectedDelivery.delivery?.pickupTime
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle
                      size={18}
                      className="mt-0.5 text-green-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Delivered
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(
                          selectedDelivery.delivery?.deliveredAt
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PAYMENT */}
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-green-600">
                  <CreditCard size={18} />
                  <h3 className="font-semibold text-slate-800">
                    Payment Information
                  </h3>
                </div>

                {selectedDelivery.payment ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      Method:{" "}
                      <strong>{selectedDelivery.payment.method}</strong>
                    </p>
                    <p>
                      Status:{" "}
                      <strong>{selectedDelivery.payment.status}</strong>
                    </p>
                    <p>
                      Amount:{" "}
                      <strong>
                        {formatCurrency(selectedDelivery.payment.amount)}
                      </strong>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No payment record available.
                  </p>
                )}
              </div>

              {selectedDelivery.delivery?.notes && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-800">
                    Delivery Notes
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedDelivery.delivery.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 px-6 py-4 text-right">
              <button
                onClick={() => setSelectedDelivery(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
