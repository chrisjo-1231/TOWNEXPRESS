
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import type { Store } from "../../services/store-owner";

interface Props {
  store: Store;
}

export default function StoreStatusCard({ store }: Props) {
  const statusConfig = {
    PENDING: {
      title: "Application Pending",
      description:
        "Your store registration is waiting for administrator approval.",
      className: "border-amber-200 bg-amber-50 text-amber-800",
      Icon: Clock,
    },
    APPROVED: {
      title: "Store Approved",
      description:
        "Your store has been approved. You can now manage your store.",
      className: "border-green-200 bg-green-50 text-green-800",
      Icon: CheckCircle,
    },
    REJECTED: {
      title: "Application Rejected",
      description:
        store.rejectionReason || "Your store application was rejected.",
      className: "border-red-200 bg-red-50 text-red-800",
      Icon: XCircle,
    },
    SUSPENDED: {
      title: "Store Suspended",
      description:
        "Your store is currently suspended. Please contact the administrator.",
      className: "border-orange-200 bg-orange-50 text-orange-800",
      Icon: AlertTriangle,
    },
  };

  const config = statusConfig[store.status];
  const Icon = config.Icon;

  return (
    <div className={`rounded-2xl border p-5 ${config.className}`}>
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-white/70 p-3">
          <Icon size={25} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{config.title}</h3>
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">
              {store.status}
            </span>
          </div>

          <p className="mt-2 text-sm">{config.description}</p>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <MapPin size={16} />
            <span>
              {store.address}, {store.barangay}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
