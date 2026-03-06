import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import type { Product } from '@/constants/mockData';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  variant?: 'list' | 'grid';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  variant = 'list',
}) => {
  if (variant === 'grid') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="bg-card rounded-lg overflow-hidden border border-border flex-1 m-1"
      >
        <View className="relative">
          <Image
            source={{ uri: product.image }}
            className="w-full h-36"
            resizeMode="cover"
          />
          <TouchableOpacity className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5">
            <MaterialIcons name="favorite-border" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View className="p-3">
          <Text className="text-sm font-semibold text-text-primary" numberOfLines={1}>
            {product.name}
          </Text>
          <View className="flex-row items-center justify-between mt-1.5">
            <Text className="text-base font-bold text-primary">
              ${product.price.toFixed(2)}
            </Text>
            <TouchableOpacity className="bg-primary rounded-full p-1">
              <MaterialIcons name="add" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row bg-card rounded-lg p-3 mb-3 border border-border"
    >
      <Image
        source={{ uri: product.image }}
        className="w-20 h-20 rounded-lg"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-center">
        <Text className="text-base font-semibold text-text-primary" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-sm text-text-secondary mt-0.5" numberOfLines={2}>
          {product.description}
        </Text>
        <View className="flex-row items-center justify-between mt-1.5">
          <Text className="text-base font-bold text-primary">
            ${product.price.toFixed(2)}
          </Text>
          <Text
            className={`text-xs ${product.stock <= 5 ? 'text-danger' : 'text-accent'}`}
          >
            {product.stock <= 5 ? `Low stock: ${product.stock}` : `In stock: ${product.stock}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
