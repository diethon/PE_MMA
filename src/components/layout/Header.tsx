import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  rightBadgeCount?: number;
  onRightPress?: () => void;
  secondRightIcon?: keyof typeof MaterialIcons.glyphMap;
  onSecondRightPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightIcon,
  rightBadgeCount = 0,
  onRightPress,
  secondRightIcon,
  onSecondRightPress,
}) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-surface">
      <View className="flex-row items-center flex-1">
        {showBack ? (
          <TouchableOpacity onPress={onBack} className="mr-3 p-1">
            <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : null}
        <Text className="text-xl font-bold text-text-primary" numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        {secondRightIcon ? (
          <TouchableOpacity onPress={onSecondRightPress} className="p-1">
            <MaterialIcons name={secondRightIcon} size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : null}
        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress} className="p-1 relative">
            <MaterialIcons name={rightIcon} size={24} color={Colors.textPrimary} />
            <Badge count={rightBadgeCount} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};
