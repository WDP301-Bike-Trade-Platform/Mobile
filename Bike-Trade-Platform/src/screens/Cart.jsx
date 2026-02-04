import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  getMyCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../services/api.cart';
import HeaderBar from '../component/HeaderBar';
import CartItemCard from '../component/CartItemCard';
import EmptyState from '../component/EmptyState';
import { formatPrice } from '../utils/formatters';

const Cart = ({ navigation }) => {
  const [cart, setCart] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, [])
  );

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getMyCart();
      const cartData = response?.data || response;
      
      setCart(cartData.cart);
      setTotalAmount(cartData.totalAmount || 0);
      setItemCount(cartData.itemCount || 0);
    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', 'Failed to load cart');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    try {
      await updateCartItem(cartItemId, newQuantity);
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleRemoveItem = (cartItemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(cartItemId);
              Alert.alert('Success', 'Item removed from cart');
              fetchCart();
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart();
              Alert.alert('Success', 'Cart cleared successfully');
              fetchCart();
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('Error', 'Failed to clear cart');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    navigation.navigate('Checkout', {
      cartItems: cart.items,
      totalAmount,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
        {/* <HeaderBar title="My Cart" onBack={() => navigation.goBack()} />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#359EFF" />
        </View> */}
        <ActivityIndicator size="large" color="#359EFF" />
        <Text style={{ marginTop: 12, color: "#999" }}>
          Loading cart...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
      {/* <HeaderBar
        title="My Cart"
        onBack={() => navigation.goBack()}
        rightAction={
          cart?.items?.length > 0 && (
            <Pressable onPress={handleClearCart}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#ef4444' }}>
                Clear All
              </Text>
            </Pressable>
          )
        }
      /> */}

      {/* Cart Summary */}
      {cart?.items?.length > 0 && (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#6b7280' }}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#359EFF' }}>
              đ{formatPrice(totalAmount)}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: cart?.items?.length > 0 ? 100 : 16,
        }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchCart();
        }}
      >
        {!cart || cart.items.length === 0 ? (
          <EmptyState
            icon="cart-outline"
            title="Your Cart is Empty"
            message="Add items to your cart to get started"
            buttonText="Browse Products"
            onButtonPress={() => navigation.navigate('Home')}
          />
        ) : (
          cart.items.map((item) => (
            <CartItemCard
              key={item.cart_item_id}
              item={item}
              onRemove={handleRemoveItem}
            />
          ))
        )}
      </ScrollView>

      {/* Checkout Button */}
      {cart?.items?.length > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            padding: 10,
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
          }}
        >
          <Pressable
            onPress={handleCheckout}
            style={({ pressed }) => ({
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: '#359EFF',
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
              Proceed to Checkout
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Cart;
