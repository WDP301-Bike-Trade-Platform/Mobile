import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HeaderBar from '../component/HeaderBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMyShipments, getShipmentStats, getStatusLabel, getStatusColor } from '../services/api.shipment';

const BuyerShipments = ({ navigation }) => {
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filters = [
    { key: 'ALL', label: 'Tất cả', icon: 'package' },
    { key: 'PENDING', label: 'Chờ xử lý', icon: 'clock' },
    { key: 'IN_TRANSIT', label: 'Đang vận chuyển', icon: 'truck-delivery' },
    { key: 'DELIVERED', label: 'Đã giao', icon: 'check-circle' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipmentsData, statsData] = await Promise.all([
        getMyShipments({ take: 50 }),
        getShipmentStats(),
      ]);
      setShipments(shipmentsData.items || []);
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Không thể tải dữ liệu vận chuyển');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getFilteredShipments = () => {
    if (activeFilter === 'ALL') return shipments;
    return shipments.filter(s => s.status === activeFilter);
  };

  const handleShipmentPress = (shipmentId, orderId) => {
    navigation.navigate('ShipmentTracking', { orderId, shipmentId });
  };

  const renderShipmentCard = (shipment) => (
    <Pressable
      onPress={() => handleShipmentPress(shipment.shipmentId, shipment.orderId)}
      style={({ pressed }) => ({
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        opacity: pressed ? 0.7 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      })}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
            Mã đơn: {shipment.orderId?.slice(0, 8)}...
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
            {shipment.trackingNumber}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: getStatusColor(shipment.status),
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>
            {getStatusLabel(shipment.status)}
          </Text>
        </View>
      </View>

      {/* Status Icon */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: getStatusColor(shipment.status),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialCommunityIcons
            name={getStatusIcon(shipment.status)}
            size={20}
            color="#fff"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Người vận chuyển</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>
            {shipment.carrier}
          </Text>
        </View>
      </View>

      {/* Timeline Preview */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {shipment.trackings?.slice(0, 3).map((tracking, idx) => (
          <View
            key={idx}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#dbeafe',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 10, color: '#0284c7', fontWeight: '600' }}>
              {idx === 0 ? '✓' : idx + 1}
            </Text>
          </View>
        ))}
        {shipment.trackings?.length > 3 && (
          <Text style={{ fontSize: 10, color: '#6b7280' }}>
            +{shipment.trackings.length - 3} cập nhật
          </Text>
        )}
      </View>

      {/* Delivery Info */}
      <View
        style={{
          backgroundColor: '#f3f4f6',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Dự kiến giao</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#389cfa' }}>
          {shipment.estimatedDelivery
            ? new Date(shipment.estimatedDelivery).toLocaleDateString('vi-VN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })
            : 'Chưa xác định'}
        </Text>
      </View>
    </Pressable>
  );

  const renderStatsCard = () => {
    if (!stats) return null;

    const statItems = [
      { label: 'Chờ xử lý', value: stats.pending, color: '#FCD34D' },
      { label: 'Đang giao', value: stats.inTransit, color: '#60A5FA' },
      { label: 'Đã giao', value: stats.delivered, color: '#22C55E' },
      { label: 'Hỏng', value: stats.failed, color: '#EF4444' },
    ];

    return (
      <View style={{ marginBottom: 20, gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {statItems.map((item, idx) => (
            <View
              key={idx}
              style={{
                flex: 1,
                minWidth: '48%',
                backgroundColor: '#fff',
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
                borderLeftWidth: 4,
                borderLeftColor: item.color,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: item.color }}>
                {item.value}
              </Text>
              <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7f8' }}>
        <HeaderBar title="Vận chuyển" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#389cfa" />
          <Text style={{ marginTop: 16, fontSize: 14, color: '#6b7280' }}>
            Đang tải...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7f8' }}>
        <HeaderBar title="Vận chuyển" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#ef4444', textAlign: 'center' }}>
            {error}
          </Text>
          <Pressable
            onPress={fetchData}
            style={{
              marginTop: 20,
              paddingVertical: 12,
              paddingHorizontal: 24,
              backgroundColor: '#389cfa',
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Thử lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const filteredShipments = getFilteredShipments();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7f8' }}>
      <HeaderBar title="Vận chuyển" onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Cards */}
        {renderStatsCard()}

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20, marginHorizontal: -16, paddingHorizontal: 16 }}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {filters.map((filter) => (
              <Pressable
                key={filter.key}
                onPress={() => setActiveFilter(filter.key)}
                style={({ pressed }) => ({
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: activeFilter === filter.key ? '#389cfa' : '#fff',
                  borderWidth: activeFilter === filter.key ? 0 : 1,
                  borderColor: '#e5e7eb',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: activeFilter === filter.key ? '#fff' : '#6b7280',
                  }}
                >
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Shipment List */}
        {filteredShipments.length > 0 ? (
          <View>
            {filteredShipments.map((shipment) => (
              <View key={shipment.shipmentId}>
                {renderShipmentCard(shipment)}
              </View>
            ))}
          </View>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <MaterialCommunityIcons name="package" size={48} color="#cbd5e1" />
            <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 12 }}>
              Không có vận chuyển nào
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'PENDING':
      return 'clock-outline';
    case 'PICKED_UP':
      return 'package-variant';
    case 'IN_TRANSIT':
      return 'truck-delivery';
    case 'OUT_FOR_DELIVERY':
      return 'truck-delivery-check';
    case 'DELIVERED':
      return 'check-circle';
    case 'FAILED':
      return 'alert-circle';
    case 'RETURNED':
      return 'undo-variant';
    case 'CANCELLED':
      return 'close-circle';
    default:
      return 'package-variant';
  }
};

export default BuyerShipments;
