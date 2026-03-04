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
import { getOrderById, cancelOrder, confirmOrder, completeOrder } from '../services/api.order';
import { createPaymentForOrder } from '../services/api.payment';
import { useAppContext } from '../provider/AppProvider';
import HeaderBar from '../component/HeaderBar';
import StatusBadge from '../component/StatusBadge';
import { formatPrice, formatDateTime, decimalToNumber } from '../utils/formatters';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STATUS_MAP = {
  PENDING: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const STATUS_COLORS = {
  PENDING: { bg: '#fef3c7', text: '#d97706', icon: 'clock-outline' },
  CONFIRMED: { bg: '#dbeafe', text: '#2563eb', icon: 'check-circle-outline' },
  COMPLETED: { bg: '#dcfce7', text: '#16a34a', icon: 'check-decagram' },
  CANCELLED: { bg: '#fee2e2', text: '#dc2626', icon: 'close-circle' },
};

const OrderDetail = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { user } = useAppContext();
  const currentUserId = user?.user_id || user?.userId || user?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

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
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
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
        } else {
          Alert.alert('Lỗi', 'Không thể mở link thanh toán');
        }
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      Alert.alert('Lỗi', 'Không thể tạo link thanh toán');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert('Hủy đơn hàng', 'Bạn chắc chắn muốn hủy đơn hàng này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy đơn',
        style: 'destructive',
        onPress: async () => {
          try {
            setProcessingAction(true);
            await cancelOrder(orderId, 'Cancelled by buyer');
            Alert.alert('Thành công', 'Đã hủy đơn hàng', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            console.error('Error canceling order:', error);
            Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
          } finally {
            setProcessingAction(false);
          }
        },
      },
    ]);
  };

  const handleConfirmOrder = () => {
    Alert.alert('Xác nhận đơn hàng', 'Bạn chắc chắn muốn xác nhận đơn hàng COD này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Xác nhận',
        onPress: async () => {
          try {
            setProcessingAction(true);
            await confirmOrder(orderId, 'Confirmed by seller');
            Alert.alert('Thành công', 'Đã xác nhận đơn hàng');
            fetchOrderDetail();
          } catch (error) {
            console.error('Error confirming order:', error);
            Alert.alert('Lỗi', 'Không thể xác nhận đơn hàng');
          } finally {
            setProcessingAction(false);
          }
        },
      },
    ]);
  };

  const handleCompleteOrder = () => {
    Alert.alert('Hoàn thành đơn hàng', 'Xác nhận đã nhận hàng và hoàn thành đơn hàng?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hoàn thành',
        onPress: async () => {
          try {
            setProcessingAction(true);
            await completeOrder(orderId);
            Alert.alert('Thành công', 'Đã hoàn thành đơn hàng');
            fetchOrderDetail();
          } catch (error) {
            console.error('Error completing order:', error);
            Alert.alert('Lỗi', 'Không thể hoàn thành đơn hàng');
          } finally {
            setProcessingAction(false);
          }
        },
      },
    ]);
  };

  const getShippingAddress = () => {
    if (!order?.orderAddresses || order.orderAddresses.length === 0) return null;
    const shippingAddr = order.orderAddresses.find(a => a.address_type === 'SHIPPING');
    if (!shippingAddr) return null;

    // Try parsed snapshot first
    if (shippingAddr.address_snapshot) {
      try {
        const snapshot = typeof shippingAddr.address_snapshot === 'string'
          ? JSON.parse(shippingAddr.address_snapshot)
          : shippingAddr.address_snapshot;
        return snapshot;
      } catch (e) { /* fallback */ }
    }
    return shippingAddr.address || null;
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    const parts = [
      addr.recipientName,
      addr.phone,
      addr.addressLine1,
      addr.addressLine2,
      [addr.ward, addr.district, addr.city].filter(Boolean).join(', '),
    ].filter(Boolean);
    return parts.join('\n');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
        <HeaderBar title="Chi tiết đơn hàng" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#389cfa" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
        <HeaderBar title="Chi tiết đơn hàng" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#9ca3af' }}>Không tìm thấy đơn hàng</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isBuyer = order.buyer_id === currentUserId;
  const isSeller = order.listing?.seller?.user_id === currentUserId || order.listing?.seller_id === currentUserId;
  const meta = order.meta || {};
  const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;

  // Buyer can cancel PENDING orders (not CONFIRMED or COMPLETED per backend)
  const buyerCanCancel = isBuyer && order.status === 'PENDING';
  // Buyer can pay when PENDING
  const buyerCanPay = isBuyer && order.status === 'PENDING';
  // Seller can confirm PENDING orders
  const sellerCanConfirm = isSeller && order.status === 'PENDING';
  // Buyer confirms completion when CONFIRMED
  const buyerCanComplete = isBuyer && order.status === 'CONFIRMED';

  const shippingAddr = getShippingAddress();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
      <HeaderBar title="Chi tiết đơn hàng" onBack={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Order Status Card */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          backgroundColor: statusStyle.bg,
          gap: 16,
        }}>
          <View style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: 'rgba(255,255,255,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name={statusStyle.icon} size={28} color={statusStyle.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: statusStyle.text }}>
              {STATUS_MAP[order.status] || order.status}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              {formatDateTime(order.created_at)}
            </Text>
          </View>
        </View>

        {/* Order Info */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#389cfa" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Thông tin đơn hàng</Text>
          </View>
          <InfoRow label="Mã đơn" value={`#${order.order_id?.slice(0, 8)}`} />
          <InfoRow label="Phương thức" value={meta.paymentMethod || 'N/A'} />
          {meta.depositRequired && (
            <InfoRow label="Đặt cọc" value={meta.depositPaid ? 'Đã cọc' : 'Chưa cọc'} valueColor={meta.depositPaid ? '#16a34a' : '#d97706'} />
          )}
        </View>

        {/* Product Items */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <MaterialCommunityIcons name="package-variant" size={20} color="#389cfa" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Sản phẩm</Text>
          </View>

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
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 4 }}>
                        {item.vehicle?.brand} {item.vehicle?.model}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        {[item.vehicle?.year, item.vehicle?.bike_type, item.vehicle?.condition].filter(Boolean).join(' • ')}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#389cfa' }}>
                        đ{formatPrice(decimalToNumber(item.unit_price))}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        x{item.quantity}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* Summary */}
              <View style={{ marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                <SummaryRow label={`Tổng (${order.orderDetails.reduce((s, i) => s + i.quantity, 0)} sản phẩm)`}
                  value={`đ${formatPrice(meta.totalAmount || order.orderDetails.reduce((s, i) => s + decimalToNumber(i.total_price), 0))}`} />
                {meta.depositRequired && (
                  <SummaryRow label="Tiền cọc" value={`đ${formatPrice(meta.depositAmount || decimalToNumber(order.deposit_amount))}`} />
                )}
                <View style={{ height: 1, backgroundColor: '#f3f4f6', marginVertical: 8 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#111' }}>
                    {meta.depositRequired ? 'Cần thanh toán' : 'Tổng cộng'}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#389cfa' }}>
                    đ{formatPrice(meta.depositAmount || meta.totalAmount || decimalToNumber(order.deposit_amount))}
                  </Text>
                </View>
              </View>
            </>
          ) : order.listing ? (
            <>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 4 }}>
                {order.listing?.title || `${order.listing?.vehicle?.brand} ${order.listing?.vehicle?.model}` || 'N/A'}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#389cfa', marginTop: 8 }}>
                đ{formatPrice(decimalToNumber(order.deposit_amount))}
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: 14, color: '#9ca3af' }}>Không có sản phẩm</Text>
          )}
        </View>

        {/* Shipping Address */}
        {shippingAddr && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#389cfa" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Địa chỉ giao hàng</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>
              {formatAddress(shippingAddr)}
            </Text>
          </View>
        )}

        {/* Buyer Info (for seller view) */}
        {isSeller && order.buyer && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#389cfa" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Thông tin người mua</Text>
            </View>
            <InfoRow label="Tên" value={order.buyer.full_name} />
            <InfoRow label="Email" value={order.buyer.email} />
            {order.buyer.phone && <InfoRow label="SĐT" value={order.buyer.phone} />}
          </View>
        )}

        {/* Seller Info (for buyer view) */}
        {isBuyer && order.listing?.seller && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <MaterialCommunityIcons name="store-outline" size={20} color="#389cfa" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Thông tin người bán</Text>
            </View>
            <InfoRow label="Tên" value={order.listing.seller.full_name} />
            <InfoRow label="Email" value={order.listing.seller.email} />
            {order.listing.seller.phone && <InfoRow label="SĐT" value={order.listing.seller.phone} />}
          </View>
        )}

        {/* Note */}
        {order.note && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <MaterialCommunityIcons name="note-text-outline" size={20} color="#389cfa" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Ghi chú</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#6b7280', fontStyle: 'italic' }}>
              {order.note}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={{ gap: 12 }}>
          {/* Buyer: Pay (PENDING) */}
          {buyerCanPay && (
            <View>
              <Pressable
                onPress={handlePayment}
                disabled={processingPayment}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: '#389cfa',
                  gap: 8,
                  opacity: pressed || processingPayment ? 0.7 : 1,
                })}
              >
                {processingPayment ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="credit-card-outline" size={20} color="#fff" />
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Thanh toán</Text>
                  </>
                )}
              </Pressable>
              <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
                Thanh toán qua PayOS
              </Text>
            </View>
          )}

          {/* Seller: Confirm COD (PENDING + COD only) */}
          {sellerCanConfirm && (
            <View>
              <Pressable
                onPress={handleConfirmOrder}
                disabled={processingAction}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: '#389cfa',
                  gap: 8,
                  opacity: pressed || processingAction ? 0.7 : 1,
                })}
              >
                {processingAction ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Xác nhận đơn hàng</Text>
                  </>
                )}
              </Pressable>
              <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
                Xác nhận đơn hàng COD thủ công
              </Text>
            </View>
          )}

          {/* Buyer: Complete (CONFIRMED) */}
          {buyerCanComplete && (
            <View>
              <Pressable
                onPress={handleCompleteOrder}
                disabled={processingAction}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: '#10b981',
                  gap: 8,
                  opacity: pressed || processingAction ? 0.7 : 1,
                })}
              >
                {processingAction ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check-decagram" size={20} color="#fff" />
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Đã nhận hàng</Text>
                  </>
                )}
              </Pressable>
              <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
                Xác nhận đã nhận hàng và hoàn thành đơn
              </Text>
            </View>
          )}

          {/* Buyer: Cancel (PENDING) */}
          {buyerCanCancel && (
            <Pressable
              onPress={handleCancelOrder}
              disabled={processingAction}
              style={({ pressed }) => ({
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: '#fee2e2',
                borderWidth: 1,
                borderColor: '#fecaca',
                gap: 8,
                opacity: pressed || processingAction ? 0.7 : 1,
              })}
            >
              <MaterialCommunityIcons name="close-circle-outline" size={20} color="#ef4444" />
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#ef4444' }}>Hủy đơn hàng</Text>
            </Pressable>
          )}

          {/* Contact button */}
          {(isBuyer || isSeller) && order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
            <Pressable
              onPress={() => {
                const otherUserId = isBuyer ? order.listing?.seller?.user_id : order.buyer?.user_id;
                const otherUser = isBuyer ? order.listing?.seller : order.buyer;
                if (otherUserId) {
                  navigation.navigate('Conversation', { otherUserId, otherUser });
                }
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#389cfa',
                gap: 8,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <MaterialCommunityIcons name="chat-outline" size={20} color="#389cfa" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#389cfa' }}>
                Liên hệ {isBuyer ? 'người bán' : 'người mua'}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value, valueColor }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
    <Text style={{ fontSize: 13, color: '#6b7280' }}>{label}</Text>
    <Text style={{ fontSize: 13, fontWeight: '600', color: valueColor || '#111' }}>{value}</Text>
  </View>
);

const SummaryRow = ({ label, value }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
    <Text style={{ fontSize: 13, color: '#6b7280' }}>{label}</Text>
    <Text style={{ fontSize: 13, fontWeight: '600', color: '#111' }}>{value}</Text>
  </View>
);

export default OrderDetail;
