import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMerchant } from "../context/MerchantContext";
import { api } from "../api/client";
import { Smartphone, Lock, Store, Loader2 } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useMerchant();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storeName, setStoreName] = useState("我的店铺");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!phone || phone.length !== 11) {
      setError("请输入有效的11位手机号");
      return;
    }
    if (!password) {
      setError("请输入密码");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (!storeName.trim()) {
      setError("请输入店铺名称");
      return;
    }

    setLoading(true);
    try {
      await register(phone, password, storeName);
      setSuccess("注册成功！正在跳转...");
      setTimeout(() => navigate("/merchant"), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || "注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="w-full max-w-[430px]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FF6B35] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">商家注册</h1>
          <p className="text-sm text-[#6B7280] mt-1">创建您的商家账号</p>
        </div>

        <form
          onSubmit={handleRegister}
          className="bg-white rounded-2xl p-6 shadow-sm space-y-4"
        >
          {error && (
            <div className="bg-red-50 text-[#EF4444] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-[#10B981] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              {success}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1A1A2E]">手机号</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={11}
                placeholder="请输入11位手机号"
                className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] rounded-xl text-[#1A1A2E] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1A1A2E]">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请设置密码"
                className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] rounded-xl text-[#1A1A2E] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1A1A2E]">确认密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] rounded-xl text-[#1A1A2E] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1A1A2E]">店铺名称</label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="请输入店铺名称"
                className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] rounded-xl text-[#1A1A2E] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#FF6B35] text-white font-semibold rounded-xl shadow-sm active:scale-[0.98] transition-transform disabled:opacity-60 disabled:active:scale-100 flex items-center justify-center gap-2 min-h-[48px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                注册中...
              </>
            ) : (
              "立即注册"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#6B7280] mt-6">
          已有账号？
          <button
            onClick={() => navigate("/merchant/login")}
            className="text-[#FF6B35] font-medium ml-1"
          >
            去登录
          </button>
        </p>
      </div>
    </div>
  );
}
