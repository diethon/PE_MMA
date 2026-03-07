import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SearchBar } from '@/components/ui';
import { ProductCard } from '@/components/products';
import { Colors } from '@/constants';
import { allProducts, categories } from '@/constants/productData';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';

const hotDeals = allProducts
  .filter((p) => p.discount)
  .slice(0, 6);

const bestSellers = allProducts
  .filter((p) => p.soldNum > 0)
  .sort((a, b) => b.soldNum - a.soldNum)
  .slice(0, 8);

const phoneHighlights = allProducts
  .filter((p) => p.category === 'phone' && p.priceNum > 0)
  .sort((a, b) => b.soldNum - a.soldNum)
  .slice(0, 6);

const watchHighlights = allProducts
  .filter((p) => p.category === 'watch' && p.priceNum > 0)
  .sort((a, b) => b.soldNum - a.soldNum)
  .slice(0, 6);

export const HomeScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const navigateToProduct = (id: string) => {
    navigation.navigate('ProductDetail', { productId: id });
  };

  return (
    <View className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View className="mx-4 mt-3 rounded-xl overflow-hidden bg-primary-light mb-4">
          <View className="p-5">
            <Text className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              Khám phá ngay
            </Text>
            <Text className="text-2xl font-bold text-text-primary mb-2">
              Bộ sưu tập Tech 2026
            </Text>
            <Text className="text-sm text-text-secondary mb-4 leading-5">
              Phone, Laptop, Tablet, Watch - Tất cả trong một nơi với giá tốt nhất.
            </Text>
            <TouchableOpacity
              className="bg-primary py-2.5 px-5 rounded-lg self-start flex-row items-center"
              onPress={() => navigation.navigate('ProductListMain')}
            >
              <Text className="text-white font-semibold text-sm">Xem tất cả</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-4 mb-5">
          <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm kiếm sản phẩm..." onMicPress={() => {}} />
        </View>

        {/* Categories */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-lg font-bold text-text-primary">Danh mục</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductListMain')}>
              <Text className="text-sm text-primary font-medium">Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {categories.filter((c) => c.key !== 'all').map((cat) => (
              <TouchableOpacity
                key={cat.key}
                onPress={() => navigation.navigate('ProductListMain')}
                activeOpacity={0.7}
                className="items-center mr-5"
              >
                <View className="w-14 h-14 rounded-2xl items-center justify-center mb-1.5 bg-primary-light">
                  <MaterialIcons
                    name={cat.icon as keyof typeof MaterialIcons.glyphMap}
                    size={26}
                    color={Colors.primary}
                  />
                </View>
                <Text className="text-xs font-medium text-text-secondary">{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Hot Deals */}
        {hotDeals.length > 0 ? (
          <View className="mb-5">
            <View className="flex-row items-center justify-between px-4 mb-3">
              <View className="flex-row items-center">
                <MaterialIcons name="local-fire-department" size={20} color="#EF4444" />
                <Text className="text-lg font-bold text-text-primary ml-1">Giảm giá hot</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ProductListMain')}>
                <Text className="text-sm text-primary font-medium">Xem thêm</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              {hotDeals.map((product, idx) => (
                <TouchableOpacity
                  key={`${product.id}-deal-${idx}`}
                  onPress={() => navigateToProduct(product.id)}
                  activeOpacity={0.8}
                  className="bg-card border border-border rounded-xl mr-3 overflow-hidden"
                  style={{ width: 160 }}
                >
                  <View className="relative">
                    <Image
                      source={{ uri: product.image }}
                      style={{ width: 160, height: 130 }}
                      resizeMode="contain"
                    />
                    {product.discount ? (
                      <View className="absolute top-2 left-2 bg-red-500 rounded-md px-1.5 py-0.5">
                        <Text className="text-white text-xs font-bold">{product.discount}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View className="p-2.5">
                    <Text className="text-xs text-primary font-medium">{product.brand}</Text>
                    <Text className="text-sm font-semibold text-text-primary mt-0.5" numberOfLines={2}>
                      {product.name}
                    </Text>
                    <View className="mt-1.5">
                      {product.price ? (
                        <Text className="text-sm font-bold text-primary">{product.price}</Text>
                      ) : (
                        <Text className="text-xs text-gray-400 italic">Liên hệ</Text>
                      )}
                      {product.oldPrice ? (
                        <Text className="text-xs text-gray-400 line-through">{product.oldPrice}</Text>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Best Sellers */}
        {bestSellers.length > 0 ? (
          <View className="mb-5">
            <View className="flex-row items-center justify-between px-4 mb-3">
              <View className="flex-row items-center">
                <MaterialIcons name="trending-up" size={20} color={Colors.primary} />
                <Text className="text-lg font-bold text-text-primary ml-1">Bán chạy nhất</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ProductListMain')}>
                <Text className="text-sm text-primary font-medium">Xem thêm</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={bestSellers}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              keyExtractor={(item, idx) => `${item.id}-best-${idx}`}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  variant="grid"
                  onPress={() => navigateToProduct(item.id)}
                />
              )}
            />
          </View>
        ) : null}

        {/* Phone Section */}
        {phoneHighlights.length > 0 ? (
          <View className="mb-5">
            <View className="flex-row items-center justify-between px-4 mb-3">
              <View className="flex-row items-center">
                <MaterialIcons name="smartphone" size={20} color={Colors.primary} />
                <Text className="text-lg font-bold text-text-primary ml-1">Điện thoại nổi bật</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ProductListMain')}>
                <Text className="text-sm text-primary font-medium">Xem thêm</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              {phoneHighlights.map((product, idx) => (
                <TouchableOpacity
                  key={`${product.id}-phone-${idx}`}
                  onPress={() => navigateToProduct(product.id)}
                  activeOpacity={0.8}
                  className="bg-card border border-border rounded-xl mr-3 overflow-hidden"
                  style={{ width: 160 }}
                >
                  <Image
                    source={{ uri: product.image }}
                    style={{ width: 160, height: 130 }}
                    resizeMode="contain"
                  />
                  <View className="p-2.5">
                    <Text className="text-xs text-primary font-medium">{product.brand}</Text>
                    <Text className="text-sm font-semibold text-text-primary mt-0.5" numberOfLines={2}>
                      {product.name}
                    </Text>
                    {product.price ? (
                      <Text className="text-sm font-bold text-primary mt-1">{product.price}</Text>
                    ) : null}
                    {product.rating ? (
                      <View className="flex-row items-center mt-1">
                        <MaterialIcons name="star" size={12} color={Colors.star} />
                        <Text className="text-xs text-gray-500 ml-0.5">{product.rating}</Text>
                        {product.sold ? (
                          <Text className="text-xs text-gray-400 ml-1.5">
                            {product.sold.replace('• ', '')}
                          </Text>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Watch Section */}
        {watchHighlights.length > 0 ? (
          <View className="mb-5">
            <View className="flex-row items-center justify-between px-4 mb-3">
              <View className="flex-row items-center">
                <MaterialIcons name="watch" size={20} color={Colors.primary} />
                <Text className="text-lg font-bold text-text-primary ml-1">Đồng hồ thông minh</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ProductListMain')}>
                <Text className="text-sm text-primary font-medium">Xem thêm</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              {watchHighlights.map((product, idx) => (
                <TouchableOpacity
                  key={`${product.id}-watch-${idx}`}
                  onPress={() => navigateToProduct(product.id)}
                  activeOpacity={0.8}
                  className="bg-card border border-border rounded-xl mr-3 overflow-hidden"
                  style={{ width: 160 }}
                >
                  <Image
                    source={{ uri: product.image }}
                    style={{ width: 160, height: 130 }}
                    resizeMode="contain"
                  />
                  <View className="p-2.5">
                    <Text className="text-xs text-primary font-medium">{product.brand}</Text>
                    <Text className="text-sm font-semibold text-text-primary mt-0.5" numberOfLines={2}>
                      {product.name}
                    </Text>
                    {product.price ? (
                      <Text className="text-sm font-bold text-primary mt-1">{product.price}</Text>
                    ) : null}
                    {product.rating ? (
                      <View className="flex-row items-center mt-1">
                        <MaterialIcons name="star" size={12} color={Colors.star} />
                        <Text className="text-xs text-gray-500 ml-0.5">{product.rating}</Text>
                        {product.sold ? (
                          <Text className="text-xs text-gray-400 ml-1.5">
                            {product.sold.replace('• ', '')}
                          </Text>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View className="h-4" />
      </ScrollView>
    </View>
  );
};
