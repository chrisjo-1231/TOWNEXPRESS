
import { useCallback, useEffect, useState } from "react";
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  RefreshCw,
  MapPin,
  Store,
  User,
  Bike,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  riderAPI,
  type RiderDashboardResponse,
} from "../../services/rider";

const statusStyles: Record<string, string> = {
  ASSIGNED: "bg-blue-100 text-blue-700",
  PICKED_UP: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  ASSIGNED: "Assigned",
  PICKED_UP: "Picked Up",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function RiderDashboard() {
  const [dashboard, setDashboard] =
    useState<RiderDashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);

      const data = await riderAPI.getDashboard();
      setDashboard(data);

      if (showToast) {
        toast.success("Dashboard refreshed.");
      }
    } catch (error: any) {
  console.error("Rider dashboard error:", error);
  console.error("404 RESPONSE:", error.response?.data);
  console.error("REQUEST URL:", error.config?.url);
  console.error("BASE URL:", error.config?.baseURL);
  console.error("STATUS:", error.response?.status);

  toast.error(
    error.response?.data?.message || "Failed to load rider dashboard."
  );
}finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = [
    {
      label: "Total Deliveries",
      value: dashboard?.statistics.totalDeliveries ?? 0,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active Deliveries",
      value: dashboard?.statistics.activeDeliveries ?? 0,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Completed Deliveries",
      value: dashboard?.statistics.completedDeliveries ?? 0,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 animate-spin text-blue-600" size={32} />
          <p className="text-sm text-slate-500">Loading rider dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={40} />
          <h2 className="text-xl font-bold text-slate-800">
            Unable to load dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Please check your rider account and try again.
          </p>
          <button
            onClick={() => loadDashboard()}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { rider, recentDeliveries } = dashboard;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-slate-900">
                TownExpress Rider
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Welcome to your delivery dashboard.
            </p>
          </div>

          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm text-blue-100">Rider Account</p>
              <h2 className="mt-1 text-2xl font-bold">
                {rider.availability === "AVAILABLE"
                  ? "Available for Deliveries"
                  : rider.availability === "BUSY"
                    ? "Currently on Delivery"
                    : "Currently Offline"}
              </h2>
              <p className="mt-2 text-sm text-blue-100">
                Your delivery activity at a glance.
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 p-4">
              <Bike size={42} />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-6 border-t border-white/20 pt-4 text-sm">
            <div>
              <p className="text-blue-100">Vehicle</p>
              <p className="mt-1 font-semibold">
                {rider.vehicleType || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-blue-100">Plate Number</p>
              <p className="mt-1 font-semibold">
                {rider.plateNumber || "Not specified"}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                      {stat.value}
                    </h3>
                  </div>

                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon size={25} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Deliveries
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your latest assigned delivery records.
              </p>
            </div>
            <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              Latest 5
            </span>
          </div>

          {recentDeliveries.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Package className="mx-auto mb-3 text-slate-300" size={45} />
              <h3 className="font-semibold text-slate-700">
                No deliveries yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Your assigned deliveries will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentDeliveries.map((delivery) => {
                const order = delivery.order;

                return (
                  <div
                    key={delivery.id}
                    className="space-y-4 p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Order Number</p>
                        <h3 className="font-bold text-slate-900">
                          {order.orderNumber}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          statusStyles[order.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <Store className="mt-0.5 text-blue-600" size={19} />
                        <div>
                          <p className="text-xs text-slate-500">Pickup Store</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {order.store.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {order.store.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 text-orange-600" size={19} />
                        <div>
                          <p className="text-xs text-slate-500">
                            Delivery Address
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {order.deliveryAddress}
                          </p>
                          <p className="text-xs text-slate-500">
                            {order.zone.barangay}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="mt-0.5 text-slate-500" size={19} />
                        <div>
                          <p className="text-xs text-slate-500">Customer</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {order.customer.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {order.customer.phone || "No phone number"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Order Total</p>
                        <p className="text-lg font-bold text-slate-900">
                          ₱{Number(order.totalAmount).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.items.length} item(s)
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 text-xs text-slate-400">
                      Assigned on{" "}
                      {new Date(delivery.createdAt).toLocaleString("en-PH")}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
