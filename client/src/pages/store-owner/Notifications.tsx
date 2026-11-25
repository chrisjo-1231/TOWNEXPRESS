
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  Loader2,
  Menu,
  Inbox,
  AlertCircle,
  ShoppingBag,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

import StoreOwnerSidebar from "../../components/store-owner/StoreOwnerSidebar";
import {
  notificationAPI,
  type Notification,
} from "../../services/notification";

type FilterType = "ALL" | "UNREAD";

export default function Notifications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await notificationAPI.getAll();

      setNotifications(response.notifications || []);
    } catch (error: any) {
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
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter((item) => !item.isRead);
    }

    return notifications;
  }, [notifications, filter]);

  // ============================================
  // MARK ONE AS READ
  // ============================================

  async function handleMarkAsRead(id: string) {
    try {
      setUpdatingId(id);

      await notificationAPI.markAsRead(id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );

      toast.success("Notification marked as read.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update notification."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // ============================================
  // MARK ALL AS READ
  // ============================================

  async function handleMarkAllAsRead() {
    if (unreadCount === 0) return;

    try {
      setMarkingAll(true);

      await notificationAPI.markAllAsRead();

      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );

      toast.success("All notifications marked as read.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update notifications."
      );
    } finally {
      setMarkingAll(false);
    }
  }

  // ============================================
  // DELETE NOTIFICATION
  // ============================================

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await notificationAPI.delete(id);

      setNotifications((current) =>
        current.filter((item) => item.id !== id)
      );

      toast.success("Notification deleted.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete notification."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================
  // DATE FORMAT
  // ============================================

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // ============================================
  // NOTIFICATION ICON
  // ============================================

  function getNotificationIcon(title: string) {
    const value = title.toLowerCase();

    if (value.includes("order")) {
      return (
        <ShoppingBag size={21} className="text-orange-600" />
      );
    }

    if (value.includes("alert") || value.includes("important")) {
      return (
        <AlertCircle size={21} className="text-red-600" />
      );
    }

    return <Info size={21} className="text-blue-600" />;
  }

  function getNotificationIconBackground(title: string) {
    const value = title.toLowerCase();

    if (value.includes("order")) return "bg-orange-100";

    if (value.includes("alert") || value.includes("important")) {
      return "bg-red-100";
    }

    return "bg-blue-100";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreOwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-h-screen lg:ml-72">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Notifications
              </h1>
              <p className="text-xs text-slate-500">
                Stay updated with your store activities
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchNotifications(false)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        {/* CONTENT */}
        <div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
          {/* INTRO */}
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Your Notifications
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review your latest store updates and announcements.
              </p>
            </div>

            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || markingAll}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {markingAll ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <CheckCheck size={17} />
              )}
              Mark All as Read
            </button>
          </section>

          {/* STAT CARDS */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Notifications
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-slate-900">
                    {notifications.length}
                  </h3>
                </div>

                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Bell size={23} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Unread Notifications
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-orange-600">
                    {unreadCount}
                  </h3>
                </div>

                <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                  <Inbox size={23} />
                </div>
              </div>
            </div>
          </section>

          {/* FILTERS */}
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("ALL")}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  filter === "ALL"
                    ? "bg-orange-500 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                All ({notifications.length})
              </button>

              <button
                onClick={() => setFilter("UNREAD")}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  filter === "UNREAD"
                    ? "bg-orange-500 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </section>

          {/* NOTIFICATION LIST */}
          <section className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">
                <Loader2
                  size={35}
                  className="animate-spin text-orange-500"
                />
                <p className="mt-4 text-sm text-slate-500">
                  Loading notifications...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-20 text-center">
                <div className="rounded-full bg-slate-100 p-5">
                  <Bell size={35} className="text-slate-400" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-800">
                  {filter === "UNREAD"
                    ? "No Unread Notifications"
                    : "No Notifications Yet"}
                </h3>

                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  {filter === "UNREAD"
                    ? "You're all caught up! There are no unread notifications."
                    : "Your store notifications and important updates will appear here."}
                </p>

                {filter === "UNREAD" && (
                  <button
                    onClick={() => setFilter("ALL")}
                    className="mt-5 text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    View all notifications
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`rounded-2xl border p-5 shadow-sm transition ${
                    notification.isRead
                      ? "border-slate-200 bg-white"
                      : "border-orange-200 bg-orange-50/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`shrink-0 rounded-xl p-3 ${getNotificationIconBackground(
                        notification.title
                      )}`}
                    >
                      {getNotificationIcon(notification.title)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">
                          {notification.title}
                        </h3>

                        {!notification.isRead && (
                          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      <p className="mt-3 text-xs text-slate-400">
                        {formatDate(notification.createdAt)}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {!notification.isRead && (
                          <button
                            onClick={() =>
                              handleMarkAsRead(notification.id)
                            }
                            disabled={updatingId === notification.id}
                            className="flex items-center gap-1.5 text-xs font-bold text-orange-600 transition hover:text-orange-700 disabled:opacity-50"
                          >
                            {updatingId === notification.id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Check size={15} />
                            )}
                            Mark as Read
                          </button>
                        )}

                        {notification.isRead && (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                            <CheckCheck size={14} />
                            Read
                          </span>
                        )}

                        <button
                          onClick={() =>
                            handleDelete(notification.id)
                          }
                          disabled={deletingId === notification.id}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 transition hover:text-red-600 disabled:opacity-50"
                        >
                          {deletingId === notification.id ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>

          <p className="pb-5 text-center text-xs text-slate-400">
            TownExpress Notification Center
          </p>
        </div>
      </main>
    </div>
  );
}
