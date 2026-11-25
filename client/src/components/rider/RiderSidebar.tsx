
import { NavLink, useNavigate } from "react-router-dom";
import {
  Truck,
  LayoutDashboard,
  ClipboardList,
  PackageSearch,
  LogOut,
  X,
  Settings,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface RiderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RiderSidebar({
  isOpen,
  onClose,
}: RiderSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      label: "Dashboard",
      path: "/rider",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Available Deliveries",
      path: "/rider/available-deliveries",
      icon: PackageSearch,
      end: false,
    },
    {
      label: "Assigned Deliveries",
      path: "/rider/assigned-deliveries",
      icon: ClipboardList,
      end: false,
    },
    {
      label: "Earnings",
      path: "/rider/earnings",
      icon: LayoutDashboard,
      end: false,
    },
    {
      label: "Profile",
      path: "/rider/profile",
      icon: Settings,
      end: false,
    },
  ];

  async function handleLogout() {
    try {
      await logout();
      onClose();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Rider logout error:", error);
    }
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2">
              <Truck size={23} />
            </div>

            <div>
              <h1 className="font-bold">TownExpress</h1>
              <p className="text-xs text-slate-400">Rider Portal</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Rider Menu
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
