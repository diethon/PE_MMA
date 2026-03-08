import React, { useState, useMemo, useCallback } from 'react';
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
  const { items, loading, updateQuantity, removeItem, clearCart, checkoutSelected } = useCart();
  const { user } = useAuth();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === items.length) return new Set();
      return new Set(items.map((i) => i.productId));
    });
  }, [items]);

  const allSelected = items.length > 0 && selectedIds.size === items.length;

  const { selectedSubtotal, selectedCount } = useMemo(() => {
    let sub = 0;
    let cnt = 0;
    for (const item of items) {
      if (selectedIds.has(item.productId)) {
        sub += item.priceNum * item.quantity;
        cnt += item.quantity;
      }
    }
    return { selectedSubtotal: sub, selectedCount: cnt };
  }, [items, selectedIds]);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleRemove = (productId: string) => {
    Alert.alert('Xóa sản phẩm', 'Bạn có chắc muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          removeItem(productId);
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        },
      },
    ]);
  };

  const handleClear = () => {
    Alert.alert('Xóa giỏ hàng', 'Bạn có chắc muốn xóa toàn bộ giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa tất cả',
        style: 'destructive',
        onPress: () => {
          clearCart();
          setSelectedIds(new Set());
        },
      },
    ]);
  };

  const handleCheckout = () => {
    if (!user) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thanh toán.');
      return;
    }
    if (selectedIds.size === 0) {
      Alert.alert('Chưa chọn sản phẩm', 'Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
      return;
    }
    Alert.alert(
      'Xác nhận thanh toán',
      `Bạn có chắc muốn đặt hàng?\n\nSố lượng: ${selectedCount} sản phẩm\nTổng tiền: ${formatVND(selectedSubtotal)}\nPhí vận chuyển: Miễn phí\n\nĐơn hàng sẽ được xử lý ngay sau khi xác nhận.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận đặt hàng',
          onPress: async () => {
            try {
              const orderId = await checkoutSelected(Array.from(selectedIds));
              setSelectedIds(new Set());
              Alert.alert(
                'Đặt hàng thành công!',
                `Mã đơn: ${orderId}\nTổng: ${formatVND(selectedSubtotal)}\n\nCảm ơn bạn đã mua hàng!`,
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
      {/* Header */}
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
        </View>
      ) : (
        <>
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            {/* Select all + count */}
            <View className="flex-row items-center justify-between py-3">
              <TouchableOpacity
                onPress={toggleSelectAll}
                className="flex-row items-center"
                activeOpacity={0.6}
              >
                <MaterialIcons
                  name={allSelected ? 'check-box' : 'check-box-outline-blank'}
                  size={22}
                  color={allSelected ? Colors.primary : '#CBD5E1'}
                />
                <Text className="text-sm font-medium text-text-primary ml-2">
                  Chọn tất cả
                </Text>
              </TouchableOpacity>
              <Text className="text-sm text-gray-500">
                {totalItemCount} sản phẩm trong giỏ
              </Text>
            </View>

            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                selected={selectedIds.has(item.productId)}
                onToggleSelect={toggleSelect}
                onQuantityChange={updateQuantity}
                onRemove={handleRemove}
              />
            ))}

            {/* Price Summary - only shows selected items */}
            {selectedIds.size > 0 && (
              <View className="bg-gray-50 rounded-xl p-4 mt-2 mb-4">
                <View className="flex-row justify-between mb-2.5">
                  <Text className="text-sm text-gray-500">
                    Đã chọn ({selectedCount} sp)
                  </Text>
                  <Text className="text-sm font-medium text-text-primary">
                    {formatVND(selectedSubtotal)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2.5">
                  <Text className="text-sm text-gray-500">Phí vận chuyển</Text>
                  <Text className="text-sm font-medium text-green-600">Miễn phí</Text>
                </View>
                <View className="border-t border-gray-200 pt-3 mt-1">
                  <View className="flex-row justify-between">
                    <Text className="text-base font-bold text-text-primary">Tổng cộng</Text>
                    <Text className="text-lg font-bold text-primary">
                      {formatVND(selectedSubtotal)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {selectedIds.size === 0 && (
              <View className="bg-yellow-50 rounded-xl p-4 mt-2 mb-4 flex-row items-center">
                <MaterialIcons name="info-outline" size={20} color="#F59E0B" />
                <Text className="text-sm text-yellow-700 ml-2 flex-1">
                  Chọn sản phẩm để xem tổng tiền và thanh toán
                </Text>
              </View>
            )}

            <View className="h-4" />
          </ScrollView>

          {/* Bottom checkout bar */}
          <View className="px-4 py-3 bg-white border-t border-gray-100">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-500">
                Đã chọn: <Text className="font-bold text-text-primary">{selectedIds.size}/{items.length}</Text> sản phẩm
              </Text>
              <Text className="text-base font-bold text-primary">
                {formatVND(selectedSubtotal)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCheckout}
              className="py-4 rounded-xl flex-row items-center justify-center"
              style={{ backgroundColor: selectedIds.size > 0 ? Colors.primary : '#CBD5E1' }}
              disabled={selectedIds.size === 0}
            >
              <MaterialIcons name="payment" size={20} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">
                {selectedIds.size > 0
                  ? `Thanh toán • ${formatVND(selectedSubtotal)}`
                  : 'Chọn sản phẩm để thanh toán'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};
