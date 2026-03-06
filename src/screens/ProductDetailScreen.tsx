import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout';
import { Button, Rating } from '@/components/ui';
import { Colors, mockProducts, mockDailyDeals } from '@/constants';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';

type ProductDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;
  route: RouteProp<RootStackParamList, 'ProductDetail'>;
};

const allProducts = [...mockProducts, ...mockDailyDeals];

const colorOptions = ['#1a1a2e', '#ffffff', '#007bff'];

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { productId } = route.params;
  const product = allProducts.find((p) => p.id === productId) ?? allProducts[0];
  const [selectedColor, setSelectedColor] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
            <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary">Product Details</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProductForm', { productId: product.id })}
            className="p-1"
          >
            <MaterialIcons name="edit" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Product Image */}
        <View className="bg-background mx-4 rounded-2xl overflow-hidden mb-4">
          <Image
            source={{ uri: product.image }}
            className="w-full h-64"
            resizeMode="cover"
          />
        </View>

        {/* Product Info */}
        <View className="px-4">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-2xl font-bold text-text-primary flex-1 mr-3">
              {product.name}
            </Text>
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} className="p-1">
              <MaterialIcons
                name={isFavorite ? 'favorite' : 'favorite-border'}
                size={26}
                color={isFavorite ? Colors.error : Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text className="text-2xl font-bold text-primary mb-3">
            ${product.price.toFixed(2)}
          </Text>

          {product.rating ? (
            <View className="mb-4">
              <Rating rating={product.rating} reviews={product.reviews} />
            </View>
          ) : null}

          {/* Description */}
          <View className="mb-5">
            <Text className="text-lg font-bold text-text-primary mb-2">Description</Text>
            <Text className="text-base text-text-secondary leading-6">
              {product.description}. Features include active noise cancellation, 30-hour
              battery life, and comfortable over-ear design. Built with premium materials for
              long-lasting durability. Perfect for music lovers and professionals alike.
            </Text>
          </View>

          {/* Color Selection */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-text-primary mb-3">Color</Text>
            <View className="flex-row gap-3">
              {colorOptions.map((color, index) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(index)}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    selectedColor === index ? 'border-2 border-primary' : ''
                  }`}
                >
                  <View
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: color, borderWidth: color === '#ffffff' ? 1 : 0, borderColor: '#e0e0e0' }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-4 py-4 bg-surface border-t border-border">
        <Button
          title="Add to Cart"
          onPress={() => navigation.navigate('Cart')}
          icon="shopping-cart"
        />
      </View>
    </ScreenWrapper>
  );
};
