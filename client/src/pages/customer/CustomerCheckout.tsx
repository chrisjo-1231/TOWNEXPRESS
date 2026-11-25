
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ShoppingBag,
  Truck,
  CreditCard,
  Loader2,
  CheckCircle2,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

import { cartService } from "../../services/cart";
import {
  customerOrderAPI,
  type DeliveryZone,
  type CustomerPaymentMethod,
} from "../../services/customer-order";

export default function CustomerCheckout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => cartService.getCart());
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<CustomerPaymentMethod>("COD");

  const [loadingZones, setLoadingZones] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState("");

  const subtotal = useMemo(
    () =>
      cart.items.reduce(
        (total, item) =>
          total + item.product.price * item.quantity,
        0
      ),
    [cart.items]
  );

  const selectedZone = zones.find(
    (zone) => zone.id === selectedZoneId
  );

  const deliveryFee = selectedZone?.deliveryFee ?? 0;
  const totalAmount = subtotal + deliveryFee;

  const store = cart.items[0]?.store;

  // ============================================
  // LOAD DELIVERY ZONES
  // ============================================

  useEffect(() => {
    let active = true;

    async function loadZones() {
      try {
        const result = await customerOrderAPI.getDeliveryZones();

        if (!active) return;

        setZones(result);
      } catch (error) {
        console.error("LOAD DELIVERY ZONES ERROR:", error);
        toast.error("Failed to load delivery zones.");
      } finally {
        if (active) {
          setLoadingZones(false);
        }
      }
    }

    loadZones();

    return () => {
      active = false;
    };
  }, []);

  // ============================================
  // PLACE ORDER
  // ============================================

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0 || !store) {
      toast.error("Your cart is empty.");
      return;
    }

    if (deliveryAddress.trim().length < 10) {
      toast.error("Please enter a complete delivery address.");
      return;
    }

    if (!selectedZoneId) {
      toast.error("Please select your delivery barangay.");
      return;
    }

    try {
      setPlacingOrder(true);

      const order = await customerOrderAPI.checkout({
        storeId: store.id,
        zoneId: selectedZoneId,
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim() || undefined,
        paymentMethod,
        items: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      cartService.clearCart();
      setCart({ items: [] });
      setCompletedOrderNumber(order.orderNumber);

      toast.success("Your order has been placed successfully!");
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);

      const apiError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(
        apiError.response?.data?.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // ============================================
  // SUCCESS SCREEN
  // ============================================

  if (completedOrderNumber) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2
              size={42}
              className="text-green-600"
            />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900">
            Order Placed Successfully!
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Thank you for shopping with TownExpress.
            Your order has been submitted and is waiting
            for store confirmation.
          </p>

          <div className="mt-6 rounded-2xl bg-orange-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
              Order Number
            </p>

            <p className="mt-2 text-xl font-extrabold text-slate-900">
              {completedOrderNumber}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/customer/dashboard")}
            className="mt-7 w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // EMPTY CART
  // ============================================

  if (cart.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <ShoppingBag
            size={55}
            className="mx-auto text-slate-300"
          />

          <h1 className="mt-5 text-xl font-extrabold text-slate-900">
            Your cart is empty
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Add some products before proceeding to checkout.
          </p>

          <button
            type="button"
            onClick={() => navigate("/customer/stores")}
            className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
          >
            Browse Stores
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // CHECKOUT PAGE
  // ============================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={() => navigate("/customer/cart")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600"
          >
            <ArrowLeft size={19} />
            Back to Cart
          </button>

          <h1 className="text-xl font-extrabold text-orange-600">
            TownExpress
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Complete your delivery information and place your order.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT SECTION */}
          <div className="space-y-6 lg:col-span-2">
            {/* DELIVERY INFORMATION */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-orange-100 p-3">
                  <MapPin className="text-orange-600" size={22} />
                </div>

                <div>
                  <h2 className="font-extrabold text-slate-900">
                    Delivery Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Delivery Barangay
                  </label>

                  <select
                    value={selectedZoneId}
                    onChange={(e) =>
                      setSelectedZoneId(e.target.value)
                    }
                    disabled={loadingZones || zones.length === 0}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 disabled:bg-slate-100"
                  >
                    <option value="">
                      {loadingZones
                        ? "Loading delivery zones..."
                        : zones.length === 0
                          ? "No delivery zones available"
                          : "Select your barangay"}
                    </option>

                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.barangay} - ₱
                        {zone.deliveryFee.toFixed(2)}
                      </option>
                    ))}
                  </select>

                  {!loadingZones && zones.length === 0 && (
                    <p className="mt-2 text-xs text-red-500">
                      No active delivery zones found. Please contact the administrator.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Complete Delivery Address
                  </label>

                  <textarea
                    value={deliveryAddress}
                    onChange={(e) =>
                      setDeliveryAddress(e.target.value)
                    }
                    rows={4}
                    maxLength={500}
                    placeholder="House number, street, barangay, municipality, and landmarks..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Include landmarks to help the rider find your location.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Additional Notes (Optional)
                  </label>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    maxLength={500}
                    placeholder="Delivery instructions..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </section>

            {/* PAYMENT METHOD */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3">
                  <CreditCard className="text-blue-600" size={22} />
                </div>

                <div>
                  <h2 className="font-extrabold text-slate-900">
                    Payment Method
                  </h2>

                  <p className="text-sm text-slate-500">
                    Choose how you want to pay.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: "COD",
                    title: "Cash on Delivery",
                    description: "Pay when your order arrives.",
                  },
                  {
                    value: "CASH",
                    title: "Cash",
                    description: "Cash payment arrangement.",
                  },
                  {
                    value: "GCASH",
                    title: "GCash",
                    description: "GCash payment option. Actual payment integration is not yet enabled.",
                  },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      paymentMethod === method.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-slate-200 hover:border-orange-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() =>
                        setPaymentMethod(
                          method.value as CustomerPaymentMethod
                        )
                      }
                      className="mt-1 accent-orange-500"
                    />

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {method.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {method.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT SECTION */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-extrabold text-slate-900">
              Order Summary
            </h2>

            {/* STORE */}
            {store && (
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="rounded-lg bg-orange-100 p-2">
                  <Package className="text-orange-600" size={20} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Store
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    {store.name}
                  </p>
                </div>
              </div>
            )}

            {/* ITEMS */}
            <div className="mt-5 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {item.product.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      ₱{item.product.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-slate-900">
                    ₱
                    {(
                      item.product.price * item.quantity
                    ).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-5 border-t border-dashed border-slate-200" />

            {/* TOTALS */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold">
                  ₱{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <Truck size={16} />
                  Delivery Fee
                </span>

                <span className="font-semibold">
                  ₱{deliveryFee.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">
                    Total Amount
                  </span>

                  <span className="text-xl font-extrabold text-orange-600">
                    ₱{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* PLACE ORDER */}
<button
  type="button"
  onClick={handlePlaceOrder}
  disabled={placingOrder || loadingZones || !selectedZoneId}
  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-4 text-sm font-extrabold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
>
  {placingOrder ? (
    <>
      <Loader2 size={19} className="animate-spin" />
      Placing Order...
    </>
  ) : (
    <>
      <ShoppingBag size={19} />
      Place Order
    </>
  )}
</button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Your order will be submitted to the store for confirmation.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
