import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  secureTextEntry?: boolean;
  error?: string;
  hint?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  prefix?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  error,
  hint,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  prefix,
  className = '',
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${className}`}>
      {label ? (
        <Text className="text-sm font-medium text-text-primary mb-1.5">{label}</Text>
      ) : null}
      <View
        className={`flex-row items-center bg-background rounded-lg border px-3 ${
          error
            ? 'border-danger'
            : isFocused
              ? 'border-primary'
              : 'border-border'
        } ${multiline ? 'items-start pt-3' : ''}`}
      >
        {icon ? (
          <MaterialIcons
            name={icon}
            size={20}
            color={error ? Colors.error : isFocused ? Colors.primary : Colors.textMuted}
            style={{ marginRight: 8 }}
          />
        ) : null}
        {prefix ? (
          <Text className="text-text-secondary text-base mr-1">{prefix}</Text>
        ) : null}
        <TextInput
          className={`flex-1 text-base text-text-primary ${multiline ? 'min-h-[80px]' : 'py-3'}`}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} className="p-1">
            <MaterialIcons
              name={isSecure ? 'visibility-off' : 'visibility'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <View className="flex-row items-center mt-1">
          <MaterialIcons name="error" size={14} color={Colors.error} />
          <Text className="text-danger text-xs ml-1">{error}</Text>
        </View>
      ) : null}
      {hint && !error ? (
        <Text className="text-text-muted text-xs mt-1">{hint}</Text>
      ) : null}
    </View>
  );
};
