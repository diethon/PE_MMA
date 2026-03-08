import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Linking, Dimensions, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { allProducts } from '@/constants/productData';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { AppStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

const categoryLabels: Record<string, string> = {
  phone: 'Điện thoại',
  laptop: 'Laptop',
  tablet: 'Máy tính bảng',
  watch: 'Đồng hồ',
  earphone: 'Tai nghe',
  powerbank: 'Sạc dự phòng',
  adapter: 'Adapter sạc',
};

function formatVND(num: number): string {
  if (!num) return '0₫';
  return num.toLocaleString('vi-VN') + '₫';
}

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'ProductDetail'>>();
  const { productId } = route.params;
  const product = useMemo(
    () => allProducts.find((p) => p.id === productId) ?? allProducts[0],
    [productId],
  );
  const { addProduct, checkoutSelected } = useCart();
  const { user } = useAuth();
  const { isFav, toggleFav } = useFavorites();
  const favorite = isFav(product.id);

  const [showBuyNow, setShowBuyNow] = useState(false);
  const [buyQty, setBuyQty] = useState(1);
  const [showAddCart, setShowAddCart] = useState(false);
  const [cartQty, setCartQty] = useState(1);

  const handleAddToCart = useCallback(async () => {
    await addProduct(product, cartQty);
    setShowAddCart(false);
    setCartQty(1);
    Alert.alert('Thành công', `Đã thêm ${cartQty} sản phẩm vào giỏ hàng.`);
  }, [product, cartQty, addProduct]);

  const handleBuyNow = useCallback(async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để mua hàng.');
      return;
    }
    const total = product.priceNum * buyQty;
    Alert.alert(
      'Xác nhận mua hàng',
      `${product.name}\nSố lượng: ${buyQty}\nTổng: ${formatVND(total)}\n\nXác nhận đặt hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thanh toán',
          onPress: async () => {
            try {
              await addProduct(product, buyQty);
              const orderId = await checkoutSelected([product.id]);
              setShowBuyNow(false);
              setBuyQty(1);
              Alert.alert(
                'Đặt hàng thành công!',
                `Mã đơn: ${orderId}\nTổng: ${formatVND(total)}\n\nCảm ơn bạn đã mua hàng!`,
              );
            } catch {
              Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại.');
            }
          },
        },
      ],
    );
  }, [user, product, buyQty, addProduct, checkoutSelected]);

  const relatedProducts = useMemo(
    () =>
      allProducts
        .filter((p) => p.brand === product.brand && p.id !== product.id)
        .slice(0, 6),
    [product],
  );

  return (
    <View className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Inline back + fav row */}
        <View className="flex-row items-center justify-between px-4 py-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center"
          >
            <MaterialIcons name="arrow-back-ios" size={18} color={Colors.primary} />
            <Text className="text-sm text-primary font-medium">Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleFav(product.id)} className="p-1">
            <MaterialIcons
              name={favorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={favorite ? '#EF4444' : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Product Image */}
        <View className="bg-white mx-4 rounded-2xl overflow-hidden mb-4 items-center justify-center py-4">
          <Image
            source={{ uri: product.image }}
            style={{ width: width - 80, height: width - 80 }}
            resizeMode="contain"
          />
        </View>

        {/* Category & Brand Badge */}
        <View className="flex-row items-center px-4 mb-2">
          <View className="bg-cyan-50 px-2.5 py-1 rounded-full mr-2">
            <Text className="text-xs text-primary font-medium">
              {categoryLabels[product.category] ?? product.category}
            </Text>
          </View>
          <View className="bg-gray-100 px-2.5 py-1 rounded-full">
            <Text className="text-xs text-gray-600 font-medium">{product.brand}</Text>
          </View>
        </View>

        {/* Product Name */}
        <View className="px-4 mb-3">
          <Text className="text-xl font-bold text-text-primary leading-7">
            {product.name}
          </Text>
        </View>

        {/* Price Section */}
        <View className="px-4 mb-4">
          {product.price ? (
            <View className="flex-row items-end">
              <Text className="text-2xl font-bold text-primary">{product.price}</Text>
              {product.oldPrice ? (
                <Text className="text-base text-gray-400 line-through ml-3 mb-0.5">
                  {product.oldPrice}
                </Text>
              ) : null}
              {product.discount ? (
                <View className="bg-red-500 ml-2 px-2 py-0.5 rounded mb-0.5">
                  <Text className="text-white text-xs font-bold">{product.discount}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text className="text-lg text-gray-400 italic">Liên hệ để biết giá</Text>
          )}
        </View>

        {/* Rating & Sold */}
        {product.rating || product.sold ? (
          <View className="flex-row items-center px-4 mb-4">
            {product.rating ? (
              <View className="flex-row items-center bg-amber-50 px-3 py-1.5 rounded-full mr-3">
                <MaterialIcons name="star" size={16} color={Colors.star} />
                <Text className="text-sm font-semibold text-amber-700 ml-1">
                  {product.rating}
                </Text>
              </View>
            ) : null}
            {product.sold ? (
              <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-full">
                <MaterialIcons name="local-fire-department" size={14} color="#EF4444" />
                <Text className="text-sm text-gray-600 ml-1">
                  {product.sold.replace('• ', '')}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Specs */}
        {product.specs.length > 0 ? (
          <View className="mx-4 bg-gray-50 rounded-xl p-4 mb-4">
            <Text className="text-base font-bold text-text-primary mb-3">Thông số</Text>
            {product.specs.map((spec, idx) => (
              <View key={idx} className="flex-row items-start mb-2">
                <MaterialIcons name="check-circle" size={16} color={Colors.primary} style={{ marginTop: 2 }} />
                <Text className="text-sm text-gray-700 ml-2 flex-1">{spec}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Related Products */}
        {relatedProducts.length > 0 ? (
          <View className="mb-6">
            <Text className="text-base font-bold text-text-primary px-4 mb-3">
              Sản phẩm cùng hãng
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              {relatedProducts.map((rp) => (
                <TouchableOpacity
                  key={rp.id}
                  onPress={() => navigation.push('ProductDetail', { productId: rp.id })}
                  className="bg-card border border-border rounded-xl mr-3 overflow-hidden"
                  style={{ width: 150 }}
                >
                  <Image
                    source={{ uri: rp.image }}
                    style={{ width: 150, height: 120 }}
                    resizeMode="contain"
                  />
                  <View className="p-2">
                    <Text className="text-xs font-medium text-text-primary" numberOfLines={2}>
                      {rp.name}
                    </Text>
                    {rp.price ? (
                      <Text className="text-xs font-bold text-primary mt-1">{rp.price}</Text>
                    ) : (
                      <Text className="text-xs text-gray-400 italic mt-1">Liên hệ</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View className="h-4" />
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-4 py-3 bg-white border-t border-gray-100 flex-row">
        <TouchableOpacity
          onPress={() => { setCartQty(1); setShowAddCart(true); }}
          className="flex-1 bg-gray-100 py-3.5 rounded-xl flex-row items-center justify-center mr-2"
        >
          <MaterialIcons name="add-shopping-cart" size={20} color={Colors.primary} />
          <Text className="text-primary font-bold text-sm ml-2">Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setBuyQty(1); setShowBuyNow(true); }}
          className="flex-1 bg-primary py-3.5 rounded-xl flex-row items-center justify-center"
        >
          <MaterialIcons name="flash-on" size={20} color="#fff" />
          <Text className="text-white font-bold text-sm ml-1">Mua ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Add to Cart Bottom Sheet */}
      <Modal
        visible={showAddCart}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddCart(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowAddCart(false)}
          className="flex-1 bg-black/40 justify-end"
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}} className="bg-white rounded-t-2xl">
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>

            <View className="flex-row px-5 pb-4 border-b border-gray-100">
              <Image
                source={{ uri: product.image }}
                style={{ width: 80, height: 80 }}
                className="rounded-lg"
                resizeMode="contain"
              />
              <View className="flex-1 ml-3 justify-center">
                <Text className="text-sm font-semibold text-text-primary" numberOfLines={2}>
                  {product.name}
                </Text>
                <Text className="text-lg font-bold text-primary mt-1">
                  {product.price || 'Liên hệ'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between px-5 py-4">
              <Text className="text-base font-medium text-text-primary">Số lượng</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200">
                <TouchableOpacity
                  onPress={() => setCartQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5"
                >
                  <MaterialIcons name="remove" size={18} color={cartQty <= 1 ? '#CBD5E1' : Colors.textSecondary} />
                </TouchableOpacity>
                <Text className="text-base font-bold text-text-primary px-4 min-w-[40px] text-center">
                  {cartQty}
                </Text>
                <TouchableOpacity
                  onPress={() => setCartQty((q) => q + 1)}
                  className="px-4 py-2.5"
                >
                  <MaterialIcons name="add" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View className="px-5 pb-8">
              <TouchableOpacity
                onPress={handleAddToCart}
                className="bg-primary py-4 rounded-xl flex-row items-center justify-center"
              >
                <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
                <Text className="text-white font-bold text-base ml-2">
                  Thêm vào giỏ hàng ({cartQty})
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Buy Now Bottom Sheet */}
      <Modal
        visible={showBuyNow}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBuyNow(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowBuyNow(false)}
          className="flex-1 bg-black/40 justify-end"
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}} className="bg-white rounded-t-2xl">
            {/* Handle bar */}
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Product info */}
            <View className="flex-row px-5 pb-4 border-b border-gray-100">
              <Image
                source={{ uri: product.image }}
                style={{ width: 80, height: 80 }}
                className="rounded-lg"
                resizeMode="contain"
              />
              <View className="flex-1 ml-3 justify-center">
                <Text className="text-sm font-semibold text-text-primary" numberOfLines={2}>
                  {product.name}
                </Text>
                <Text className="text-lg font-bold text-primary mt-1">
                  {product.price || 'Liên hệ'}
                </Text>
              </View>
            </View>

            {/* Quantity selector */}
            <View className="flex-row items-center justify-between px-5 py-4">
              <Text className="text-base font-medium text-text-primary">Số lượng</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200">
                <TouchableOpacity
                  onPress={() => setBuyQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5"
                >
                  <MaterialIcons name="remove" size={18} color={buyQty <= 1 ? '#CBD5E1' : Colors.textSecondary} />
                </TouchableOpacity>
                <Text className="text-base font-bold text-text-primary px-4 min-w-[40px] text-center">
                  {buyQty}
                </Text>
                <TouchableOpacity
                  onPress={() => setBuyQty((q) => q + 1)}
                  className="px-4 py-2.5"
                >
                  <MaterialIcons name="add" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Price summary */}
            <View className="mx-5 bg-gray-50 rounded-xl p-4 mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-500">Đơn giá</Text>
                <Text className="text-sm font-medium text-text-primary">
                  {formatVND(product.priceNum)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-500">Số lượng</Text>
                <Text className="text-sm font-medium text-text-primary">x{buyQty}</Text>
              </View>
              <View className="border-t border-gray-200 pt-2 mt-1">
                <View className="flex-row justify-between">
                  <Text className="text-base font-bold text-text-primary">Tổng cộng</Text>
                  <Text className="text-lg font-bold text-primary">
                    {formatVND(product.priceNum * buyQty)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Checkout button */}
            <View className="px-5 pb-8">
              <TouchableOpacity
                onPress={handleBuyNow}
                className="bg-primary py-4 rounded-xl flex-row items-center justify-center"
              >
                <MaterialIcons name="payment" size={20} color="#fff" />
                <Text className="text-white font-bold text-base ml-2">
                  Thanh toán • {formatVND(product.priceNum * buyQty)}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
