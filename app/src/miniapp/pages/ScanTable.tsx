import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useApp } from "../context/AppContext";
import type { TableInfo } from "../context/AppContext";
import { Loader2, CheckCircle, AlertCircle, UtensilsCrossed } from "lucide-react";

type ScanStatus = "loading" | "success" | "error";

export default function ScanTable() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [status, setStatus] = useState<ScanStatus>("loading");
  const [table, setTable] = useState<TableInfo | null>(null);
  const [message, setMessage] = useState("正在绑定桌台...");

  const storeId = searchParams.get("store_id");
  const tableId = searchParams.get("table_id");

  useEffect(() => {
    if (!storeId || !tableId) {
      setStatus("error");
      setMessage("无效的二维码参数");
      return;
    }

    const fetchTable = async () => {
      try {
        const res = await api.get(`/tables/${tableId}`);
        if (res) {
          const tableInfo: TableInfo = {
            id: res.id || Number(tableId),
            table_no: res.table_no || `${tableId}号桌`,
            capacity: res.capacity || 4,
            status: res.status || "free",
          };
          setTable(tableInfo);
          setStatus("success");
          setMessage("桌台绑定成功");

          // Save to global state
          dispatch({ type: "SET_TABLE", payload: tableInfo });

          // Auto-redirect to menu after 2 seconds
          setTimeout(() => {
            navigate("/menu");
          }, 2000);
        } else {
          throw new Error("桌台信息为空");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "获取桌台信息失败");
      }
    };

    // Simulate a brief loading delay for better UX
    const timer = setTimeout(fetchTable, 800);
    return () => clearTimeout(timer);
  }, [storeId, tableId, dispatch, navigate]);

  const handleManualNavigate = () => {
    if (table) {
      dispatch({ type: "SET_TABLE", payload: table });
    }
    navigate("/menu");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {status === "loading" && (
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <Loader2 size={32} className="text-orange-500 animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-500" />
            </div>
          )}
          {status === "error" && (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-red-500" />
            </div>
          )}
        </div>

        {/* Status Title */}
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          {status === "loading" && "正在绑定桌台"}
          {status === "success" && "绑定成功"}
          {status === "error" && "绑定失败"}
        </h2>

        {/* Status Message */}
        <p className="text-sm text-gray-500 mb-6">{message}</p>

        {/* Table Info Card */}
        {table && (
          <div className="bg-orange-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <UtensilsCrossed size={18} className="text-orange-500" />
              <span className="font-bold text-gray-800">桌台信息</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">桌号</span>
                <span className="font-bold text-gray-800">{table.table_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">容纳人数</span>
                <span className="font-bold text-gray-800">{table.capacity}人</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {status === "success" && (
            <p className="text-xs text-gray-400">即将自动跳转到点餐页面...</p>
          )}
          {status === "error" && (
            <button
              onClick={handleManualNavigate}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium text-sm active:scale-[0.98] transition-transform"
            >
              前往点餐
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm active:scale-[0.98] transition-transform"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
