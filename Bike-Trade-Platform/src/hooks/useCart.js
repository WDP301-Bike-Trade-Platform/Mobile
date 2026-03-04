import { useSelector, useDispatch } from 'react-redux';
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

  const addProductToCart = async (productData) => {
    try {
      await dispatch(addToCart(productData)).unwrap();
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await dispatch(updateCartItem({ cartItemId, quantity })).unwrap();
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await dispatch(removeFromCart(cartItemId)).unwrap();
      Alert.alert('Success', 'Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const clearCartItems = async () => {
    try {
      await dispatch(clearCart()).unwrap();
      Alert.alert('Success', 'Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      Alert.alert('Error', 'Failed to clear cart');
    }
  };

  const loadCart = async () => {
    try {
      await dispatch(fetchCart()).unwrap();
    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', 'Failed to load cart');
    }
  };

  const clearCartError = () => {
    dispatch(clearError());
  };

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
