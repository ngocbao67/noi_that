import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { itemCount, toggleCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, role, logout, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Click outside user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Sản phẩm', href: '/products' },
    { label: 'Phòng khách', href: '/products?category=sofa' },
    { label: 'Phòng ngủ', href: '/products?category=phong-ngu' },
    { label: 'Bàn ghế', href: '/products?category=ban-ghe' },
    { label: 'Đèn trang trí', href: '/products?category=den-trang-tri' },
    { label: 'Giới thiệu', href: '/about' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F8F6F2]/95 backdrop-blur-md shadow-md py-3.5 border-b border-[#EFE9E1]'
            : 'bg-[#F8F6F2] py-5 border-b border-[#EFE9E1]/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Mở menu chuyển hướng"
              className="lg:hidden p-2 text-[#242424] hover:text-[#8B6245] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-[#8B6245] text-white flex items-center justify-center font-display font-bold text-lg shadow-sm group-hover:bg-[#724e35] transition-colors">
                H
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold tracking-tight font-display text-[#242424] leading-tight">
                  HomeDecor<span className="text-[#8B6245]">.</span>
                </span>
                <span className="text-[10px] text-stone-600 tracking-wider font-medium uppercase -mt-0.5 hidden sm:block">
                  Kiến tạo không gian sống
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-[#242424]">
              {navLinks.map((link) => {
                const isActive =
                  link.href === '/'
                    ? location.pathname === '/'
                    : location.pathname + location.search === link.href ||
                      (location.pathname === '/products' && link.href === '/products' && !location.search);
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`transition-colors relative py-1 hover:text-[#8B6245] ${
                      isActive ? 'text-[#8B6245] font-semibold' : 'text-[#242424]/85'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8B6245] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Icons & Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Cloudflare D1 Architecture Badge */}
              <Link
                to="/admin/cloudflare"
                title="Kiến trúc Cloudflare Workers + D1"
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFE9E1] text-[#8B6245] text-xs font-medium border border-[#C2A383]/40 hover:bg-[#8B6245] hover:text-white transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Cloudflare Ready</span>
              </Link>

              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Tìm kiếm sản phẩm"
                className="p-2.5 rounded-full text-[#242424] hover:text-[#8B6245] hover:bg-[#EFE9E1] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                aria-label="Danh sách yêu thích"
                className="p-2.5 rounded-full text-[#242424] hover:text-rose-600 hover:bg-[#EFE9E1] transition-colors relative"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={toggleCart}
                aria-label="Mở giỏ hàng"
                className="p-2.5 rounded-full text-[#242424] hover:text-[#8B6245] hover:bg-[#EFE9E1] transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#8B6245] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Account Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="Tài khoản người dùng"
                  className="flex items-center gap-1.5 p-2 rounded-full text-[#242424] hover:bg-[#EFE9E1] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#EFE9E1] border border-[#C2A383]/50 flex items-center justify-center text-[#8B6245] font-semibold text-xs">
                    {user ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                </button>

                {/* Dropdown Popover */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#EFE9E1] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {user ? (
                      <div>
                        <div className="px-4 py-2 border-b border-[#EFE9E1] mb-2">
                          <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Đang đăng nhập</p>
                          <p className="text-sm font-bold text-[#242424] truncate">{user.name}</p>
                          <p className="text-xs text-stone-500 truncate">{user.email}</p>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                              role === 'admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {role === 'admin' ? 'Quản trị viên (Admin)' : 'Khách hàng thân thiết'}
                          </span>
                        </div>

                        {role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#8B6245] font-semibold hover:bg-[#F8F6F2] transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Vào trang Quản trị (Admin)</span>
                          </Link>
                        )}

                        <Link
                          to="/orders"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#242424] hover:bg-[#F8F6F2] transition-colors"
                        >
                          <Package className="w-4 h-4 text-stone-400" />
                          <span>Lịch sử đơn hàng</span>
                        </Link>

                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#242424] hover:bg-[#F8F6F2] transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-stone-400" />
                          <span>Thông tin tài khoản</span>
                        </Link>

                        <div className="border-t border-[#EFE9E1] mt-2 pt-2">
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3">
                        <div className="text-center pb-3 border-b border-[#EFE9E1]">
                          <p className="text-sm font-semibold text-[#242424]">Tài khoản HomeDecor</p>
                          <p className="text-xs text-stone-500 mt-0.5">Đăng nhập để theo dõi đơn và quản trị</p>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <Link
                              to="/login"
                              className="py-1.5 px-3 bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-semibold rounded-lg text-center transition-colors"
                            >
                              Đăng nhập
                            </Link>
                            <Link
                              to="/register"
                              className="py-1.5 px-3 border border-[#8B6245] text-[#8B6245] hover:bg-[#8B6245]/10 text-xs font-semibold rounded-lg text-center transition-colors"
                            >
                              Đăng ký
                            </Link>
                          </div>
                        </div>

                        {/* Quick Login Helper for University Demo */}
                        <div className="mt-3 pt-1">
                          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                            Demo nhanh đồ án:
                          </p>
                          <div className="flex flex-col gap-1.5">
                            <button
                              onClick={() => quickLogin('customer')}
                              className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg bg-[#F8F6F2] hover:bg-[#EFE9E1] text-[#242424] flex items-center justify-between group transition-colors"
                            >
                              <span>👤 Đăng nhập Khách hàng</span>
                              <ArrowRight className="w-3 h-3 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                            <button
                              onClick={() => quickLogin('admin')}
                              className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-between group transition-colors font-medium"
                            >
                              <span>🔑 Đăng nhập Admin</span>
                              <ArrowRight className="w-3 h-3 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Collapsible Search Bar */}
          {isSearchOpen && (
            <div className="pt-3 pb-2 border-t border-[#EFE9E1] mt-3 animate-in fade-in duration-200">
              <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sofa, bàn trà, giường ngủ, đèn trang trí..."
                  autoFocus
                  className="w-full pl-11 pr-24 py-2.5 bg-white border border-[#C2A383] rounded-full text-sm text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#8B6245] shadow-inner"
                />
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-semibold rounded-full transition-colors"
                >
                  Tìm kiếm
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-[#F8F6F2] p-6 shadow-2xl z-10 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#EFE9E1]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#8B6245] text-white flex items-center justify-center font-display font-bold">
                    H
                  </div>
                  <span className="text-xl font-bold font-display text-[#242424]">HomeDecor</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Đóng menu"
                  className="p-1 rounded-full hover:bg-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col gap-3 py-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-base font-medium text-[#242424] hover:text-[#8B6245] py-1.5 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-base font-semibold text-[#8B6245] py-1.5 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Trang quản trị Admin</span>
                  </Link>
                )}
                <Link
                  to="/admin/cloudflare"
                  className="text-sm font-medium text-stone-600 py-1.5 flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-[#8B6245]" />
                  <span>Cấu hình Cloudflare D1</span>
                </Link>
              </nav>
            </div>

            {/* Mobile Footer Auth */}
            <div className="pt-4 border-t border-[#EFE9E1]">
              {user ? (
                <div className="space-y-2">
                  <p className="text-xs text-stone-500">Xin chào, {user.name}</p>
                  <button
                    onClick={logout}
                    className="w-full py-2 text-center text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="py-2 text-center text-xs font-semibold text-white bg-[#8B6245] rounded-xl"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="py-2 text-center text-xs font-semibold text-[#8B6245] border border-[#8B6245] rounded-xl"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
