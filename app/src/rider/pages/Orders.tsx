import { useState, useEffect } from "react";
import { useRider } from "../context/RiderContext";
import { Package, MapPin, Phone, CheckCircle, Clock, ChevronRight, Navigation } from "lucide-react";

interface OrderItem {
  id: number;
  order_no: string;
  status: string;
  pay_amount: number;
  delivery_address: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_status: string;
  delivery_fee: number;
  items: { dish_name: string; quantity: number }[];
  created_at: string;
}

export default function RiderOrders() {
  const { rider, apiFetch } = useRider();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const loadOrders = async () => {
    try {
      const res = await apiFetch("/riders/orders");
      if (res.code === 200) setOrders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const timer = setInterval(loadOrders, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = async (orderId: number, action: string) => {
    try {
      await apiFetch(`/riders/orders/${orderId}/${action}`, { method: "POST" });
      loadOrders();
    } catch (e: any) {
      alert(e.message || "操作失败");
    }
  };

  const filtered = activeTab === "all" ? orders : orders.filter(o => o.delivery_status === activeTab);

  const tabs = [
    { key: "all", label: "全部" },
    { key: "waiting", label: "待接单" },
    { key: "accepted", label: "配送中" },
    { key: "delivered", label: "已完成" },
  ];

  return (
    <div className="min-h-full bg-[#1E1E1E] text-white">
      {/* Header */}
      <div className="bg-[#2A2A2A] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-bold">配送订单</h1>
          <p className="text-xs text-gray-400">{rider?.store_name || ""}</p>
        </div>
        <button onClick={() => loadOrders()} className="text-xs text-[#D9381E]">
          刷新
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#2A2A2A] border-b border-[#404040]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2.5 text-xs text-center ${activeTab === t.key ? "text-[#D9381E] border-b-2 border-[#D9381E] font-medium" : "text-gray-400"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="p-3 space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">暂无订单</div>
        ) : (
          filtered.map((order) => (
            <div key={order.id} className="bg-[#2A2A2A] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">{order.order_no}</span>
                <StatusBadge status={order.delivery_status} />
              </div>

              <div className="space-y-2 mb-3">
                {order.items.map((item, i) => (
                  <div key={i} className="text-sm">{item.dish_name} x{item.quantity}</div>
                ))}
              </div>

              <div className="flex items-start gap-2 text-xs text-gray-400 mb-3">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span className="flex-1">{order.delivery_address}</span>
                <button
                  onClick={() => {
                    const tencentUrl = `https://apis.map.qq.com/uri/v1/routeplan?type=drive&to=${encodeURIComponent(order.delivery_address)}&referer=canting`;
                    window.open(tencentUrl, "_blank");
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-[#D9381E]/10 text-[#D9381E] rounded-lg font-medium shrink-0 active:opacity-70"
                >
                  <Navigation size={12} />
                  导航
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <Phone size={14} />
                <span>{order.delivery_name} {order.delivery_phone}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#D9381E] font-bold">¥{order.pay_amount}</span>
                <ActionButtons order={order} onAction={handleAction} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; color: string }> = {
    waiting: { text: "待接单", color: "#F59E0B" },
    accepted: { text: "配送中", color: "#3B82F6" },
    picked_up: { text: "已取餐", color: "#8B5CF6" },
    delivered: { text: "已完成", color: "#10B981" },
  };
  const s = map[status] || { text: status, color: "gray" };
  return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: s.color, backgroundColor: s.color + "20" }}>{s.text}</span>;
}

function ActionButtons({ order, onAction }: { order: OrderItem; onAction: (id: number, action: string) => void }) {
  if (order.delivery_status === "waiting") {
    return (
      <button onClick={() => onAction(order.id, "accept")} className="px-4 py-2 bg-[#D9381E] rounded-lg text-xs text-white font-medium flex items-center gap-1">
        <Package size={14} /> 接单
      </button>
    );
  }
  if (order.delivery_status === "accepted") {
    return (
      <button onClick={() => onAction(order.id, "pickup")} className="px-4 py-2 bg-[#3B82F6] rounded-lg text-xs text-white font-medium flex items-center gap-1">
        <CheckCircle size={14} /> 到店取餐
      </button>
    );
  }
  if (order.delivery_status === "picked_up") {
    return (
      <button onClick={() => onAction(order.id, "deliver")} className="px-4 py-2 bg-[#10B981] rounded-lg text-xs text-white font-medium flex items-center gap-1">
        <Navigation size={14} /> 确认送达
      </button>
    );
  }
  return <span className="text-xs text-gray-500">已送达</span>;
}
