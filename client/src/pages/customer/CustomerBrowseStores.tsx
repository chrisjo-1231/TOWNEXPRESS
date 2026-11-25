
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Store,
  MapPin,
  Phone,
  Package,
  ShoppingBag,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

import {
  customerStoreAPI,
  type CustomerStore,
  type CustomerProduct,
} from "../../services/customer-store";
import toast from "react-hot-toast";
import { cartService } from "../../services/cart";

const categories = [
  { value: "ALL", label: "All Stores" },
  { value: "GROCERY", label: "Grocery" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "WATER_STATION", label: "Water Station" },
  { value: "CONVENIENCE_STORE", label: "Convenience Store" },
  { value: "BAKERY", label: "Bakery" },
  { value: "OTHER", label: "Others" },
];

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

const formatCategory = (category: string) => {
  return category
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function CustomerBrowseStores() {
  const [stores, setStores] = useState<CustomerStore[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStore, setSelectedStore] =
    useState<CustomerStore | null>(null);

  const [products, setProducts] = useState<CustomerProduct[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");

  const loadStores = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await customerStoreAPI.getStores({
        search: search.trim() || undefined,
        category: category === "ALL" ? undefined : category,
      });

      setStores(response.stores || []);
    } catch (err: any) {
      console.error("Load stores error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load stores. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadStores();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, category]);

  const loadProducts = async (
    storeId: string,
    searchTerm = ""
  ) => {
    try {
      setProductsLoading(true);
      setProductsError("");

      const response = await customerStoreAPI.getStoreProducts(
        storeId,
        searchTerm.trim() || undefined
      );

      setProducts(response.products || []);
    } catch (err: any) {
      console.error("Load products error:", err);

      setProductsError(
        err.response?.data?.message ||
          "Unable to load products. Please try again."
      );

      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const openStore = async (store: CustomerStore) => {
    setSelectedStore(store);
    setProductSearch("");
    setProducts([]);
    await loadProducts(store.id);
  };

  const closeStore = () => {
    setSelectedStore(null);
    setProducts([]);
    setProductSearch("");
    setProductsError("");
  };

  useEffect(() => {
    if (!selectedStore) return;

    const timeout = setTimeout(() => {
      loadProducts(selectedStore.id, productSearch);
    }, 300);

    return () => clearTimeout(timeout);
  }, [productSearch]);

  const filteredStores = useMemo(() => stores, [stores]);


const handleAddToCart = (product: CustomerProduct) => {
  if (!selectedStore) return;

  try {
    cartService.addItem(product, {
      id: selectedStore.id,
      name: selectedStore.name,
      logo: selectedStore.logo,
    });

    toast.success(`${product.name} added to cart!`);
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : "Unable to add product to cart."
    );
  }
};
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white">
              <ShoppingBag size={23} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                TownExpress
              </h1>
              <p className="text-xs text-slate-500">
                Discover local stores
              </p>
            </div>
          </div>

          <span className="hidden rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 sm:inline-flex">
            Customer Marketplace
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {selectedStore ? (
          <>
            {/* Store Products View */}
            <button
              onClick={closeStore}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600"
            >
              <ArrowLeft size={18} />
              Back to stores
            </button>

            <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-50">
                  {selectedStore.logo ? (
                    <img
                      src={getImageUrl(selectedStore.logo)}
                      alt={selectedStore.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store size={38} className="text-orange-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="mb-2 inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                    {formatCategory(selectedStore.category)}
                  </span>

                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {selectedStore.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedStore.description ||
                      "Welcome! Browse our available products."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={15} />
                      {selectedStore.address}
                    </span>

                    {selectedStore.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={15} />
                        {selectedStore.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Store Products
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Browse available products from this store.
                </p>
              </div>

              <div className="relative w-full sm:max-w-sm">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            {productsLoading ? (
              <div className="flex min-h-48 items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={32} />
              </div>
            ) : productsError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <p className="font-semibold text-red-600">
                  {productsError}
                </p>
                <button
                  onClick={() =>
                    loadProducts(selectedStore.id, productSearch)
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <Package size={42} className="mx-auto text-slate-300" />
                <h3 className="mt-4 font-bold text-slate-800">
                  No products found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  This store has no available products matching your search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex h-44 items-center justify-center overflow-hidden bg-slate-100">
                      {product.image ? (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package size={44} className="text-slate-300" />
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-slate-900">
                        {product.name}
                      </h3>

                      <p className="mt-1 min-h-10 text-sm text-slate-500">
                        {product.description || "No description available."}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-extrabold text-orange-600">
                          ₱{product.price.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>

                        <span className="text-xs text-slate-500">
                          Stock: {product.stock}
                        </span>
                      </div>
                      <button
  type="button"
  onClick={() => handleAddToCart(product)}
  disabled={!product.isAvailable || product.stock <= 0}
  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
>
  <ShoppingBag size={17} />
  Add to Cart
</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Marketplace Heading */}
            <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-10 text-white sm:px-10">
              <p className="text-sm font-semibold text-orange-100">
                YOUR LOCAL MARKETPLACE
              </p>

              <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                Discover Local Stores
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-orange-50 sm:text-base">
                Explore local businesses in your municipality and discover
                products available near you.
              </p>
            </div>

            {/* Search */}
            <div className="mb-7">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Search stores
              </label>

              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search store name or barangay..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="mb-3 text-sm font-bold text-slate-700">
                Store Categories
              </h3>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setCategory(item.value)}
                    className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                      category === item.value
                        ? "bg-orange-500 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Store List */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Available Stores
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {loading
                    ? "Loading stores..."
                    : `${filteredStores.length} store(s) found`}
                </p>
              </div>

              <button
                onClick={loadStores}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="text-center">
                  <Loader2
                    size={36}
                    className="mx-auto animate-spin text-orange-500"
                  />
                  <p className="mt-3 text-sm text-slate-500">
                    Loading available stores...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <p className="font-semibold text-red-600">{error}</p>

                <button
                  onClick={loadStores}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Try Again
                </button>
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <Store size={44} className="mx-auto text-slate-300" />
                <h3 className="mt-4 font-bold text-slate-800">
                  No stores found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try another search term or category.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("ALL");
                  }}
                  className="mt-4 font-semibold text-orange-600 hover:text-orange-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => openStore(store)}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
                  >
                    <div className="flex h-44 items-center justify-center overflow-hidden bg-orange-50">
                      {store.logo ? (
                        <img
                          src={getImageUrl(store.logo)}
                          alt={store.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <Store
                          size={52}
                          className="text-orange-300"
                        />
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                          {formatCategory(store.category)}
                        </span>

                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Package size={14} />
                          {store._count?.products ?? 0} products
                        </span>
                      </div>

                      <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-orange-600">
                        {store.name}
                      </h4>

                      <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500">
                        {store.description ||
                          "Explore this local store and its available products."}
                      </p>

                      <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">
                        <MapPin size={16} className="mt-0.5 shrink-0" />
                        <span>
                          {store.barangay
                            ? `${store.barangay}, ${store.address}`
                            : store.address}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-sm font-bold text-orange-600">
                          View Products
                        </span>
                        <ShoppingBag
                          size={18}
                          className="text-orange-500"
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
