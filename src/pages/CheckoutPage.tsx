import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Banknote, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createOrder } from '../api/orders';
import { formatVND } from '../utils/pricing';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, shippingFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    city: user?.city || 'Hà Nội',
    address: user?.address || '',
    notes: '',
    paymentMethod: 'cod' as 'cod' | 'banking',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold font-display text-[#242424] mb-2">Giỏ hàng đang trống</h2>
        <p className="text-xs text-stone-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ để thực hiện thanh toán.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B6245] text-white text-xs font-semibold rounded-xl"
        >
          <span>Khám phá sản phẩm ngay</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên người nhận.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 9) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9 số).');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ giao hàng cụ thể.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createOrder({
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email || 'guest@homedecor.vn',
        shippingAddress: formData.address,
        shippingCity: formData.city,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });

      if (res.error) {
        setErrorMsg(res.error);
        showToast(res.error, 'error');
        setIsSubmitting(false);
        return;
      }

      if (res.order) {
        await clearCart();
        showToast(`Đặt hàng thành công! Mã đơn: ${res.order.code}`, 'success');
        navigate(`/orders/success/${res.order.id}`);
      }
    } catch {
      setErrorMsg('Đã xảy ra lỗi trong quá trình xử lý đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Giỏ hàng', href: '/cart' },
            { label: 'Thanh toán & Đặt hàng' },
          ]}
        />

        <h1 className="text-3xl sm:text-4xl font-bold font-display text-[#242424] mt-2 mb-8">
          Thông tin giao hàng & Thanh toán
        </h1>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Customer Form & Payment Method */}
            <div className="lg:col-span-7 space-y-6">
              {/* Shipping Details */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE9E1] shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#EFE9E1]">
                  <Truck className="w-5 h-5 text-[#8B6245]" />
                  <h2 className="text-base font-bold font-display text-[#242424]">Địa chỉ nhận hàng</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#242424]">
                      Họ và tên người nhận <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-2.5 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#242424]">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0912 345 678"
                      className="w-full px-4 py-2.5 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#242424]">Email (nhận mã đơn)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2.5 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#242424]">Tỉnh / Thành phố <span className="text-rose-500">*</span></label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
                    >
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Hải Phòng">Hải Phòng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                      <option value="Thái Nguyên">Thái Nguyên</option>
                      <option value="Bình Dương">Bình Dương</option>
                      <option value="Đồng Nai">Đồng Nai</option>
                      <option value="Tỉnh thành khác">Tỉnh thành khác</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#242424]">
                    Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Số 45, Đường Lê Duẩn, Phường Bến Nghé, Quận 1"
                    className="w-full px-4 py-2.5 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#242424]">Ghi chú giao hàng (nếu có)</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ví dụ: Gọi trước 30 phút, chung cư có thang máy..."
                    className="w-full px-4 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE9E1] shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#EFE9E1]">
                  <CreditCard className="w-5 h-5 text-[#8B6245]" />
                  <h2 className="text-base font-bold font-display text-[#242424]">Phương thức thanh toán</h2>
                </div>

                <div className="space-y-3">
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'cod'
                        ? 'border-[#8B6245] bg-[#F8F6F2]/80 shadow-sm'
                        : 'border-[#EFE9E1] hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                      className="mt-1 text-[#8B6245] focus:ring-[#8B6245]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-[#8B6245]" />
                        <span className="text-xs font-bold text-[#242424]">Thanh toán khi nhận hàng (COD)</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Kiểm tra hàng và lắp đặt hoàn tất trước khi thanh toán tiền mặt cho nhân viên giao vận.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'banking'
                        ? 'border-[#8B6245] bg-[#F8F6F2]/80 shadow-sm'
                        : 'border-[#EFE9E1] hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'banking'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'banking' })}
                      className="mt-1 text-[#8B6245] focus:ring-[#8B6245]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#8B6245]" />
                        <span className="text-xs font-bold text-[#242424]">Chuyển khoản VietQR ngân hàng (Mô phỏng)</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Quét mã QR qua ứng dụng ngân hàng bất kỳ để xác nhận đơn hàng tự động ngay tức thì.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Placement */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE9E1] shadow-sm space-y-5 sticky top-24">
                <h2 className="text-base font-bold font-display text-[#242424] pb-3 border-b border-[#EFE9E1]">
                  Đơn hàng của bạn ({cart.length} món)
                </h2>

                {/* Items preview list */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-xl bg-stone-100 shrink-0 border border-[#EFE9E1]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#242424] truncate">{item.product.name}</p>
                        <p className="text-stone-500">Số lượng: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-[#242424] shrink-0">
                        {formatVND(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing calculations */}
                <div className="space-y-2 text-xs border-t border-[#EFE9E1] pt-4">
                  <div className="flex justify-between text-stone-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-[#242424]">{formatVND(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Phí vận chuyển & lắp đặt</span>
                    <span className="font-semibold text-[#242424]">
                      {shippingFee === 0 ? <span className="text-emerald-700">Miễn phí</span> : formatVND(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#242424] pt-3 border-t border-[#EFE9E1]">
                    <span>Tổng thanh toán</span>
                    <span className="text-2xl font-bold font-display text-[#8B6245]">
                      {formatVND(total)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Đang xác thực tồn kho & lưu đơn...</span>
                  ) : (
                    <>
                      <span>Xác nhận đặt hàng</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 text-center pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Dữ liệu được xác thực bởi Cloudflare Python Workers & D1</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
