import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { AppStackParamList } from '../navigation/types';
import { addProduct, getProductById, updateProduct } from '@/services/productDb';

type ProductFormRoute = RouteProp<AppStackParamList, 'ProductForm'>;

export const ProductFormScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<ProductFormRoute>();
  const mode = route.params?.mode ?? 'create';
  const editingId = mode === 'edit' ? (route.params as { mode: 'edit'; productId: string }).productId : undefined;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && editingId) {
      (async () => {
        const p = await getProductById(editingId);
        if (!p) {
          Alert.alert('Lỗi', 'Không tìm thấy sản phẩm.');
          navigation.goBack();
          return;
        }
        setName(p.name);
        setDescription(p.description);
        setBrand(p.brand);
        setPrice(p.priceNum ? String(p.priceNum) : '');
        setImage(p.image);
        setCategory(p.category);
      })();
    }
  }, [mode, editingId, navigation]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return;
    }
    const priceNum = Number(price.replace(/,/g, '.')) || 0;
    setSaving(true);
    try {
      if (mode === 'edit' && editingId) {
        await updateProduct(editingId, {
          name,
          description,
          brand,
          priceNum,
          image,
          category,
        });
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await addProduct({
          name,
          description,
          brand,
          priceNum,
          image,
          category,
        });
        Alert.alert('Thành công', 'Đã thêm sản phẩm mới!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message || 'Không thể lưu sản phẩm.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-4 py-2 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center mr-3">
          <MaterialIcons name="arrow-back-ios" size={18} color={Colors.primary} />
          <Text className="text-sm text-primary font-medium">Quay lại</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-text-primary flex-1" numberOfLines={1}>
          {mode === 'edit' ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <Text className="text-xs text-gray-500 mb-1.5 ml-1">Tên sản phẩm</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
              <MaterialIcons name="label" size={18} color="#9CA3AF" />
              <TextInput
                value={name}
                onChangeText={setName}
                className="flex-1 py-3.5 ml-3 text-sm text-text-primary"
                placeholder="Nhập tên sản phẩm"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-xs text-gray-500 mb-1.5 ml-1">Mô tả</Text>
            <View className="flex-row items-start bg-gray-50 rounded-xl border border-gray-200 px-4">
              <MaterialIcons name="description" size={18} color="#9CA3AF" style={{ marginTop: 12 }} />
              <TextInput
                value={description}
                onChangeText={setDescription}
                className="flex-1 py-3.5 ml-3 text-sm text-text-primary"
                placeholder="Mô tả ngắn gọn về sản phẩm"
                placeholderTextColor="#9CA3AF"
                multiline
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-xs text-gray-500 mb-1.5 ml-1">Thương hiệu</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
              <MaterialIcons name="store" size={18} color="#9CA3AF" />
              <TextInput
                value={brand}
                onChangeText={setBrand}
                className="flex-1 py-3.5 ml-3 text-sm text-text-primary"
                placeholder="Ví dụ: Apple, Samsung..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-xs text-gray-500 mb-1.5 ml-1">Giá (VND)</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
              <MaterialIcons name="attach-money" size={18} color="#9CA3AF" />
              <TextInput
                value={price}
                onChangeText={setPrice}
                className="flex-1 py-3.5 ml-3 text-sm text-text-primary"
                placeholder="Nhập giá, ví dụ 15000000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-xs text-gray-500 mb-1.5 ml-1">Ảnh (URL)</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
              <MaterialIcons name="image" size={18} color="#9CA3AF" />
              <TextInput
                value={image}
                onChangeText={setImage}
                className="flex-1 py-3.5 ml-3 text-sm text-text-primary"
                placeholder="Dán đường dẫn ảnh sản phẩm"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-xs text-gray-500 mb-1.5 ml-1">Danh mục (tuỳ chọn)</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
              <MaterialIcons name="category" size={18} color="#9CA3AF" />
              <TextInput
                value={category}
                onChangeText={setCategory}
                className="flex-1 py-3.5 ml-3 text-sm text-text-primary"
                placeholder="Ví dụ: phone, laptop..."
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="bg-primary py-3.5 rounded-xl flex-row items-center justify-center mb-8"
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? (
              <Text className="text-white font-bold text-sm">Đang lưu...</Text>
            ) : (
              <>
                <MaterialIcons name="save" size={18} color="#fff" />
                <Text className="text-white font-bold text-sm ml-2">
                  {mode === 'edit' ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
