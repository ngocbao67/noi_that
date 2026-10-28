import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, MapPin, Shield, Calendar } from 'lucide-react';
import { User } from '../../types';
import { fetchAdminUsers } from '../../api/admin';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-[#242424]">Quản lý Khách hàng</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Danh sách người dùng và tài khoản khách hàng lưu trên Cloudflare D1
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EFE9E1] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#EFE9E1] bg-[#F8F6F2]/50 text-stone-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Tên khách hàng</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Địa chỉ mặc định</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4 text-right">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9E1]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    Đang tải dữ liệu khách hàng...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EFE9E1] text-[#8B6245] flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-[#242424]">{u.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3.5 px-4 text-stone-600">{u.phone || 'Chưa cập nhật'}</td>
                    <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                      {u.address ? `${u.address}, ${u.city}` : 'Chưa thiết lập'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-stone-400">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
