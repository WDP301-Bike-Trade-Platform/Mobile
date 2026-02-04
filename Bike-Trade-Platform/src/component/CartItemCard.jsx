import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatPrice } from '../utils/formatters';

const CartItemCard = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (newQuantity) => {
    const qty = parseInt(newQuantity) || 1;
    if (qty > 0 && qty !== item.quantity) {
      onUpdateQuantity(item.cart_item_id, qty);
    }
  };

  const itemTotal = item.listing?.vehicle?.price 
    ? formatPrice(item.listing.vehicle.price) 
    : '0';

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
      }}
    >
      {/* Product Info */}
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: '#111827',
            marginBottom: 4,
          }}
          numberOfLines={2}
        >
          {item.listing?.vehicle?.brand} {item.listing?.vehicle?.model}
        </Text>
        <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
          Year: {item.listing?.vehicle?.year}
        </Text>
        <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Seller: {item.listing?.seller?.full_name}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#389cfa' }}>
          đ{itemTotal}
        </Text>
      </View>

      {/* Quantity and Actions */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          paddingTop: 12,
        }}
      >
        {/* Quantity Controls */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 14, color: '#6b7280', fontWeight: '600' }}>
            Qty:
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              onPress={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              style={({ pressed }) => ({
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: item.quantity <= 1 ? '#f3f4f6' : '#dbeafe',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <MaterialCommunityIcons
                name="minus"
                size={18}
                color={item.quantity <= 1 ? '#9ca3af' : '#3b82f6'}
              />
            </Pressable>
            <TextInput
              value={String(item.quantity)}
              onChangeText={handleQuantityChange}
              keyboardType="number-pad"
              style={{
                width: 40,
                height: 32,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: '600',
                color: '#111827',
              }}
            />
            <Pressable
              onPress={() => handleQuantityChange(item.quantity + 1)}
              style={({ pressed }) => ({
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#dbeafe',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#3b82f6" />
            </Pressable>
          </View>
        </View>

        {/* Remove Button */}
        <Pressable
          onPress={() => onRemove(item.cart_item_id)}
          style={({ pressed }) => ({
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            backgroundColor: '#fee2e2',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  );
};

export default CartItemCard;
