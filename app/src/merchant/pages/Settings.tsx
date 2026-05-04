import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMerchant } from "../context/MerchantContext";
import { api } from "../api/client";
import {
  Store,
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  LogOut,
  Loader2,
  Bell,
  Shield,
  Info,
  Settings,
  Palette,
} from "lucide-react";

interface StoreInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  business_hours: string;
  status: "open" | "closed";
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useMerchant();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fetchStore = async () => {
    try {
      const res = await api.get("/merchant/store");
      setStore(res.data);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "获取店铺信息失败", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setMessage(type === "success" ? `✓ ${msg}` : `✗ ${msg}`);
    setTimeout(() => setMessage(""), 2500);
  };

  const toggleStatus = async () => {
    if (!store) return;
    const newStatus = store.status === "open" ? "closed" : "open";
    setSaving(true);
    try {
      await api.put(`/api/stores/${store.id}/status`, { status: newStatus });
      setStore({ ...store, status: newStatus });
      showToast(newStatus === "open" ? "店铺已开业" : "店铺已休息");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "操作失败", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/merchant/login");
  };

  const menuItems = [
    {
      label: "小程序模板",
      icon: Palette,
      onClick: () => navigate("/merchant/template"),
    },
    {
      label: "门店设置",
      icon: Settings,
      onClick: () => navigate("/merchant/store/edit"),
    },
    {
      label: "公告管理",
      icon: Bell,
      onClick: () => showToast("功能开发中", "error"),
    },
    {
      label: "账号安全",
      icon: Shield,
      onClick: () => showToast("功能开发中", "error"),
    },
    {
      label: "关于我们",
      icon: Info,
      onClick: () => showToast("功能开发中", "error"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
          <p className="text-sm text-[#6B7280]">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-8">
      <div className="max-w-[430px] mx-auto px-4 pt-6">
        {/* Toast */}
        {message && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl text-sm text-white shadow-lg transition-opacity ${
              message.startsWith("✓")
                ? "bg-[#10B981]"
                : "bg-[#EF4444]"
            }`}
          >
            {message.slice(2)}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <ChevronRight className="w-5 h-5 text-[#1A1A2E] rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A2E]">设置</h1>
        </div>

        {/* Store Info Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-[#1A1A2E] truncate">
                {store?.name || "我的店铺"}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    store?.status === "open" ? "bg-[#10B981]" : "bg-[#6B7280]"
                  }`}
                />
                <span className="text-xs text-[#6B7280]">
                  {store?.status === "open" ? "营业中" : "休息中"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#1A1A2E]">
                {store?.address || "暂未设置地址"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
              <p className="text-sm text-[#1A1A2E]">
                {store?.phone || "暂未设置电话"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
              <p className="text-sm text-[#1A1A2E]">
                {store?.business_hours || "暂未设置营业时间"}
              </p>
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                store?.status === "open"
                  ? "bg-[#10B981]/10"
                  : "bg-[#6B7280]/10"
              }`}
            >
              <Store
                className={`w-4 h-4 ${
                  store?.status === "open"
                    ? "text-[#10B981]"
                    : "text-[#6B7280]"
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A1A2E]">营业状态</p>
              <p className="text-xs text-[#6B7280]">
                {store?.status === "open" ? "当前正在营业" : "当前已休息"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleStatus}
            disabled={saving}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              store?.status === "open" ? "bg-[#10B981]" : "bg-[#D1D5DB]"
            } ${saving ? "opacity-60" : ""}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${
                store?.status === "open" ? "translate-x-5" : "translate-x-0"
              }`}
            />
            {saving && (
              <Loader2 className="absolute inset-0 m-auto w-3 h-3 text-white animate-spin" />
            )}
          </button>
        </div>

        {/* Settings Menu */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center justify-between px-5 py-4 text-left active:bg-[#F5F5F5] transition-colors ${
                index < menuItems.length - 1
                  ? "border-b border-[#F5F5F5]"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-[#6B7280]" />
                <span className="text-sm text-[#1A1A2E]">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#D1D5DB]" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3.5 bg-white text-[#EF4444] font-medium rounded-xl shadow-sm flex items-center justify-center gap-2 active:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-[320px] shadow-xl">
              <h3 className="text-base font-bold text-[#1A1A2E] text-center mb-2">
                确认退出登录？
              </h3>
              <p className="text-sm text-[#6B7280] text-center mb-6">
                退出后需要重新登录才能使用商家功能
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 bg-[#F5F5F5] text-[#1A1A2E] text-sm font-medium rounded-xl active:scale-[0.98] transition-transform"
                >
                  取消
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 bg-[#EF4444] text-white text-sm font-medium rounded-xl active:scale-[0.98] transition-transform"
                >
                  确认退出
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}