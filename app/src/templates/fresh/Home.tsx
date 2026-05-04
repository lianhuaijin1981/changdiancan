import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Plus,
  Star,
  Clock,
  Coffee,
  Cake,
  IceCream,
  Soup,
  ChefHat,
  Sparkles,
  ChevronRight,
  Bell,
} from "lucide-react";

// Mock data
const CATEGORIES = [
  { id: 1, name: "饮品", icon: Coffee, color: "#a7f3d0" },
  { id: 2, name: "甜点", icon: Cake, color: "#fbcfe8" },
  { id: 3, name: "冰淇淋", icon: IceCream, color: "#fde68a" },
  { id: 4, name: "汤品", icon: Soup, color: "#ddd6fe" },
  { id: 5, name: "主食", icon: ChefHat, color: "#bae6fd" },
  { id: 6, name: "轻食", icon: Sparkles, color: "#fed7aa" },
];

const RECOMMENDATIONS = [
  {
    id: 1,
    name: "芝芝莓莓",
    desc: "新鲜草莓搭配浓郁芝士",
    price: 28,
    bg: "#ecfdf5",
    tag: "人气",
    tagColor: "#10b981",
  },
  {
    id: 2,
    name: "杨枝甘露",
    desc: "芒果西柚经典搭配",
    price: 32,
    bg: "#fdf2f8",
    tag: "店长推荐",
    tagColor: "#ec4899",
  },
  {
    id: 3,
    name: "芋泥波波",
    desc: "手作芋泥Q弹珍珠",
    price: 26,
    bg: "#fffbeb",
    tag: "新品",
    tagColor: "#f59e0b",
  },
  {
    id: 4,
    name: "抹茶拿铁",
    desc: "宇治抹茶醇厚回甘",
    price: 30,
    bg: "#ecfeff",
    tag: "热销",
    tagColor: "#06b6d4",
  },
];

const SPECIAL_OFFERS = [
  { id: 1, name: "双人下午茶套餐", price: 58, original: 88, tag: "限时5折" },
  { id: 2, name: "草莓蛋糕切块", price: 19, original: 35, tag: "今日特惠" },
];

