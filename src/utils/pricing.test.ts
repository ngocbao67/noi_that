import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatVND,
  calculateDiscountPercent,
  calculateCartTotals,
  validateStock,
  generateOrderCode
} from './pricing';

test('formatVND formats Vietnamese currency with symbol', () => {
  assert.equal(formatVND(4500000), '4.500.000 ₫');
  assert.equal(formatVND(0), '0 ₫');
  assert.equal(formatVND(1250000.4), '1.250.000 ₫');
});

test('calculateDiscountPercent returns accurate discount percentage', () => {
  assert.equal(calculateDiscountPercent(4000000, 5000000), 20);
  assert.equal(calculateDiscountPercent(5000000, 5000000), 0);
  assert.equal(calculateDiscountPercent(6000000, 5000000), 0);
  assert.equal(calculateDiscountPercent(4500000, undefined), 0);
});

test('calculateCartTotals calculates subtotal, free shipping, and totals', () => {
  // Free shipping threshold = 3.000.000 ₫
  const underThreshold = calculateCartTotals([
    { price: 1000000, quantity: 2 } // 2.000.000 ₫
  ]);
  assert.equal(underThreshold.subtotal, 2000000);
  assert.equal(underThreshold.shippingFee, 150000);
  assert.equal(underThreshold.total, 2150000);
  assert.equal(underThreshold.isFreeShipping, false);
  assert.equal(underThreshold.freeShippingGap, 1000000);

  const overThreshold = calculateCartTotals([
    { price: 2000000, quantity: 2 } // 4.000.000 ₫
  ]);
  assert.equal(overThreshold.subtotal, 4000000);
  assert.equal(overThreshold.shippingFee, 0);
  assert.equal(overThreshold.total, 4000000);
  assert.equal(overThreshold.isFreeShipping, true);
});

test('validateStock catches out-of-stock and quantities exceeding inventory', () => {
  const inStock = validateStock(2, 10);
  assert.equal(inStock.valid, true);
  assert.equal(inStock.adjustedQty, 2);

  const outOfStock = validateStock(1, 0);
  assert.equal(outOfStock.valid, false);
  assert.equal(outOfStock.adjustedQty, 0);

  const exceeding = validateStock(8, 3);
  assert.equal(exceeding.valid, false);
  assert.equal(exceeding.adjustedQty, 3);
});

test('generateOrderCode outputs format starting with HD', () => {
  const code = generateOrderCode();
  assert.match(code, /^HD\d{6}-[A-Z0-9]{4}$/);
});
