import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { fetchProducts } from '../api/products';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/common/ProductCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const WishlistPage: React.FC = () => {
  const { wishlistIds } = useWishlist();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ limit: 50 }).then((res) => {
      const filtered = res.products.filter((p) => wishlistIds.includes(p.id));
      setProducts(filtered);
      setLoading(false);
    });
  }, [wishlistIds]);

  const handleAddAllToCart = async () => {
    let count = 0;
    for (const p of products) {
      if (p.stock > 0) {
        await addItem(p.id, 1);
        count++;
      }
    }
    if (count > 0) {
      showToast(`Đã thêm ${count} sản phẩm yêu thích vào giỏ hàng!`, 'success');
    }
  };

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Danh sách yêu thích' }]} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-[#242424]">Sản phẩm yêu thích</h1>
            <p className="text-xs text-stone-500 mt-1">
              Bạn đang lưu {products.length} món đồ nội thất tâm đắc
            </p>
          </div>

          {products.length > 0 && (
            <button
              onClick={handleAddAllToCart}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Thêm tất cả vào giỏ hàng</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-80 border border-[#EFE9E1]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-[#EFE9E1] shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-display text-[#242424] mb-2">Chưa có sản phẩm yêu thích nào</h2>
            <p className="text-xs text-stone-500 mb-6">
              Bấm vào biểu tượng trái tim ở bất kỳ sản phẩm nào để lưu lại danh sách các mẫu nội thất bạn quan tâm.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#8B6245] text-white text-xs font-semibold rounded-xl hover:bg-[#724e35] transition-colors"
            >
              <span>Khám phá sản phẩm</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
