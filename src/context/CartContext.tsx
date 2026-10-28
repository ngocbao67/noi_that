import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { CartItem } from '../types';
import { getCart, addToCart, updateCartItemQuantity, removeCartItem, clearCart as clearCartApi } from '../api/cart';
import { calculateCartTotals } from '../utils/pricing';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (productId: string, quantity?: number, selectedColor?: string) => Promise<boolean>;
  updateQty: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  isFreeShipping: boolean;
  freeShippingGap: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const refreshCart = useCallback(async () => {
    try {
      const items = await getCart();
      setCart(items);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addItem = async (productId: string, quantity = 1, selectedColor?: string): Promise<boolean> => {
    const res = await addToCart(productId, quantity, selectedColor);
    setCart(res.cart);
    if (res.error) {
      showToast(res.error, 'error');
      return false;
    }
    showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    setIsOpen(true);
    return true;
  };

  const updateQty = async (itemId: string, quantity: number): Promise<boolean> => {
    const res = await updateCartItemQuantity(itemId, quantity);
    setCart(res.cart);
    if (res.error) {
      showToast(res.error, 'error');
      return false;
    }
    return true;
  };

  const removeItem = async (itemId: string) => {
    const updated = await removeCartItem(itemId);
    setCart(updated);
    showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  const clearCart = async () => {
    await clearCartApi();
    setCart([]);
  };

  const totals = useMemo(() => {
    const items = cart.map((i) => ({ price: i.product.price, quantity: i.quantity }));
    return calculateCartTotals(items);
  }, [cart]);

  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isLoading,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        itemCount,
        subtotal: totals.subtotal,
        shippingFee: totals.shippingFee,
        discount: totals.discount,
        total: totals.total,
        isFreeShipping: totals.isFreeShipping,
        freeShippingGap: totals.freeShippingGap,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
