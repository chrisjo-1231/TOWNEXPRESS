
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  CalendarDays,
  RefreshCw,
  TrendingUp,
  ShoppingBag,
  Package,
  Wallet,
  Menu,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import toast from "react-hot-toast";

import StoreOwnerSidebar from "../../components/store-owner/StoreOwnerSidebar";
import {
  salesReportAPI,
  type SalesReport,
} from "../../services/sales-report";

// ============================================
// HELPERS
// ============================================

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return getLocalDateString(date);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDateLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

function formatFullDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ============================================
// STAT CARD
// ============================================

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
}

function StatCard({
  title,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-3 text-2xl font-bold text-gray-900">
            {value}
          </h3>
          <p className="mt-2 text-xs text-gray-500">{description}</p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SalesReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [startDate, setStartDate] = useState(getDefaultStartDate);
  const [endDate, setEndDate] = useState(() =>
    getLocalDateString(new Date())
  );

  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH REPORT
  // ==========================================

  const fetchReport = useCallback(async () => {
    if (!startDate || !endDate) {
      toast.error("Please select a start and end date.");
      return;
    }

    if (startDate > endDate) {
      toast.error("Start date cannot be later than end date.");
      return;
    }

    try {
      setError("");

      if (report) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await salesReportAPI.getReport(
        startDate,
        endDate
      );

      setReport(response);
    } catch (err: any) {
      console.error("Sales report error:", err);

      const message =
        err.response?.data?.message ||
        "Unable to load sales reports.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate, report]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading && !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-3 text-sm font-medium text-gray-600">
            Loading sales reports...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR SCREEN
  // ==========================================

  if (error && !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Unable to load reports
          </h2>

          <p className="mt-2 text-sm text-gray-500">{error}</p>

          <button
            onClick={() => void fetchReport()}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const summary = report?.summary;

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 lg:ml-72">
      <StoreOwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Sales Reports
              </h1>
              <p className="text-xs text-gray-500">
                Track your store performance and revenue
              </p>
            </div>
          </div>

          <button
            onClick={() => void fetchReport()}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* DATE FILTER */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="text-blue-600" size={20} />
            <h2 className="font-bold text-gray-900">
              Report Date Range
            </h2>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              onClick={() => void fetchReport()}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <TrendingUp size={17} />
              Generate Report
            </button>
          </div>

          {report && (
            <p className="mt-4 text-xs text-gray-500">
              Showing report for {formatFullDate(report.dateRange.startDate)}
              {" "}to{" "}
              {formatFullDate(report.dateRange.endDate)}
            </p>
          )}
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUMMARY CARDS */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Sales Overview
            </h2>
            <p className="text-sm text-gray-500">
              Summary of your store's performance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(summary?.totalRevenue || 0)}
              description="From delivered orders"
              icon={<Wallet size={22} />}
            />

            <StatCard
              title="Total Orders"
              value={(summary?.totalOrders || 0).toLocaleString()}
              description="All orders in this period"
              icon={<ShoppingBag size={22} />}
            />

            <StatCard
              title="Delivered Orders"
              value={(summary?.deliveredOrders || 0).toLocaleString()}
              description="Successfully delivered"
              icon={<Package size={22} />}
            />

            <StatCard
              title="Average Order Value"
              value={formatCurrency(summary?.averageOrderValue || 0)}
              description="Average delivered order"
              icon={<TrendingUp size={22} />}
            />
          </div>
        </section>

        {/* DAILY SALES CHART */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Daily Revenue
            </h2>
            <p className="text-sm text-gray-500">
              Revenue from delivered orders per day
            </p>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={report?.dailySales || []}
                margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateLabel}
                  tick={{ fontSize: 11 }}
                  minTickGap={25}
                />

                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) =>
                    `₱${Number(value).toLocaleString("en-PH")}`
                  }
                  width={85}
                />

                <Tooltip
                  labelFormatter={(label) =>
                    formatFullDate(String(label))
                  }
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Revenue",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* DAILY SALES TABLE */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900">
              Daily Sales Breakdown
            </h2>
            <p className="text-sm text-gray-500">
              Revenue and delivered orders by date
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 text-center font-semibold">
                    Delivered Orders
                  </th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Revenue
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {(report?.dailySales || []).map((sale) => (
                  <tr key={sale.date} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-800">
                      {formatFullDate(sale.date)}
                    </td>

                    <td className="px-5 py-4 text-center text-gray-600">
                      {sale.orders}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(sale.revenue)}
                    </td>
                  </tr>
                ))}

                {report?.dailySales.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No sales data for this date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* TOP PRODUCTS */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900">
              Best-Selling Products
            </h2>
            <p className="text-sm text-gray-500">
              Your top 10 products based on quantity sold
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 text-center font-semibold">
                    Quantity Sold
                  </th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Revenue
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {(report?.topProducts || []).map((product, index) => (
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                          {index + 1}
                        </span>

                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg border border-gray-100 object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                            <Package size={19} />
                          </div>
                        )}

                        <span className="font-semibold text-gray-800">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center font-medium text-gray-600">
                      {product.quantitySold}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}

                {report?.topProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No product sales for this date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ADDITIONAL SUMMARY */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Product Subtotal</p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {formatCurrency(summary?.totalSubtotal || 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Delivery Fees</p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {formatCurrency(summary?.totalDeliveryFees || 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Cancelled Orders</p>
            <p className="mt-2 text-xl font-bold text-red-600">
              {(summary?.cancelledOrders || 0).toLocaleString()}
            </p>
          </div>
        </section>

        <p className="pb-4 text-center text-xs text-gray-400">
          TownExpress Sales Reports
        </p>
      </main>
    </div>
  );
}
