import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  getMyOrders,
  getSellerOrders,
  cancelOrder,
  sellerConfirmOrder,
  completeOrder,
  OrderStatus,
} from '../services/api.order';
import HeaderBar from '../component/HeaderBar';
import FilterButtons from '../component/FilterButtons';
import OrderCard from '../component/OrderCard';
import EmptyState from '../component/EmptyState';

const TABS = [
  { key: 'buy', label: 'Buy' },
  { key: 'sell', label: 'Sell' },
];

const CANCELLED_ALL = 'CANCELLED_ALL';
const CANCELLED_STATUSES = [
  OrderStatus.CANCELLED_BY_BUYER,
  OrderStatus.CANCELLED_BY_SELLER,
];

const STATUS_FILTERS = [
  { label: 'All', value: null },
  { label: 'Pending', value: OrderStatus.PENDING },
  { label: 'Deposited', value: OrderStatus.DEPOSITED },
  { label: 'Confirmed', value: OrderStatus.CONFIRMED },
  { label: 'Paid', value: OrderStatus.PAID },
  { label: 'Completed', value: OrderStatus.COMPLETED },
  { label: 'Cancelled', value: CANCELLED_ALL },
];

const MyOrders = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('buy');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const getErrorMessage = (error, fallbackMessage) => {
    const apiMessage = error?.response?.data?.message;
    if (Array.isArray(apiMessage)) return apiMessage[0] || fallbackMessage;
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;
    if (typeof error?.message === 'string' && error.message.trim()) return error.message;
    return fallbackMessage;
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const fetchFn = activeTab === 'buy' ? getMyOrders : getSellerOrders;
      const queryStatus = selectedStatus === CANCELLED_ALL ? null : selectedStatus;
      const data = await fetchFn(queryStatus);
      const list = Array.isArray(data) ? data : data?.data || [];

      if (selectedStatus === CANCELLED_ALL) {
        setOrders(list.filter((order) => CANCELLED_STATUSES.includes(order.status)));
      } else {
        setOrders(list);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Unable to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSelectedStatus(null);
    setOrders([]);
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancel Order',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelOrder(orderId, 'Cancelled by buyer');
            Alert.alert('Success', 'Order cancelled');
            fetchOrders();
          } catch (error) {
            console.error('Error canceling order:', error);
            Alert.alert('Error', 'Unable to cancel order');
          }
        },
      },
    ]);
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await sellerConfirmOrder(orderId);
      Alert.alert('Success', 'Order confirmed');
      fetchOrders();
    } catch (error) {
      console.error('Error confirming order:', error);
      Alert.alert('Error', 'Unable to confirm order');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await completeOrder(orderId);
      Alert.alert('Success', 'Order completed');
      fetchOrders();
    } catch (error) {
      console.error('Error completing order:', error);
      Alert.alert('Error', getErrorMessage(error, 'Unable to complete order'));
    }
  };

  const getOrderAction = (order) => {
    if (activeTab === 'buy') {
      // Buyer: cancel when pending, complete when paid
      if (order.status === 'PENDING') {
        return {
          actionType: 'cancel',
          onAction: () => handleCancelOrder(order.order_id),
        };
      }
      const shipmentStatus = order?.shipment?.status;
      const canCompleteByShipment = shipmentStatus === 'DELIVERED';
      if ((order.status === 'PAID' || order.status === 'CONFIRMED') && canCompleteByShipment) {
        return {
          actionType: 'complete',
          onAction: () => handleCompleteOrder(order.order_id),
        };
      }
      return { actionType: null, onAction: null };
    }
    // Seller tab: confirm deposited orders or COD pending orders
    const isCodPendingOrder =
      order.status === 'PENDING' &&
      (order?.meta?.paymentMethod || '').toUpperCase() === 'COD';

    if (order.status === 'DEPOSITED' || isCodPendingOrder) {
      return {
        actionType: 'confirm',
        onAction: () => handleConfirmOrder(order.order_id),
      };
    }
    return { actionType: null, onAction: null };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
      <HeaderBar title="Orders" onBack={() => navigation.goBack()} />

      {/* Buy / Sell Tabs */}
      <View style={tabStyles.container}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              tabStyles.tab,
              activeTab === tab.key && tabStyles.tabActive,
            ]}
            onPress={() => handleTabChange(tab.key)}
          >
            <Text
              style={[
                tabStyles.tabText,
                activeTab === tab.key && tabStyles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Status Filters */}
      <FilterButtons
        filters={STATUS_FILTERS}
        selectedFilter={selectedStatus}
        onFilterChange={setSelectedStatus}
      />

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#389cfa" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchOrders();
              }}
              colors={['#389cfa']}
            />
          }
        >
          {orders.length === 0 ? (
            <EmptyState
              icon="package-variant"
              title={activeTab === 'buy' ? 'No purchase orders' : 'No sales orders'}
              message={
                activeTab === 'buy'
                  ? 'You haven\'t placed any orders yet'
                  : 'You haven\'t received any orders from buyers yet'
              }
            />
          ) : (
            orders.map((order) => {
              const { actionType, onAction } = getOrderAction(order);
              return (
                <OrderCard
                  key={order.order_id}
                  order={order}
                  onPress={() =>
                    navigation.navigate('OrderDetail', { orderId: order.order_id })
                  }
                  onAction={onAction}
                  actionType={actionType}
                />
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const tabStyles = {
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#389cfa',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#389cfa',
  },
};

export default MyOrders;