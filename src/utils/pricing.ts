/**
 * Business logic utilities for pricing, currencies, discounts, and inventory validation.
 */

export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 ₫';
  }
  // Formats to 4.500.000 ₫
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ₫';
}

export function calculateDiscountPercent(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  return Math.min(Math.max(discount, 0), 99);
}

export interface CartTotalsResult {
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  isFreeShipping: boolean;
  freeShippingGap: number;
}

export function calculateCartTotals(
  items: { price: number; quantity: number }[],
  shippingThreshold = 3000000, // Miễn phí vận chuyển cho đơn trên 3.000.000 ₫
  flatShipping = 150000,       // Phí ship tiêu chuẩn đồ nội thất 150.000 ₫
  discountAmount = 0
): CartTotalsResult {
  const subtotal = items.reduce((acc, item) => acc + (item.price * Math.max(0, item.quantity)), 0);
  
  if (subtotal === 0) {
    return {
      subtotal: 0,
      shippingFee: 0,
      discount: 0,
      total: 0,
      isFreeShipping: true,
      freeShippingGap: 0,
    };
  }

  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingFee = isFreeShipping ? 0 : flatShipping;
  const freeShippingGap = Math.max(0, shippingThreshold - subtotal);
  const discount = Math.min(discountAmount, subtotal);
  const total = Math.max(0, subtotal + shippingFee - discount);

  return {
    subtotal,
    shippingFee,
    discount,
    total,
    isFreeShipping,
    freeShippingGap,
  };
}

export function validateStock(
  requestedQty: number,
  availableStock: number
): { valid: boolean; adjustedQty: number; message?: string } {
  if (availableStock <= 0) {
    return {
      valid: false,
      adjustedQty: 0,
      message: 'Sản phẩm hiện đang tạm hết hàng.',
    };
  }
  if (requestedQty <= 0) {
    return {
      valid: false,
      adjustedQty: 1,
      message: 'Số lượng tối thiểu là 1.',
    };
  }
  if (requestedQty > availableStock) {
    return {
      valid: false,
      adjustedQty: availableStock,
      message: `Chỉ còn ${availableStock} sản phẩm trong kho.`,
    };
  }
  return {
    valid: true,
    adjustedQty: requestedQty,
  };
}

export function generateOrderCode(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HD${year}${month}${day}-${randomChars}`;
}
