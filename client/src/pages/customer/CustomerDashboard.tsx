
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Store,
  MapPin,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Truck,
  ArrowRight,
  ShoppingCart,
  RefreshCw,
  Loader2,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../contexts/AuthContext";
import {
  customerMyOrdersAPI,
  type CustomerOrder,
} from "../../services/customer-my-orders";

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await customerMyOrdersAPI.getAll();
      setOrders(data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load dashboard orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    const interval = window.setInterval(() => {
      loadOrders(true);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadOrders]);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) =>
    ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(
      order.status
    )
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;
  const cancelledOrders = orders.filter(
    (order) => order.status === "CANCELLED"
  ).length;

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Completed Orders",
      value: completedOrders,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Cancelled Orders",
      value: cancelledOrders,
      icon: XCircle,
      color: "bg-red-100 text-red-600",
    },
  ];

  const quickActions = [
    {
      title: "Browse Stores",
      description: "Discover approved local stores and products.",
      icon: Store,
      color: "bg-orange-100 text-orange-600",
      path: "/customer/browse-stores",
    },
    {
      title: "My Shopping Cart",
      description: "View and manage your selected products.",
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-600",
      path: "/customer/cart",
    },
    {
      title: "My Orders",
      description: "View your orders and purchase history.",
      icon: ShoppingBag,
      color: "bg-green-100 text-green-600",
      path: "/customer/my-orders",
    },
    {
      title: "My Profile",
      description: "Manage your personal information.",
      icon: User,
      color: "bg-purple-100 text-purple-600",
      path: "/customer/profile",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CONFIRMED":
      case "PREPARING":
      case "READY_FOR_PICKUP":
        return "bg-blue-100 text-blue-700";
      case "ASSIGNED":
      case "PICKED_UP":
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const formatStatus = (status: string) =>
    status.replaceAll("_", " ");

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500">
              <Truck size={25} />
            </div>
            <div>
              <h1 className="text-xl font-bold">TownExpress</h1>
              <p className="text-xs text-slate-400">Customer Portal</p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-3 pt-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Customer Menu
          </p>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex w-full items-center gap-3 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          {[
            { label: "Browse Stores", icon: Store, path: "/customer/browse-stores" },
            { label: "My Cart", icon: ShoppingCart, path: "/customer/cart" },
            { label: "My Orders", icon: ShoppingBag, path: "/customer/my-orders" },
            { label: "Notifications", icon: Bell, path: "/customer/notifications" },
            { label: "My Profile", icon: User, path: "/customer/profile" },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => {
                  setSidebarOpen(false);
                  navigate(item.path);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.name || "Customer"}
              </p>
              <p className="text-xs text-slate-400">Customer Account</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Customer Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                Welcome to TownExpress
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadOrders(true)}
              disabled={refreshing}
              className="rounded-xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              aria-label="Refresh dashboard"
            >
              <RefreshCw
                size={19}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            <button
              onClick={() => navigate("/customer/notifications")}
              className="relative rounded-xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
          {/* WELCOME */}
          <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white shadow-lg shadow-orange-500/10 sm:p-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium text-orange-100">
                  CUSTOMER OVERVIEW
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Welcome, {user?.name || "Customer"}!
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-orange-50">
                  Discover local stores, shop your favorite products, and have
                  your orders delivered right to your doorstep.
                </p>
              </div>

              <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start rounded-3xl bg-white/15 sm:self-center">
                <ShoppingBag size={48} />
              </div>
            </div>
          </section>

          {/* STATISTICS */}
          <section>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Order Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep track of your shopping activities.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {stat.label}
                        </p>
                        <h3 className="mt-2 text-3xl font-bold text-slate-900">
                          {loading ? "..." : stat.value}
                        </h3>
                      </div>
                      <div className={`rounded-xl p-3 ${stat.color}`}>
                        <Icon size={24} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Quick Actions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Access your customer services.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.title}
                    type="button"
                    onClick={() => navigate(action.path)}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-md"
                  >
                    <div className={`mb-4 inline-flex rounded-xl p-3 ${action.color}`}>
                      <Icon size={23} />
                    </div>
                    <h3 className="font-bold text-slate-900">
                      {action.title}
                    </h3>
                    <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                      {action.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-600">
                      Open Module
                      <ArrowRight size={15} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* RECENT ORDERS */}
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Orders
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your five latest purchases.
                </p>
              </div>

              <button
                onClick={() => navigate("/customer/my-orders")}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
              >
                View All Orders
                <ArrowRight size={16} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
                <Loader2 className="animate-spin text-orange-500" size={30} />
                <span className="ml-3 text-sm text-slate-500">
                  Loading your orders...
                </span>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
                <div className="rounded-full bg-orange-100 p-5">
                  <ShoppingCart size={35} className="text-orange-500" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-800">
                  No Orders Yet
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  You haven't placed any orders yet. Start shopping from local
                  stores and your recent orders will appear here.
                </p>
                <button
                  onClick={() => navigate("/customer/browse-stores")}
                  className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  Browse Stores
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                          <Package size={22} />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900">
                            {order.store.name}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Order #{order.orderNumber}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(order.status)}`}
                        >
                          {formatStatus(order.status)}
                        </span>

                        <p className="font-bold text-slate-900">
                          ₱{Number(order.totalAmount).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>

                        <button
                          onClick={() =>
                            navigate(`/customer/order-details/${order.id}`)
                          }
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <p className="text-xs text-slate-500">
                        {order.items.reduce(
                          (total, item) => total + item.quantity,
                          0
                        )}{" "}
                        item(s) in this order
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* DELIVERY INFORMATION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Shop Local with TownExpress
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Support local businesses and get your favorite products
                  delivered conveniently to your location.
                </p>
              </div>
            </div>
          </section>

          <footer className="border-t border-slate-200 py-5 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} TownExpress. All rights reserved.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
