import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EmptyState = ({ icon, title, message, buttonText, onButtonPress }) => {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
      }}
    >
      <MaterialCommunityIcons name={icon} size={80} color="#d1d5db" />
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: '#9ca3af',
          marginTop: 16,
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      {message && (
        <Text
          style={{
            fontSize: 14,
            color: '#9ca3af',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          {message}
        </Text>
      )}
      {buttonText && onButtonPress && (
        <Pressable
          onPress={onButtonPress}
          style={({ pressed }) => ({
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            backgroundColor: '#389cfa',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#fff',
            }}
          >
            {buttonText}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default EmptyState;
