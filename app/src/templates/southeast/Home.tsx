import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf,
  Sun,
  Soup,
  Fish,
  Flame,
  Zap,
  Star,
  ChevronRight,
  ShoppingCart,
  MapPin,
  Clock,
  Heart,
  Plus,
  Award,
  Coffee,
  Cherry,
  Drumstick,
  Croissant,
} from "lucide-react";
import { api } from "../../miniapp/api/client";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    api.get("/api/stores/1").then(setStore);
    api.get("/api/categories?store_id=1").then(setCategories);
    api.get("/api/dishes?store_id=1&is_featured=true").then(setDishes);
  }, []);

  const categoryIcons: Record<string, React.ReactNode> = {
    default: <Soup size={16} />,
    soup: <Soup size={16} />,
    fish: <Fish size={16} />,
    noodle: <Coffee size={16} />,
    rice: <MapPin size={16} />,
    meat: <Drumstick size={16} />,
    dessert: <Croissant size={16} />,
    fruit: <Cherry size={16} />,
  };

  const getCategoryIcon = (name: string) => {
    const key = Object.keys(categoryIcons).find((k) =>
      name.toLowerCase().includes(k)
    );
    return categoryIcons[key || "default"];
  };

  const categoryColors = [
    { bg: "#2D7D46", text: "#FFFFFF" },
    { bg: "#F9A825", text: "#1B3409" },
    { bg: "#E67E22", text: "#FFFFFF" },
    { bg: "#FF7043", text: "#FFFFFF" },
    { bg: "#43A047", text: "#FFFFFF" },
    { bg: "#FBC02D", text: "#1B3409" },
  ];

  const getCategoryColor = (index: number) => categoryColors[index % categoryColors.length];

  const renderSpiceLevel = (level: number = 2) => {
    const icons = [];
    for (let i = 0; i < 3; i++) {
      icons.push(
        <Flame
          key={i}
          size={12}
          className={i < level ? "text-[#F9A825]" : "text-[#E8E4D0]"}
          fill={i < level ? "#F9A825" : "#E8E4D0"}
        />
      );
    }
    return (
      <div className="flex items-center gap-[2px]" title={`辣度: ${level}/3`}>
        {icons}
      </div>
    );
  };

  const chefPick = dishes.find((d) => d.is_chef_pick);
  const featuredDishes = dishes.filter((d) => !d.is_chef_pick);

  return (
    <div
      className="min-h-screen pb-6 font-sans antialiased"
      style={{
        maxWidth: "430px",
        margin: "0 auto",
        backgroundColor: "var(--tmpl-bg)",
        color: "var(--tmpl-text)",
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes bounceIn {
          0% { transform: scale(1); }
          40% { transform: scale(1.25); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-bounce-btn:active { animation: bounceIn 0.4s ease; }
        .animate-fade-up { animation: fadeUp 0.5s ease-out forwards; }
        .shimmer-bg {
          background: linear-gradient(90deg, var(--tmpl-secondary) 0%, #FFEB3B 50%, var(--tmpl-secondary) 100%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        .tropical-shadow {
          box-shadow: 0 4px 20px rgba(45, 125, 70, 0.12), 0 2px 8px rgba(249, 168, 37, 0.08);
        }
        .soft-shadow {
          box-shadow: 0 2px 12px rgba(27, 52, 9, 0.06);
        }
        .dots-pattern {
          background-image: radial-gradient(circle, rgba(255,255,255,0.25) 1.5px, transparent 1.5px);
          background-size: 14px 14px;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header */}
      <header
        className="relative px-5 pt-8 pb-6 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #FFF9C4 0%, var(--tmpl-bg) 100%)",
        }}
      >
        {/* Decorative palm leaves */}
        <div className="absolute top-2 right-2 opacity-[0.12] rotate-[-15deg]">
          <Leaf size={80} color="#2D7D46" />
        </div>
        <div className="absolute top-6 right-20 opacity-[0.08] rotate-[20deg]">
          <Leaf size={50} color="#2D7D46" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--tmpl-primary-light)" }}
            >
              <Leaf size={20} color="#2D7D46" />
            </div>
            <div>
              <h1
                className="text-xl font-bold leading-tight"
                style={{ color: "var(--tmpl-primary)" }}
              >
                {store?.name || "泰香小馆"}
              </h1>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--tmpl-text-muted)" }}>
                <MapPin size={11} />
                <span>{store?.address || "阳光花园 · 1.2km"}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div
              className="px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5"
              style={{
                backgroundColor: "rgba(249, 168, 37, 0.15)",
                color: "#E65100",
              }}
            >
              <Sun size={14} className="animate-float" />
              <span>萨瓦迪卡</span>
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-xs inline-flex items-center gap-1"
              style={{
                backgroundColor: "var(--tmpl-primary-light)",
                color: "var(--tmpl-primary)",
              }}
            >
              <Clock size={12} />
              <span>营业中 · 11:00-22:00</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tropical Banner */}
      <section className="px-4 mt-2 animate-fade-up">
        <div
          className="relative rounded-3xl overflow-hidden tropical-shadow"
          style={{
            background: "linear-gradient(135deg, #F9A825 0%, #2D7D46 100%)",
          }}
        >
          {/* Decorative dots pattern */}
          <div className="absolute inset-0 dots-pattern opacity-30" />

          <div className="relative z-10 px-5 py-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={14} className="text-white" fill="white" />
                <span className="text-white/80 text-xs font-medium">限时特惠</span>
              </div>
              <h2 className="text-white text-lg font-bold">今日特惠</h2>
              <p className="text-white/90 text-sm mt-0.5">冬阴功海鲜汤 7折优惠</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-white text-xl font-bold">¥42</span>
                <span className="text-white/60 text-sm line-through">¥60</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sun size={32} className="text-white animate-float" />
            </div>
          </div>

          {/* Wavy bottom */}
          <svg
            viewBox="0 0 430 24"
            className="absolute bottom-0 left-0 w-full"
            preserveAspectRatio="none"
            style={{ height: "16px" }}
          >
            <path
              d="M0,12 Q53.75,24 107.5,12 T215,12 T322.5,12 T430,12 L430,24 L0,24 Z"
              fill="var(--tmpl-bg)"
            />
          </svg>
        </div>
      </section>

      {/* Category Pills */}
      <section className="mt-5 px-4 animate-fade-up">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold" style={{ color: "var(--tmpl-text)" }}>
            美食分类
          </h3>
          <button
            className="text-xs flex items-center gap-0.5"
            style={{ color: "var(--tmpl-text-muted)" }}
          >
            全部 <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
          {(categories.length > 0 ? categories : [
            { id: 1, name: "汤品" },
            { id: 2, name: "海鲜" },
            { id: 3, name: "面食" },
            { id: 4, name: "米饭" },
            { id: 5, name: "烤肉" },
            { id: 6, name: "甜点" },
          ]).map((cat, index) => {
            const colors = getCategoryColor(index);
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(isActive ? null : cat.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-[24px] text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: isActive ? "var(--tmpl-primary)" : colors.bg,
                  color: isActive ? "#FFFFFF" : colors.text,
                  boxShadow: isActive
                    ? "0 2px 12px rgba(45, 125, 70, 0.3)"
                    : "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                {getCategoryIcon(cat.name)}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Chef's Pick */}
      {chefPick && (
        <section className="mt-5 px-4 animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} color="#2D7D46" />
            <h3 className="text-base font-bold" style={{ color: "var(--tmpl-text)" }}>
              主厨推荐
            </h3>
          </div>

          <div
            className="relative rounded-3xl overflow-hidden soft-shadow"
            style={{
              backgroundColor: "var(--tmpl-surface)",
              borderLeft: "4px solid var(--tmpl-primary)",
            }}
          >
            <div className="flex p-3 gap-3">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden">
                <img
                  src={chefPick.image || "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=200&h=200&fit=crop"}
                  alt={chefPick.name}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute top-1 left-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-0.5"
                  style={{ backgroundColor: "var(--tmpl-primary)" }}
                >
                  <Award size={10} />
                  主厨推荐
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <h4 className="text-sm font-bold truncate" style={{ color: "var(--tmpl-text)" }}>
                    {chefPick.name}
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: "var(--tmpl-text-muted)" }}>
                    {chefPick.description || "精选食材 · 匠心烹制 · 泰式经典"}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {renderSpiceLevel(chefPick.spice_level || 2)}
                    <span className="text-[10px]" style={{ color: "var(--tmpl-text-muted)" }}>
                      {chefPick.spice_level === 1 ? "微辣" : chefPick.spice_level === 2 ? "中辣" : "特辣"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold" style={{ color: "var(--tmpl-primary)" }}>
                    ¥{chefPick.price}
                  </span>
                  <button
                    className="w-7 h-7 rounded-full flex items-center justify-center animate-bounce-btn"
                    style={{ backgroundColor: "var(--tmpl-primary)" }}
                  >
                    <Plus size={16} color="white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Signature Dishes */}
      <section className="mt-5 px-4 animate-fade-up">
        <div className="flex items-center gap-2 mb-3">
          <Star size={18} color="#F9A825" fill="#F9A825" />
          <h3 className="text-base font-bold" style={{ color: "var(--tmpl-text)" }}>
            招牌推荐
          </h3>
        </div>

        <div className="space-y-3">
          {(featuredDishes.length > 0 ? featuredDishes : [
            {
              id: 1,
              name: "冬阴功海鲜汤",
              description: "酸辣鲜香 · 泰式经典",
              price: 42,
              spice_level: 2,
              image: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=300&h=220&fit=crop",
              tag: "热销",
            },
            {
              id: 2,
              name: "泰式青柠蒸鲈鱼",
              description: "清新酸爽 · 鲜嫩入味",
              price: 58,
              spice_level: 1,
              image: "https://images.unsplash.com/photo-1626804475297-411dbe1b3c5a?w=300&h=220&fit=crop",
              tag: "新品",
            },
            {
              id: 3,
              name: "椰香芒果糯米饭",
              description: "香甜软糯 · 热带风味",
              price: 28,
              spice_level: 0,
              image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=300&h=220&fit=crop",
              tag: null,
            },
            {
              id: 4,
              name: "泰式炒金边粉",
              description: "锅气十足 · 酸甜适口",
              price: 36,
              spice_level: 2,
              image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300&h=220&fit=crop",
              tag: "热销",
            },
          ]).map((dish) => (
            <div
              key={dish.id}
              className="rounded-3xl overflow-hidden tropical-shadow"
              style={{ backgroundColor: "var(--tmpl-surface)" }}
            >
              {/* Image area with yellow border accent */}
              <div className="relative">
                <div
                  className="h-36 w-full"
                  style={{
                    borderBottom: "3px solid var(--tmpl-secondary)",
                  }}
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Badge */}
                {dish.tag && (
                  <div
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1"
                    style={{
                      backgroundColor:
                        dish.tag === "新品"
                          ? "var(--tmpl-badge-new)"
                          : "var(--tmpl-badge-hot)",
                    }}
                  >
                    {dish.tag === "新品" ? <Leaf size={10} /> : <Flame size={10} />}
                    {dish.tag}
                  </div>
                )}

                {/* Heart */}
                <button className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <Heart size={14} color="#FF7043" />
                </button>
              </div>

              {/* Content */}
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold truncate" style={{ color: "var(--tmpl-text)" }}>
                      {dish.name}
                    </h4>
                    <p className="text-xs mt-0.5" style={{ color: "var(--tmpl-text-muted)" }}>
                      {dish.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {renderSpiceLevel(dish.spice_level || 0)}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: "rgba(249, 168, 37, 0.15)",
                        color: "#E65100",
                      }}
                    >
                      ¥{dish.price}
                    </span>
                    {dish.original_price && (
                      <span className="text-xs line-through" style={{ color: "var(--tmpl-text-muted)" }}>
                        ¥{dish.original_price}
                      </span>
                    )}
                  </div>
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center animate-bounce-btn"
                    style={{ backgroundColor: "var(--tmpl-primary)" }}
                  >
                    <Plus size={18} color="white" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-6 px-4 animate-fade-up">
        <div
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, #E8F5E9 0%, #FFF9C4 100%)",
            border: "1px dashed var(--tmpl-primary)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--tmpl-primary)" }}
            >
              <ShoppingCart size={18} color="white" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--tmpl-primary)" }}>
                开始点餐
              </p>
              <p className="text-xs" style={{ color: "var(--tmpl-text-muted)" }}>
                满 ¥50 免配送费
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/menu")}
            className="px-4 py-2 rounded-full text-sm font-bold text-white flex items-center gap-1"
            style={{ backgroundColor: "var(--tmpl-primary)" }}
          >
            去选购
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Decorative footer leaves */}
      <div className="mt-8 flex justify-center opacity-[0.06]">
        <Leaf size={40} color="#2D7D46" />
        <Leaf size={32} color="#2D7D46" className="rotate-[30deg]" />
        <Leaf size={40} color="#2D7D46" className="rotate-[-20deg]" />
      </div>
    </div>
  );
};

export default Home;
