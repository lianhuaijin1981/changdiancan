import { Routes, Route, Navigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StorePage from './pages/Store';
import TablesPage from './pages/Tables';
import CategoriesPage from './pages/Categories';
import DishesPage from './pages/Dishes';
import OrdersPage from './pages/Orders';
import CouponsPage from './pages/Coupons';
import MembersPage from './pages/Members';

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-pulse text-slate-400">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-pulse text-slate-400">加载中...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <RouteGuard>
            <Dashboard />
          </RouteGuard>
        }
      />
      <Route
        path="/store"
        element={
          <RouteGuard>
            <StorePage />
          </RouteGuard>
        }
      />
      <Route
        path="/tables"
        element={
          <RouteGuard>
            <TablesPage />
          </RouteGuard>
        }
      />
      <Route
        path="/categories"
        element={
          <RouteGuard>
            <CategoriesPage />
          </RouteGuard>
        }
      />
      <Route
        path="/dishes"
        element={
          <RouteGuard>
            <DishesPage />
          </RouteGuard>
        }
      />
      <Route
        path="/orders"
        element={
          <RouteGuard>
            <OrdersPage />
          </RouteGuard>
        }
      />
      <Route
        path="/coupons"
        element={
          <RouteGuard>
            <CouponsPage />
          </RouteGuard>
        }
      />
      <Route
        path="/members"
        element={
          <RouteGuard>
            <MembersPage />
          </RouteGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
