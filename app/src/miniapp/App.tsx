import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { TemplateProvider, useTemplate } from "../templates/TemplateProvider";
import { TemplateHome } from "../templates/TemplateRenderer";
import Menu from "./pages/Menu";
import DishDetail from "./pages/DishDetail";
import Confirm from "./pages/Confirm";
import Payment from "./pages/Payment";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Member from "./pages/Member";
import Coupons from "./pages/Coupons";
import ScanTable from "./pages/ScanTable";
import { Home as HomeIcon, UtensilsCrossed, ClipboardList, User } from "lucide-react";
import { useEffect } from "react";
import { api } from "./api/client";

const TABS = [
  { key: "/", label: "首页", icon: HomeIcon },
  { key: "/menu", label: "点餐", icon: UtensilsCrossed },
  { key: "/orders", label: "订单", icon: ClipboardList },
  { key: "/profile", label: "我的", icon: User },
];

const TAB_ROOTS = ["/", "/menu", "/orders", "/profile"];

function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { template } = useTemplate();

  const showTabBar = TAB_ROOTS.includes(location.pathname);
  if (!showTabBar) return null;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 border-t z-50 safe-area-bottom"
      style={{ backgroundColor: 'var(--tmpl-surface)', borderColor: 'var(--tmpl-border)' }}
    >
      <div className="max-w-[430px] mx-auto flex items-center justify-around h-14">
        {TABS.map((tab) => {
          const isActive = location.pathname === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.key)}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-full"
            >
              <tab.icon
                size={20}
                style={{ color: isActive ? 'var(--tmpl-primary)' : 'var(--tmpl-text-muted)' }}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className="text-[10px]"
                style={{
                  color: isActive ? 'var(--tmpl-primary)' : 'var(--tmpl-text-muted)',
                  fontWeight: isActive ? 'bold' : 'normal',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function AppContent() {
  const { state, dispatch } = useApp();
  const { setTemplateId } = useTemplate();

  useEffect(() => {
    // Load store info on init
    api.get("/stores/").then((res: any) => {
      if (Array.isArray(res) && res.length > 0) {
        dispatch({ type: "SET_STORE", payload: res[0] });
        // Set template from store
        if (res[0].template_id) {
          setTemplateId(res[0].template_id);
        }
      }
    }).catch(() => {});

    // Load user info if token exists
    if (state.token) {
      api.get("/auth/me").then((user: any) => {
        if (user) {
          dispatch({ type: "SET_AUTH", payload: { token: state.token!, user } });
        }
      }).catch(() => {
        dispatch({ type: "CLEAR_AUTH" });
      });
    }
  }, []);

  return (
    <div 
      className="max-w-[430px] mx-auto min-h-screen relative"
      style={{ backgroundColor: 'var(--tmpl-bg)' }}
    >
      <Routes>
        <Route path="/" element={<TemplateHome />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/dish/:id" element={<DishDetail />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/payment/:orderNo" element={<Payment />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/member" element={<Member />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/scan" element={<ScanTable />} />
      </Routes>
      <TabBar />
      {TAB_ROOTS.includes(useLocation().pathname) && <div className="h-14" />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <TemplateProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </TemplateProvider>
    </AppProvider>
  );
}

export default App;
