import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HeaderBar from '../component/HeaderBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getShipmentByOrder } from '../services/api.shipment';

const ShipmentTracking = ({ navigation, route }) => {
  const { orderId } = route.params || {};
  const [shipmentData, setShipmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchShipmentData();
    }
  }, [orderId]);

  const fetchShipmentData = async () => {
    try {
      setLoading(true);
      const data = await getShipmentByOrder(orderId);
      
      // Transform API data to match component format
      const transformedData = {
        estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery).toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        }) : 'TBD',
        status: data.status.replace('_', ' '),
        trackingNumber: data.trackingNumber || 'N/A',
        courier: data.carrier || 'Unknown Courier',
        updates: transformTrackings(data.trackings || []),
      };
      
      setShipmentData(transformedData);
    } catch (err) {
      console.error('Error fetching shipment data:', err);
      setError('Failed to load shipment information');
    } finally {
      setLoading(false);
    }
  };

  const transformTrackings = (trackings) => {
    if (!trackings || trackings.length === 0) {
      return [];
    }
    
    // Sort trackings by trackedAt descending (latest first)
    const sortedTrackings = [...trackings].sort((a, b) => new Date(b.trackedAt) - new Date(a.trackedAt));
    
    return sortedTrackings.map((tracking, index) => {
      const statusLabel = tracking.status.replace(/_/g, ' ');
      const location = tracking.location || '';
      const description = tracking.description || `${statusLabel}${location ? ` - ${location}` : ''}`;
      
      return {
        status: statusLabel,
        description: description.trim(),
        time: new Date(tracking.trackedAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        isActive: index === 0, // First item is active
        icon: getStatusIcon(tracking.status),
      };
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return 'clock-outline';
      case 'PICKED_UP':
        return 'package-variant';
      case 'IN_TRANSIT':
        return 'local_shipping';
      case 'OUT_FOR_DELIVERY':
        return 'truck-delivery';
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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7f8', justifyContent: 'center', alignItems: 'center' }}>
        <HeaderBar title="Track Shipment" onBack={() => navigation.goBack()} />
        <ActivityIndicator size="large" color="#389cfa" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>Loading tracking details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !shipmentData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7f8' }}>
        <HeaderBar title="Track Shipment" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#ef4444', textAlign: 'center' }}>
            {error || 'Tracking information unavailable'}
          </Text>
          <Pressable
            onPress={fetchShipmentData}
            style={{
              marginTop: 20,
              paddingVertical: 12,
              paddingHorizontal: 24,
              backgroundColor: '#389cfa',
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleViewOrderDetails = () => {
    // Navigate to order details
    navigation.navigate('OrderDetail', { orderId });
  };

  const handleContactSupport = () => {
    // Open support chat or call - sẽ implement sau
    // Có thể navigate đến chat screen hoặc mở dialer
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7f8' }}>
      <HeaderBar title="Shipment Tracking" onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Shipment Summary Card */}
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}>
            <View>
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Est. Delivery Date
              </Text>
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#389cfa',
                marginTop: 4,
              }}>
                {shipmentData.estimatedDelivery}
              </Text>
            </View>
            <View style={{
              backgroundColor: '#dbeafe',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}>
              <Text style={{
                fontSize: 10,
                fontWeight: '700',
                color: '#389cfa',
                textTransform: 'uppercase',
              }}>
                {shipmentData.status}
              </Text>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: '#f3f4f6',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <MaterialCommunityIcons name="package-variant" size={20} color="#6b7280" />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                  Tracking #
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {shipmentData.trackingNumber}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: '#f3f4f6',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <MaterialCommunityIcons name="truck-delivery" size={20} color="#6b7280" />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                  Carrier
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {shipmentData.courier}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tracking Timeline */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#111827',
            marginBottom: 20,
          }}>
            Tracking Updates
          </Text>

          <View style={{ position: 'relative', paddingLeft: 20 }}>
            {/* Timeline line */}
            <View style={{
              position: 'absolute',
              left: 20,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: '#e5e7eb',
            }} />

            {shipmentData.updates.map((update, index) => (
              <View key={index} style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: index < shipmentData.updates.length - 1 ? 32 : 0,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
                  {/* Timeline dot */}
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: update.isActive ? '#389cfa' : '#22c55e',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 4,
                    borderColor: '#fff',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    marginRight: 16,
                  }}>
                    <MaterialCommunityIcons
                      name={update.icon}
                      size={16}
                      color="#fff"
                    />
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: update.isActive ? '#389cfa' : '#111827',
                      marginBottom: 4,
                    }}>
                      {update.status}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: '#6b7280',
                      lineHeight: 16,
                    }}>
                      {update.description}
                    </Text>
                  </View>
                </View>

                {/* Time */}
                <Text style={{
                  fontSize: 10,
                  fontWeight: '500',
                  color: '#9ca3af',
                  marginLeft: 12,
                }}>
                  {update.time}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          <Pressable
            onPress={handleViewOrderDetails}
            style={({ pressed }) => ({
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: '#389cfa',
              gap: 8,
              opacity: pressed ? 0.9 : 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            })}
          >
            <MaterialCommunityIcons name="receipt" size={20} color="#fff" />
            <Text style={{
              fontSize: 15,
              fontWeight: '700',
              color: '#fff',
            }}>
              Order Details
            </Text>
          </Pressable>

          <Pressable
            onPress={handleContactSupport}
            style={({ pressed }) => ({
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#e5e7eb',
              gap: 8,
              opacity: pressed ? 0.9 : 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            })}
          >
            <MaterialCommunityIcons name="headphones" size={20} color="#111827" />
            <Text style={{
              fontSize: 15,
              fontWeight: '700',
              color: '#111827',
            }}>
              Support
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShipmentTracking;