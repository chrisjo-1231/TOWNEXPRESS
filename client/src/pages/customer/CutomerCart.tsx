
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Package,
  Store,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  cartService,
  type Cart,
} from "../../services/cart";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getImageUrl = (image?: string | null) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const serverURL = API_URL.replace(/\/api\/?$/, "");
  return `${serverURL}${image.startsWith("/") ? image : `/${image}`}`;
};

const formatPrice = (price: number) =>
  `₱${price.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function CustomerCart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState<Cart>({
    items: [],
  });

  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    setCart(cartService.getCart());
  }, []);

  const subtotal = cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const itemCount = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const updateQuantity = (productId: string, quantity: number) => {
    try {
      const updatedCart = cartService.updateQuantity(
        productId,
        quantity
      );

      setCart(updatedCart);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update quantity."
      );
    }
  };

  const removeItem = (productId: string) => {
    setRemovingId(productId);

    const updatedCart = cartService.removeItem(productId);

    setCart(updatedCart);
    setRemovingId(null);

    toast.success("Product removed from cart.");
  };

  const clearCart = () => {
    if (cart.items.length === 0) return;

    if (!window.confirm("Are you sure you want to clear your cart?")) {
      return;
    }

    setCart(cartService.clearCart());
    toast.success("Cart cleared.");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/customer/stores")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white">
              <ShoppingBag size={23} />
            </div>

            <div className="text-left">
              <h1 className="text-xl font-extrabold text-slate-900">
                TownExpress
              </h1>
              <p className="text-xs text-slate-500">
                Your Shopping Cart
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/customer/stores")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-orange-300 hover:text-orange-600"
          >
            <Store size={17} />
            <span className="hidden sm:inline">Browse Stores</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate("/customer/customerdashboard")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-600"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </button>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                My Shopping Cart
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Review your selected products before checkout.
              </p>
            </div>

            {cart.items.length > 0 && (
              <button
                onClick={clearCart}
                className="inline-flex items-center gap-2 self-start text-sm font-semibold text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {cart.items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
              <ShoppingCart size={38} className="text-orange-400" />
            </div>

            <h3 className="mt-6 text-xl font-extrabold text-slate-900">
              Your cart is empty
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              You haven't added any products yet. Explore local stores and
              find something you like.
            </p>

            <button
              onClick={() => navigate("/customer/browse-stores")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              <ShoppingBag size={17} />
              Browse Stores
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-5 lg:col-span-2">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4">
                <span className="font-bold text-slate-800">
                  Cart Items
                </span>

                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                  {itemCount} item(s)
                </span>
              </div>

              {/* Store Information */}
              {cart.items[0] && (
                <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white">
                    {cart.items[0].store.logo ? (
                      <img
                        src={getImageUrl(cart.items[0].store.logo)}
                        alt={cart.items[0].store.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store size={20} className="text-orange-500" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-orange-600">
                      Shopping from
                    </p>
                    <p className="font-bold text-slate-900">
                      {cart.items[0].store.name}
                    </p>
                  </div>
                </div>
              )}

              {cart.items.map((item) => (
                <div
                  key={item.product.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 sm:w-28">
                      {item.product.image ? (
                        <img
                          src={getImageUrl(item.product.image)}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package size={35} className="text-slate-300" />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {item.product.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {item.product.description ||
                              "No description available."}
                          </p>

                          <p className="mt-2 text-sm font-bold text-orange-600">
                            {formatPrice(item.product.price)} each
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item.product.id)}
                          disabled={removingId === item.product.id}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center rounded-lg border border-slate-200">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1
                              )
                            }
                            className="p-2.5 text-slate-600 hover:bg-slate-50"
                            title="Decrease quantity"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="min-w-10 text-center text-sm font-bold text-slate-900">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              item.quantity >= item.product.stock
                            }
                            className="p-2.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Increase quantity"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <p className="font-extrabold text-slate-900">
                          {formatPrice(
                            item.product.price * item.quantity
                          )}
                        </p>
                      </div>

                      <p className="text-xs text-slate-400">
                        Available stock: {item.product.stock}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <h3 className="text-lg font-extrabold text-slate-900">
                Order Summary
              </h3>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Items ({itemCount})
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Delivery Fee
                  </span>
                  <span className="font-semibold text-slate-800">
                    Calculated at checkout
                  </span>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Subtotal
                    </span>
                    <span className="text-xl font-extrabold text-orange-600">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>
              </div>

             <button
  type="button"
  onClick={() => navigate("/customer/checkout")}
  disabled={cart.items.length === 0}
  className="w-full rounded-xl bg-orange-500 px-4 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
>
  Proceed to Checkout
</button>

              <p className="mt-3 text-center text-xs text-slate-400">
                Checkout will be available in the next module.
              </p>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs leading-5 text-slate-500">
                  Your cart is saved in this browser. Product availability
                  and prices will be checked again during checkout.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
