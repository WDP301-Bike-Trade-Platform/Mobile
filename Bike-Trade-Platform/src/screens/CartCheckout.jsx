import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkoutCart } from '../services/api.order';
import { createPaymentForOrder } from '../services/api.payment';
import HeaderBar from '../component/HeaderBar';
import { formatPrice } from '../utils/formatters';

const CartCheckout = ({ route, navigation }) => {
  const { cartItems, totalPrice, shippingAddressId } = route.params;
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const checkoutData = {
        shippingAddressId: shippingAddressId || undefined,
        note: 'Checkout from cart',
      };

      const result = await checkoutCart(checkoutData);

      if (result.orders && result.orders.length > 0) {
        if (result.orders.length === 1) {
          const orderId = result.orders[0].id;
          const paymentData = await createPaymentForOrder(orderId);

          if (paymentData.checkoutUrl) {
            const supported = await Linking.canOpenURL(paymentData.checkoutUrl);
            if (supported) {
              await Linking.openURL(paymentData.checkoutUrl);
              Alert.alert(
                'Orders Placed',
                'Please complete the payment in your browser',
                [{ text: 'OK', onPress: () => navigation.navigate('MyOrders') }]
              );
            }
          }
        } else {
          Alert.alert(
            'Success',
            `${result.orders.length} orders created successfully`,
            [{ text: 'OK', onPress: () => navigation.navigate('MyOrders') }]
          );
        }
      }
    } catch (error) {
      console.error('Error during cart checkout:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to complete checkout'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
      <HeaderBar title="Cart Checkout" onBack={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Cart Items */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
            Products ({cartItems?.length || 0})
          </Text>
          {cartItems?.map((item, index) => (
            <View
              key={index}
              style={{
                paddingVertical: 12,
                borderTopWidth: index > 0 ? 1 : 0,
                borderTopColor: '#f3f4f6',
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 }}
                numberOfLines={2}
              >
                {item.listing?.title || 'N/A'}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#389cfa' }}>
                ${formatPrice(item.listing?.price)}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
              Shipping Address
            </Text>
            <Pressable onPress={() => navigation.navigate('ManageAddresses')}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#389cfa' }}>
                Change
              </Text>
            </Pressable>
          </View>
          {shippingAddressId ? (
            <Text style={{ fontSize: 14, color: '#374151' }}>Address selected</Text>
          ) : (
            <Text style={{ fontSize: 14, color: '#9ca3af', fontStyle: 'italic' }}>
              No address selected
            </Text>
          )}
        </View>

        {/* Total */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
              Total
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#389cfa' }}>
              ${formatPrice(totalPrice)}
            </Text>
          </View>
        </View>

        {/* Note */}
        <View style={{ backgroundColor: '#fffbeb', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: '#92400e', fontStyle: 'italic' }}>
            * Your cart will be split into separate orders per seller
          </Text>
        </View>

        {/* Checkout Button */}
        <Pressable
          onPress={handleCheckout}
          disabled={loading}
          style={({ pressed }) => ({
            paddingVertical: 14,
            borderRadius: 10,
            backgroundColor: loading ? '#d1d5db' : '#389cfa',
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
              Place Orders
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CartCheckout;
