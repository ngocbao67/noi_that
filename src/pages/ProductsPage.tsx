import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, RotateCcw, Search, ChevronDown, Check } from 'lucide-react';
import { Product, Category } from '../types';
import { fetchProducts, fetchCategories } from '../api/products';
import { ProductCard } from '../components/common/ProductCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const categorySlugParam = searchParams.get('category') || '';
  const queryParam = searchParams.get('q') || '';
  const sortParam = (searchParams.get('sort') as 'newest' | 'price_asc' | 'price_desc' | 'name_asc') || 'newest';
  const priceRangeParam = searchParams.get('priceRange') || 'all';
  const inStockParam = searchParams.get('inStock') === 'true';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const limit = 12;

  // Load categories
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Price range helper
  const getPriceBounds = (rangeKey: string) => {
    switch (rangeKey) {
      case 'under-3m':
        return { min: 0, max: 3000000 };
      case '3m-7m':
        return { min: 3000000, max: 7000000 };
      case '7m-15m':
        return { min: 7000000, max: 15000000 };
      case 'above-15m':
        return { min: 15000000, max: undefined };
      default:
        return { min: undefined, max: undefined };
    }
  };

  // Fetch products with real filtering
  useEffect(() => {
    setLoading(true);
    const { min, max } = getPriceBounds(priceRangeParam);

    fetchProducts({
      categorySlug: categorySlugParam || undefined,
      searchQuery: queryParam || undefined,
      minPrice: min,
      maxPrice: max,
      inStockOnly: inStockParam,
      sortBy: sortParam,
      page: pageParam,
      limit,
    }).then((res) => {
      setProducts(res.products);
      setTotal(res.total);
      setLoading(false);
    });
  }, [categorySlugParam, queryParam, sortParam, priceRangeParam, inStockParam, pageParam]);

  // Update query params helper
  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    // Reset to page 1 on filter changes (except page itself)
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const totalPages = Math.ceil(total / limit) || 1;

  // Find active category name
  const currentCategory = categories.find((c) => c.slug === categorySlugParam);
  const pageTitle = queryParam
    ? `Kết quả tìm kiếm cho "${queryParam}"`
    : currentCategory
    ? currentCategory.name
    : 'Tất cả sản phẩm nội thất';

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Sản phẩm', href: '/products' },
            ...(currentCategory ? [{ label: currentCategory.name }] : []),
            ...(queryParam ? [{ label: `Tìm kiếm: ${queryParam}` }] : []),
          ]}
        />

        {/* Page Title & Mobile Filter Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-[#242424] leading-tight">
              {pageTitle}
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Hiển thị <strong className="text-[#242424]">{products.length}</strong> trên{' '}
              <strong className="text-[#8B6245]">{total}</strong> sản phẩm hoàn thiện cao cấp
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Drawer Button */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EFE9E1] text-xs font-semibold text-[#242424] shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#8B6245]" />
              <span>Bộ lọc ({[categorySlugParam, priceRangeParam !== 'all', inStockParam].filter(Boolean).length})</span>
            </button>

            {/* Sorting Select */}
            <div className="relative">
              <select
                value={sortParam}
                onChange={(e) => updateParam('sort', e.target.value)}
                aria-label="Sắp xếp sản phẩm"
                className="appearance-none bg-white border border-[#EFE9E1] rounded-xl px-4 py-2.5 pr-9 text-xs font-semibold text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#8B6245] shadow-sm cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
                <option value="name_asc">Tên sản phẩm: A - Z</option>
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Main Content: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EFE9E1] shadow-sm sticky top-24 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#EFE9E1]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#8B6245]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#242424]">Bộ lọc tìm kiếm</h2>
                </div>
                {(categorySlugParam || priceRangeParam !== 'all' || inStockParam || queryParam) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-[#8B6245] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Danh mục</h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => updateParam('category', null)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      !categorySlugParam
                        ? 'bg-[#8B6245] text-white font-semibold'
                        : 'text-[#242424] hover:bg-[#F8F6F2]'
                    }`}
                  >
                    <span>Tất cả sản phẩm</span>
                    {!categorySlugParam && <Check className="w-3.5 h-3.5" />}
                  </button>
                  {categories.map((cat) => {
                    const isSelected = categorySlugParam === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => updateParam('category', cat.slug)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#8B6245] text-white font-semibold'
                            : 'text-[#242424] hover:bg-[#F8F6F2]'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="pt-4 border-t border-[#EFE9E1]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Khoảng giá</h3>
                <div className="space-y-2 text-xs">
                  {[
                    { id: 'all', label: 'Tất cả mức giá' },
                    { id: 'under-3m', label: 'Dưới 3.000.000 ₫' },
                    { id: '3m-7m', label: '3.000.000 ₫ - 7.000.000 ₫' },
                    { id: '7m-15m', label: '7.000.000 ₫ - 15.000.000 ₫' },
                    { id: 'above-15m', label: 'Trên 15.000.000 ₫' },
                  ].map((range) => (
                    <label
                      key={range.id}
                      className="flex items-center gap-2.5 cursor-pointer text-[#242424] hover:text-[#8B6245]"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        checked={priceRangeParam === range.id}
                        onChange={() => updateParam('priceRange', range.id)}
                        className="text-[#8B6245] focus:ring-[#8B6245] w-4 h-4 cursor-pointer"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* In-Stock Only */}
              <div className="pt-4 border-t border-[#EFE9E1]">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#242424]">
                  <input
                    type="checkbox"
                    checked={inStockParam}
                    onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : null)}
                    className="rounded text-[#8B6245] focus:ring-[#8B6245] w-4 h-4 cursor-pointer"
                  />
                  <span>Chỉ hiển thị sản phẩm còn hàng</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid & Pagination */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl h-80 border border-[#EFE9E1]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#EFE9E1] shadow-sm">
                <Search className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold font-display text-[#242424]">Không tìm thấy sản phẩm phù hợp</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Hãy thử điều chỉnh lại mức giá hoặc chọn danh mục khác để khám phá các mẫu nội thất tuyệt đẹp.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-6 px-6 py-2.5 bg-[#8B6245] text-white text-xs font-semibold rounded-xl hover:bg-[#724e35] transition-colors shadow-sm"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === pageParam;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => updateParam('page', pageNum.toString())}
                          className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-[#8B6245] text-white shadow-md'
                              : 'bg-white text-[#242424] border border-[#EFE9E1] hover:bg-stone-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-xs bg-white p-6 shadow-2xl z-10 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE9E1]">
                <h3 className="text-base font-bold font-display text-[#242424]">Bộ lọc sản phẩm</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="text-xs text-stone-500">
                  Đóng
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase text-stone-400 mb-2">Danh mục</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      updateParam('category', null);
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-full text-left py-1.5 text-xs text-[#242424]"
                  >
                    Tất cả danh mục
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        updateParam('category', c.slug);
                        setIsMobileFilterOpen(false);
                      }}
                      className="w-full text-left py-1.5 text-xs text-[#242424]"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-xs font-bold uppercase text-stone-400 mb-2">Khoảng giá</h4>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: 'all', label: 'Tất cả mức giá' },
                    { id: 'under-3m', label: 'Dưới 3.000.000 ₫' },
                    { id: '3m-7m', label: '3Tr - 7Tr ₫' },
                    { id: '7m-15m', label: '7Tr - 15Tr ₫' },
                    { id: 'above-15m', label: 'Trên 15.000.000 ₫' },
                  ].map((r) => (
                    <label key={r.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="priceRangeMobile"
                        checked={priceRangeParam === r.id}
                        onChange={() => {
                          updateParam('priceRange', r.id);
                          setIsMobileFilterOpen(false);
                        }}
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                handleResetFilters();
                setIsMobileFilterOpen(false);
              }}
              className="w-full py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-600"
            >
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
