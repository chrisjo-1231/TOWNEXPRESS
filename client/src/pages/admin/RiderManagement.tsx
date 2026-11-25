
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  Truck,
  User,
  Mail,
  Phone,
  Bike,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../../services/auth";

type Availability = "AVAILABLE" | "BUSY" | "OFFLINE";

interface Rider {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  riderProfile: {
    id: string;
    vehicleType: string;
    plateNumber?: string | null;
    availability: Availability;
    _count?: {
      deliveries: number;
    };
  } | null;
}

interface RiderForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  vehicleType: string;
  plateNumber: string;
}

const initialForm: RiderForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  vehicleType: "Motorcycle",
  plateNumber: "",
};

export default function RiderManagement() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [availability, setAvailability] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<RiderForm>(initialForm);

  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchRiders = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params: Record<string, string> = {};

      if (search.trim()) params.search = search.trim();
      if (status !== "ALL") params.status = status;
      if (availability !== "ALL") {
        params.availability = availability;
      }

      const response = await authAPI.get("/admin/riders", { params });

      setRiders(response.data.riders || []);
    } catch (error: any) {
      console.error("Fetch riders error:", error);
      toast.error(
        error.response?.data?.message || "Unable to load riders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, status, availability]);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  function updateForm(
    field: keyof RiderForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleCreateRider(e: FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);

      await authAPI.post("/admin/riders", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        vehicleType: form.vehicleType.trim(),
        plateNumber: form.plateNumber.trim() || undefined,
      });

      toast.success("Rider registered successfully!");

      setShowModal(false);
      setForm(initialForm);

      await fetchRiders(true);
    } catch (error: any) {
      console.error("Create rider error:", error);
      toast.error(
        error.response?.data?.message || "Failed to register rider."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(rider: Rider) {
    const nextStatus = !rider.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus ? "activate" : "deactivate"
      } ${rider.name}?`
    );

    if (!confirmed) return;

    try {
      await authAPI.patch(`/admin/riders/${rider.id}/status`, {
        isActive: nextStatus,
      });

      toast.success(
        `Rider ${nextStatus ? "activated" : "deactivated"} successfully.`
      );

      await fetchRiders(true);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Unable to update rider status."
      );
    }
  }

  async function handleAvailabilityChange(
    rider: Rider,
    newAvailability: Availability
  ) {
    if (!rider.riderProfile) return;

    try {
      await authAPI.patch(
        `/admin/riders/${rider.id}/availability`,
        {
          availability: newAvailability,
        }
      );

      toast.success("Rider availability updated.");

      await fetchRiders(true);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update rider availability."
      );
    }
  }

  async function handleViewDetails(riderId: string) {
    try {
      setDetailsLoading(true);
      setSelectedRider(null);

      const response = await authAPI.get(
        `/admin/riders/${riderId}`
      );

      setSelectedRider(response.data.rider);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Unable to load rider details."
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  const totalRiders = riders.length;
  const activeRiders = riders.filter((rider) => rider.isActive).length;
  const inactiveRiders = riders.filter((rider) => !rider.isActive).length;
  const availableRiders = riders.filter(
    (rider) => rider.riderProfile?.availability === "AVAILABLE"
  ).length;

  function getAvailabilityStyle(value?: Availability) {
    switch (value) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700";
      case "BUSY":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Rider Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage rider accounts, status, and availability.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchRiders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Rider
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Riders"
          value={totalRiders}
          icon={<Truck size={22} />}
          color="blue"
        />

        <SummaryCard
          title="Active Accounts"
          value={activeRiders}
          icon={<CheckCircle size={22} />}
          color="green"
        />

        <SummaryCard
          title="Inactive Accounts"
          value={inactiveRiders}
          icon={<XCircle size={22} />}
          color="red"
        />

        <SummaryCard
          title="Available Riders"
          value={availableRiders}
          icon={<Clock size={22} />}
          color="purple"
        />
      </div>

      {/* FILTERS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="ALL">All Account Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="ALL">All Availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">Busy</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
      </div>

      {/* RIDER TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-800">
            Registered Riders
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {riders.length} rider(s) found
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : riders.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Truck size={42} className="mb-3 text-slate-300" />
            <h3 className="font-semibold text-slate-700">
              No riders found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Register a rider or adjust your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Rider</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Deliveries</th>
                  <th className="px-6 py-4">Availability</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {riders.map((rider) => (
                  <tr key={rider.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {rider.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {rider.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {rider.email}
                          </p>
                          <p className="text-xs text-slate-400">
                            {rider.phone || "No phone number"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">
                        {rider.riderProfile?.vehicleType || "Not set"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {rider.riderProfile?.plateNumber || "No plate number"}
                      </p>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {rider.riderProfile?._count?.deliveries ?? 0}
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={
                          rider.riderProfile?.availability || "OFFLINE"
                        }
                        disabled={!rider.isActive || !rider.riderProfile}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            rider,
                            e.target.value as Availability
                          )
                        }
                        className={`rounded-lg px-3 py-2 text-xs font-semibold outline-none ${getAvailabilityStyle(
                          rider.riderProfile?.availability
                        )} disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="BUSY">Busy</option>
                        <option value="OFFLINE">Offline</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          rider.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {rider.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(rider.id)}
                          title="View details"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(rider)}
                          title={rider.isActive ? "Deactivate" : "Activate"}
                          className={`rounded-lg p-2 ${
                            rider.isActive
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {rider.isActive ? (
                            <XCircle size={16} />
                          ) : (
                            <CheckCircle size={16} />
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

      {/* REGISTER RIDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Register New Rider
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Create a rider account for TownExpress.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRider} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Name *
                </label>
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="rider@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    placeholder="09XXXXXXXXX"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Temporary Password *
                </label>
                <input
                  required
                  type="password"
                  minLength={8}
                  maxLength={72}
                  value={form.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Vehicle Type *
                  </label>
                  <select
                    required
                    value={form.vehicleType}
                    onChange={(e) =>
                      updateForm("vehicleType", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="E-bike">E-bike</option>
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Plate Number
                  </label>
                  <input
                    value={form.plateNumber}
                    onChange={(e) =>
                      updateForm("plateNumber", e.target.value)
                    }
                    placeholder="ABC 1234"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Register Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RIDER DETAILS MODAL */}
      {(selectedRider || detailsLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <h2 className="text-lg font-bold text-slate-800">
                Rider Details
              </h2>

              <button
                onClick={() => setSelectedRider(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex min-h-48 items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={30} />
              </div>
            ) : selectedRider ? (
              <div className="space-y-5 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <User size={28} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {selectedRider.name}
                    </h3>
                    <span
                      className={`text-xs font-semibold ${
                        selectedRider.isActive
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedRider.isActive ? "Active Account" : "Inactive Account"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                  <p className="flex items-center gap-3 text-slate-600">
                    <Mail size={17} />
                    {selectedRider.email}
                  </p>

                  <p className="flex items-center gap-3 text-slate-600">
                    <Phone size={17} />
                    {selectedRider.phone || "No phone number"}
                  </p>

                  <p className="flex items-center gap-3 text-slate-600">
                    <Bike size={17} />
                    {selectedRider.riderProfile?.vehicleType || "No vehicle"}
                  </p>

                  <p className="flex items-center gap-3 text-slate-600">
                    <Truck size={17} />
                    Plate: {selectedRider.riderProfile?.plateNumber || "Not provided"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border p-4">
                    <p className="text-xs text-slate-500">
                      Total Deliveries
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-800">
                      {selectedRider.riderProfile?._count?.deliveries ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl border p-4">
                    <p className="text-xs text-slate-500">
                      Availability
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {selectedRider.riderProfile?.availability || "OFFLINE"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Registered:{" "}
                  {new Date(selectedRider.createdAt).toLocaleDateString()}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "red" | "purple";
}) {
  const styles = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`rounded-xl p-3 ${styles[color]}`}>
          {icon}
        </div>
      </div>
      <h3 className="mt-3 text-3xl font-bold text-slate-800">
        {value}
      </h3>
    </div>
  );
}
