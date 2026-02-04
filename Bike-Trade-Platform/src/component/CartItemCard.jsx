import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatPrice } from '../utils/formatters';

const CartItemCard = ({ item, onRemove }) => {
  const vehicle = item.listing?.vehicle;
  const seller = item.listing?.seller;
  const media = item.listing?.media?.[0];
  const price = vehicle?.price ? formatPrice(vehicle.price) : '0';

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
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
        {media?.file_url ? (
          <Image
            source={{ uri: media.file_url }}
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
            {vehicle?.brand} {vehicle?.model}
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

          {seller?.full_name && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              <MaterialCommunityIcons name="account" size={12} color="#9ca3af" />
              <Text style={{ fontSize: 11, color: '#9ca3af' }} numberOfLines={1}>
                {seller.full_name}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#389cfa' }}>
            đ{price}
          </Text>
          
          {/* Delete Button */}
          <Pressable
            onPress={() => onRemove(item.cart_item_id)}
            style={({ pressed }) => ({
              padding: 8,
              borderRadius: 8,
              backgroundColor: '#fee2e2',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default CartItemCard;
