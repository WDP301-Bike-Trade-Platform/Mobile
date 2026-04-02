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
import { getOrderById, cancelOrder, completeOrder, sellerConfirmOrder, sellerRejectOrder } from '../services/api.order';
import { createPaymentForOrder } from '../services/api.payment';
import { getShipmentByOrder, getStatusLabel, getStatusColor } from '../services/api.shipment';
import { useAppContext } from '../provider/AppProvider';
import { usePlatformSettings } from '../provider/PlatformSettingsProvider';
import HeaderBar from '../component/HeaderBar';
import StatusBadge from '../component/StatusBadge';
import { formatPrice, formatDateTime, decimalToNumber } from '../utils/formatters';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STATUS_MAP = {
  PENDING: 'Pending Payment',
  DEPOSITED: 'Deposit Paid',
  CONFIRMED: 'Confirmed',
  PAID: 'Paid',
  FORFEITED: 'Forfeited',
  CANCELLED: 'Cancelled',
  CANCELLED_BY_SELLER: 'Rejected by Seller',
  COMPLETED: 'Completed',
};

const STATUS_COLORS = {
  PENDING: { bg: '#fef3c7', text: '#d97706', icon: 'clock-outline' },
  DEPOSITED: { bg: '#f3e8ff', text: '#7c3aed', icon: 'cash' },
  CONFIRMED: { bg: '#dbeafe', text: '#2563eb', icon: 'check-circle-outline' },
  PAID: { bg: '#cffafe', text: '#0891b2', icon: 'credit-card-check' },
  FORFEITED: { bg: '#fef2f2', text: '#dc2626', icon: 'alert-circle' },
  CANCELLED: { bg: '#fee2e2', text: '#dc2626', icon: 'close-circle' },
  CANCELLED_BY_SELLER: { bg: '#fed7aa', text: '#ea580c', icon: 'close-circle-outline' },
  COMPLETED: { bg: '#dcfce7', text: '#16a34a', icon: 'check-decagram' },
};

