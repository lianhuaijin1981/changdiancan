import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../miniapp/api/client";
import {
  Star,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  Flame,
  ShoppingCart,
  Search,
  Plus,
  ChevronLeft,
} from "lucide-react";

/* ───────── Types ───────── */
interface Store {
  id: number;
  name: string;
  status: "open" | "closed";
  rating: number;
  address: string;
  phone: string;
  business_hours: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Dish {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  image: string;
  rating: number;
  sales: number;
}

interface Banner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

/* ───────── Mock Data ───────── */
const MOCK_STORE: Store = {
  id: 1,
  name: "美味餐厅",
  status: "open",
  rating: 4.8,
  address: "北京市朝阳区建国路88号",
  phone: "010-12345678",
  business_hours: "09:00 - 22:00",
};

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "热菜", icon: "flame" },
  { id: 2, name: "凉菜", icon: "snowflake" },
  { id: 3, name: "汤羹", icon: "droplets" },
  { id: 4, name: "主食", icon: "utensils" },
  { id: 5, name: "饮品", icon: "coffee" },
  { id: 6, name: "甜品", icon: "cake" },
  { id: 7, name: "小吃", icon: "cookie" },
  { id: 8, name: "套餐", icon: "package" },
];

const MOCK_DISHES: Dish[] = [
  {
    id: 1,
    name: "宫保鸡丁",
    price: 38,
    original_price: 48,
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop",
    rating: 4.9,
    sales: 1200,
  },
  {
    id: 2,
    name: "麻婆豆腐",
    price: 22,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop",
    rating: 4.7,
    sales: 980,
  },
  {
    id: 3,
    name: "糖醋排骨",
    price: 52,
    original_price: 68,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
    rating: 4.8,
    sales: 850,
  },
  {
    id: 4,
    name: "清蒸鲈鱼",
    price: 68,
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop",
    rating: 4.9,
    sales: 720,
  },
  {
    id: 5,
    name: "北京烤鸭",
    price: 128,
    original_price: 158,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop",
    rating: 4.9,
    sales: 650,
  },
];

const MOCK_BANNERS: Banner[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop",
    title: "新品尝鲜",
    subtitle: "限时8折优惠",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=400&fit=crop",
    title: "健康轻食",
    subtitle: "新鲜蔬果搭配",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=400&fit=crop",
    title: "精选套餐",
    subtitle: "超值组合立省30元",
  },
];

/* ───────── Components ───────── */

