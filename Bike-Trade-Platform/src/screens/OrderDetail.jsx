import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getOrderById, cancelOrder } from '../services/api.order';
import { createPaymentForOrder } from '../services/api.payment';
import HeaderBar from '../component/HeaderBar';
import StatusBadge from '../component/StatusBadge';
import { formatPrice, formatDateTime, decimalToNumber } from '../utils/formatters';

const OrderDetail = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrderDetail();
    }, [orderId])
  );

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await getOrderById(orderId);
      setOrder(response?.data || response);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      Alert.alert('Error', 'Failed to load order details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      const response = await createPaymentForOrder(orderId);
      const paymentData = response?.data || response;

      if (paymentData.paymentLink) {
        const supported = await Linking.canOpenURL(paymentData.paymentLink);
        if (supported) {
          await Linking.openURL(paymentData.paymentLink);
          Alert.alert('Payment', 'Please complete the payment in your browser');
        } else {
          Alert.alert('Error', 'Cannot open payment link');
        }
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      Alert.alert('Error', 'Failed to create payment link');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelOrder(orderId, 'Cancelled by buyer');
            Alert.alert('Success', 'Order cancelled successfully', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            console.error('Error canceling order:', error);
            Alert.alert('Error', 'Failed to cancel order');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      CONFIRMED: '#3b82f6',
      COMPLETED: '#10b981',
      CANCELLED: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
        <HeaderBar title="Order Details" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#389cfa" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
        <HeaderBar title="Order Details" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#9ca3af' }}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
      <HeaderBar title="Order Details" onBack={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Order Status */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
              Order Status
            </Text>
            <StatusBadge
              status={order.status}
              color={getStatusColor(order.status)}
              text={getStatusText(order.status)}
            />
          </View>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
            Order ID: #{order.order_id}
          </Text>
          <Text style={{ fontSize: 13, color: '#9ca3af' }}>
            Placed on: {formatDateTime(order.created_at)}
          </Text>
        </View>

        {/* Product Info */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
            Order Items
          </Text>
          
          {/* Order Items List */}
          {order.orderDetails && order.orderDetails.length > 0 ? (
            <>
              {order.orderDetails.map((item, index) => (
                <View
                  key={item.order_detail_id}
                  style={{
                    paddingVertical: 12,
                    borderTopWidth: index > 0 ? 1 : 0,
                    borderTopColor: '#f3f4f6',
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                        {item.vehicle?.brand} {item.vehicle?.model}
                      </Text>
                      <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>
                        {item.vehicle?.year} • {item.vehicle?.bike_type}
                      </Text>
                      <Text style={{ fontSize: 13, color: '#6b7280' }}>
                        {item.vehicle?.condition} • {item.vehicle?.material}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#389cfa', marginBottom: 4 }}>
                        đ{formatPrice(decimalToNumber(item.unit_price))}
                      </Text>
                      <Text style={{ fontSize: 13, color: '#6b7280' }}>
                        Qty: {item.quantity}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                    <Text style={{ fontSize: 14, color: '#6b7280' }}>Subtotal</Text>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
                      đ{formatPrice(decimalToNumber(item.total_price))}
                    </Text>
                  </View>
                </View>
              ))}
              
              {/* Order Summary */}
              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 2, borderTopColor: '#e5e7eb' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, color: '#6b7280' }}>
                    Total Items ({order.orderDetails.reduce((sum, item) => sum + item.quantity, 0)})
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
                    đ{formatPrice(
                      order.orderDetails.reduce(
                        (sum, item) => sum + decimalToNumber(item.total_price),
                        0
                      )
                    )}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>Deposit Amount</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#389cfa' }}>
                    đ{formatPrice(decimalToNumber(order.deposit_amount))}
                  </Text>
                </View>
              </View>
            </>
          ) : order.listing ? (
            // Fallback to old single listing format
            <>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 6 }}>
                {order.listing?.title || order.listing?.vehicle?.brand + ' ' + order.listing?.vehicle?.model || 'N/A'}
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 10 }}>
                {order.listing?.vehicle?.description || ''}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#389cfa' }}>
                đ{formatPrice(decimalToNumber(order.deposit_amount))}
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: 14, color: '#9ca3af' }}>No items found</Text>
          )}
        </View>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
              Shipping Address
            </Text>
            <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>
              {order.shippingAddress.street}, {order.shippingAddress.ward}
              {'\n'}
              {order.shippingAddress.district}, {order.shippingAddress.city}
            </Text>
          </View>
        )}

        {/* Seller Info */}
        {order.listing?.seller && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
              Seller Information
            </Text>
            <Text style={{ fontSize: 14, color: '#374151', marginBottom: 4 }}>
              Name: {order.listing.seller.full_name}
            </Text>
            <Text style={{ fontSize: 14, color: '#374151', marginBottom: 4 }}>
              Email: {order.listing.seller.email}
            </Text>
            {order.listing.seller.phone && (
              <Text style={{ fontSize: 14, color: '#374151' }}>
                Phone: {order.listing.seller.phone}
              </Text>
            )}
          </View>
        )}

        {/* Note */}
        {order.note && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
              Note
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', fontStyle: 'italic' }}>
              {order.note}
            </Text>
          </View>
        )}

        {/* Actions */}
        {order.status === 'PENDING' && (
          <View style={{ gap: 12 }}>
            <Pressable
              onPress={handlePayment}
              disabled={processingPayment}
              style={({ pressed }) => ({
                paddingVertical: 14,
                borderRadius: 10,
                backgroundColor: '#389cfa',
                alignItems: 'center',
                opacity: pressed || processingPayment ? 0.7 : 1,
              })}
            >
              {processingPayment ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
                  Proceed to Payment
                </Text>
              )}
            </Pressable>
            <Pressable
              onPress={handleCancelOrder}
              style={({ pressed }) => ({
                paddingVertical: 14,
                borderRadius: 10,
                backgroundColor: '#fee2e2',
                alignItems: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#ef4444' }}>
                Cancel Order
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetail;
