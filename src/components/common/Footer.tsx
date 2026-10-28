import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Send, CheckCircle2, Shield, RefreshCw, Truck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      showToast('Cảm ơn bạn đã đăng ký nhận bản tin nội thất từ HomeDecor!', 'success');
      setEmail('');
    } else {
      showToast('Vui lòng nhập địa chỉ email hợp lệ', 'error');
    }
  };

  return (
    <footer className="bg-[#242424] text-[#F8F6F2] pt-16 pb-10 border-t border-[#8B6245]/30">
      {/* Value Badges Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-[#8B6245]/30 text-[#C2A383] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Vận chuyển toàn quốc</h3>
              <p className="text-xs text-stone-300 mt-0.5">Miễn phí ship cho đơn từ 3 triệu</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-[#8B6245]/30 text-[#C2A383] flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Bảo hành chính hãng</h3>
              <p className="text-xs text-stone-300 mt-0.5">Cam kết 2 năm khung gỗ tự nhiên</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-[#8B6245]/30 text-[#C2A383] flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">30 ngày đổi trả</h3>
              <p className="text-xs text-stone-300 mt-0.5">Đổi hàng 1 - 1 nếu lỗi sản xuất</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-[#8B6245]/30 text-[#C2A383] flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Tư vấn không gian</h3>
              <p className="text-xs text-stone-300 mt-0.5">Hotline 24/7 hỗ trợ 0901 234 567</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#8B6245] text-white flex items-center justify-center font-display font-bold text-lg">
                H
              </div>
              <span className="text-2xl font-bold font-display tracking-tight text-white">
                HomeDecor<span className="text-[#C2A383]">.</span>
              </span>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed max-w-sm">
              Kiến tạo không gian sống của bạn bằng những món đồ nội thất tuyển chọn tinh tế, giao thoa giữa phong cách Scandinavia thanh lịch và tinh thần thiền định Japandi.
            </p>
            <div className="space-y-2 pt-2 text-xs text-stone-300">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#C2A383] shrink-0" />
                <span>Số 128 Đường Xuân Thủy, Cầu Giấy, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C2A383] shrink-0" />
                <span>0901 234 567 - 024 6688 9900</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C2A383] shrink-0" />
                <span>support@homedecor.vn</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Danh mục nội thất</h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <Link to="/products?category=sofa" className="hover:text-[#C2A383] transition-colors">
                  Sofa phòng khách
                </Link>
              </li>
              <li>
                <Link to="/products?category=ban-tra" className="hover:text-[#C2A383] transition-colors">
                  Bàn trà mặt đá & gỗ
                </Link>
              </li>
              <li>
                <Link to="/products?category=ban-ghe" className="hover:text-[#C2A383] transition-colors">
                  Ghế thư giãn & ghế ăn
                </Link>
              </li>
              <li>
                <Link to="/products?category=phong-ngu" className="hover:text-[#C2A383] transition-colors">
                  Giường ngủ Bắc Âu
                </Link>
              </li>
              <li>
                <Link to="/products?category=tu-ke" className="hover:text-[#C2A383] transition-colors">
                  Tủ tivi & Kệ sách
                </Link>
              </li>
              <li>
                <Link to="/products?category=den-trang-tri" className="hover:text-[#C2A383] transition-colors">
                  Đèn decor & đèn thả
                </Link>
              </li>
            </ul>
          </div>

          {/* Policy Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <Link to="/about" className="hover:text-[#C2A383] transition-colors">
                  Câu chuyện thương hiệu
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-[#C2A383] transition-colors">
                  Tra cứu tình trạng đơn hàng
                </Link>
              </li>
              <li>
                <span className="hover:text-[#C2A383] transition-colors cursor-pointer">
                  Chính sách vận chuyển & lắp đặt
                </span>
              </li>
              <li>
                <span className="hover:text-[#C2A383] transition-colors cursor-pointer">
                  Quy định bảo hành 24 tháng
                </span>
              </li>
              <li>
                <span className="hover:text-[#C2A383] transition-colors cursor-pointer">
                  Chính sách bảo mật thông tin
                </span>
              </li>
              <li>
                <Link to="/admin/cloudflare" className="text-[#C2A383] font-semibold hover:underline">
                  Thông tin triển khai Cloudflare D1
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Đăng ký nhận tin</h4>
            <p className="text-xs text-stone-300 mb-3 leading-relaxed">
              Nhận cẩm nang phối màu nội thất và ưu đãi voucher 200.000 ₫ cho đơn hàng đầu tiên.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bạn đã đăng ký thành công!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn..."
                    className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#C2A383]"
                  />
                  <button
                    type="submit"
                    aria-label="Gửi đăng ký"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-[#8B6245] hover:bg-[#C2A383] text-white rounded-lg transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Attribution for University Project */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            <p>© 2026 HomeDecor Shop. Bản quyền thuộc về Đồ án môn Điện toán đám mây.</p>
            <p className="text-stone-300 mt-0.5">
              Kiến trúc mục tiêu: Cloudflare Python Workers + Cloudflare D1 (SQLite) + Workers Static Assets.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[11px] text-[#C2A383]">
              Cloudflare Ready
            </span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[11px] text-stone-300">
              100% Tiếng Việt (VNĐ)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
