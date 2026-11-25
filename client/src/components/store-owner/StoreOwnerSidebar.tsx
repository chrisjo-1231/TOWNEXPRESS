
import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Store,
  Settings,
  LogOut,
  Truck,
  X,
  Users,
  Bell,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { notificationAPI } from "../../services/notification";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    path: "/store-owner",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    path: "/store-owner/products",
    icon: Package,
  },
  {
    name: "Orders",
    path: "/store-owner/orders",
    icon: ShoppingBag,
  },
  {
    name: "Sales Reports",
    path: "/store-owner/sales-reports",
    icon: BarChart3,
  },
  {
    name: "Store Profile",
    path: "/profile",
    icon: Store,
  },
  {
    name: "Staff Management",
    path: "/store-owner/staff",
    icon: Users,
  },
  {
    name: "Notifications",
    path: "/store-owner/notifications",
    icon: Bell,
  },
  {
    name: "Settings",
    path: "/store-owner/settings",
    icon: Settings,
  },
];

export default function StoreOwnerSidebar({
  isOpen,
  onClose,
}: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getAll();
      setUnreadCount(response.unreadCount || 0);
    } catch {
      // Keep sidebar usable if notification loading fails.
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    const interval = window.setInterval(fetchUnreadCount, 30000);

    return () => window.clearInterval(interval);
  }, [fetchUnreadCount]);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* LOGO */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500">
              <Truck size={25} />
            </div>

            <div>
              <h1 className="text-xl font-bold">TownExpress</h1>
              <p className="text-xs text-slate-400">
                Store Owner Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* SECTION TITLE */}
        <div className="px-6 pb-3 pt-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Store Management
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/store-owner"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon size={19} />
                  {item.name}
                </span>

                {item.name === "Notifications" && unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="border-t border-white/10 p-4">
          <button
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
