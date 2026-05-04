import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, useCart } from "../context/AppContext";
import { api } from "../api/client";
import type { OrderType } from "../types";
import { ChevronLeft, Minus, Plus, Tag, MapPin, Utensils, Truck, Package } from "lucide-react";

export default function Confirm() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { cart, cartTotal } = useCart();
  const [orderType, setOrderType] = useState<OrderType>("dine_in");
  const [tableNo, setTableNo] = useState("");
  const [address, setAddress] = useState("");
  const [remark, setRemark] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [coupons] = useState(state.memberInfo ? [] : []);

  const deliveryFee = orderType === "delivery" ? 5 : 0;
  const discount = selectedCoupon ? 5 : 0;
  const total = Math.max(0, cartTotal + deliveryFee - discount);

  const handlePay = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const order = await api.post("/orders/", {
        store_id: state.store?.id || 1,
        order_type: orderType,
        table_no: orderType === "dine_in" ? tableNo : undefined,
        address: orderType === "delivery" ? address : undefined,
        items: cart.map((i) => ({
          dish_id: i.dishId,
          spec_id: i.specId,
          quantity: i.quantity,
        })),
        coupon_id: selectedCoupon || undefined,
        remark,
      });
      dispatch({ type: "CLEAR_CART" });
      navigate(`/payment/${order.order_no}`);
    } catch {
      alert("下单失败");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-400 text-sm">购物车为空</p>
        <button
          onClick={() => navigate("/menu")}
          className="mt-4 text-orange-500 text-sm"
        >
          去点餐
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-32">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-bold">确认订单</h1>
      </div>

      <div className="p-3 space-y-3">
        {/* Order Type */}
        <div className="bg-white rounded-xl p-4">
          <h2 className="text-sm font-bold mb-3">用餐方式</h2>
          <div className="flex gap-2">
            {[
              { key: "dine_in", label: "堂食", icon: Utensils },
              { key: "takeout", label: "自提", icon: Package },
              { key: "delivery", label: "外卖", icon: Truck },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setOrderType(t.key as OrderType)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border text-sm transition ${
                  orderType === t.key
                    ? "border-orange-500 text-orange-500 bg-orange-50"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                <t.icon size={18} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table No / Address */}
        {orderType === "dine_in" && (
          <div className="bg-white rounded-xl p-4">
            <label className="text-sm font-bold block mb-2">桌号</label>
            <input
              type="text"
              placeholder="请输入桌号"
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        )}

        {orderType === "delivery" && (
          <div className="bg-white rounded-xl p-4">
            <label className="text-sm font-bold block mb-2">
              <MapPin size={14} className="inline mr-1" />
              配送地址
            </label>
            <input
              type="text"
              placeholder="请输入配送地址"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-xl p-4">
          <h2 className="text-sm font-bold mb-3">商品清单</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={`${item.dishId}-${item.specId}`} className="flex items-center gap-3">
                <img
                  src={item.dishImage}
                  alt={item.dishName}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold">{item.dishName}</p>
                  {item.specName && (
                    <p className="text-xs text-gray-400">{item.specName}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">¥{item.price * item.quantity}</p>
                  <p className="text-xs text-gray-400">x{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag size={14} className="text-orange-500" />
            <span className="text-sm font-bold">优惠券</span>
          </div>
          <select
            className="w-full text-sm border rounded-lg p-2"
            value={selectedCoupon || ""}
            onChange={(e) => setSelectedCoupon(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">不使用优惠券</option>
          </select>
        </div>

        {/* Remark */}
        <div className="bg-white rounded-xl p-4">
          <label className="text-sm font-bold block mb-2">备注</label>
          <textarea
            placeholder="请输入备注，如少辣、不要葱等"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none h-16"
          />
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-xl p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">商品小计</span>
              <span>¥{cartTotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">优惠</span>
                <span className="text-orange-500">-¥{discount.toFixed(2)}</span>
              </div>
            )}
            {orderType === "delivery" && (
              <div className="flex justify-between">
                <span className="text-gray-500">配送费</span>
                <span>¥{deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-2 border-t">
              <span>合计</span>
              <span className="text-orange-500">¥{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-[430px] mx-auto flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">应付金额</span>
            <div className="text-xl font-bold text-orange-500">¥{total.toFixed(2)}</div>
          </div>
          <button
            onClick={handlePay}
            disabled={loading || (orderType === "dine_in" && !tableNo) || (orderType === "delivery" && !address)}
            className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold disabled:opacity-50"
          >
            {loading ? "处理中..." : "立即支付"}
          </button>
        </div>
      </div>
    </div>
  );
}
