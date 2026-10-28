import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const CollectionBanners: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-[#F8F6F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Banner 1: Phòng khách hiện đại */}
          <div className="group relative rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] shadow-xl border border-[#EFE9E1]">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
              alt="Bộ sưu tập Phòng khách hiện đại"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 text-white space-y-3">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider inline-block">
                Bộ sưu tập đặc biệt
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display leading-tight">
                Phòng khách hiện đại
              </h3>
              <p className="text-xs sm:text-sm text-stone-200 max-w-md line-clamp-2">
                Không gian kết nối gia đình ấm cúng với những đường nét sofa băng êm ái cùng bàn trà mặt đá cẩm thạch kiêu hãnh.
              </p>
              <div className="pt-2">
                <Link
                  to="/products?category=sofa"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#242424] hover:bg-[#8B6245] hover:text-white transition-all text-xs font-bold shadow-md"
                >
                  <span>Khám phá phòng khách</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Banner 2: Phòng ngủ tối giản */}
          <div className="group relative rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] shadow-xl border border-[#EFE9E1]">
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
              alt="Bộ sưu tập Phòng ngủ tối giản"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 text-white space-y-3">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider inline-block">
                Xu hướng sống chậm
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display leading-tight">
                Phòng ngủ tối giản
              </h3>
              <p className="text-xs sm:text-sm text-stone-200 max-w-md line-clamp-2">
                Giường ngủ gỗ tự nhiên chuẩn Japandi thanh thoát, kiến tạo chốn nghỉ ngơi yên ả và giấc ngủ an lành trọn vẹn.
              </p>
              <div className="pt-2">
                <Link
                  to="/products?category=phong-ngu"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#242424] hover:bg-[#8B6245] hover:text-white transition-all text-xs font-bold shadow-md"
                >
                  <span>Khám phá phòng ngủ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
