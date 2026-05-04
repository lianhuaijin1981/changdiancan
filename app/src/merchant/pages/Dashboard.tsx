import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import {
  ClipboardList,
  DollarSign,
  Clock,
  Armchair,
  UtensilsCrossed,
  BarChart3,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface Order {
  id: string;
  order_no: string;
  status: string;
  total_amount: number;
  created_at: string;
  table_name?: string;
}

interface DashboardData {
  today_count: number;
  today_revenue: number;
  pending_orders: number;
  total_tables: number;
  occupied_tables: number;
  latest_orders: Order[];
}

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "待处理", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  cooking: { label: "制作中", color: "text-[#FF6B35]", bg: "bg-[#FF6B35]/10" },
  ready: { label: "待上菜", color: "text-blue-500", bg: "bg-blue-50" },
  completed: { label: "已完成", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  cancelled: { label: "已取消", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/merchant/dashboard");
      setData(res.data);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "获取数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = data
    ? [
        {
          label: "今日订单",
          value: data.today_count,
          icon: ClipboardList,
          color: "text-[#FF6B35]",
          bg: "bg-[#FF6B35]/10",
        },
        {
          label: "今日营收",
          value: `¥${data.today_revenue.toFixed(2)}`,
          icon: DollarSign,
          color: "text-[#10B981]",
          bg: "bg-[#10B981]/10",
        },
        {
          label: "待处理",
          value: data.pending_orders,
          icon: Clock,
          color: "text-[#EF4444]",
          bg: "bg-[#EF4444]/10",
          badge: data.pending_orders > 0,
        },
        {
          label: "桌台占用",
          value: `${data.occupied_tables}/${data.total_tables}`,
          icon: Armchair,
          color: "text-blue-500",
          bg: "bg-blue-50",
        },
      ]
    : [];

  const quickActions = [
    { label: "订单管理", icon: ClipboardList, path: "/merchant/orders" },
    { label: "菜品管理", icon: UtensilsCrossed, path: "/merchant/dishes" },
    { label: "桌台管理", icon: Armchair, path: "/merchant/tables" },
    { label: "数据报表", icon: BarChart3, path: "/merchant/stats" },
  ];

  const getStatus = (status: string) =>
    statusMap[status] || { label: status, color: "text-[#6B7280]", bg: "bg-[#F5F5F5]" };

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

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="w-full max-w-[430px] bg-white rounded-2xl p-6 text-center shadow-sm">
          <p className="text-[#EF4444] text-sm mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2.5 bg-[#FF6B35] text-white text-sm font-medium rounded-xl active:scale-[0.98] transition-transform"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-8">
      <div className="max-w-[430px] mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">工作台</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {new Date().toLocaleDateString("zh-CN", {
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
          </div>
          <button
            onClick={() => navigate("/merchant/settings")}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <svg
              className="w-5 h-5 text-[#1A1A2E]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 shadow-sm relative overflow-hidden"
            >
              {stat.badge && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#EF4444]" />
              )}
              <div
                className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}
              >
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-lg font-bold text-[#1A1A2E]">{stat.value}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#1A1A2E] mb-3">快捷操作</h2>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex-shrink-0 flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm w-[76px] active:scale-95 transition-transform"
              >
                <div className="w-11 h-11 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-[#FF6B35]" />
                </div>
                <span className="text-xs text-[#1A1A2E] whitespace-nowrap">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Latest Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#1A1A2E]">最新订单</h2>
            <button
              onClick={() => navigate("/merchant/orders")}
              className="text-xs text-[#6B7280] flex items-center gap-0.5 active:opacity-70"
            >
              查看全部
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {data?.latest_orders?.length ? (
              data.latest_orders.slice(0, 5).map((order) => {
                const st = getStatus(order.status);
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#1A1A2E]">
                          {order.order_no}
                        </span>
                        {order.table_name && (
                          <span className="text-xs text-[#6B7280] bg-[#F5F5F5] px-1.5 py-0.5 rounded">
                            {order.table_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        {new Date(order.created_at).toLocaleString("zh-CN", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-bold text-[#1A1A2E]">
                        ¥{order.total_amount.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-lg ${st.bg} ${st.color}`}
                      >
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <ClipboardList className="w-8 h-8 text-[#6B7280]/40 mx-auto mb-2" />
                <p className="text-sm text-[#6B7280]">暂无订单</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
