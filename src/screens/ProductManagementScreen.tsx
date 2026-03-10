import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { deleteProduct, getAllProducts, type ProductRow } from '@/services/productDb';
import { formatVND } from '@/utils/format';

export const ProductManagementScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllProducts();
      setProducts(list);
    } catch (e) {
      console.warn('load products error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const handleDelete = (item: ProductRow) => {
    Alert.alert('Xóa sản phẩm', `Bạn có chắc muốn xóa "${item.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await deleteProduct(item.productId);
          load();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: ProductRow }) => (
    <View className="flex-row bg-card rounded-xl p-3 mb-3 border border-border">
      <Image
        source={item.image ? { uri: item.image } : require('../../assets/icon.png')}
        style={{ width: 64, height: 64 }}
        className="rounded-lg"
        resizeMode="contain"
      />
      <View className="flex-1 ml-3 justify-between">
        <View>
          <Text className="text-xs text-gray-500">{item.brand}</Text>
          <Text className="text-sm font-semibold text-text-primary" numberOfLines={2}>
            {item.name}
          </Text>
          {item.category ? (
            <Text className="text-[11px] text-gray-400 mt-0.5">{item.category}</Text>
          ) : null}
        </View>
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-sm font-bold text-primary">
            {item.priceNum > 0 ? formatVND(item.priceNum) : 'Liên hệ'}
          </Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ProductForm', { mode: 'edit', productId: item.productId })
              }
              className="px-2.5 py-1.5 rounded-lg bg-gray-100 mr-2 flex-row items-center"
            >
              <MaterialIcons name="edit" size={16} color={Colors.primary} />
              <Text className="text-xs text-primary font-semibold ml-1">Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              className="px-2.5 py-1.5 rounded-lg bg-red-50 flex-row items-center"
            >
              <MaterialIcons name="delete-outline" size={16} color={Colors.error} />
              <Text className="text-xs text-red-500 font-semibold ml-1">Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
          <MaterialIcons name="arrow-back-ios" size={18} color={Colors.primary} />
          <Text className="text-sm text-primary font-medium">Quay lại</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-text-primary flex-1 text-center">
          Quản lý sản phẩm
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductForm', { mode: 'create' })}
          className="flex-row items-center"
        >
          <MaterialIcons name="add" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="inventory-2" size={72} color={Colors.textMuted} />
          <Text className="text-base font-bold text-gray-700 mt-4">Chưa có sản phẩm tự tạo</Text>
          <Text className="text-sm text-gray-400 mt-2 text-center">
            Nhấn nút dấu cộng ở góc trên để thêm sản phẩm mới.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.productId}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
        />
      )}
    </View>
  );
};

