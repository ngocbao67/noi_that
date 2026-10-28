import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Clock,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AdminStats, Order } from '../../types';
import { fetchAdminStats } from '../../api/admin';
import { formatVND } from '../../utils/pricing';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-[#EFE9E1]" />
          ))}
        </div>
        <div className="h-72 bg-white rounded-3xl border border-[#EFE9E1]" />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Tổng doanh thu',
      value: formatVND(stats.totalRevenue),
      subtext: 'Đã hoàn thành & xác nhận',
      icon: DollarSign,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Tổng đơn hàng',
      value: stats.totalOrders.toString(),
      subtext: 'Trên toàn hệ thống',
      icon: ShoppingCart,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      label: 'Đơn chờ xác nhận',
      value: stats.pendingOrdersCount.toString(),
      subtext: 'Cần duyệt đóng gói ngay',
      icon: Clock,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      highlight: stats.pendingOrdersCount > 0,
    },
    {
      label: 'Tổng sản phẩm',
      value: stats.totalProducts.toString(),
      subtext: 'Đang hoạt động trong kho',
      icon: Package,
      color: 'text-[#8B6245] bg-[#EFE9E1] border-[#C2A383]/40',
    },
    {
      label: 'Khách hàng',
      value: stats.totalUsers.toString(),
      subtext: 'Tài khoản đã đăng ký',
      icon: Users,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-white border shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                kpi.highlight ? 'border-amber-400 ring-2 ring-amber-100' : 'border-[#EFE9E1]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{kpi.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xl sm:text-2xl font-bold font-display text-[#242424]">{kpi.value}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">{kpi.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Revenue Chart Simulation (Accessible SVG Bar Graph) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE9E1] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EFE9E1]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#8B6245]" />
              <h2 className="text-base font-bold font-display text-[#242424]">Xu hướng Doanh thu (6 tháng gần nhất)</h2>
            </div>
            <span className="text-xs text-stone-400">Đơn vị: VNĐ</span>
          </div>

          {/* Pure SVG Bar Graph for seamless rendering & zero extra heavy bundle */}
          <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 pt-6 px-2">
            {stats.monthlyRevenue.map((m, i) => {
              const maxVal = Math.max(...stats.monthlyRevenue.map((x) => x.revenue));
              const heightPercent = Math.max(15, Math.round((m.revenue / maxVal) * 100));

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-[#8B6245] opacity-0 group-hover:opacity-100 transition-opacity">
                    {(m.revenue / 1000000).toFixed(0)}Tr
                  </div>
                  <div className="w-full bg-[#EFE9E1] rounded-t-xl overflow-hidden h-full max-h-[180px] flex items-end">
                    <div
                      className="w-full bg-[#8B6245] group-hover:bg-[#724e35] transition-all duration-500 rounded-t-xl"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-stone-600 mt-1">{m.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE9E1] shadow-sm space-y-5">
          <h2 className="text-base font-bold font-display text-[#242424] pb-3 border-b border-[#EFE9E1]">
            Phân bố Sản phẩm
          </h2>
          <div className="space-y-3.5">
            {stats.categoryDistribution.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#242424]">{cat.name}</span>
                  <span className="font-bold text-[#8B6245]">{cat.count} sp</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C2A383] rounded-full"
                    style={{ width: `${Math.min(100, (cat.count / 10) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#EFE9E1]">
            <Link
              to="/admin/products"
              className="w-full py-2 bg-[#F8F6F2] hover:bg-[#EFE9E1] text-[#8B6245] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Quản lý kho sản phẩm</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-[#EFE9E1] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE9E1]">
          <h2 className="text-base font-bold font-display text-[#242424]">Đơn hàng mới nhất</h2>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-[#8B6245] hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả đơn hàng</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#EFE9E1] text-stone-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Mã đơn</th>
                <th className="py-3 px-3">Khách hàng</th>
                <th className="py-3 px-3">Số món</th>
                <th className="py-3 px-3">Tổng tiền</th>
                <th className="py-3 px-3">Phương thức</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9E1]">
              {stats.recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#8B6245]">{ord.code}</td>
                  <td className="py-3 px-3 font-medium text-[#242424]">
                    <div>{ord.customerName}</div>
                    <div className="text-[10px] text-stone-400">{ord.customerPhone}</div>
                  </td>
                  <td className="py-3 px-3">{ord.items.length} món</td>
                  <td className="py-3 px-3 font-bold text-[#242424]">{formatVND(ord.total)}</td>
                  <td className="py-3 px-3 uppercase text-[10px] text-stone-500 font-semibold">{ord.paymentMethod}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        ord.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'shipping'
                          ? 'bg-purple-100 text-purple-800'
                          : ord.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'cancelled'
                          ? 'bg-stone-100 text-stone-500'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.status === 'pending'
                        ? 'Chờ duyệt'
                        : ord.status === 'confirmed'
                        ? 'Đã xác nhận'
                        : ord.status === 'shipping'
                        ? 'Đang giao'
                        : ord.status === 'completed'
                        ? 'Hoàn thành'
                        : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to="/admin/orders"
                      className="px-2.5 py-1 rounded-lg bg-[#F8F6F2] hover:bg-[#EFE9E1] text-[#8B6245] font-semibold text-[11px]"
                    >
                      Xử lý
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
