import { Product, Category, ProductFilterParams } from '../types';
import { apiFetch, isPreviewEnvironment, STORAGE_KEYS } from './client';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './mockData';

function getLocalProducts(): Product[] {
  const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function getLocalCategories(): Category[] {
  const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export async function fetchProducts(params: ProductFilterParams = {}): Promise<{
  products: Product[];
  total: number;
  page: number;
  limit: number;
}> {
  if (!isPreviewEnvironment()) {
    const query = new URLSearchParams();
    if (params.categorySlug) query.append('category', params.categorySlug);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
    if (params.inStockOnly) query.append('inStock', 'true');
    if (params.sortBy) query.append('sort', params.sortBy);
    if (params.searchQuery) query.append('q', params.searchQuery);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const res = await apiFetch<{ products: Product[]; total: number; page: number; limit: number }>(
      `/api/products?${query.toString()}`
    );
    if (res.data) return res.data;
  }

  // Preview Mock Adapter with realistic D1 filtering simulation
  let list = [...getLocalProducts()].filter((p) => p.isActive);

  if (params.categorySlug) {
    const cat = getLocalCategories().find((c) => c.slug === params.categorySlug);
    if (cat) {
      list = list.filter((p) => p.categoryId === cat.id);
    }
  }

  if (params.categoryId) {
    list = list.filter((p) => p.categoryId === params.categoryId);
  }

  if (params.minPrice !== undefined) {
    list = list.filter((p) => p.price >= params.minPrice!);
  }

  if (params.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= params.maxPrice!);
  }

  if (params.inStockOnly) {
    list = list.filter((p) => p.stock > 0);
  }

  if (params.searchQuery) {
    const q = params.searchQuery.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (params.isFeatured) {
    list = list.filter((p) => p.isFeatured);
  }

  if (params.isNewArrival) {
    list = list.filter((p) => p.isNewArrival);
  }

  // Sorting
  if (params.sortBy === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (params.sortBy === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (params.sortBy === 'name_asc') {
    list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  } else {
    // newest default
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const page = params.page || 1;
  const limit = params.limit || 12;
  const total = list.length;
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  return {
    products: paginated,
    total,
    page,
    limit,
  };
}

export async function fetchProductById(idOrSlug: string): Promise<Product | null> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<Product>(`/api/products/${idOrSlug}`);
    if (res.data) return res.data;
  }

  const list = getLocalProducts();
  const product = list.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  return product || null;
}

export async function fetchCategories(): Promise<Category[]> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<Category[]>('/api/categories');
    if (res.data) return res.data;
  }

  return getLocalCategories().filter((c) => c.isActive);
}
