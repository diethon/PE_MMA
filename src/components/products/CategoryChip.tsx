import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';

interface CategoryChipProps {
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  isActive?: boolean;
  onPress?: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  name,
  icon,
  isActive = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`items-center mr-4 ${isActive ? '' : ''}`}
    >
      <View
        className={`w-14 h-14 rounded-2xl items-center justify-center mb-1.5 ${
          isActive ? 'bg-primary' : 'bg-primary-light'
        }`}
      >
        <MaterialIcons
          name={icon}
          size={26}
          color={isActive ? '#ffffff' : Colors.primary}
        />
      </View>
      <Text
        className={`text-xs font-medium ${
          isActive ? 'text-primary' : 'text-text-secondary'
        }`}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
};
