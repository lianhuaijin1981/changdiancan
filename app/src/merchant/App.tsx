// 商家端 - 路由入口
import { Routes, Route, Navigate } from "react-router-dom";
import { useMerchant } from "./context/MerchantContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Dishes from "./pages/Dishes";
import Tables from "./pages/Tables";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useMerchant();
  if (loading) return <div className="flex items-center justify-center h-screen">加载中...</div>;
  if (!user) return <Navigate to="/merchant/login" replace />;
  return <>{children}</>;
}

export default function MerchantApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="dishes" element={<Dishes />} />
        <Route path="tables" element={<Tables />} />
        <Route path="stats" element={<Stats />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
