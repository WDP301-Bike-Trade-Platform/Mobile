import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createOrder, checkoutCart } from '../services/api.order';
import { createPaymentForOrder } from '../services/api.payment';
import { getMyAddresses, getDefaultAddress } from '../services/api.address';
import HeaderBar from '../component/HeaderBar';
import { formatPrice } from '../utils/formatters';

const DEPOSIT_RATE = 0.1;

const Checkout = ({ route, navigation }) => {
  const { listing, cartItems, totalAmount, offerId } = route.params;
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('PAYOS');
  const [isDepositPayment, setIsDepositPayment] = useState(false);

  const orderTotal = totalAmount || listing?.price || listing?.offeredPrice || 0;
  const depositAmount = Math.round(orderTotal * DEPOSIT_RATE * 100) / 100;
  const payableNow =
    paymentMethod === 'PAYOS' && isDepositPayment ? depositAmount : orderTotal;

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const [defaultAddressRes, allAddressesRes] = await Promise.all([
        getDefaultAddress(),
        getMyAddresses(),
      ]);

      const defaultAddr = defaultAddressRes?.data || defaultAddressRes;
      const allAddrs = allAddressesRes?.data || allAddressesRes;

      setAddresses(Array.isArray(allAddrs) ? allAddrs : []);
      
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      } else if (allAddrs && allAddrs.length > 0) {
        setSelectedAddress(allAddrs[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a shipping address');
      return;
    }

    try {
      setLoading(true);

      // Check if checkout from cart or single listing
      if (cartItems && cartItems.length > 0) {
        // Checkout from cart
        const useDeposit = paymentMethod === 'PAYOS' && isDepositPayment;
        const checkoutData = {
          paymentMethod,
          isDeposit: useDeposit,
          shippingAddressId: selectedAddress.address_id,
          deliveryPhone: selectedAddress.phone || undefined,
        };

        const orders = await checkoutCart(checkoutData);

        if (Array.isArray(orders) && orders.length > 0) {
          if (paymentMethod === 'PAYOS' && orders.length === 1) {
            // Single order with PAYOS - proceed to payment
            const orderId = orders[0].order_id;
            const paymentData = await createPaymentForOrder(orderId, {
              paymentStage: useDeposit ? 'DEPOSIT' : undefined,
              platform: 'MOBILE',
            });

            if (paymentData.paymentLink) {
              await Linking.openURL(paymentData.paymentLink);
              Alert.alert(
                'Order Placed',
                'Please complete the payment in your browser',
                [{ text: 'OK', onPress: () => navigation.navigate('MyOrders') }]
              );
            } else {
              Alert.alert('Success', 'Order created', [
                { text: 'OK', onPress: () => navigation.navigate('MyOrders') },
              ]);
            }
          } else {
            Alert.alert(
              'Success',
              `${orders.length} orders created successfully`,
              [{ text: 'OK', onPress: () => navigation.navigate('MyOrders') }]
            );
          }
        }
      } else if (listing) {
        // Checkout single listing - create order first
        const useDeposit = paymentMethod === 'PAYOS' && isDepositPayment;
        const orderData = {
          listingId: listing.listing_id || listing.id,
          paymentMethod,
          isDeposit: useDeposit,
          shippingAddressId: selectedAddress.address_id,
          deliveryPhone: selectedAddress.phone || undefined,
          note: note || undefined,
          offerId: offerId || undefined,
        };

        const order = await createOrder(orderData);

        if (paymentMethod === 'PAYOS' && order?.order_id) {
          const paymentData = await createPaymentForOrder(order.order_id, {
            paymentStage: useDeposit ? 'DEPOSIT' : undefined,
            platform: 'MOBILE',
          });

          if (paymentData.paymentLink) {
            await Linking.openURL(paymentData.paymentLink);
            Alert.alert(
              'Order Placed',
              'Please complete the payment in your browser',
              [{ text: 'OK', onPress: () => navigation.navigate('MyOrders') }]
            );
          } else {
            Alert.alert('Success', 'Order created', [
              { text: 'OK', onPress: () => navigation.navigate('MyOrders') },
            ]);
          }
        } else {
          Alert.alert('Success', 'COD order created', [
            { text: 'OK', onPress: () => navigation.navigate('MyOrders') },
          ]);
        }
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      const errMsg = error.response?.data?.message;
      const message = Array.isArray(errMsg)
        ? errMsg.join('\n')
        : (errMsg || error.message || 'Unable to complete the order');
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
      <HeaderBar title="Checkout" onBack={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Product Summary */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
            {cartItems && cartItems.length > 0 ? `Products (${cartItems.length})` : 'Product'}
          </Text>
          {cartItems && cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <View
                key={item.cart_item_id || index}
                style={{
                  paddingVertical: 12,
                  borderTopWidth: index > 0 ? 1 : 0,
                  borderTopColor: '#f3f4f6',
                }}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 }}
                  numberOfLines={2}
                >
                  {item.listing?.title || `${item.listing?.vehicle?.brand || ''} ${item.listing?.vehicle?.model || ''}`.trim()}
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#389cfa' }}>
                  đ{formatPrice(item.listing?.vehicle?.price || 0)}
                </Text>
              </View>
            ))
          ) : listing ? (
            <>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 8 }} numberOfLines={2}>
                {listing.title}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#389cfa' }}>
                đ{formatPrice(listing.price)}
              </Text>
            </>
          ) : null}
        </View>

        {/* Shipping Address */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
              Shipping Address
            </Text>
            <Pressable onPress={() => setShowAddressModal(true)}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#389cfa' }}>
                Change
              </Text>
            </Pressable>
          </View>
          {loadingAddresses ? (
            <ActivityIndicator size="small" color="#389cfa" />
          ) : selectedAddress ? (
            <View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                {selectedAddress.recipient_name}
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 2 }}>
                {selectedAddress.phone}
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>
                {selectedAddress.address_line1}
                {'\n'}
                {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.city}
              </Text>
              {selectedAddress.is_default && (
                <View style={{ 
                  marginTop: 8, 
                  paddingHorizontal: 8, 
                  paddingVertical: 4, 
                  backgroundColor: '#dbeafe', 
                  borderRadius: 6,
                  alignSelf: 'flex-start'
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#3b82f6' }}>
                    Default
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Pressable onPress={() => navigation.navigate('AddEditAddress')}>
              <Text style={{ fontSize: 14, color: '#389cfa', fontWeight: '600' }}>
                + Add shipping address
              </Text>
            </Pressable>
          )}
        </View>

        {/* Payment Method */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
            Payment Method
          </Text>
          {[
            { key: 'PAYOS', label: 'PayOS', desc: 'Online payment via bank transfer', icon: 'credit-card-outline' },
            { key: 'COD', label: 'COD', desc: 'Cash on delivery', icon: 'cash' },
          ].map((method) => (
            <Pressable
              key={method.key}
              onPress={() => {
                setPaymentMethod(method.key);
                if (method.key === 'COD') {
                  setIsDepositPayment(false);
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                marginBottom: 8,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: paymentMethod === method.key ? '#389cfa' : '#e5e7eb',
                backgroundColor: paymentMethod === method.key ? '#f0f9ff' : '#fff',
                gap: 12,
              }}
            >
              <MaterialCommunityIcons
                name={method.icon}
                size={24}
                color={paymentMethod === method.key ? '#389cfa' : '#9ca3af'}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
                  {method.label}
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {method.desc}
                </Text>
              </View>
              <View style={{
                width: 22, height: 22, borderRadius: 11,
                borderWidth: 2,
                borderColor: paymentMethod === method.key ? '#389cfa' : '#d1d5db',
                justifyContent: 'center', alignItems: 'center',
              }}>
                {paymentMethod === method.key && (
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#389cfa' }} />
                )}
              </View>
            </Pressable>
          ))}

        
        </View>

        {paymentMethod === 'PAYOS' && !offerId && (
         <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
              Payment Options
            </Text>
            <View style={{ marginTop: 8, gap: 8 }}>
              <Pressable
                onPress={() => setIsDepositPayment(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: isDepositPayment ? '#389cfa' : '#e5e7eb',
                  backgroundColor: isDepositPayment ? '#f0f9ff' : '#fff',
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                    Pay 10% deposit now
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    Pay now: đ{formatPrice(depositAmount)}
                  </Text>
                </View>
                {isDepositPayment && (
                  <MaterialCommunityIcons name="check-circle" size={22} color="#389cfa" />
                )}
              </Pressable>

              <Pressable
                onPress={() => setIsDepositPayment(false)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: !isDepositPayment ? '#389cfa' : '#e5e7eb',
                  backgroundColor: !isDepositPayment ? '#f0f9ff' : '#fff',
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                    Pay full amount now
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    Pay now: đ{formatPrice(orderTotal)}
                  </Text>
                </View>
                {!isDepositPayment && (
                  <MaterialCommunityIcons name="check-circle" size={22} color="#389cfa" />
                )}
              </Pressable>
            </View>
          </View>
          )}

        {/* Note */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
            Note (Optional)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              fontSize: 14,
              color: '#111827',
              textAlignVertical: 'top',
              minHeight: 100,
            }}
            placeholder="Add a note for your order"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Total */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          {paymentMethod === 'PAYOS' && isDepositPayment ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  Order total
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  đ{formatPrice(orderTotal)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  Deposit (10%)
                </Text>
                <Text style={{ fontSize: 14, color: '#111827', fontWeight: '600' }}>
                  đ{formatPrice(depositAmount)}
                </Text>
              </View>
            </>
          ) : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
              Pay now
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#389cfa' }}>
              đ{formatPrice(payableNow)}
            </Text>
          </View>
        </View>

        {/* Note for cart checkout */}
        {cartItems && cartItems.length > 0 && (
          <View style={{ backgroundColor: '#fffbeb', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: '#92400e', fontStyle: 'italic' }}>
              * Your cart will be split into separate orders per seller
            </Text>
          </View>
        )}

        {/* Checkout Button */}
        <Pressable
          onPress={handleCheckout}
          disabled={loading}
          style={({ pressed }) => ({
            paddingVertical: 14,
            borderRadius: 10,
            backgroundColor: loading ? '#d1d5db' : '#389cfa',
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
              Place Order
            </Text>
          )}
        </Pressable>
      </ScrollView>

      {/* Address Selection Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end'
        }}>
          <View style={{ 
            backgroundColor: '#fff', 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24,
            maxHeight: '80%'
          }}>
            {/* Modal Header */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb'
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                Select Address
              </Text>
              <Pressable onPress={() => setShowAddressModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            {/* Address List */}
            <ScrollView style={{ padding: 16 }}>
              {addresses.map((address) => (
                <Pressable
                  key={address.address_id}
                  onPress={() => {
                    setSelectedAddress(address);
                    setShowAddressModal(false);
                  }}
                  style={{
                    backgroundColor: selectedAddress?.address_id === address.address_id ? '#f0f9ff' : '#fff',
                    borderWidth: 1,
                    borderColor: selectedAddress?.address_id === address.address_id ? '#389cfa' : '#e5e7eb',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
                          {address.recipient_name}
                        </Text>
                        {address.is_default && (
                          <View style={{ 
                            paddingHorizontal: 8, 
                            paddingVertical: 2, 
                            backgroundColor: '#dbeafe', 
                            borderRadius: 4
                          }}>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#3b82f6' }}>
                              Default
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>
                        {address.phone}
                      </Text>
                      <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 18 }}>
                        {address.address_line1}
                        {'\n'}
                        {address.ward}, {address.district}, {address.city}
                      </Text>
                    </View>
                    {selectedAddress?.address_id === address.address_id && (
                      <MaterialCommunityIcons name="check-circle" size={24} color="#389cfa" />
                    )}
                  </View>
                </Pressable>
              ))}

              {/* Add New Address Button */}
              <Pressable
                onPress={() => {
                  setShowAddressModal(false);
                  navigation.navigate('AddEditAddress');
                }}
                style={{
                  borderWidth: 1,
                  borderColor: '#389cfa',
                  borderStyle: 'dashed',
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="plus-circle" size={20} color="#389cfa" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#389cfa' }}>
                    Add New Address
                  </Text>
                </View>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Checkout;