export default function ModernHome() {
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [cartCount, setCartCount] = useState(2);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API calls with mock data
        await new Promise((resolve) => setTimeout(resolve, 600));
        setStore(MOCK_STORE);
        setCategories(MOCK_CATEGORIES);
        setDishes(MOCK_DISHES);
        setBanners(MOCK_BANNERS);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-play banner carousel
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleAddToCart = (dishId: number) => {
    setCartCount((prev) => prev + 1);
    // In real app: api.post("/api/cart", { dish_id: dishId })
    console.log("Added to cart:", dishId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--tmpl-bg)" }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: "var(--tmpl-primary)" }} />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "var(--tmpl-bg)", maxWidth: 430, margin: "0 auto" }}>
      {/* ── Header Bar ── */}
      <header
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: "var(--tmpl-primary)" }}
      >
        <div className="flex items-center gap-2">
          <button className="p-1" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} style={{ color: "var(--tmpl-text-inverse)" }} />
          </button>
          <h1 className="text-base font-semibold" style={{ color: "var(--tmpl-text-inverse)", fontFamily: "var(--tmpl-heading-font)" }}>
            {store.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: store.status === "open" ? "var(--tmpl-success)" : "var(--tmpl-danger)",
              color: "var(--tmpl-text-inverse)",
            }}
          >
            {store.status === "open" ? "营业中" : "已打烊"}
          </span>
          <button className="relative p-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
            <ShoppingCart size={18} style={{ color: "var(--tmpl-text-inverse)" }} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                style={{ backgroundColor: "var(--tmpl-danger)", color: "var(--tmpl-text-inverse)" }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Search Bar ── */}
      <div className="px-4 py-3">
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-full"
          style={{ backgroundColor: "var(--tmpl-surface)" }}
        >
          <Search size={18} style={{ color: "var(--tmpl-text-muted)" }} />
          <input
            type="text"
            placeholder="搜索美食..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: "var(--tmpl-text)", fontFamily: "var(--tmpl-body-font)" }}
          />
        </div>
      </div>

      {/* ── Store Info ── */}
      <div className="px-4 pb-3 flex items-center gap-3 text-xs" style={{ color: "var(--tmpl-text-muted)" }}>
        <div className="flex items-center gap-1">
          <Star size={12} style={{ color: "var(--tmpl-warning)" }} fill="var(--tmpl-warning)" />
          <span>{store.rating}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{store.business_hours}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={12} />
          <span className="truncate max-w-[120px]">{store.address}</span>
        </div>
      </div>

      {/* ── Banner Carousel ── */}
      <div className="px-4 mb-4">
        <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "2/1" }}>
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            {banners.map((banner) => (
              <div key={banner.id} className="w-full flex-shrink-0 relative">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: "2/1" }}
                />
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }}
                />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white text-base font-bold" style={{ fontFamily: "var(--tmpl-heading-font)" }}>
                    {banner.title}
                  </h3>
                  <p className="text-white/80 text-xs mt-0.5">{banner.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Dots */}
          <div className="absolute bottom-2 right-3 flex gap-1">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBanner(idx)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: idx === currentBanner ? "var(--tmpl-primary)" : "rgba(255,255,255,0.5)",
                  width: idx === currentBanner ? 16 : 6,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Category Grid ── */}
      <div className="px-4 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors flex-shrink-0"
              style={{
                backgroundColor: activeCategory === cat.id ? "var(--tmpl-primary)" : "var(--tmpl-surface)",
                color: activeCategory === cat.id ? "var(--tmpl-text-inverse)" : "var(--tmpl-text)",
                fontFamily: "var(--tmpl-body-font)",
              }}
            >
              <Flame size={14} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Featured Dishes Section ── */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Flame size={18} style={{ color: "var(--tmpl-primary)" }} />
            <h2
              className="text-base font-bold"
              style={{ color: "var(--tmpl-text)", fontFamily: "var(--tmpl-heading-font)" }}
            >
              热销推荐
            </h2>
          </div>
          <button
            className="flex items-center gap-0.5 text-xs"
            style={{ color: "var(--tmpl-text-muted)" }}
            onClick={() => navigate("/menu")}
          >
            查看更多
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Horizontal scroll cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="flex-shrink-0 w-[150px] rounded-xl overflow-hidden"
              style={{
                backgroundColor: "var(--tmpl-surface)",
                boxShadow: "var(--tmpl-shadow-card)",
              }}
            >
              <div className="relative">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-[100px] object-cover"
                />
                {dish.original_price && (
                  <span
                    className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={{ backgroundColor: "var(--tmpl-badge-hot)", color: "var(--tmpl-text-inverse)" }}
                  >
                    特惠
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <h3
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--tmpl-text)", fontFamily: "var(--tmpl-body-font)" }}
                >
                  {dish.name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={10} style={{ color: "var(--tmpl-warning)" }} fill="var(--tmpl-warning)" />
                  <span className="text-[10px]" style={{ color: "var(--tmpl-text-muted)" }}>
                    {dish.rating}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--tmpl-text-muted)" }}>
                    月销{dish.sales}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs" style={{ color: "var(--tmpl-primary)" }}>
                      ¥
                    </span>
                    <span
                      className="text-base font-bold"
                      style={{ color: "var(--tmpl-primary)" }}
                    >
                      {dish.price}
                    </span>
                    {dish.original_price && (
                      <span
                        className="text-[10px] line-through"
                        style={{ color: "var(--tmpl-text-muted)" }}
                      >
                        ¥{dish.original_price}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(dish.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--tmpl-primary)",
                      color: "var(--tmpl-text-inverse)",
                      boxShadow: "var(--tmpl-shadow-button)",
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Today's Special Banner ── */}
      <div className="px-4 mb-5">
        <div
          className="relative rounded-xl overflow-hidden p-4"
          style={{
            background: "linear-gradient(135deg, var(--tmpl-primary) 0%, var(--tmpl-primary-dark) 100%)",
            boxShadow: "var(--tmpl-shadow-elevated)",
          }}
        >
          <div className="relative z-10">
            <span
              className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "var(--tmpl-text-inverse)" }}
            >
              限时特惠
            </span>
            <h3
              className="text-lg font-bold mb-1"
              style={{ color: "var(--tmpl-text-inverse)", fontFamily: "var(--tmpl-heading-font)" }}
            >
              今日特惠套餐
            </h3>
            <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
              精选3款招牌菜，原价¥168，现仅需¥99
            </p>
            <button
              className="px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: "var(--tmpl-text-inverse)",
                color: "var(--tmpl-primary)",
              }}
              onClick={() => navigate("/special")}
            >
              立即抢购
            </button>
          </div>
          {/* Decorative circles */}
          <div
            className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20"
            style={{ backgroundColor: "var(--tmpl-text-inverse)" }}
          />
          <div
            className="absolute -right-2 bottom-2 w-12 h-12 rounded-full opacity-15"
            style={{ backgroundColor: "var(--tmpl-text-inverse)" }}
          />
        </div>
      </div>

      {/* ── All Dishes Grid ── */}
      <div className="px-4">
        <div className="flex items-center gap-1.5 mb-3">
          <ShoppingCart size={18} style={{ color: "var(--tmpl-primary)" }} />
          <h2
            className="text-base font-bold"
            style={{ color: "var(--tmpl-text)", fontFamily: "var(--tmpl-heading-font)" }}
          >
            全部菜品
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {dishes.map((dish) => (
            <div
              key={`grid-${dish.id}`}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: "var(--tmpl-surface)",
                boxShadow: "var(--tmpl-shadow-card)",
              }}
            >
              <img
                src={dish.image}
                alt={dish.name}
                className="w-full h-[110px] object-cover"
              />
              <div className="p-2.5">
                <h3
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--tmpl-text)", fontFamily: "var(--tmpl-body-font)" }}
                >
                  {dish.name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold" style={{ color: "var(--tmpl-primary)" }}>
                    ¥{dish.price}
                  </span>
                  <button
                    onClick={() => handleAddToCart(dish.id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--tmpl-primary)",
                      color: "var(--tmpl-text-inverse)",
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Safe Area ── */}
      <div className="h-8" />
    </div>
  );
}
