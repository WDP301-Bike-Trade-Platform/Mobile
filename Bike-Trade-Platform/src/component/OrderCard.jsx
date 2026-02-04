import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import { formatPrice, formatDate } from '../utils/formatters';

const OrderCard = ({ order, onPress, onAction, actionType }) => {
  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      CONFIRMED: '#3b82f6',
      COMPLETED: '#10b981',
      CANCELLED: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };
    return texts[status] || status;
  };

  const getActionButton = () => {
    if (actionType === 'cancel' && order.status === 'PENDING') {
      return (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => ({
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: '#fee2e2',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#ef4444' }}>
            Cancel Order
          </Text>
        </Pressable>
      );
    }

    if (actionType === 'confirm' && order.status === 'PENDING') {
      return (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => ({
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: '#dbeafe',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#3b82f6' }}>
            Confirm Order
          </Text>
        </Pressable>
      );
    }

    if (actionType === 'complete' && order.status === 'CONFIRMED') {
      return (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => ({
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: '#d1fae5',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#10b981' }}>
            Complete Order
          </Text>
        </Pressable>
      );
    }

    return null;
  };

  return (
    <Pressable
      onPress={onPress}
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
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}>
            Order #{order.order_id?.slice(0, 8)}
          </Text>
          <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            {formatDate(order.created_at)}
          </Text>
        </View>
        <StatusBadge
          status={order.status}
          color={getStatusColor(order.status)}
          text={getStatusText(order.status)}
        />
      </View>

      {/* Product Info */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          paddingTop: 12,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: '#111827',
            marginBottom: 6,
          }}
          numberOfLines={2}
        >
          {order.listing?.title || 'N/A'}
        </Text>
        {order.listing.seller && (
          <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
            Seller: {order.listing.seller.full_name}
          </Text>
        )}
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#389cfa' }}>
          đ{formatPrice(order.deposit_amount)}
        </Text>
      </View>

      {/* Action Button */}
      {getActionButton()}
    </Pressable>
  );
};

export default OrderCard;
