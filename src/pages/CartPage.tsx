import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatVND } from '../utils/pricing';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const CartPage: React.FC = () => {
  const { cart, updateQty, removeItem, subtotal, shippingFee, total, isFreeShipping, freeShippingGap } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'HOMEDECOR200' || code === 'NOITHAT') {
      setAppliedDiscount(200000);
      showToast('Đã áp dụng mã giảm giá 200.000 ₫ thành công!', 'success');
    } else if (code) {
      showToast('Mã giảm giá không hợp lệ hoặc đã hết hạn (Thử mã: HOMEDECOR200)', 'error');
    }
  };

  const finalTotal = Math.max(0, total - appliedDiscount);

  if (cart.length === 0) {
    return (
      <div className="bg-[#F8F6F2] min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-24 h-24 rounded-full bg-white mx-auto flex items-center justify-center text-stone-300 shadow-sm border border-[#EFE9E1] mb-6">
            <ShoppingBag className="w-12 h-12 text-[#8B6245]/60" />
          </div>
          <h1 className="text-3xl font-bold font-display text-[#242424] mb-3">Giỏ hàng của bạn đang trống</h1>
          <p className="text-sm text-stone-600 max-w-md mx-auto mb-8">
            Hãy khám phá các thiết kế nội thất Scandinavian, Japandi tinh xảo để trang hoàng cho tổ ấm của bạn.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            <span>Khám phá sản phẩm ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Giỏ hàng của bạn' }]} />

        <h1 className="text-3xl sm:text-4xl font-bold font-display text-[#242424] mt-2 mb-8">
          Giỏ hàng ({cart.reduce((s, i) => s + i.quantity, 0)} sản phẩm)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Table / List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free shipping banner */}
            <div className="p-4 rounded-2xl bg-white border border-[#EFE9E1] flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#EFE9E1] text-[#8B6245] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-[#242424]">
                  {isFreeShipping
                    ? 'Bạn được Miễn phí vận chuyển toàn quốc cho đơn hàng này!'
                    : `Mua thêm ${formatVND(freeShippingGap)} để nhận MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC`}
                </p>
                <div className="w-full h-1.5 bg-stone-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#8B6245] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((subtotal / 3000000) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-3xl border border-[#EFE9E1] shadow-sm divide-y divide-[#EFE9E1] overflow-hidden">
              {cart.map((item) => (
                <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5">
                  <img
                    src={item.product.thumbnail}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-2xl bg-stone-100 shrink-0 border border-[#EFE9E1]"
                  />

                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <span className="text-[10px] uppercase font-bold text-[#8B6245]">
                      {item.product.categoryName}
                    </span>
                    <Link
                      to={`/products/${item.product.slug}`}
                      className="block text-base font-semibold text-[#242424] hover:text-[#8B6245] transition-colors truncate mt-0.5"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Đơn giá: <strong className="text-[#8B6245]">{formatVND(item.product.price)}</strong>
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-stone-200 rounded-xl bg-white shadow-inner">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-stone-100 text-stone-600 transition-colors"
                      aria-label="Giảm số lượng"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-[#242424]">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-stone-100 text-stone-600 transition-colors"
                      aria-label="Tăng số lượng"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-center sm:text-right min-w-[120px]">
                    <p className="text-sm font-bold text-[#242424]">
                      {formatVND(item.product.price * item.quantity)}
                    </p>
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Xóa ${item.product.name}`}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link
                to="/products"
                className="text-xs font-semibold text-[#8B6245] hover:underline flex items-center gap-1.5"
              >
                <span>← Tiếp tục mua sắm các mẫu nội thất khác</span>
              </Link>
            </div>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#EFE9E1] shadow-sm space-y-5">
              <h2 className="text-base font-bold font-display text-[#242424] pb-3 border-b border-[#EFE9E1]">
                Tóm tắt đơn hàng
              </h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-xs font-medium text-stone-600 block">Mã giảm giá (Coupon)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Mã: HOMEDECOR200"
                      className="w-full pl-9 pr-3 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>
              </form>

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs border-t border-[#EFE9E1] pt-4">
                <div className="flex justify-between text-stone-600">
                  <span>Tiền hàng</span>
                  <span className="font-semibold text-[#242424]">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Phí giao hàng & lắp đặt</span>
                  <span className="font-semibold text-[#242424]">
                    {shippingFee === 0 ? <span className="text-emerald-700">Miễn phí</span> : formatVND(shippingFee)}
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Mã giảm giá (HOMEDECOR200)</span>
                    <span>-{formatVND(appliedDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#242424] pt-3 border-t border-[#EFE9E1]">
                  <span>Tổng thanh toán</span>
                  <span className="text-xl font-bold font-display text-[#8B6245]">
                    {formatVND(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 px-6 rounded-xl bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                <span>Tiến hành đặt hàng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
