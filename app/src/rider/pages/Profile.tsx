import { useRider } from "../context/RiderContext";
import { User, Bike, Package, LogOut, ChevronRight } from "lucide-react";

export default function RiderProfile() {
  const { rider, logout } = useRider();

  return (
    <div className="min-h-full bg-[#1E1E1E] text-white">
      {/* Header */}
      <div className="bg-[#2A2A2A] px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#D9381E] rounded-full flex items-center justify-center">
            <Bike size={28} color="white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{rider?.name || "骑手"}</h2>
            <p className="text-xs text-gray-400">{rider?.store_name || ""}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 p-3">
        <div className="bg-[#2A2A2A] rounded-xl p-4 text-center">
          <Package size={24} className="text-[#D9381E] mx-auto mb-2" />
          <div className="text-xl font-bold">{rider?.today_orders || 0}</div>
          <div className="text-xs text-gray-400 mt-1">今日配送</div>
        </div>
        <div className="bg-[#2A2A2A] rounded-xl p-4 text-center">
          <Bike size={24} className="text-[#10B981] mx-auto mb-2" />
          <div className="text-xl font-bold">在线</div>
          <div className="text-xs text-gray-400 mt-1">工作状态</div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-3 space-y-2">
        <div className="bg-[#2A2A2A] rounded-xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-[#404040]">
            <div className="flex items-center gap-3">
              <User size={18} className="text-gray-400" />
              <span className="text-sm">手机号</span>
            </div>
            <span className="text-sm text-gray-400">{rider?.phone || "-"}</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bike size={18} className="text-gray-400" />
              <span className="text-sm">所属门店</span>
            </div>
            <span className="text-sm text-gray-400">{rider?.store_name || "-"}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full bg-[#2A2A2A] rounded-xl px-4 py-3 flex items-center justify-between text-red-400"
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} />
            <span className="text-sm">退出登录</span>
          </div>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