const OrderDetail = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { user } = useAppContext();
  const { settings } = usePlatformSettings();
  const currentUserId = user?.user_id || user?.userId || user?.id;
  const [order, setOrder] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [loadingShipment, setLoadingShipment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  const getErrorMessage = (error, fallbackMessage) => {
    const apiMessage = error?.response?.data?.message;
    if (Array.isArray(apiMessage)) return apiMessage[0] || fallbackMessage;
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;
    if (typeof error?.message === 'string' && error.message.trim()) return error.message;
    return fallbackMessage;
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchOrderDetail();
    }, [orderId])
  );

  const shouldFetchShipmentForOrder = (orderData) => {
    if (!orderData) return false;
    const orderStatus = orderData.status;
    const method = (orderData.meta?.paymentMethod || '').toUpperCase();

    if (orderStatus === 'DEPOSITED' || orderStatus === 'PAID' || orderStatus === 'COMPLETED') {
      return true;
    }

    if (orderStatus === 'CONFIRMED' && method !== 'COD') {
      return true;
    }

    return false;
  };

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await getOrderById(orderId);
      const orderData = response?.data || response;
      setOrder(orderData);

      if (shouldFetchShipmentForOrder(orderData)) {
        await fetchShipmentTracking(orderData.order_id || orderId);
      } else {
        setShipment(null);
        setLoadingShipment(false);
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
      Alert.alert('Error', 'Unable to load order details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchShipmentTracking = async (targetOrderId) => {
    const resolvedOrderId = typeof targetOrderId === 'string'
      ? targetOrderId
      : (order?.order_id || orderId);

    if (!resolvedOrderId) {
      setShipment(null);
      setLoadingShipment(false);
      return;
    }

    try {
      setLoadingShipment(true);
      const shipmentData = await getShipmentByOrder(resolvedOrderId);
      setShipment(shipmentData?.data || shipmentData);
    } catch (error) {
      const statusCode = error?.response?.status;
      if (statusCode === 404) {
        setShipment(null);
        return;
      }
      console.error('Error fetching shipment tracking:', error);
      setShipment(null);
    } finally {
      setLoadingShipment(false);
    }
  };

  const resolvePaymentStageForOrder = () => {
    if (order.status === 'CONFIRMED') {
      return 'REMAINING';
    }
    if (order.status === 'PENDING') {
      if (meta.depositRequired && !meta.depositPaid) {
        return 'DEPOSIT';
      }
      return undefined; // Full payment (backend defaults to FULL)
    }
    return undefined; // Default to full payment
  };

  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      const paymentStage = resolvePaymentStageForOrder();
      const paymentData = await createPaymentForOrder(orderId, {
        paymentStage,
        platform: 'MOBILE',
      });
      const checkoutUrl = paymentData?.paymentLink || paymentData?.checkoutUrl;

      if (checkoutUrl) {
        const supported = await Linking.canOpenURL(checkoutUrl);
        if (supported) {
          await Linking.openURL(checkoutUrl);
        } else {
          Alert.alert('Error', 'Unable to open payment link');
        }
      } else {
        Alert.alert('Notice', 'Payment link is not ready yet. Please try again later.');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      Alert.alert('Error', getErrorMessage(error, 'Unable to create payment link'));
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancel Order',
        style: 'destructive',
        onPress: async () => {
          try {
            setProcessingAction(true);
            await cancelOrder(orderId, 'Cancelled by buyer');
            Alert.alert('Success', 'Order cancelled', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            console.error('Error canceling order:', error);
            Alert.alert('Error', 'Unable to cancel order');
          } finally {
            setProcessingAction(false);
          }
        },
      },
    ]);
  };

  const handleCompleteOrder = () => {
    Alert.alert('Complete Order', 'Confirm you have received the items and complete the order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          try {
            setProcessingAction(true);
            await completeOrder(orderId);
            Alert.alert('Success', 'Order completed');
            fetchOrderDetail();
          } catch (error) {
            console.error('Error completing order:', error);
            Alert.alert('Error', getErrorMessage(error, 'Unable to complete order'));
          } finally {
            setProcessingAction(false);
          }
        },
      },
    ]);
  };

  const handleSellerConfirm = () => {
    Alert.alert('Confirm Order', 'Are you sure you want to confirm this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            setProcessingAction(true);
            console.log('👉 handleSellerConfirm called with orderId:', orderId);
            await sellerConfirmOrder(orderId);
            Alert.alert('Success', 'Order confirmed.');
            fetchOrderDetail();
          } catch (error) {
            console.error('❌ handleSellerConfirm error:', error.message);
            Alert.alert('Error', 'Unable to confirm order');
          } finally {
            setProcessingAction(false);
          }
        },
      },
    ]);
  };

  const handleSellerReject = () => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order? The deposit will be refunded and the listing will be available again.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Reject',
        onPress: async () => {
          try {
            setProcessingAction(true);
            await sellerRejectOrder(orderId, 'Rejected by seller');
            Alert.alert('Success', 'Order rejected. Deposit will be refunded.');
            fetchOrderDetail();
          } catch (error) {
            console.error('Error rejecting order:', error);
            Alert.alert('Error', 'Unable to reject order');
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

  const isBuyer = order.buyer_id === currentUserId;
  const isSeller = order.listing?.seller?.user_id === currentUserId || order.listing?.seller_id === currentUserId;
  const meta = order.meta || {};
  const paymentMethod = (meta.paymentMethod || '').toUpperCase();
  const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;

  const totalAmount =
    Number(meta.totalAmount) ||
    order.orderDetails?.reduce((sum, item) => sum + decimalToNumber(item.total_price), 0) ||
    0;
  const depositAmount = Number(meta.depositAmount) || decimalToNumber(order.deposit_amount) || 0;
  const shippingFee = decimalToNumber(order.shipping_fee) || 0;
  const remainingAmount = Math.max(totalAmount - depositAmount, 0) + shippingFee;
  const isDepositFlow = !!meta.depositRequired;
  const isFinalPaid = order.status === 'PAID' || order.status === 'COMPLETED';
  const shipmentStatus = shipment?.status;
  const canBuyerCompleteByShipment = shipmentStatus === 'DELIVERED';

  const summaryMainLabel = isDepositFlow
    ? (isFinalPaid ? 'Order Total' : 'Amount Due')
    : 'Order Total';

  const summaryMainAmount = (() => {
    if (!isDepositFlow) return totalAmount + shippingFee;
    if (isFinalPaid) return totalAmount + shippingFee;
    if (order.status === 'DEPOSITED' || order.status === 'CONFIRMED') return remainingAmount;
    return depositAmount;
  })();

  // Buyer can pay deposit when PENDING
  const isPayOsOrder = paymentMethod === 'PAYOS';
  const buyerCanInitiatePayment = isBuyer && order.status === 'PENDING' && isPayOsOrder;
  // Buyer can pay remaining when CONFIRMED
  const buyerCanPayRemaining = isBuyer && order.status === 'CONFIRMED' && isPayOsOrder;
  // Seller can confirm/reject when DEPOSITED
  const sellerCanConfirmReject = isSeller && (order.status === 'DEPOSITED' || (order.status === 'PENDING' && paymentMethod === 'COD'));
  // Buyer can complete when shipment is DELIVERED and order is in a completable status
  const buyerCanComplete = isBuyer
    && canBuyerCompleteByShipment
    && (order.status === 'CONFIRMED' || order.status === 'PAID');
  // Buyer can cancel when PENDING (before deposit)
  const buyerCanCancel = isBuyer && order.status === 'PENDING';

  const shippingAddr = getShippingAddress();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
      <HeaderBar title="Order Details" onBack={() => navigation.goBack()} />
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
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Order Information</Text>
          </View>
          <InfoRow label="Order ID" value={`#${order.order_id?.slice(0, 8)}`} />
          <InfoRow label="Payment Method" value={meta.paymentMethod || 'N/A'} />
          {meta.depositRequired && (
            <InfoRow label="Deposit" value={meta.depositPaid ? 'Paid' : 'Unpaid'} valueColor={meta.depositPaid ? '#16a34a' : '#d97706'} />
          )}
        </View>

        {/* Product Items */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <MaterialCommunityIcons name="package-variant" size={20} color="#389cfa" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Products</Text>
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
                        {item.listing?.title || `${item.vehicle?.brand || ''} ${item.vehicle?.model || ''}`.trim()}
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
                <SummaryRow label={`Subtotal (${order.orderDetails.reduce((s, i) => s + i.quantity, 0)} items)`}
                  value={`đ${formatPrice(totalAmount)}`} />
                {shippingFee > 0 && (
                  <SummaryRow label="Shipping Fee" value={`đ${formatPrice(shippingFee)}`} />
                )}
                {meta.depositRequired && (
                  <SummaryRow
                    label={meta.depositPaid ? 'Deposit (Paid)' : 'Deposit'}
                    value={meta.depositPaid ? `-đ${formatPrice(depositAmount)}` : `đ${formatPrice(depositAmount)}`}
                    valueColor={meta.depositPaid ? '#ef4444' : undefined}
                  />
                )}
                {meta.depositRequired && (
                  <SummaryRow label="Remaining (incl. shipping)" value={`đ${formatPrice(remainingAmount)}`} />
                )}
                <View style={{ height: 1, backgroundColor: '#f3f4f6', marginVertical: 8 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#111' }}>
                    {summaryMainLabel}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#389cfa' }}>
                    đ{formatPrice(summaryMainAmount)}
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
            <Text style={{ fontSize: 14, color: '#9ca3af' }}>No products</Text>
          )}
        </View>

        {/* Shipping Address */}
        {shippingAddr && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#389cfa" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Shipping Address</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>
              {formatAddress(shippingAddr)}
            </Text>
          </View>
        )}

        {/* Shipment Tracking (Auto by Order ID) */}
        {(loadingShipment || shipment) && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="truck-delivery-outline" size={20} color="#389cfa" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Shipment Tracking</Text>
              </View>
              <Pressable onPress={() => fetchShipmentTracking(order?.order_id || orderId)}>
                <MaterialCommunityIcons name="refresh" size={20} color="#6b7280" />
              </Pressable>
            </View>

            {loadingShipment ? (
              <ActivityIndicator size="small" color="#389cfa" />
            ) : shipment ? (
              <>
                <InfoRow label="Carrier" value={shipment.carrier || 'N/A'} />
                <InfoRow label="Tracking Number" value={shipment.trackingNumber || 'N/A'} />
                <InfoRow label="Status" value={getStatusLabel(shipment.status)} valueColor={getStatusColor(shipment.status)} />
                {shipment.estimatedDelivery && (
                  <InfoRow label="Estimated Delivery" value={formatDateTime(shipment.estimatedDelivery)} />
                )}

                {Array.isArray(shipment.trackings) && shipment.trackings.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 }}>Tracking History</Text>
                    {shipment.trackings.slice(0, 3).map((tracking, idx) => (
                      <View
                        key={tracking.trackingId || `${tracking.trackedAt}-${idx}`}
                        style={{
                          paddingVertical: 8,
                          borderTopWidth: idx > 0 ? 1 : 0,
                          borderTopColor: '#f3f4f6',
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }}>
                          {getStatusLabel(tracking.status)}
                        </Text>
                        {tracking.location ? (
                          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                            {tracking.location}
                          </Text>
                        ) : null}
                        {tracking.description ? (
                          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                            {tracking.description}
                          </Text>
                        ) : null}
                        <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                          {formatDateTime(tracking.trackedAt)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : null}
          </View>
        )}

        {/* Buyer Info (for seller view) */}
        {isSeller && order.buyer && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#389cfa" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Buyer Information</Text>
            </View>
            <InfoRow label="Name" value={order.buyer.full_name} />
            <InfoRow label="Email" value={order.buyer.email} />
            {order.buyer.phone && <InfoRow label="Phone" value={order.buyer.phone} />}
          </View>
        )}

        {/* Seller Info (for buyer view) */}
        {isBuyer && order.listing?.seller && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <MaterialCommunityIcons name="store-outline" size={20} color="#389cfa" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Seller Information</Text>
            </View>
            <InfoRow label="Name" value={order.listing.seller.full_name} />
            <InfoRow label="Email" value={order.listing.seller.email} />
            {order.listing.seller.phone && <InfoRow label="Phone" value={order.listing.seller.phone} />}
          </View>
        )}

        {/* Note */}
        {order.note && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <MaterialCommunityIcons name="note-text-outline" size={20} color="#389cfa" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Note</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#6b7280', fontStyle: 'italic' }}>
              {order.note}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={{ gap: 12 }}>
          {/* Buyer: Pay Deposit or Full (PENDING) */}
          {buyerCanInitiatePayment && (
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
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>
                        {meta.depositRequired ? 'Pay Deposit' : 'Pay Full Amount'}
                      </Text>
                  </>
                )}
              </Pressable>
              <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
                  {meta.depositRequired
                    ? `Pay đ${formatPrice(depositAmount)} to lock the listing`
                    : `Pay đ${formatPrice(totalAmount + shippingFee) } securely via PayOS`}
              </Text>
            </View>
          )}

          {/* Buyer: Pay Remaining (CONFIRMED) */}
          {buyerCanPayRemaining && (
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
                  backgroundColor: '#f59e0b',
                  gap: 8,
                  opacity: pressed || processingPayment ? 0.7 : 1,
                })}
              >
                {processingPayment ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="credit-card-outline" size={20} color="#fff" />
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Pay Remaining ({Math.round((1 - (settings?.deposit_rate ?? 0.1)) * 100)}%)</Text>
                  </>
                )}
              </Pressable>
              <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
                Complete payment within {settings?.escrow_hold_hours ?? 72} hours
              </Text>
            </View>
          )}

          {/* Seller: Confirm/Reject (DEPOSITED) */}
          {sellerCanConfirmReject && (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={handleSellerConfirm}
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
                      <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Confirm</Text>
                    </>
                  )}
                </Pressable>
              </View>
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={handleSellerReject}
                  disabled={processingAction}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: '#ef4444',
                    gap: 8,
                    opacity: pressed || processingAction ? 0.7 : 1,
                  })}
                >
                  {processingAction ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="close-circle-outline" size={20} color="#fff" />
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Reject</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {/* Buyer: Complete (PAID) */}
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
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Received</Text>
                  </>
                )}
              </Pressable>
              <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
                Confirm receipt and complete order
              </Text>
            </View>
          )}

          {/* Buyer: Cancel (PENDING) - only if not escrow */}
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
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#ef4444' }}>Cancel Order</Text>
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
                Contact {isBuyer ? 'Seller' : 'Buyer'}
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

const SummaryRow = ({ label, value, valueColor }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
    <Text style={{ fontSize: 13, color: '#6b7280' }}>{label}</Text>
    <Text style={{ fontSize: 13, fontWeight: '600', color: valueColor || '#111' }}>{value}</Text>
  </View>
);

export default OrderDetail;
