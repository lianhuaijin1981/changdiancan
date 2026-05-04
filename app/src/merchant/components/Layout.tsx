// 商家端 - 带底部Tab的Layout
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMerchant } from "../context/MerchantContext";
import { Home, ClipboardList, UtensilsCrossed, User } from "lucide-react";

const tabs = [
  { path: "/merchant", icon: Home, label: "工作台" },
  { path: "/merchant/orders", icon: ClipboardList, label: "订单" },
  { path: "/merchant/dishes", icon: UtensilsCrossed, label: "菜品" },
  { path: "/merchant/settings", icon: User, label: "我的" },
];

export default function Layout() {
  const { user } = useMerchant();
  const location = useLocation();
  const navigate = useNavigate();

  const activePath = location.pathname;

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      {/* 顶部标题栏 */}
      <header className="bg-[#FF6B35] text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold">{user?.store_name || "商家管理"}</h1>
          <p className="text-xs text-white/80">{user?.name || ""}</p>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-xs ${user?.store_status === 1 ? 'bg-green-500' : 'bg-gray-400'}`}>
          {user?.store_status === 1 ? "营业中" : "已打烊"}
        </div>
      </header>

      {/* 内容区 */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* 底部Tab */}
      <nav className="bg-white border-t border-gray-200 flex items-center justify-around py-2 shrink-0">
        {tabs.map((tab) => {
          const isActive = activePath === tab.path || (tab.path !== "/merchant" && activePath.startsWith(tab.path));
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${isActive ? "text-[#FF6B35]" : "text-gray-400"}`}
            >
              <tab.icon size={20} />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
