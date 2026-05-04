import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMerchant } from "../context/MerchantContext";
import { api } from "../api/client";
import type { Table } from "../types";
import { Button } from "../../components/ui/button";
import {
  Plus,
  ChevronLeft,
  Users,
  Armchair,
  CheckCircle,
} from "lucide-react";

const TABLE_STATUS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  free: { label: "空闲", color: "#10B981", bg: "#D1FAE5", dot: "#10B981" },
  occupied: { label: "占用", color: "#EF4444", bg: "#FEE2E2", dot: "#EF4444" },
  reserved: { label: "锁定", color: "#6B7280", bg: "#F3F4F6", dot: "#6B7280" },
};

const STATUS_CYCLE: Record<string, string> = {
  free: "occupied",
  occupied: "reserved",
  reserved: "free",
};

const STATUS_LABEL_MAP: Record<string, string> = {
  free: "空闲",
  occupied: "占用",
  reserved: "锁定",
};

export default function Tables() {
  const navigate = useNavigate();
  const { user } = useMerchant();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const fetchTables = async () => {
    if (!user?.staff_id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/tables?store_id=${user?.staff_id}`);
      setTables(res.data?.data || res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "加载桌台失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [user?.staff_id]);

  const handleToggleStatus = async (tableId: number, currentStatus: string) => {
    const nextStatus = STATUS_CYCLE[currentStatus] || "free";
    try {
      await api.put(`/api/tables/${tableId}/status`, { status: nextStatus });
      setTables((prev) =>
        prev.map((t) =>
          (t as any).id === tableId ? { ...t, status: nextStatus } : t
        )
      );
      setConfirmingId(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "更新状态失败");
    }
  };

  const onCardTap = (tableId: number, currentStatus: string) => {
    setConfirmingId(tableId);
  };

  const statusCounts = {
    free: tables.filter((t: any) => t.status === "free").length,
    occupied: tables.filter((t: any) => t.status === "occupied").length,
    reserved: tables.filter((t: any) => t.status === "reserved").length,
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft size={22} color="#1A1A2E" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A2E]">桌台管理</h1>
          <button
            onClick={() => navigate("/merchant/tables/add")}
            className="p-1"
          >
            <Plus size={22} color="#FF6B35" />
          </button>
        </div>

        {/* Status summary */}
        <div className="flex items-center justify-around px-4 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#10B981" }} />
            <span className="text-xs text-[#6B7280]">空闲 {statusCounts.free}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#EF4444" }} />
            <span className="text-xs text-[#6B7280]">占用 {statusCounts.occupied}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#6B7280" }} />
            <span className="text-xs text-[#6B7280]">锁定 {statusCounts.reserved}</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && tables.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-[#6B7280]">加载中...</p>
        </div>
      )}

      {/* Table Grid */}
      <div className="px-4 py-3 grid grid-cols-2 gap-3 pb-6">
        {tables.map((table: any) => {
          const status = TABLE_STATUS[table.status] || TABLE_STATUS.free;
          const isConfirming = confirmingId === table.id;

          return (
            <div
              key={table.id}
              onClick={() => onCardTap(table.id, table.status)}
              className="bg-white rounded-xl p-4 shadow-sm relative overflow-hidden active:scale-[0.98] transition cursor-pointer"
            >
              {/* Status dot */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ color: status.color, backgroundColor: status.bg }}
                >
                  {status.label}
                </span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: status.dot }}
                />
              </div>

              {/* Table number */}
              <div className="flex items-center gap-2 mb-2">
                <Armchair size={20} color="#1A1A2E" />
                <span className="text-2xl font-bold text-[#1A1A2E]">
                  {table.table_no}
                </span>
              </div>

              {/* Capacity */}
              <div className="flex items-center gap-1 text-sm text-[#6B7280]">
                <Users size={14} color="#6B7280" />
                <span>{table.capacity || "-"} 人桌</span>
              </div>

              {/* Confirmation overlay */}
              {isConfirming && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-2 rounded-xl">
                  <p className="text-sm text-[#1A1A2E] font-medium">
                    切换为 {STATUS_LABEL_MAP[STATUS_CYCLE[table.status] || "free"]}?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmingId(null);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs text-[#6B7280] bg-gray-100"
                    >
                      取消
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(table.id, table.status);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs text-white font-medium"
                      style={{ backgroundColor: "#FF6B35" }}
                    >
                      确认
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {tables.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Armchair size={40} color="#D1D5DB" />
          <p className="mt-3 text-sm text-[#6B7280]">暂无桌台</p>
          <button
            onClick={() => navigate("/merchant/tables/add")}
            className="mt-4 px-4 py-2 rounded-lg text-sm text-white font-medium"
            style={{ backgroundColor: "#FF6B35" }}
          >
            添加桌台
          </button>
        </div>
      )}
    </div>
  );
}
