import axios from '../lib/axios';

/**
 * Add item to cart
 * @param {string} listingId - ID of the listing
 * @param {number} quantity - Quantity (default 1)
 */
export const addToCart = async (listingId, quantity = 1) => {
  const response = await axios.post('/cart/add', {
    listingId,
    quantity,
  });
  return response.data;
};

/**
 * Get my cart
 */
export const getMyCart = async () => {
  const response = await axios.get('/cart');
  return response.data;
};

/**
 * Update cart item quantity
 * @param {string} cartItemId - Cart item ID
 * @param {number} quantity - New quantity
 */
export const updateCartItem = async (cartItemId, quantity) => {
  const response = await axios.patch(`/cart/items/${cartItemId}`, {
    quantity,
  });
  return response.data;
};

/**
 * Remove item from cart
 * @param {string} cartItemId - Cart item ID
 */
export const removeFromCart = async (cartItemId) => {
  const response = await axios.delete(`/cart/items/${cartItemId}`);
  return response.data;
};

/**
 * Clear all items in cart
 */
export const clearCart = async () => {
  const response = await axios.delete('/cart/clear');
  return response.data;
};

/**
 * Validate cart before checkout
 */
export const validateCart = async () => {
  const response = await axios.get('/cart/validate');
  return response.data;
};
