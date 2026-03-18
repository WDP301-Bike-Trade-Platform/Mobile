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
  cancelShipment,
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
    { key: 'PENDING', label: 'Chờ xử lý', color: '#FCD34D' },
    { key: 'PICKED_UP', label: 'Đã lấy hàng', color: '#A78BFA' },
    { key: 'IN_TRANSIT', label: 'Đang vận chuyển', color: '#60A5FA' },
    { key: 'OUT_FOR_DELIVERY', label: 'Sắp giao', color: '#34D399' },
    { key: 'DELIVERED', label: 'Đã giao', color: '#22C55E' },
    { key: 'FAILED', label: 'Giao thất bại', color: '#EF4444' },
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
      setError('Không thể tải danh sách vận chuyển');
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
      Alert.alert('Thành công', 'Đã xác nhận chuẩn bị hàng. Hàng sẽ được giao cho đơn vị vận chuyển');
      setModalVisible(false);
      await fetchShipments();
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Xác nhận thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedShipment || !formData.status) {
      Alert.alert('Lỗi', 'Vui lòng chọn trạng thái');
      return;
    }

    try {
      setSubmitting(true);
      await updateShipmentStatus(selectedShipment.shipmentId, {
        status: formData.status,
        location: formData.location,
        description: formData.description,
      });
      Alert.alert('Thành công', 'Cập nhật trạng thái vận chuyển thành công');
      setModalVisible(false);
      await fetchShipments();
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Cập nhật thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelShipment = async () => {
    if (!selectedShipment) return;

    Alert.alert(
      'Xác nhận hủy',
      'Bạn có chắc muốn hủy vận chuyển này?',
      [
        { text: 'Hủy bỏ', onPress: () => {} },
        {
          text: 'Hủy vận chuyển',
          onPress: async () => {
            try {
              setSubmitting(true);
              await cancelShipment(selectedShipment.shipmentId, {
                reason: formData.reason || 'Người bán hủy',
              });
              Alert.alert('Thành công', 'Vận chuyển đã bị hủy');
              setModalVisible(false);
              await fetchShipments();
            } catch (err) {
              Alert.alert('Lỗi', err.message || 'Hủy thất bại');
            } finally {
              setSubmitting(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
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
            Vận đơn: {shipment.trackingNumber}
          </Text>
          <Text style={{ fontSize: 13, color: '#111827' }}>
            Mã đơn: {shipment.orderId?.slice(0, 12)}
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
            ₹{shipment.shippingFee?.toLocaleString('vi-VN') || '0'}
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
        <View style={{ gap: 8 }}>
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
          <Pressable
            onPress={() => handleOpenModal(shipment, 'cancel')}
            style={({ pressed }) => ({
              backgroundColor: '#EF4444',
              paddingVertical: 10,
              borderRadius: 8,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center', fontSize: 12 }}>
              ✕ Hủy
            </Text>
          </Pressable>
        </View>
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
          <Text style={{ fontSize: 10, color: '#6b7280' }}>Dự kiến giao</Text>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#389cfa' }}>
            {new Date(shipment.estimatedDelivery).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      )}
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7f8' }}>
        <HeaderBar title="Quản lý vận chuyển" onBack={() => navigation.goBack()} />
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

        {/* Filter Tabs */}
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
              Không có vận chuyển nào
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
                    ? 'Xác nhận chuẩn bị'
                    : actionType === 'cancel'
                    ? 'Hủy vận chuyển'
                    : 'Cập nhật trạng thái'}
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
                    <Text style={{ fontSize: 11, color: '#6b7280' }}>Vận đơn</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }}>
                      {selectedShipment.trackingNumber}
                    </Text>
                  </View>
                )}

                {/* Status Dropdown (for update) */}
                {actionType === 'update' && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                      Chọn trạng thái *
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
                      Vị trí (tùy chọn)
                    </Text>
                    <TextInput
                      placeholder="VD: Hà Nội, TP.HCM"
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
                      Mô tả cập nhật (tùy chọn)
                    </Text>
                    <TextInput
                      placeholder="Nhập mô tả chi tiết"
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

                {/* Reason Input (for cancel) */}
                {actionType === 'cancel' && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                      Lý do hủy (tùy chọn)
                    </Text>
                    <TextInput
                      placeholder="Nhập lý do hủy vận chuyển"
                      placeholderTextColor="#a3a3a3"
                      value={formData.reason}
                      onChangeText={(text) =>
                        setFormData({ ...formData, reason: text })
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
                      Bạn sắp xác nhận đã chuẩn bị hàng. Hàng sẽ được đánh dấu là
                      "Đã lấy" và sẵn sàng để giao cho đơn vị vận chuyển.
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={{ gap: 8, marginTop: 20 }}>
                  <Pressable
                    disabled={submitting}
                    onPress={() => {
                      if (actionType === 'confirm') handleConfirmReady();
                      else if (actionType === 'update') handleUpdateStatus();
                      else if (actionType === 'cancel') handleCancelShipment();
                    }}
                    style={({pressed}) => ({
                      backgroundColor: actionType === 'cancel' ? '#EF4444' : '#22C55E',
                      paddingVertical: 12,
                      borderRadius: 8,
                      opacity: pressed || submitting ? 0.8 : 1,
                    })}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>
                      {submitting
                        ? 'Đang xử lý...'
                        : actionType === 'confirm'
                        ? 'Xác nhận'
                        : actionType === 'cancel'
                        ? 'Hủy vận chuyển'
                        : 'Cập nhật'}
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
                      Hủy bỏ
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
