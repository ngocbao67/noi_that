import { Order, OrderItem } from '../types';
import { apiFetch, isPreviewEnvironment, STORAGE_KEYS } from './client';
import { INITIAL_ORDERS } from './mockData';
import { calculateCartTotals, generateOrderCode } from '../utils/pricing';
import { getCurrentUser } from './auth';

function getLocalOrders(): Order[] {
  const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_ORDERS;
  }
}

function saveLocalOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  notes?: string;
  paymentMethod: 'cod' | 'banking';
  items: { productId: string; quantity: number }[];
}

export async function createOrder(payload: CreateOrderPayload): Promise<{ order?: Order; error?: string }> {
  if (!payload.items || payload.items.length === 0) {
    return { error: 'Giỏ hàng của bạn đang trống.' };
  }
  if (!payload.customerName || !payload.customerPhone || !payload.shippingAddress || !payload.shippingCity) {
    return { error: 'Vui lòng điền đầy đủ thông tin giao nhận hàng.' };
  }

  const currentUser = await getCurrentUser();

  if (!isPreviewEnvironment()) {
    const res = await apiFetch<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.data) return { order: res.data };
    return { error: res.error || 'Đặt hàng không thành công' };
  }

  // Preview Mock Order Processing with DB integrity checks
  const productsRaw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  const products = productsRaw ? JSON.parse(productsRaw) : [];

  // Check inventory & calculate verified totals
  const verifiedOrderItems: OrderItem[] = [];
  const itemsForTotals: { price: number; quantity: number }[] = [];

  for (const item of payload.items) {
    const prod = products.find((p: { id: string }) => p.id === item.productId);
    if (!prod) {
      return { error: `Sản phẩm mã ${item.productId} không tồn tại trong hệ thống.` };
    }
    if (prod.stock < item.quantity) {
      return {
        error: `Sản phẩm "${prod.name}" chỉ còn ${prod.stock} chiếc trong kho (bạn đặt ${item.quantity}).`,
      };
    }

    const itemTotal = prod.price * item.quantity;
    itemsForTotals.push({ price: prod.price, quantity: item.quantity });
    verifiedOrderItems.push({
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderId: '',
      productId: prod.id,
      productName: prod.name,
      productImage: prod.thumbnail,
      price: prod.price,
      quantity: item.quantity,
      total: itemTotal,
    });
  }

  // Calculate pricing from verified database prices
  const totals = calculateCartTotals(itemsForTotals);

  // Decrement inventory atomically
  for (const item of payload.items) {
    const prodIndex = products.findIndex((p: { id: string }) => p.id === item.productId);
    if (prodIndex > -1) {
      products[prodIndex].stock -= item.quantity;
    }
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

  const orderId = `ord-${Date.now()}`;
  const orderCode = generateOrderCode();

  verifiedOrderItems.forEach((i) => (i.orderId = orderId));

  const newOrder: Order = {
    id: orderId,
    code: orderCode,
    userId: currentUser ? currentUser.id : 'guest-user',
    customerName: payload.customerName.trim(),
    customerPhone: payload.customerPhone.trim(),
    customerEmail: payload.customerEmail.trim(),
    shippingAddress: payload.shippingAddress.trim(),
    shippingCity: payload.shippingCity.trim(),
    notes: payload.notes?.trim() || '',
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentMethod === 'banking' ? 'paid' : 'unpaid',
    subtotal: totals.subtotal,
    shippingFee: totals.shippingFee,
    discount: totals.discount,
    total: totals.total,
    status: 'pending',
    items: verifiedOrderItems,
    createdAt: new Date().toISOString(),
  };

  const orders = getLocalOrders();
  orders.unshift(newOrder);
  saveLocalOrders(orders);

  // Clear local cart
  localStorage.removeItem(STORAGE_KEYS.CART);

  return { order: newOrder };
}

export async function fetchMyOrders(): Promise<Order[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  if (!isPreviewEnvironment()) {
    const res = await apiFetch<Order[]>('/api/orders');
    if (res.data) return res.data;
    return [];
  }

  const allOrders = getLocalOrders();
  // Filter only user's orders
  return allOrders.filter((o) => o.userId === currentUser.id);
}

export async function fetchOrderById(idOrCode: string): Promise<Order | null> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<Order>(`/api/orders/${idOrCode}`);
    if (res.data) return res.data;
    return null;
  }

  const allOrders = getLocalOrders();
  const order = allOrders.find((o) => o.id === idOrCode || o.code === idOrCode);
  return order || null;
}

export async function cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<{ success: boolean }>(`/api/orders/${orderId}/cancel`, {
      method: 'PATCH',
    });
    if (res.data) return { success: true };
    return { success: false, error: res.error };
  }

  const orders = getLocalOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) {
    return { success: false, error: 'Không tìm thấy đơn hàng.' };
  }

  const order = orders[index];
  if (order.status !== 'pending' && order.status !== 'confirmed') {
    return {
      success: false,
      error: 'Không thể hủy đơn hàng đang giao hoặc đã hoàn thành.',
    };
  }

  // Restore inventory
  const productsRaw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (productsRaw) {
    const products = JSON.parse(productsRaw);
    for (const item of order.items) {
      const prod = products.find((p: { id: string }) => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
      }
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  orders[index].status = 'cancelled';
  orders[index].updatedAt = new Date().toISOString();
  saveLocalOrders(orders);

  return { success: true };
}
