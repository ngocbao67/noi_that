import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Category } from '../../types';
import { fetchCategories } from '../../api/products';

export const FeaturedCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  return (
    <section className="py-16 md:py-24 bg-[#F8F6F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 md:mb-14">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B6245]">
              Bộ sưu tập theo danh mục
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#242424] mt-1">
              Khám phá từng không gian
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8B6245] hover:text-[#724e35] group"
          >
            <span>Xem tất cả danh mục</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3">
                  <div className="aspect-[4/5] bg-stone-200 rounded-2xl" />
                  <div className="h-4 bg-stone-200 rounded w-2/3" />
                </div>
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-[#EFE9E1] hover:border-[#C2A383] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/75 transition-colors" />

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-base font-bold font-display leading-tight group-hover:text-[#EFE9E1] transition-colors">
                        {cat.name}
                      </h3>
                      {cat.productCount && (
                        <p className="text-[11px] text-white/80 mt-0.5 font-medium">
                          {cat.productCount} sản phẩm
                        </p>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm text-[#242424] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};
