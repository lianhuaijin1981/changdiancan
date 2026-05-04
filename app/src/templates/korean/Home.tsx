import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Beef,
  Drumstick,
  Wine,
  Zap,
  ChevronRight,
  Star,
  ShoppingCart,
  Clock,
  MapPin,
  Phone,
  ChefHat,
  UtensilsCrossed,
  Soup,
  Croissant,
  Leaf,
} from "lucide-react";
import { api } from "../../miniapp/api/client";

/* ─── CSS Variables ─── */
const tmplVars = {
  primary: "#D9381E",
  primaryLight: "#FFF0EE",
  secondary: "#1A1A1A",
  bg: "#1E1E1E",
  surface: "#2A2A2A",
  text: "#F0F0F0",
  textMuted: "#8A8A8A",
  border: "#404040",
  badgeNew: "#4CAF50",
  badgeHot: "#D9381E",
};

const categoryIcons: Record<string, React.ReactNode> = {
  "招牌烤肉": <Beef size={24} />,
  "韩式炸鸡": <Drumstick size={24} />,
  "特色汤锅": <Soup size={24} />,
  "精致小食": <Croissant size={24} />,
  "酒水饮料": <Wine size={24} />,
  "蔬菜拼盘": <Leaf size={24} />,
  "主厨推荐": <ChefHat size={24} />,
  "超值套餐": <UtensilsCrossed size={24} />,
};

const categoryColors = [
  "#D9381E",
  "#FF8C00",
  "#FFB800",
  "#D9381E",
  "#FF8C00",
  "#FFB800",
  "#D9381E",
  "#FF8C00",
];

