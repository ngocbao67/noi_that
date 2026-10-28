import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  Check,
  ChevronDown
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { fetchAdminOrders, updateAdminOrderStatus } from '../../api/admin';
import { formatVND } from '../../utils/pricing';
import { useToast } from '../../context/ToastContext';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { showToast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    const data = await fetchAdminOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    const res = await updateAdminOrderStatus(orderId, nextStatus);
    if (res.order) {
      showToast(`Đã chuyển đơn sang trạng thái "${nextStatus}"`, 'success');
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(res.order);
      }
    }
  };

  const statusMap: Record<OrderStatus, { label: string; color: string }> = {
    pending: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    shipping: { label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    completed: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    cancelled: { label: 'Đã hủy', color: 'bg-stone-100 text-stone-500 border-stone-200' },
  };

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#242424]">Quản lý Đơn hàng</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Xác nhận, xuất kho và cập nhật lộ trình giao hàng trực tiếp trên D1
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'pending', label: 'Chờ duyệt' },
            { id: 'confirmed', label: 'Đã duyệt' },
            { id: 'shipping', label: 'Đang giao' },
            { id: 'completed', label: 'Hoàn thành' },
            { id: 'cancelled', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#8B6245] text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-[#EFE9E1] hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#EFE9E1] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#EFE9E1] bg-[#F8F6F2]/50 text-stone-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Mã đơn & Ngày</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-3">Địa chỉ giao</th>
                <th className="py-3.5 px-3">Số món</th>
                <th className="py-3.5 px-3">Tổng tiền</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9E1]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    Đang tải đơn hàng...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500">
                    Không có đơn hàng nào trong danh mục này.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const badge = statusMap[order.status] || statusMap.pending;

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-sm text-[#8B6245] block">
                          {order.code}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#242424]">{order.customerName}</p>
                        <p className="text-[10px] text-stone-400">{order.customerPhone}</p>
                      </td>

                      <td className="py-3.5 px-3 max-w-xs truncate text-stone-600">
                        {order.shippingAddress}, {order.shippingCity}
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-stone-700">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} sản phẩm
                      </td>

                      <td className="py-3.5 px-3 font-bold font-display text-sm text-[#8B6245]">
                        {formatVND(order.total)}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${badge.color}`}
                        >
                          <option value="pending">Chờ xác nhận</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="shipping">Đang giao hàng</option>
                          <option value="completed">Đã hoàn thành</option>
                          <option value="cancelled">Đã hủy đơn</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-[#F8F6F2] font-semibold flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#8B6245]" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE9E1]">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold">Chi tiết đơn hàng</span>
                <h2 className="text-lg font-bold font-display text-[#8B6245]">{selectedOrder.code}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F8F6F2] text-xs">
              <div>
                <span className="text-stone-400">Khách hàng:</span>
                <p className="font-bold text-[#242424]">{selectedOrder.customerName}</p>
                <p className="text-stone-500">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <span className="text-stone-400">Địa chỉ giao:</span>
                <p className="font-semibold text-[#242424]">{selectedOrder.shippingAddress}</p>
                <p className="text-stone-500">{selectedOrder.shippingCity}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase text-stone-400">Sản phẩm trong đơn</span>
              <div className="divide-y divide-[#EFE9E1] max-h-48 overflow-y-auto">
                {selectedOrder.items.map((i) => (
                  <div key={i.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2.5">
                      <img src={i.productImage} alt={i.productName} className="w-10 h-10 rounded-lg object-cover bg-stone-100" />
                      <div>
                        <p className="font-semibold text-[#242424]">{i.productName}</p>
                        <p className="text-stone-400">Số lượng: {i.quantity} x {formatVND(i.price)}</p>
                      </div>
                    </div>
                    <strong className="text-[#8B6245]">{formatVND(i.total)}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-3 border-t border-[#EFE9E1] flex justify-between items-center text-sm">
              <span className="font-bold text-[#242424]">Tổng tiền đơn:</span>
              <span className="text-xl font-bold font-display text-[#8B6245]">{formatVND(selectedOrder.total)}</span>
            </div>

            {/* Quick Status Bar */}
            <div className="pt-3 border-t border-[#EFE9E1] flex items-center justify-between gap-2">
              <span className="text-xs text-stone-500">Cập nhật nhanh:</span>
              <div className="flex gap-1.5">
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Duyệt đơn
                  </button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'shipping')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700"
                  >
                    Giao hàng
                  </button>
                )}
                {selectedOrder.status === 'shipping' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                  >
                    Đã hoàn thành
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
