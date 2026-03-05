import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  clearError,
} from '../store/cartSlice';
import { Alert } from 'react-native';

export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const addProductToCart = useCallback(async (productData) => {
    try {
      await dispatch(addToCart(productData)).unwrap();
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    }
  }, [dispatch]);

  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    try {
      await dispatch(updateCartItem({ cartItemId, quantity })).unwrap();
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    }
  }, [dispatch]);

  const removeItem = useCallback(async (cartItemId) => {
    try {
      await dispatch(removeFromCart(cartItemId)).unwrap();
      Alert.alert('Thành công', 'Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item');
    }
  }, [dispatch]);

  const clearCartItems = useCallback(async () => {
    try {
      await dispatch(clearCart()).unwrap();
      Alert.alert('Thành công', 'Đã xóa toàn bộ giỏ hàng');
    } catch (error) {
      console.error('Error clearing cart:', error);
      Alert.alert('Error', 'Failed to clear cart');
    }
  }, [dispatch]);

  const loadCart = useCallback(async () => {
    try {
      await dispatch(fetchCart()).unwrap();
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, [dispatch]);

  const clearCartError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    items: cart.items,
    totalAmount: cart.totalAmount,
    itemCount: cart.itemCount,
    loading: cart.loading,
    error: cart.error,

    // Actions
    addProductToCart,
    updateQuantity,
    removeItem,
    clearCartItems,
    loadCart,
    clearCartError,
  };
};
