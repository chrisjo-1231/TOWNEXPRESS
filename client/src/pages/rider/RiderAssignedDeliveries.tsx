
import { useCallback, useEffect, useState } from "react";
import {
  Package,
  RefreshCw,
  MapPin,
  Store,
  User,
  Phone,
  Clock,
  Truck,
  ClipboardList,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  riderAPI,
  type RiderDelivery,
} from "../../services/rider";

const statusStyles: Record<string, string> = {
  ASSIGNED: "bg-blue-100 text-blue-700",
  PICKED_UP: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
};

const statusLabels: Record<string, string> = {
  ASSIGNED: "Assigned",
  PICKED_UP: "Picked Up",
  OUT_FOR_DELIVERY: "Out for Delivery",
};

type NextStatus =
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

const nextStatus: Record<string, NextStatus> = {
  ASSIGNED: "PICKED_UP",
  PICKED_UP: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

const actionLabels: Record<string, string> = {
  PICKED_UP: "Mark as Picked Up",
  OUT_FOR_DELIVERY: "Start Delivery",
  DELIVERED: "Mark as Delivered",
};

export default function RiderAssignedDeliveries() {
  const [deliveries, setDeliveries] = useState<RiderDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadDeliveries = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);

      const response = await riderAPI.getAssignedDeliveries();

      setDeliveries(response.deliveries);

      if (showToast) {
        toast.success("Deliveries refreshed.");
      }
    } catch (error) {
      console.error("Assigned deliveries error:", error);
      toast.error("Failed to load assigned deliveries.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveries();

    const interval = window.setInterval(() => {
      loadDeliveries();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadDeliveries]);

  const handleUpdateStatus = async (
    delivery: RiderDelivery,
    status: NextStatus
  ) => {
    const action = actionLabels[status];

    const confirmed = window.confirm(
      `Are you sure you want to ${action.toLowerCase()} for order ${delivery.order.orderNumber}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(delivery.id);

      await riderAPI.updateDeliveryStatus(delivery.id, status);

      toast.success(`Order ${delivery.order.orderNumber}: ${statusLabels[status] || status.replaceAll("_", " ")}.`);

      await loadDeliveries();
    } catch (error: any) {
      console.error("Update delivery status error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update delivery status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="mx-auto mb-3 animate-spin text-blue-600"
          />
          <p className="text-sm text-slate-500">
            Loading assigned deliveries...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <Truck size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Assigned Deliveries
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your active delivery assignments.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadDeliveries(true)}
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
        <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
          <p className="text-sm text-blue-100">
            Active Assignments
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {deliveries.length}
          </h2>

          <p className="mt-2 text-sm text-blue-100">
            Deliveries currently assigned to your rider account.
          </p>
        </section>

        {deliveries.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <ClipboardList
              size={52}
              className="mx-auto mb-4 text-slate-300"
            />

            <h2 className="text-lg font-bold text-slate-800">
              No Assigned Deliveries
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New delivery assignments will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {deliveries.map((delivery) => {
              const order = delivery.order;
              const upcomingStatus = nextStatus[order.status];
              const isUpdating = updatingId === delivery.id;

              return (
                <article
                  key={delivery.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                    <div>
                      <p className="text-xs text-slate-500">
                        Order Number
                      </p>

                      <h3 className="mt-1 font-bold text-slate-900">
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

                  <div className="grid gap-6 p-5 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Store
                          size={20}
                          className="mt-0.5 text-blue-600"
                        />

                        <div>
                          <p className="text-xs text-slate-500">
                            Pickup Store
                          </p>

                          <p className="font-semibold text-slate-800">
                            {order.store.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {order.store.address}
                          </p>

                          {order.store.phone && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <Phone size={12} />
                              {order.store.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin
                          size={20}
                          className="mt-0.5 text-orange-600"
                        />

                        <div>
                          <p className="text-xs text-slate-500">
                            Delivery Address
                          </p>

                          <p className="font-semibold text-slate-800">
                            {order.deliveryAddress}
                          </p>

                          <p className="text-sm text-slate-500">
                            {order.zone.barangay}, {order.zone.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User
                          size={20}
                          className="mt-0.5 text-slate-500"
                        />

                        <div>
                          <p className="text-xs text-slate-500">
                            Customer
                          </p>

                          <p className="font-semibold text-slate-800">
                            {order.customer.name}
                          </p>

                          {order.customer.phone && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <Phone size={12} />
                              {order.customer.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Package
                          size={20}
                          className="mt-0.5 text-purple-600"
                        />

                        <div>
                          <p className="text-xs text-slate-500">
                            Order Items
                          </p>

                          <div className="mt-1 space-y-1">
                            {order.items.map((item) => (
                              <p
                                key={item.id}
                                className="text-sm text-slate-700"
                              >
                                {item.quantity} × {item.product.name}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
                    <div>
                      <p className="text-xs text-slate-500">
                        Order Total
                      </p>

                      <p className="text-xl font-bold text-slate-900">
                        ₱
                        {Number(order.totalAmount).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={15} />
                      {new Date(delivery.createdAt).toLocaleString("en-PH")}
                    </div>
                  </div>

                  {upcomingStatus && (
                    <div className="border-t border-slate-100 p-5">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(delivery, upcomingStatus)
                        }
                        disabled={isUpdating || updatingId !== null}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            {upcomingStatus === "DELIVERED" ? (
                              <CheckCircle2 size={18} />
                            ) : (
                              <Truck size={18} />
                            )}
                            {actionLabels[upcomingStatus]}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {order.status === "DELIVERED" && (
                    <div className="flex items-center gap-2 border-t border-slate-100 bg-green-50 p-5 text-sm font-semibold text-green-700">
                      <CheckCircle2 size={19} />
                      Delivery completed successfully.
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
