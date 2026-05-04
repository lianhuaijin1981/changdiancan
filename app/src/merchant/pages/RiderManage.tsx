import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMerchant } from "../context/MerchantContext";
import { api } from "../api/client";
import { ArrowLeft, Plus, Bike, Trash2, User, Phone } from "lucide-react";

interface RiderItem {
  id: number;
  name: string;
  phone: string;
  status: string;
  today_orders: number;
}

export default function RiderManage() {
  const { user } = useMerchant();
  const navigate = useNavigate();
  const [riders, setRiders] = useState<RiderItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRiders = async () => {
    try {
      const res = await api.get(`/api/riders?store_id=${user?.store_id}`);
      if (res.code === 200) setRiders(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    if (user?.store_id) loadRiders();
  }, [user]);

  const handleAdd = async () => {
    if (!name || !phone || !password) {
      alert("请填写完整信息");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/riders", {
        store_id: user?.store_id,
        name,
        phone,
        password,
      });
      setShowAdd(false);
      setName(""); setPhone(""); setPassword("");
      loadRiders();
      alert("骑手添加成功");
    } catch (e: any) {
      alert(e.message || "添加失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <div className="bg-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h1 className="font-bold text-lg">骑手管理</h1>
        <button onClick={() => setShowAdd(true)} className="ml-auto px-3 py-1.5 bg-[#FF6B35] text-white text-xs rounded-full flex items-center gap-1">
          <Plus size={14} /> 添加
        </button>
      </div>

      <div className="p-3 space-y-3">
        {riders.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">暂无骑手</div>
        ) : (
          riders.map((rider) => (
            <div key={rider.id} className="bg-white rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Bike size={20} className="text-[#FF6B35]" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{rider.name}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Phone size={10} /> {rider.phone}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">今日配送</div>
                <div className="text-sm font-bold text-[#FF6B35]">{rider.today_orders || 0}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-2xl w-full p-4 max-w-[430px] mx-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">添加骑手</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">姓名</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="骑手姓名" className="w-full h-10 border rounded-lg px-3 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">手机号</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号" className="w-full h-10 border rounded-lg px-3 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">密码</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="登录密码" className="w-full h-10 border rounded-lg px-3 text-sm" />
              </div>
              <button onClick={handleAdd} disabled={loading} className="w-full h-11 bg-[#FF6B35] text-white rounded-lg font-medium disabled:opacity-50">
                {loading ? "添加中..." : "确认添加"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
