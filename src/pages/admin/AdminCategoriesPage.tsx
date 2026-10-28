import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Eye, EyeOff, X } from 'lucide-react';
import { Category } from '../../types';
import { fetchCategories } from '../../api/products';
import { saveAdminCategory } from '../../api/admin';
import { useToast } from '../../context/ToastContext';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', imageUrl: '', isActive: true });
  const { showToast } = useToast();

  const loadCategories = async () => {
    setLoading(true);
    const data = await fetchCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => {
    setEditingCat(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      imageUrl: cat.imageUrl,
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const slug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const res = await saveAdminCategory({
      id: editingCat?.id,
      ...form,
      slug,
    });

    if (res.category) {
      showToast(editingCat ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục mới', 'success');
      await loadCategories();
      setIsModalOpen(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    await saveAdminCategory({ id: cat.id, isActive: !cat.isActive });
    showToast(`Đã ${!cat.isActive ? 'kích hoạt' : 'ẩn'} danh mục ${cat.name}`, 'info');
    await loadCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#242424]">Quản lý Danh mục</h1>
          <p className="text-xs text-stone-500 mt-0.5">Phân cấp nhóm sản phẩm nội thất trên toàn bộ storefront</p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6245] hover:bg-[#724e35] text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-3xl h-48 border border-[#EFE9E1]" />
          ))
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border border-[#EFE9E1] p-5 shadow-sm hover:border-[#C2A383] transition-all flex flex-col justify-between"
            >
              <div className="flex gap-4">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-20 h-20 rounded-2xl object-cover bg-stone-100 shrink-0 border border-[#EFE9E1]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 font-mono uppercase">{cat.slug}</span>
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      {cat.isActive ? 'Hiển thị' : 'Ẩn'}
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-[#242424] font-display mt-1">{cat.name}</h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">{cat.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EFE9E1] mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8B6245]">
                  {cat.productCount || 0} sản phẩm liên kết
                </span>
                <button
                  onClick={() => openEdit(cat)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE9E1]">
              <h2 className="text-base font-bold font-display text-[#242424]">
                {editingCat ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#242424]">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: Ghế thư giãn"
                  className="w-full px-4 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#242424]">URL Hình ảnh đại diện</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#242424]">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#F8F6F2] border border-[#EFE9E1] rounded-xl text-xs text-[#242424]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EFE9E1]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B6245] text-white text-xs font-semibold shadow-md"
                >
                  Lưu danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
