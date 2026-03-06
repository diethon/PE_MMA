import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onMicPress?: () => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search products...',
  onMicPress,
  className = '',
}) => {
  return (
    <View className={`flex-row items-center bg-background rounded-lg px-3 py-2.5 border border-border ${className}`}>
      <MaterialIcons name="search" size={22} color={Colors.textMuted} />
      <TextInput
        className="flex-1 text-base text-text-primary mx-2"
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
      />
      {onMicPress ? (
        <TouchableOpacity onPress={onMicPress}>
          <MaterialIcons name="mic" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
