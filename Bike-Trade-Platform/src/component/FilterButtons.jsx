import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

const FilterButtons = ({ filters, selectedFilter, onFilterChange }) => {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 8,
        }}
      >
        {filters.map((filter) => (
          <Pressable
            key={filter.value}
            onPress={() => onFilterChange(filter.value)}
            style={({ pressed }) => ({
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor:
                selectedFilter === filter.value ? '#389cfa' : '#f3f4f6',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: selectedFilter === filter.value ? '#fff' : '#6b7280',
              }}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default FilterButtons;
