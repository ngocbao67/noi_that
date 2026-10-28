import { CartItem } from '../types';
import { apiFetch, isPreviewEnvironment, STORAGE_KEYS } from './client';
import { fetchProductById } from './products';
import { validateStock } from '../utils/pricing';

function getLocalCart(): CartItem[] {
  const saved = localStorage.getItem(STORAGE_KEYS.CART);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
}

export async function getCart(): Promise<CartItem[]> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<CartItem[]>('/api/cart');
    if (res.data) return res.data;
  }
  return getLocalCart();
}

export async function addToCart(
  productId: string,
  quantity = 1,
  selectedColor?: string
): Promise<{ cart: CartItem[]; error?: string }> {
  const product = await fetchProductById(productId);
  if (!product) {
    return { cart: getLocalCart(), error: 'Không tìm thấy sản phẩm.' };
  }

  if (product.stock <= 0) {
    return { cart: getLocalCart(), error: 'Sản phẩm này hiện đang hết hàng.' };
  }

  if (!isPreviewEnvironment()) {
    const res = await apiFetch<CartItem[]>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, selectedColor }),
    });
    if (res.data) return { cart: res.data };
    return { cart: getLocalCart(), error: res.error };
  }

  const currentCart = getLocalCart();
  const existingIndex = currentCart.findIndex((item) => item.productId === productId);

  if (existingIndex > -1) {
    const newQty = currentCart[existingIndex].quantity + quantity;
    const stockCheck = validateStock(newQty, product.stock);
    if (!stockCheck.valid && stockCheck.adjustedQty <= currentCart[existingIndex].quantity) {
      return {
        cart: currentCart,
        error: `Rất tiếc! Số lượng trong giỏ (${currentCart[existingIndex].quantity}) đã đạt mức tồn kho tối đa (${product.stock}).`,
      };
    }
    currentCart[existingIndex].quantity = stockCheck.adjustedQty;
  } else {
    const stockCheck = validateStock(quantity, product.stock);
    currentCart.push({
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId,
      product,
      quantity: stockCheck.adjustedQty,
      selectedColor,
    });
  }

  saveLocalCart(currentCart);
  return { cart: currentCart };
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<{ cart: CartItem[]; error?: string }> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<CartItem[]>(`/api/cart/items/${cartItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
    if (res.data) return { cart: res.data };
    return { cart: getLocalCart(), error: res.error };
  }

  let cart = getLocalCart();
  const itemIndex = cart.findIndex((i) => i.id === cartItemId);
  if (itemIndex === -1) return { cart };

  if (quantity <= 0) {
    cart = cart.filter((i) => i.id !== cartItemId);
    saveLocalCart(cart);
    return { cart };
  }

  const product = await fetchProductById(cart[itemIndex].productId);
  if (product) {
    const check = validateStock(quantity, product.stock);
    cart[itemIndex].quantity = check.adjustedQty;
    saveLocalCart(cart);
    if (!check.valid) {
      return { cart, error: check.message };
    }
  }

  saveLocalCart(cart);
  return { cart };
}

export async function removeCartItem(cartItemId: string): Promise<CartItem[]> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<CartItem[]>(`/api/cart/items/${cartItemId}`, {
      method: 'DELETE',
    });
    if (res.data) return res.data;
  }

  const cart = getLocalCart().filter((i) => i.id !== cartItemId);
  saveLocalCart(cart);
  return cart;
}

export async function clearCart(): Promise<void> {
  if (!isPreviewEnvironment()) {
    await apiFetch('/api/cart/clear', { method: 'POST' });
  }
  localStorage.removeItem(STORAGE_KEYS.CART);
}
