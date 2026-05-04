import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useApp } from "../context/AppContext";
import type { Store, Category, Dish, Activity } from "../types";
import {
  MapPin,
  Clock,
  Megaphone,
  ChevronRight,
  Star,
  ShoppingCart,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Dish[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.get("/stores/").then((res: Store[]) => {
      if (res.length > 0) {
        const s = res[0];
        setStore(s);
        dispatch({ type: "SET_STORE", payload: s });
        api.get(`/categories/?store_id=${s.id}`).then(setCategories).catch(() => {});
        api.get(`/dishes/?store_id=${s.id}`).then((dishes: Dish[]) => {
          setFeatured(dishes.filter((d) => d.is_featured));
        }).catch(() => {});
      }
    }).catch(() => {});
    api.get("/activities/").then(setActivities).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (!store?.banner_urls?.length) return;
    bannerTimer.current = setInterval(() => {
      setBannerIdx((i) => (i + 1) % store.banner_urls.length);
    }, 3000);
    return () => {
      if (bannerTimer.current) clearInterval(bannerTimer.current);
    };
  }, [store]);

  const cartCount = state.cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="pb-20">
      {/* Store Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-400 text-white p-4 pb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {store?.name || "畅点餐"}
            </h1>
            <div className="flex items-center gap-1 text-xs text-white/80 mt-1">
              <Clock size={12} />
              <span>{store?.business_hours || "10:00 - 22:00"}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/80 mt-0.5">
              <MapPin size={12} />
              <span className="line-clamp-1">{store?.address || ""}</span>
            </div>
          </div>
          {cartCount > 0 && (
            <button
              onClick={() => navigate("/menu")}
              className="relative bg-white/20 p-2 rounded-full"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            </button>
          )}
        </div>

        {/* Announcement */}
        <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2 mt-3">
          <Megaphone size={14} />
          <span className="text-xs line-clamp-1">{store?.announcement || "欢迎来到畅点餐小程序，享受美食时光！"}</span>
        </div>
      </div>

      {/* Banner Carousel */}
      {store?.banner_urls && store.banner_urls.length > 0 && (
        <div className="relative -mt-3 mx-3 rounded-xl overflow-hidden aspect-[16/7] bg-gray-200">
          <img
            src={store.banner_urls[bannerIdx]}
            alt="banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 flex gap-1">
            {store.banner_urls.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i === bannerIdx ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mx-3 mt-4 bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm">分类浏览</h2>
            <button
              onClick={() => navigate("/menu")}
              className="text-xs text-orange-500 flex items-center"
            >
              全部 <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate("/menu")}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-lg">
                  {cat.icon || "🍽"}
                </div>
                <span className="text-xs text-gray-600">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activities */}
      {activities.length > 0 && (
        <div className="mx-3 mt-4">
          <h2 className="font-bold text-sm mb-2">最新活动</h2>
          <div className="space-y-2">
            {activities.slice(0, 2).map((act) => (
              <div
                key={act.id}
                className="bg-white rounded-xl overflow-hidden flex"
              >
                <img
                  src={act.image_url}
                  alt={act.title}
                  className="w-24 h-20 object-cover"
                />
                <div className="flex-1 p-3 flex flex-col justify-center">
                  <h3 className="text-sm font-bold">{act.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Dishes */}
      {featured.length > 0 && (
        <div className="mt-4">
          <div className="mx-3 flex items-center justify-between mb-2">
            <h2 className="font-bold text-sm">招牌推荐</h2>
            <button
              onClick={() => navigate("/menu")}
              className="text-xs text-orange-500 flex items-center"
            >
              更多 <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto px-3 no-scrollbar snap-x snap-mandatory">
            {featured.map((dish) => (
              <button
                key={dish.id}
                onClick={() => navigate(`/dish/${dish.id}`)}
                className="snap-start flex-shrink-0 w-32 bg-white rounded-xl overflow-hidden text-left"
              >
                <img
                  src={dish.image_url}
                  alt={dish.name}
                  className="w-full h-24 object-cover"
                />
                <div className="p-2">
                  <h3 className="text-xs font-bold truncate">{dish.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={10} className="text-orange-400 fill-orange-400" />
                    <span className="text-xs text-gray-400">{dish.sales_count}+</span>
                  </div>
                  <p className="text-orange-500 font-bold text-sm mt-1">¥{dish.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
