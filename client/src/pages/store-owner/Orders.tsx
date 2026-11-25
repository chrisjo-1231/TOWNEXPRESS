
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  MapPin,
  Phone,
  Mail,
  User,
  ShoppingBag,
  CalendarDays,
  CreditCard,
  Banknote,
  AlertCircle,
  Loader2,
  Menu,
  ClipboardList,
} from "lucide-react";
import toast from "react-hot-toast";

import StoreOwnerSidebar from "../../components/store-owner/StoreOwnerSidebar";
import {
  orderAPI,
  type Order,
  type OrderStatus,
} from "../../services/order";

// ============================================
// CONSTANTS
// ============================================

const statusOptions: OrderStatus[] = [
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

const allowedTransitions: Record<string, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: [],
  ASSIGNED: [],
  PICKED_UP: [],
  OUT_FOR_DELIVERY: [],
  DELIVERED: [],
  CANCELLED: [],
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-purple-100 text-purple-700",
  READY_FOR_PICKUP: "bg-indigo-100 text-indigo-700",
  ASSIGNED: "bg-cyan-100 text-cyan-700",
  PICKED_UP: "bg-sky-100 text-sky-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const formatStatus = (status: string) =>
  status.replaceAll("_", " ");

const formatCurrency = (amount: number | string) =>
  `₱${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
        statusStyles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

// ============================================
// STAT CARD
// ============================================

function OrderStatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </h3>
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function Orders() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);

  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [remarks, setRemarks] = useState("");

  const [statusToUpdate, setStatusToUpdate] =
    useState<OrderStatus | "">("");

  // ============================================
  // FETCH ORDERS
  // ============================================

  const fetchOrders = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await orderAPI.getAll({
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          page,
          limit: 10,
        });

        setOrders(response.orders);
        setTotalOrders(response.pagination.total);
        setTotalPages(response.pagination.totalPages || 1);
      } catch (error: any) {
        console.error("FETCH ORDERS ERROR:", error);

        toast.error(
          error.response?.data?.message ||
            "Unable to load orders."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter, page]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ============================================
  // VIEW ORDER DETAILS
  // ============================================

  const handleViewOrder = async (id: string) => {
    setSelectedOrder(null);
    setDetailsLoading(true);
    setStatusToUpdate("");
    setRemarks("");

    try {
      const response = await orderAPI.getById(id);
      setSelectedOrder(response.order);
    } catch (error: any) {
      console.error("ORDER DETAILS ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load order details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // ============================================
  // UPDATE ORDER STATUS
  // ============================================

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !statusToUpdate) {
      toast.error("Please select an order status.");
      return;
    }

    const allowed =
      allowedTransitions[selectedOrder.status] || [];

    if (!allowed.includes(statusToUpdate)) {
      toast.error("This status update is not allowed.");
      return;
    }

    try {
      setUpdatingStatus(true);

      await orderAPI.updateStatus(selectedOrder.id, {
        status: statusToUpdate,
        remarks: remarks.trim() || undefined,
      });

      toast.success("Order status updated successfully.");

      setStatusToUpdate("");
      setRemarks("");

      await handleViewOrder(selectedOrder.id);
      await fetchOrders(true);
    } catch (error: any) {
      console.error("UPDATE ORDER ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ============================================
  // FILTER HANDLERS
  // ============================================

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusFilter = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(event.target.value as OrderStatus | "");
    setPage(1);
  };

  // ============================================
  // PAGE STATISTICS
  // ============================================

  const pendingCount = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const processingCount = orders.filter((order) =>
    ["CONFIRMED", "PREPARING"].includes(order.status)
  ).length;

  const completedCount = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <StoreOwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT */}
      <div className="min-h-screen lg:ml-72">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={23} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Order Management
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Manage and track your store orders
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        <main className="space-y-6 p-4 sm:p-6 lg:p-8">
          {/* PAGE TITLE */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Orders
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View customer purchases and manage order progress.
            </p>
          </div>

          {/* STATISTICS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OrderStatCard
              title="Total Orders"
              value={totalOrders}
              description="Matching orders"
              icon={ShoppingBag}
              color="bg-blue-50 text-blue-600"
            />

            <OrderStatCard
              title="Pending"
              value={pendingCount}
              description="On this page"
              icon={Clock}
              color="bg-amber-50 text-amber-600"
            />

            <OrderStatCard
              title="Processing"
              value={processingCount}
              description="On this page"
              icon={Package}
              color="bg-purple-50 text-purple-600"
            />

            <OrderStatCard
              title="Delivered"
              value={completedCount}
              description="On this page"
              icon={CheckCircle2}
              color="bg-green-50 text-green-600"
            />
          </div>

          {/* ORDERS TABLE CARD */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* FILTERS */}
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-bold text-gray-900">
                  All Orders
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {totalOrders} order(s) found
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search order or customer..."
                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                  />
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-blue-500 sm:w-52"
                  >
                    <option value="">All Statuses</option>

                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>

                  <ClipboardList
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-gray-50">
                  <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <Loader2
                          size={30}
                          className="mx-auto animate-spin text-blue-600"
                        />
                        <p className="mt-3 text-sm text-gray-500">
                          Loading orders...
                        </p>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                          <Package
                            size={26}
                            className="text-gray-400"
                          />
                        </div>

                        <h4 className="mt-4 font-semibold text-gray-800">
                          No orders found
                        </h4>

                        <p className="mt-1 text-sm text-gray-500">
                          Orders will appear here when customers place them.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            ID: {order.id.slice(0, 10)}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            {order.customer.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {order.customer.phone || "No phone number"}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                            {order.items.reduce(
                              (total, item) => total + item.quantity,
                              0
                            )}{" "}
                            item(s)
                          </span>
                        </td>

                        <td className="px-6 py-4 font-bold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                          >
                            <Eye size={15} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {!loading && orders.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Page <strong>{page}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((current) => current - 1)}
                    disabled={page <= 1}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <button
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ========================================
          ORDER DETAILS MODAL
      ======================================== */}

      {(detailsLoading || selectedOrder) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Order Details
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Customer order information
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                disabled={detailsLoading}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close order details"
              >
                <X size={21} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex flex-1 flex-col items-center justify-center py-20">
                <Loader2
                  size={32}
                  className="animate-spin text-blue-600"
                />
                <p className="mt-3 text-sm text-gray-500">
                  Loading order details...
                </p>
              </div>
            ) : selectedOrder ? (
              <div className="overflow-y-auto p-5 sm:p-7">
                {/* ORDER SUMMARY */}
                <div className="flex flex-col gap-4 rounded-xl bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Order Number
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-gray-900">
                      {selectedOrder.orderNumber}
                    </h3>

                    <p className="mt-2 text-xs text-gray-500">
                      <CalendarDays
                        size={13}
                        className="mr-1 inline"
                      />
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <StatusBadge status={selectedOrder.status} />

                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* CUSTOMER AND DELIVERY */}
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 p-5">
                    <h4 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                      <User size={18} className="text-blue-600" />
                      Customer Information
                    </h4>

                    <p className="font-semibold text-gray-800">
                      {selectedOrder.customer.name}
                    </p>

                    <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={15} className="text-gray-400" />
                      {selectedOrder.customer.email}
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={15} className="text-gray-400" />
                      {selectedOrder.customer.phone || "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-5">
                    <h4 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                      <MapPin size={18} className="text-blue-600" />
                      Delivery Information
                    </h4>

                    <p className="text-sm leading-relaxed text-gray-700">
                      {selectedOrder.deliveryAddress}
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                      Barangay:{" "}
                      <strong className="text-gray-800">
                        {selectedOrder.zone?.barangay || "N/A"}
                      </strong>
                    </p>

                    {selectedOrder.delivery?.rider && (
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <p className="text-xs text-gray-500">
                          Assigned Rider
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {selectedOrder.delivery.rider.user.name}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {selectedOrder.delivery.rider.user.phone ||
                            "No phone number"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ORDER ITEMS */}
                <div className="mt-6">
                  <h4 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
                    <ShoppingBag size={18} className="text-blue-600" />
                    Ordered Products
                  </h4>

                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 border-b border-gray-100 p-4 last:border-0"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {item.product.image ? (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="h-12 w-12 rounded-lg border border-gray-100 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                              <Package
                                size={20}
                                className="text-gray-400"
                              />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-800">
                              {item.product.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {item.quantity} ×{" "}
                              {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                        </div>

                        <p className="shrink-0 font-bold text-gray-900">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PAYMENT SUMMARY */}
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 p-5">
                    <h4 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                      <CreditCard
                        size={18}
                        className="text-blue-600"
                      />
                      Payment Information
                    </h4>

                    {selectedOrder.payment ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Method</span>
                          <strong className="text-gray-800">
                            {selectedOrder.payment.method}
                          </strong>
                        </div>

                        <div className="mt-3 flex justify-between text-sm">
                          <span className="text-gray-500">Payment Status</span>
                          <strong className="text-gray-800">
                            {selectedOrder.payment.status}
                          </strong>
                        </div>

                        {selectedOrder.payment.reference && (
                          <div className="mt-3 flex justify-between gap-3 text-sm">
                            <span className="text-gray-500">Reference</span>
                            <strong className="break-all text-right text-gray-800">
                              {selectedOrder.payment.reference}
                            </strong>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No payment record available.
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-gray-100 p-5">
                    <h4 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                      <Banknote size={18} className="text-blue-600" />
                      Order Summary
                    </h4>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-800">
                        {formatCurrency(selectedOrder.subtotal)}
                      </span>
                    </div>

                    <div className="mt-3 flex justify-between text-sm">
                      <span className="text-gray-500">Delivery Fee</span>
                      <span className="font-medium text-gray-800">
                        {formatCurrency(selectedOrder.deliveryFee)}
                      </span>
                    </div>

                    <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                      <span className="font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CUSTOMER NOTES */}
                {selectedOrder.notes && (
                  <div className="mt-5 rounded-xl bg-amber-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
                      <AlertCircle size={16} />
                      Customer Notes
                    </p>
                    <p className="mt-2 text-sm text-amber-900">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* STATUS HISTORY */}
                {selectedOrder.statusHistory &&
                  selectedOrder.statusHistory.length > 0 && (
                    <div className="mt-6">
                      <h4 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                        <Clock size={18} className="text-blue-600" />
                        Order Status History
                      </h4>

                      <div className="space-y-4 border-l-2 border-gray-200 pl-5">
                        {selectedOrder.statusHistory.map((history) => (
                          <div key={history.id} className="relative">
                            <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500 ring-2 ring-blue-100" />

                            <StatusBadge status={history.status} />

                            <p className="mt-1 text-xs text-gray-400">
                              {formatDate(history.createdAt)}
                            </p>

                            {history.remarks && (
                              <p className="mt-1 text-sm text-gray-600">
                                {history.remarks}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* UPDATE STATUS */}
                {(
                  allowedTransitions[selectedOrder.status] || []
                ).length > 0 && (
                  <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                    <h4 className="flex items-center gap-2 font-bold text-gray-900">
                      <Truck size={18} className="text-blue-600" />
                      Update Order Status
                    </h4>

                    <p className="mt-1 text-xs text-gray-500">
                      Choose the next status for this order.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <select
                        value={statusToUpdate}
                        onChange={(event) =>
                          setStatusToUpdate(
                            event.target.value as OrderStatus | ""
                          )
                        }
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="">Select new status</option>

                        {allowedTransitions[selectedOrder.status].map(
                          (status) => (
                            <option key={status} value={status}>
                              {formatStatus(status)}
                            </option>
                          )
                        )}
                      </select>

                      <input
                        type="text"
                        value={remarks}
                        onChange={(event) =>
                          setRemarks(event.target.value)
                        }
                        placeholder="Remarks (optional)"
                        maxLength={500}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      onClick={handleUpdateStatus}
                      disabled={!statusToUpdate || updatingStatus}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {updatingStatus ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={17} />
                          Update Status
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* MODAL FOOTER */}
            {selectedOrder && !detailsLoading && (
              <div className="border-t border-gray-100 px-5 py-4 text-right sm:px-7">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
