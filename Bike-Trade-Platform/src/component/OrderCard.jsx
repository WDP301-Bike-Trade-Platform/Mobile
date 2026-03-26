import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import { formatPrice, formatDate } from '../utils/formatters';

const OrderCard = ({ order, onPress, onAction, actionType, onConfirm, onReject }) => {
  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      DEPOSITED: '#8b5cf6',
      CONFIRMED: '#3b82f6',
      PAID: '#06b6d4',
      FORFEITED: '#dc2626',
      CANCELLED_BY_BUYER: '#781616',
      CANCELLED_BY_SELLER: '#f97316',
      COMPLETED: '#10b981',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Pending',
      DEPOSITED: 'Deposited',
      CONFIRMED: 'Confirmed',
      PAID: 'Paid',
      FORFEITED: 'Forfeited',
      CANCELLED_BY_BUYER: 'Cancelled',
      CANCELLED_BY_SELLER: 'Rejected',
      COMPLETED: 'Completed',
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

    if (actionType === 'confirm' && (order.status === 'PENDING' || order.status === 'DEPOSITED')) {
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
            {order.status === 'DEPOSITED' ? 'Confirm Deposit Order' : 'Confirm COD Order'}
          </Text>
        </Pressable>
      );
    }

    if (actionType === 'complete' && (order.status === 'PAID' || order.status === 'CONFIRMED')) {
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

    if (actionType === 'seller-confirm-reject' && order.status === 'DEPOSITED') {
      return (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={onConfirm}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: '#dbeafe',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#3b82f6', textAlign: 'center' }}>
              Confirm
            </Text>
          </Pressable>
          <Pressable
            onPress={onReject}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: '#fee2e2',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#ef4444', textAlign: 'center' }}>
              Reject
            </Text>
          </Pressable>
        </View>
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
          {order.listing?.title || (order.listing?.vehicle ? `${order.listing.vehicle.brand} ${order.listing.vehicle.model}` : 'N/A')}
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
      {/* {getActionButton()} */}
    </Pressable>
  );
};

export default OrderCard;
