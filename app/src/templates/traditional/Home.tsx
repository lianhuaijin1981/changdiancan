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
  Utensils,
  Coffee,
  Cookie,
  Droplets,
  Snowflake,
  Package,
  Scroll,
  Minus,
  Plus,
  Volume2,
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
  announcement?: string;
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
  description: string;
  is_hot?: boolean;
  is_feature?: boolean;
}

/* ───────── Mock Data ───────── */
const MOCK_STORE: Store = {
  id: 1,
  name: "老北京饭庄",
  status: "open",
  rating: 4.9,
  address: "北京市东城区王府井大街1号",
  phone: "010-88886666",
  business_hours: "10:00 - 21:30",
  announcement: "春节期间正常营业，预定年夜饭送精美礼品一份！",
};

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "热菜", icon: "flame" },
  { id: 2, name: "凉菜", icon: "snowflake" },
  { id: 3, name: "汤羹", icon: "droplets" },
  { id: 4, name: "主食", icon: "utensils" },
  { id: 5, name: "饮品", icon: "coffee" },
  { id: 6, name: "甜品", icon: "cookie" },
  { id: 7, name: "套餐", icon: "package" },
  { id: 8, name: "招牌", icon: "scroll" },
];

const MOCK_DISHES: Dish[] = [
  {
    id: 1,
    name: "北京烤鸭",
    price: 168,
    original_price: 198,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop",
    description: "精选优质填鸭，果木烤制，皮脆肉嫩，配薄饼葱丝甜面酱",
    is_hot: true,
    is_feature: true,
  },
  {
    id: 2,
    name: "宫保鸡丁",
    price: 42,
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop",
    description: "传统川菜，鸡肉鲜嫩，花生酥脆，麻辣鲜香",
    is_hot: true,
  },
  {
    id: 3,
    name: "糖醋里脊",
    price: 38,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
    description: "外酥里嫩，酸甜适口，老少皆宜",
    is_feature: true,
  },
  {
    id: 4,
    name: "清蒸鲈鱼",
    price: 88,
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop",
    description: "鲜活鲈鱼，清蒸锁鲜，肉质细嫩，营养丰富",
    is_hot: true,
  },
  {
    id: 5,
    name: "麻婆豆腐",
    price: 22,
    original_price: 28,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop",
    description: "嫩豆腐配牛肉末，麻辣鲜香，下饭神器",
    is_feature: true,
  },
];

const iconMap: Record<string, React.ReactNode> = {
  flame: <Flame size={20} />,
  snowflake: <Snowflake size={20} />,
  droplets: <Droplets size={20} />,
  utensils: <Utensils size={20} />,
  coffee: <Coffee size={20} />,
  cookie: <Cookie size={20} />,
  package: <Package size={20} />,
  scroll: <Scroll size={20} />,
};

/* ───────── Components ───────── */

