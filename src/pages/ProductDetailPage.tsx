import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  RotateCcw,
  Ruler,
  Layers,
  Check,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { fetchProductById, fetchProducts } from '../api/products';
import { formatVND, calculateDiscountPercent } from '../utils/pricing';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping'>('desc');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductById(slug).then((prod) => {
      if (prod) {
        setProduct(prod);
        setSelectedImage(prod.images[0] || prod.thumbnail);
        setQuantity(1);

        // Fetch related products in the same category
        fetchProducts({ categoryId: prod.categoryId, limit: 4 }).then((res) => {
          setRelatedProducts(res.products.filter((p) => p.id !== prod.id).slice(0, 4));
        });
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-stone-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-6 bg-stone-200 rounded w-1/3" />
            <div className="h-24 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-display text-[#242424] mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-sm text-stone-500 mb-6">Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không hợp lệ.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8B6245] text-white text-xs font-semibold"
        >
          <span>Khám phá sản phẩm khác</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const discountPercent = calculateDiscountPercent(product.price, product.originalPrice);
  const isOutOfStock = product.stock <= 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    await addItem(product.id, quantity);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await addItem(product.id, quantity);
    navigate('/checkout');
  };

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Sản phẩm', href: '/products' },
            { label: product.categoryName || 'Danh mục', href: `/products?category=${product.categoryId}` },
            { label: product.name },
          ]}
        />

        {/* 2-Column Product Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-4 bg-white p-6 sm:p-10 rounded-3xl border border-[#EFE9E1] shadow-sm">
          {/* Column 1: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Showcase Image */}
            <div className="relative aspect-[4/3] sm:aspect-square bg-[#F8F6F2] rounded-2xl overflow-hidden border border-[#EFE9E1]">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-bold text-white bg-[#8B6245] rounded-full shadow-md">
                  Giảm {discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img
                        ? 'border-[#8B6245] shadow-md scale-95'
                        : 'border-[#EFE9E1] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} - ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Information & Purchase Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B6245]">
                  {product.categoryName}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    product.stock > 0
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : 'Tạm hết hàng'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-[#242424] leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-stone-300'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-[#242424]">{product.rating.toFixed(1)}</span>
                <span>•</span>
                <span>{product.reviewCount} đánh giá từ khách hàng</span>
              </div>

              {/* Price */}
              <div className="p-4 rounded-2xl bg-[#F8F6F2] border border-[#EFE9E1] flex items-baseline gap-3">
                <span className="text-3xl font-bold font-display text-[#8B6245]">
                  {formatVND(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatVND(product.originalPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md ml-auto">
                    Tiết kiệm {formatVND(product.originalPrice! - product.price)}
                  </span>
                )}
              </div>

              {/* Quick Specs Pill Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#F8F6F2]/70 border border-[#EFE9E1] flex items-start gap-2.5">
                  <Layers className="w-4 h-4 text-[#8B6245] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-stone-500 font-medium">Vật liệu chính</p>
                    <p className="text-xs font-semibold text-[#242424] line-clamp-1">{product.material}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F6F2]/70 border border-[#EFE9E1] flex items-start gap-2.5">
                  <Ruler className="w-4 h-4 text-[#8B6245] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-stone-500 font-medium">Kích thước</p>
                    <p className="text-xs font-semibold text-[#242424] line-clamp-1">{product.dimensions}</p>
                  </div>
                </div>
              </div>

              {/* Quantity Stepper & Stock Warning */}
              <div className="pt-2">
                <label className="text-xs font-bold text-[#242424] uppercase tracking-wider block mb-2">
                  Số lượng mua
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-[#C2A383]/60 rounded-xl bg-white overflow-hidden shadow-sm">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={isOutOfStock || quantity <= 1}
                      aria-label="Giảm số lượng"
                      className="p-2.5 hover:bg-stone-100 text-stone-600 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-5 text-sm font-bold text-[#242424]">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={isOutOfStock || quantity >= product.stock}
                      aria-label="Tăng số lượng"
                      className="p-2.5 hover:bg-stone-100 text-stone-600 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-xs text-stone-500">
                    {product.stock > 0 ? `Tối đa ${product.stock} chiếc` : 'Hết hàng'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add to Cart, Buy Now, Wishlist */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding}
                  className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    isOutOfStock
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : isAdding
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#8B6245] hover:bg-[#724e35] text-white hover:shadow-lg'
                  }`}
                >
                  {isAdding ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  <span>{isAdding ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-semibold text-xs border border-[#8B6245] text-[#8B6245] hover:bg-[#8B6245] hover:text-white transition-all text-center disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  Mua ngay
                </button>

                <button
                  onClick={() => toggleWishlist(product.id, product.name)}
                  aria-label={wishlisted ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
                  className={`p-3.5 rounded-xl border transition-all ${
                    wishlisted
                      ? 'bg-rose-50 text-rose-600 border-rose-300'
                      : 'border-[#EFE9E1] text-[#242424] hover:text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Guarantees Box */}
              <div className="pt-4 border-t border-[#EFE9E1] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#8B6245] shrink-0" />
                  <span>Giao hàng toàn quốc</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#8B6245] shrink-0" />
                  <span>Bảo hành 24 tháng</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#8B6245] shrink-0" />
                  <span>Đổi trả trong 30 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Product Details */}
        <div className="mt-12 bg-white rounded-3xl border border-[#EFE9E1] p-6 sm:p-10 shadow-sm">
          {/* Tab Headers */}
          <div className="flex items-center gap-6 border-b border-[#EFE9E1] pb-4 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-2 transition-all relative ${
                activeTab === 'desc' ? 'text-[#8B6245]' : 'text-stone-400 hover:text-[#242424]'
              }`}
            >
              Mô tả chi tiết
              {activeTab === 'desc' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8B6245]" />}
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2 transition-all relative ${
                activeTab === 'specs' ? 'text-[#8B6245]' : 'text-stone-400 hover:text-[#242424]'
              }`}
            >
              Vật liệu & Kích thước
              {activeTab === 'specs' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8B6245]" />}
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-2 transition-all relative ${
                activeTab === 'shipping' ? 'text-[#8B6245]' : 'text-stone-400 hover:text-[#242424]'
              }`}
            >
              Chính sách giao vận & Bảo hành
              {activeTab === 'shipping' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8B6245]" />}
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-6">
            {activeTab === 'desc' && (
              <div className="space-y-4 text-sm text-stone-600 leading-relaxed max-w-3xl">
                <p>{product.description}</p>
                <p>
                  Sản phẩm thuộc dòng nội thất chủ đạo của HomeDecor Shop, được các nghệ nhân mộc lành nghề chế tác tỉ mỉ từng mối ghép mộng âm dương truyền thống kết hợp công nghệ CNC hiện đại. Bề mặt gỗ được hoàn thiện bằng dầu lau tự nhiên không chứa chất độc hại, thân thiện tuyệt đối với trẻ em và thú cưng.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-2xl">
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-[#EFE9E1]">
                    <tr className="py-2.5">
                      <td className="py-3 font-semibold text-stone-500 w-1/3">Chất liệu chính</td>
                      <td className="py-3 text-[#242424] font-medium">{product.material}</td>
                    </tr>
                    <tr className="py-2.5">
                      <td className="py-3 font-semibold text-stone-500">Kích thước chuẩn</td>
                      <td className="py-3 text-[#242424] font-medium">{product.dimensions}</td>
                    </tr>
                    <tr className="py-2.5">
                      <td className="py-3 font-semibold text-stone-500">Mã SKU</td>
                      <td className="py-3 text-[#242424] font-medium uppercase">{product.id}</td>
                    </tr>
                    <tr className="py-2.5">
                      <td className="py-3 font-semibold text-stone-500">Xuất xứ</td>
                      <td className="py-3 text-[#242424] font-medium">Việt Nam (Tiêu chuẩn xuất khẩu Bắc Âu)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-3 text-xs text-stone-600 leading-relaxed max-w-2xl">
                <p>
                  <strong>• Thời gian giao hàng:</strong> 1 - 2 ngày làm việc tại khu vực Hà Nội & TP. Hồ Chí Minh; 3 - 5 ngày đối với các tỉnh thành khác.
                </p>
                <p>
                  <strong>• Lắp đặt tận nhà:</strong> Kỹ thuật viên của HomeDecor sẽ hỗ trợ lắp đặt, kê vào đúng vị trí bạn yêu cầu và kiểm tra cân bằng chân trước khi bàn giao.
                </p>
                <p>
                  <strong>• Bảo hành 24 tháng:</strong> Áp dụng cho kết cấu khung gỗ, phụ kiện ray trượt bản lề. Bảo trì trọn đời sản phẩm.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold font-display text-[#242424] mb-8">
              Sản phẩm tương tự bạn có thể thích
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
