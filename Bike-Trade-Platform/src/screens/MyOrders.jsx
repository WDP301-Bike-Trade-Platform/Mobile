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
import { getMyOrders, cancelOrder, OrderStatus } from '../services/api.order';
import HeaderBar from '../component/HeaderBar';
import FilterButtons from '../component/FilterButtons';
import OrderCard from '../component/OrderCard';
import EmptyState from '../component/EmptyState';

const MyOrders = ({ navigation }) => {
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
      const data = await getMyOrders(selectedStatus);
      setOrders(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelOrder(orderId, 'Cancelled by buyer');
            Alert.alert('Success', 'Order cancelled successfully');
            fetchOrders();
          } catch (error) {
            console.error('Error canceling order:', error);
            Alert.alert('Error', 'Failed to cancel order');
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
        <HeaderBar title="My Orders" onBack={() => navigation.goBack()} />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#389cfa" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
      <HeaderBar title="My Orders" onBack={() => navigation.goBack()} />
      <FilterButtons
        filters={filters}
        selectedFilter={selectedStatus}
        onFilterChange={setSelectedStatus}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchOrders();
        }}
      >
        {orders.length === 0 ? (
          <EmptyState
            icon="package-variant"
            title="No Orders Yet"
            message="You haven't placed any orders yet"
          />
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.order_id}
              order={order}
              onPress={() =>
                navigation.navigate('OrderDetail', { orderId: order.order_id })
              }
              onAction={() => handleCancelOrder(order.order_id)}
              actionType="cancel"
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyOrders;