import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CartItemCard } from '@/components/products';
import { Colors } from '@/constants';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';

function formatVND(num: number): string {
  if (!num) return '0₫';
  return num.toLocaleString('vi-VN') + '₫';
}

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { items, cartCount, loading, updateQuantity, removeItem, clearCart, checkout } = useCart();
  const { user } = useAuth();

  const subtotal = items.reduce((sum, item) => sum + item.priceNum * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleRemove = (productId: string) => {
    Alert.alert('Xóa sản phẩm', 'Bạn có chắc muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => removeItem(productId) },
    ]);
  };

  const handleClear = () => {
    Alert.alert('Xóa giỏ hàng', 'Bạn có chắc muốn xóa toàn bộ giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa tất cả', style: 'destructive', onPress: () => clearCart() },
    ]);
  };

  const handleCheckout = () => {
    if (!user) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thanh toán.');
      return;
    }
    Alert.alert(
      'Xác nhận thanh toán',
      `Bạn có chắc muốn đặt hàng?\n\nSố lượng: ${itemCount} sản phẩm\nTổng tiền: ${formatVND(subtotal)}\nPhí vận chuyển: Miễn phí\n\nĐơn hàng sẽ được xử lý ngay sau khi xác nhận.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận đặt hàng',
          onPress: async () => {
            try {
              const orderId = await checkout();
              Alert.alert(
                'Đặt hàng thành công!',
                `Mã đơn: ${orderId}\nTổng: ${formatVND(subtotal)}\n\nCảm ơn bạn đã mua hàng!`,
                [{ text: 'OK' }],
              );
            } catch {
              Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại.');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Inline header row */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
          <MaterialIcons name="arrow-back-ios" size={18} color={Colors.primary} />
          <Text className="text-sm text-primary font-medium">Quay lại</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-text-primary">Giỏ hàng</Text>
        {items.length > 0 ? (
          <TouchableOpacity onPress={handleClear} className="p-1">
            <MaterialIcons name="delete-sweep" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 30 }} />
        )}
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="shopping-cart" size={72} color={Colors.textMuted} />
          <Text className="text-xl font-bold text-gray-700 mt-4">Giỏ hàng trống</Text>
          <Text className="text-sm text-gray-400 mt-2 text-center">
            Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProductListMain')}
            className="bg-primary mt-6 px-6 py-3 rounded-xl flex-row items-center"
          >
            <MaterialIcons name="shopping-bag" size={18} color="#fff" />
            <Text className="text-white font-bold ml-2">Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-sm text-gray-500">{itemCount} sản phẩm trong giỏ</Text>
            </View>

            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onQuantityChange={updateQuantity}
                onRemove={handleRemove}
              />
            ))}

            {/* Price Summary */}
            <View className="bg-gray-50 rounded-xl p-4 mt-2 mb-4">
              <View className="flex-row justify-between mb-2.5">
                <Text className="text-sm text-gray-500">Tạm tính ({itemCount} sp)</Text>
                <Text className="text-sm font-medium text-text-primary">
                  {formatVND(subtotal)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2.5">
                <Text className="text-sm text-gray-500">Phí vận chuyển</Text>
                <Text className="text-sm font-medium text-green-600">Miễn phí</Text>
              </View>
              <View className="border-t border-gray-200 pt-3 mt-1">
                <View className="flex-row justify-between">
                  <Text className="text-base font-bold text-text-primary">Tổng cộng</Text>
                  <Text className="text-lg font-bold text-primary">{formatVND(subtotal)}</Text>
                </View>
              </View>
            </View>

            <View className="h-4" />
          </ScrollView>

          <View className="px-4 py-3 bg-white border-t border-gray-100">
            <TouchableOpacity
              onPress={handleCheckout}
              className="bg-primary py-4 rounded-xl flex-row items-center justify-center"
            >
              <MaterialIcons name="payment" size={20} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">
                Thanh toán • {formatVND(subtotal)}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};
