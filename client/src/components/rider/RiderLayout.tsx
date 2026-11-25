import { useState, type ComponentType } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Truck } from "lucide-react";
import RiderSidebar from "./RiderSidebar";

const SidebarWithControls = RiderSidebar as ComponentType<{
  isOpen: boolean;
  onClose: () => void;
}>;

export default function RiderLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <SidebarWithControls
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-72">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Open sidebar"
          >
            <Menu size={23} />
          </button>

          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-600 p-2 text-white">
              <Truck size={18} />
            </div>
            <span className="font-bold text-slate-900">TownExpress</span>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}