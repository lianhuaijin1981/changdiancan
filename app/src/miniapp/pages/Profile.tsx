import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useApp } from "../context/AppContext";
import type { MemberInfo } from "../types";
import {
  User,
  Ticket,
  MapPin,
  Crown,
  HeadphonesIcon,
  ChevronRight,
  LogOut,
  X,
  Phone,
  Lock,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.token) {
      api.get("/members/me")
        .then((m: MemberInfo) => setMember(m))
        .catch(() => {});
    }
  }, [state.token]);

  const handleLogin = async () => {
    if (!phone || !password) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { phone, password });
      dispatch({ type: "SET_AUTH", payload: { token: res.token, user: res.user } });
      setShowLogin(false);
    } catch {
      alert("登录失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!phone || !password) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { phone, password, nickname: nickname || undefined });
      dispatch({ type: "SET_AUTH", payload: { token: res.token, user: res.user } });
      setShowLogin(false);
    } catch {
      alert("注册失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch({ type: "CLEAR_AUTH" });
    setMember(null);
  };

  const menuItems = [
    { icon: Ticket, label: "我的优惠券", path: "/coupons" },
    { icon: MapPin, label: "收货地址", path: "" },
    { icon: Crown, label: "会员中心", path: "/member" },
    { icon: HeadphonesIcon, label: "联系客服", path: "" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* User Card */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-400 text-white p-6 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            {state.user?.avatar_url ? (
              <img src={state.user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={28} />
            )}
          </div>
          <div className="flex-1">
            {state.user ? (
              <>
                <h2 className="text-lg font-bold">{state.user.nickname || state.user.phone}</h2>
                <div className="flex items-center gap-1 mt-1">
                  <Crown size={12} />
                  <span className="text-xs">{member?.level_name || "普通会员"}</span>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold">未登录</h2>
                <button
                  onClick={() => { setShowLogin(true); setIsRegister(false); }}
                  className="text-xs bg-white/20 px-3 py-1 rounded-full mt-1"
                >
                  点击登录
                </button>
              </>
            )}
          </div>
          {state.user && (
            <button onClick={handleLogout} className="p-2">
              <LogOut size={18} />
            </button>
          )}
        </div>

        {/* Member Stats */}
        {member && (
          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <p className="text-xl font-bold">{member.points}</p>
              <p className="text-xs text-white/70">积分</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">¥{member.balance?.toFixed(2)}</p>
              <p className="text-xs text-white/70">余额</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">¥{member.total_spend?.toFixed(0)}</p>
              <p className="text-xs text-white/70">累计消费</p>
            </div>
          </div>
        )}
      </div>

      {/* Menu Grid */}
      <div className="mx-3 -mt-4 bg-white rounded-xl shadow-sm">
        {menuItems.map((item, idx) => (
          <button
            key={item.label}
            onClick={() => item.path && navigate(item.path)}
            className={`w-full flex items-center gap-3 p-4 text-left ${
              idx < menuItems.length - 1 ? "border-b" : ""
            }`}
          >
            <item.icon size={20} className="text-orange-500" />
            <span className="flex-1 text-sm">{item.label}</span>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}
      </div>

      {/* Login/Register Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowLogin(false)}
          />
          <div className="relative bg-white rounded-t-2xl w-full p-6 animate-in slide-in-from-bottom">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 p-1"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold mb-6">
              {isRegister ? "注册账号" : "登录账号"}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5">
                <Phone size={16} className="text-gray-400" />
                <input
                  type="tel"
                  placeholder="手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 text-sm outline-none"
                />
              </div>
              {isRegister && (
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5">
                  <User size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="昵称（选填）"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="flex-1 text-sm outline-none"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5">
                <Lock size={16} className="text-gray-400" />
                <input
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 text-sm outline-none"
                />
              </div>
              <button
                onClick={isRegister ? handleRegister : handleLogin}
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-full font-bold disabled:opacity-50"
              >
                {loading ? "处理中..." : isRegister ? "注册" : "登录"}
              </button>
              <p className="text-center text-sm text-gray-500">
                {isRegister ? "已有账号？" : "没有账号？"}
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-orange-500 ml-1"
                >
                  {isRegister ? "去登录" : "去注册"}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
