import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMerchant } from "../context/MerchantContext";
import { api } from "../api/client";
import type { Order } from "../types";
import { Button } from "../../components/ui/button";
import {
  RefreshCw,
  Clock,
  ChefHat,
  Utensils,
  CheckCircle,
  ShoppingBag,
  User,
  Table as TableIcon,
  ArrowLeft,
} from "lucide-react";

const STATUS_TABS = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待接单" },
  { key: "preparing", label: "制作中" },
  { key: "ready", label: "待上菜" },
  { key: "served", label: "已完成" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "待接单", color: "#F59E0B", bg: "#FEF3C7" },
  paid: { label: "已支付", color: "#F59E0B", bg: "#FEF3C7" },
  preparing: { label: "制作中", color: "#3B82F6", bg: "#DBEAFE" },
  ready: { label: "待上菜", color: "#8B5CF6", bg: "#EDE9FE" },
  served: { label: "已上菜", color: "#10B981", bg: "#D1FAE5" },
  completed: { label: "已完成", color: "#6B7280", bg: "#F3F4F6" },
  cancelled: { label: "已取消", color: "#EF4444", bg: "#FEE2E2" },
};

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  dine_in: { label: "堂食", color: "#10B981", bg: "#D1FAE5" },
  takeaway: { label: "外卖", color: "#3B82F6", bg: "#DBEAFE" },
  pickup: { label: "自提", color: "#8B5CF6", bg: "#EDE9FE" },
};

const NEXT_ACTION: Record<string, { label: string; nextStatus: string; variant: string }> = {
  pending: { label: "接单", nextStatus: "preparing", variant: "green" },
  paid: { label: "接单", nextStatus: "preparing", variant: "green" },
  preparing: { label: "制作完成", nextStatus: "ready", variant: "blue" },
  ready: { label: "确认上菜", nextStatus: "served", variant: "green" },
  served: { label: "完成", nextStatus: "completed", variant: "gray" },
};

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useMerchant();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user?.staff_id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/orders?store_id=${user?.staff_id}`);
      setOrders(res.data?.data || res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "加载订单失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [user?.staff_id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleStatusUpdate = async (orderId: number, nextStatus: string) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: nextStatus });
      fetchOrders();
    } catch (err: any) {
      setError(err?.response?.data?.message || "更新状态失败");
    }
  };

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((o: any) => {
          if (activeTab === "pending") return o.status === "pending" || o.status === "paid";
          return o.status === activeTab;
        });

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const d = new Date(timeStr);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={22} color="#1A1A2E" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A2E]">订单管理</h1>
          <button onClick={handleRefresh} className="p-1">
            <RefreshCw size={20} color="#6B7280" className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition"
              style={{
                backgroundColor: activeTab === tab.key ? "#FF6B35" : "#F3F4F6",
                color: activeTab === tab.key ? "#FFFFFF" : "#6B7280",
                minHeight: 36,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw size={28} color="#6B7280" className="animate-spin mb-3" />
          <p className="text-sm text-[#6B7280]">加载中...</p>
        </div>
      )}

      {/* Order Cards */}
      <div className="px-4 py-3 space-y-3 pb-24">
        {filteredOrders.map((order: any) => {
          const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const typeCfg = TYPE_CONFIG[order.order_type] || TYPE_CONFIG.dine_in;
          const action = NEXT_ACTION[order.status];
          const items = order.items || [];

          return (
            <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-1 rounded-md text-xs font-medium"
                    style={{ color: typeCfg.color, backgroundColor: typeCfg.bg }}
                  >
                    {typeCfg.label}
                  </span>
                  <span
                    className="px-2 py-1 rounded-md text-xs font-medium"
                    style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}
                  >
                    {statusCfg.label}
                  </span>
                </div>
                <span className="text-xs text-[#6B7280]">
                  {formatTime(order.created_at)}
                </span>
              </div>

              {/* Info row */}
              <div className="flex items-center gap-4 mb-3 text-sm text-[#1A1A2E]">
                <div className="flex items-center gap-1">
                  {order.order_type === "dine_in" ? (
                    <TableIcon size={14} color="#6B7280" />
                  ) : (
                    <User size={14} color="#6B7280" />
                  )}
                  <span className="font-medium">
                    {order.order_type === "dine_in"
                      ? `桌号 ${order.table_no || "-"}`
                      : order.customer_name || "顾客"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingBag size={14} color="#6B7280" />
                  <span className="text-[#6B7280]">#{order.order_no || order.id}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1 mb-3">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-[#1A1A2E]">
                      {item.dish_name || item.name} × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total & Action */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-[#6B7280]">
                  共 {items.reduce((s: number, i: any) => s + (i.quantity || 0), 0)} 件
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold" style={{ color: "#FF6B35" }}>
                    ¥{order.total_amount?.toFixed(2) || "0.00"}
                  </span>
                  {action && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, action.nextStatus)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white active:scale-95 transition"
                      style={{
                        minHeight: 36,
                        backgroundColor:
                          action.variant === "green"
                            ? "#10B981"
                            : action.variant === "blue"
                            ? "#3B82F6"
                            : "#6B7280",
                      }}
                    >
                      {action.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <CheckCircle size={40} color="#D1D5DB" />
            <p className="mt-3 text-sm text-[#6B7280]">暂无订单</p>
          </div>
        )}
      </div>
    </div>
  );
}
