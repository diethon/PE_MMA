import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  count: number;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ count, size = 'sm', className = '' }) => {
  if (count <= 0) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  const textSize = {
    sm: 'text-[10px]',
    md: 'text-xs',
  };

  return (
    <View
      className={`absolute -top-1 -right-1 bg-danger rounded-full items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      <Text className={`text-white font-bold ${textSize[size]}`}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};
