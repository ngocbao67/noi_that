import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Compass, Heart, Leaf, Cloud, Database, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#F8F6F2] min-h-screen py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Giới thiệu' }]} />

        {/* Hero Brand Story */}
        <div className="text-center max-w-3xl mx-auto my-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B6245]">
            Câu chuyện thương hiệu
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-[#242424] leading-tight">
            Kiến tạo không gian sống <br />
            <span className="text-[#8B6245] italic font-serif">đong đầy an yên</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed pt-2">
            HomeDecor Shop ra đời với khát vọng mang đến những món đồ nội thất gỗ tự nhiên tinh xảo, giao thoa giữa sự ấm áp của phong cách Bắc Âu (Scandinavia) và triết lý thiền định, tôn trọng tự nhiên của trường phái Nhật Bản (Japandi).
          </p>
        </div>

        {/* Editorial Photo Showcase */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[21/9] sm:aspect-[16/7] my-10 bg-stone-100">
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=85"
            alt="Xưởng thủ công HomeDecor"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
          <div className="p-8 rounded-3xl bg-white border border-[#EFE9E1] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F6F2] text-[#8B6245] flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-[#242424]">Gỗ bền vững có chứng chỉ</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              100% gỗ sồi trắng, óc chó và tần bì đều có chứng chỉ rừng trồng bền vững FSC. Bề mặt sơn lau dầu gốc thực vật không chứa chì độc hại.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#EFE9E1] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F6F2] text-[#8B6245] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-[#242424]">Bàn tay nghệ nhân Việt</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Từng mối ghép mộng âm dương, từng đường chỉ may nỉ nhung và bề mặt đan mây mắt cáo đều được chăm chút bởi nghệ nhân làng nghề truyền thống.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#EFE9E1] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F6F2] text-[#8B6245] flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-[#242424]">Bảo hành an tâm 24 tháng</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Chính sách bảo hành tận nhà 24 tháng cho toàn bộ kết cấu khung gỗ và hỗ trợ bảo trì đánh bóng trọn đời sử dụng sản phẩm.
            </p>
          </div>
        </div>

        {/* Special Section: Đề tài Điện toán đám mây & Kiến trúc Cloudflare */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#242424] to-[#362f2d] text-white border border-[#8B6245]/40 shadow-xl my-12">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C2A383] text-xs font-semibold">
              <Cloud className="w-4 h-4" />
              <span>Đồ án môn Điện toán đám mây</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Kiến trúc triển khai Serverless trên Cloudflare
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Dự án website HomeDecor Shop được nghiên cứu và thiết kế tối ưu hóa toàn diện trên hệ sinh thái Cloudflare Edge:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <strong className="text-[#C2A383] block">1. Cloudflare Python Workers</strong>
                <p className="text-stone-300">
                  Xử lý REST API không phụ thuộc server Node.js truyền thống, khởi động micro-second tại hơn 300+ PoP toàn cầu.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <strong className="text-[#C2A383] block">2. Cloudflare D1 (SQLite Database)</strong>
                <p className="text-stone-300">
                  Cơ sở dữ liệu quan hệ Serverless chuẩn ACID, đảm bảo trừ tồn kho và tạo đơn hàng nhất quán, độ trễ cực thấp.
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Link
                to="/admin/cloudflare"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6245] hover:bg-[#C2A383] text-white text-xs font-semibold transition-colors"
              >
                <span>Xem chi tiết Schema D1 & Bảng định tuyến Python</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
