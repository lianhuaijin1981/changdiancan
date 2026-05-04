import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useApp } from "../context/AppContext";
import type { Coupon } from "../types";
import { ChevronLeft, Ticket, Clock, CheckCircle } from "lucide-react";

export default function Coupons() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<"available" | "used" | "expired">("available");
  const [storeCoupons, setStoreCoupons] = useState<Coupon[]>([]);
  const [myCoupons, setMyCoupons] = useState<Coupon[]>([]);
  const [claimedIds, setClaimedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    api.get("/coupons/").then(setStoreCoupons).catch(() => {});
  }, []);

  useEffect(() => {
    if (state.token) {
      api.get("/coupons/my").then((res: Coupon[]) => {
        setMyCoupons(res);
      }).catch(() => {});
    }
  }, [state.token]);

  const handleClaim = async (couponId: number) => {
    if (!state.token) {
      alert("请先登录");
      return;
    }
    try {
      await api.post(`/coupons/${couponId}/claim`);
      setClaimedIds((prev) => new Set(prev).add(couponId));
      api.get("/coupons/my").then(setMyCoupons).catch(() => {});
    } catch {
      alert("领取失败");
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString();

  const renderCouponCard = (coupon: Coupon, isClaimable = false) => (
    <div
      key={coupon.id}
      className="bg-white rounded-xl overflow-hidden flex"
    >
      {/* Left: Amount */}
      <div className="w-24 bg-orange-50 flex flex-col items-center justify-center p-3 flex-shrink-0">
        <span className="text-2xl font-bold text-orange-500">
          ¥{coupon.discount_amount}
        </span>
        <span className="text-xs text-gray-400 mt-1">
          满{coupon.min_spend}可用
        </span>
      </div>

      {/* Right: Info */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold">{coupon.title}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <Clock size={10} />
            <span>
              {formatDate(coupon.valid_start)} - {formatDate(coupon.valid_end)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">
            最低消费 ¥{coupon.min_spend}
          </span>
          {isClaimable && (
            <button
              onClick={() => handleClaim(coupon.id)}
              disabled={claimedIds.has(coupon.id)}
              className={`text-xs px-3 py-1 rounded-full font-bold ${
                claimedIds.has(coupon.id)
                  ? "bg-gray-100 text-gray-400"
                  : "bg-orange-500 text-white"
              }`}
            >
              {claimedIds.has(coupon.id) ? "已领取" : "领取"}
            </button>
          )}
          {coupon.status === "used" && (
            <span className="text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded-full">
              已使用
            </span>
          )}
          {coupon.status === "expired" && (
            <span className="text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded-full">
              已过期
            </span>
          )}
          {coupon.status === "available" && !isClaimable && (
            <span className="text-xs bg-green-50 text-green-500 px-3 py-1 rounded-full">
              可用
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white flex items-center px-4 py-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-bold flex-1 text-center mr-8">我的优惠券</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white flex border-b">
        {[
          { key: "available" as const, label: "可用" },
          { key: "used" as const, label: "已使用" },
          { key: "expired" as const, label: "已过期" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm relative transition ${
              activeTab === tab.key
                ? "text-orange-500 font-bold"
                : "text-gray-500"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-orange-500 rounded" />
            )}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-3">
        {/* Available: store coupons + my available */}
        {activeTab === "available" && (
          <>
            {/* Store coupons to claim */}
            {storeCoupons.length > 0 && (
              <div>
                <h2 className="text-xs text-gray-400 font-bold mb-2 px-1">可领取</h2>
                <div className="space-y-2">
                  {storeCoupons.map((c) => renderCouponCard(c, true))}
                </div>
              </div>
            )}
            {/* My available coupons */}
            {myCoupons.filter((c) => c.status === "available" || !c.status).length > 0 && (
              <div className="mt-4">
                <h2 className="text-xs text-gray-400 font-bold mb-2 px-1">我的优惠券</h2>
                <div className="space-y-2">
                  {myCoupons
                    .filter((c) => c.status === "available" || !c.status)
                    .map((c) => renderCouponCard(c, false))}
                </div>
              </div>
            )}
            {storeCoupons.length === 0 && myCoupons.length === 0 && (
              <EmptyState />
            )}
          </>
        )}

        {activeTab === "used" && (
          <>
            {myCoupons.filter((c) => c.status === "used").length === 0 ? (
              <EmptyState />
            ) : (
              myCoupons
                .filter((c) => c.status === "used")
                .map((c) => renderCouponCard(c, false))
            )}
          </>
        )}

        {activeTab === "expired" && (
          <>
            {myCoupons.filter((c) => c.status === "expired").length === 0 ? (
              <EmptyState />
            ) : (
              myCoupons
                .filter((c) => c.status === "expired")
                .map((c) => renderCouponCard(c, false))
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Ticket size={40} className="text-gray-200" />
      <p className="text-sm text-gray-400 mt-3">暂无优惠券</p>
    </div>
  );
}
