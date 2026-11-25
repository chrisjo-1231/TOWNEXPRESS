
import { useEffect, useState } from "react";
import {
  Plus,
  MapPin,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  adminDeliveryZoneAPI,
  type AdminDeliveryZone,
  type DeliveryZoneInput,
} from "../../services/admin-delivery-zone";

export default function AdminDeliveryZones() {
  const [zones, setZones] = useState<AdminDeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] =
    useState<AdminDeliveryZone | null>(null);

  const [form, setForm] = useState<DeliveryZoneInput>({
    name: "",
    barangay: "",
    deliveryFee: 0,
    isActive: true,
  });

  const loadZones = async () => {
    try {
      setLoading(true);
      const data = await adminDeliveryZoneAPI.getAll();
      setZones(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load delivery zones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      barangay: "",
      deliveryFee: 0,
      isActive: true,
    });
    setEditingZone(null);
    setShowModal(false);
  };

  const openAddModal = () => {
    setEditingZone(null);
    setForm({
      name: "",
      barangay: "",
      deliveryFee: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (zone: AdminDeliveryZone) => {
    setEditingZone(zone);
    setForm({
      name: zone.name,
      barangay: zone.barangay,
      deliveryFee: zone.deliveryFee,
      isActive: zone.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.barangay.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (form.deliveryFee < 0 || !Number.isFinite(form.deliveryFee)) {
      toast.error("Please enter a valid delivery fee.");
      return;
    }

    try {
      setSaving(true);

      if (editingZone) {
        await adminDeliveryZoneAPI.update(editingZone.id, form);
        toast.success("Delivery zone updated successfully.");
      } else {
        await adminDeliveryZoneAPI.create(form);
        toast.success("Delivery zone added successfully.");
      }

      resetForm();
      await loadZones();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save delivery zone."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (zone: AdminDeliveryZone) => {
    try {
      await adminDeliveryZoneAPI.update(zone.id, {
        isActive: !zone.isActive,
      });

      toast.success(
        zone.isActive
          ? "Delivery zone deactivated."
          : "Delivery zone activated."
      );

      await loadZones();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update delivery zone."
      );
    }
  };

  const handleDelete = async (zone: AdminDeliveryZone) => {
    const confirmed = window.confirm(
      `Delete delivery zone for ${zone.barangay}?`
    );

    if (!confirmed) return;

    try {
      await adminDeliveryZoneAPI.delete(zone.id);
      toast.success("Delivery zone deleted.");
      await loadZones();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete this delivery zone."
      );
    }
  };

  const activeCount = zones.filter((zone) => zone.isActive).length;
  const inactiveCount = zones.length - activeCount;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-600">
              ADMINISTRATION
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              Delivery Zones
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage barangay coverage and delivery fees.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadZones}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              <Plus size={18} />
              Add Zone
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total Zones</p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {zones.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Active Zones</p>
            <p className="mt-2 text-3xl font-black text-green-600">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Inactive Zones</p>
            <p className="mt-2 text-3xl font-black text-slate-500">
              {inactiveCount}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-bold text-slate-900">
              Barangay Delivery Coverage
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Delivery fees are applied during customer checkout.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-slate-500">
              <Loader2 className="animate-spin" size={20} />
              Loading delivery zones...
            </div>
          ) : zones.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="mx-auto text-slate-300" size={42} />
              <h3 className="mt-3 font-bold text-slate-800">
                No delivery zones yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Add your first barangay delivery zone.
              </p>
              <button
                onClick={openAddModal}
                className="mt-4 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                Add First Zone
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Zone</th>
                    <th className="px-5 py-4">Barangay</th>
                    <th className="px-5 py-4">Delivery Fee</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {zones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <Truck size={17} className="text-orange-500" />
                          {zone.name}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {zone.barangay}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-800">
                        ₱{zone.deliveryFee.toFixed(2)}
                      </td>

                      <td className="px-5 py-4">
                        {zone.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                            <CheckCircle2 size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                            <XCircle size={14} />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(zone)}
                            title={zone.isActive ? "Deactivate" : "Activate"}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          >
                            {zone.isActive ? (
                              <XCircle size={17} />
                            ) : (
                              <CheckCircle2 size={17} />
                            )}
                          </button>

                          <button
                            onClick={() => openEditModal(zone)}
                            title="Edit"
                            className="rounded-lg border border-slate-200 p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => handleDelete(zone)}
                            title="Delete"
                            className="rounded-lg border border-slate-200 p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {editingZone ? "Edit Delivery Zone" : "Add Delivery Zone"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the barangay and its delivery fee.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g. Zone 1"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Barangay
                </label>
                <input
                  type="text"
                  value={form.barangay}
                  onChange={(e) =>
                    setForm({ ...form, barangay: e.target.value })
                  }
                  placeholder="e.g. Barangay Poblacion"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Delivery Fee (₱)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.deliveryFee}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      deliveryFee: Number(e.target.value),
                    })
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-4 w-4 accent-orange-500"
                />
                Make this delivery zone active
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-orange-500 px-4 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="mx-auto animate-spin" size={20} />
                  ) : editingZone ? (
                    "Save Changes"
                  ) : (
                    "Add Zone"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
