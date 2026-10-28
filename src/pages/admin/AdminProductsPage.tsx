import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { Product, Category } from '../../types';
import { fetchAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct } from '../../api/admin';
import { fetchCategories } from '../../api/products';
import { formatVND } from '../../utils/pricing';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    categoryId: '',
    price: 0,
    originalPrice: 0,
    stock: 10,
    thumbnail: '',
    description: '',
    material: '',
    dimensions: '',
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([fetchAdminProducts(), fetchCategories()]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      slug: '',
      categoryId: categories[0]?.id || 'cat-sofa',
      price: 4500000,
      originalPrice: 5200000,
      stock: 10,
      thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      description: 'Mẫu nội thất thiết kế phong cách tối giản Bắc Âu...',
      material: 'Gỗ sồi tự nhiên, nỉ nhung cao cấp',
      dimensions: 'Dài 180cm x Rộng 80cm x Cao 75cm',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      slug: p.slug,
      categoryId: p.categoryId,
      price: p.price,
      originalPrice: p.originalPrice || 0,
      stock: p.stock,
      thumbnail: p.thumbnail,
      description: p.description,
      material: p.material,
      dimensions: p.dimensions,
      isActive: p.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.price <= 0) {
      showToast('Vui lòng nhập tên và giá bán hợp lệ', 'error');
      return;
    }

    const catName = categories.find((c) => c.id === form.categoryId)?.name || 'Nội thất';
    const slug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingProduct) {
      const res = await updateAdminProduct(editingProduct.id, {
        ...form,
        slug,
        categoryName: catName,
      });
      if (res.product) {
        showToast('Đã cập nhật thông tin sản phẩm!', 'success');
        await loadData();
        setIsModalOpen(false);
      }
    } else {
      const res = await createAdminProduct({
        ...form,
        slug,
        categoryName: catName,
        images: [form.thumbnail],
        rating: 5.0,
        reviewCount: 1,
        isFeatured: false,
        isNewArrival: true,
      });
      if (res.product) {
        showToast('Đã thêm sản phẩm mới vào kho D1!', 'success');
        await loadData();
        setIsModalOpen(false);
      }
    }
  };

  const handleToggleStatus = async (p: Product) => {
    const res = await updateAdminProduct(p.id, { isActive: !p.isActive });
    if (res.product) {
      showToast(`Đã ${!p.isActive ? 'hiển thị' : 'ẩn'} sản phẩm "${p.name}"`, 'info');
      await loadData();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi cơ sở dữ liệu?`)) return;
    const res = await deleteAdminProduct(id);
    if (res.success) {
      showToast('Đã xóa sản phẩm thành công', 'success');
      await loadData();
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'all' || p.categoryId === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#242424]">Quản lý Sản phẩm</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Tổng cộng: <strong className="text-[#8B6245]">{products.length}</strong> sản phẩm trong kho D1
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFE9E1] shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, mã SKU..."
            className="w-full pl-9 pr-4 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8B6245]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-stone-500 shrink-0">Danh mục:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            aria-label="Lọc theo danh mục sản phẩm"
            className="w-full sm:w-auto px-3 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424] focus:outline-none"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#EFE9E1] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#EFE9E1] bg-[#F8F6F2]/50 text-stone-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Sản phẩm</th>
                <th className="py-3.5 px-3">Danh mục</th>
                <th className="py-3.5 px-3">Giá bán</th>
                <th className="py-3.5 px-3">Tồn kho</th>
                <th className="py-3.5 px-3">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9E1]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-4 text-center text-stone-400">
                      Đang tải danh sách từ Cloudflare D1...
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    Không tìm thấy sản phẩm nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.thumbnail}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0 border border-[#EFE9E1]"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#242424] truncate max-w-xs">{prod.name}</p>
                          <p className="text-[10px] text-stone-400 font-mono uppercase">{prod.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[#242424] font-medium">{prod.categoryName}</td>
                    <td className="py-3.5 px-3 font-bold text-[#8B6245]">{formatVND(prod.price)}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`font-semibold ${
                          prod.stock <= 3 ? 'text-rose-600 font-bold' : 'text-stone-700'
                        }`}
                      >
                        {prod.stock} sp
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleToggleStatus(prod)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                          prod.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {prod.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{prod.isActive ? 'Đang bán' : 'Đang ẩn'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(prod)}
                          aria-label={`Sửa ${prod.name}`}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-[#8B6245] hover:bg-[#F8F6F2]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          aria-label={`Xóa ${prod.name}`}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE9E1]">
              <h2 className="text-lg font-bold font-display text-[#242424]">
                {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới vào kho'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#242424]">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: Sofa Băng Nordic Gỗ Sồi"
                  className="w-full px-4 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#242424]">Danh mục</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#242424]">Số lượng tồn kho</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#242424]">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="50000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#242424]">Giá niêm yết cũ (nếu có)</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#242424]">URL Hình ảnh đại diện</label>
                <input
                  type="url"
                  value={form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#242424]">Chất liệu</label>
                  <input
                    type="text"
                    value={form.material}
                    onChange={(e) => setForm({ ...form, material: e.target.value })}
                    placeholder="Gỗ sồi, nệm D40 bọc vải..."
                    className="w-full px-4 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#242424]">Kích thước</label>
                  <input
                    type="text"
                    value={form.dimensions}
                    onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                    placeholder="200cm x 85cm x 75cm"
                    className="w-full px-4 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#242424]">Mô tả sản phẩm</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EFE9E1]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-semibold shadow-md"
                >
                  {editingProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
