import { useState } from "react";
import { useRider } from "../context/RiderContext";
import { Bike, LogIn } from "lucide-react";

export default function RiderLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useRider();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone || !password) {
      setError("请填写手机号和密码");
      return;
    }
    setLoading(true);
    try {
      await login(phone, password);
    } catch (err: any) {
      setError(err.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#D9381E] rounded-2xl flex items-center justify-center mb-4">
            <Bike size={32} color="white" />
          </div>
          <h1 className="text-xl font-bold text-white">骑手配送端</h1>
          <p className="text-sm text-gray-400 mt-1">商家专属配送服务</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full h-11 bg-[#2A2A2A] border border-[#404040] rounded-lg px-4 text-white text-sm placeholder-gray-500 outline-none focus:border-[#D9381E]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full h-11 bg-[#2A2A2A] border border-[#404040] rounded-lg px-4 text-white text-sm placeholder-gray-500 outline-none focus:border-[#D9381E]"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#D9381E] rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "登录中..." : <><LogIn size={18} /> 登录</>}
          </button>
        </form>
      </div>
    </div>
  );
}
