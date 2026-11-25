
import { useEffect, useState } from "react";
import {
  Package,
  ShoppingBag,
  Clock,
  Wallet,
  RefreshCw,
  Store,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  storeOwnerAPI,
  type StoreDashboardResponse,
} from "../../services/store-owner";

import StoreOwnerSidebar from "../../components/store-owner/StoreOwnerSidebar";
import StoreOwnerHeader from "../../components/store-owner/StoreOwnerHeader";
import StoreOwnerStatCard from "../../components/store-owner/StoreOwnerStatCard";
import StoreStatusCard from "../../components/store-owner/StoreStatusCard";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";
    case "PREPARING":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function StoreOwnerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboard, setDashboard] =
    useState<StoreDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard(showToast = false) {
    try {
      setRefreshing(true);

      const response = await storeOwnerAPI.getMyStore();

      setDashboard(response);

      if (showToast) {
        toast.success("Dashboard refreshed.");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load store dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-500">
            Loading your store dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Store className="mx-auto text-slate-400" size={40} />
          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Unable to Load Store
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            We could not retrieve your store information.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              void loadDashboard();
            }}
            className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { store, stats, recentOrders } = dashboard;

  const storeApproved =
    store.status === "APPROVED" && store.isActive;

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreOwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-72">
        <StoreOwnerHeader
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Welcome back!
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                {store.name}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {store.category.replaceAll("_", " ")} · {store.barangay}
              </p>
            </div>

            <button
              onClick={() => void loadDashboard(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <StoreStatusCard store={store} />

          {storeApproved ? (
            <>
              <div className="mb-5 mt-8">
                <h2 className="text-lg font-bold text-slate-900">
                  Store Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Here's what's happening with your store.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StoreOwnerStatCard
                  title="Total Products"
                  value={stats.totalProducts}
                  icon={Package}
                  description="Products registered in your store"
                  iconColor="bg-blue-100 text-blue-600"
                />

                <StoreOwnerStatCard
                  title="Total Orders"
                  value={stats.totalOrders}
                  icon={ShoppingBag}
                  description="All orders received"
                  iconColor="bg-purple-100 text-purple-600"
                />

                <StoreOwnerStatCard
                  title="Pending Orders"
                  value={stats.pendingOrders}
                  icon={Clock}
                  description="Orders waiting for confirmation"
                  iconColor="bg-amber-100 text-amber-600"
                />

                <StoreOwnerStatCard
                  title="Total Sales"
                  value={formatCurrency(stats.totalSales)}
                  icon={Wallet}
                  description="Sales from delivered orders"
                  iconColor="bg-green-100 text-green-600"
                />
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-slate-900">
                        Recent Orders
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Latest orders from your customers
                      </p>
                    </div>

                    <ShoppingBag className="text-slate-400" />
                  </div>

                  {recentOrders.length === 0 ? (
                    <div className="py-12 text-center">
                      <ShoppingBag
                        className="mx-auto text-slate-300"
                        size={40}
                      />
                      <p className="mt-3 font-medium text-slate-600">
                        No orders yet
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        New customer orders will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                            <th className="pb-3 pr-4">Order</th>
                            <th className="pb-3 pr-4">Customer</th>
                            <th className="pb-3 pr-4">Amount</th>
                            <th className="pb-3 pr-4">Status</th>
                            <th className="pb-3">Date</th>
                          </tr>
                        </thead>

                        <tbody>
                          {recentOrders.map((order) => (
                            <tr
                              key={order.id}
                              className="border-b border-slate-50 last:border-0"
                            >
                              <td className="py-4 pr-4 font-semibold text-slate-800">
                                {order.orderNumber}
                              </td>

                              <td className="py-4 pr-4 text-slate-600">
                                {order.customer.name}
                              </td>

                              <td className="py-4 pr-4 font-medium text-slate-800">
                                {formatCurrency(order.totalAmount)}
                              </td>

                              <td className="py-4 pr-4">
                                <span
                                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(order.status)}`}
                                >
                                  {order.status.replaceAll("_", " ")}
                                </span>
                              </td>

                              <td className="whitespace-nowrap py-4 text-slate-500">
                                {formatDate(order.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="font-bold text-slate-900">
                    Order Summary
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Current order statuses
                  </p>

                  <div className="mt-6 space-y-5">
                    {[
                      ["Pending", stats.pendingOrders, "bg-amber-500"],
                      ["Confirmed", stats.confirmedOrders, "bg-blue-500"],
                      ["Preparing", stats.preparingOrders, "bg-purple-500"],
                      ["Completed", stats.completedOrders, "bg-green-500"],
                      ["Cancelled", stats.cancelledOrders, "bg-red-500"],
                    ].map(([label, value, color]) => (
                      <div key={String(label)}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-slate-600">{label}</span>
                          <span className="font-bold text-slate-800">
                            {value}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${color}`}
                            style={{
                              width: `${
                                stats.totalOrders > 0
                                  ? (Number(value) / stats.totalOrders) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-bold text-slate-800">
                Store Operations Locked
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Product management and order operations will become
                available after your store has been approved and
                activated by the administrator.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
