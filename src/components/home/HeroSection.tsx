import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Award } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#F8F6F2] py-12 md:py-20 lg:py-28">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 w-[500px] h-[500px] bg-[#EFE9E1] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-1/4 w-[400px] h-[400px] bg-[#C2A383]/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE9E1] text-[#8B6245] border border-[#C2A383]/40 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#8B6245]" />
              <span>Bộ sưu tập Mùa Thu 2026 • Scandinavian & Japandi</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#242424] font-display leading-[1.15]">
              Biến ngôi nhà thành <br />
              <span className="text-[#8B6245] italic font-serif">không gian bạn yêu thích</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
              Khám phá những mẫu bàn ghế, sofa, giường ngủ và đèn trang trí được chế tác tinh xảo từ gỗ tự nhiên. Mỗi sản phẩm là sự kết hợp hài hòa giữa thẩm mỹ tối giản và công năng sống tiện nghi.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#8B6245] hover:bg-[#724e35] text-white text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products?category=sofa"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-[#242424] text-sm font-semibold border border-[#EFE9E1] hover:border-[#C2A383] transition-all shadow-sm"
              >
                <span>Xem bộ sưu tập</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 border-t border-[#EFE9E1] grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-display text-[#8B6245]">100%</p>
                <p className="text-xs text-stone-500 mt-0.5">Gỗ sồi sấy nhập khẩu</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-display text-[#8B6245]">24T</p>
                <p className="text-xs text-stone-500 mt-0.5">Bảo hành khung sườn</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-display text-[#8B6245]">0₫</p>
                <p className="text-xs text-stone-500 mt-0.5">Phí ship đơn từ 3Tr</p>
              </div>
            </div>
          </div>

          {/* Right Column Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Visual Image with organic rounded corners */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-stone-100 group">
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=85"
                  alt="Không gian phòng khách Bắc Âu HomeDecor"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Floating Tag inside picture */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-[#EFE9E1] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B6245]">
                      Mẫu thiết kế tâm điểm
                    </span>
                    <h3 className="text-sm font-bold text-[#242424]">Nordic Living Room Set</h3>
                    <p className="text-xs text-stone-500">Gỗ sồi Bắc Âu & Nỉ nhung</p>
                  </div>
                  <Link
                    to="/products/sofa-bang-nordic-may-tre"
                    className="p-2.5 rounded-xl bg-[#8B6245] text-white hover:bg-[#724e35] transition-colors"
                    aria-label="Xem sản phẩm tâm điểm"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Small floating badge */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-[#EFE9E1] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#242424]">Top 1 Thiết kế</p>
                  <p className="text-[10px] text-stone-500">Tối giản Scandinavia 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
