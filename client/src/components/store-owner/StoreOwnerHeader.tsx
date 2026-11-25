
import { Menu, Bell, Store } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface Props {
  onMenuClick: () => void;
}

export default function StoreOwnerHeader({ onMenuClick }: Props) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={23} />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Store Dashboard
          </h2>
          <p className="hidden text-xs text-slate-500 sm:block">
            Manage your store and orders
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={21} />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user?.name || "Store Owner"}
            </p>
            <p className="text-xs text-slate-500">Store Owner</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <Store size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
