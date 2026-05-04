import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { MerchantUser } from "../types";
import { api } from "../api/client";

interface MerchantContextType {
  user: MerchantUser | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
}

const MerchantContext = createContext<MerchantContextType | null>(null);

export function MerchantProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MerchantUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 页面加载时检查登录状态
    const token = api.getToken();
    if (token) {
      api.get("/merchant/me")
        .then(res => setUser(res.data))
        .catch(() => api.clearToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (phone: string, password: string) => {
    const res = await api.post("/merchant/login", { phone, password });
    const data = res.data;
    api.setToken(data.access_token);
    setUser({
      staff_id: data.staff_id,
      name: data.name,
      phone,
      role: data.role,
      store_id: data.store_id,
      store_name: data.store_name,
      store_status: 1,
    });
  };

  const register = async (phone: string, password: string, nickname: string) => {
    const res = await api.post("/merchant/register", { phone, password, nickname });
    const data = res.data;
    api.setToken(data.access_token);
    setUser({
      staff_id: data.staff_id,
      name: nickname || "店长",
      phone,
      role: "manager",
      store_id: data.store_id,
      store_name: data.store_name,
      store_status: 1,
    });
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  return (
    <MerchantContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  const ctx = useContext(MerchantContext);
  if (!ctx) throw new Error("useMerchant must be inside MerchantProvider");
  return ctx;
}
