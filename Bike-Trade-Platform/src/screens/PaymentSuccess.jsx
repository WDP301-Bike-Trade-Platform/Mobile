import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getOrderById } from '../services/api.order';

export default function PaymentSuccess() {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  
  // Lấy orderId từ URL params: biketrade://payment/success?orderId=xxx&orderCode=xxx
  const { orderId, orderCode } = route.params || {};

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (orderId) {
          const response = await getOrderById(orderId);
          setOrder(response.data);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Đang xác nhận thanh toán...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="check-circle" size={80} color="#10b981" />
      </View>
      
      <Text style={styles.title}>Thanh toán thành công!</Text>
      <Text style={styles.subtitle}>
        Đơn hàng của bạn đã được xác nhận
      </Text>

      {order && (
        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Mã đơn hàng:</Text>
          <Text style={styles.orderValue}>{order.order_id}</Text>
          
          <Text style={styles.orderLabel}>Số tiền:</Text>
          <Text style={styles.orderValue}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(order.deposit_amount)}
          </Text>
          
          <Text style={styles.orderLabel}>Trạng thái:</Text>
          <Text style={[styles.orderValue, styles.statusSuccess]}>
            {order.status === 'DEPOSITED' ? 'Đã đặt cọc' : order.status}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('OrderDetail', { orderId })}
        >
          <Text style={styles.primaryButtonText}>Xem chi tiết đơn hàng</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  orderInfo: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  orderLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  orderValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  statusSuccess: {
    color: '#10b981',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
});
