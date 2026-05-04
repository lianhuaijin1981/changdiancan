import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMerchant } from "../context/MerchantContext";
import { api } from "../api/client";
import {
  ChevronLeft,
  Package,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  Search,
  UtensilsCrossed,
  Loader2,
} from "lucide-react";

interface InventoryDish {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  category_id: number;
  category_name?: string;
  stock: number;
  status: number;
}

interface InventorySummary {
  total_dishes: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

interface Category {
  id: number;
  name: string;
}

export default function Inventory() {
  const navigate = useNavigate();
  const { user } = useMerchant();
  const [dishes, setDishes] = useState<InventoryDish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({
    total_dishes: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const storeId = user?.staff_id || 1;

  const fetchInventory = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch summary
      const summaryRes = await api.get(`/api/inventory/summary?store_id=${storeId}`);
      setSummary(summaryRes || { total_dishes: 0, low_stock_count: 0, out_of_stock_count: 0 });

      // Fetch dishes with stock info
      const dishesRes = await api.get(`/api/dishes?store_id=${storeId}`);
      const dishList = (dishesRes.data?.data || dishesRes.data || []).map((d: any) => ({
        ...d,
        stock: d.stock ?? 0,
      }));
      setDishes(dishList);

      // Fetch categories
      const catsRes = await api.get(`/api/categories?store_id=${storeId}`);
      setCategories(catsRes.data?.data || catsRes.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "加载库存数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [storeId]);

  const handleUpdateStock = async (dishId: number, newStock: number) => {
    if (newStock < 0) return;
    setUpdatingId(dishId);
    try {
      await api.put(`/api/inventory/dishes/${dishId}/stock`, { stock: newStock });
      setDishes((prev) =>
        prev.map((d) => (d.id === dishId ? { ...d, stock: newStock } : d))
      );
      // Refresh summary
      const summaryRes = await api.get(`/api/inventory/summary?store_id=${storeId}`);
      setSummary(summaryRes || summary);
    } catch (err: any) {
      setError(err?.response?.data?.message || "更新库存失败");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "已售罄", color: "#EF4444", bg: "#FEE2E2" };
    if (stock <= 5) return { label: "紧张", color: "#F97316", bg: "#FFF7ED" };
    if (stock <= 20) return { label: "一般", color: "#EAB308", bg: "#FEF9C3" };
    return { label: "充足", color: "#10B981", bg: "#D1FAE5" };
  };

  const filteredDishes = dishes.filter((d) => {
    const matchCategory = activeCategory === "all" || d.category_id === activeCategory;
    const matchSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft size={22} color="#1A1A2E" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A2E]">库存管理</h1>
          <div className="w-6" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 pt-4 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Package size={16} className="text-blue-600" />
          </div>
          <p className="text-lg font-bold text-[#1A1A2E]">{summary.total_dishes}</p>
          <p className="text-[10px] text-[#6B7280]">总菜品数</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <AlertTriangle size={16} className="text-orange-600" />
          </div>
          <p className="text-lg font-bold text-[#1A1A2E]">{summary.low_stock_count}</p>
          <p className="text-[10px] text-[#6B7280]">库存不足</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <XCircle size={16} className="text-red-600" />
          </div>
          <p className="text-lg font-bold text-[#1A1A2E]">{summary.out_of_stock_count}</p>
          <p className="text-[10px] text-[#6B7280]">已售罄</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm mb-3">
          <Search size={16} color="#6B7280" />
          <input
            type="text"
            placeholder="搜索菜品名称"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#1A1A2E] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setActiveCategory("all")}
            className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition"
            style={{
              backgroundColor: activeCategory === "all" ? "#FF6B35" : "#FFFFFF",
              color: activeCategory === "all" ? "#FFFFFF" : "#6B7280",
              minHeight: 36,
            }}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition"
              style={{
                backgroundColor: activeCategory === cat.id ? "#FF6B35" : "#FFFFFF",
                color: activeCategory === cat.id ? "#FFFFFF" : "#6B7280",
                minHeight: 36,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-3 p-3 bg-red-50 rounded-lg text-sm text-red-600">{error}</div>
      )}

      {/* Loading */}
      {loading && dishes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="text-[#FF6B35] animate-spin mb-3" />
          <p className="text-sm text-[#6B7280]">加载中...</p>
        </div>
      )}

      {/* Dish List */}
      <div className="px-4 pb-6 space-y-3">
        {filteredDishes.map((dish) => {
          const status = getStockStatus(dish.stock);
          return (
            <div key={dish.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                {/* Dish Image or Placeholder */}
                {dish.image_url ? (
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-[#FFF7ED] flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed size={20} className="text-[#FF6B35]" />
                  </div>
                )}

                {/* Dish Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-[#1A1A2E] truncate">{dish.name}</h3>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
                      style={{ color: status.color, backgroundColor: status.bg }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    ¥{dish.price?.toFixed(2) || "0.00"}
                  </p>
                </div>

                {/* Stock Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateStock(dish.id, dish.stock - 1)}
                    disabled={updatingId === dish.id}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center active:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    <Minus size={16} color="#6B7280" />
                  </button>
                  <span className="text-sm font-bold text-[#1A1A2E] w-8 text-center">
                    {updatingId === dish.id ? (
                      <Loader2 size={14} className="animate-spin mx-auto text-[#FF6B35]" />
                    ) : (
                      dish.stock
                    )}
                  </span>
                  <button
                    onClick={() => handleUpdateStock(dish.id, dish.stock + 1)}
                    disabled={updatingId === dish.id}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center active:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    <Plus size={16} color="#6B7280" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDishes.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Package size={40} color="#D1D5DB" />
            <p className="mt-3 text-sm text-[#6B7280]">暂无菜品数据</p>
          </div>
        )}
      </div>

      {/* Link to Dish Management */}
      <div className="px-4 pb-8">
        <button
          onClick={() => navigate("/merchant/dishes")}
          className="w-full py-3 bg-white rounded-xl text-sm text-[#FF6B35] font-medium shadow-sm flex items-center justify-center gap-2 active:bg-orange-50 transition-colors"
        >
          <UtensilsCrossed size={16} />
          前往菜品管理
        </button>
      </div>
    </div>
  );
}
