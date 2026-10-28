import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home, Phone, MapPin, Calendar, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';
import { fetchOrderById } from '../api/orders';
import { formatVND } from '../utils/pricing';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B6245', '#C2A383', '#242424', '#10B981'],
    });

    if (id) {
      fetchOrderById(id).then((ord) => {
        setOrder(ord);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-16 h-16 bg-stone-200 rounded-full mx-auto mb-4" />
        <div className="h-6 bg-stone-200 rounded w-1/2 mx-auto mb-2" />
        <div className="h-4 bg-stone-200 rounded w-1/3 mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EFE9E1] shadow-xl text-center space-y-6">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#242424]">
              Đặt hàng thành công!
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              Cảm ơn quý khách đã tin tưởng lựa chọn HomeDecor Shop. Đơn hàng của bạn đã được ghi nhận trên hệ thống Cloudflare D1.
            </p>
          </div>

          {/* Order Code Box */}
          <div className="p-4 rounded-2xl bg-[#F8F6F2] border border-[#EFE9E1] inline-block text-left max-w-sm w-full">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">Mã đơn hàng:</span>
              <strong className="text-base text-[#8B6245] font-mono tracking-wider">
                {order ? order.code : id}
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-stone-500">Trạng thái:</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px]">
                Chờ xác nhận
              </span>
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          {order && (
            <div className="text-left border-t border-[#EFE9E1] pt-6 space-y-4 text-xs">
              <h2 className="text-sm font-bold font-display text-[#242424]">Chi tiết người nhận & Giao hàng</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-600">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-[#8B6245] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#242424]">{order.customerName}</p>
                    <p>{order.customerPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#8B6245] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#242424]">{order.shippingCity}</p>
                    <p>{order.shippingAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-[#8B6245] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#242424]">Dự kiến giao hàng</p>
                    <p>Trong 2 - 4 ngày làm việc</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-[#8B6245] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#242424]">Phương thức thanh toán</p>
                    <p>{order.paymentMethod === 'cod' ? 'Thanh toán tiền mặt COD' : 'Chuyển khoản QR ngân hàng'}</p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="pt-4 border-t border-[#EFE9E1]">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Sản phẩm đã đặt</h3>
                <div className="divide-y divide-[#EFE9E1]">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded-lg bg-stone-100"
                        />
                        <div>
                          <p className="font-semibold text-[#242424]">{item.productName}</p>
                          <p className="text-stone-400">SL: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#242424]">{formatVND(item.total)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#EFE9E1] flex justify-between items-center text-sm">
                  <span className="font-semibold text-stone-600">Tổng thanh toán:</span>
                  <span className="text-xl font-bold font-display text-[#8B6245]">{formatVND(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-6 border-t border-[#EFE9E1] flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/orders"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Package className="w-4 h-4" />
              <span>Xem lịch sử đơn hàng</span>
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#EFE9E1] text-[#242424] hover:bg-stone-50 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Quay về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
