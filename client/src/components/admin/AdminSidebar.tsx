
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Store,
  Users,
  Truck,
  MapPin,
  ClipboardList,
  ClipboardCheck,
  Settings,
  X,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: "Store Applications",
    path: "/admin/store-applications",
    icon: ClipboardList,
  },
  {
    name: "Store Management",
    path: "/admin/store-management",
    icon: Store,
  },
  {
    name: "User Management",
    path: "/admin/users",
    icon: Users,
  },
  {
    name: "Delivery Monitoring",
    path: "/admin/deliveries",
    icon: Truck,
  },
  {
    name: "Delivery Requests",
    path: "/admin/delivery-requests",
    icon: ClipboardCheck,
  },
  {
    name: "Rider Management",
    path: "/admin/rider-management",
    icon: Users,
  },
  {
    name: "Delivery Zones",
    path: "/admin/delivery-zones",
    icon: MapPin,
  },
];

export default function AdminSidebar({
  isOpen,
  onClose,
}: AdminSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      onClose();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Admin logout error:", error);
    }
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <Truck size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                TownExpress
              </h1>
              <p className="text-xs text-slate-400">
                Administration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Main Menu
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                        : "text-slate-400 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-6">
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-blue-400">
              <MapPin size={17} />
              <span className="text-sm font-semibold">
                TownExpress
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Municipality-wide delivery management system.
            </p>
          </div>

          <NavLink
            to="/admin/settings"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <Settings size={19} />
            Settings
          </NavLink>
        </div>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
