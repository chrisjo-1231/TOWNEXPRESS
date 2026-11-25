
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  Store,
  CreditCard,
  Truck,
  Clock,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  customerMyOrdersAPI,
  type CustomerOrder,
} from "../../services/customer-my-orders";

export default function CustomerOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        toast.error("Invalid order ID.");
        navigate("/customer/my-orders");
        return;
      }

      try {
        setLoading(true);
        const data = await customerMyOrdersAPI.getById(id);
        setOrder(data);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error.response?.data?.message || "Failed to load order details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const formatCurrency = (amount: number) =>
    `₱${Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-orange-500" size={35} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <Package className="mx-auto text-slate-300" size={50} />
          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Order not found
          </h2>
          <button
            onClick={() => navigate("/customer/my-orders")}
            className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
          <button
            onClick={() => navigate("/customer/my-orders")}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-500"
          >
            <ArrowLeft size={18} />
            Back to My Orders
          </button>

          <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Order Number
              </p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">
                {order.orderNumber}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                <Clock className="mr-1 inline" size={15} />
                {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <span
                className={`rounded-full px-4 py-2 text-xs font-extrabold ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.replaceAll("_", " ")}
              </span>

              <button
                onClick={() => navigate(`/customer/tracking/${order.id}`)}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                <Truck size={17} />
                Track Order
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5">
                  <h2 className="flex items-center gap-2 font-bold text-slate-900">
                    <ShoppingBag className="text-orange-500" size={20} />
                    Ordered Products
                  </h2>
                </div>

                <div className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-5"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="text-slate-400" size={25} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-800">
                          {item.product.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatCurrency(item.unitPrice)} each
                        </p>
                      </div>

                      <p className="font-extrabold text-slate-900">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                  <MapPin className="text-orange-500" size={20} />
                  Delivery Information
                </h2>

                <p className="text-sm text-slate-500">Delivery Address</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {order.deliveryAddress}
                </p>

                {order.zone && (
                  <p className="mt-2 text-sm text-slate-500">
                    Delivery Zone: {order.zone.barangay}
                  </p>
                )}

                {order.delivery?.notes && (
                  <p className="mt-3 text-sm text-slate-600">
                    Delivery Notes: {order.delivery.notes}
                  </p>
                )}
              </section>

              <section className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-bold text-slate-900">
                  Order Status History
                </h2>

                <div className="space-y-4">
                  {order.statusHistory.map((history) => (
                    <div key={history.id} className="flex gap-3">
                      <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-orange-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {history.status.replaceAll("_", " ")}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(history.createdAt)}
                        </p>
                        {history.remarks && (
                          <p className="mt-1 text-sm text-slate-600">
                            {history.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                  <Store className="text-orange-500" size={20} />
                  Store Information
                </h2>

                <p className="font-bold text-slate-800">
                  {order.store.name}
                </p>
              </section>

              <section className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                  <CreditCard className="text-orange-500" size={20} />
                  Payment Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3 text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>

                  <div className="flex justify-between gap-3 text-slate-500">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(order.deliveryFee)}</span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex justify-between gap-3 text-base font-black text-slate-900">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>

                  {order.payment && (
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-slate-500">Payment Method</p>
                      <p className="mt-1 font-bold text-slate-800">
                        {order.payment.method}
                      </p>

                      <p className="mt-3 text-slate-500">Payment Status</p>
                      <p className="mt-1 font-bold text-orange-600">
                        {order.payment.status}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
