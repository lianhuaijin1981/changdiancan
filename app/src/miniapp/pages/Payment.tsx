import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function Payment() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [payMethod, setPayMethod] = useState<"wechat" | "balance">("wechat");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "fail">("idle");

  useEffect(() => {
    if (!orderNo) return;
    api.get(`/orders/${orderNo}`).then(setOrder).catch(() => {});
  }, [orderNo]);

  const handlePay = async () => {
    setStatus("processing");
    try {
      await api.post("/payment/unified-order", {
        order_no: orderNo,
        pay_method: payMethod,
      });
      setTimeout(() => setStatus("success"), 1500);
    } catch {
      setStatus("fail");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="animate-bounce">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h1 className="text-xl font-bold mt-6">支付成功</h1>
        <p className="text-gray-400 text-sm mt-2">订单号: {orderNo}</p>
        <div className="mt-6 bg-gray-50 rounded-xl p-4 w-full max-w-sm">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">支付金额</span>
            <span className="font-bold">¥{order?.pay_amount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-500">支付方式</span>
            <span>{payMethod === "wechat" ? "微信支付" : "余额支付"}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-8 w-full max-w-sm">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 border border-orange-500 text-orange-500 py-3 rounded-full font-bold text-sm"
          >
            查看订单
          </button>
          <button
            onClick={() => navigate("/menu")}
            className="flex-1 bg-orange-500 text-white py-3 rounded-full font-bold text-sm"
          >
            继续点餐
          </button>
        </div>
      </div>
    );
  }

  if (status === "fail") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <XCircle size={64} className="text-red-500" />
        <h1 className="text-xl font-bold mt-6">支付失败</h1>
        <p className="text-gray-400 text-sm mt-2">请重新尝试</p>
        <div className="flex gap-3 mt-8 w-full max-w-sm">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 border border-gray-300 py-3 rounded-full font-bold text-sm"
          >
            查看订单
          </button>
          <button
            onClick={() => setStatus("idle")}
            className="flex-1 bg-orange-500 text-white py-3 rounded-full font-bold text-sm"
          >
            重新支付
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white px-4 py-4 text-center">
        <h1 className="font-bold">支付订单</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Summary */}
        <div className="bg-white rounded-xl p-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">订单金额</p>
            <p className="text-3xl font-bold text-orange-500 mt-1">
              ¥{order?.pay_amount?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">订单编号</span>
              <span>{orderNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">下单时间</span>
              <span>{order?.created_at ? new Date(order.created_at).toLocaleString() : ""}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl p-4">
          <h2 className="text-sm font-bold mb-3">选择支付方式</h2>
          <div className="space-y-2">
            <button
              onClick={() => setPayMethod("wechat")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${
                payMethod === "wechat"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200"
              }`}
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                微
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold">微信支付</p>
                <p className="text-xs text-gray-400">推荐</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  payMethod === "wechat" ? "border-orange-500" : "border-gray-300"
                }`}
              >
                {payMethod === "wechat" && (
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                )}
              </div>
            </button>
            <button
              onClick={() => setPayMethod("balance")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${
                payMethod === "balance"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200"
              }`}
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                余
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold">余额支付</p>
                <p className="text-xs text-gray-400">可用余额 ¥0.00</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  payMethod === "balance" ? "border-orange-500" : "border-gray-300"
                }`}
              >
                {payMethod === "balance" && (
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handlePay}
          disabled={status === "processing"}
          className="w-full max-w-[430px] mx-auto block bg-orange-500 text-white py-3 rounded-full font-bold disabled:opacity-70"
        >
          {status === "processing" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" /> 支付中...
            </span>
          ) : (
            `确认支付 ¥${order?.pay_amount?.toFixed(2) || "0.00"}`
          )}
        </button>
      </div>
    </div>
  );
}
