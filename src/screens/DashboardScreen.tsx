import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import {
  getTotalRevenue,
  getTotalOrders,
  getTotalItemsSold,
  getRevenueByCategory,
  getTopProducts,
  getOrderHistory,
  type RevenueByCategory,
  type TopProduct,
  type OrderSummary,
} from '@/services/orderDb';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/types';

function formatVND(num: number): string {
  if (!num) return '0₫';
  return num.toLocaleString('vi-VN') + '₫';
}

function formatShort(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

const categoryIcons: Record<string, string> = {
  phone: 'smartphone',
  laptop: 'laptop',
  tablet: 'tablet',
  watch: 'watch',
};

const categoryLabels: Record<string, string> = {
  phone: 'Điện thoại',
  laptop: 'Laptop',
  tablet: 'Máy tính bảng',
  watch: 'Đồng hồ',
};

const categoryColors: Record<string, string> = {
  phone: '#06B6D4',
  laptop: '#8B5CF6',
  tablet: '#F59E0B',
  watch: '#10B981',
};

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [revByCategory, setRevByCategory] = useState<RevenueByCategory[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [rev, ordCount, items, byCat, top, hist] = await Promise.all([
        getTotalRevenue(),
        getTotalOrders(),
        getTotalItemsSold(),
        getRevenueByCategory(),
        getTopProducts(5),
        getOrderHistory(),
      ]);
      setTotalRevenue(rev);
      setTotalOrders(ordCount);
      setTotalItems(items);
      setRevByCategory(byCat);
      setTopProducts(top);
      setOrders(hist);
    } catch (e) {
      console.warn('Dashboard load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      loadData();
    });
    return unsub;
  }, [navigation, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const maxCatRevenue = Math.max(...revByCategory.map((c) => c.total), 1);

  if (loading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const hasData = totalOrders > 0;

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="text-xl font-bold text-text-primary">Phân tích doanh thu</Text>
          <TouchableOpacity onPress={onRefresh} className="p-1">
            <MaterialIcons name="refresh" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {!hasData ? (
          <View className="flex-1 items-center justify-center px-6 py-20">
            <MaterialIcons name="analytics" size={72} color={Colors.textMuted} />
            <Text className="text-xl font-bold text-gray-700 mt-4">Chưa có đơn hàng</Text>
            <Text className="text-sm text-gray-400 mt-2 text-center">
              Hãy mua sắm và thanh toán để xem thống kê doanh thu tại đây
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
            {/* Summary Cards */}
            <View className="flex-row px-4 mb-4">
              <View className="flex-1 bg-primary rounded-2xl p-4 mr-2">
                <View className="flex-row items-center mb-2">
                  <MaterialIcons name="account-balance-wallet" size={18} color="rgba(255,255,255,0.8)" />
                  <Text className="text-white/80 text-xs ml-1.5">Tổng doanh thu</Text>
                </View>
                <Text className="text-2xl font-bold text-white">{formatShort(totalRevenue)}</Text>
                <Text className="text-xs text-white/60 mt-1">{formatVND(totalRevenue)}</Text>
              </View>
              <View className="flex-1 ml-2">
                <View className="bg-violet-500 rounded-2xl p-4 mb-2">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-white/80 text-xs">Đơn hàng</Text>
                      <Text className="text-xl font-bold text-white mt-1">{totalOrders}</Text>
                    </View>
                    <MaterialIcons name="receipt-long" size={24} color="rgba(255,255,255,0.6)" />
                  </View>
                </View>
                <View className="bg-emerald-500 rounded-2xl p-4">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-white/80 text-xs">SP đã bán</Text>
                      <Text className="text-xl font-bold text-white mt-1">{totalItems}</Text>
                    </View>
                    <MaterialIcons name="inventory" size={24} color="rgba(255,255,255,0.6)" />
                  </View>
                </View>
              </View>
            </View>

            {/* Revenue by Category */}
            {revByCategory.length > 0 ? (
              <View className="mx-4 mb-4 bg-card rounded-xl p-4 border border-border">
                <Text className="text-base font-bold text-text-primary mb-4">
                  Doanh thu theo danh mục
                </Text>
                {revByCategory.map((cat) => {
                  const color = categoryColors[cat.category] ?? Colors.primary;
                  const pct = Math.round((cat.total / maxCatRevenue) * 100);
                  return (
                    <View key={cat.category} className="mb-4">
                      <View className="flex-row items-center justify-between mb-1.5">
                        <View className="flex-row items-center">
                          <View
                            className="w-8 h-8 rounded-lg items-center justify-center mr-2.5"
                            style={{ backgroundColor: color + '20' }}
                          >
                            <MaterialIcons
                              name={(categoryIcons[cat.category] ?? 'category') as any}
                              size={16}
                              color={color}
                            />
                          </View>
                          <View>
                            <Text className="text-sm font-semibold text-text-primary">
                              {categoryLabels[cat.category] ?? cat.category}
                            </Text>
                            <Text className="text-xs text-gray-400">{cat.count} sản phẩm</Text>
                          </View>
                        </View>
                        <Text className="text-sm font-bold text-text-primary">
                          {formatVND(cat.total)}
                        </Text>
                      </View>
                      <View className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <View
                          className="h-2.5 rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {/* Top Products */}
            {topProducts.length > 0 ? (
              <View className="mx-4 mb-4">
                <Text className="text-base font-bold text-text-primary mb-3">
                  Sản phẩm bán chạy nhất
                </Text>
                {topProducts.map((item, idx) => (
                  <View
                    key={item.productId}
                    className="flex-row items-center bg-card rounded-xl p-3 mb-2.5 border border-border"
                  >
                    <View className="relative">
                      <Image
                        source={{ uri: item.image }}
                        className="rounded-lg"
                        style={{ width: 50, height: 50 }}
                        resizeMode="contain"
                      />
                      <View
                        className="absolute -top-1 -left-1 w-5 h-5 rounded-full items-center justify-center"
                        style={{ backgroundColor: idx < 3 ? '#F59E0B' : Colors.textMuted }}
                      >
                        <Text className="text-white text-[10px] font-bold">{idx + 1}</Text>
                      </View>
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="text-sm font-semibold text-text-primary" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className="text-xs text-gray-400 mt-0.5">
                        {categoryLabels[item.category] ?? item.category} • {item.brand}
                      </Text>
                    </View>
                    <View className="items-end ml-2">
                      <Text className="text-sm font-bold text-primary">
                        {formatVND(item.totalRevenue)}
                      </Text>
                      <Text className="text-xs text-gray-400 mt-0.5">
                        x{item.totalSold} đã bán
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Order History */}
            {orders.length > 0 ? (
              <View className="mx-4 mb-6">
                <Text className="text-base font-bold text-text-primary mb-3">
                  Lịch sử đơn hàng
                </Text>
                {orders.map((order) => (
                  <View
                    key={order.orderId}
                    className="bg-card rounded-xl p-4 mb-2.5 border border-border"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <MaterialIcons name="receipt" size={16} color={Colors.primary} />
                        <Text className="text-sm font-semibold text-text-primary ml-1.5">
                          {order.orderId}
                        </Text>
                      </View>
                      <View className="bg-green-50 px-2 py-0.5 rounded-full">
                        <Text className="text-xs text-green-600 font-medium">Hoàn thành</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-gray-400">
                        {order.itemCount} sản phẩm • {order.createdAt.split('T')[0] || order.createdAt.substring(0, 10)}
                      </Text>
                      <Text className="text-sm font-bold text-primary">
                        {formatVND(order.total)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        )}

        <View className="h-4" />
      </ScrollView>
    </View>
  );
};
