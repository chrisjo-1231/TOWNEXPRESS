
import { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  TrendingUp,
  CalendarDays,
  PackageCheck,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  User,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  riderAPI,
  type RiderEarnings,
  type RiderDeliveryHistoryItem,
} from "../../services/rider";

const formatPeso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount || 0);

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function RiderEarnings() {
  const [earnings, setEarnings] = useState<RiderEarnings | null>(null);
  const [deliveries, setDeliveries] = useState<RiderDeliveryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDeliveries, setTotalDeliveries] = useState(0);

  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [earningsResponse, historyResponse] = await Promise.all([
        riderAPI.getEarnings(),
        riderAPI.getDeliveryHistory({
          page,
          limit: 10,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);

      setEarnings(earningsResponse.earnings);
      setDeliveries(historyResponse.deliveries);
      setTotalPages(historyResponse.pagination.totalPages);
      setTotalDeliveries(historyResponse.pagination.total);
    } catch (error: any) {
      console.error("Rider earnings error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to load earnings and delivery history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      toast.error("Start date cannot be later than end date.");
      return;
    }

    setPage(1);
    loadData();
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const statCards = [
    {
      title: "Total Earnings",
      amount: earnings?.totalEarnings ?? 0,
      icon: Wallet,
      description: "All completed deliveries",
    },
    {
      title: "Today's Earnings",
      amount: earnings?.todayEarnings ?? 0,
      icon: TrendingUp,
      description: "Earnings today",
    },
    {
      title: "This Week",
      amount: earnings?.weeklyEarnings ?? 0,
      icon: CalendarDays,
      description: "Current week earnings",
    },
    {
      title: "This Month",
      amount: earnings?.monthlyEarnings ?? 0,
      icon: PackageCheck,
      description: "Current month earnings",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 animate-spin text-blue-600" size={32} />
          <p className="text-sm text-gray-500">Loading rider earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Earnings & Delivery History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your delivery earnings and completed deliveries.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* EARNINGS SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-blue-50 p-3">
                  <Icon size={22} className="text-blue-600" />
                </div>
                <span className="text-xs font-medium text-green-600">
                  PHP
                </span>
              </div>

              <p className="mt-4 text-sm font-medium text-gray-500">
                {card.title}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {formatPeso(card.amount)}
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* COMPLETED DELIVERY COUNT */}
      <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white p-3">
            <Truck className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">
              Total Completed Deliveries
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              {earnings?.totalCompletedDeliveries ?? 0}
            </h2>
          </div>
        </div>

        <div className="text-sm text-blue-700">
          <span className="font-semibold">
            {earnings?.earningRate || "100% of delivery fee"}
          </span>
          <p className="text-xs text-blue-600">
            Your delivery earnings
          </p>
        </div>
      </div>

      {/* DELIVERY HISTORY */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Delivery History
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Your completed delivery transactions.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {totalDeliveries} completed deliveries found
            </div>
          </div>

          {/* DATE FILTER */}
          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              onClick={handleFilter}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Search size={16} />
              Filter
            </button>

            <button
              onClick={handleClearFilter}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* TABLE */}
        {deliveries.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <PackageCheck
              size={45}
              className="mx-auto mb-3 text-gray-300"
            />
            <h3 className="font-semibold text-gray-800">
              No completed deliveries found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Your completed delivery history will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Order</th>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Store</th>
                    <th className="px-5 py-4 font-semibold">Delivery Date</th>
                    <th className="px-5 py-4 font-semibold">Barangay</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Earnings
                    </th>
                    <th className="px-5 py-4 text-center font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {deliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900">
                          {delivery.order.orderNumber}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-800">
                              {delivery.order.customer.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {delivery.order.customer.phone || "No phone"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Store size={16} className="text-gray-400" />
                          <span className="text-gray-700">
                            {delivery.order.store.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(delivery.deliveredAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin size={15} className="text-gray-400" />
                          {delivery.order.zone.barangay}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-green-600">
                        {formatPeso(delivery.earnings)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          DELIVERED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col justify-between gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages || 1}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  onClick={() =>
                    setPage((current) =>
                      Math.min(totalPages, current + 1)
                    )
                  }
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
