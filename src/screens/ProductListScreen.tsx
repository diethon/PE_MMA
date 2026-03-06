import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenWrapper, Header } from '@/components/layout';
import { SearchBar } from '@/components/ui';
import { ProductCard } from '@/components/products';
import { Colors, mockProducts } from '@/constants';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type ProductListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProductList'>;
};

export const ProductListScreen: React.FC<ProductListScreenProps> = ({ navigation }) => {
  const [search, setSearch] = useState('');

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScreenWrapper>
      <Header
        title="Products"
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="sort"
        onRightPress={() => {}}
      />

      <View className="px-4 py-3">
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products..." />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            variant="list"
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('ProductForm', {})}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
};
