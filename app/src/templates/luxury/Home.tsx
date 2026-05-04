import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Star,
  ChevronRight,
  UtensilsCrossed,
  Wine,
  Fish,
  Beef,
  Salad,
  CakeSlice,
  Coffee,
  Calendar,
  Clock,
  MapPin,
  Phone,
} from "lucide-react";

// Mock data
const CATEGORIES = [
  { id: 1, name: "前菜", icon: Salad },
  { id: 2, name: "主菜", icon: Beef },
  { id: 3, name: "海鲜", icon: Fish },
  { id: 4, name: "汤品", icon: UtensilsCrossed },
  { id: 5, name: "甜点", icon: CakeSlice },
  { id: 6, name: "酒单", icon: Wine },
  { id: 7, name: "咖啡", icon: Coffee },
];

const CHEF_RECOMMENDATIONS = [
  {
    id: 1,
    name: "和牛M9西冷牛排",
    desc: "澳大利亚进口和牛，佐以黑松露酱汁",
    price: 688,
    tag: "主厨招牌",
  },
  {
    id: 2,
    name: "法式鹅肝批",
    desc: "低温慢煮鹅肝，搭配无花果酱",
    price: 298,
    tag: "经典",
  },
  {
    id: 3,
    name: "北海道扇贝",
    desc: "碳烤北海道扇贝，配鱼子酱",
    price: 388,
    tag: "限量",
  },
];

const SEASONAL_ITEMS = [
  { name: "白松露炖饭", season: "冬季限定", desc: "意大利阿尔巴白松露" },
  { name: "帝王蟹意面", season: "应季", desc: "鲜活帝王蟹手工制作" },
  { name: "香槟烩龙虾", season: "主厨推荐", desc: "法国香槟慢炖波士顿龙虾" },
];

