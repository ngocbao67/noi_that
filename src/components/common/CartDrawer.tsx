import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatVND } from '../../utils/pricing';

export const CartDrawer: React.FC = () => {
  const { cart, isOpen, closeCart, updateQty, removeItem, subtotal, shippingFee, total, isFreeShipping, freeShippingGap } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Giỏ hàng">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#EFE9E1] flex items-center justify-between bg-[#F8F6F2]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#8B6245]" />
            <h2 className="text-lg font-bold text-[#242424] font-display">Giỏ hàng của bạn</h2>
            <span className="text-xs bg-[#8B6245]/15 text-[#8B6245] px-2 py-0.5 rounded-full font-semibold">
              {cart.reduce((s, i) => s + i.quantity, 0)} sản phẩm
            </span>
          </div>
          <button
            onClick={closeCart}
            aria-label="Đóng giỏ hàng"
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="p-4 bg-[#EFE9E1]/60 border-b border-[#EFE9E1]">
          <div className="flex items-center gap-2 text-xs font-medium text-[#242424] mb-1.5">
            <Truck className="w-4 h-4 text-[#8B6245]" />
            {isFreeShipping ? (
              <span className="text-emerald-700 font-semibold">Đơn hàng của bạn đã đủ điều kiện Miễn phí vận chuyển!</span>
            ) : (
              <span>
                Mua thêm <strong className="text-[#8B6245]">{formatVND(freeShippingGap)}</strong> để được Miễn phí ship
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8B6245] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((subtotal / 3000000) * 100))}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 rounded-full bg-[#EFE9E1] flex items-center justify-center text-stone-400 mb-4">
                <ShoppingBag className="w-10 h-10 text-[#8B6245]/50" />
              </div>
              <h3 className="text-base font-semibold text-[#242424] mb-1">Giỏ hàng của bạn đang trống</h3>
              <p className="text-sm text-stone-500 mb-6 max-w-xs">
                Khám phá các bộ sưu tập nội thất Scandinavian và Japandi tinh tế của chúng tôi.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/products');
                }}
                className="px-6 py-2.5 bg-[#8B6245] hover:bg-[#724e35] text-white text-sm font-semibold rounded-xl transition-all shadow-md"
              >
                Khám phá sản phẩm ngay
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3 bg-[#F8F6F2]/60 rounded-xl border border-[#EFE9E1] relative group"
              >
                <img
                  src={item.product.thumbnail}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg bg-stone-100 shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="pr-6">
                    <Link
                      to={`/products/${item.product.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-[#242424] hover:text-[#8B6245] transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <div className="text-xs text-[#8B6245] font-semibold mt-0.5">
                      {formatVND(item.product.price)}
                    </div>
                  </div>

                  {/* Quantity Stepper & Total */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EFE9E1]/80">
                    <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        aria-label="Giảm số lượng"
                        className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-semibold text-[#242424]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        aria-label="Tăng số lượng"
                        className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs font-bold text-[#242424]">
                      {formatVND(item.product.price * item.quantity)}
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label="Xóa sản phẩm khỏi giỏ hàng"
                  className="absolute top-3 right-3 text-stone-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#EFE9E1] bg-[#F8F6F2] space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Tạm tính</span>
                <span className="font-medium text-[#242424]">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-[#242424]">
                  {shippingFee === 0 ? <span className="text-emerald-700">Miễn phí</span> : formatVND(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#242424] pt-2 border-t border-[#EFE9E1]">
                <span>Tổng cộng</span>
                <span className="text-[#8B6245] font-display text-lg">{formatVND(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/cart"
                onClick={closeCart}
                className="w-full py-2.5 px-3 rounded-xl border border-[#8B6245] text-[#8B6245] hover:bg-[#8B6245]/10 text-xs font-semibold text-center transition-colors"
              >
                Xem chi tiết giỏ
              </Link>
              <button
                onClick={handleCheckout}
                className="w-full py-2.5 px-3 rounded-xl bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <span>Thanh toán</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
