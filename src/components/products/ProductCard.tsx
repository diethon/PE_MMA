import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import type { UnifiedProduct } from '@/constants/productData';
import type { Product } from '@/constants/mockData';

interface UnifiedCardProps {
  product: UnifiedProduct;
  onPress?: () => void;
  variant?: 'list' | 'grid';
}

interface LegacyCardProps {
  product: Product;
  onPress?: () => void;
  variant?: 'list' | 'grid';
}

type ProductCardProps = UnifiedCardProps | LegacyCardProps;

function isUnifiedProduct(p: any): p is UnifiedProduct {
  return 'category' in p && typeof p.category === 'string' && 'priceNum' in p;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, variant = 'list' }) => {
  if (isUnifiedProduct(product)) {
    return <RealProductCard product={product} onPress={onPress} variant={variant} />;
  }
  return <LegacyProductCard product={product} onPress={onPress} variant={variant} />;
};

const RealProductCard: React.FC<UnifiedCardProps> = ({ product, onPress, variant = 'list' }) => {
  const { addProduct } = useCart();
  const { isFav, toggleFav } = useFavorites();
  const favorite = isFav(product.id);

  const handleAddToCart = async () => {
    await addProduct(product);
  };

  if (variant === 'grid') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="bg-card rounded-xl overflow-hidden border border-border flex-1 m-1"
        style={{ maxWidth: '48%' }}
      >
        <View className="relative">
          <Image
            source={{ uri: product.image }}
            className="w-full"
            style={{ height: 150 }}
            resizeMode="contain"
          />
          {product.discount ? (
            <View className="absolute top-2 left-2 bg-red-500 rounded-md px-1.5 py-0.5">
              <Text className="text-white text-xs font-bold">{product.discount}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            onPress={() => toggleFav(product.id)}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5"
            style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }}
          >
            <MaterialIcons
              name={favorite ? 'favorite' : 'favorite-border'}
              size={16}
              color={favorite ? '#EF4444' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
        <View className="p-3">
          <Text className="text-xs text-gray-500 mb-1">{product.brand}</Text>
          <Text className="text-sm font-semibold text-text-primary" numberOfLines={2}>
            {product.name}
          </Text>
          <View className="mt-2">
            {product.price ? (
              <Text className="text-base font-bold text-primary">{product.price}</Text>
            ) : (
              <Text className="text-sm text-gray-400 italic">Liên hệ</Text>
            )}
            {product.oldPrice ? (
              <Text className="text-xs text-gray-400 line-through">{product.oldPrice}</Text>
            ) : null}
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center flex-1 flex-wrap">
              {product.rating ? (
                <View className="flex-row items-center mr-2">
                  <MaterialIcons name="star" size={12} color={Colors.star} />
                  <Text className="text-xs text-gray-500 ml-0.5">{product.rating}</Text>
                </View>
              ) : null}
              {product.sold ? (
                <Text className="text-xs text-gray-400">{product.sold.replace('• ', '')}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={handleAddToCart}
              className="bg-primary rounded-full p-1.5"
              style={{ elevation: 2 }}
            >
              <MaterialIcons name="add-shopping-cart" size={14} color="#fff" />
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
      className="flex-row bg-card rounded-xl p-3 mb-3 border border-border"
    >
      <View className="relative">
        <Image
          source={{ uri: product.image }}
          className="rounded-lg"
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
        {product.discount ? (
          <View className="absolute top-1 left-1 bg-red-500 rounded px-1 py-0.5">
            <Text className="text-white text-[10px] font-bold">{product.discount}</Text>
          </View>
        ) : null}
      </View>
      <View className="flex-1 ml-3 justify-between">
        <View>
          <Text className="text-xs text-primary font-medium">{product.brand}</Text>
          <Text className="text-sm font-semibold text-text-primary mt-0.5" numberOfLines={2}>
            {product.name}
          </Text>
          {product.specs.length > 0 ? (
            <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
              {product.specs.join(' • ')}
            </Text>
          ) : null}
        </View>
        <View className="flex-row items-center justify-between mt-1.5">
          <View className="flex-1">
            {product.price ? (
              <Text className="text-base font-bold text-primary">{product.price}</Text>
            ) : (
              <Text className="text-sm text-gray-400 italic">Liên hệ</Text>
            )}
            {product.oldPrice ? (
              <Text className="text-xs text-gray-400 line-through">{product.oldPrice}</Text>
            ) : null}
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => toggleFav(product.id)} className="mr-2 p-1.5">
              <MaterialIcons
                name={favorite ? 'favorite' : 'favorite-border'}
                size={18}
                color={favorite ? '#EF4444' : '#D1D5DB'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddToCart}
              className="bg-primary rounded-lg px-2.5 py-1.5 flex-row items-center"
            >
              <MaterialIcons name="add-shopping-cart" size={14} color="#fff" />
              <Text className="text-white text-xs font-semibold ml-1">Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const LegacyProductCard: React.FC<LegacyCardProps> = ({ product, onPress, variant = 'list' }) => {
  if (variant === 'grid') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="bg-card rounded-lg overflow-hidden border border-border flex-1 m-1"
      >
        <View className="relative">
          <Image source={{ uri: product.image }} className="w-full h-36" resizeMode="cover" />
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
      <Image source={{ uri: product.image }} className="w-20 h-20 rounded-lg" resizeMode="cover" />
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
          <Text className={`text-xs ${product.stock <= 5 ? 'text-danger' : 'text-accent'}`}>
            {product.stock <= 5 ? `Low stock: ${product.stock}` : `In stock: ${product.stock}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
