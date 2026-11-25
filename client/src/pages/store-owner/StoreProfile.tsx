
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Store,
  MapPin,
  Phone,
  FileText,
  Tag,
  Save,
  RefreshCw,
  Menu,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Camera,
  Upload,
  ImagePlus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import StoreOwnerSidebar from "../../components/store-owner/StoreOwnerSidebar";
import ProfilePicture from "../../components/ProfilePicture";
import { useAuth } from "../../contexts/AuthContext";

import {
  storeProfileAPI,
  type StoreProfile,
  type UpdateStoreProfileInput,
} from "../../services/store-profile";

const categories: {
  value: StoreProfile["category"];
  label: string;
}[] = [
  { value: "GROCERY", label: "Grocery" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "WATER_STATION", label: "Water Station" },
  { value: "CONVENIENCE_STORE", label: "Convenience Store" },
  { value: "BAKERY", label: "Bakery" },
  { value: "OTHER", label: "Other" },
];

const statusConfig = {
  PENDING: {
    label: "Pending Approval",
    description: "Your store is waiting for administrator approval.",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-700",
  },
  APPROVED: {
    label: "Approved",
    description: "Your store has been approved and can operate.",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
  },
  REJECTED: {
    label: "Rejected",
    description: "Your store application was rejected. Review the reason below.",
    icon: XCircle,
    color: "bg-red-100 text-red-700",
  },
  SUSPENDED: {
    label: "Suspended",
    description: "Your store is currently suspended.",
    icon: AlertCircle,
    color: "bg-gray-100 text-gray-700",
  },
};

