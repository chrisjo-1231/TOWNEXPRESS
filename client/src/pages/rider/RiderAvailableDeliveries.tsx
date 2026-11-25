
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
  Loader2,
  Send,
  
} from "lucide-react";
import toast from "react-hot-toast";

import {
  riderAPI,
  type RiderAvailableDelivery,
} from "../../services/rider";

export default function RiderAvailableDeliveries() {
  const [deliveries, setDeliveries] = useState<RiderAvailableDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  const loadDeliveries = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);

      const response = await riderAPI.getAvailableDeliveries();

      setDeliveries(response.deliveries);

      if (showToast) {
        toast.success("Available deliveries refreshed.");
      }
    } catch (error: any) {
      console.error("Available deliveries error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load available deliveries."
      );
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

  const handleRequestDelivery = async (
    delivery: RiderAvailableDelivery
  ) => {
    const message = messages[delivery.id]?.trim() || "";

    if (message.length > 500) {
      toast.error("Message must not exceed 500 characters.");
      return;
    }

    const confirmed = window.confirm(
      `Submit a delivery request for order ${delivery.orderNumber}? Admin approval is required before assignment.`
    );

    if (!confirmed) return;

    try {
      setRequestingId(delivery.id);

      const response = await riderAPI.requestDelivery(
        delivery.id,
        message || undefined
      );

      toast.success(response.message || "Delivery request submitted.");

      setMessages((previous) => {
        const updated = { ...previous };
        delete updated[delivery.id];
        return updated;
      });

      await loadDeliveries();
    } catch (error: any) {
      console.error("Request delivery error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to submit delivery request."
      );
    } finally {
      setRequestingId(null);
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
            Loading available deliveries...
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
                Available Deliveries
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Browse orders and request delivery assignments.
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
            Available Orders
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {deliveries.length}
          </h2>

          <p className="mt-2 text-sm text-blue-100">
            Orders ready for pickup and open for rider requests.
          </p>
        </section>

        {deliveries.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <ClipboardList
              size={52}
              className="mx-auto mb-4 text-slate-300"
            />

            <h2 className="text-lg font-bold text-slate-800">
              No Available Deliveries
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New orders will appear here when they are ready for pickup.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {deliveries.map((delivery) => {
              const myRequest = delivery.deliveryRequests?.[0];
              const hasPendingRequest = myRequest?.status === "PENDING";
              const isRequesting = requestingId === delivery.id;

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
                        {delivery.orderNumber}
                      </h3>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                      Ready for Pickup
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
                            {delivery.store.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {delivery.store.address}
                          </p>

                          {delivery.store.phone && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <Phone size={12} />
                              {delivery.store.phone}
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
                            {delivery.deliveryAddress}
                          </p>

                          <p className="text-sm text-slate-500">
                            {delivery.zone.barangay}, {delivery.zone.name}
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
                            {delivery.customer.name}
                          </p>

                          {delivery.customer.phone && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <Phone size={12} />
                              {delivery.customer.phone}
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
                            {delivery.items.map((item) => (
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

                  <div className="grid gap-4 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        Order Total
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        ₱{Number(delivery.totalAmount).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Delivery Fee
                      </p>

                      <p className="mt-1 text-lg font-bold text-green-700">
                        ₱{Number(delivery.deliveryFee).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Payment Method
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {delivery.payment?.method || "Not specified"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {delivery.payment?.status || ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
                    <Clock size={15} />
                    Order placed: {new Date(delivery.createdAt).toLocaleString("en-PH")}
                  </div>

                  <div className="border-t border-slate-100 p-5">
                    {hasPendingRequest ? (
                      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <Clock size={22} className="text-amber-600" />

                        <div>
                          <p className="font-semibold text-amber-800">
                            Request Pending
                          </p>

                          <p className="text-sm text-amber-700">
                            Your request has been submitted. Please wait for admin approval.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {myRequest?.status === "REJECTED" && (
                          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                            Your previous request was rejected. You may submit another request.
                          </div>
                        )}

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Message to Admin (Optional)
                        </label>

                        <textarea
                          rows={2}
                          maxLength={500}
                          value={messages[delivery.id] || ""}
                          onChange={(event) =>
                            setMessages((previous) => ({
                              ...previous,
                              [delivery.id]: event.target.value,
                            }))
                          }
                          placeholder="Add a message for the admin..."
                          disabled={requestingId !== null}
                          className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                        />

                        <p className="mt-1 text-right text-xs text-slate-400">
                          {(messages[delivery.id] || "").length}/500
                        </p>

                        <button
                          type="button"
                          onClick={() => handleRequestDelivery(delivery)}
                          disabled={requestingId !== null}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isRequesting ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Submitting Request...
                            </>
                          ) : (
                            <>
                              <Send size={18} />
                              Request Delivery
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
