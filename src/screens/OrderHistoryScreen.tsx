import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import {
  getBuyerOrders,
  getBuyerOrdersByMonth,
  getBuyerTotalSpent,
  getBuyerTotalOrders,
  getBuyerMonthlySpending,
  getOrderItems,
  type OrderSummary,
  type OrderRow,
} from '@/services/orderDb';

function formatVND(num: number): string {
  if (!num) return '0₫';
  return num.toLocaleString('vi-VN') + '₫';
}

const months = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

export const OrderHistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{ month: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [filterMode, setFilterMode] = useState<'all' | 'month'>('all');
  const [showYearPicker, setShowYearPicker] = useState(false);

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<string, OrderRow[]>>({});

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [spent, ordCount, monthly] = await Promise.all([
        getBuyerTotalSpent(user.id),
        getBuyerTotalOrders(user.id),
        getBuyerMonthlySpending(user.id),
      ]);
      setTotalSpent(spent);
      setTotalOrders(ordCount);
      setMonthlyData(monthly);

      if (filterMode === 'all') {
        const allOrders = await getBuyerOrders(user.id);
        setOrders(allOrders);
      } else {
        const filtered = await getBuyerOrdersByMonth(user.id, selectedYear, selectedMonth);
        setOrders(filtered);
      }
    } catch (e) {
      console.warn('OrderHistory error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, filterMode, selectedYear, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleOrderDetail = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    if (!orderDetails[orderId]) {
      const items = await getOrderItems(orderId);
      setOrderDetails((prev) => ({ ...prev, [orderId]: items }));
    }
    setExpandedOrder(orderId);
  };

  const maxMonthlyTotal = Math.max(...monthlyData.map((m) => m.total), 1);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

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
        <View className="px-4 pt-3 pb-2">
          <Text className="text-xl font-bold text-text-primary">Đơn mua của tôi</Text>
          <Text className="text-xs text-gray-400 mt-0.5">
            Xin chào, {user?.fullName}
          </Text>
        </View>

        {/* Summary Cards */}
        <View className="flex-row px-4 mb-4">
          <View className="flex-1 bg-primary rounded-2xl p-4 mr-2">
            <MaterialIcons name="account-balance-wallet" size={20} color="rgba(255,255,255,0.7)" />
            <Text className="text-white/70 text-xs mt-2">Tổng đã chi</Text>
            <Text className="text-xl font-bold text-white mt-0.5">{formatVND(totalSpent)}</Text>
          </View>
          <View className="flex-1 bg-violet-500 rounded-2xl p-4 ml-2">
            <MaterialIcons name="receipt-long" size={20} color="rgba(255,255,255,0.7)" />
            <Text className="text-white/70 text-xs mt-2">Tổng đơn hàng</Text>
            <Text className="text-xl font-bold text-white mt-0.5">{totalOrders}</Text>
          </View>
        </View>

        {/* Monthly Chart */}
        {monthlyData.length > 0 ? (
          <View className="mx-4 mb-4 bg-card rounded-xl p-4 border border-border">
            <Text className="text-sm font-bold text-text-primary mb-3">Chi tiêu theo tháng</Text>
            {monthlyData.slice(0, 6).map((item) => {
              const pct = Math.round((item.total / maxMonthlyTotal) * 100);
              const [y, m] = item.month.split('-');
              const label = `T${parseInt(m)}/${y}`;
              return (
                <View key={item.month} className="mb-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-xs text-gray-500">{label}</Text>
                    <Text className="text-xs font-bold text-text-primary">{formatVND(item.total)}</Text>
                  </View>
                  <View className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <View
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Filter Tabs */}
        <View className="px-4 mb-3">
          <View className="flex-row bg-gray-100 rounded-xl p-1">
            <TouchableOpacity
              onPress={() => setFilterMode('all')}
              className={`flex-1 py-2.5 rounded-lg items-center ${filterMode === 'all' ? 'bg-white' : ''}`}
              style={filterMode === 'all' ? { elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } } : {}}
            >
              <Text className={`text-sm font-semibold ${filterMode === 'all' ? 'text-primary' : 'text-gray-400'}`}>
                Tất cả
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilterMode('month')}
              className={`flex-1 py-2.5 rounded-lg items-center ${filterMode === 'month' ? 'bg-white' : ''}`}
              style={filterMode === 'month' ? { elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } } : {}}
            >
              <Text className={`text-sm font-semibold ${filterMode === 'month' ? 'text-primary' : 'text-gray-400'}`}>
                Theo tháng
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Month/Year Picker */}
        {filterMode === 'month' ? (
          <View className="px-4 mb-3">
            <View className="flex-row items-center mb-2">
              <TouchableOpacity
                onPress={() => setShowYearPicker(true)}
                className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mr-3"
              >
                <Text className="text-sm font-semibold text-text-primary">{selectedYear}</Text>
                <MaterialIcons name="arrow-drop-down" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {months.map((m, idx) => {
                const isActive = selectedMonth === idx + 1;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedMonth(idx + 1)}
                    className={`mr-2 px-3.5 py-2 rounded-full ${isActive ? 'bg-primary' : 'bg-gray-100'}`}
                  >
                    <Text className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* Order Count */}
        <View className="px-4 mb-2">
          <Text className="text-xs text-gray-400">{orders.length} đơn hàng</Text>
        </View>

        {/* Order List */}
        {orders.length === 0 ? (
          <View className="items-center py-16 px-6">
            <MaterialIcons name="receipt-long" size={64} color={Colors.textMuted} />
            <Text className="text-base font-bold text-gray-600 mt-4">Chưa có đơn hàng</Text>
            <Text className="text-sm text-gray-400 mt-1 text-center">
              {filterMode === 'month'
                ? `Không có đơn hàng trong ${months[selectedMonth - 1]} ${selectedYear}`
                : 'Hãy mua sắm để thấy đơn hàng tại đây'}
            </Text>
          </View>
        ) : (
          <View className="px-4">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.orderId;
              const details = orderDetails[order.orderId];
              const dateStr = order.createdAt?.split('T')[0] || order.createdAt?.substring(0, 10) || '';
              return (
                <TouchableOpacity
                  key={order.orderId}
                  onPress={() => toggleOrderDetail(order.orderId)}
                  activeOpacity={0.8}
                  className="bg-card rounded-xl mb-3 border border-border overflow-hidden"
                >
                  {/* Order Header */}
                  <View className="p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <MaterialIcons name="receipt" size={16} color={Colors.primary} />
                        <Text className="text-sm font-semibold text-text-primary ml-1.5" numberOfLines={1}>
                          {order.orderId}
                        </Text>
                      </View>
                      <View className="bg-green-50 px-2 py-0.5 rounded-full ml-2">
                        <Text className="text-[10px] text-green-600 font-medium">Hoàn thành</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <MaterialIcons name="event" size={12} color="#9CA3AF" />
                        <Text className="text-xs text-gray-400 ml-1">{dateStr}</Text>
                        <Text className="text-xs text-gray-300 mx-2">•</Text>
                        <Text className="text-xs text-gray-400">{order.itemCount} sản phẩm</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-sm font-bold text-primary">{formatVND(order.total)}</Text>
                        <MaterialIcons
                          name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                          size={18}
                          color={Colors.textMuted}
                          style={{ marginLeft: 4 }}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Expanded Detail */}
                  {isExpanded && details ? (
                    <View className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                      {details.map((item, idx) => (
                        <View
                          key={idx}
                          className={`flex-row items-center ${idx > 0 ? 'mt-3 pt-3 border-t border-gray-100' : ''}`}
                        >
                          <Image
                            source={{ uri: item.image }}
                            className="rounded-lg"
                            style={{ width: 48, height: 48 }}
                            resizeMode="contain"
                          />
                          <View className="flex-1 ml-3">
                            <Text className="text-xs font-medium text-text-primary" numberOfLines={2}>
                              {item.name}
                            </Text>
                            <Text className="text-[10px] text-gray-400 mt-0.5">{item.brand}</Text>
                          </View>
                          <View className="items-end ml-2">
                            <Text className="text-xs font-bold text-text-primary">
                              {item.price || formatVND(item.priceNum)}
                            </Text>
                            <Text className="text-[10px] text-gray-400">x{item.quantity}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View className="h-4" />
      </ScrollView>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
          className="flex-1 bg-black/40 items-center justify-center"
        >
          <View className="bg-white rounded-2xl w-64 overflow-hidden">
            <Text className="text-base font-bold text-center py-3 border-b border-gray-100">Chọn năm</Text>
            {years.map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => {
                  setSelectedYear(y);
                  setShowYearPicker(false);
                }}
                className={`py-3.5 px-4 ${selectedYear === y ? 'bg-cyan-50' : ''}`}
              >
                <Text
                  className={`text-base text-center ${
                    selectedYear === y ? 'text-primary font-bold' : 'text-gray-700'
                  }`}
                >
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
