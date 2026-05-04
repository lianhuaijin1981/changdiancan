import { Link, useLocation } from 'react-router';
import { useAdmin } from '../context/AdminContext';
import {
  LayoutDashboard,
  Store,
  BarChart3,
  Palette,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/button';

const menuItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/stores', label: '商家管理', icon: Store },
  { path: '/stats', label: '数据统计', icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAdmin();
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
        <div className="w-9 h-9 rounded-lg bg-[#FF6B35] flex items-center justify-center shadow-md">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">超级管理后台</h1>
          <p className="text-slate-400 text-xs">畅点餐平台</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#FF6B35]/15 text-[#FF6B35] border-r-2 border-[#FF6B35]'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#FF6B35]' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700/50 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{user?.name?.charAt(0) || 'S'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name || '超级管理员'}</p>
            <p className="text-slate-400 text-xs truncate">{user?.phone || ''}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-slate-400 hover:text-white hover:bg-slate-700"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E293B] fixed h-full z-30 flex flex-col shadow-xl">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-800">
              {menuItems.find((item) => item.path === location.pathname)?.label || '超级管理后台'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{new Date().toLocaleDateString('zh-CN')}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
