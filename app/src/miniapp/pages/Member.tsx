import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useApp } from "../context/AppContext";
import type { MemberInfo, MemberLevel } from "../types";
import { ChevronLeft, Crown, Coins, Wallet, Zap } from "lucide-react";

export default function Member() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [levels, setLevels] = useState<MemberLevel[]>([]);
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [rechargeOpen, setRechargeOpen] = useState(false);

  useEffect(() => {
    api.get("/members/me").then((m: MemberInfo) => {
      setMember(m);
    }).catch(() => {});
    api.get("/members/levels").then((l: MemberLevel[]) => {
      setLevels(l);
    }).catch(() => {});
  }, []);

  const handleRecharge = async () => {
    try {
      await api.post("/members/recharge", { amount: selectedAmount });
      setRechargeOpen(false);
      api.get("/members/me").then((m: MemberInfo) => setMember(m));
    } catch {
      alert("充值失败");
    }
  };

  const currentLevel = levels.find((l) => l.level === member?.level);
  const nextLevel = levels.find((l) => l.level === (member?.level || 0) + 1);
  const progress = nextLevel
    ? Math.min(100, ((member?.total_spend || 0) / (nextLevel.min_spend || 1)) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-400 text-white">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-bold flex-1 text-center mr-8">会员中心</h1>
        </div>

        <div className="px-6 pb-8 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Crown size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold">{currentLevel?.name || "普通会员"}</h2>
              <p className="text-xs text-white/70">
                {nextLevel
                  ? `再消费 ¥${(nextLevel.min_spend - (member?.total_spend || 0)).toFixed(0)} 升级${nextLevel.name}`
                  : "您已是最高等级"}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>{currentLevel?.name || "入门"}</span>
              <span>{nextLevel?.name || "已满级"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-3 -mt-4 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-around">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Coins size={16} className="text-orange-500" />
              <span className="text-lg font-bold">{member?.points || 0}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">积分</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Wallet size={16} className="text-orange-500" />
              <span className="text-lg font-bold">¥{member?.balance?.toFixed(2) || "0.00"}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">余额</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Zap size={16} className="text-orange-500" />
              <span className="text-lg font-bold">{currentLevel?.discount ? `${currentLevel.discount}折` : "无"}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">会员折扣</p>
          </div>
        </div>
      </div>

      {/* Recharge */}
      <div className="mx-3 mt-4 bg-white rounded-xl p-4">
        <h2 className="text-sm font-bold mb-3">余额充值</h2>
        <div className="grid grid-cols-3 gap-3">
          {[100, 200, 500].map((amount) => (
            <button
              key={amount}
              onClick={() => { setSelectedAmount(amount); setRechargeOpen(true); }}
              className="border-2 border-orange-100 rounded-lg py-3 text-center hover:border-orange-500 transition"
            >
              <p className="text-lg font-bold text-orange-500">¥{amount}</p>
              <p className="text-xs text-gray-400 mt-1">充值</p>
            </button>
          ))}
        </div>
      </div>

      {/* Member Levels */}
      <div className="mx-3 mt-4 bg-white rounded-xl p-4">
        <h2 className="text-sm font-bold mb-3">会员等级</h2>
        <div className="space-y-3">
          {levels.map((level) => {
            const isCurrent = level.level === member?.level;
            return (
              <div
                key={level.level}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  isCurrent ? "bg-orange-50 border border-orange-200" : "bg-gray-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    isCurrent ? "bg-orange-500" : "bg-gray-300"
                  }`}
                >
                  {level.level}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isCurrent ? "text-orange-500" : ""}`}>
                    {level.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    消费满 ¥{level.min_spend} · {level.discount > 0 ? `${level.discount}折优惠` : "无折扣"}
                  </p>
                </div>
                {isCurrent && (
                  <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                    当前
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recharge Confirm Modal */}
      {rechargeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRechargeOpen(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-80">
            <h3 className="text-lg font-bold text-center">确认充值</h3>
            <p className="text-center text-3xl font-bold text-orange-500 mt-4">
              ¥{selectedAmount}
            </p>
            <p className="text-center text-xs text-gray-400 mt-2">
              充值后余额：¥{((member?.balance || 0) + selectedAmount).toFixed(2)}
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setRechargeOpen(false)}
                className="flex-1 border py-2 rounded-full text-sm font-bold"
              >
                取消
              </button>
              <button
                onClick={handleRecharge}
                className="flex-1 bg-orange-500 text-white py-2 rounded-full text-sm font-bold"
              >
                确认支付
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
