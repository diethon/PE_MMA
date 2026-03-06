import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenWrapper, Header } from '@/components/layout';
import { Button } from '@/components/ui';
import { CartItemCard } from '@/components/products';
import { Colors, mockCartItems } from '@/constants';
import type { CartItem } from '@/constants/mockData';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type CartScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Cart'>;
};

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [promoCode, setPromoCode] = useState('');

  const handleQuantityChange = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const handleRemove = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ScreenWrapper>
      <Header title="Shopping Cart" showBack onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-3">
          {cartItems.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemove}
            />
          ))}
        </View>

        {cartItems.length === 0 ? (
          <View className="items-center py-12">
            <MaterialIcons name="shopping-cart" size={64} color={Colors.textMuted} />
            <Text className="text-lg text-text-muted mt-4">Your cart is empty</Text>
          </View>
        ) : null}

        {cartItems.length > 0 ? (
          <>
            {/* Promo Code */}
            <View className="flex-row items-center mb-5">
              <View className="flex-1 flex-row items-center bg-background rounded-lg border border-border px-3 py-2.5 mr-3">
                <MaterialIcons name="local-offer" size={20} color={Colors.textMuted} />
                <TextInput
                  className="flex-1 text-base text-text-primary ml-2"
                  placeholder="Promo code"
                  placeholderTextColor={Colors.textMuted}
                  value={promoCode}
                  onChangeText={setPromoCode}
                />
              </View>
              <TouchableOpacity className="bg-primary rounded-lg px-5 py-3">
                <Text className="text-white font-semibold">Apply</Text>
              </TouchableOpacity>
            </View>

            {/* Price Summary */}
            <View className="bg-background rounded-xl p-4 mb-5">
              <View className="flex-row justify-between mb-2">
                <Text className="text-base text-text-secondary">
                  Subtotal ({itemCount} items)
                </Text>
                <Text className="text-base font-medium text-text-primary">
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-base text-text-secondary">Shipping</Text>
                <Text className="text-base font-medium text-accent">Free</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-base text-text-secondary">Tax</Text>
                <Text className="text-base font-medium text-text-primary">
                  ${tax.toFixed(2)}
                </Text>
              </View>
              <View className="border-t border-border pt-3">
                <View className="flex-row justify-between">
                  <Text className="text-lg font-bold text-text-primary">Total Price</Text>
                  <Text className="text-lg font-bold text-primary">${total.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <Button
              title="Checkout Now"
              onPress={() => Alert.alert('Checkout', 'Order placed successfully!')}
              icon="arrow-forward"
              iconPosition="right"
            />

            <View className="h-6" />
          </>
        ) : null}
      </ScrollView>
    </ScreenWrapper>
  );
};
