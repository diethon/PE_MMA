import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout';
import { SearchBar, Badge } from '@/components/ui';
import { CategoryChip, ProductCard } from '@/components/products';
import { Colors, mockCategories, mockDailyDeals } from '@/constants';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [search, setSearch] = useState('');

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-3">
              <MaterialIcons name="menu" size={26} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-text-primary">Aura Tech</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            className="relative"
          >
            <MaterialIcons name="shopping-bag" size={26} color={Colors.textPrimary} />
            <Badge count={2} />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View className="mx-4 rounded-xl overflow-hidden bg-primary-light mb-4">
          <View className="p-5">
            <Text className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              New Arrival
            </Text>
            <Text className="text-2xl font-bold text-text-primary mb-2">
              Summer Tech Collection
            </Text>
            <Text className="text-sm text-text-secondary mb-4 leading-5">
              Upgrade your setup with our premium selection of devices designed for creativity.
            </Text>
            <TouchableOpacity
              className="bg-primary py-2.5 px-5 rounded-lg self-start flex-row items-center"
              onPress={() => navigation.navigate('ProductList')}
            >
              <Text className="text-white font-semibold text-sm">Shop Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-4 mb-5">
          <SearchBar value={search} onChangeText={setSearch} onMicPress={() => {}} />
        </View>

        {/* Trending Categories */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-lg font-bold text-text-primary">Trending Categories</Text>
            <TouchableOpacity>
              <Text className="text-sm text-primary font-medium">See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {mockCategories.map((cat) => (
              <CategoryChip
                key={cat.id}
                name={cat.name}
                icon={cat.icon as keyof typeof MaterialIcons.glyphMap}
              />
            ))}
          </ScrollView>
        </View>

        {/* Daily Deals */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-lg font-bold text-text-primary">Daily Deals</Text>
          </View>
          <FlatList
            data={mockDailyDeals}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                variant="grid"
                onPress={() =>
                  navigation.navigate('ProductDetail', { productId: item.id })
                }
              />
            )}
          />
        </View>

        {/* Featured Brand */}
        <View className="mx-4 mb-6 rounded-xl overflow-hidden bg-text-primary p-5">
          <Text className="text-xs text-text-muted uppercase tracking-wider mb-1">
            Featured Brand
          </Text>
          <Text className="text-xl font-bold text-white mb-1">Sony Ecosystem</Text>
          <Text className="text-sm text-text-muted mb-4">
            Seamless integration for creators.
          </Text>
          <TouchableOpacity className="bg-white py-2.5 px-5 rounded-lg self-start">
            <Text className="text-text-primary font-semibold text-sm">
              Explore Collection
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-4" />
      </ScrollView>
    </ScreenWrapper>
  );
};
