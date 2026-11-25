import { useEffect, useState } from "react";
import {
  Users,
  Store,
  Clock,
  Truck,
  ShoppingBag,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

import { authAPI } from "../../services/auth";
import StatCard from "../../components/admin/StatCard";
interface DashboardStats {
  users: {
    total: number;
    customers: number;
    storeOwners: number;
  };
  stores: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
  riders: {
    total: number;
    active: number;
    inactive: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const fetchDashboardStats = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await authAPI.get("/admin/dashboard/stats");

    setStats(response.data.stats);
  } catch (err) {
    console.error("Dashboard error:", err);
    setError("Unable to load dashboard statistics.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">
          {error || "No dashboard data available."}
        </p>
        <button
          onClick={fetchDashboardStats}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor your TownExpress platform.
          </p>
        </div>

        <button
          onClick={fetchDashboardStats}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Platform Statistics
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.users.total}
            description={`${stats.users.customers} customers`}
            icon={<Users size={23} />}
            iconColor="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Total Stores"
            value={stats.stores.total}
            description={`${stats.stores.approved} approved stores`}
            icon={<Store size={23} />}
            iconColor="bg-purple-100 text-purple-600"
          />

          <StatCard
            title="Pending Applications"
            value={stats.stores.pending}
            description="Awaiting admin review"
            icon={<Clock size={23} />}
            iconColor="bg-orange-100 text-orange-600"
          />

          <StatCard
            title="Total Riders"
            value={stats.riders.total}
            description={`${stats.riders.active} active accounts`}
            icon={<Truck size={23} />}
            iconColor="bg-green-100 text-green-600"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Order Overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Orders"
            value={stats.orders.total}
            description="All recorded orders"
            icon={<ShoppingBag size={23} />}
          />

          <StatCard
            title="Pending Orders"
            value={stats.orders.pending}
            description="Waiting for processing"
            icon={<Clock size={23} />}
            iconColor="bg-orange-100 text-orange-600"
          />

          <StatCard
            title="Completed Orders"
            value={stats.orders.completed}
            description="Successfully delivered"
            icon={<CheckCircle size={23} />}
            iconColor="bg-green-100 text-green-600"
          />

          <StatCard
            title="Cancelled Orders"
            value={stats.orders.cancelled}
            description="Cancelled transactions"
            icon={<XCircle size={23} />}
            iconColor="bg-red-100 text-red-600"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Store Status
          </h2>

          {[
            { label: "Approved", value: stats.stores.approved, color: "bg-green-500" },
            { label: "Pending", value: stats.stores.pending, color: "bg-orange-500" },
            { label: "Rejected", value: stats.stores.rejected, color: "bg-red-500" },
            { label: "Suspended", value: stats.stores.suspended, color: "bg-slate-500" },
          ].map((item) => (
            <div key={item.label} className="mb-5 last:mb-0">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-semibold text-slate-800">{item.value}</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{
                    width: `${
                      stats.stores.total > 0
                        ? (item.value / stats.stores.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Rider Accounts
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-green-50 p-5">
              <p className="text-sm text-green-700">Active Riders</p>
              <h3 className="mt-2 text-3xl font-bold text-green-800">
                {stats.riders.active}
              </h3>
            </div>

            <div className="rounded-xl bg-slate-100 p-5">
              <p className="text-sm text-slate-600">Inactive Riders</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-800">
                {stats.riders.inactive}
              </h3>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              Store owners registered:{" "}
              <strong>{stats.users.storeOwners}</strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
