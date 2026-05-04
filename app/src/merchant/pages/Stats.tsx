import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMerchant } from "../context/MerchantContext";
import { api } from "../api/client";
import { Button } from "../../components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ChevronLeft,
  TrendingUp,
  ShoppingBag,
  Receipt,
  Utensils,
} from "lucide-react";

interface RevenueData {
  date: string;
  revenue: number;
}

interface TopDish {
  name: string;
  sales_count: number;
  revenue: number;
}

interface OrderTypeStat {
  type: string;
  count: number;
}

const PIE_COLORS = ["#FF6B35", "#3B82F6", "#10B981", "#8B5CF6"];

export default function Stats() {
  const navigate = useNavigate();
  const { user } = useMerchant();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topDishes, setTopDishes] = useState<TopDish[]>([]);
  const [orderTypeData, setOrderTypeData] = useState<OrderTypeStat[]>([]);
  const [summary, setSummary] = useState({
    todayRevenue: 0,
    weekRevenue: 0,
    monthOrders: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    if (!user?.staff_id) return;
    setLoading(true);
    setError("");

    try {
      // Revenue chart data
      const revRes = await api.get(
        `/api/dashboard/revenue?store_id=${user?.staff_id}&range_type=week`
      );
      const rev = revRes.data?.data || revRes.data || [];
      setRevenueData(rev);

      // Calculate summary from revenue data
      const todayRev = rev.length > 0 ? rev[rev.length - 1].revenue : 0;
      const weekRev = rev.reduce((sum: number, r: RevenueData) => sum + (r.revenue || 0), 0);
      setSummary((s) => ({ ...s, todayRevenue: todayRev, weekRevenue: weekRev }));

      // Top dishes
      const dishRes = await api.get(
        `/api/dashboard/dishes?store_id=${user?.staff_id}&range_type=week&limit=10`
      );
      setTopDishes(dishRes.data?.data || dishRes.data || []);

      // Order type distribution (optional)
      try {
        const typeRes = await api.get(
          `/api/dashboard/orders?store_id=${user?.staff_id}&range_type=week`
        );
        const typeData = typeRes.data?.data || typeRes.data || [];
        setOrderTypeData(typeData);
      } catch {
        // Optional endpoint, silently fail
      }

      // Month orders count
      try {
        const orderRes = await api.get(
          `/api/dashboard/summary?store_id=${user?.staff_id}&range_type=month`
        );
        const monthData = orderRes.data?.data || orderRes.data || {};
        setSummary((s) => ({
          ...s,
          monthOrders: monthData.order_count || monthData.total_orders || 0,
        }));
      } catch {
        // Fallback
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "加载统计数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.staff_id]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const formatCurrency = (val: number) => {
    return `¥${(val || 0).toFixed(0)}`;
  };

  const orderTypeMap: Record<string, string> = {
    dine_in: "堂食",
    takeaway: "外卖",
    pickup: "自提",
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft size={22} color="#1A1A2E" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A2E]">经营数据</h1>
          <div className="w-6" />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-[#6B7280]">加载中...</p>
        </div>
      )}

      <div className="px-4 py-3 space-y-4 pb-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <Receipt size={14} color="#FF6B35" />
              <span className="text-xs text-[#6B7280]">今日营收</span>
            </div>
            <p className="text-base font-bold text-[#1A1A2E]">
              ¥{summary.todayRevenue.toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={14} color="#10B981" />
              <span className="text-xs text-[#6B7280]">本周营收</span>
            </div>
            <p className="text-base font-bold text-[#1A1A2E]">
              ¥{summary.weekRevenue.toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <ShoppingBag size={14} color="#3B82F6" />
              <span className="text-xs text-[#6B7280]">本月订单</span>
            </div>
            <p className="text-base font-bold text-[#1A1A2E]">
              {summary.monthOrders}
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} color="#FF6B35" />
            <h2 className="text-sm font-bold text-[#1A1A2E]">近7天营收</h2>
          </div>
          {revenueData.length > 0 ? (
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `¥${v}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`¥${(value || 0).toFixed(2)}`, "营收"]}
                    labelFormatter={(label) => formatDate(label)}
                    contentStyle={{
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#FF6B35"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-[#6B7280]">
              暂无营收数据
            </div>
          )}
        </div>

        {/* Top Dishes */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Utensils size={16} color="#FF6B35" />
            <h2 className="text-sm font-bold text-[#1A1A2E]">本周热销菜品</h2>
          </div>
          {topDishes.length > 0 ? (
            <div className="space-y-3">
              {topDishes.slice(0, 10).map((dish, index) => (
                <div key={index} className="flex items-center gap-3">
                  {/* Rank */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{
                      backgroundColor:
                        index === 0
                          ? "#F59E0B"
                          : index === 1
                          ? "#9CA3AF"
                          : index === 2
                          ? "#B45309"
                          : "#E5E7EB",
                      color: index < 3 ? "#FFFFFF" : "#6B7280",
                    }}
                  >
                    {index + 1}
                  </div>
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A2E] truncate">
                      {dish.name}
                    </p>
                  </div>
                  {/* Sales count */}
                  <span className="text-xs text-[#6B7280] whitespace-nowrap">
                    {dish.sales_count} 份
                  </span>
                  {/* Revenue */}
                  <span
                    className="text-sm font-bold whitespace-nowrap"
                    style={{ color: "#FF6B35" }}
                  >
                    ¥{dish.revenue?.toFixed(0) || 0}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-[#6B7280]">暂无数据</div>
          )}
        </div>

        {/* Order Type Pie Chart */}
        {orderTypeData.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag size={16} color="#FF6B35" />
              <h2 className="text-sm font-bold text-[#1A1A2E]">订单类型分布</h2>
            </div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="type"
                  >
                    {orderTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _name: string, props: any) => {
                      const label = orderTypeMap[props?.payload?.type] || props?.payload?.type;
                      return [`${value} 单`, label];
                    }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    formatter={(value: string) =>
                      orderTypeMap[value] || value
                    }
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
