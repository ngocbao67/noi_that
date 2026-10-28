import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { Product } from '../../types';
import { fetchProducts } from '../../api/products';
import { ProductCard } from '../common/ProductCard';

export const NewArrivals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ isNewArrival: true, limit: 8 }).then((res) => {
      setProducts(res.products);
      setLoading(false);
    });
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#EFE9E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 md:mb-14">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B6245] mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Vừa cập bến tuần này</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#242424]">
              Sản phẩm mới ra mắt
            </h2>
          </div>
          <Link
            to="/products?sort=newest"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#8B6245] text-[#8B6245] hover:bg-[#8B6245] hover:text-white transition-all text-xs font-semibold shadow-sm"
          >
            <span>Xem tất cả mẫu mới</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-stone-100 rounded-2xl h-80" />
              ))
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
};
