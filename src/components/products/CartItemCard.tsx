import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import type { CartItem } from '@/constants/mockData';

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onQuantityChange,
  onRemove,
}) => {
  return (
    <View className="flex-row bg-card rounded-lg p-3 mb-3 border border-border">
      <Image
        source={{ uri: item.product.image }}
        className="w-20 h-20 rounded-lg"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-base font-semibold text-text-primary" numberOfLines={1}>
              {item.product.name}
            </Text>
            {item.selectedColor ? (
              <Text className="text-sm text-text-secondary mt-0.5">
                Color: {item.selectedColor}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity onPress={() => onRemove?.(item.id)} className="p-1">
            <MaterialIcons name="delete" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-base font-bold text-text-primary">
            ${item.product.price.toFixed(2)}
          </Text>
          <View className="flex-row items-center bg-background rounded-lg">
            <TouchableOpacity
              onPress={() => onQuantityChange?.(item.id, Math.max(1, item.quantity - 1))}
              className="px-2.5 py-1.5"
            >
              <MaterialIcons name="remove" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text className="text-base font-semibold text-text-primary px-3">
              {item.quantity}
            </Text>
            <TouchableOpacity
              onPress={() => onQuantityChange?.(item.id, item.quantity + 1)}
              className="px-2.5 py-1.5"
            >
              <MaterialIcons name="add" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
