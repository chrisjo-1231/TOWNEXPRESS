
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Package,
  Search,
  RefreshCw,
  ShoppingBag,
  Eye,
  Clock,
  CheckCircle2,
  Store,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  customerMyOrdersAPI,
  type CustomerOrder,
} from "../../services/customer-my-orders";

const statusStyles: Record<string, string> = {
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
  return status.replaceAll("_", " ");
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(amount));
}

export default function CustomerMyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await customerMyOrdersAPI.getAll();
      setOrders(data);
    } catch (error: any) {
      console.error("Fetch customer orders error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load your orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.store.name.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalOrders = orders.length;

  const activeOrders = orders.filter(
    (order) => !["DELIVERED", "CANCELLED"].includes(order.status)
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-8">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">
              My Orders
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track and manage your purchases
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        <div className="space-y-7 p-5 md:p-8">
          {/* STATS */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Total Orders
                </p>
                <Package className="text-orange-500" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-slate-800">
                {totalOrders}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Active Orders
                </p>
                <Clock className="text-blue-500" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-slate-800">
                {activeOrders}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Delivered
                </p>
                <CheckCircle2 className="text-green-500" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-slate-800">
                {deliveredOrders}
              </p>
            </div>
          </section>

          {/* SEARCH AND FILTER */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search order number or store..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </section>

          {/* ORDERS */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-800">
                Order History
              </h2>
              <span className="text-sm text-slate-500">
                {filteredOrders.length} orders found
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <RefreshCw
                  className="mx-auto animate-spin text-orange-500"
                  size={30}
                />
                <p className="mt-3 text-sm text-slate-500">
                  Loading your orders...
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                <ShoppingBag
                  size={48}
                  className="mx-auto text-slate-300"
                />
                <h3 className="mt-4 text-lg font-extrabold text-slate-800">
                  No Orders Found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Your orders will appear here after checkout.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/customer/stores")}
                  className="mt-6 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Browse Stores
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredOrders.map((order) => (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-400">
                          ORDER NUMBER
                        </p>
                        <p className="mt-1 font-extrabold text-slate-800">
                          {order.orderNumber}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleString("en-PH")}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-extrabold ${
                          statusStyles[order.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </div>

                    <div className="space-y-4 p-5">
                      {/* STORE */}
                      <div className="flex items-center gap-3">
                        {order.store.logo ? (
                          <img
                            src={order.store.logo}
                            alt={order.store.name}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                            <Store size={22} />
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-slate-400">STORE</p>
                          <p className="font-bold text-slate-800">
                            {order.store.name}
                          </p>
                        </div>
                      </div>

                      {/* ORDER ITEMS */}
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3"
                          >
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="h-14 w-14 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <Package size={22} />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-slate-800">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                Qty: {item.quantity} ×{" "}
                                {formatCurrency(Number(item.unitPrice))}
                              </p>
                            </div>

                            <p className="text-sm font-bold text-slate-800">
                              {formatCurrency(Number(item.subtotal))}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* PAYMENT AND ACTIONS */}
                      <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-xs text-slate-400">PAYMENT</p>
                          <p className="text-sm font-bold text-slate-700">
                            {order.payment?.method || "Not available"} ·{" "}
                            {order.payment?.status || "Not available"}
                          </p>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          <div className="sm:text-right">
                            <p className="text-xs text-slate-400">
                              TOTAL AMOUNT
                            </p>
                            <p className="text-lg font-extrabold text-orange-600">
                              {formatCurrency(Number(order.totalAmount))}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                             onClick={() => navigate(`/customer/order-details/${order.id}`)}
                              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white hover:bg-slate-700"
                            >
                              <Eye size={15} />
                              Details
                            </button>

                            <button
                              type="button"
                             onClick={() => navigate(`/customer/tracking/${order.id}`)}
                              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-xs font-bold text-white hover:bg-orange-600"
                            >
                              <Truck size={15} />
                              Track Order
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
