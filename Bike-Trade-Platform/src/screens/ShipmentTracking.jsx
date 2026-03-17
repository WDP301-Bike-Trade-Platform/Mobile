import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HeaderBar from '../component/HeaderBar';
import { SafeAreaView } from 'react-native-safe-area-context';

const ShipmentTracking = ({ navigation }) => {
  // Mock data - sẽ thay thế bằng API sau
  const shipmentData = {
    estimatedDelivery: 'Thursday, Oct 24',
    status: 'ON TIME',
    trackingNumber: 'PM-88294-BIKE-042',
    courier: 'SwiftWheels Delivery Service',
    updates: [
      {
        status: 'In Transit',
        description: 'Arrived at Sort Facility - San Francisco, CA',
        time: 'Today, 10:45 AM',
        isActive: true,
        icon: 'local_shipping',
      },
      {
        status: 'Shipped',
        description: 'Departed from Origin Warehouse - Seattle, WA',
        time: 'Yesterday, 4:20 PM',
        isActive: false,
        icon: 'check',
      },
      {
        status: 'Package Picked Up',
        description: 'Courier has collected your Specialized Allez',
        time: 'Oct 21, 9:15 AM',
        isActive: false,
        icon: 'check',
      },
      {
        status: 'Order Confirmed',
        description: 'Payment processed and seller notified',
        time: 'Oct 20, 2:30 PM',
        isActive: false,
        icon: 'check',
      },
    ],
  };

  const handleViewOrderDetails = () => {
    // Navigate to order details - sẽ implement sau
    // navigation.navigate('OrderDetail', { orderId: 'some-id' });
  };

  const handleContactSupport = () => {
    // Open support chat or call - sẽ implement sau
    // Có thể navigate đến chat screen hoặc mở dialer
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7f8' }}>
      <HeaderBar title="Track Shipment" onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Order Summary Card */}
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
                Estimated Delivery
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
                  Tracking Number
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
                  Courier
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {shipmentData.courier}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shipping Updates Timeline */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#111827',
            marginBottom: 20,
          }}>
            Shipping Updates
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
              View Order Details
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
              Contact Support
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShipmentTracking;