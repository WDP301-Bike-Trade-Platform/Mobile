import React from 'react';
import { View, Text } from 'react-native';

const StatusBadge = ({ status, color, text }) => {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: `${color}20`,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: color,
        }}
      >
        {text || status}
      </Text>
    </View>
  );
};

export default StatusBadge;
