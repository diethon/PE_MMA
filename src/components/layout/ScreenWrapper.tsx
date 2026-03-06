import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  className?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  className = '',
  edges = ['top'],
}) => {
  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-surface ${className}`}>
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
};