export default function StoreProfile() {
  const { user: authUser, updateUser } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [store, setStore] = useState<StoreProfile | null>(null);

  const [form, setForm] = useState<UpdateStoreProfileInput>({
    name: "",
    description: "",
    address: "",
    barangay: "",
    phone: "",
    category: "GROCERY",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // FETCH STORE PROFILE
  // ============================================

  const fetchStore = useCallback(async () => {
    try {
      setLoading(true);

      const response = await storeProfileAPI.getMyStore();

      console.log("STORE PROFILE RESPONSE:", response);

      setStore(response.store);

      setForm({
        name: response.store.name,
        description: response.store.description || "",
        address: response.store.address,
        barangay: response.store.barangay,
        phone: response.store.phone || "",
        category: response.store.category,
      });
    } catch (error: any) {
      console.error("Load store profile error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load store profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStore();
  }, [fetchStore]);

  // ============================================
  // CLEANUP PREVIEW URL
  // ============================================

  useEffect(() => {
    return () => {
      if (previewLogo?.startsWith("blob:")) {
        URL.revokeObjectURL(previewLogo);
      }
    };
  }, [previewLogo]);

  // ============================================
  // PROFILE PICTURE
  // ============================================

  const handleProfileImageChange = (image: string | null) => {
    if (authUser) {
      updateUser({
        ...authUser,
        profileImage: image,
      });
    }
  };

  // ============================================
  // FORM CHANGE
  // ============================================

  function handleChange(
    field: keyof UpdateStoreProfileInput,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // ============================================
  // SELECT STORE LOGO
  // ============================================

  function handleLogoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must not exceed 2MB.");
      event.target.value = "";
      return;
    }

    setSelectedLogo(file);
    setPreviewLogo(URL.createObjectURL(file));
  }

  // ============================================
  // CANCEL LOGO SELECTION
  // ============================================

  function cancelLogoSelection() {
    setSelectedLogo(null);
    setPreviewLogo(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // ============================================
  // UPLOAD STORE LOGO
  // ============================================

  async function handleLogoUpload() {
    if (!selectedLogo) {
      toast.error("Please select an image first.");
      return;
    }

    try {
      setUploadingLogo(true);

      console.log("UPLOADING STORE LOGO:", {
        name: selectedLogo.name,
        type: selectedLogo.type,
        size: selectedLogo.size,
      });

      const response = await storeProfileAPI.uploadLogo(selectedLogo);

      console.log("STORE LOGO UPLOAD RESPONSE:", response);

      setStore((previous) =>
        previous
          ? { ...previous, ...response.store }
          : previous
      );

      setSelectedLogo(null);
      setPreviewLogo(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success(
        response.message || "Store logo uploaded successfully."
      );
    } catch (error: any) {
      console.error("Store logo upload error:", error);
      console.error(
        "STORE LOGO UPLOAD RESPONSE:",
        error.response?.data
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to upload store logo."
      );
    } finally {
      setUploadingLogo(false);
    }
  }

  // ============================================
  // UPDATE STORE PROFILE
  // ============================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name?.trim() || form.name.trim().length < 2) {
      toast.error("Store name must contain at least 2 characters.");
      return;
    }

    if (!form.address?.trim() || form.address.trim().length < 5) {
      toast.error("Please enter a valid store address.");
      return;
    }

    if (!form.barangay?.trim() || form.barangay.trim().length < 2) {
      toast.error("Please enter your barangay.");
      return;
    }

    try {
      setSaving(true);

      const response = await storeProfileAPI.update({
        name: form.name.trim(),
        description: form.description?.trim() || null,
        address: form.address.trim(),
        barangay: form.barangay.trim(),
        phone: form.phone?.trim() || null,
        category: form.category,
      });

      setStore((previous) =>
        previous
          ? { ...previous, ...response.store }
          : response.store
      );

      setForm({
        name: response.store.name,
        description: response.store.description || "",
        address: response.store.address,
        barangay: response.store.barangay,
        phone: response.store.phone || "",
        category: response.store.category,
      });

      toast.success(response.message);
    } catch (error: any) {
      console.error("Update store profile error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to update store profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ============================================
  // STORE NOT FOUND
  // ============================================

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <Store className="mx-auto h-12 w-12 text-gray-400" />

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Store profile unavailable
          </h2>

          <button
            onClick={() => void fetchStore()}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // STORE STATUS
  // ============================================

  const StatusIcon = statusConfig[store.status].icon;
  const status = statusConfig[store.status];

  // ============================================
  // STORE LOGO URL
  // ============================================

  const currentLogo =
    previewLogo || storeProfileAPI.getLogoUrl(store.logo);

  console.log("STORE LOGO FROM DATABASE:", store.logo);
  console.log("STORE LOGO IMAGE URL:", currentLogo);

  // ============================================
  // PAGE UI
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 lg:ml-72">
      <StoreOwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Store Profile
            </h1>

            <p className="text-xs text-gray-500">
              Manage your store information
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* ====================================== */}
        {/* STORE OWNER PROFILE PICTURE */}
        {/* ====================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="font-bold text-gray-900">
              Store Owner Profile Picture
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage your personal account photo. This is separate from your store logo.
            </p>
          </div>

          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <ProfilePicture
              image={authUser?.profileImage}
              name={authUser?.name || "Store Owner"}
              onImageChange={handleProfileImageChange}
              size="lg"
              editable
            />

            <div className="text-center sm:text-left">
              <p className="font-semibold text-gray-800">
                {authUser?.name || "Store Owner"}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {authUser?.email || ""}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                JPG, PNG, or WEBP. Maximum file size: 5MB.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================== */}
        {/* STORE LOGO */}
        {/* ====================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Camera size={22} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Store Logo
              </h2>

              <p className="text-sm text-gray-500">
                Upload your store's brand image
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 sm:flex-row">

            {/* LOGO PREVIEW */}

            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
              {currentLogo ? (
                <img
                  src={currentLogo}
                  alt="Store logo preview"
                  className="block h-full w-full object-cover"
                  onLoad={() => {
                    console.log(
                      "STORE LOGO LOADED:",
                      currentLogo
                    );
                  }}
                  onError={(event) => {
                    console.error(
                      "STORE LOGO FAILED TO LOAD:",
                      currentLogo
                    );

                    console.error(
                      "IMAGE ERROR ELEMENT:",
                      event.currentTarget
                    );
                  }}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <ImagePlus className="mx-auto h-10 w-10" />

                  <p className="mt-2 text-xs">
                    No logo
                  </p>
                </div>
              )}
            </div>

            {/* LOGO UPLOAD CONTROLS */}

            <div className="w-full">
              <p className="font-semibold text-gray-800">
                {selectedLogo
                  ? selectedLogo.name
                  : "Store Brand Image"}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                JPG, PNG, or WEBP. Maximum file size: 2MB.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoChange}
                className="hidden"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Camera size={17} />
                  Choose Image
                </button>

                {selectedLogo && (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleLogoUpload()}
                      disabled={uploadingLogo}
                      className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      {uploadingLogo ? (
                        <RefreshCw
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Upload size={17} />
                      )}

                      {uploadingLogo
                        ? "Uploading..."
                        : "Upload Logo"}
                    </button>

                    <button
                      type="button"
                      onClick={cancelLogoSelection}
                      disabled={uploadingLogo}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <X size={17} />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ====================================== */}
        {/* APPROVAL STATUS */}
        {/* ====================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-3 ${status.color}`}>
                <StatusIcon size={23} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  {status.label}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {status.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <ShieldCheck size={18} />
              Store verification
            </div>
          </div>

          {store.status === "REJECTED" &&
            store.rejectionReason && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Rejection Reason
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {store.rejectionReason}
                </p>
              </div>
            )}
        </section>

        {/* ====================================== */}
        {/* STORE INFORMATION FORM */}
        {/* ====================================== */}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASIC INFORMATION */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Store size={22} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Basic Information
                </h2>

                <p className="text-sm text-gray-500">
                  Your store's identity and description
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Store Name *
                </label>

                <input
                  type="text"
                  value={form.name || ""}
                  onChange={(e) =>
                    handleChange("name", e.target.value)
                  }
                  maxLength={150}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your store name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Store Description
                </label>

                <textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    handleChange("description", e.target.value)
                  }
                  rows={4}
                  maxLength={1000}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Describe your store..."
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {(form.description || "").length}/1000
                </p>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Tag size={16} />
                  Store Category *
                </label>

                <select
                  value={form.category || "GROCERY"}
                  onChange={(e) =>
                    handleChange("category", e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {categories.map((category) => (
                    <option
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* CONTACT INFORMATION */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <MapPin size={22} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Contact and Location
                </h2>

                <p className="text-sm text-gray-500">
                  Your store's contact details and address
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Store Address *
                </label>

                <input
                  type="text"
                  value={form.address || ""}
                  onChange={(e) =>
                    handleChange("address", e.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Street, building, or landmark"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Barangay *
                </label>

                <input
                  type="text"
                  value={form.barangay || ""}
                  onChange={(e) =>
                    handleChange("barangay", e.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter barangay"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Phone size={16} />
                  Store Phone Number
                </label>

                <input
                  type="tel"
                  value={form.phone || ""}
                  onChange={(e) =>
                    handleChange("phone", e.target.value)
                  }
                  maxLength={20}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="09XXXXXXXXX"
                />
              </div>
            </div>
          </section>

          {/* STORE ACCOUNT INFORMATION */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <FileText size={22} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Store Account Information
                </h2>

                <p className="text-sm text-gray-500">
                  Read-only store identification
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">
                  Store ID
                </p>

                <p className="mt-2 break-all text-sm font-semibold text-gray-800">
                  {store.id}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">
                  Store Slug
                </p>

                <p className="mt-2 break-all text-sm font-semibold text-gray-800">
                  {store.slug}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">
                  Account Status
                </p>

                <p className="mt-2 text-sm font-semibold text-gray-800">
                  {store.isActive ? "Active" : "Inactive"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">
                  Last Updated
                </p>

                <p className="mt-2 text-sm font-semibold text-gray-800">
                  {new Date(store.updatedAt).toLocaleDateString(
                    "en-PH",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* SAVE CHANGES */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => void fetchStore()}
              disabled={saving || uploadingLogo}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Reset Changes
            </button>

            <button
              type="submit"
              disabled={saving || uploadingLogo}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
