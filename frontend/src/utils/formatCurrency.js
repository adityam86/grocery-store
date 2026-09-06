/**
 * Format a number as Indian Rupees
 * @param {number} amount
 * @param {boolean} showSymbol - whether to prefix with ₹
 * @returns {string}
 */
export const formatINR = (amount, showSymbol = true) => {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString('en-IN');
  return showSymbol ? `₹${formatted}` : formatted;
};

/**
 * Calculate shipping based on cart total
 * @param {number} subtotal
 * @returns {number} shipping cost
 */
export const calculateShipping = (subtotal) => {
  return subtotal >= 500 ? 0 : 49;
};

/**
 * Calculate grand total including shipping
 * @param {number} subtotal
 * @param {number} discount
 * @returns {{ shipping: number, grandTotal: number }}
 */
export const calculateOrderTotals = (subtotal, discount = 0) => {
  const discountedSubtotal = subtotal - discount;
  const shipping = calculateShipping(discountedSubtotal);
  const grandTotal = discountedSubtotal + shipping;
  return { shipping, grandTotal, discountedSubtotal };
};
