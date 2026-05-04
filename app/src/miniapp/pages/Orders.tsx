import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { Order, OrderStatus } from "../types";
import {
  ChevronRight,
  Utensils,
  Package,
  Truck,
  RefreshCw,
} from "lucide-react";

const TABS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待支付" },
  { key: "preparing", label: "制作中" },
  { key: "ready", label: "待取餐" },
  { key: "completed", label: "已完成" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "待支付", color: "text-orange-500 bg-orange-50" },
  paid: { label: "已支付", color: "text-blue-500 bg-blue-50" },
  preparing: { label: "制作中", color: "text-yellow-500 bg-yellow-50" },
  ready: { label: "待取餐", color: "text-green-500 bg-green-50" },
  completed: { label: "已完成", color: "text-gray-500 bg-gray-50" },
  cancelled: { label: "已取消", color: "text-red-500 bg-red-50" },
};

const ORDER_TYPE_ICON: Record<string, React.ReactNode> = {
  dine_in: <Utensils size={12} />,
  takeout: <Package size={12} />,
  delivery: <Truck size={12} />,
};

export default function Orders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/orders/");
      setOrders(Array.isArray(res) ? res : []);
    } catch {
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setTimeout(() => setRefreshing(false), 500);
  };

  const filtered = activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-bold text-lg">我的订单</h1>
        <button onClick={onRefresh} className={`p-2 ${refreshing ? "animate-spin" : ""}`}>
          <RefreshCw size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white flex overflow-x-auto no-scrollbar border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-4 py-3 text-sm relative transition ${
              activeTab === tab.key
                ? "text-orange-500 font-bold"
                : "text-gray-500"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-orange-500 rounded" />
            )}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="p-3 space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-400 text-sm">暂无订单</p>
          </div>
        )}
        {filtered.map((order) => {
          const status = STATUS_MAP[order.status] || { label: order.status, color: "" };
          return (
            <div
              key={order.id}
              className="bg-white rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{ORDER_TYPE_ICON[order.order_type]}</span>
                  <span className="text-xs text-gray-500">
                    {order.order_no}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>
                  {status.label}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                {order.items?.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1">
                      {item.dish_name} {item.spec_name && `(${item.spec_name})`}
                    </span>
                    <span className="text-gray-400 text-xs">x{item.quantity}</span>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <p className="text-xs text-gray-400">等 {order.items.length} 件商品</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    实付 <span className="font-bold">¥{order.pay_amount?.toFixed(2)}</span>
                  </span>
                </div>
              </div>

              {order.status === "pending" && (
                <div className="flex gap-2 mt-3 justify-end">
                  <button
                    onClick={() => navigate(`/payment/${order.order_no}`)}
                    className="bg-orange-500 text-white text-xs px-4 py-1.5 rounded-full"
                  >
                    去支付
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
