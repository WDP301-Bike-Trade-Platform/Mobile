import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function PaymentCancel() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Lấy orderId từ URL params: biketrade://payment/cancel?orderId=xxx
  const { orderId } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="close-circle" size={80} color="#ef4444" />
      </View>
      
      <Text style={styles.title}>Thanh toán đã bị hủy</Text>
      <Text style={styles.subtitle}>
        Giao dịch của bạn chưa được hoàn tất
      </Text>

      {orderId && (
        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Mã đơn hàng:</Text>
          <Text style={styles.orderValue}>{orderId}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.primaryButtonText}>Thử lại thanh toán</Text>
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
    marginBottom: 4,
  },
  orderValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
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
