import React from 'react';
import { Award, Compass, Truck, Headset } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const reasons = [
    {
      icon: Award,
      title: 'Chất lượng đảm bảo',
      description:
        'Sử dụng 100% gỗ sồi, óc chó tuyển chọn loại FAS và da tự nhiên cao cấp, cam kết độ bền trên 10 năm sử dụng.',
    },
    {
      icon: Compass,
      title: 'Thiết kế hiện đại',
      description:
        'Đường nét tối giản Bắc Âu và Japandi thời thượng, tôn vinh cá tính gia chủ và không bao giờ lỗi mốt theo thời gian.',
    },
    {
      icon: Truck,
      title: 'Hỗ trợ giao hàng & lắp đặt',
      description:
        'Đội ngũ kỹ thuật viên tận nhà giao hàng, khiêng vác và lắp ráp hoàn chỉnh, hỗ trợ thu dọn bao bì sạch sẽ.',
    },
    {
      icon: Headset,
      title: 'Tư vấn tận tâm 24/7',
      description:
        'Kiến trúc sư nội thất sẵn sàng tư vấn phối cảnh 3D và gợi ý kích thước chuẩn phong thủy hoàn toàn miễn phí.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#EFE9E1]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B6245]">
            Giá trị cốt lõi
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#242424] mt-1.5">
            Lý do chọn HomeDecor Shop
          </h2>
          <p className="text-sm text-stone-600 mt-3 leading-relaxed">
            Chúng tôi không chỉ bán nội thất, chúng tôi cùng bạn kiến tạo nên tổ ấm đong đầy cảm xúc và sự bình yên sau mỗi ngày dài.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white border border-[#EFE9E1] hover:border-[#C2A383] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#F8F6F2] text-[#8B6245] flex items-center justify-center mb-6 shadow-inner">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-[#242424] font-display mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
