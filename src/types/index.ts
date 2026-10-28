export type Role = 'guest' | 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
  city?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl: string;
  isActive: boolean;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  thumbnail: string;
  description: string;
  material: string;
  dimensions: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  tags?: string[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  code: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  notes?: string;
  paymentMethod: 'cod' | 'banking';
  paymentStatus: 'unpaid' | 'paid';
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface ProductFilterParams {
  categorySlug?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
  searchQuery?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrdersCount: number;
  recentOrders: Order[];
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  categoryDistribution: { name: string; count: number }[];
}
