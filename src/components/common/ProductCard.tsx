import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../../types';
import { formatVND, calculateDiscountPercent } from '../../utils/pricing';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isAdding, setIsAdding] = React.useState(false);

  const discountPercent = calculateDiscountPercent(product.price, product.originalPrice);
  const wishlisted = isWishlisted(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    await addItem(product.id, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id, product.name);
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#EFE9E1] hover:border-[#C2A383]/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] bg-[#EFE9E1]/50 overflow-hidden">
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={product.thumbnail}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 text-xs font-bold tracking-wide text-white bg-[#8B6245] rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2.5 py-1 text-xs font-semibold text-[#8B6245] bg-[#EFE9E1] rounded-full shadow-sm border border-[#C2A383]/40">
              Mới
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 rounded-full shadow-sm border border-rose-200">
              Hết hàng
            </span>
          )}
        </div>

        {/* Floating Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={handleToggleWishlist}
            aria-label={wishlisted ? 'Bỏ yêu thích' : 'Yêu thích'}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
              wishlisted
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-white/90 text-[#242424] hover:text-rose-600 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
          <Link
            to={`/products/${product.slug}`}
            aria-label="Xem chi tiết nhanh"
            className="p-2 rounded-full bg-white/90 text-[#242424] hover:text-[#8B6245] hover:bg-white backdrop-blur-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="text-xs uppercase tracking-wider text-[#8B6245] font-semibold mb-1">
          {product.categoryName || 'Nội thất cao cấp'}
        </div>

        <Link
          to={`/products/${product.slug}`}
          className="text-base font-medium text-[#242424] line-clamp-2 hover:text-[#8B6245] transition-colors mb-2 leading-snug"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3 text-xs text-[#242424]/70">
          <div className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="font-semibold text-[#242424]">{product.rating.toFixed(1)}</span>
          <span>({product.reviewCount})</span>
          <span className="text-stone-300">•</span>
          <span className={product.stock > 0 ? 'text-emerald-700' : 'text-stone-400'}>
            {product.stock > 0 ? `Còn ${product.stock} sp` : 'Hết hàng'}
          </span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-3 border-t border-[#EFE9E1] flex items-center justify-between gap-2">
          <div>
            <div className="text-lg font-bold text-[#8B6245]">
              {formatVND(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-stone-600 line-through">
                {formatVND(product.originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : isAdding
                ? 'bg-emerald-600 text-white'
                : 'bg-[#8B6245] hover:bg-[#724e35] text-white hover:shadow-md'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAdding ? 'Đã thêm' : 'Thêm giỏ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
