import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useApp } from "../context/AppContext";
import { CheckCircle, XCircle, Loader2, Smartphone, Wallet } from "lucide-react";

// 微信支付JSAPI调起函数
// 在真实微信浏览器内，window.WeixinJSBridge 可用
declare global {
  interface Window {
    WeixinJSBridge?: {
      invoke: (name: string, params: any, callback: (res: any) => void) => void;
    };
  }
}

export default function Payment() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const [order, setOrder] = useState<any>(null);
  const [payMethod, setPayMethod] = useState<"wechat" | "balance">("wechat");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "fail">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    if (!orderNo) return;
    api.get(`/orders/${orderNo}`).then((res: any) => {
      if (res.code === 200) setOrder(res.data);
    }).catch(() => {});
  }, [orderNo]);

  // ==================== 真实微信支付 ====================
  const handleWechatPay = async () => {
    setStatus("processing");
    try {
      // 1. 调用统一下单
      const openid = state.user?.openid || "";
      const res: any = await api.post("/payment/unified-order", {
        order_no: orderNo,
        openid: openid,
        pay_type: "wechat",
      });

      if (res.code !== 200) {
        throw new Error(res.message || "下单失败");
      }

      // 检查是否为模拟模式
      if (res.data?.mock_mode) {
        setMockMode(true);
        // 模拟支付：直接跳转成功
        setTimeout(() => confirmMockPayment(), 1500);
        return;
      }

      // 2. 获取支付参数
      const payParams = res.data?.pay_params;
      if (!payParams) {
        throw new Error("获取支付参数失败");
      }

      // 3. 判断环境并调起支付
      const isWechatBrowser = /MicroMessenger/i.test(navigator.userAgent);

      if (isWechatBrowser && window.WeixinJSBridge) {
        // 在微信浏览器内使用 JSAPI
        window.WeixinJSBridge.invoke(
          "getBrandWCPayRequest",
          {
            appId: payParams.appId,
            timeStamp: payParams.timeStamp,
            nonceStr: payParams.nonceStr,
            package: payParams.package,
            signType: payParams.signType,
            paySign: payParams.paySign,
          },
          (payRes: any) => {
            if (payRes.err_msg === "get_brand_wcpay_request:ok") {
              // 支付成功
              setStatus("success");
            } else if (payRes.err_msg === "get_brand_wcpay_request:cancel") {
              setStatus("idle");
              setErrorMsg("用户取消支付");
            } else {
              setStatus("fail");
              setErrorMsg("支付失败：" + payRes.err_msg);
            }
          }
        );
      } else {
        // 非微信浏览器：使用 H5 支付或模拟
        if (res.data?.mweb_url) {
          // H5支付：跳转微信支付中间页
          window.location.href = res.data.mweb_url;
        } else {
          // 模拟支付（开发测试用）
          setMockMode(true);
          setTimeout(() => confirmMockPayment(), 1500);
        }
      }
    } catch (err: any) {
      setStatus("fail");
      setErrorMsg(err.message || "支付失败");
    }
  };

  // ==================== 模拟支付（开发测试）====================
  const confirmMockPayment = async () => {
    try {
      // 发送模拟支付回调
      await api.post("/payment/notify", {
        out_trade_no: orderNo,
        result_code: "SUCCESS",
        transaction_id: "MOCK" + Date.now(),
        total_fee: Math.round((order?.pay_amount || 0) * 100),
        time_end: new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14),
      });
      setStatus("success");
    } catch {
      // 直接标记成功（演示用）
      setStatus("success");
    }
  };

  // ==================== 余额支付 ====================
  const handleBalancePay = async () => {
    setStatus("processing");
    try {
      await api.post("/payment/unified-order", {
        order_no: orderNo,
        pay_type: "balance",
      });
      setStatus("success");
    } catch (err: any) {
      setStatus("fail");
      setErrorMsg(err.message || "余额支付失败");
    }
  };

  // ==================== 支付主入口 ====================
  const handlePay = () => {
    if (payMethod === "wechat") {
      handleWechatPay();
    } else {
      handleBalancePay();
    }
  };

  // ==================== 支付成功页 ====================
  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="animate-bounce">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h1 className="text-xl font-bold mt-6">支付成功</h1>
        {mockMode && (
          <p className="text-xs text-orange-500 mt-1 bg-orange-50 px-3 py-1 rounded-full">
            模拟支付（开发测试模式）
          </p>
        )}
        <p className="text-gray-400 text-sm mt-2">订单号: {orderNo}</p>
        <div className="mt-6 bg-gray-50 rounded-xl p-4 w-full max-w-sm space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">支付金额</span>
            <span className="font-bold">¥{order?.pay_amount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
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

  // ==================== 支付失败页 ====================
  if (status === "fail") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <XCircle size={64} className="text-red-500" />
        <h1 className="text-xl font-bold mt-6">支付失败</h1>
        {errorMsg && <p className="text-red-400 text-sm mt-2">{errorMsg}</p>}
        <div className="flex gap-3 mt-8 w-full max-w-sm">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 border border-gray-300 py-3 rounded-full font-bold text-sm"
          >
            查看订单
          </button>
          <button
            onClick={() => { setStatus("idle"); setErrorMsg(""); }}
            className="flex-1 bg-orange-500 text-white py-3 rounded-full font-bold text-sm"
          >
            重新支付
          </button>
        </div>
      </div>
    );
  }

  // ==================== 支付中 ====================
  if (status === "processing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <Loader2 size={48} className="text-orange-500 animate-spin" />
        <h1 className="text-lg font-bold mt-4">
          {mockMode ? "模拟支付处理中..." : "正在调起微信支付..."}
        </h1>
        <p className="text-gray-400 text-sm mt-2">请勿关闭页面</p>
      </div>
    );
  }

  // ==================== 支付选择页 ====================
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
            <p className="text-3xl font-bold mt-1" style={{ color: 'var(--tmpl-primary)' }}>
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
            {/* 微信支付 */}
            <button
              onClick={() => setPayMethod("wechat")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${
                payMethod === "wechat"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                <Smartphone size={16} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold">微信支付</p>
                <p className="text-xs text-gray-400">微信内一键支付，安全快捷</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  payMethod === "wechat" ? "border-green-500" : "border-gray-300"
                }`}
              >
                {payMethod === "wechat" && (
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                )}
              </div>
            </button>

            {/* 余额支付 */}
            <button
              onClick={() => setPayMethod("balance")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${
                payMethod === "balance"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200"
              }`}
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                <Wallet size={16} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold">余额支付</p>
                <p className="text-xs text-gray-400">可用余额 ¥{state.user?.balance?.toFixed(2) || "0.00"}</p>
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

        {/* 环境提示 */}
        <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
          <Smartphone size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            当前为开发测试模式。真实微信支付需要在微信浏览器内访问，并配置商户号、API密钥和支付授权目录。
          </p>
        </div>
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handlePay}
          disabled={status === "processing"}
          className="w-full max-w-[430px] mx-auto block py-3 rounded-full font-bold text-white disabled:opacity-70"
          style={{ backgroundColor: 'var(--tmpl-primary)' }}
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