export default function TraditionalHome() {
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [serviceMode, setServiceMode] = useState<"dinein" | "delivery">("dinein");
  const [cartCount, setCartCount] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 700));
        setStore(MOCK_STORE);
        setCategories(MOCK_CATEGORIES);
        setDishes(MOCK_DISHES);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = (dishId: number) => {
    setCartCount((prev) => prev + 1);
    console.log("Added to cart:", dishId);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--tmpl-bg)" }}
      >
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: "var(--tmpl-primary)" }}
        />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        backgroundColor: "var(--tmpl-bg)",
        maxWidth: 430,
        margin: "0 auto",
        fontFamily: "var(--tmpl-body-font)",
      }}
    >
      {/* ── Decorative Top Header ── */}
      <header
        className="relative px-4 pt-4 pb-5 overflow-hidden"
        style={{
          backgroundColor: "var(--tmpl-primary-dark)",
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(255,215,0,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,215,0,0.06) 0%, transparent 50%)",
          borderBottom: "2px solid var(--tmpl-secondary)",
        }}
      >
        {/* Service Mode Toggle */}
        <div className="flex justify-center mb-4">
          <div
            className="flex rounded-full p-0.5"
            style={{
              backgroundColor: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,215,0,0.3)",
            }}
          >
            <button
              onClick={() => setServiceMode("dinein")}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: serviceMode === "dinein" ? "var(--tmpl-secondary)" : "transparent",
                color: serviceMode === "dinein" ? "var(--tmpl-primary-dark)" : "rgba(255,255,255,0.7)",
              }}
            >
              堂食
            </button>
            <button
              onClick={() => setServiceMode("delivery")}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: serviceMode === "delivery" ? "var(--tmpl-secondary)" : "transparent",
                color: serviceMode === "delivery" ? "var(--tmpl-primary-dark)" : "rgba(255,255,255,0.7)",
              }}
            >
              外卖
            </button>
          </div>
        </div>

        {/* Store Name with Decorative Lines */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-px flex-1 max-w-[60px]" style={{ backgroundColor: "var(--tmpl-secondary)", opacity: 0.6 }} />
          <h1
            className="text-xl font-bold tracking-wider"
            style={{
              color: "var(--tmpl-secondary)",
              fontFamily: "var(--tmpl-heading-font)",
            }}
          >
            {store.name}
          </h1>
          <div className="h-px flex-1 max-w-[60px]" style={{ backgroundColor: "var(--tmpl-secondary)", opacity: 0.6 }} />
        </div>

        {/* Store Meta */}
        <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
          <div className="flex items-center gap-1">
            <Star size={12} style={{ color: "var(--tmpl-secondary)" }} fill="var(--tmpl-secondary)" />
            <span>{store.rating}分</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{store.business_hours}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone size={12} />
            <span>{store.phone}</span>
          </div>
        </div>
      </header>

      {/* ── Announcement Bar ── */}
      {store.announcement && (
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{
            backgroundColor: "var(--tmpl-primary)",
            color: "var(--tmpl-secondary)",
          }}
        >
          <Volume2 size={14} />
          <div className="flex-1 overflow-hidden">
            <div className="whitespace-nowrap text-xs animate-marquee">
              {store.announcement}
            </div>
          </div>
        </div>
      )}

      {/* ── Category Grid ── */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className="flex flex-col items-center gap-1.5 py-3 rounded-lg transition-all"
              style={{
                backgroundColor: activeCategory === cat.id ? "var(--tmpl-primary)" : "var(--tmpl-surface)",
                border:
                  activeCategory === cat.id
                    ? "1px solid var(--tmpl-secondary)"
                    : "1px solid var(--tmpl-border)",
              }}
            >
              <span
                style={{
                  color: activeCategory === cat.id ? "var(--tmpl-secondary)" : "var(--tmpl-text-muted)",
                }}
              >
                {iconMap[cat.icon] || <Utensils size={20} />}
              </span>
              <span
                className="text-xs"
                style={{
                  color: activeCategory === cat.id ? "var(--tmpl-text-inverse)" : "var(--tmpl-text)",
                  fontFamily: "var(--tmpl-body-font)",
                }}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Featured Section ── */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-5 rounded-full"
              style={{ backgroundColor: "var(--tmpl-primary)" }}
            />
            <h2
              className="text-base font-bold"
              style={{
                color: "var(--tmpl-text)",
                fontFamily: "var(--tmpl-heading-font)",
              }}
            >
              招牌推荐
            </h2>
          </div>
          <button
            className="flex items-center gap-0.5 text-xs"
            style={{ color: "var(--tmpl-text-muted)" }}
            onClick={() => navigate("/menu")}
          >
            查看全部
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Vertical Dish List */}
        <div className="flex flex-col gap-3">
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="flex gap-3 p-3 rounded-xl"
              style={{
                backgroundColor: "var(--tmpl-surface)",
                border: "1px solid var(--tmpl-border)",
                boxShadow: "var(--tmpl-shadow-card)",
              }}
            >
              {/* Left: Image with Ribbon */}
              <div className="relative flex-shrink-0">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-[100px] h-[100px] object-cover rounded-lg"
                />
                {dish.is_hot && (
                  <div
                    className="absolute top-0 left-0 px-1.5 py-0.5 rounded-tl-lg rounded-br-lg text-[10px] font-bold"
                    style={{
                      backgroundColor: "var(--tmpl-primary)",
                      color: "var(--tmpl-text-inverse)",
                    }}
                  >
                    热销
                  </div>
                )}
                {dish.is_feature && (
                  <div
                    className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={{
                      backgroundColor: "var(--tmpl-secondary)",
                      color: "var(--tmpl-primary-dark)",
                    }}
                  >
                    招牌
                  </div>
                )}
              </div>

              {/* Right: Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    className="text-sm font-bold mb-1"
                    style={{
                      color: "var(--tmpl-text)",
                      fontFamily: "var(--tmpl-heading-font)",
                    }}
                  >
                    {dish.name}
                  </h3>
                  <p
                    className="text-xs line-clamp-2 leading-relaxed"
                    style={{ color: "var(--tmpl-text-muted)" }}
                  >
                    {dish.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs" style={{ color: "var(--tmpl-primary)" }}>
                      ¥
                    </span>
                    <span
                      className="text-lg font-bold"
                      style={{ color: "var(--tmpl-primary)" }}
                    >
                      {dish.price}
                    </span>
                    {dish.original_price && (
                      <span
                        className="text-xs line-through"
                        style={{ color: "var(--tmpl-text-muted)" }}
                      >
                        ¥{dish.original_price}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(dish.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: "var(--tmpl-primary)",
                      color: "var(--tmpl-secondary)",
                      border: "1px solid var(--tmpl-secondary)",
                      boxShadow: "var(--tmpl-shadow-button)",
                    }}
                  >
                    <ShoppingCart size={12} />
                    加入购物车
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Special Feature Banner ── */}
      <div className="px-4 mb-5">
        <div
          className="relative rounded-xl overflow-hidden p-5"
          style={{
            backgroundColor: "var(--tmpl-primary-dark)",
            backgroundImage:
              "radial-gradient(circle at 10% 20%, rgba(255,215,0,0.1) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255,215,0,0.08) 0%, transparent 40%)",
            border: "1px solid var(--tmpl-border)",
          }}
        >
          {/* Decorative border pattern overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, var(--tmpl-secondary) 10px, var(--tmpl-secondary) 11px)",
            }}
          />

          <div className="relative z-10 text-center">
            <div
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-3"
              style={{
                backgroundColor: "var(--tmpl-secondary)",
                color: "var(--tmpl-primary-dark)",
              }}
            >
              <Scroll size={12} />
              本店特色
            </div>
            <h3
              className="text-lg font-bold mb-2"
              style={{
                color: "var(--tmpl-secondary)",
                fontFamily: "var(--tmpl-heading-font)",
              }}
            >
              百年传承 · 匠心独运
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              精选上等食材，沿袭传统烹饪技艺，为您呈现地道中华美味
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: "var(--tmpl-secondary)" }}>
                  20+
                </div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  经典菜品
                </div>
              </div>
              <div className="w-px h-8" style={{ backgroundColor: "rgba(255,215,0,0.2)" }} />
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: "var(--tmpl-secondary)" }}>
                  50+
                </div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  年传承
                </div>
              </div>
              <div className="w-px h-8" style={{ backgroundColor: "rgba(255,215,0,0.2)" }} />
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: "var(--tmpl-secondary)" }}>
                  4.9
                </div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  用户评分
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Special Offer Section ── */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-1 h-5 rounded-full"
            style={{ backgroundColor: "var(--tmpl-primary)" }}
          />
          <h2
            className="text-base font-bold"
            style={{
              color: "var(--tmpl-text)",
              fontFamily: "var(--tmpl-heading-font)",
            }}
          >
            限时特惠
          </h2>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: "var(--tmpl-surface)",
            border: "1px solid var(--tmpl-border)",
            boxShadow: "var(--tmpl-shadow-card)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "var(--tmpl-primary)",
                color: "var(--tmpl-secondary)",
              }}
            >
              <Flame size={24} />
            </div>
            <div className="flex-1">
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--tmpl-text)", fontFamily: "var(--tmpl-heading-font)" }}
              >
                双人尊享套餐
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--tmpl-text-muted)" }}>
                烤鸭半套 + 宫保鸡丁 + 麻婆豆腐 + 米饭2份
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold" style={{ color: "var(--tmpl-primary)" }}>
                ¥188
              </div>
              <div className="text-xs line-through" style={{ color: "var(--tmpl-text-muted)" }}>
                ¥268
              </div>
            </div>
          </div>
          <button
            className="w-full mt-3 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              backgroundColor: "var(--tmpl-primary)",
              color: "var(--tmpl-secondary)",
              border: "1px solid var(--tmpl-secondary)",
            }}
            onClick={() => navigate("/combo")}
          >
            立即预定
          </button>
        </div>
      </div>

      {/* ── Bottom Contact Bar ── */}
      <div className="px-4">
        <div
          className="flex items-center justify-between p-3 rounded-xl"
          style={{
            backgroundColor: "var(--tmpl-surface-elevated)",
            border: "1px solid var(--tmpl-border)",
          }}
        >
          <div className="flex items-center gap-2">
            <MapPin size={16} style={{ color: "var(--tmpl-primary)" }} />
            <span className="text-xs" style={{ color: "var(--tmpl-text)" }}>
              {store.address}
            </span>
          </div>
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs"
            style={{
              backgroundColor: "var(--tmpl-primary)",
              color: "var(--tmpl-text-inverse)",
            }}
          >
            <Phone size={12} />
            联系商家
          </button>
        </div>
      </div>

      {/* ── Bottom Safe Area ── */}
      <div className="h-8" />

      {/* ── CSS for marquee animation ── */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
