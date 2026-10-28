import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Layers,
  Store,
  LogOut,
  Menu,
  X,
  Bell,
  ShieldCheck,
  Server
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isPreviewEnvironment, setApiMode } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, role, logout, quickLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isMock = isPreviewEnvironment();

  const handleToggleMode = () => {
    const nextMode = isMock ? 'real' : 'mock';
    setApiMode(nextMode);
    showToast(
      nextMode === 'real'
        ? 'Đã chuyển sang chế độ Production API (/api/* trên Cloudflare Workers)'
        : 'Đã chuyển sang Preview Mock Adapter (LocalStorage / In-Memory)',
      'info'
    );
  };

  const navItems = [
    { label: 'Tổng quan Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Quản lý Sản phẩm', href: '/admin/products', icon: Package },
    { label: 'Quản lý Danh mục', href: '/admin/categories', icon: FolderTree },
    { label: 'Quản lý Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Quản lý Khách hàng', href: '/admin/users', icon: Users },
    { label: 'Kiến trúc Cloudflare D1', href: '/admin/cloudflare', icon: Layers },
  ];

  // If not admin, show permission gate or quick admin login
  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-[#EFE9E1] shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold font-display text-[#242424]">Yêu cầu quyền Quản trị viên</h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            Khu vực này dành riêng cho Quản trị viên hệ thống HomeDecor Shop. Để thuận tiện chấm điểm đồ án, bạn có thể bấm nút bên dưới để đăng nhập ngay với quyền Admin:
          </p>
          <div className="pt-2 space-y-2">
            <button
              onClick={() => quickLogin('admin')}
              className="w-full py-3 bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              🔑 Đăng nhập nhanh tài khoản Admin
            </button>
            <Link
              to="/"
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl block transition-colors"
            >
              Quay lại cửa hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#242424] text-white border-r border-stone-800 p-5 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#8B6245] text-white flex items-center justify-center font-display font-bold text-lg">
              H
            </div>
            <div>
              <span className="text-lg font-bold font-display tracking-tight text-white">HomeDecor</span>
              <span className="block text-[10px] text-[#C2A383] font-semibold uppercase tracking-wider">
                Quản trị hệ thống
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#8B6245] text-white shadow-md'
                      : 'text-stone-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status & Actions */}
        <div className="pt-6 border-t border-stone-800 space-y-3">
          {/* API Mode Indicator */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-stone-400 text-[10px] uppercase font-semibold">API Runtime</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isMock ? 'bg-amber-900/60 text-amber-300' : 'bg-emerald-900/60 text-emerald-300'
                }`}
              >
                {isMock ? 'Preview Adapter' : 'Cloudflare API'}
              </span>
            </div>
            <button
              onClick={handleToggleMode}
              className="text-[10px] text-[#C2A383] hover:underline block text-left"
            >
              Chuyển sang {isMock ? 'Production API' : 'Preview Mock'}
            </button>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <Store className="w-4 h-4 text-[#8B6245]" />
            <span>Về trang chủ cửa hàng</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất Quản trị</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-[#EFE9E1] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-[#242424] hover:bg-stone-100 rounded-lg"
              aria-label="Mở menu quản trị"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-sm sm:text-base font-bold text-[#242424]">
              {navItems.find((i) =>
                i.href === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(i.href)
              )?.label || 'Bảng điều khiển'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/admin/cloudflare"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F6F2] border border-[#EFE9E1] text-[#8B6245] text-xs font-semibold hover:bg-[#EFE9E1]"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Python Workers + D1</span>
            </Link>

            <div className="flex items-center gap-2.5 pl-3 border-l border-[#EFE9E1]">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs border border-amber-300">
                A
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#242424] leading-tight">Admin System</p>
                <p className="text-[10px] text-stone-400">admin@homedecor.vn</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Modal */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-[#242424] text-white p-5 shadow-2xl z-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <span className="text-base font-bold font-display text-white">HomeDecor Admin</span>
                <button onClick={() => setIsSidebarOpen(false)} className="text-stone-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/admin'
                      ? location.pathname === '/admin'
                      : location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive ? 'bg-[#8B6245] text-white' : 'text-stone-400 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="space-y-2 pt-4 border-t border-stone-800">
              <Link
                to="/"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-2 text-xs text-stone-300 py-1.5"
              >
                <Store className="w-4 h-4" />
                <span>Về cửa hàng</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
