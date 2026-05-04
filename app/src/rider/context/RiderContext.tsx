import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface Rider {
  id: number;
  name: string;
  phone: string;
  store_id: number;
  store_name: string;
  today_orders: number;
}

interface RiderContextType {
  rider: Rider | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  apiFetch: (path: string, options?: RequestInit) => Promise<any>;
}

const RiderContext = createContext<RiderContextType | null>(null);

const API_BASE = "http://localhost:8000/api";

export function RiderProvider({ children }: { children: ReactNode }) {
  const [rider, setRider] = useState<Rider | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("rider_token"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const apiFetch = async (path: string, options?: RequestInit) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  useEffect(() => {
    if (token) {
      apiFetch("/riders/me")
        .then((res: any) => {
          if (res.code === 200) setRider(res.data);
        })
        .catch(() => {
          localStorage.removeItem("rider_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (phone: string, password: string) => {
    const res = await fetch(`${API_BASE}/riders/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    if (data.code !== 200) throw new Error(data.message || "登录失败");

    const t = data.data.access_token;
    localStorage.setItem("rider_token", t);
    setToken(t);
    setRider(data.data);
    navigate("/rider");
  };

  const logout = () => {
    localStorage.removeItem("rider_token");
    setToken(null);
    setRider(null);
    navigate("/rider/login");
  };

  return (
    <RiderContext.Provider value={{ rider, token, loading, login, logout, apiFetch }}>
      {children}
    </RiderContext.Provider>
  );
}

export function useRider() {
  const ctx = useContext(RiderContext);
  if (!ctx) throw new Error("useRider must be inside RiderProvider");
  return ctx;
}
