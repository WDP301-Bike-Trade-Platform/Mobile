import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HeaderBar = ({ title, onBack, rightIcon, onRightPress }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
      }}
    >
      <Pressable
        onPress={onBack}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
      </Pressable>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
        {title}
      </Text>
      {rightIcon && onRightPress ? (
        <Pressable
          onPress={onRightPress}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#389cfa',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialCommunityIcons name={rightIcon} size={24} color="#fff" />
        </Pressable>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  );
};

export default HeaderBar;
