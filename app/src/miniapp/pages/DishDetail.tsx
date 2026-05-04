import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useApp } from "../context/AppContext";
import type { Dish } from "../types";
import { Minus, Plus, ChevronLeft, ShoppingCart } from "lucide-react";

export default function DishDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [dish, setDish] = useState<Dish | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);

  const cartCount = state.cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (!id) return;
    api.get(`/dishes/${id}`).then((d: Dish) => {
      setDish(d);
      if (d.specs?.length > 0) setSelectedSpec(d.specs[0].id);
    }).catch(() => {});
  }, [id]);

  const spec = dish?.specs?.find((s) => s.id === selectedSpec);
  const currentPrice = spec?.price ?? dish?.price ?? 0;

  const handleAdd = () => {
    if (!dish) return;
    dispatch({
      type: "ADD_TO_CART",
      payload: {
        dishId: dish.id,
        dishName: dish.name,
        dishImage: dish.image_url,
        specId: spec?.id,
        specName: spec?.name,
        price: currentPrice,
        quantity,
      },
    });
    navigate("/menu");
  };

  if (!dish) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-400 text-sm">加载中...</span>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="relative">
        <img
          src={dish.image_url}
          alt={dish.name}
          className="w-full aspect-square object-cover"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 bg-black/30 rounded-full flex items-center justify-center text-white"
        >
          <ChevronLeft size={20} />
        </button>
        {cartCount > 0 && (
          <button
            onClick={() => navigate("/menu")}
            className="absolute top-4 right-4 w-9 h-9 bg-black/30 rounded-full flex items-center justify-center text-white"
          >
            <ShoppingCart size={18} />
          </button>
        )}
      </div>

      <div className="p-4">
        {/* Name & Price */}
        <h1 className="text-xl font-bold">{dish.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl font-bold text-orange-500">
            ¥{currentPrice}
          </span>
          {dish.original_price && (
            <span className="text-gray-300 line-through">
              ¥{spec?.original_price || dish.original_price}
            </span>
          )}
          <span className="text-xs text-gray-400 ml-2">
            已售 {dish.sales_count}+
          </span>
        </div>

        {/* Specs */}
        {dish.specs && dish.specs.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-bold mb-2">规格</h3>
            <div className="flex flex-wrap gap-2">
              {dish.specs.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSpec(s.id)}
                  className={`px-4 py-2 rounded-lg text-sm border transition ${
                    selectedSpec === s.id
                      ? "border-orange-500 text-orange-500 bg-orange-50"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {s.name} ¥{s.price}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-4">
          <h3 className="text-sm font-bold mb-2">商品详情</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {dish.description || "暂无描述"}
          </p>
        </div>

        {/* Quantity */}
        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-sm font-bold">数量</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full border flex items-center justify-center"
            >
              <Minus size={14} />
            </button>
            <span className="text-base font-bold w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Add Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <div className="max-w-[430px] mx-auto flex items-center gap-4">
          <div>
            <span className="text-xs text-gray-400">合计</span>
            <div className="text-xl font-bold text-orange-500">
              ¥{(currentPrice * quantity).toFixed(2)}
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 bg-orange-500 text-white py-3 rounded-full font-bold text-base"
          >
            加入购物车
          </button>
        </div>
      </div>
    </div>
  );
}
