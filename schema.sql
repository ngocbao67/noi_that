-- ============================================================================
-- ĐỒ ÁN ĐIỆN TOÁN ĐÁM MÂY: WEBSITE THƯƠNG MẠI ĐIỆN TỬ HOMEDECOR SHOP
-- CƠ SỞ DỮ LIỆU CLOUDFLARE D1 (SQLITE SERVERLESS)
-- FILE: schema.sql
-- ============================================================================

-- BẬT RÀNG BUỘC KHÓA NGOẠI (FOREIGN KEYS)
PRAGMA foreign_keys = ON;

-- 1. BẢNG NGƯỜI DÙNG (USERS)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
  phone TEXT,
  address TEXT,
  city TEXT DEFAULT 'Hà Nội',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG PHIÊN ĐĂNG NHẬP (USER_SESSIONS)
CREATE TABLE IF NOT EXISTS user_sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. BẢNG DANH MỤC NỘI THẤT (CATEGORIES)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. BẢNG SẢN PHẨM NỘI THẤT (PRODUCTS)
-- Lưu ý: Giá tiền price & original_price lưu dạng INTEGER VNĐ (Ví dụ: 4500000)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  price INTEGER NOT NULL CHECK(price >= 0),
  original_price INTEGER CHECK(original_price IS NULL OR original_price >= price),
  stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
  thumbnail TEXT NOT NULL,
  description TEXT NOT NULL,
  material TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  is_featured INTEGER DEFAULT 0 CHECK(is_featured IN (0, 1)),
  is_new_arrival INTEGER DEFAULT 0 CHECK(is_new_arrival IN (0, 1)),
  is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
  rating REAL DEFAULT 5.0 CHECK(rating >= 0 AND rating <= 5.0),
  review_count INTEGER DEFAULT 0 CHECK(review_count >= 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. BẢNG HÌNH ẢNH SẢN PHẨM (PRODUCT_IMAGES)
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG GIỎ HÀNG (CARTS)
CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. BẢNG CHI TIẾT GIỎ HÀNG (CART_ITEMS)
CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
  selected_color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cart_id, product_id)
);

-- 8. BẢNG ĐƠN HÀNG (ORDERS)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  notes TEXT,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('cod', 'banking')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid', 'paid')),
  subtotal INTEGER NOT NULL CHECK(subtotal >= 0),
  shipping_fee INTEGER NOT NULL DEFAULT 0 CHECK(shipping_fee >= 0),
  discount INTEGER NOT NULL DEFAULT 0 CHECK(discount >= 0),
  total INTEGER NOT NULL CHECK(total >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'shipping', 'completed', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. BẢNG CHI TIẾT ĐƠN HÀNG (ORDER_ITEMS)
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL,
  price INTEGER NOT NULL CHECK(price >= 0),
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  total INTEGER NOT NULL CHECK(total >= 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. BẢNG YÊU THÍCH (FAVORITES)
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- ============================================================================
-- CÁC INDEX TỐI ƯU HÓA TRUY VẤN (INDEXES)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
