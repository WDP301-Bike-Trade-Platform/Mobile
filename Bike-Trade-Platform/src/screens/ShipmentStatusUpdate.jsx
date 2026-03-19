import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HeaderBar from '../component/HeaderBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getMyShipments,
  updateShipmentStatus,
  getStatusLabel,
  getStatusColor,
} from '../services/api.shipment';

const ShipmentStatusUpdate = ({ navigation }) => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected shipment
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    status: '',
    location: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Available statuses for manual update
  const availableStatuses = [
    { key: 'PICKED_UP', label: 'Picked Up', color: '#A78BFA' },
    { key: 'IN_TRANSIT', label: 'In Transit', color: '#60A5FA' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: '#34D399' },
    { key: 'DELIVERED', label: 'Delivered', color: '#22C55E' },
    { key: 'FAILED', label: 'Failed', color: '#EF4444' },
    { key: 'RETURNED', label: 'Returned', color: '#F97316' },
    { key: 'CANCELLED', label: 'Cancelled', color: '#6B7280' },
  ];

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    filterShipments();
  }, [searchQuery, shipments]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await getMyShipments({ take: 100 });
      // Only show shipments that are not already delivered or cancelled
      const activeShipments = (data.items || []).filter(
        s => s.status !== 'DELIVERED' && s.status !== 'CANCELLED'
      );
      setShipments(activeShipments);
      setError(null);
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError('Failed to load shipments');
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterShipments = () => {
    if (!searchQuery.trim()) {
      setFilteredShipments(shipments);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = shipments.filter(s =>
      s.trackingNumber?.toLowerCase().includes(query) ||
      s.orderId?.toLowerCase().includes(query) ||
      s.carrier?.toLowerCase().includes(query)
    );
    setFilteredShipments(filtered);
  };

  const handleSelectShipment = (shipment) => {
    setSelectedShipment(shipment);
    setFormData({
      status: shipment.status,
      location: '',
      description: '',
    });
    setShowForm(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedShipment || !formData.status) {
      Alert.alert('Error', 'Please select a status');
      return;
    }

    try {
      setSubmitting(true);
      await updateShipmentStatus(selectedShipment.shipmentId, {
        status: formData.status,
        location: formData.location,
        description: formData.description,
      });

      Alert.alert('Success', 'Shipment status updated successfully');
      setShowForm(false);
      setSelectedShipment(null);
      await fetchShipments();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update shipment status');
    } finally {
      setSubmitting(false);
    }
  };

  const renderShipmentItem = ({ item }) => (
    <Pressable
      onPress={() => handleSelectShipment(item)}
      style={({ pressed }) => ({
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
            Tracking #: {item.trackingNumber || 'N/A'}
          </Text>
          <Text style={{ fontSize: 13, color: '#111827', fontWeight: '600' }}>
            Order: {item.orderId?.slice(0, 12)}...
          </Text>
        </View>
        <View
          style={{
            backgroundColor: getStatusColor(item.status),
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <MaterialCommunityIcons name="truck-delivery" size={16} color="#6b7280" />
        <Text style={{ fontSize: 12, color: '#6b7280' }}>{item.carrier || 'Unknown'}</Text>
      </View>

      {item.estimatedDelivery && (
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialCommunityIcons name="calendar" size={16} color="#6b7280" />
          <Text style={{ fontSize: 12, color: '#6b7280' }}>
            Est. Delivery: {new Date(item.estimatedDelivery).toLocaleDateString('en-US')}
          </Text>
        </View>
      )}
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7f8' }}>
        <HeaderBar title="Update Shipment Status" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#389cfa" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7f8' }}>
      <HeaderBar title="Update Shipment Status" onBack={() => navigation.goBack()} />

      {!showForm ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
          {error && (
            <View
              style={{
                backgroundColor: '#FEE2E2',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                flexDirection: 'row',
                gap: 8,
              }}
            >
              <MaterialCommunityIcons name="alert-circle" size={20} color="#DC2626" />
              <Text style={{ color: '#DC2626', fontSize: 12, flex: 1 }}>{error}</Text>
            </View>
          )}

          {/* Search Bar */}
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" />
            <TextInput
              placeholder="Search by tracking #, order, carrier..."
              placeholderTextColor="#a3a3a3"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                fontSize: 12,
                color: '#111827',
              }}
            />
          </View>

          {/* Shipments List */}
          {filteredShipments.length > 0 ? (
            <FlatList
              data={filteredShipments}
              renderItem={renderShipmentItem}
              keyExtractor={(item) => item.shipmentId}
              scrollEnabled={false}
              ListHeaderComponent={
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
                  Available Shipments ({filteredShipments.length})
                </Text>
              }
            />
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <MaterialCommunityIcons name="package-variant" size={48} color="#cbd5e1" />
              <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 12 }}>
                {searchQuery ? 'No shipments found' : 'No active shipments'}
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        // Update Form
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
          {/* Selected Shipment Info */}
          {selectedShipment && (
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 8 }}>
                SELECTED SHIPMENT
              </Text>
              <Text style={{ fontSize: 13, color: '#111827', marginBottom: 8 }}>
                Tracking: {selectedShipment.trackingNumber}
              </Text>
              <Text style={{ fontSize: 13, color: '#111827', marginBottom: 8 }}>
                Order: {selectedShipment.orderId}
              </Text>
              <Text style={{ fontSize: 13, color: '#111827', marginBottom: 8 }}>
                Carrier: {selectedShipment.carrier}
              </Text>
              <View
                style={{
                  backgroundColor: getStatusColor(selectedShipment.status),
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
                  Current: {getStatusLabel(selectedShipment.status)}
                </Text>
              </View>
            </View>
          )}

          {/* Status Selection */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
              Select New Status *
            </Text>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              {availableStatuses.map((status) => (
                <Pressable
                  key={status.key}
                  onPress={() => setFormData({ ...formData, status: status.key })}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    marginVertical: 4,
                    borderRadius: 8,
                    backgroundColor:
                      formData.status === status.key
                        ? status.color
                        : '#f3f4f6',
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: formData.status === status.key ? '#fff' : '#d1d5db',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    {formData.status === status.key && (
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' }} />
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: formData.status === status.key ? '#fff' : '#111827',
                      flex: 1,
                    }}
                  >
                    {status.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Location Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
              Location (Optional)
            </Text>
            <TextInput
              placeholder="e.g., Hanoi, HCMC, New York"
              placeholderTextColor="#a3a3a3"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 12,
                backgroundColor: '#fff',
              }}
            />
          </View>

          {/* Description Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
              Description (Optional)
            </Text>
            <TextInput
              placeholder="Enter detailed tracking information..."
              placeholderTextColor="#a3a3a3"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 12,
                backgroundColor: '#fff',
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Info Box */}
          <View
            style={{
              backgroundColor: '#DBEAFE',
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 12, color: '#0284C7', lineHeight: 18 }}>
              📝 This update will be recorded as a manual status change. The shipment tracking timeline will be updated accordingly.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            <Pressable
              disabled={submitting}
              onPress={handleUpdateStatus}
              style={({ pressed }) => ({
                backgroundColor: '#22C55E',
                paddingVertical: 14,
                borderRadius: 10,
                opacity: pressed || submitting ? 0.8 : 1,
              })}
            >
              <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 14 }}>
                {submitting ? 'Updating...' : 'Update Status'}
              </Text>
            </Pressable>

            <Pressable
              disabled={submitting}
              onPress={() => {
                setShowForm(false);
                setSelectedShipment(null);
                setFormData({
                  status: '',
                  location: '',
                  description: '',
                });
              }}
              style={({ pressed }) => ({
                backgroundColor: '#f3f4f6',
                paddingVertical: 14,
                borderRadius: 10,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: '#6b7280', fontWeight: '700', textAlign: 'center', fontSize: 14 }}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ShipmentStatusUpdate;
