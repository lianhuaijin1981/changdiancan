import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TreePine,
  Leaf,
  Wind,
  Droplets,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  ChevronLeft,
  Star,
  Plus,
  ShoppingCart,
  UtensilsCrossed,
  Flower2,
  Sparkles,
  ThermometerSun,
} from "lucide-react";
import { api } from "../../miniapp/api/client";

export default function Home() {
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    api.get("/api/stores/1").then(setStore);
    api.get("/api/categories?store_id=1").then(setCategories);
    api.get("/api/dishes?store_id=1&is_featured=true").then(setDishes);
  }, []);

  const bannerImages = [
    { title: "春日限定", subtitle: "樱花料理", tag: "季节限定" },
    { title: "主厨推荐", subtitle: "精致怀石", tag: "今日推荐" },
    { title: "旬物之选", subtitle: "时令海鲜", tag: "新鲜到店" },
  ];

  const seasonalDishes = dishes.slice(0, 4);
  const todaySpecials = dishes.slice(4, 7);

  const handlePrevBanner = () => {
    setBannerIndex((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));
  };

  const handleNextBanner = () => {
    setBannerIndex((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="min-h-screen w-full max-w-[430px] mx-auto relative"
      style={{ backgroundColor: "var(--tmpl-bg)" }}
    >
      {/* ====== Header ====== */}
      <header
        className="relative pt-12 pb-4 px-6 text-center"
        style={{
          backgroundColor: "var(--tmpl-bg)",
          borderBottom: "1px solid var(--tmpl-border)",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <TreePine
            size={18}
            style={{ color: "var(--tmpl-primary)" }}
            strokeWidth={1.5}
          />
          <h1
            className="text-xl tracking-[0.15em]"
            style={{
              fontFamily: "var(--tmpl-heading-font)",
              color: "var(--tmpl-text)",
            }}
          >
            {store?.name || "和风料理"}
          </h1>
        </div>
        <p
          className="text-xs tracking-[0.2em] mt-2"
          style={{ color: "var(--tmpl-text-muted)" }}
        >
          欢迎光临 · いらっしゃいませ
        </p>
      </header>

      {/* ====== Seasonal Banner ====== */}
      <section className="relative w-full overflow-hidden">
        <div
          className="relative h-48 w-full flex items-end"
          style={{
            backgroundColor: "var(--tmpl-primary-light)",
          }}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 right-6">
              <Leaf size={60} strokeWidth={0.8} style={{ color: "var(--tmpl-primary)" }} />
            </div>
            <div className="absolute bottom-8 left-8">
              <Flower2 size={40} strokeWidth={0.8} style={{ color: "var(--tmpl-secondary)" }} />
            </div>
            <div className="absolute top-12 left-16">
              <Wind size={30} strokeWidth={0.8} style={{ color: "var(--tmpl-primary)" }} />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 pb-6 w-full">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] px-2 py-0.5 rounded-sm tracking-wider"
                style={{
                  backgroundColor: "var(--tmpl-primary)",
                  color: "#fff",
                }}
              >
                {bannerImages[bannerIndex].tag}
              </span>
            </div>
            <h2
              className="text-2xl tracking-[0.12em] mb-1"
              style={{
                fontFamily: "var(--tmpl-heading-font)",
                color: "var(--tmpl-text)",
              }}
            >
              {bannerImages[bannerIndex].title}
            </h2>
            <p
              className="text-sm tracking-wider"
              style={{ color: "var(--tmpl-text-muted)" }}
            >
              {bannerImages[bannerIndex].subtitle}
            </p>
          </div>

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, var(--tmpl-bg) 0%, transparent 60%)",
            }}
          />
        </div>

        {/* Banner controls */}
        <div className="flex items-center justify-between px-4 -mt-24 relative z-10">
          <button
            onClick={handlePrevBanner}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(4px)",
            }}
          >
            <ChevronLeft size={14} style={{ color: "var(--tmpl-text)" }} />
          </button>
          <button
            onClick={handleNextBanner}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(4px)",
            }}
          >
            <ChevronRight size={14} style={{ color: "var(--tmpl-text)" }} />
          </button>
        </div>

        {/* Banner indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {bannerImages.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === bannerIndex ? "20px" : "6px",
                backgroundColor:
                  i === bannerIndex ? "var(--tmpl-primary)" : "var(--tmpl-border)",
              }}
            />
          ))}
        </div>
      </section>

      {/* ====== Category Nav ====== */}
      <section className="px-4 py-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => setActiveCategory(0)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm whitespace-nowrap transition-all duration-200"
            style={{
              backgroundColor:
                activeCategory === 0 ? "var(--tmpl-primary)" : "var(--tmpl-surface)",
              color: activeCategory === 0 ? "#fff" : "var(--tmpl-text)",
              border: `1px solid ${activeCategory === 0 ? "var(--tmpl-primary)" : "var(--tmpl-border)"}`,
              fontFamily: activeCategory === 0 ? "var(--tmpl-heading-font)" : "inherit",
            }}
          >
            <UtensilsCrossed size={14} strokeWidth={1.5} />
            全部料理
          </button>
          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm whitespace-nowrap transition-all duration-200"
              style={{
                backgroundColor:
                  activeCategory === cat.id
                    ? "var(--tmpl-primary)"
                    : "var(--tmpl-surface)",
                color: activeCategory === cat.id ? "#fff" : "var(--tmpl-text)",
                border: `1px solid ${activeCategory === cat.id ? "var(--tmpl-primary)" : "var(--tmpl-border)"}`,
                fontFamily:
                  activeCategory === cat.id ? "var(--tmpl-heading-font)" : "inherit",
              }}
            >
              {cat.icon === "leaf" && (
                <Leaf size={14} strokeWidth={1.5} />
              )}
              {cat.icon === "droplets" && (
                <Droplets size={14} strokeWidth={1.5} />
              )}
              {cat.icon === "star" && (
                <Star size={14} strokeWidth={1.5} />
              )}
              {!cat.icon && (
                <Flower2 size={14} strokeWidth={1.5} />
              )}
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* ====== Featured Section: Seasonal Dishes ====== */}
      <section className="px-4 pb-6">
        <div
          className="flex items-center gap-2 mb-4 pb-3"
          style={{ borderBottom: "1px solid var(--tmpl-border)" }}
        >
          <Sparkles size={16} strokeWidth={1.5} style={{ color: "var(--tmpl-primary)" }} />
          <h3
            className="text-base tracking-[0.1em]"
            style={{
              fontFamily: "var(--tmpl-heading-font)",
              color: "var(--tmpl-text)",
            }}
          >
            季节料理
          </h3>
          <span className="text-xs ml-1" style={{ color: "var(--tmpl-text-muted)" }}>
            季節の料理
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {seasonalDishes.length > 0 ? (
            seasonalDishes.map((dish) => (
              <div
                key={dish.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: "var(--tmpl-surface)",
                  boxShadow: "0 1px 8px rgba(45, 41, 38, 0.06)",
                }}
              >
                {/* Image Placeholder */}
                <div
                  className="h-28 w-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--tmpl-primary-light)" }}
                >
                  {dish.image ? (
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Leaf
                        size={28}
                        strokeWidth={1}
                        style={{ color: "var(--tmpl-primary)" }}
                      />
                      <span
                        className="text-[10px] tracking-wider"
                        style={{ color: "var(--tmpl-text-muted)" }}
                      >
                        菜品图片
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3">
                  <h4
                    className="text-sm font-medium tracking-wide truncate"
                    style={{ color: "var(--tmpl-text)" }}
                  >
                    {dish.name}
                  </h4>
                  <p
                    className="text-xs mt-1 line-clamp-1"
                    style={{ color: "var(--tmpl-text-muted)" }}
                  >
                    {dish.description || "精选食材，匠心烹制"}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--tmpl-secondary)" }}
                    >
                      ¥{dish.price}
                    </span>
                    <button
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "var(--tmpl-primary)" }}
                    >
                      <Plus size={14} color="#fff" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Fallback placeholders
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: "var(--tmpl-surface)",
                    boxShadow: "0 1px 8px rgba(45, 41, 38, 0.06)",
                  }}
                >
                  <div
                    className="h-28 w-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--tmpl-primary-light)" }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Leaf
                        size={28}
                        strokeWidth={1}
                        style={{ color: "var(--tmpl-primary)" }}
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <h4
                      className="text-sm font-medium tracking-wide"
                      style={{ color: "var(--tmpl-text)" }}
                    >
                      时令菜品 {i}
                    </h4>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--tmpl-text-muted)" }}
                    >
                      精选食材，匠心烹制
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--tmpl-secondary)" }}
                      >
                        ¥{38 + i * 12}
                      </span>
                      <button
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "var(--tmpl-primary)" }}
                      >
                        <Plus size={14} color="#fff" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* ====== Today's Special ====== */}
      <section className="pb-6">
        <div
          className="flex items-center gap-2 mb-4 px-4 pb-3"
          style={{ borderBottom: "1px solid var(--tmpl-border)" }}
        >
          <ThermometerSun
            size={16}
            strokeWidth={1.5}
            style={{ color: "var(--tmpl-secondary)" }}
          />
          <h3
            className="text-base tracking-[0.1em]"
            style={{
              fontFamily: "var(--tmpl-heading-font)",
              color: "var(--tmpl-text)",
            }}
          >
            今日推荐
          </h3>
          <span className="text-xs ml-1" style={{ color: "var(--tmpl-text-muted)" }}>
            本日のおすすめ
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
          {(todaySpecials.length > 0 ? todaySpecials : [1, 2, 3]).map(
            (dish, idx) => {
              const dishData = typeof dish === "object" ? dish : null;
              return (
                <div
                  key={dishData?.id || idx}
                  className="flex-shrink-0 w-56 rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: "var(--tmpl-surface)",
                    boxShadow: "0 1px 8px rgba(45, 41, 38, 0.06)",
                    borderLeft: `3px solid var(--tmpl-secondary)`,
                  }}
                >
                  {/* Image */}
                  <div
                    className="h-32 w-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--tmpl-primary-light)" }}
                  >
                    {dishData?.image ? (
                      <img
                        src={dishData.image}
                        alt={dishData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <TreePine
                          size={32}
                          strokeWidth={1}
                          style={{ color: "var(--tmpl-secondary)" }}
                        />
                        <span
                          className="text-[10px] tracking-wider"
                          style={{ color: "var(--tmpl-text-muted)" }}
                        >
                          推荐菜品
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className="text-sm font-medium tracking-wide"
                        style={{ color: "var(--tmpl-text)" }}
                      >
                        {dishData?.name || `主厨推荐 ${idx + 1}`}
                      </h4>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-sm tracking-wider"
                        style={{
                          backgroundColor: "var(--tmpl-badge-hot)",
                          color: "#fff",
                        }}
                      >
                        热门
                      </span>
                    </div>
                    <p
                      className="text-xs line-clamp-2 leading-relaxed"
                      style={{ color: "var(--tmpl-text-muted)" }}
                    >
                      {dishData?.description ||
                        "选用当季最新鲜的食材，由主厨精心烹制，呈现食材本真的风味与口感"}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-lg font-medium"
                          style={{ color: "var(--tmpl-secondary)" }}
                        >
                          ¥{dishData?.price || 88 + idx * 20}
                        </span>
                        {dishData?.original_price && (
                          <span
                            className="text-xs line-through"
                            style={{ color: "var(--tmpl-text-muted)" }}
                          >
                            ¥{dishData.original_price}
                          </span>
                        )}
                      </div>
                      <button
                        className="px-3 py-1.5 rounded-md text-xs flex items-center gap-1"
                        style={{
                          backgroundColor: "var(--tmpl-primary)",
                          color: "#fff",
                        }}
                      >
                        <ShoppingCart size={12} strokeWidth={2} />
                        加入
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* ====== Store Info Footer ====== */}
      <footer
        className="px-6 py-8"
        style={{
          borderTop: "1px solid var(--tmpl-border)",
          backgroundColor: "var(--tmpl-surface)",
        }}
      >
        {/* Store name */}
        <div className="text-center mb-6">
          <h3
            className="text-base tracking-[0.15em] mb-1"
            style={{
              fontFamily: "var(--tmpl-heading-font)",
              color: "var(--tmpl-text)",
            }}
          >
            {store?.name || "和风料理"}
          </h3>
          <div className="flex items-center justify-center gap-1">
            <Leaf
              size={10}
              strokeWidth={1.5}
              style={{ color: "var(--tmpl-primary)" }}
            />
            <span
              className="text-[10px] tracking-[0.2em]"
              style={{ color: "var(--tmpl-text-muted)" }}
            >
              用心做好每一道料理
            </span>
          </div>
        </div>

        {/* Info items */}
        <div className="space-y-0">
          <div
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: "1px solid var(--tmpl-border)" }}
          >
            <MapPin
              size={14}
              strokeWidth={1.5}
              style={{ color: "var(--tmpl-primary)", flexShrink: 0 }}
            />
            <span className="text-xs leading-relaxed" style={{ color: "var(--tmpl-text)" }}>
              {store?.address || "上海市静安区南京西路1234号"}
            </span>
          </div>

          <div
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: "1px solid var(--tmpl-border)" }}
          >
            <Clock
              size={14}
              strokeWidth={1.5}
              style={{ color: "var(--tmpl-primary)", flexShrink: 0 }}
            />
            <span className="text-xs" style={{ color: "var(--tmpl-text)" }}>
              {store?.business_hours || "11:00 - 14:00 / 17:00 - 22:00"}
            </span>
          </div>

          <div className="flex items-center gap-3 py-3">
            <Phone
              size={14}
              strokeWidth={1.5}
              style={{ color: "var(--tmpl-primary)", flexShrink: 0 }}
            />
            <span className="text-xs" style={{ color: "var(--tmpl-text)" }}>
              {store?.phone || "021-12345678"}
            </span>
          </div>
        </div>

        {/* Bottom brand */}
        <div className="mt-6 pt-4 text-center" style={{ borderTop: "1px solid var(--tmpl-border)" }}>
          <div className="flex items-center justify-center gap-1.5">
            <TreePine
              size={12}
              strokeWidth={1.5}
              style={{ color: "var(--tmpl-text-muted)" }}
            />
            <span
              className="text-[10px] tracking-[0.15em]"
              style={{ color: "var(--tmpl-text-muted)" }}
            >
              和食の心 · 一期一会
            </span>
          </div>
        </div>
      </footer>

      {/* Hide scrollbar utility */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
