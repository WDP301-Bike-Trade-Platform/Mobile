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
  confirmOrder,
  completeOrder,
  OrderStatus,
} from '../services/api.order';
import HeaderBar from '../component/HeaderBar';
import FilterButtons from '../component/FilterButtons';
import OrderCard from '../component/OrderCard';
import EmptyState from '../component/EmptyState';

const TABS = [
  { key: 'buy', label: 'Mua' },
  { key: 'sell', label: 'Bán' },
];

const STATUS_FILTERS = [
  { label: 'Tất cả', value: null },
  { label: 'Chờ xác nhận', value: OrderStatus.PENDING },
  { label: 'Đã xác nhận', value: OrderStatus.CONFIRMED },
  { label: 'Hoàn thành', value: OrderStatus.COMPLETED },
  { label: 'Đã hủy', value: OrderStatus.CANCELLED },
];

const MyOrders = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('buy');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const fetchFn = activeTab === 'buy' ? getMyOrders : getSellerOrders;
      const data = await fetchFn(selectedStatus);
      setOrders(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
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
    Alert.alert('Hủy đơn hàng', 'Bạn chắc chắn muốn hủy đơn hàng này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy đơn',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelOrder(orderId, 'Cancelled by buyer');
            Alert.alert('Thành công', 'Đã hủy đơn hàng');
            fetchOrders();
          } catch (error) {
            console.error('Error canceling order:', error);
            Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
          }
        },
      },
    ]);
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await confirmOrder(orderId, 'Confirmed by seller');
      Alert.alert('Thành công', 'Đã xác nhận đơn hàng');
      fetchOrders();
    } catch (error) {
      console.error('Error confirming order:', error);
      Alert.alert('Lỗi', 'Không thể xác nhận đơn hàng');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await completeOrder(orderId);
      Alert.alert('Thành công', 'Đã hoàn thành đơn hàng');
      fetchOrders();
    } catch (error) {
      console.error('Error completing order:', error);
      Alert.alert('Lỗi', 'Không thể hoàn thành đơn hàng');
    }
  };

  const getOrderAction = (order) => {
    if (activeTab === 'buy') {
      // Buyer: cancel PENDING, complete CONFIRMED
      if (order.status === 'PENDING') {
        return {
          actionType: 'cancel',
          onAction: () => handleCancelOrder(order.order_id),
        };
      }
      if (order.status === 'CONFIRMED') {
        return {
          actionType: 'complete',
          onAction: () => handleCompleteOrder(order.order_id),
        };
      }
      return { actionType: null, onAction: null };
    }
    // Seller tab: confirm PENDING
    if (order.status === 'PENDING') {
      return {
        actionType: 'confirm',
        onAction: () => handleConfirmOrder(order.order_id),
      };
    }
    return { actionType: null, onAction: null };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
      <HeaderBar title="Đơn hàng" onBack={() => navigation.goBack()} />

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
              title={activeTab === 'buy' ? 'Chưa có đơn mua' : 'Chưa có đơn bán'}
              message={
                activeTab === 'buy'
                  ? 'Bạn chưa mua đơn hàng nào'
                  : 'Bạn chưa có đơn hàng nào từ người mua'
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