function Home() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(2);
  const [activeCategory, setActiveCategory] = useState(1);
  const [bounceItem, setBounceItem] = useState<number | null>(null);
  const [greeting, setGreeting] = useState("下午好");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting("早上好");
    else if (hour < 14) setGreeting("中午好");
    else if (hour < 18) setGreeting("下午好");
    else setGreeting("晚上好");
  }, []);

  const handleAddToCart = (id: number) => {
    setBounceItem(id);
    setCartCount((c) => c + 1);
    setTimeout(() => setBounceItem(null), 400);
  };

  const pastelMint = "#a7f3d0";
  const pastelPink = "#fbcfe8";
  const pastelCream = "#fff7ed";
  const pastelLavender = "#ede9fe";

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        backgroundColor: "var(--tmpl-bg)",
        fontFamily: "var(--tmpl-body-font)",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating decorative dots */}
      <div
        className="absolute top-20 left-4 w-3 h-3 rounded-full opacity-60"
        style={{ backgroundColor: pastelPink }}
      />
      <div
        className="absolute top-40 right-6 w-2 h-2 rounded-full opacity-50"
        style={{ backgroundColor: pastelMint }}
      />
      <div
        className="absolute top-72 left-8 w-4 h-4 rounded-full opacity-40"
        style={{ backgroundColor: pastelLavender }}
      />
      <div
        className="absolute bottom-64 right-10 w-3 h-3 rounded-full opacity-50"
        style={{ backgroundColor: "#fde68a" }}
      />

      {/* Soft rounded header */}
      <div
        className="relative px-5 pt-12 pb-8 rounded-b-[32px]"
        style={{
          background: `linear-gradient(180deg, ${pastelMint}80 0%, var(--tmpl-bg) 100%)`,
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
              style={{
                backgroundColor: "var(--tmpl-surface)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=200&fit=crop"
                alt="店铺"
                className="w-11 h-11 rounded-full object-cover"
              />
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--tmpl-text)" }}
              >
                小鹿茶屋
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--tmpl-text-muted)" }}
              >
                营业中 09:00-22:00
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center relative"
              style={{ backgroundColor: pastelCream }}
            >
              <Bell size={16} style={{ color: "var(--tmpl-text-muted)" }} />
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center relative"
              style={{ backgroundColor: pastelCream }}
              onClick={() => navigate("/cart")}
            >
              <ShoppingBag size={16} style={{ color: "var(--tmpl-text)" }} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: "var(--tmpl-badge-hot)" }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Greeting */}
        <h1
          className="text-2xl font-bold mb-1"
          style={{
            color: "var(--tmpl-text)",
            fontFamily: "var(--tmpl-heading-font)",
          }}
        >
          {greeting}~ 想喝点什么？
        </h1>
        <p className="text-sm" style={{ color: "var(--tmpl-text-muted)" }}>
          每一杯都是用心调制的小确幸
        </p>
      </div>

      {/* Search bar */}
      <div className="px-5 -mt-2 mb-6">
        <div
          className="flex items-center gap-3 px-5 py-3.5 rounded-full"
          style={{
            backgroundColor: "var(--tmpl-surface)",
            border: `2px solid ${pastelMint}60`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <Search size={18} style={{ color: "var(--tmpl-text-muted)" }} />
          <span
            className="text-sm flex-1"
            style={{ color: "var(--tmpl-text-muted)" }}
          >
            搜索饮品、甜点...
          </span>
        </div>
      </div>

      {/* Category pills */}
      <div className="px-5 mb-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all"
                style={{
                  backgroundColor: isActive ? cat.color : "var(--tmpl-surface)",
                  border: isActive
                    ? `2px solid ${cat.color}`
                    : "2px solid transparent",
                  boxShadow: isActive
                    ? `0 4px 12px ${cat.color}60`
                    : "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <Icon
                  size={16}
                  style={{
                    color: isActive
                      ? "var(--tmpl-text)"
                      : "var(--tmpl-text-muted)",
                  }}
                />
                <span
                  className="text-sm font-medium"
                  style={{
                    color: isActive
                      ? "var(--tmpl-text)"
                      : "var(--tmpl-text-muted)",
                  }}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 店长推荐 Section */}
      <div className="px-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star
              size={18}
              fill="var(--tmpl-warning)"
              style={{ color: "var(--tmpl-warning)" }}
            />
            <h2
              className="text-lg font-bold"
              style={{
                color: "var(--tmpl-text)",
                fontFamily: "var(--tmpl-heading-font)",
              }}
            >
              店长推荐
            </h2>
          </div>
          <button
            className="flex items-center gap-1 text-xs"
            style={{ color: "var(--tmpl-text-muted)" }}
          >
            查看更多
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {RECOMMENDATIONS.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden"
              style={{
                backgroundColor: item.bg,
                borderRadius: "28px",
                padding: "14px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}
            >
              {/* Tag */}
              <span
                className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: item.tagColor }}
              >
                {item.tag}
              </span>

              {/* Image placeholder */}
              <div
                className="w-full h-28 rounded-2xl mb-3 flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.6)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <Coffee size={32} style={{ color: item.tagColor }} />
              </div>

              <h3
                className="text-sm font-bold mb-1"
                style={{ color: "var(--tmpl-text)" }}
              >
                {item.name}
              </h3>
              <p
                className="text-xs mb-3 line-clamp-1"
                style={{ color: "var(--tmpl-text-muted)" }}
              >
                {item.desc}
              </p>

              <div className="flex items-center justify-between">
                <span
                  className="text-base font-bold"
                  style={{ color: "var(--tmpl-danger)" }}
                >
                  ¥{item.price}
                </span>
                <button
                  onClick={() => handleAddToCart(item.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform"
                  style={{
                    backgroundColor: "var(--tmpl-primary)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    transform:
                      bounceItem === item.id ? "scale(1.3)" : "scale(1)",
                    transition: "transform 0.3s cubic-bezier(0.68,-0.55,0.265,1.55)",
                  }}
                >
                  <Plus size={16} style={{ color: "#fff" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 限时特惠 Card */}
      <div className="px-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} style={{ color: "var(--tmpl-danger)" }} />
          <h2
            className="text-lg font-bold"
            style={{
              color: "var(--tmpl-text)",
              fontFamily: "var(--tmpl-heading-font)",
            }}
          >
            限时特惠
          </h2>
        </div>

        <div
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${pastelPink}80, ${pastelMint}80)`,
            borderRadius: "28px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          {/* Wavy top edge decoration */}
          <svg
            viewBox="0 0 400 40"
            className="w-full"
            preserveAspectRatio="none"
            style={{ height: 32, marginTop: -1 }}
          >
            <path
              d="M0,20 Q50,0 100,20 T200,20 T300,20 T400,20 L400,40 L0,40 Z"
              fill="rgba(255,255,255,0.5)"
            />
          </svg>

          <div className="px-5 pb-5 pt-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p
                  className="text-xs font-bold mb-1"
                  style={{ color: "var(--tmpl-primary-dark)" }}
                >
                  今日限时 · 14:00-17:00
                </p>
                <p
                  className="text-lg font-bold"
                  style={{
                    color: "var(--tmpl-text)",
                    fontFamily: "var(--tmpl-heading-font)",
                  }}
                >
                  甜蜜下午茶时光
                </p>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.7)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <Cake size={28} style={{ color: "var(--tmpl-primary)" }} />
              </div>
            </div>

            <div className="space-y-3">
              {SPECIAL_OFFERS.map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between py-3 px-4 rounded-2xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
                >
                  <div className="flex-1">
                    <p
                      className="text-sm font-bold"
                      style={{ color: "var(--tmpl-text)" }}
                    >
                      {offer.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-sm font-bold"
                        style={{ color: "var(--tmpl-danger)" }}
                      >
                        ¥{offer.price}
                      </span>
                      <span
                        className="text-xs line-through"
                        style={{ color: "var(--tmpl-text-muted)" }}
                      >
                        ¥{offer.original}
                      </span>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: "var(--tmpl-danger)",
                      color: "#fff",
                    }}
                  >
                    {offer.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-8">
        <button
          className="w-full py-4 rounded-[28px] text-base font-bold text-white flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, var(--tmpl-primary), var(--tmpl-primary-light))`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            fontFamily: "var(--tmpl-heading-font)",
          }}
          onClick={() => navigate("/menu")}
        >
          <ChefHat size={20} />
          查看完整菜单
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default Home;
