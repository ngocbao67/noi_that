import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, MapPin, Mail, Shield, Package, Heart, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, role } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || 'Hà Nội',
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold font-display text-[#242424] mb-2">Chưa đăng nhập</h2>
        <p className="text-xs text-stone-500 mb-6">Vui lòng đăng nhập để xem và quản lý thông tin tài khoản cá nhân.</p>
        <Link to="/login" className="px-6 py-2.5 bg-[#8B6245] text-white text-xs font-semibold rounded-xl">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateUser(formData);
    setIsSaving(false);
  };

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Tài khoản của tôi' }]} />

        <div className="mt-2 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-[#242424]">Thông tin tài khoản</h1>
            <p className="text-xs text-stone-500 mt-1">Quản lý hồ sơ cá nhân và địa chỉ nhận hàng mặc định</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/orders"
              className="px-4 py-2 bg-white border border-[#EFE9E1] text-[#242424] text-xs font-semibold rounded-xl hover:bg-stone-50 flex items-center gap-1.5 shadow-sm"
            >
              <Package className="w-4 h-4 text-[#8B6245]" />
              <span>Đơn hàng của tôi</span>
            </Link>
            <Link
              to="/wishlist"
              className="px-4 py-2 bg-white border border-[#EFE9E1] text-[#242424] text-xs font-semibold rounded-xl hover:bg-stone-50 flex items-center gap-1.5 shadow-sm"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Yêu thích</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Overview */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFE9E1] shadow-sm text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#EFE9E1] text-[#8B6245] border-2 border-[#C2A383]/40 flex items-center justify-center font-display font-bold text-2xl mx-auto">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-[#242424]">{user.name}</h2>
              <p className="text-xs text-stone-400">{user.email}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 text-[11px] font-semibold rounded-full ${
                  role === 'admin'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {role === 'admin' ? 'Quản trị viên (Admin)' : 'Thành viên thân thiết'}
              </span>
            </div>

            <div className="pt-4 border-t border-[#EFE9E1] text-left text-xs text-stone-500 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-stone-400" />
                <span>Quyền: {role === 'admin' ? 'Toàn quyền quản trị' : 'Khách hàng mua sắm'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-stone-400" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>

            {role === 'admin' && (
              <div className="pt-2">
                <Link
                  to="/admin"
                  className="w-full py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-xl block transition-colors"
                >
                  Truy cập Admin Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* Form Edit */}
          <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE9E1] shadow-sm">
            <h2 className="text-base font-bold font-display text-[#242424] pb-3 border-b border-[#EFE9E1] mb-5">
              Cập nhật thông tin giao nhận
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#242424]">Họ và tên</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#242424]">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0912 345 678"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#242424]">Tỉnh / Thành phố</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
                  >
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Thái Nguyên">Thái Nguyên</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#242424]">Địa chỉ giao hàng mặc định</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Số nhà, đường, phường/xã"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
