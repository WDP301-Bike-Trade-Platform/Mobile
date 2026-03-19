import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HeaderBar from '../component/HeaderBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getMyShipments,
  confirmShipmentReady,
  updateShipmentStatus,
  getStatusLabel,
  getStatusColor,
} from '../services/api.shipment';

const SellerShipmentManagement = ({ navigation }) => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('PENDING');

  // Modal state
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    location: '',
    description: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const statuses = [
    { key: 'PENDING', label: 'Pending', color: '#FCD34D' },
    { key: 'PICKED_UP', label: 'Picked Up', color: '#A78BFA' },
    { key: 'IN_TRANSIT', label: 'In Transit', color: '#60A5FA' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: '#34D399' },
    { key: 'DELIVERED', label: 'Delivered', color: '#22C55E' },
    { key: 'FAILED', label: 'Failed', color: '#EF4444' },
  ];

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    filterShipments();
  }, [activeFilter, shipments]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await getMyShipments({ take: 100 });
      // Filter only seller's shipments (those they can manage)
      setShipments(data.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError('Unable to load shipment list');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShipments();
    setRefreshing(false);
  };

  const filterShipments = () => {
    let filtered = shipments;
    if (activeFilter !== 'ALL') {
      filtered = shipments.filter(s => s.status === activeFilter);
    }
    setFilteredShipments(filtered);
  };

  const handleOpenModal = (shipment, action) => {
    setSelectedShipment(shipment);
    setActionType(action);
    setFormData({
      status: shipment.status || '',
      location: '',
      description: '',
      reason: '',
    });
    setModalVisible(true);
  };

  const handleConfirmReady = async () => {
    if (!selectedShipment) return;

    try {
      setSubmitting(true);
      await confirmShipmentReady(selectedShipment.shipmentId);
      Alert.alert('Success', 'Confirmed preparation. Shipment is ready for pickup');
      setModalVisible(false);
      await fetchShipments();
    } catch (err) {
      Alert.alert('Error', err.message || 'Confirmation failed');
    } finally {
      setSubmitting(false);
    }
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
      setModalVisible(false);
      await fetchShipments();
    } catch (err) {
      Alert.alert('Error', err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };



  const renderShipmentCard = (shipment) => (
    <Pressable
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
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
            Tracking #: {shipment.trackingNumber}
          </Text>
          <Text style={{ fontSize: 13, color: '#111827' }}>
            Order: {shipment.orderId?.slice(0, 12)}
          </Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View
            style={{
              backgroundColor: getStatusColor(shipment.status),
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>
              {getStatusLabel(shipment.status)}
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: '#6b7280' }}>
            ₹{shipment.shippingFee?.toLocaleString('en-US') || '0'}
          </Text>
        </View>
      </View>

      {/* Carrier Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <MaterialCommunityIcons name="truck-delivery" size={16} color="#6b7280" />
        <Text style={{ fontSize: 12, color: '#6b7280' }}>{shipment.carrier}</Text>
      </View>

      {/* Actions */}
      {shipment.status === 'PENDING' && (
        <Pressable
          onPress={() => handleOpenModal(shipment, 'confirm')}
          style={({ pressed }) => ({
            backgroundColor: '#22C55E',
            paddingVertical: 10,
            borderRadius: 8,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center', fontSize: 12 }}>
            ✓ Xác nhận đã chuẩn bị
          </Text>
        </Pressable>
      )}

      {shipment.status !== 'DELIVERED' && shipment.status !== 'CANCELLED' && shipment.status !== 'PENDING' && (
        <Pressable
          onPress={() => handleOpenModal(shipment, 'update')}
          style={({ pressed }) => ({
            backgroundColor: '#389cfa',
            paddingVertical: 10,
            borderRadius: 8,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center', fontSize: 12 }}>
            📝 Cập nhật trạng thái
          </Text>
        </Pressable>
      )}

      {/* Estimated Delivery */}
      {shipment.estimatedDelivery && (
        <View style={{ marginTop: 12, backgroundColor: '#f3f4f6', padding: 8, borderRadius: 6 }}>
          <Text style={{ fontSize: 10, color: '#6b7280' }}>Est. Delivery</Text>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#389cfa' }}>
            {new Date(shipment.estimatedDelivery).toLocaleDateString('en-US')}
          </Text>
        </View>
      )}
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7f8' }}>
      <HeaderBar title="Shipment Management" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#389cfa" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7f8' }}>
      <HeaderBar title="Quản lý vận chuyển" onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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

        {/* Action Button - Go to Status Update Page */}
        <Pressable
          onPress={() => navigation.navigate('ShipmentStatusUpdate')}
          style={({ pressed }) => ({
            backgroundColor: '#10b981',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <MaterialCommunityIcons name="pencil-box-outline" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
            Update Status Page
          </Text>
        </Pressable>

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].map((status) => (
              <Pressable
                key={status}
                onPress={() => setActiveFilter(status)}
                style={({pressed}) => ({
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: activeFilter === status ? '#389cfa' : '#fff',
                  borderWidth: activeFilter === status ? 0 : 1,
                  borderColor: '#e5e7eb',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: activeFilter === status ? '#fff' : '#6b7280',
                  }}
                >
                  {getStatusLabel(status)}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Shipment List */}
        {filteredShipments.length > 0 ? (
          filteredShipments.map((shipment) => (
            <View key={shipment.shipmentId}>{renderShipmentCard(shipment)}</View>
          ))
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <MaterialCommunityIcons name="package-variant" size={48} color="#cbd5e1" />
            <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 12 }}>
              No shipments
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor: 'transparent',
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                maxHeight: '80%',
              }}
            >
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
                  {actionType === 'confirm'
                  ? 'Confirm Ready'
                  : 'Update Status'}
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Shipment Info */}
                {selectedShipment && (
                  <View
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: '#6b7280' }}>Tracking #</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }}>
                      {selectedShipment.trackingNumber}
                    </Text>
                  </View>
                )}

                {/* Status Dropdown (for update) */}
                {actionType === 'update' && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                      Select Status *
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ gap: 8 }}>
                      {statuses.map((status) => (
                        <Pressable
                          key={status.key}
                          onPress={() => setFormData({ ...formData, status: status.key })}
                          style={({pressed}) => ({
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            backgroundColor:
                              formData.status === status.key ? status.color : '#f3f4f6',
                            borderWidth: formData.status === status.key ? 0 : 1,
                            borderColor: '#e5e7eb',
                            opacity: pressed ? 0.8 : 1,
                          })}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '600',
                              color:
                                formData.status === status.key ? '#fff' : '#6b7280',
                            }}
                          >
                            {status.label}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Location Input (for update) */}
                {actionType === 'update' && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                      Location (Optional)
                    </Text>
                    <TextInput
                      placeholder="E.g.: Hanoi, HCMC"
                      placeholderTextColor="#a3a3a3"
                      value={formData.location}
                      onChangeText={(text) =>
                        setFormData({ ...formData, location: text })
                      }
                      style={{
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        fontSize: 12,
                      }}
                    />
                  </View>
                )}

                {/* Description Input (for update) */}
                {actionType === 'update' && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                      Description (Optional)
                    </Text>
                    <TextInput
                      placeholder="Enter tracking details"
                      placeholderTextColor="#a3a3a3"
                      value={formData.description}
                      onChangeText={(text) =>
                        setFormData({ ...formData, description: text })
                      }
                      multiline
                      numberOfLines={3}
                      style={{
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        fontSize: 12,
                        textAlignVertical: 'top',
                      }}
                    />
                  </View>
                )}



                {/* Confirm Message (for confirm) */}
                {actionType === 'confirm' && (
                  <View
                    style={{
                      backgroundColor: '#DBEAFE',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#0284C7' }}>
                      Confirming preparation will mark this shipment as ready for carrier pickup.
                    </Text>
                  </View>
                )}

                {/* Success Message (for cancel removed - no longer supported) */}

                {/* Action Buttons */}
                <View style={{ gap: 8, marginTop: 20 }}>
                  <Pressable
                    disabled={submitting}
                    onPress={() => {
                      if (actionType === 'confirm') handleConfirmReady();
                      else if (actionType === 'update') handleUpdateStatus();
                    }}
                    style={({pressed}) => ({
                      backgroundColor: '#22C55E',
                      paddingVertical: 12,
                      borderRadius: 8,
                      opacity: pressed || submitting ? 0.8 : 1,
                    })}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>
                      {submitting
                        ? 'Processing...'
                        : actionType === 'confirm'
                        ? 'Confirm'
                        : 'Update'}
                    </Text>
                  </Pressable>

                  <Pressable
                    disabled={submitting}
                    onPress={() => setModalVisible(false)}
                    style={({pressed}) => ({
                      backgroundColor: '#f3f4f6',
                      paddingVertical: 12,
                      borderRadius: 8,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text style={{ color: '#6b7280', fontWeight: '600', textAlign: 'center' }}>
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default SellerShipmentManagement;
