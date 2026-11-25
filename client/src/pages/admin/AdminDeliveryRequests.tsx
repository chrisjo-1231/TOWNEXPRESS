
import { useCallback, useEffect, useState } from "react";
import {
  ClipboardCheck,
  RefreshCw,
  Package,
  MapPin,
  Store,
  User,
  Phone,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  CalendarDays
} from "lucide-react";
import toast from "react-hot-toast";

import {
  adminDeliveryAPI,
  type AdminDeliveryRequest,
  type DeliveryRequestStatus,
} from "../../services/admin-delivery";

type RequestFilter = DeliveryRequestStatus | "ALL";

const tabs: { label: string; value: RequestFilter }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "All Requests", value: "ALL" },
];

function formatCurrency(value: number | string) {
  return `₱${Number(value).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatusBadge({ status }: { status: DeliveryRequestStatus }) {
  const styles = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {status === "PENDING" && <Clock size={13} />}
      {status === "APPROVED" && <CheckCircle2 size={13} />}
      {status === "REJECTED" && <XCircle size={13} />}
      {status === "CANCELLED" && <XCircle size={13} />}
      {status.replace("_", " ")}
    </span>
  );
}

export default function AdminDeliveryRequests() {
  const [requests, setRequests] = useState<AdminDeliveryRequest[]>([]);
  const [status, setStatus] = useState<RequestFilter>("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const loadRequests = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const response = await adminDeliveryAPI.getDeliveryRequests(
          status,
          page,
          10
        );

        setRequests(response.requests);
        setTotal(response.pagination.total);
        setTotalPages(Math.max(1, response.pagination.totalPages));
      } catch (error) {
        console.error("Load delivery requests error:", error);
        toast.error("Failed to load delivery requests.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [status, page]
  );

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  function handleTabChange(value: RequestFilter) {
    setStatus(value);
    setPage(1);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadRequests(false);
  }

  async function handleApprove(request: AdminDeliveryRequest) {
    const confirmed = window.confirm(
      `Approve ${request.rider.user.name} for order ${request.order.orderNumber}?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(request.id);

      const note = adminNotes[request.id]?.trim();

      const response = await adminDeliveryAPI.approveDeliveryRequest(
        request.id,
        note || undefined
      );

      toast.success(response.message || "Delivery request approved.");

      setAdminNotes((previous) => {
        const updated = { ...previous };
        delete updated[request.id];
        return updated;
      });

      await loadRequests(false);
    } catch (error: any) {
      console.error("Approve delivery request error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to approve delivery request."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(request: AdminDeliveryRequest) {
    const confirmed = window.confirm(
      `Reject ${request.rider.user.name}'s request for order ${request.order.orderNumber}?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(request.id);

      const note = adminNotes[request.id]?.trim();

      const response = await adminDeliveryAPI.rejectDeliveryRequest(
        request.id,
        note || undefined
      );

      toast.success(response.message || "Delivery request rejected.");

      setAdminNotes((previous) => {
        const updated = { ...previous };
        delete updated[request.id];
        return updated;
      });

      await loadRequests(false);
    } catch (error: any) {
      console.error("Reject delivery request error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to reject delivery request."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
              <ClipboardCheck size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Delivery Requests
              </h1>
              <p className="text-sm text-slate-500">
                Review and manage rider delivery applications.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-100">
              {status === "ALL"
                ? "Total Delivery Requests"
                : `${status.charAt(0)}${status.slice(1).toLowerCase()} Requests`}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {loading ? "..." : total}
            </h2>

            <p className="mt-1 text-xs text-blue-100">
              Requests matching the selected filter
            </p>
          </div>

          <div className="rounded-2xl bg-white/15 p-4">
            <Truck size={34} />
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTabChange(tab.value)}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              status === tab.value
                ? "bg-blue-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REQUEST LIST */}
      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">
            <Loader2
              size={36}
              className="mx-auto animate-spin text-blue-600"
            />
            <p className="mt-3 text-sm text-slate-500">
              Loading delivery requests...
            </p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <ClipboardCheck
            size={48}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-4 text-lg font-bold text-slate-800">
            No Delivery Requests Found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            There are currently no requests under this category.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {requests.map((request) => {
            const isProcessing = processingId === request.id;
            const isPending = request.status === "PENDING";

            return (
              <div
                key={request.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* CARD HEADER */}
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        Order #{request.order.orderNumber}
                      </h3>

                      <StatusBadge status={request.status} />
                    </div>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays size={14} />
                      Requested: {formatDate(request.requestedAt)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-500">
                      Order Total
                    </p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(request.order.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 p-5 lg:grid-cols-2">
                  {/* RIDER INFORMATION */}
                  <section>
                    <h4 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
                      <Truck size={18} className="text-blue-600" />
                      Rider Information
                    </h4>

                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          <User size={23} />
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">
                            {request.rider.user.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {request.rider.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <Phone size={15} />
                          {request.rider.user.phone || "No phone number"}
                        </p>

                        <p>
                          Vehicle:{" "}
                          <span className="font-semibold text-slate-800">
                            {request.rider.vehicleType || "Not specified"}
                          </span>
                        </p>

                        <p>
                          Plate Number:{" "}
                          <span className="font-semibold text-slate-800">
                            {request.rider.plateNumber || "Not specified"}
                          </span>
                        </p>

                        <p>
                          Availability:{" "}
                          <span className="font-semibold text-slate-800">
                            {request.rider.availability}
                          </span>
                        </p>
                      </div>

                      {request.riderMessage && (
                        <div className="mt-4 rounded-lg bg-white p-3">
                          <p className="text-xs font-bold text-slate-500">
                            RIDER MESSAGE
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            {request.riderMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* ORDER INFORMATION */}
                  <section>
                    <h4 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
                      <Package size={18} className="text-blue-600" />
                      Order Information
                    </h4>

                    <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start gap-3">
                        <Store
                          size={17}
                          className="mt-0.5 text-slate-400"
                        />
                        <div>
                          <p className="text-xs text-slate-500">
                            Store
                          </p>
                          <p className="font-semibold text-slate-800">
                            {request.order.store.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {request.order.store.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User
                          size={17}
                          className="mt-0.5 text-slate-400"
                        />
                        <div>
                          <p className="text-xs text-slate-500">
                            Customer
                          </p>
                          <p className="font-semibold text-slate-800">
                            {request.order.customer.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {request.order.customer.phone ||
                              request.order.customer.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin
                          size={17}
                          className="mt-0.5 text-slate-400"
                        />
                        <div>
                          <p className="text-xs text-slate-500">
                            Delivery Address
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {request.order.deliveryAddress}
                          </p>
                          <p className="text-xs text-slate-500">
                            {request.order.zone?.barangay || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* ORDER ITEMS */}
                <div className="border-t border-slate-100 px-5 py-4">
                  <h4 className="mb-3 text-sm font-bold text-slate-800">
                    Order Items
                  </h4>

                  <div className="space-y-2">
                    {request.order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                            {item.quantity}x
                          </span>

                          <span className="text-slate-700">
                            {item.product.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>
                        {formatCurrency(request.order.subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-500">
                      <span>Delivery Fee</span>
                      <span>
                        {formatCurrency(request.order.deliveryFee)}
                      </span>
                    </div>

                    <div className="flex justify-between pt-2 font-bold text-slate-900">
                      <span>Total Amount</span>
                      <span className="text-blue-700">
                        {formatCurrency(request.order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {request.order.payment && (
                    <p className="mt-3 text-xs text-slate-500">
                      Payment: {request.order.payment.method} ·{" "}
                      {request.order.payment.status}
                    </p>
                  )}
                </div>

                {/* ADMIN NOTE */}
                {isPending && (
                  <div className="border-t border-slate-100 bg-slate-50 p-5">
                    <label
                      htmlFor={`admin-note-${request.id}`}
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Admin Note (Optional)
                    </label>

                    <textarea
                      id={`admin-note-${request.id}`}
                      rows={2}
                      maxLength={500}
                      value={adminNotes[request.id] || ""}
                      onChange={(event) =>
                        setAdminNotes((previous) => ({
                          ...previous,
                          [request.id]: event.target.value,
                        }))
                      }
                      placeholder="Add a note for this rider..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-1 text-right text-xs text-slate-400">
                      {(adminNotes[request.id] || "").length}/500
                    </p>

                    {/* ACTION BUTTONS */}
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => handleReject(request)}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <XCircle size={17} />
                        )}
                        Reject Request
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(request)}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={17} />
                        )}
                        Approve Request
                      </button>
                    </div>
                  </div>
                )}

                {/* REVIEW RESULT */}
                {!isPending && (
                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                    {request.adminNote && (
                      <p className="text-sm text-slate-600">
                        <span className="font-bold">Admin Note:</span>{" "}
                        {request.adminNote}
                      </p>
                    )}

                    {request.reviewedBy && (
                      <p className="mt-1 text-xs text-slate-500">
                        Reviewed by {request.reviewedBy.name}
                        {request.reviewedAt
                          ? ` · ${formatDate(request.reviewedAt)}`
                          : ""}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && requests.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages} · {total} requests
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((previous) => previous - 1)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((previous) => previous + 1)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