export default function Home() {
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [comboMeals] = useState([
    {
      id: 101,
      name: "双人豪华烤肉套餐",
      desc: "牛五花 + 猪颈肉 + 蔬菜拼盘 + 主食 + 饮料2份",
      originalPrice: 268,
      comboPrice: 198,
      tag: "热销",
    },
    {
      id: 102,
      name: "四人聚会狂欢套餐",
      desc: "牛舌 + 雪花牛肉 + 猪五花 + 韩式炸鸡 + 汤锅 + 主食 + 饮料4份",
      originalPrice: 458,
      comboPrice: 328,
      tag: "超值",
    },
    {
      id: 103,
      name: "单人畅享套餐",
      desc: "精选烤肉拼盘 + 米饭 + 汤 + 饮料",
      originalPrice: 128,
      comboPrice: 88,
      tag: "新品",
    },
  ]);

  useEffect(() => {
    api.get("/api/stores/1").then((res: any) => setStore(res.data ?? res));
    api.get("/api/categories?store_id=1").then((res: any) => {
      const data = res.data ?? res;
      setCategories(data);
      if (data.length > 0) setActiveCategory(data[0].id);
    });
    api.get("/api/dishes?store_id=1&is_featured=true").then((res: any) =>
      setDishes(res.data ?? res)
    );
  }, []);

  const handleCategoryClick = (catId: number) => {
    setActiveCategory(catId);
    navigate(`/category/${catId}`);
  };

  const handleOrder = (dishId: number) => {
    navigate(`/dish/${dishId}`);
  };

  const handleComboOrder = (comboId: number) => {
    navigate(`/combo/${comboId}`);
  };

  const handleStartOrder = () => {
    navigate("/menu");
  };

  /* ─── Spicy Level Indicator ─── */
  const SpicyLevel = ({ level }: { level: number }) => {
    if (!level) return null;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: Math.min(level, 5) }).map((_, i) => (
          <Flame
            key={i}
            size={12}
            color={tmplVars.primary}
            fill={tmplVars.primary}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className="relative min-h-screen pb-24"
      style={{ maxWidth: 430, margin: "0 auto", backgroundColor: tmplVars.bg }}
    >
      {/* ═══════════════ HEADER ═══════════════ */}
      <header
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: tmplVars.bg, borderBottom: `1px solid ${tmplVars.border}` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 flex items-center justify-center"
            style={{ backgroundColor: tmplVars.primary }}
          >
            <Flame size={20} color="#fff" fill="#fff" />
          </div>
          <div>
            <h1
              className="text-base font-black tracking-tight"
              style={{ color: tmplVars.text, fontFamily: "sans-serif" }}
            >
              {store?.name ?? "炙焰韩式烤肉"}
            </h1>
            <p className="text-[10px]" style={{ color: tmplVars.textMuted }}>
              {store?.slogan ?? "正宗炭火烤肉 · 街头风味"}
            </p>
          </div>
        </div>
        <div
          className="px-3 py-1 text-xs font-bold flex items-center gap-1"
          style={{
            backgroundColor: `${tmplVars.primary}20`,
            color: tmplVars.primary,
            border: `1px solid ${tmplVars.primary}`,
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: tmplVars.primary }}
          />
          营业中
        </div>
      </header>

      {/* ═══════════════ HERO BANNER ═══════════════ */}
      <section
        className="mx-4 mt-3 p-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${tmplVars.secondary} 0%, ${tmplVars.surface} 100%)`,
          borderLeft: `4px solid ${tmplVars.primary}`,
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={22} color={tmplVars.primary} />
            <span
              className="text-xl font-black"
              style={{ color: tmplVars.text }}
            >
              新店开业全场8折
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: tmplVars.textMuted }}>
            炭火现烤 · 肉香四溢 · 限时优惠
          </p>
          <button
            onClick={handleStartOrder}
            className="px-5 py-2.5 text-sm font-bold flex items-center gap-2"
            style={{
              backgroundColor: tmplVars.primary,
              color: "#fff",
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
          >
            <Zap size={16} />
            立即抢购
            <ChevronRight size={16} />
          </button>
        </div>
        {/* Decorative geometric elements */}
        <div
          className="absolute -right-4 -top-4 w-24 h-24 opacity-10"
          style={{
            backgroundColor: tmplVars.primary,
            transform: "rotate(45deg)",
          }}
        />
        <div
          className="absolute -right-8 -bottom-8 w-32 h-32 opacity-5"
          style={{
            backgroundColor: tmplVars.primary,
            transform: "rotate(15deg)",
          }}
        />
      </section>

      {/* ═══════════════ STORE INFO BAR ═══════════════ */}
      {store && (
        <div
          className="mx-4 mt-3 px-3 py-2.5 flex items-center justify-between"
          style={{
            backgroundColor: tmplVars.surface,
            border: `1px solid ${tmplVars.border}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" style={{ color: tmplVars.textMuted }}>
              <Clock size={14} />
              <span className="text-xs">{store.open_hours ?? "11:00-23:00"}</span>
            </div>
            <div className="flex items-center gap-1" style={{ color: tmplVars.textMuted }}>
              <MapPin size={14} />
              <span className="text-xs">{store.address ?? "距离您 1.2km"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1" style={{ color: tmplVars.primary }}>
            <Phone size={14} />
            <span className="text-xs font-bold">电话</span>
          </div>
        </div>
      )}

      {/* ═══════════════ CATEGORY GRID ═══════════════ */}
      <section className="px-4 mt-4">
        <div className="grid grid-cols-4 gap-3">
          {categories.length > 0
            ? categories.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="flex flex-col items-center gap-2 py-3"
                  style={{
                    backgroundColor: tmplVars.surface,
                    border:
                      activeCategory === cat.id
                        ? `2px solid ${tmplVars.primary}`
                        : `1px solid ${tmplVars.border}`,
                  }}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center"
                    style={{
                      backgroundColor: `${categoryColors[idx % categoryColors.length]}20`,
                      color: categoryColors[idx % categoryColors.length],
                    }}
                  >
                    {categoryIcons[cat.name] ?? (
                      <UtensilsCrossed size={24} />
                    )}
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color:
                        activeCategory === cat.id
                          ? tmplVars.primary
                          : tmplVars.text,
                    }}
                  >
                    {cat.name}
                  </span>
                </button>
              ))
            : // Fallback categories
              ["招牌烤肉", "韩式炸鸡", "特色汤锅", "精致小食", "酒水饮料", "蔬菜拼盘", "主厨推荐", "超值套餐"].map(
                (name, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCategoryClick(idx + 1)}
                    className="flex flex-col items-center gap-2 py-3"
                    style={{
                      backgroundColor: tmplVars.surface,
                      border:
                        activeCategory === idx + 1
                          ? `2px solid ${tmplVars.primary}`
                          : `1px solid ${tmplVars.border}`,
                    }}
                  >
                    <div
                      className="w-12 h-12 flex items-center justify-center"
                      style={{
                        backgroundColor: `${categoryColors[idx]}20`,
                        color: categoryColors[idx],
                      }}
                    >
                      {categoryIcons[name] ?? <UtensilsCrossed size={24} />}
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{
                        color:
                          activeCategory === idx + 1
                            ? tmplVars.primary
                            : tmplVars.text,
                      }}
                    >
                      {name}
                    </span>
                  </button>
                )
              )}
        </div>
      </section>

      {/* ═══════════════ HOT ITEMS ═══════════════ */}
      <section className="px-4 mt-5">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={20} color={tmplVars.primary} fill={tmplVars.primary} />
          <h2
            className="text-lg font-black"
            style={{ color: tmplVars.text }}
          >
            人气必点
          </h2>
          <div
            className="ml-auto px-2 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor: `${tmplVars.badgeHot}20`,
              color: tmplVars.badgeHot,
            }}
          >
            HOT
          </div>
        </div>

        <div className="space-y-3">
          {dishes.length > 0
            ? dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="relative overflow-hidden"
                  style={{
                    backgroundColor: tmplVars.surface,
                    border: `1px solid ${tmplVars.border}`,
                  }}
                >
                  {/* Image */}
                  <div
                    className="w-full h-44 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${dish.image ?? "/placeholder-dish.jpg"})`,
                    }}
                  />
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {dish.is_new && (
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          backgroundColor: tmplVars.badgeNew,
                          color: "#fff",
                        }}
                      >
                        新品
                      </span>
                    )}
                    {dish.is_hot && (
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold flex items-center gap-1"
                        style={{
                          backgroundColor: tmplVars.badgeHot,
                          color: "#fff",
                        }}
                      >
                        <Flame size={10} />
                        人气
                      </span>
                    )}
                  </div>
                  {/* Content */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3
                          className="text-sm font-bold mb-1"
                          style={{ color: tmplVars.text }}
                        >
                          {dish.name}
                        </h3>
                        <p
                          className="text-xs mb-2 line-clamp-1"
                          style={{ color: tmplVars.textMuted }}
                        >
                          {dish.description ?? "炭火慢烤，外焦里嫩，肉汁丰盈"}
                        </p>
                        <SpicyLevel level={dish.spicy_level ?? 2} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-lg font-black"
                          style={{ color: tmplVars.primary }}
                        >
                          ¥{dish.price}
                        </span>
                        {dish.original_price && (
                          <span
                            className="text-xs line-through"
                            style={{ color: tmplVars.textMuted }}
                          >
                            ¥{dish.original_price}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleOrder(dish.id)}
                        className="px-4 py-2 text-xs font-bold flex items-center gap-1"
                        style={{
                          backgroundColor: tmplVars.primary,
                          color: "#fff",
                        }}
                      >
                        <ShoppingCart size={14} />
                        立即下单
                      </button>
                    </div>
                  </div>
                </div>
              ))
            : // Fallback featured dishes
              [
                {
                  id: 1,
                  name: "雪花和牛 M9+",
                  desc: "顶级澳洲和牛，大理石纹理，入口即化",
                  price: 128,
                  original_price: 168,
                  spicy_level: 0,
                  is_new: false,
                  is_hot: true,
                  image: "/placeholder-dish.jpg",
                },
                {
                  id: 2,
                  name: "秘制辣烤猪五花",
                  desc: "韩式辣酱腌制，炭火烤制，香辣过瘾",
                  price: 58,
                  original_price: 78,
                  spicy_level: 3,
                  is_new: true,
                  is_hot: true,
                  image: "/placeholder-dish.jpg",
                },
                {
                  id: 3,
                  name: "韩式炸鸡拼盘",
                  desc: "原味+甜辣+蒜香三种口味，外酥里嫩",
                  price: 68,
                  original_price: 88,
                  spicy_level: 2,
                  is_new: false,
                  is_hot: false,
                  image: "/placeholder-dish.jpg",
                },
              ].map((dish) => (
                <div
                  key={dish.id}
                  className="relative overflow-hidden"
                  style={{
                    backgroundColor: tmplVars.surface,
                    border: `1px solid ${tmplVars.border}`,
                  }}
                >
                  <div
                    className="w-full h-44 flex items-center justify-center"
                    style={{ backgroundColor: tmplVars.secondary }}
                  >
                    <Beef size={48} color={tmplVars.border} />
                  </div>
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {dish.is_new && (
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          backgroundColor: tmplVars.badgeNew,
                          color: "#fff",
                        }}
                      >
                        新品
                      </span>
                    )}
                    {dish.is_hot && (
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold flex items-center gap-1"
                        style={{
                          backgroundColor: tmplVars.badgeHot,
                          color: "#fff",
                        }}
                      >
                        <Flame size={10} />
                        人气
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3
                          className="text-sm font-bold mb-1"
                          style={{ color: tmplVars.text }}
                        >
                          {dish.name}
                        </h3>
                        <p
                          className="text-xs mb-2 line-clamp-1"
                          style={{ color: tmplVars.textMuted }}
                        >
                          {dish.desc}
                        </p>
                        <SpicyLevel level={dish.spicy_level} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-lg font-black"
                          style={{ color: tmplVars.primary }}
                        >
                          ¥{dish.price}
                        </span>
                        <span
                          className="text-xs line-through"
                          style={{ color: tmplVars.textMuted }}
                        >
                          ¥{dish.original_price}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOrder(dish.id)}
                        className="px-4 py-2 text-xs font-bold flex items-center gap-1"
                        style={{
                          backgroundColor: tmplVars.primary,
                          color: "#fff",
                        }}
                      >
                        <ShoppingCart size={14} />
                        立即下单
                      </button>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* ═══════════════ COMBO MEALS ═══════════════ */}
      <section className="px-4 mt-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={20} color={tmplVars.primary} />
          <h2
            className="text-lg font-black"
            style={{ color: tmplVars.text }}
          >
            超值套餐
          </h2>
          <div
            className="ml-auto flex items-center gap-1"
            style={{ color: tmplVars.textMuted }}
          >
            <span className="text-xs">更多</span>
            <ChevronRight size={14} />
          </div>
        </div>

        <div className="space-y-3">
          {comboMeals.map((combo) => (
            <div
              key={combo.id}
              className="relative overflow-hidden"
              style={{
                backgroundColor: tmplVars.surface,
                border: `1px solid ${tmplVars.border}`,
                borderLeft: `4px solid ${tmplVars.primary}`,
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3
                    className="text-sm font-bold"
                    style={{ color: tmplVars.text }}
                  >
                    {combo.name}
                  </h3>
                  <span
                    className="px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: `${tmplVars.badgeHot}20`,
                      color: tmplVars.badgeHot,
                    }}
                  >
                    {combo.tag}
                  </span>
                </div>
                <p
                  className="text-xs mb-3 line-clamp-2"
                  style={{ color: tmplVars.textMuted }}
                >
                  {combo.desc}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-xl font-black"
                      style={{ color: tmplVars.primary }}
                    >
                      ¥{combo.comboPrice}
                    </span>
                    <span
                      className="text-sm line-through"
                      style={{ color: tmplVars.textMuted }}
                    >
                      ¥{combo.originalPrice}
                    </span>
                    <span
                      className="px-1.5 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: `${tmplVars.primary}20`,
                        color: tmplVars.primary,
                      }}
                    >
                      省¥{combo.originalPrice - combo.comboPrice}
                    </span>
                  </div>
                  <button
                    onClick={() => handleComboOrder(combo.id)}
                    className="px-3 py-1.5 text-xs font-bold flex items-center gap-1"
                    style={{
                      backgroundColor: tmplVars.primary,
                      color: "#fff",
                    }}
                  >
                    选购
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ RATINGS / TRUST BAR ═══════════════ */}
      <section
        className="mx-4 mt-5 p-4"
        style={{
          backgroundColor: tmplVars.surface,
          border: `1px solid ${tmplVars.border}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  color={tmplVars.primary}
                  fill={tmplVars.primary}
                />
              ))}
            </div>
            <span
              className="text-sm font-bold ml-1"
              style={{ color: tmplVars.text }}
            >
              4.9
            </span>
            <span className="text-xs" style={{ color: tmplVars.textMuted }}>
              ({store?.rating_count ?? "2,380"}条评价)
            </span>
          </div>
          <div
            className="text-xs font-bold px-2 py-1"
            style={{
              backgroundColor: `${tmplVars.primary}15`,
              color: tmplVars.primary,
            }}
          >
            月售 {store?.monthly_sales ?? "5000+"}
          </div>
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {["食材新鲜", "份量十足", "上菜快", "环境好", "服务热情"].map(
            (tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-[10px]"
                style={{
                  backgroundColor: tmplVars.secondary,
                  color: tmplVars.textMuted,
                  border: `1px solid ${tmplVars.border}`,
                }}
              >
                {tag}
              </span>
            )
          )}
        </div>
      </section>

      {/* ═══════════════ BOTTOM CTA ═══════════════ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-3"
        style={{
          maxWidth: 430,
          margin: "0 auto",
          backgroundColor: `${tmplVars.bg}ee`,
          backdropFilter: "blur(8px)",
          borderTop: `1px solid ${tmplVars.border}`,
        }}
      >
        <button
          onClick={handleStartOrder}
          className="w-full py-3.5 text-base font-black flex items-center justify-center gap-2 relative overflow-hidden"
          style={{
            backgroundColor: tmplVars.primary,
            color: "#fff",
          }}
        >
          {/* Animated flame effect */}
          <span className="relative z-10 flex items-center gap-2">
            <Flame size={20} className="animate-pulse" />
            开始点餐
            <ChevronRight size={18} />
          </span>
          {/* Geometric accent */}
          <div
            className="absolute right-0 top-0 w-16 h-full opacity-20"
            style={{
              background: `linear-gradient(135deg, transparent 50%, #fff 50%)`,
            }}
          />
        </button>
      </div>
    </div>
  );
}

