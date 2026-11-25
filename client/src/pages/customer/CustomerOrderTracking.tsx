
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Store,
  MapPin,
  Clock,
  CheckCircle2,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  customerTrackingAPI,
  type CustomerOrderTracking,
} from "../../services/customer-tracking";

const trackingSteps = [
  { status: "PENDING", label: "Order Placed", description: "Your order has been received." },
  { status: "CONFIRMED", label: "Order Confirmed", description: "The store confirmed your order." },
  { status: "PREPARING", label: "Preparing Order", description: "The store is preparing your items." },
  { status: "READY_FOR_PICKUP", label: "Ready for Pickup", description: "Your order is ready for collection." },
  { status: "ASSIGNED", label: "Rider Assigned", description: "A rider has been assigned to your order." },
  { status: "PICKED_UP", label: "Order Picked Up", description: "The rider picked up your order." },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", description: "Your order is on its way." },
  { status: "DELIVERED", label: "Delivered", description: "Your order has been delivered." },
];


function formatDate(date: string) {
  return new Date(date).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function CustomerOrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<CustomerOrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTracking = useCallback(async (manual = false) => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      if (manual) setRefreshing(true);

      const data = await customerTrackingAPI.getTracking(id);
      setOrder(data);
    } catch (error: any) {
      console.error("Tracking error:", error);

      if (!order) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load order tracking."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, order]);

  useEffect(() => {
    fetchTracking();

    const interval = window.setInterval(() => {
      fetchTracking();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [fetchTracking]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <RefreshCw className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <Package size={50} className="text-slate-300" />
        <h2 className="mt-4 text-xl font-extrabold text-slate-800">
          Order Not Found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          We couldn't retrieve this order's tracking information.
        </p>
        <button
          type="button"
          onClick={() => navigate("/customer/orders")}
          className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const currentStepIndex = trackingSteps.findIndex(
    (step) => step.status === order.status
  );

  const history = [...order.statusHistory].reverse();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-8">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">
              Order Tracking
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Follow your order progress
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchTracking(true)}
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

        <div className="space-y-6 p-5 md:p-8">
          <button
            type="button"
            onClick={() => navigate("/customer/orders")}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-500"
          >
            <ArrowLeft size={17} />
            Back to My Orders
          </button>

          {/* ORDER SUMMARY */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400">
                  ORDER NUMBER
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-800">
                  {order.orderNumber}
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-4 py-2 text-xs font-extrabold ${
                  isCancelled
                    ? "bg-red-100 text-red-700"
                    : order.status === "DELIVERED"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {formatStatus(order.status)}
              </span>
            </div>

            {isCancelled && (
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-700">
                <XCircle size={20} />
                <p className="text-sm font-semibold">
                  This order has been cancelled.
                </p>
              </div>
            )}
          </section>

          {/* TRACKING TIMELINE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-extrabold text-slate-800">
              Delivery Progress
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your order status updates automatically every 15 seconds.
            </p>

            <div className="mt-8 space-y-0">
              {trackingSteps.map((step, index) => {
                const completed =
                  !isCancelled && currentStepIndex >= index;

                const current =
                  !isCancelled && currentStepIndex === index;

                return (
                  <div key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
                    {index !== trackingSteps.length - 1 && (
                      <div
                        className={`absolute left-[15px] top-9 h-full w-0.5 ${
                          completed && currentStepIndex > index
                            ? "bg-green-500"
                            : "bg-slate-200"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        completed
                          ? "bg-green-500 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 size={19} />
                      ) : (
                        <Clock size={17} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-sm font-extrabold ${
                            completed ? "text-slate-800" : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </h3>

                        {current && (
                          <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-extrabold text-orange-600">
                            CURRENT STATUS
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ORDER INFORMATION */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <Store className="text-orange-500" size={22} />
                <h2 className="font-extrabold text-slate-800">
                  Store Information
                </h2>
              </div>

              <p className="mt-5 font-bold text-slate-800">
                {order.store.name}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {order.store.address}
              </p>
              {order.store.phone && (
                <p className="mt-2 text-sm text-slate-500">
                  Phone: {order.store.phone}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <MapPin className="text-orange-500" size={22} />
                <h2 className="font-extrabold text-slate-800">
                  Delivery Address
                </h2>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">
                {order.deliveryAddress}
              </p>
            </div>
          </section>

          {/* DELIVERY INFORMATION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <Truck className="text-orange-500" size={22} />
              <h2 className="font-extrabold text-slate-800">
                Rider & Delivery Information
              </h2>
            </div>

            {order.delivery?.riderId ? (
              <div className="mt-4">
                <p className="text-sm text-slate-600">
                  A rider has been assigned to your order.
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Rider ID: {order.delivery.riderId}
                </p>
                {order.delivery.pickupTime && (
                  <p className="mt-2 text-sm text-slate-600">
                    Picked up: {formatDate(order.delivery.pickupTime)}
                  </p>
                )}
                {order.delivery.deliveredAt && (
                  <p className="mt-2 text-sm text-green-600">
                    Delivered: {formatDate(order.delivery.deliveredAt)}
                  </p>
                )}
                {order.delivery.notes && (
                  <p className="mt-2 text-sm text-slate-600">
                    Notes: {order.delivery.notes}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No rider has been assigned yet. Delivery information will appear here once assigned.
              </p>
            )}
          </section>

          {/* STATUS HISTORY */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-extrabold text-slate-800">
              Status History
            </h2>

            {history.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No status history available.
              </p>
            ) : (
              <div className="mt-5 space-y-5">
                {history.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {formatStatus(item.status)}
                      </p>
                      {item.remarks && (
                        <p className="mt-1 text-sm text-slate-500">
                          {item.remarks}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
