import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, quickLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // If already logged in
  if (user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold font-display text-[#242424] mb-2">Bạn đã đăng nhập!</h2>
        <p className="text-xs text-stone-500 mb-6">Xin chào, {user.name} ({user.email})</p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-[#8B6245] text-white text-xs font-semibold rounded-xl inline-block"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  const handleDemoFill = async (type: 'admin' | 'customer') => {
    await quickLogin(type);
    navigate(type === 'admin' ? '/admin' : from, { replace: true });
  };

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-8 sm:py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <Breadcrumbs items={[{ label: 'Đăng nhập' }]} />

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EFE9E1] shadow-xl space-y-6 mt-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-[#8B6245] text-white mx-auto flex items-center justify-center font-display font-bold text-xl shadow-md">
              H
            </div>
            <h1 className="text-2xl font-bold font-display text-[#242424] pt-2">Đăng nhập tài khoản</h1>
            <p className="text-xs text-stone-500">Truy cập để quản lý đơn hàng hoặc trang quản trị</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#242424]">Địa chỉ Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@homedecor.vn hoặc email của bạn"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#242424]">Mật khẩu</label>
                <span className="text-stone-400 cursor-pointer hover:underline text-[11px]">Quên mật khẩu?</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Đang kiểm tra...' : 'Đăng nhập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Pills for Capstone Evaluation */}
          <div className="p-4 rounded-2xl bg-[#F8F6F2] border border-[#EFE9E1] space-y-2">
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider text-center">
              Tài khoản chấm đồ án (Demo 1 chạm)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Vào Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('customer')}
                className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-stone-600" />
                <span>Khách hàng</span>
              </button>
            </div>
            <p className="text-[10px] text-stone-400 text-center">
              Admin: admin@homedecor.vn / admin123 • Khách: khachhang@gmail.com / 123456
            </p>
          </div>

          <div className="text-center text-xs text-stone-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-[#8B6245] hover:underline">
              Đăng ký tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
