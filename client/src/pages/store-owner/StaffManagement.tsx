
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

import {
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Clock,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Menu,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  storeStaffAPI,
  type StoreStaff,
  type StaffStatus,
  type CreateStaffInput,
  type UpdateStaffInput,
} from "../../services/store-staff";

import StoreOwnerSidebar from "../../components/store-owner/StoreOwnerSidebar";

const emptyForm: CreateStaffInput = {
  name: "",
  email: "",
  phone: "",
  password: "",
  title: "",
};

export default function StaffManagement() {
  const [staff, setStaff] = useState<StoreStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StoreStaff | null>(null);

  const [form, setForm] = useState<CreateStaffInput>({ ...emptyForm });

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ============================================
  // FETCH STAFF
  // ============================================

  const fetchStaff = async () => {
    try {
      setLoading(true);

      const response = await storeStaffAPI.getAll();

      setStaff(response.staff || []);
    } catch (error: any) {
      console.error("FETCH STAFF ERROR:", error);
      console.error("API RESPONSE:", error.response?.data);

      toast.error(
        error.response?.data?.message || "Failed to load staff."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStaff();
  }, []);

  // ============================================
  // SEARCH
  // ============================================

  const filteredStaff = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return staff;

    return staff.filter((member) =>
      [
        member.user.name,
        member.user.email,
        member.user.phone || "",
        member.title || "",
        member.status,
      ].some((value) => value.toLowerCase().includes(keyword))
    );
  }, [staff, search]);

  // ============================================
  // OPEN ADD MODAL
  // ============================================

  const openAddModal = () => {
    setEditingStaff(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  // ============================================
  // OPEN EDIT MODAL
  // ============================================

  const openEditModal = (member: StoreStaff) => {
    setEditingStaff(member);

    setForm({
      name: member.user.name,
      email: member.user.email,
      phone: member.user.phone || "",
      password: "",
      title: member.title || "",
    });

    setShowModal(true);
  };

  // ============================================
  // CLOSE MODAL
  // ============================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingStaff(null);
    setForm({ ...emptyForm });
  };

  // ============================================
  // SAVE STAFF
  // ============================================

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Staff name is required.");
      return;
    }

    if (!editingStaff && !form.email.trim()) {
      toast.error("Email address is required.");
      return;
    }

    if (!editingStaff && form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    try {
      setSaving(true);

      if (editingStaff) {
        const payload: UpdateStaffInput = {
          name: form.name.trim(),
          phone: form.phone?.trim() || null,
          title: form.title?.trim() || null,
        };

        await storeStaffAPI.update(editingStaff.id, payload);

        toast.success("Staff information updated successfully!");
      } else {
        await storeStaffAPI.create({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone?.trim() || "",
          password: form.password,
          title: form.title?.trim() || "",
        });

        toast.success("Staff account created successfully!");
      }

      setShowModal(false);
      setEditingStaff(null);
      setForm({ ...emptyForm });

      await fetchStaff();
    } catch (error: any) {
      console.error("SAVE STAFF ERROR:", error);
      console.error("API RESPONSE:", error.response?.data);

      toast.error(
        error.response?.data?.message || "Failed to save staff information."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // UPDATE STAFF STATUS
  // ============================================

  const handleStatusChange = async (
    member: StoreStaff,
    status: StaffStatus
  ) => {
    const action =
      status === "ACTIVE"
        ? "activate"
        : status === "DISABLED"
          ? "disable"
          : "mark as invited";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${member.user.name}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(member.id);

      await storeStaffAPI.updateStatus(member.id, status);

      setStaff((current) =>
        current.map((item) =>
          item.id === member.id ? { ...item, status } : item
        )
      );

      toast.success("Staff status updated successfully.");
    } catch (error: any) {
      console.error("UPDATE STAFF STATUS ERROR:", error);

      toast.error(
        error.response?.data?.message || "Failed to update staff status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ============================================
  // DELETE STAFF
  // ============================================

  const handleDelete = async (member: StoreStaff) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.user.name} from your store?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(member.id);

      await storeStaffAPI.remove(member.id);

      setStaff((current) =>
        current.filter((item) => item.id !== member.id)
      );

      toast.success("Staff removed successfully!");
    } catch (error: any) {
      console.error("REMOVE STAFF ERROR:", error);

      toast.error(
        error.response?.data?.message || "Failed to remove staff."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================
  // STAFF STATISTICS
  // ============================================

  const totalStaff = staff.length;

  const activeStaff = staff.filter(
    (member) => member.status === "ACTIVE"
  ).length;

  const invitedStaff = staff.filter(
    (member) => member.status === "INVITED"
  ).length;

  const disabledStaff = staff.filter(
    (member) => member.status === "DISABLED"
  ).length;

  // ============================================
  // STATUS BADGE
  // ============================================

  const getStatusBadge = (status: StaffStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";

      case "INVITED":
        return "bg-amber-100 text-amber-700";

      case "DISABLED":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ============================================
  // MAIN UI
  // ============================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* SIDEBAR */}

      <StoreOwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT */}

      <div className="min-h-screen lg:ml-72">

        {/* TOP HEADER */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">

          <div className="flex items-center gap-3">

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
              Staff Management
            </p>

            <p className="text-xs text-slate-500">
              Manage your store employees
            </p>
          </div>

        </header>

        {/* PAGE CONTENT */}

        <main className="p-4 sm:p-6 lg:p-8">

          <div className="mx-auto max-w-7xl space-y-6">

            {/* PAGE TITLE */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Staff Management
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your store employees and their account status.
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
              >
                <Plus size={19} />
                Add Staff
              </button>

            </div>

            {/* STATISTICS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Total Staff"
                value={totalStaff}
                icon={<Users size={21} />}
              />

              <StatCard
                title="Active Staff"
                value={activeStaff}
                icon={<UserCheck size={21} />}
              />

              <StatCard
                title="Invited Staff"
                value={invitedStaff}
                icon={<Clock size={21} />}
              />

              <StatCard
                title="Disabled Staff"
                value={disabledStaff}
                icon={<UserX size={21} />}
              />

            </div>

            {/* SEARCH */}

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
                    placeholder="Search staff by name, email, phone, or position..."
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                </div>

                <button
                  onClick={fetchStaff}
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

            {/* STAFF TABLE */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-4">

                <h2 className="font-bold text-gray-900">
                  Store Employees
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredStaff.length} staff member(s) found
                </p>

              </div>

              {loading ? (

                <div className="flex min-h-64 items-center justify-center">
                  <Loader2
                    className="animate-spin text-orange-600"
                    size={32}
                  />
                </div>

              ) : filteredStaff.length === 0 ? (

                <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">

                  <Users
                    size={45}
                    className="mb-3 text-gray-300"
                  />

                  <h3 className="font-semibold text-gray-800">
                    {search ? "No matching staff" : "No staff members yet"}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {search
                      ? "Try another search keyword."
                      : "Start adding employees to your store."}
                  </p>

                  {!search && (
                    <button
                      onClick={openAddModal}
                      className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                    >
                      Add your first staff member
                    </button>
                  )}

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[900px] text-left">

                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-5 py-4">Employee</th>
                        <th className="px-5 py-4">Position</th>
                        <th className="px-5 py-4">Contact</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Date Added</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">

                      {filteredStaff.map((member) => (

                        <tr
                          key={member.id}
                          className="hover:bg-gray-50"
                        >

                          {/* EMPLOYEE */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                                {member.user.name.charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <p className="font-semibold text-gray-900">
                                  {member.user.name}
                                </p>

                                <p className="text-xs text-gray-500">
                                  Staff ID: {member.id.slice(-8)}
                                </p>
                              </div>

                            </div>

                          </td>

                          {/* POSITION */}

                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-700">
                              {member.title || "Not assigned"}
                            </span>
                          </td>

                          {/* CONTACT */}

                          <td className="px-5 py-4">

                            <div className="space-y-1">

                              <p className="flex items-center gap-2 text-sm text-gray-700">
                                <Mail size={14} className="text-gray-400" />
                                {member.user.email}
                              </p>

                              <p className="flex items-center gap-2 text-xs text-gray-500">
                                <Phone size={14} className="text-gray-400" />
                                {member.user.phone || "No phone number"}
                              </p>

                            </div>

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusBadge(member.status)}`}
                            >
                              {member.status === "ACTIVE" && (
                                <CheckCircle size={13} />
                              )}

                              {member.status === "INVITED" && (
                                <Clock size={13} />
                              )}

                              {member.status === "DISABLED" && (
                                <AlertCircle size={13} />
                              )}

                              {member.status}
                            </span>

                          </td>

                          {/* DATE ADDED */}

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {new Date(member.createdAt).toLocaleDateString(
                              "en-PH",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>

                          {/* ACTIONS */}

                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                onClick={() => openEditModal(member)}
                                title="Edit staff"
                                className="rounded-lg border border-gray-200 p-2 text-blue-600 hover:bg-blue-50"
                              >
                                <Pencil size={17} />
                              </button>

                              {member.status === "ACTIVE" ? (

                                <button
                                  onClick={() =>
                                    handleStatusChange(member, "DISABLED")
                                  }
                                  disabled={updatingId === member.id}
                                  title="Disable staff"
                                  className="rounded-lg border border-gray-200 p-2 text-amber-600 hover:bg-amber-50 disabled:opacity-50"
                                >
                                  {updatingId === member.id ? (
                                    <Loader2 size={17} className="animate-spin" />
                                  ) : (
                                    <UserX size={17} />
                                  )}
                                </button>

                              ) : (

                                <button
                                  onClick={() =>
                                    handleStatusChange(member, "ACTIVE")
                                  }
                                  disabled={updatingId === member.id}
                                  title="Activate staff"
                                  className="rounded-lg border border-gray-200 p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                                >
                                  {updatingId === member.id ? (
                                    <Loader2 size={17} className="animate-spin" />
                                  ) : (
                                    <UserCheck size={17} />
                                  )}
                                </button>

                              )}

                              <button
                                onClick={() => handleDelete(member)}
                                disabled={deletingId === member.id}
                                title="Remove staff"
                                className="rounded-lg border border-gray-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                {deletingId === member.id ? (
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

      {/* ADD / EDIT MODAL */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingStaff ? "Edit Staff" : "Add New Staff"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingStaff
                    ? "Update employee information."
                    : "Create a new employee account for your store."}
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

              {/* NAME */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full Name *
                </label>

                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Enter employee name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email Address *
                </label>

                <input
                  required={!editingStaff}
                  disabled={Boolean(editingStaff)}
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="employee@example.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 disabled:text-gray-500"
                />

                {editingStaff && (
                  <p className="mt-1 text-xs text-gray-500">
                    Email address cannot be changed here.
                  </p>
                )}
              </div>

              {/* PHONE AND POSITION */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={form.phone || ""}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="09XXXXXXXXX"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Position
                  </label>

                  <input
                    type="text"
                    maxLength={100}
                    value={form.title || ""}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g. Cashier"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

              </div>

              {/* PASSWORD */}

              {!editingStaff && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Initial Password *
                  </label>

                  <input
                    required
                    type="password"
                    minLength={8}
                    maxLength={72}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Share this initial password securely with your employee.
                  </p>
                </div>
              )}

              {/* ACCOUNT INFORMATION */}

              {!editingStaff && (
                <div className="flex gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4">

                  <ShieldCheck
                    size={21}
                    className="shrink-0 text-orange-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-orange-800">
                      Staff Account
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-orange-700">
                      The employee will receive a STORE_STAFF account with
                      ACTIVE membership status.
                    </p>
                  </div>

                </div>
              )}

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
                    <Loader2 size={18} className="animate-spin" />
                  )}

                  {editingStaff ? "Save Changes" : "Create Staff Account"}
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
