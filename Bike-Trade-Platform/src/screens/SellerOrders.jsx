import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  getSellerOrders,
  confirmOrder,
  completeOrder,
  OrderStatus,
} from '../services/api.order';
import HeaderBar from '../component/HeaderBar';
import FilterButtons from '../component/FilterButtons';
import OrderCard from '../component/OrderCard';
import EmptyState from '../component/EmptyState';

const SellerOrders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [selectedStatus])
  );

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getSellerOrders(selectedStatus);
      setOrders(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleConfirmOrder = (orderId) => {
    Alert.alert('Confirm Order', 'Are you sure you want to confirm this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await confirmOrder(orderId, 'Order confirmed by seller');
            Alert.alert('Success', 'Order confirmed successfully');
            fetchOrders();
          } catch (error) {
            console.error('Error confirming order:', error);
            Alert.alert('Error', 'Failed to confirm order');
          }
        },
      },
    ]);
  };

  const handleCompleteOrder = (orderId) => {
    Alert.alert('Complete Order', 'Have you successfully delivered the item?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await completeOrder(orderId);
            Alert.alert('Success', 'Order completed successfully');
            fetchOrders();
          } catch (error) {
            console.error('Error completing order:', error);
            Alert.alert('Error', 'Failed to complete order');
          }
        },
      },
    ]);
  };

  const filters = [
    { label: 'All', value: null },
    { label: 'Pending', value: OrderStatus.PENDING },
    { label: 'Confirmed', value: OrderStatus.CONFIRMED },
    { label: 'Completed', value: OrderStatus.COMPLETED },
    { label: 'Cancelled', value: OrderStatus.CANCELLED },
  ];

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
        <HeaderBar title="Seller Orders" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#389cfa" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
      <HeaderBar title="Seller Orders" onBack={() => navigation.goBack()} />
      <FilterButtons
        filters={filters}
        selectedFilter={selectedStatus}
        onFilterChange={setSelectedStatus}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchOrders();
        }}
      >
        {orders.length === 0 ? (
          <EmptyState
            icon="store"
            title="No Orders Yet"
            message="You haven't received any orders yet"
          />
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.order_id}
              order={order}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.order_id })}
              onAction={() => {
                if (order.status === 'PENDING') {
                  handleConfirmOrder(order.order_id);
                } else if (order.status === 'CONFIRMED') {
                  handleCompleteOrder(order.order_id);
                }
              }}
              actionType={
                order.status === 'PENDING'
                  ? 'confirm'
                  : order.status === 'CONFIRMED'
                  ? 'complete'
                  : null
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerOrders;
