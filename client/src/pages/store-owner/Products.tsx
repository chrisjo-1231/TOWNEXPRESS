
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Menu,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  productAPI,
  type Product,
  type ProductInput,
} from "../../services/product";

import StoreOwnerSidebar from "../../components/store-owner/StoreOwnerSidebar";

const emptyForm: ProductInput = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  image: "",
  isAvailable: true,
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] = useState<ProductInput>({
    ...emptyForm,
  });

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  // SIDEBAR STATE
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ============================================
  // FETCH PRODUCTS
  // ============================================

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await productAPI.getAll();

      setProducts(response.products || []);
    } catch (error: any) {
      console.error("FETCH PRODUCTS ERROR:", error);
      console.error("API RESPONSE:", error.response?.data);
      console.error("STATUS CODE:", error.response?.status);

      toast.error(
        error.response?.data?.message ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  // ============================================
  // SEARCH
  // ============================================

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.description?.toLowerCase().includes(keyword)
    );
  }, [products, search]);

  // ============================================
  // ADD PRODUCT
  // ============================================

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  // ============================================
  // EDIT PRODUCT
  // ============================================

  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      image: product.image || "",
      isAvailable: product.isAvailable,
    });

    setShowModal(true);
  };

  // ============================================
  // CLOSE MODAL
  // ============================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingProduct(null);
    setForm({ ...emptyForm });
  };

  // ============================================
  // SAVE PRODUCT
  // ============================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    if (Number(form.price) <= 0) {
      toast.error("Price must be greater than zero.");
      return;
    }

    if (
      Number(form.stock) < 0 ||
      !Number.isInteger(Number(form.stock))
    ) {
      toast.error(
        "Stock must be a non-negative whole number."
      );
      return;
    }

    const payload: ProductInput = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image?.trim() || null,
      isAvailable: Boolean(form.isAvailable),
    };

    try {
      setSaving(true);

      if (editingProduct) {
        await productAPI.update(
          editingProduct.id,
          payload
        );

        toast.success("Product updated successfully!");
      } else {
        await productAPI.create(payload);

        toast.success("Product added successfully!");
      }

      setShowModal(false);
      setEditingProduct(null);
      setForm({ ...emptyForm });

      await fetchProducts();
    } catch (error: any) {
      console.error("SAVE PRODUCT ERROR:", error);
      console.error("API RESPONSE:", error.response?.data);

      toast.error(
        error.response?.data?.message ||
          "Failed to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // DELETE PRODUCT
  // ============================================

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(product.id);

      await productAPI.delete(product.id);

      toast.success("Product deleted successfully!");

      await fetchProducts();
    } catch (error: any) {
      console.error("DELETE PRODUCT ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================
  // UPDATE AVAILABILITY
  // ============================================

  const handleAvailability = async (product: Product) => {
    try {
      await productAPI.update(product.id, {
        isAvailable: !product.isAvailable,
      });

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                isAvailable: !item.isAvailable,
              }
            : item
        )
      );

      toast.success("Product availability updated.");
    } catch (error: any) {
      console.error("UPDATE AVAILABILITY ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update availability."
      );
    }
  };

  // ============================================
  // PRODUCT STATISTICS
  // ============================================

  const totalProducts = products.length;

  const availableProducts = products.filter(
    (product) => product.isAvailable
  ).length;

  const lowStockProducts = products.filter(
    (product) => product.stock > 0 && product.stock <= 5
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stock === 0
  ).length;

  // ============================================
  // MAIN UI
  // ============================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <StoreOwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div className="min-h-screen lg:ml-72">

        {/* TOP HEADER */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">

          <div className="flex items-center gap-3">

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                TownExpress
              </h2>

              <p className="text-xs text-slate-500">
                Store Owner Portal
              </p>
            </div>

          </div>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">
              Store Management
            </p>

            <p className="text-xs text-slate-500">
              Manage your products and inventory
            </p>
          </div>

        </header>

        {/* PAGE CONTENT */}

        <main className="p-4 sm:p-6 lg:p-8">

          <div className="mx-auto max-w-7xl space-y-6">

            {/* ======================================
                PAGE TITLE
            ====================================== */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Products
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your store products, prices, and inventory.
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
              >
                <Plus size={19} />
                Add Product
              </button>

            </div>

            {/* ======================================
                STATISTICS
            ====================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Total Products"
                value={totalProducts}
                icon={<Package size={21} />}
              />

              <StatCard
                title="Available"
                value={availableProducts}
                icon={<CheckCircle size={21} />}
              />

              <StatCard
                title="Low Stock"
                value={lowStockProducts}
                icon={<AlertCircle size={21} />}
              />

              <StatCard
                title="Out of Stock"
                value={outOfStockProducts}
                icon={<Package size={21} />}
              />

            </div>

            {/* ======================================
                SEARCH
            ====================================== */}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

              <div className="flex flex-col gap-3 sm:flex-row">

                <div className="relative flex-1">

                  <Search
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                </div>

                <button
                  onClick={fetchProducts}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={loading ? "animate-spin" : ""}
                  />

                  Refresh
                </button>

              </div>

            </div>

            {/* ======================================
                PRODUCT TABLE
            ====================================== */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-4">

                <h2 className="font-bold text-gray-900">
                  Product Inventory
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredProducts.length} product(s) found
                </p>

              </div>

              {loading ? (

                <div className="flex min-h-64 items-center justify-center">

                  <Loader2
                    className="animate-spin text-orange-600"
                    size={32}
                  />

                </div>

              ) : filteredProducts.length === 0 ? (

                <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">

                  <Package
                    size={45}
                    className="mb-3 text-gray-300"
                  />

                  <h3 className="font-semibold text-gray-800">
                    {search
                      ? "No matching products"
                      : "No products yet"}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {search
                      ? "Try another search keyword."
                      : "Start adding products to your store."}
                  </p>

                  {!search && (
                    <button
                      onClick={openAddModal}
                      className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                    >
                      Add your first product
                    </button>
                  )}

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[850px] text-left">

                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">

                      <tr>
                        <th className="px-5 py-4">Product</th>
                        <th className="px-5 py-4">Price</th>
                        <th className="px-5 py-4">Stock</th>
                        <th className="px-5 py-4">Availability</th>
                        <th className="px-5 py-4 text-right">
                          Actions
                        </th>
                      </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-100">

                      {filteredProducts.map((product) => (

                        <tr
                          key={product.id}
                          className="hover:bg-gray-50"
                        >

                          {/* PRODUCT */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              {product.image ? (

                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-12 w-12 rounded-xl border border-gray-200 object-cover"
                                />

                              ) : (

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                  <ImageIcon size={21} />
                                </div>

                              )}

                              <div>

                                <p className="font-semibold text-gray-900">
                                  {product.name}
                                </p>

                                <p className="max-w-xs truncate text-xs text-gray-500">
                                  {product.description || "No description"}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* PRICE */}

                          <td className="px-5 py-4 font-semibold text-gray-800">
                            ₱
                            {product.price.toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                            })}
                          </td>

                          {/* STOCK */}

                          <td className="px-5 py-4">

                            <span
                              className={`font-medium ${
                                product.stock === 0
                                  ? "text-red-600"
                                  : product.stock <= 5
                                    ? "text-amber-600"
                                    : "text-gray-700"
                              }`}
                            >
                              {product.stock}
                            </span>

                            {product.stock === 0 && (
                              <span className="ml-2 text-xs text-red-500">
                                Out of stock
                              </span>
                            )}

                            {product.stock > 0 &&
                              product.stock <= 5 && (
                                <span className="ml-2 text-xs text-amber-600">
                                  Low stock
                                </span>
                              )}

                          </td>

                          {/* AVAILABILITY */}

                          <td className="px-5 py-4">

                            <button
                              onClick={() =>
                                handleAvailability(product)
                              }
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                product.isAvailable
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {product.isAvailable
                                ? "Available"
                                : "Unavailable"}
                            </button>

                          </td>

                          {/* ACTIONS */}

                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                onClick={() =>
                                  openEditModal(product)
                                }
                                title="Edit product"
                                className="rounded-lg border border-gray-200 p-2 text-blue-600 hover:bg-blue-50"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(product)
                                }
                                disabled={
                                  deletingId === product.id
                                }
                                title="Delete product"
                                className="rounded-lg border border-gray-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                {deletingId === product.id ? (

                                  <Loader2
                                    size={17}
                                    className="animate-spin"
                                  />

                                ) : (

                                  <Trash2 size={17} />

                                )}
                              </button>

                            </div>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </div>

        </main>

      </div>

      {/* ======================================
          ADD / EDIT MODAL
      ====================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  {editingProduct
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter your product information below.
                </p>

              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-6"
            >

              {/* PRODUCT NAME */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Product Name *
                </label>

                <input
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Coca-Cola 1.5L"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your product..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

              </div>

              {/* PRICE AND STOCK */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Price (₱) *
                  </label>

                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                </div>

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Stock *
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                </div>

              </div>

              {/* IMAGE URL */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Product Image URL
                </label>

                <input
                  type="url"
                  value={form.image || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image: e.target.value,
                    })
                  }
                  placeholder="https://example.com/product.jpg"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

              </div>

              {/* AVAILABILITY */}

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4">

                <input
                  type="checkbox"
                  checked={Boolean(form.isAvailable)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isAvailable: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-orange-600"
                />

                <div>

                  <p className="text-sm font-semibold text-gray-800">
                    Product is available
                  </p>

                  <p className="text-xs text-gray-500">
                    Customers can see this product as available.
                  </p>

                </div>

              </label>

              {/* FORM BUTTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                >

                  {saving && (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  {editingProduct
                    ? "Save Changes"
                    : "Add Product"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>

        <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-2xl font-bold text-gray-900">
        {value}
      </p>

    </div>
  );
}
