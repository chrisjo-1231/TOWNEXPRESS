
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  RefreshCw,
  ShoppingBag,
  Clock,
  Truck,
  Package,
  Store,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  customerNotificationAPI,
  type CustomerNotification,
} from "../../services/customer-notification";

function getNotificationIcon(title: string) {
  const value = title.toLowerCase();

  if (value.includes("deliver") || value.includes("rider")) {
    return Truck;
  }

  if (value.includes("confirm") || value.includes("prepar")) {
    return Package;
  }

  if (value.includes("store")) {
    return Store;
  }

  if (value.includes("order")) {
    return ShoppingBag;
  }

  return Bell;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function CustomerNotifications() {
  const [notifications, setNotifications] = useState<
    CustomerNotification[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const fetchNotifications = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await customerNotificationAPI.getAll();

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error: any) {
      console.error("Fetch customer notifications error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const interval = window.setInterval(() => {
      fetchNotifications(true);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notification: CustomerNotification) => {
    if (notification.isRead) return;

    try {
      await customerNotificationAPI.markAsRead(notification.id);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error: any) {
      console.error("Mark notification as read error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update notification."
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      await customerNotificationAPI.markAllAsRead();

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );

      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch (error: any) {
      console.error("Mark all notifications error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update notifications."
      );
    }
  };

  const filteredNotifications =
    filter === "UNREAD"
      ? notifications.filter((item) => !item.isRead)
      : notifications;

  return (
    <div className="min-h-screen bg-slate-50">
      <main>
        <header className="sticky top-0 z-30 flex flex-col justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center md:px-8">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Stay updated with your orders and deliveries.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          </div>
        </header>

        <div className="space-y-6 p-5 md:p-8">
          {/* SUMMARY */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Total Notifications
                </p>
                <Bell className="text-orange-500" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-slate-800">
                {notifications.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Unread Notifications
                </p>
                <Clock className="text-blue-500" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-slate-800">
                {unreadCount}
              </p>
            </div>
          </section>

          {/* FILTER */}
          <section className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold ${
                filter === "ALL"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setFilter("UNREAD")}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold ${
                filter === "UNREAD"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </section>

          {/* NOTIFICATION LIST */}
          <section className="space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <RefreshCw
                  size={30}
                  className="mx-auto animate-spin text-orange-500"
                />
                <p className="mt-3 text-sm text-slate-500">
                  Loading notifications...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                <Bell
                  size={48}
                  className="mx-auto text-slate-300"
                />
                <h3 className="mt-4 text-lg font-extrabold text-slate-800">
                  No Notifications
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {filter === "UNREAD"
                    ? "You're all caught up!"
                    : "Your order updates will appear here."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.title);

                return (
                  <article
                    key={notification.id}
                    className={`flex flex-col gap-4 rounded-2xl border p-5 transition sm:flex-row sm:items-start ${
                      notification.isRead
                        ? "border-slate-200 bg-white"
                        : "border-orange-200 bg-orange-50/50"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                      <Icon size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-slate-800">
                          {notification.title}
                        </h3>

                        {!notification.isRead && (
                          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-extrabold text-orange-700">
                            NEW
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      <p className="mt-3 text-xs text-slate-400">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification)}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50"
                      >
                        <CheckCircle2 size={15} />
                        Mark as read
                      </button>
                    )}
                  </article>
                );
              })
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
