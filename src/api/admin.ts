import { AdminStats, Order, OrderStatus, Product, Category, User } from '../types';
import { apiFetch, isPreviewEnvironment, STORAGE_KEYS } from './client';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS, INITIAL_USERS } from './mockData';

function getLocalData() {
  const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || JSON.stringify(INITIAL_PRODUCTS));
  const categories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || JSON.stringify(INITIAL_CATEGORIES));
  const orders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || JSON.stringify(INITIAL_ORDERS));
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || JSON.stringify(INITIAL_USERS));
  return { products, categories, orders, users };
}

export async function fetchAdminStats(): Promise<AdminStats> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<AdminStats>('/api/admin/stats');
    if (res.data) return res.data;
  }

  const { products, categories, orders, users } = getLocalData();

  // Completed or confirmed revenue
  const revenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const monthlyRevenue = [
    { month: 'T05', revenue: 45000000, orders: 12 },
    { month: 'T06', revenue: 58000000, orders: 18 },
    { month: 'T07', revenue: 72000000, orders: 24 },
    { month: 'T08', revenue: 89000000, orders: 31 },
    { month: 'T09', revenue: 112000000, orders: 42 },
    { month: 'T10', revenue: revenue > 0 ? revenue : 138000000, orders: orders.length },
  ];

  const categoryDistribution = categories.map((cat) => ({
    name: cat.name,
    count: products.filter((p) => p.categoryId === cat.id).length,
  }));

  return {
    totalRevenue: revenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    totalUsers: users.length,
    pendingOrdersCount: pendingCount,
    recentOrders: orders.slice(0, 5),
    monthlyRevenue,
    categoryDistribution,
  };
}

export async function fetchAdminProducts(): Promise<Product[]> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<Product[]>('/api/admin/products');
    if (res.data) return res.data;
  }
  return getLocalData().products;
}

export async function createAdminProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<{ product?: Product; error?: string }> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<Product>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    if (res.data) return { product: res.data };
    return { error: res.error };
  }

  const { products } = getLocalData();
  const newProduct: Product = {
    ...productData,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  products.unshift(newProduct);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return { product: newProduct };
}

export async function updateAdminProduct(id: string, updates: Partial<Product>): Promise<{ product?: Product; error?: string }> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<Product>(`/api/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (res.data) return { product: res.data };
    return { error: res.error };
  }

  const { products } = getLocalData();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return { error: 'Không tìm thấy sản phẩm' };

  products[index] = { ...products[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return { product: products[index] };
}

export async function deleteAdminProduct(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<{ success: boolean }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });
    if (res.data) return { success: true };
    return { success: false, error: res.error };
  }

  const { products } = getLocalData();
  const filtered = products.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  return { success: true };
}

export async function fetchAdminOrders(): Promise<Order[]> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<Order[]>('/api/admin/orders');
    if (res.data) return res.data;
  }
  return getLocalData().orders;
}

export async function updateAdminOrderStatus(orderId: string, status: OrderStatus): Promise<{ order?: Order; error?: string }> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<Order>(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (res.data) return { order: res.data };
    return { error: res.error };
  }

  const { orders } = getLocalData();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return { error: 'Không tìm thấy đơn hàng' };

  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  if (status === 'completed') {
    orders[index].paymentStatus = 'paid';
  }
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  return { order: orders[index] };
}

export async function fetchAdminUsers(): Promise<User[]> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<User[]>('/api/admin/users');
    if (res.data) return res.data;
  }
  return getLocalData().users;
}

export async function saveAdminCategory(category: Partial<Category>): Promise<{ category?: Category; error?: string }> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<Category>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    if (res.data) return { category: res.data };
    return { error: res.error };
  }

  const { categories } = getLocalData();
  if (category.id) {
    const idx = categories.findIndex((c) => c.id === category.id);
    if (idx > -1) {
      categories[idx] = { ...categories[idx], ...category } as Category;
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return { category: categories[idx] };
    }
  }

  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: category.name || 'Danh mục mới',
    slug: category.slug || `danh-muc-${Date.now()}`,
    description: category.description || '',
    imageUrl: category.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  };
  categories.push(newCat);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  return { category: newCat };
}
