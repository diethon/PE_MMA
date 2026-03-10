import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import {
  getTotalRevenue,
  getTotalOrders,
  getTotalItemsSold,
  getDistinctBuyersCount,
  getRevenueByCategory,
  getTopProducts,
  getOrderHistory,
  type RevenueByCategory,
  type TopProduct,
  type OrderSummary,
} from '@/services/orderDb';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { formatVND } from '@/utils/format';

const categoryIcons: Record<string, string> = {
  phone: 'smartphone',
  laptop: 'laptop',
  tablet: 'tablet',
  watch: 'watch',
  earphone: 'headphones',
  powerbank: 'battery-charging-full',
  adapter: 'power',
};

const categoryLabels: Record<string, string> = {
  phone: 'Điện thoại',
  laptop: 'Laptop',
  tablet: 'Máy tính bảng',
  watch: 'Đồng hồ',
  earphone: 'Tai nghe',
  powerbank: 'Sạc dự phòng',
  adapter: 'Adapter',
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng!';
  if (h < 18) return 'Chào buổi chiều!';
  return 'Chào buổi tối!';
}

function getMonthYear(): string {
  const d = new Date();
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user, isSeller } = useAuth();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [buyersCount, setBuyersCount] = useState(0);
  const [revByCategory, setRevByCategory] = useState<RevenueByCategory[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [rev, ordCount, items, buyers, byCat, top, hist] = await Promise.all([
        getTotalRevenue(),
        getTotalOrders(),
        getTotalItemsSold(),
        getDistinctBuyersCount(),
        getRevenueByCategory(),
        getTopProducts(8),
        getOrderHistory(),
      ]);
      setTotalRevenue(rev);
      setTotalOrders(ordCount);
      setTotalItems(items);
      setBuyersCount(buyers);
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
    const unsub = navigation.addListener('focus', () => loadData());
    return unsub;
  }, [navigation, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const maxCatRevenue = Math.max(...revByCategory.map((c) => c.total), 1);
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const totalItemsForPct = totalItems || 1;

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const hasData = totalOrders > 0;

  return (
    <View style={s.screen}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header: Greeting + Avatar + Notifications */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'S'}
              </Text>
            </View>
            <View>
              <Text style={s.greeting}>{getGreeting()}</Text>
              <Text style={s.sellerName}>{user?.fullName || 'Seller'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onRefresh} style={s.iconBtn}>
            <MaterialIcons name="notifications-none" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {!hasData ? (
          <View style={s.empty}>
            <MaterialIcons name="analytics" size={72} color={Colors.textMuted} />
            <Text style={s.emptyTitle}>Chưa có đơn hàng</Text>
            <Text style={s.emptySub}>
              Doanh thu và thống kê sẽ hiển thị tại đây khi có đơn hàng
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProductListMain')}
              style={s.emptyBtn}
            >
              <MaterialIcons name="shopping-bag" size={18} color="#fff" />
              <Text style={s.emptyBtnText}>Mua sắm ngay</Text>
            </TouchableOpacity>
            {isSeller && (
              <TouchableOpacity
                onPress={() => navigation.navigate('ProductManagement')}
                style={[s.emptyBtn, { marginTop: 12, backgroundColor: Colors.primaryDark }]}
              >
                <MaterialIcons name="inventory" size={18} color="#fff" />
                <Text style={s.emptyBtnText}>Quản lý sản phẩm</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {/* Sales Overview Card */}
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitle}>Tổng quan doanh thu</Text>
                <View style={s.periodRow}>
                  <Text style={s.periodText}>{getMonthYear()}</Text>
                  <MaterialIcons name="open-in-new" size={16} color={Colors.textMuted} />
                </View>
              </View>

              <View style={s.totalRow}>
                <View style={s.totalLeft}>
                  <Text style={s.totalLabel}>Tổng thu nhập</Text>
                  <Text style={s.totalValue}>{formatVND(totalRevenue)}</Text>
                </View>
                <View style={s.miniChart}>
                  {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8].map((h, i) => (
                    <View
                      key={i}
                      style={[s.miniBar, { height: `${h * 100}%`, backgroundColor: Colors.primary + '40' }]}
                    />
                  ))}
                </View>
              </View>

              <View style={s.metricsRow}>
                <View style={s.metric}>
                  <Text style={s.metricLabel}>Doanh thu</Text>
                  <Text style={s.metricValue}>{formatVND(totalRevenue)}</Text>
                </View>
                <View style={s.metricDivider} />
                <View style={s.metric}>
                  <Text style={s.metricLabel}>Đơn hàng</Text>
                  <Text style={s.metricValue}>{totalOrders}</Text>
                </View>
                <View style={s.metricDivider} />
                <View style={s.metric}>
                  <Text style={s.metricLabel}>Khách hàng</Text>
                  <Text style={s.metricValue}>{buyersCount}</Text>
                </View>
                <View style={s.metricDivider} />
                <View style={s.metric}>
                  <Text style={s.metricLabel}>Đơn TB</Text>
                  <Text style={s.metricValue}>{formatVND(avgOrder)}</Text>
                </View>
              </View>
            </View>

            {/* Top Selling Products */}
            {topProducts.length > 0 && (
              <View style={s.section}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>Sản phẩm bán chạy</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ProductManagement')}
                  >
                    <Text style={s.seeAll}>Quản lý sản phẩm</Text>
                  </TouchableOpacity>
                </View>
                {topProducts.map((item) => {
                  const pct = Math.round((item.totalSold / totalItemsForPct) * 100);
                  return (
                    <TouchableOpacity
                      key={item.productId}
                      style={s.productRow}
                      activeOpacity={0.6}
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={s.productThumb}
                        resizeMode="contain"
                      />
                      <View style={s.productInfo}>
                        <Text style={s.productName} numberOfLines={1}>{item.name}</Text>
                        <Text style={s.productBrand}>{item.brand}</Text>
                        <View style={s.productStats}>
                          <MaterialIcons name="trending-up" size={12} color={Colors.success} />
                          <Text style={s.productPct}>{pct}% đã bán</Text>
                        </View>
                      </View>
                      <Text style={s.productQty}>{item.totalSold.toLocaleString('vi-VN')}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Revenue by Category */}
            {revByCategory.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Doanh thu theo danh mục</Text>
                <View style={s.categoryCard}>
                  {revByCategory.map((cat) => {
                    const pct = Math.round((cat.total / maxCatRevenue) * 100);
                    return (
                      <View key={cat.category} style={s.categoryRow}>
                        <View style={s.categoryTopRow}>
                          <View style={s.categoryLeft}>
                            <MaterialIcons
                              name={(categoryIcons[cat.category] ?? 'category') as any}
                              size={18}
                              color={Colors.primary}
                            />
                            <View style={s.categoryText}>
                              <Text style={s.categoryName}>{categoryLabels[cat.category] ?? cat.category}</Text>
                              <Text style={s.categoryCount}>{cat.count} SP</Text>
                            </View>
                          </View>
                          <Text style={s.categoryRevenue}>{formatVND(cat.total)}</Text>
                        </View>
                        <View style={s.categoryBarWrap}>
                          <View style={[s.categoryBar, { width: `${pct}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Order History */}
            {orders.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Lịch sử đơn hàng</Text>
                {orders.slice(0, 5).map((order) => (
                  <View key={order.orderId} style={s.orderCard}>
                    <View style={s.orderRow}>
                      <MaterialIcons name="receipt" size={16} color={Colors.primary} />
                      <Text style={s.orderId}>{order.orderId}</Text>
                      <View style={s.orderBadge}>
                        <Text style={s.orderBadgeText}>Hoàn thành</Text>
                      </View>
                    </View>
                    <View style={s.orderRow2}>
                      <Text style={s.orderMeta}>
                        {order.itemCount} SP • {order.createdAt.split('T')[0] || order.createdAt.substring(0, 10)}
                      </Text>
                      <Text style={s.orderTotal}>{formatVND(order.total)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 24 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  centered: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  greeting: { fontSize: 13, color: Colors.textMuted },
  sellerName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  iconBtn: { padding: 4 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginTop: 16 },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: 8 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff', marginLeft: 8 },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  periodRow: { flexDirection: 'row', alignItems: 'center' },
  periodText: { fontSize: 13, color: Colors.textSecondary, marginRight: 4 },

  totalRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 },
  totalLeft: {},
  totalLabel: { fontSize: 13, color: Colors.textMuted, marginBottom: 4 },
  totalValue: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 4,
  },
  miniBar: { width: 6, borderRadius: 3 },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 16,
  },
  metric: { flex: 1, alignItems: 'center' },
  metricLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 4 },
  metricValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  metricDivider: { width: 1, height: 28, backgroundColor: Colors.borderLight },

  section: { marginHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  productThumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: Colors.background },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  productBrand: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  productStats: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  productPct: { fontSize: 11, color: Colors.success, marginLeft: 4, fontWeight: '600' },
  productQty: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },

  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryRow: { marginBottom: 14 },
  categoryTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  categoryLeft: { flexDirection: 'row', alignItems: 'center' },
  categoryText: { marginLeft: 10 },
  categoryName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  categoryCount: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  categoryRevenue: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  categoryBarWrap: { height: 6, backgroundColor: Colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  categoryBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  orderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  orderId: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginLeft: 8 },
  orderBadge: { marginLeft: 'auto', backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  orderBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.primaryDark },
  orderRow2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderMeta: { fontSize: 12, color: Colors.textMuted },
  orderTotal: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
