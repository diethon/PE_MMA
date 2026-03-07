import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import type { CartRow } from '@/services/cartDb';

interface CartItemCardProps {
  item: CartRow;
  onQuantityChange?: (productId: string, quantity: number) => void;
  onRemove?: (productId: string) => void;
}

function formatVND(num: number): string {
  if (!num) return '';
  return num.toLocaleString('vi-VN') + '₫';
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onQuantityChange,
  onRemove,
}) => {
  return (
    <View className="flex-row bg-card rounded-xl p-3 mb-3 border border-border">
      <Image
        source={{ uri: item.image }}
        className="rounded-lg"
        style={{ width: 90, height: 90 }}
        resizeMode="contain"
      />
      <View className="flex-1 ml-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-xs text-primary font-medium">{item.brand}</Text>
            <Text className="text-sm font-semibold text-text-primary mt-0.5" numberOfLines={2}>
              {item.name}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onRemove?.(item.productId)} className="p-1">
            <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-base font-bold text-primary">
            {item.price || formatVND(item.priceNum) || 'Liên hệ'}
          </Text>
          <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
            <TouchableOpacity
              onPress={() => onQuantityChange?.(item.productId, Math.max(1, item.quantity - 1))}
              className="px-2.5 py-1.5"
            >
              <MaterialIcons name="remove" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text className="text-sm font-bold text-text-primary px-2.5">
              {item.quantity}
            </Text>
            <TouchableOpacity
              onPress={() => onQuantityChange?.(item.productId, item.quantity + 1)}
              className="px-2.5 py-1.5"
            >
              <MaterialIcons name="add" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
