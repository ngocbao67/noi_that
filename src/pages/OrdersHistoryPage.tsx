import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, XCircle, AlertCircle, Eye, ShoppingBag } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { fetchMyOrders, cancelOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatVND } from '../utils/pricing';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const OrdersHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeOrderModal, setActiveOrderModal] = useState<Order | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const data = await fetchMyOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    const res = await cancelOrder(orderId);
    if (res.success) {
      showToast('Đã hủy đơn hàng thành công!', 'info');
      await loadOrders();
      if (activeOrderModal && activeOrderModal.id === orderId) {
        setActiveOrderModal(null);
      }
    } else {
      showToast(res.error || 'Không thể hủy đơn hàng', 'error');
    }
  };

  const statusBadges: Record<OrderStatus, { label: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
    pending: { label: 'Chờ xác nhận', bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
    confirmed: { label: 'Đã xác nhận', bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 },
    shipping: { label: 'Đang giao hàng', bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
    completed: { label: 'Hoàn thành', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
    cancelled: { label: 'Đã hủy', bg: 'bg-stone-100 text-stone-500 border-stone-200', icon: XCircle },
  };

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === selectedStatus);

  if (!user) {
    return (
      <div className="bg-[#F8F6F2] min-h-screen py-16 text-center">
        <div className="max-w-md mx-auto px-4 bg-white p-8 rounded-3xl border border-[#EFE9E1] shadow-sm">
          <Package className="w-12 h-12 text-[#8B6245] mx-auto mb-3" />
          <h2 className="text-xl font-bold font-display text-[#242424] mb-2">Đăng nhập để xem lịch sử</h2>
          <p className="text-xs text-stone-500 mb-6">
            Bạn cần đăng nhập tài khoản để theo dõi tiến độ xử lý và hành trình giao hàng của các đơn đã đặt.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Lịch sử đơn hàng' }]} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-[#242424]">Đơn hàng của bạn</h1>
            <p className="text-xs text-stone-500 mt-1">
              Khách hàng: <strong>{user.name}</strong> ({user.email})
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#EFE9E1] hover:border-[#8B6245] text-[#242424] text-xs font-semibold rounded-xl transition-colors shadow-sm self-start sm:self-auto"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#8B6245]" />
            <span>Mua sắm thêm</span>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {[
            { id: 'all', label: 'Tất cả đơn' },
            { id: 'pending', label: 'Chờ xác nhận' },
            { id: 'confirmed', label: 'Đã xác nhận' },
            { id: 'shipping', label: 'Đang giao' },
            { id: 'completed', label: 'Đã nhận hàng' },
            { id: 'cancelled', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedStatus === tab.id
                  ? 'bg-[#8B6245] text-white shadow-md'
                  : 'bg-white text-stone-600 border border-[#EFE9E1] hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl h-36 border border-[#EFE9E1]" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#EFE9E1] shadow-sm">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold font-display text-[#242424]">Không có đơn hàng nào trong mục này</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Bạn chưa có đơn hàng nào với trạng thái này hoặc chưa thực hiện giao dịch nào gần đây.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const badge = statusBadges[order.status] || statusBadges.pending;
              const StatusIcon = badge.icon;
              const canCancel = order.status === 'pending' || order.status === 'confirmed';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-[#EFE9E1] p-5 sm:p-6 shadow-sm hover:border-[#C2A383]/60 transition-all space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFE9E1]">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#8B6245] bg-[#F8F6F2] px-2.5 py-1 rounded-lg border border-[#EFE9E1]">
                        {order.code}
                      </span>
                      <span className="text-xs text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Order Products Preview */}
                  <div className="divide-y divide-[#EFE9E1]">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-xl bg-stone-100 shrink-0 border border-[#EFE9E1]"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#242424] truncate">{item.productName}</p>
                            <p className="text-stone-500">Số lượng: {item.quantity} x {formatVND(item.price)}</p>
                          </div>
                        </div>
                        <span className="font-bold text-[#242424] shrink-0">{formatVND(item.total)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary & Action Buttons */}
                  <div className="pt-3 border-t border-[#EFE9E1] flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-stone-500">
                      Giao đến: <strong className="text-[#242424]">{order.shippingAddress}, {order.shippingCity}</strong>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-stone-500">Tổng thanh toán: </span>
                        <strong className="text-base text-[#8B6245] font-bold font-display ml-1">
                          {formatVND(order.total)}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveOrderModal(order)}
                          className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>
                        {canCancel && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                          >
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setActiveOrderModal(null)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE9E1]">
              <h2 className="text-base font-bold font-display text-[#242424]">
                Chi tiết đơn hàng {activeOrderModal.code}
              </h2>
              <button
                onClick={() => setActiveOrderModal(null)}
                aria-label="Đóng chi tiết"
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-stone-400">Người nhận:</p>
                <p className="font-semibold text-[#242424]">{activeOrderModal.customerName} - {activeOrderModal.customerPhone}</p>
              </div>
              <div>
                <p className="text-stone-400">Địa chỉ giao:</p>
                <p className="font-semibold text-[#242424]">{activeOrderModal.shippingAddress}, {activeOrderModal.shippingCity}</p>
              </div>
              {activeOrderModal.notes && (
                <div>
                  <p className="text-stone-400">Ghi chú:</p>
                  <p className="font-semibold text-[#242424]">{activeOrderModal.notes}</p>
                </div>
              )}
              <div>
                <p className="text-stone-400">Phương thức thanh toán:</p>
                <p className="font-semibold text-[#242424]">{activeOrderModal.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản QR'}</p>
              </div>

              <div className="pt-3 border-t border-[#EFE9E1]">
                <p className="font-bold text-[#242424] mb-2 uppercase">Danh sách sản phẩm</p>
                <div className="space-y-2">
                  {activeOrderModal.items.map((i) => (
                    <div key={i.id} className="flex justify-between items-center">
                      <span>{i.productName} (x{i.quantity})</span>
                      <strong className="text-[#8B6245]">{formatVND(i.total)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFE9E1] flex justify-between items-center text-sm">
                <span className="font-bold text-[#242424]">Tổng cộng:</span>
                <span className="font-bold text-lg text-[#8B6245] font-display">{formatVND(activeOrderModal.total)}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveOrderModal(null)}
              className="w-full py-2.5 bg-[#8B6245] text-white text-xs font-semibold rounded-xl"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
