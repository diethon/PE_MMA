import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenWrapper, Header } from '@/components/layout';
import { Input, Button } from '@/components/ui';
import { Colors, mockProducts } from '@/constants';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';

type ProductFormScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProductForm'>;
  route: RouteProp<RootStackParamList, 'ProductForm'>;
};

export const ProductFormScreen: React.FC<ProductFormScreenProps> = ({ navigation, route }) => {
  const productId = route.params?.productId;
  const existingProduct = productId
    ? mockProducts.find((p) => p.id === productId)
    : undefined;

  const [name, setName] = useState(existingProduct?.name ?? '');
  const [description, setDescription] = useState(existingProduct?.description ?? '');
  const [price, setPrice] = useState(existingProduct?.price?.toString() ?? '');
  const [imageUrl, setImageUrl] = useState(existingProduct?.image ?? '');

  const isEditing = !!existingProduct;

  const handleSave = () => {
    Alert.alert('Success', `Product ${isEditing ? 'updated' : 'created'} successfully!`);
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <Header
        title={isEditing ? 'Edit Product' : 'Add Product'}
        showBack
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Preview */}
          <View className="items-center my-5">
            <TouchableOpacity className="w-36 h-36 bg-background rounded-2xl items-center justify-center border-2 border-dashed border-border overflow-hidden">
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <MaterialIcons name="photo-camera" size={36} color={Colors.textMuted} />
                  <Text className="text-xs text-text-muted mt-1">Tap image to change</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Input
            label="Product Name"
            placeholder="Enter product name"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Description"
            placeholder="Enter product description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Input
            label="Price ($)"
            placeholder="0.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            icon="attach-money"
          />

          <Input
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChangeText={setImageUrl}
            icon="link"
          />

          {isEditing ? (
            <Button
              title="Delete Product"
              onPress={handleDelete}
              variant="outline"
              icon="delete"
              className="mb-3 border-danger"
            />
          ) : null}

          <Button title="Save Product" onPress={handleSave} icon="save" />

          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};
