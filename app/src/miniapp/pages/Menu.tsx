import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useApp, useCart } from "../context/AppContext";
import type { Category, Dish, CartItem, Coupon } from "../types";
import {
  Plus,
  Minus,
  ShoppingCart,
  Tag,
  Trash2,
  AlertTriangle,
  MapPin,
} from "lucide-react";

interface LowStockMap {
  [dishId: number]: number;
}

export default function Menu() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { cart, cartTotal, cartCount } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [activeCat, setActiveCat] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [lowStockMap, setLowStockMap] = useState<LowStockMap>({});

  const storeId = state.store?.id || 1;
  const table = state.table;

  useEffect(() => {
    api.get(`/categories/?store_id=${storeId}`).then((cats: Category[]) => {
      setCategories(cats);
      if (cats.length > 0) setActiveCat(cats[0].id);
    }).catch(() => {});
    api.get(`/dishes/?store_id=${storeId}`).then(setDishes).catch(() => {});
    api.get("/coupons/").then(setCoupons).catch(() => {});

    // Fetch low stock items
    api.get(`/inventory/low-stock?store_id=${storeId}&threshold=5`)
      .then((items: any[]) => {
        const map: LowStockMap = {};
        items.forEach((item: any) => {
          map[item.dish_id || item.id] = item.stock;
        });
        setLowStockMap(map);
      })
      .catch(() => {});
  }, [storeId]);

  const filteredDishes = dishes.filter((d) => d.category_id === activeCat);

  const addToCart = (dish: Dish, spec?: { id: number; name: string; price: number }) => {
    const item: CartItem = {
      dishId: dish.id,
      dishName: dish.name,
      dishImage: dish.image_url,
      specId: spec?.id,
      specName: spec?.name,
      price: spec ? spec.price : dish.price,
      quantity: 1,
    };
    dispatch({ type: "ADD_TO_CART", payload: item });
  };

  const updateQty = (dishId: number, specId: number | undefined, delta: number) => {
    const existing = cart.find((i) => i.dishId === dishId && i.specId === specId);
    if (!existing) return;
    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      dispatch({ type: "REMOVE_FROM_CART", payload: { dishId, specId } });
    } else {
      dispatch({ type: "UPDATE_CART_QTY", payload: { dishId, specId, quantity: newQty } });
    }
  };

  const getItemQty = (dishId: number) => {
    return cart.filter((i) => i.dishId === dishId).reduce((s, i) => s + i.quantity, 0);
  };

  const getDishStock = (dish: Dish): number => {
    if (dish.stock !== undefined) return dish.stock;
    return lowStockMap[dish.id] !== undefined ? lowStockMap[dish.id] : 999;
  };

  const getStockBadge = (dish: Dish) => {
    const stock = getDishStock(dish);
    if (stock <= 0) {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 font-medium">
          已售罄
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 font-medium flex items-center gap-0.5">
          <AlertTriangle size={10} />
          仅剩{stock}份
        </span>
      );
    }
    return null;
  };

  const discountAmount = selectedCoupon
    ? Math.min(selectedCoupon.discount_amount, cartTotal)
    : 0;

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-gray-100">
      {/* Table info banner */}
      {table && (
        <div className="bg-orange-500 text-white px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <MapPin size={14} />
          <span className="text-xs font-medium">当前桌台: {table.table_no}</span>
          <span className="text-[10px] opacity-80">({table.capacity}人桌)</span>
        </div>
      )}

      {/* Category + Dish area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left category list */}
        <div className="w-20 bg-gray-50 overflow-y-auto no-scrollbar flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`w-full text-center py-3 px-1 text-xs transition-colors relative ${
                activeCat === cat.id
                  ? "bg-white text-orange-500 font-bold"
                  : "text-gray-500"
              }`}
            >
              {activeCat === cat.id && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-orange-500 rounded-r" />
              )}
              <span className="line-clamp-2">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Right dish list */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
          {filteredDishes.map((dish) => (
            <div key={dish.id} className="bg-white rounded-xl p-3 flex gap-3">
              <button
                onClick={() => navigate(`/dish/${dish.id}`)}
                className="flex-shrink-0"
              >
                <img
                  src={dish.image_url}
                  alt={dish.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              </button>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-sm font-bold"
                      onClick={() => navigate(`/dish/${dish.id}`)}
                    >
                      {dish.name}
                    </h3>
                    {getStockBadge(dish)}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {dish.description}
                  </p>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <div>
                    <span className="text-orange-500 font-bold text-base">
                      ¥{dish.price}
                    </span>
                    {dish.original_price && (
                      <span className="text-gray-300 text-xs line-through ml-1">
                        ¥{dish.original_price}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getItemQty(dish.id) > 0 && (
                      <>
                        <button
                          onClick={() => {
                            const item = cart.find((i) => i.dishId === dish.id);
                            if (item) updateQty(dish.id, item.specId, -1);
                          }}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">
                          {getItemQty(dish.id)}
                        </span>
                      </>
                    )}
                    <button
                      onClick={() => {
                        if (dish.specs?.length > 1) {
                          navigate(`/dish/${dish.id}`);
                        } else {
                          addToCart(
                            dish,
                            dish.specs?.length === 1
                              ? dish.specs[0]
                              : undefined
                          );
                        }
                      }}
                      disabled={getDishStock(dish) <= 0}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white transition-colors ${
                        getDishStock(dish) <= 0
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-orange-500 active:bg-orange-600"
                      }`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <div className="bg-white border-t shadow-lg">
          {/* Cart drawer overlay */}
          {cartOpen && (
            <div className="absolute inset-0 z-40 bg-black/30" onClick={() => setCartOpen(false)} />
          )}

          {/* Cart drawer */}
          {cartOpen && (
            <div className="absolute bottom-[56px] left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[60vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-sm font-bold">已选商品</span>
                <button
                  onClick={() => dispatch({ type: "CLEAR_CART" })}
                  className="text-xs text-gray-400 flex items-center gap-1"
                >
                  <Trash2 size={12} /> 清空
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {cart.map((item) => (
                  <div key={`${item.dishId}-${item.specId}`} className="flex items-center gap-3">
                    <img
                      src={item.dishImage}
                      alt={item.dishName}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{item.dishName}</p>
                      {item.specName && (
                        <p className="text-xs text-gray-400">{item.specName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 font-bold text-sm">
                        ¥{item.price * item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.dishId, item.specId, -1)}
                        className="w-5 h-5 rounded-full border flex items-center justify-center"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.dishId, item.specId, 1)}
                        className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Coupon selection */}
                {coupons.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={14} className="text-orange-500" />
                      <span className="text-sm font-bold">优惠券</span>
                    </div>
                    <select
                      className="w-full text-sm border rounded-lg p-2"
                      value={selectedCoupon?.id || ""}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        setSelectedCoupon(coupons.find((c) => c.id === id) || null);
                      }}
                    >
                      <option value="">不使用优惠券</option>
                      {coupons
                        .filter((c) => cartTotal >= c.min_spend)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title} - ¥{c.discount_amount} (满{c.min_spend}可用)
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom bar */}
          <div className="relative z-10 flex items-center px-4 py-2">
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="relative -mt-6 mr-3"
            >
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <ShoppingCart size={20} className="text-white" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              </div>
            </button>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold">¥{finalTotal.toFixed(2)}</span>
                {discountAmount > 0 && (
                  <span className="text-xs text-gray-400 line-through">
                    ¥{cartTotal.toFixed(2)}
                  </span>
                )}
              </div>
              {selectedCoupon && (
                <span className="text-xs text-orange-500">
                  已优惠 ¥{discountAmount.toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate("/confirm")}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-bold text-sm"
            >
              去结算
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
