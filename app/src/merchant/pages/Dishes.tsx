import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMerchant } from "../context/MerchantContext";
import { api } from "../api/client";
import type { Dish } from "../types";
import { Button } from "../../components/ui/button";
import {
  Plus,
  Minus,
  ChevronLeft,
  ImageOff,
  Search,
  SlidersHorizontal,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
}

export default function Dishes() {
  const navigate = useNavigate();
  const { user } = useMerchant();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingStock, setEditingStock] = useState<number | null>(null);
  const [stockInput, setStockInput] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCategories = async () => {
    if (!user?.staff_id) return;
    try {
      const res = await api.get(`/api/categories?store_id=${user?.staff_id}`);
      setCategories(res.data?.data || res.data || []);
    } catch (err: any) {
      // Silently fail for categories
    }
  };

  const fetchDishes = async () => {
    if (!user?.staff_id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/dishes?store_id=${user?.staff_id}`);
      setDishes(res.data?.data || res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "加载菜品失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchDishes();
  }, [user?.staff_id]);

  const handleToggleStatus = async (dishId: number, currentStatus: string) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await api.put(`/api/dishes/${dishId}/status`, { status: newStatus });
      setDishes((prev) =>
        prev.map((d) =>
          d.id === dishId ? { ...d, status: newStatus } : d
        )
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "更新状态失败");
    }
  };

  const handleStockEdit = (dishId: number, currentStock: number) => {
    setEditingStock(dishId);
    setStockInput(currentStock);
  };

  const handleStockSave = async (dishId: number) => {
    try {
      await api.put(`/api/dishes/${dishId}/stock`, { stock: stockInput });
      setDishes((prev) =>
        prev.map((d) =>
          (d as any).id === dishId ? { ...d, stock: stockInput } : d
        )
      );
      setEditingStock(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "更新库存失败");
    }
  };

  const handleStockChange = (delta: number) => {
    setStockInput((prev) => Math.max(0, prev + delta));
  };

  const filteredDishes = dishes.filter((d: any) => {
    const matchCategory = activeCategory === "all" || d.category_id === activeCategory;
    const matchSearch = !searchQuery || (d.name || "").toLowerCase().includes(searchQuery.toLowerCase());
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
          <h1 className="text-lg font-bold text-[#1A1A2E]">菜品管理</h1>
          <div className="w-6" />
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-lg px-3 py-2">
            <Search size={16} color="#6B7280" />
            <input
              type="text"
              placeholder="搜索菜品"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[#1A1A2E] outline-none placeholder:text-[#9CA3AF]"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setActiveCategory("all")}
            className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition"
            style={{
              backgroundColor: activeCategory === "all" ? "#FF6B35" : "#F3F4F6",
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
                backgroundColor: activeCategory === cat.id ? "#FF6B35" : "#F3F4F6",
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
        <div className="mx-4 mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && dishes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-[#6B7280]">加载中...</p>
        </div>
      )}

      {/* Dish Grid */}
      <div className="px-4 py-3 grid grid-cols-2 gap-3 pb-24">
        {filteredDishes.map((dish: any) => {
          const isAvailable = dish.status === 1;
          const stockEnough = (dish.stock || 0) > 10;
          const isEditing = editingStock === dish.id;

          return (
            <div key={dish.id} className="bg-white rounded-xl p-3 shadow-sm">
              {/* Image placeholder */}
              <div
                className="w-full h-24 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: isAvailable ? "#FFF7ED" : "#F3F4F6" }}
              >
                <ImageOff size={28} color={isAvailable ? "#FF6B35" : "#9CA3AF"} />
              </div>

              {/* Name & Price */}
              <h3 className="text-sm font-medium text-[#1A1A2E] truncate mb-1">
                {dish.name}
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold" style={{ color: "#FF6B35" }}>
                  ¥{dish.price?.toFixed(2) || "0.00"}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    color: stockEnough ? "#10B981" : "#EF4444",
                    backgroundColor: stockEnough ? "#D1FAE5" : "#FEE2E2",
                  }}
                >
                  {stockEnough ? "充足" : "不足"}
                </span>
              </div>

              {/* Stock editor */}
              {isEditing ? (
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => handleStockChange(-1)}
                    className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center active:bg-gray-200"
                  >
                    <Minus size={16} color="#6B7280" />
                  </button>
                  <input
                    type="number"
                    value={stockInput}
                    onChange={(e) => setStockInput(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 text-center text-sm font-medium text-[#1A1A2E] bg-transparent outline-none"
                  />
                  <button
                    onClick={() => handleStockChange(1)}
                    className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center active:bg-gray-200"
                  >
                    <Plus size={16} color="#6B7280" />
                  </button>
                  <button
                    onClick={() => handleStockSave(dish.id)}
                    className="ml-2 px-3 py-1 rounded-md text-xs font-medium text-white"
                    style={{ backgroundColor: "#FF6B35", minHeight: 28 }}
                  >
                    保存
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => handleStockEdit(dish.id, dish.stock || 0)}
                  className="flex items-center justify-between mb-2 py-1 px-2 rounded-md bg-[#F5F5F5] cursor-pointer"
                >
                  <span className="text-xs text-[#6B7280]">库存</span>
                  <span className="text-sm font-medium text-[#1A1A2E]">{dish.stock || 0}</span>
                </div>
              )}

              {/* Status toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">
                  {isAvailable ? "上架中" : "已下架"}
                </span>
                <button
                  onClick={() => handleToggleStatus(dish.id, dish.status)}
                  className="relative w-10 h-6 rounded-full transition-colors duration-200"
                  style={{ backgroundColor: isAvailable ? "#10B981" : "#D1D5DB" }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                    style={{ transform: isAvailable ? "translateX(16px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDishes.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <ImageOff size={40} color="#D1D5DB" />
          <p className="mt-3 text-sm text-[#6B7280]">暂无菜品</p>
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => navigate("/merchant/dishes/add")}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition z-20"
        style={{ backgroundColor: "#FF6B35", maxWidth: 430 }}
      >
        <Plus size={24} color="#FFFFFF" />
      </button>
    </div>
  );
}
