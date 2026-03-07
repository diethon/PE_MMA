import React, { useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ProductCard } from '@/components/products';
import { Colors } from '@/constants';
import { allProducts } from '@/constants/productData';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';

export const FavoritesScreen: React.FC = () => {
  const { favoriteIds, favCount, loading } = useFavorites();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const favoriteProducts = useMemo(
    () => allProducts.filter((p) => favoriteIds.includes(p.id)),
    [favoriteIds],
  );

  if (!loading && favoriteProducts.length === 0) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-6">
        <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-4">
          <MaterialIcons name="favorite-border" size={40} color="#EF4444" />
        </View>
        <Text className="text-xl font-bold text-text-primary mb-2">Chưa có yêu thích</Text>
        <Text className="text-sm text-gray-400 text-center leading-5">
          Nhấn vào biểu tượng trái tim trên sản phẩm để thêm vào danh sách yêu thích
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-3 pb-2">
        <Text className="text-sm text-gray-500">{favCount} sản phẩm yêu thích</Text>
      </View>
      <FlatList
        data={favoriteProducts}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            variant="grid"
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
