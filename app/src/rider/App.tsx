import { Routes, Route, Navigate } from "react-router-dom";
import { useRider } from "./context/RiderContext";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { rider, loading } = useRider();
  if (loading) return <div className="flex items-center justify-center h-screen">加载中...</div>;
  if (!rider) return <Navigate to="/rider/login" replace />;
  return <>{children}</>;
}

export default function RiderApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<RequireAuth><div className="pb-16" /></RequireAuth>}>
        <Route index element={<Orders />} />
        <Route path="orders" element={<Orders />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
