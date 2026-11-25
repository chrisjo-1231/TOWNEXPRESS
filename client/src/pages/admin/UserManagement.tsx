
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  User,
  ShieldCheck,
  Store,
  Bike,
  ShoppingBag,
  Eye,
  X,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Power,
} from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../../services/auth";

type UserRole =
  | "ADMIN"
  | "STORE_OWNER"
  | "STORE_STAFF"
  | "RIDER"
  | "CUSTOMER";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

const roleStyles: Record<UserRole, string> = {
  ADMIN: "bg-purple-50 text-purple-700",
  STORE_OWNER: "bg-blue-50 text-blue-700",
  STORE_STAFF: "bg-indigo-50 text-indigo-700",
  RIDER: "bg-orange-50 text-orange-700",
  CUSTOMER: "bg-emerald-50 text-emerald-700",
};

const roleIcons = {
  ADMIN: ShieldCheck,
  STORE_OWNER: Store,
  STORE_STAFF: User,
  RIDER: Bike,
  CUSTOMER: ShoppingBag,
};

function RoleBadge({ role }: { role: UserRole }) {
  const Icon = roleIcons[role];

  const label = role
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${roleStyles[role]}`}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await authAPI.get("/admin/users");

      setUsers(response.data.users ?? []);
    } catch (error: any) {
      console.error("FETCH USERS ERROR:", error);

      toast.error(
        error.response?.data?.message || "Failed to load users."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const counts = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    customers: users.filter((u) => u.role === "CUSTOMER").length,
    storeOwners: users.filter((u) => u.role === "STORE_OWNER").length,
    riders: users.filter((u) => u.role === "RIDER").length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword);

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.isActive) ||
        (statusFilter === "INACTIVE" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleStatusChange = async (user: UserRecord) => {
    const nextStatus = !user.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus ? "activate" : "deactivate"
      } ${user.name}'s account?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(user.id);

      const response = await authAPI.patch(
        `/admin/users/${user.id}/status`,
        { isActive: nextStatus }
      );

      toast.success(
        response.data.message || "Account status updated."
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? { ...item, isActive: nextStatus }
            : item
        )
      );

      setSelectedUser((current) =>
        current?.id === user.id
          ? { ...current, isActive: nextStatus }
          : current
      );
    } catch (error: any) {
      console.error("UPDATE USER STATUS ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update account status."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const statCards = [
    {
      label: "Total Users",
      value: counts.total,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Customers",
      value: counts.customers,
      icon: ShoppingBag,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Store Owners",
      value: counts.storeOwners,
      icon: Store,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Riders",
      value: counts.riders,
      icon: Bike,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Active Accounts",
      value: counts.active,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage TownExpress users and account access.
          </p>
        </div>

        <button
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Inactive Accounts</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {counts.inactive}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Administrators</p>
          <p className="mt-2 text-2xl font-bold text-purple-600">
            {counts.admins}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 className="font-bold text-slate-900">Registered Users</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredUsers.length} user(s) found
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="STORE_STAFF">Store Staff</option>
              <option value="RIDER">Rider</option>
              <option value="CUSTOMER">Customer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
            <Loader2 size={22} className="animate-spin" />
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <Users size={28} className="text-slate-400" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-800">
              No users found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">User</th>
                  <th className="px-5 py-4 font-semibold">Role</th>
                  <th className="px-5 py-4 font-semibold">Account Status</th>
                  <th className="px-5 py-4 font-semibold">Date Joined</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {user.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user.isActive ? (
                          <CheckCircle size={13} />
                        ) : (
                          <XCircle size={13} />
                        )}
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        <button
                          onClick={() => handleStatusChange(user)}
                          disabled={processingId === user.id}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-60 ${
                            user.isActive
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {processingId === user.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Power size={14} />
                          )}
                          {user.isActive ? "Deactivate" : "Activate"}
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

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  User Details
                </h2>
                <p className="text-sm text-slate-500">
                  Account information
                </p>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-600">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedUser.name}
                  </h3>
                  <div className="mt-2">
                    <RoleBadge role={selectedUser.role} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={17} />
                  {selectedUser.email}
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={17} />
                  {selectedUser.phone || "No phone number provided"}
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar size={17} />
                  Joined{" "}
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-800">
                    Account Status
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedUser.isActive
                      ? "This account can access the platform."
                      : "This account cannot log in."}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedUser.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {selectedUser.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <button
                onClick={() => handleStatusChange(selectedUser)}
                disabled={processingId === selectedUser.id}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 ${
                  selectedUser.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {processingId === selectedUser.id ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Power size={17} />
                )}
                {selectedUser.isActive
                  ? "Deactivate Account"
                  : "Activate Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
