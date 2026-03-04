import React, { useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatPrice } from '../utils/formatters';

const CartItemCard = ({ item, onQuantityChange, onRemove, isOptimistic = false }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Support both API response format and Redux format
  const vehicle = item.listing?.vehicle || item.product;
  const seller = item.listing?.seller || item.seller;
  const media = item.listing?.media?.[0] || item.product?.images?.[0];
  const price = item.price || vehicle?.price || 0;
  const quantity = item.quantity || 1;
  
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await onQuantityChange(newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: isOptimistic ? '#f0f9ff' : '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: isOptimistic ? '#38bdf8' : '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        opacity: isUpdating ? 0.7 : 1,
      }}
    >
      {/* Optimistic indicator */}
      {isOptimistic && (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: '#38bdf8',
            borderRadius: 10,
            paddingHorizontal: 6,
            paddingVertical: 2,
            zIndex: 1,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>Adding...</Text>
        </View>
      )}
      
      {/* Product Image */}
      <View
        style={{
          width: 90,
          height: 90,
          borderRadius: 8,
          backgroundColor: '#f3f4f6',
          overflow: 'hidden',
          marginRight: 12,
        }}
      >
        {(media?.file_url || media?.url || media) ? (
          <Image
            source={{ uri: media?.file_url || media?.url || media }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialCommunityIcons name="bike" size={40} color="#d1d5db" />
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: '#111827',
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {vehicle?.brand && vehicle?.model 
              ? `${vehicle.brand} ${vehicle.model}`
              : vehicle?.title || vehicle?.name || 'Product'
            }
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {vehicle?.year && (
              <View
                style={{
                  backgroundColor: '#f3f4f6',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#6b7280' }}>
                  {vehicle.year}
                </Text>
              </View>
            )}
            {vehicle?.frame_size && (
              <View
                style={{
                  backgroundColor: '#f3f4f6',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#6b7280' }}>
                  {vehicle.frame_size}
                </Text>
              </View>
            )}
          </View>

          {(seller?.full_name || seller?.name) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              <MaterialCommunityIcons name="account" size={12} color="#9ca3af" />
              <Text style={{ fontSize: 11, color: '#9ca3af' }} numberOfLines={1}>
                {seller.full_name || seller.name}
              </Text>
            </View>
          )}
        </View>

        <View>
          {/* Quantity Controls */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#389cfa' }}>
              đ{formatPrice(price)}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable
                onPress={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isOptimistic || isUpdating}
                style={({ pressed }) => ({
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: quantity <= 1 || isOptimistic ? '#f3f4f6' : '#389cfa',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <MaterialCommunityIcons 
                  name="minus" 
                  size={16} 
                  color={quantity <= 1 || isOptimistic ? '#9ca3af' : '#fff'} 
                />
              </Pressable>
              
              <Text style={{ fontSize: 16, fontWeight: '600', minWidth: 20, textAlign: 'center' }}>
                {quantity}
              </Text>
              
              <Pressable
                onPress={() => handleQuantityChange(quantity + 1)}
                disabled={isOptimistic || isUpdating}
                style={({ pressed }) => ({
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: isOptimistic ? '#f3f4f6' : '#389cfa',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <MaterialCommunityIcons 
                  name="plus" 
                  size={16} 
                  color={isOptimistic ? '#9ca3af' : '#fff'} 
                />
              </Pressable>
            </View>
          </View>
          
          {/* Delete Button */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Pressable
              onPress={onRemove}
              disabled={isOptimistic || isUpdating}
              style={({ pressed }) => ({
                padding: 8,
                borderRadius: 8,
                backgroundColor: isOptimistic ? '#f3f4f6' : '#fee2e2',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <MaterialCommunityIcons 
                name="trash-can-outline" 
                size={18} 
                color={isOptimistic ? '#9ca3af' : '#ef4444'} 
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CartItemCard;