function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(1);
  const [cartCount] = useState(0);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--tmpl-bg)",
        fontFamily: "var(--tmpl-body-font)",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Minimal header */}
      <div
        className="px-6 pt-12 pb-8"
        style={{ backgroundColor: "var(--tmpl-bg)" }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-xl tracking-wide"
              style={{
                color: "var(--tmpl-text)",
                fontFamily: "var(--tmpl-heading-font)",
                fontWeight: 400,
                letterSpacing: "0.1em",
              }}
            >
              L'AURUM
            </h1>
            <p
              className="text-[10px] mt-1 tracking-[0.2em] uppercase"
              style={{ color: "var(--tmpl-primary)" }}
            >
              Fine Dining · Est. 2019
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingBag
                size={20}
                strokeWidth={1.5}
                style={{ color: "var(--tmpl-text)" }}
              />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--tmpl-primary)",
                    color: "var(--tmpl-bg)",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Elegant greeting */}
        <p
          className="text-sm tracking-wide"
          style={{ color: "var(--tmpl-text-muted)" }}
        >
          欢迎莅临
        </p>
        <p
          className="text-2xl mt-1"
          style={{
            color: "var(--tmpl-text)",
            fontFamily: "var(--tmpl-heading-font)",
            fontWeight: 300,
            letterSpacing: "0.05em",
          }}
        >
          今日有何雅兴？
        </p>
      </div>

      {/* Hero image with gradient fade */}
      <div className="relative w-full h-64">
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop"
          alt="菜品"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, transparent 40%, var(--tmpl-bg) 100%)",
          }}
        />
        <div className="absolute bottom-6 left-6 right-6">
          <p
            className="text-[10px] tracking-[0.3em] uppercase mb-2"
            style={{ color: "var(--tmpl-primary)" }}
          >
            Chef's Selection
          </p>
          <p
            className="text-xl"
            style={{
              color: "var(--tmpl-text)",
              fontFamily: "var(--tmpl-heading-font)",
              fontWeight: 300,
              textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            }}
          >
            以匠心，敬呈味蕾艺术
          </p>
        </div>
      </div>

      {/* Category nav - minimal text-only */}
      <div className="px-6 mt-8 mb-10">
        <div className="flex gap-6 overflow-x-auto pb-3 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="relative pb-2 whitespace-nowrap transition-all"
              >
                <span
                  className="text-sm tracking-wide"
                  style={{
                    color: isActive
                      ? "var(--tmpl-text)"
                      : "var(--tmpl-text-muted)",
                    fontFamily: isActive
                      ? "var(--tmpl-heading-font)"
                      : "var(--tmpl-body-font)",
                    fontWeight: isActive ? 400 : 300,
                  }}
                >
                  {cat.name}
                </span>
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[1px]"
                    style={{
                      backgroundColor: "var(--tmpl-primary)",
                      boxShadow: "0 0 8px var(--tmpl-primary)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 主厨推荐 */}
      <div className="px-6 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-6 h-[1px]"
            style={{ backgroundColor: "var(--tmpl-primary)" }}
          />
          <h2
            className="text-sm tracking-[0.15em] uppercase"
            style={{
              color: "var(--tmpl-text)",
              fontFamily: "var(--tmpl-heading-font)",
              fontWeight: 400,
            }}
          >
            主厨推荐
          </h2>
          <div
            className="flex-1 h-[1px]"
            style={{ backgroundColor: "var(--tmpl-border)" }}
          />
        </div>

        <div className="space-y-6">
          {CHEF_RECOMMENDATIONS.map((item, index) => (
            <div
              key={item.id}
              className="relative"
              style={{
                borderBottom:
                  index < CHEF_RECOMMENDATIONS.length - 1
                    ? "1px solid var(--tmpl-border)"
                    : "none",
                paddingBottom:
                  index < CHEF_RECOMMENDATIONS.length - 1 ? 24 : 0,
              }}
            >
              <div className="flex gap-4">
                {/* Dish image */}
                <div
                  className="w-24 h-24 flex-shrink-0 overflow-hidden"
                  style={{
                    border: "1px solid var(--tmpl-primary)30",
                    borderRadius: "var(--tmpl-radius-md)",
                  }}
                >
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--tmpl-surface)" }}
                  >
                    <UtensilsCrossed
                      size={24}
                      strokeWidth={1}
                      style={{ color: "var(--tmpl-primary)40" }}
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="text-base"
                        style={{
                          color: "var(--tmpl-text)",
                          fontFamily: "var(--tmpl-heading-font)",
                          fontWeight: 400,
                        }}
                      >
                        {item.name}
                      </h3>
                      <span
                        className="px-2 py-0.5 text-[9px] tracking-wider uppercase"
                        style={{
                          color: "var(--tmpl-primary)",
                          border: "1px solid var(--tmpl-primary)40",
                          borderRadius: "var(--tmpl-radius-sm)",
                        }}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--tmpl-text-muted)" }}
                    >
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span
                      className="text-lg"
                      style={{
                        color: "var(--tmpl-primary)",
                        fontFamily: "var(--tmpl-heading-font)",
                        fontWeight: 400,
                      }}
                    >
                      ¥{item.price}
                    </span>
                    <button
                      className="px-4 py-1.5 text-xs tracking-wider"
                      style={{
                        color: "var(--tmpl-primary)",
                        border: "1px solid var(--tmpl-primary)60",
                        borderRadius: "var(--tmpl-radius-sm)",
                        backgroundColor: "transparent",
                      }}
                    >
                      品尝
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 季节性菜单 */}
      <div className="px-6 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-6 h-[1px]"
            style={{ backgroundColor: "var(--tmpl-primary)" }}
          />
          <h2
            className="text-sm tracking-[0.15em] uppercase"
            style={{
              color: "var(--tmpl-text)",
              fontFamily: "var(--tmpl-heading-font)",
              fontWeight: 400,
            }}
          >
            季节性菜单
          </h2>
          <div
            className="flex-1 h-[1px]"
            style={{ backgroundColor: "var(--tmpl-border)" }}
          />
        </div>

        <div
          className="p-6"
          style={{
            backgroundColor: "var(--tmpl-surface)",
            borderLeft: "2px solid var(--tmpl-primary)",
            borderRadius: "0 var(--tmpl-radius-md) var(--tmpl-radius-md) 0",
          }}
        >
          <div className="space-y-5">
            {SEASONAL_ITEMS.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: "var(--tmpl-primary)" }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--tmpl-text)",
                        fontFamily: "var(--tmpl-heading-font)",
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="text-[9px] tracking-wider"
                      style={{ color: "var(--tmpl-primary)80" }}
                    >
                      {item.season}
                    </span>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: "var(--tmpl-text-muted)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            className="w-full mt-6 py-3 text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all"
            style={{
              color: "var(--tmpl-text)",
              border: "1px solid var(--tmpl-border)",
              borderRadius: "var(--tmpl-radius-sm)",
            }}
          >
            浏览完整季节菜单
            <ChevronRight size={14} strokeWidth={1} />
          </button>
        </div>
      </div>

      {/* Restaurant info */}
      <div className="px-6 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MapPin
              size={14}
              strokeWidth={1.5}
              style={{ color: "var(--tmpl-primary)" }}
            />
            <span
              className="text-xs"
              style={{ color: "var(--tmpl-text-muted)" }}
            >
              上海市静安区南京西路1266号恒隆广场66层
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Clock
              size={14}
              strokeWidth={1.5}
              style={{ color: "var(--tmpl-primary)" }}
            />
            <span
              className="text-xs"
              style={{ color: "var(--tmpl-text-muted)" }}
            >
              午餐 11:30 - 14:30 / 晚餐 17:30 - 22:00
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Phone
              size={14}
              strokeWidth={1.5}
              style={{ color: "var(--tmpl-primary)" }}
            />
            <span
              className="text-xs"
              style={{ color: "var(--tmpl-text-muted)" }}
            >
              021-6888-8888
            </span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-12">
        <button
          className="w-full py-4 text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all"
          style={{
            backgroundColor: "var(--tmpl-surface)",
            color: "var(--tmpl-text)",
            border: "1px solid var(--tmpl-primary)60",
            borderRadius: "var(--tmpl-radius-md)",
            fontFamily: "var(--tmpl-heading-font)",
            fontWeight: 400,
          }}
          onClick={() => navigate("/reservation")}
        >
          <Calendar
            size={16}
            strokeWidth={1.5}
            style={{ color: "var(--tmpl-primary)" }}
          />
          预约订座
        </button>
      </div>
    </div>
  );
}

export default Home;
