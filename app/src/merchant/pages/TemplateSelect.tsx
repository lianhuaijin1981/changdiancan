import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMerchant } from "../context/MerchantContext";
import { api } from "../api/client";
import { Check, Palette, ArrowLeft, Sparkles, Flame, Leaf, Crown, TreePine, Beef, Sun } from "lucide-react";

const TEMPLATES = [
  {
    id: "modern",
    name: "简约现代",
    desc: "扁平化设计，暖橙主色调，适合快餐、连锁餐饮",
    category: ["快餐", "连锁餐饮", "小吃店"],
    icon: Sparkles,
    colors: ["#FF6B35", "#FFFFFF", "#1A1A2E"],
    features: ["大图展示", "清晰层级", "高效操作"],
  },
  {
    id: "traditional",
    name: "中式传统",
    desc: "中国红配金色，传统纹样，适合中餐、火锅、茶楼",
    category: ["中餐", "火锅", "茶楼", "烧烤"],
    icon: Flame,
    colors: ["#C41E3A", "#D4A843", "#FDF8F0"],
    features: ["传统纹样", "书法字体", "热闹氛围"],
  },
  {
    id: "fresh",
    name: "清新文艺",
    desc: "薄荷绿与马卡龙色系，手绘感，适合奶茶、咖啡、轻食",
    category: ["奶茶", "咖啡", "轻食", "烘焙"],
    icon: Leaf,
    colors: ["#4ECDC4", "#FF6B9D", "#FAF9F6"],
    features: ["手绘插画", "圆润元素", "治愈感"],
  },
  {
    id: "luxury",
    name: "高端黑金",
    desc: "深黑配香槟金，极简留白，适合日料、西餐、高端餐厅",
    category: ["日料", "西餐", "高端中餐", "私房菜"],
    icon: Crown,
    colors: ["#0F0F0F", "#C9A962", "#1A1A1A"],
    features: ["极简留白", "大字体", "高级感"],
  },
  {
    id: "japanese",
    name: "日式和风",
    desc: "原木质感配靛蓝，大量留白，适合寿司、拉面、居酒屋",
    category: ["日料", "寿司", "拉面", "居酒屋", "定食"],
    icon: TreePine,
    colors: ["#4A6741", "#2F5491", "#FAF8F3"],
    features: ["原木质感", "大量留白", "自然和风"],
  },
  {
    id: "korean",
    name: "韩式烤肉",
    desc: "炭黑配火焰红，工业风设计，适合韩式烤肉、炸鸡、部队锅",
    category: ["韩式烤肉", "炸鸡", "部队锅", "韩餐", "大排档"],
    icon: Beef,
    colors: ["#D9381E", "#1A1A1A", "#2A2A2A"],
    features: ["炭火氛围", "工业风格", "热力十足"],
  },
  {
    id: "southeast",
    name: "东南亚风情",
    desc: "热带绿配芒果黄，鲜艳印花感，适合泰餐、越南粉、马来菜",
    category: ["泰国菜", "越南粉", "马来菜", "印度菜", "新加坡菜"],
    icon: Sun,
    colors: ["#2D7D46", "#F9A825", "#FFFDE7"],
    features: ["热带氛围", "鲜艳活泼", "热情好客"],
  },
];

export default function TemplateSelect() {
  const { user } = useMerchant();
  const navigate = useNavigate();
  const [currentTemplate, setCurrentTemplate] = useState("modern");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch current store template
    if (user?.store_id) {
      api.get(`/api/stores/${user.store_id}`).then((res: any) => {
        if (res?.template_id) setCurrentTemplate(res.template_id);
      }).catch(() => {});
    }
  }, [user]);

  const handleSelect = async (templateId: string) => {
    if (templateId === currentTemplate) return;
    setSaving(true);
    try {
      await api.put(`/api/stores/${user?.store_id}`, { template_id: templateId });
      setCurrentTemplate(templateId);
      alert("模板切换成功！用户端小程序将显示新风格。");
    } catch (err: any) {
      alert("切换失败：" + (err.message || "请稍后重试"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F5F5F5] pb-6">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Palette size={18} className="text-[#FF6B35]" />
          <h1 className="font-bold text-lg">小程序模板</h1>
        </div>
      </div>

      {/* Current template */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-500 mb-2">当前使用模板</p>
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
          {(() => {
            const t = TEMPLATES.find((x) => x.id === currentTemplate) || TEMPLATES[0];
            return (
              <>
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}
                >
                  <t.icon size={28} color={t.id === "luxury" ? "#C9A962" : "#fff"} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{t.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                </div>
                <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full font-medium">
                  使用中
                </span>
              </>
            );
          })()}
        </div>
      </div>

      {/* Template list */}
      <div className="px-4">
        <p className="text-sm text-gray-500 mb-2">切换模板</p>
        <div className="space-y-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              disabled={saving}
              className={`w-full bg-white rounded-xl p-4 shadow-sm text-left transition relative overflow-hidden ${
                t.id === currentTemplate ? "ring-2 ring-[#FF6B35]" : ""
              }`}
            >
              {/* Selected indicator */}
              {t.id === currentTemplate && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center">
                  <Check size={14} color="white" />
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Color preview */}
                <div className="flex flex-col gap-1">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}
                  >
                    <t.icon size={24} color={t.id === "luxury" ? "#C9A962" : "#fff"} />
                  </div>
                  <div className="flex gap-1 justify-center">
                    {t.colors.map((c) => (
                      <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-base">{t.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.desc}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.features.map((f) => (
                      <span key={f} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-md">
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {t.category.map((c) => (
                      <span key={c} className="text-[10px] text-gray-400">
                        {c}{t.category.indexOf(c) < t.category.length - 1 ? " ·" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="px-4 mt-4">
        <div className="bg-orange-50 rounded-xl p-3 flex items-start gap-2">
          <Sparkles size={16} className="text-[#FF6B35] mt-0.5 shrink-0" />
          <p className="text-xs text-orange-700 leading-relaxed">
            切换模板后，顾客扫码进入小程序时将立即看到新风格。不同模板适合不同餐饮品类，建议选择与店铺定位相符的风格。
          </p>
        </div>
      </div>

      {saving && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl px-6 py-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">正在切换...</span>
          </div>
        </div>
      )}
    </div>
  );
}
