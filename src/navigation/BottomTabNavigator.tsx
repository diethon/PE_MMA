import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions, useNavigation } from '@react-navigation/native';

import { HomeScreen } from '@/screens/HomeScreen';
import { ProductListScreen } from '@/screens/ProductListScreen';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';
import { CartScreen } from '@/screens/CartScreen';
import { FavoritesScreen } from '@/screens/FavoritesScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { ProductManagementScreen } from '@/screens/ProductManagementScreen';
import { ProductFormScreen } from '@/screens/ProductFormScreen';
import { OrderHistoryScreen } from '@/screens/OrderHistoryScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { CheckoutScreen } from '@/screens/CheckoutScreen';
import { AddressListScreen } from '@/screens/AddressListScreen';

import { Colors } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import type { TabParamList, AppStackParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

/* ── Shared ref so AppHeader / Drawer can access a navigator inside the tab tree ── */
let _innerNav: any = null;

/* ── Drawer Context ── */
const DrawerContext = createContext<{ openDrawer: () => void }>({ openDrawer: () => {} });
export const useDrawer = () => useContext(DrawerContext);


/* ── Persistent App Header ── */
interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showBack, onBack }) => {
  const { openDrawer } = useDrawer();

  return (
    <View className="flex-row items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
      {showBack ? (
        <TouchableOpacity onPress={onBack} className="p-1 mr-2">
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={openDrawer} className="p-1 mr-2">
          <MaterialIcons name="menu" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      )}
      <Text className="text-lg font-bold text-text-primary flex-1" numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
};

/* ── Tab Stacks ── */
const HomeStack = () => {
  _innerNav = useNavigation<any>();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ProductListMain" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
};

const ProductsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProductListMain" component={ProductListScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
  </Stack.Navigator>
);

const FavoritesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FavoritesMain" component={FavoritesScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
  </Stack.Navigator>
);

const RevenueStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="RevenueMain" component={DashboardScreen} />
    <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
    <Stack.Screen name="ProductForm" component={ProductFormScreen} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OrdersMain" component={OrderHistoryScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="AddressList" component={AddressListScreen} />
  </Stack.Navigator>
);

/* ── Icon mapping for tabs ── */
const TAB_ICONS: Record<string, { active: keyof typeof MaterialIcons.glyphMap; inactive: keyof typeof MaterialIcons.glyphMap }> = {
  HomeTab: { active: 'home', inactive: 'home-filled' },
  ProductsTab: { active: 'search', inactive: 'search' },
  FavoritesTab: { active: 'favorite', inactive: 'favorite-border' },
  OrdersTab: { active: 'notifications', inactive: 'notifications-none' },
  RevenueTab: { active: 'bar-chart', inactive: 'bar-chart' },
  ProfileTab: { active: 'person', inactive: 'person-outline' },
  CartTab: { active: 'shopping-cart', inactive: 'shopping-cart' },
};

/* ── Custom Tab Bar ── */
const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { cartCount } = useCart();
  const insets = useSafeAreaInsets();

  const hiddenTabs = new Set(['CartTab', 'ProfileTab']);
  const mainRoutes = state.routes.filter((r) => !hiddenTabs.has(r.name));
  const cartRoute = state.routes.find((r) => r.name === 'CartTab');
  const cartIndex = state.routes.findIndex((r) => r.name === 'CartTab');

  return (
    <View
      style={[
        tabBarStyles.container,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <View style={tabBarStyles.pillContainer}>
        {mainRoutes.map((route) => {
          const realIndex = state.routes.indexOf(route);
          const isFocused = state.index === realIndex;
          const icons = TAB_ICONS[route.name] || { active: 'circle', inactive: 'circle' };
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={[
                tabBarStyles.pillTab,
                isFocused ? tabBarStyles.pillTabActive : tabBarStyles.pillTabInactive,
              ]}
            >
              <MaterialIcons
                name={isFocused ? icons.active : icons.inactive}
                size={22}
                color={isFocused ? '#1A1A1A' : '#9CA3AF'}
              />
              {isFocused && (
                <Text style={tabBarStyles.pillTabLabel} numberOfLines={1}>
                  {options.tabBarLabel as string || route.name}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {cartRoute && (
        <TouchableOpacity
          onPress={() => navigation.navigate('CartTab')}
          activeOpacity={0.7}
          style={[
            tabBarStyles.cartButton,
            state.index === cartIndex && tabBarStyles.cartButtonActive,
          ]}
        >
          <View>
            <MaterialIcons
              name="shopping-cart"
              size={22}
              color={state.index === cartIndex ? '#fff' : '#4B5563'}
            />
            {cartCount > 0 && (
              <View style={tabBarStyles.cartBadge}>
                <Text style={tabBarStyles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const tabBarStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  pillContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 32,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 6 },
    }),
  },
  pillTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 26,
  },
  pillTabInactive: {
    paddingHorizontal: 14,
  },
  pillTabActive: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 14,
  },
  pillTabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 6,
  },
  cartButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 6 },
    }),
  },
  cartButtonActive: {
    backgroundColor: Colors.primary,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

/* ── Drawer Content ── */
interface DrawerProps {
  visible: boolean;
  slideAnim: Animated.Value;
  overlayAnim: Animated.Value;
  onClose: () => void;
}

const DrawerContent: React.FC<DrawerProps> = ({ visible, slideAnim, overlayAnim, onClose }) => {
  const { user, isSeller, logout } = useAuth();
  const { cartCount } = useCart();
  const { favCount } = useFavorites();
  const rootNav = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const goTo = (tabName: string) => {
    onClose();
    setTimeout(() => {
      if (_innerNav) _innerNav.navigate(tabName);
    }, 250);
  };

  const handleLogout = () => {
    onClose();
    setTimeout(() => {
      logout();
      rootNav.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }),
      );
    }, 300);
  };

  const mainItems = [
    { icon: 'home', label: 'Trang chủ', color: Colors.primary, onPress: () => goTo('HomeTab') },
    { icon: 'grid-view', label: 'Sản phẩm', color: '#8B5CF6', onPress: () => goTo('ProductsTab'), hide: isSeller },
    { icon: 'favorite', label: 'Yêu thích', color: '#EF4444', badge: favCount, onPress: () => goTo('FavoritesTab'), hide: isSeller },
    { icon: 'shopping-cart', label: 'Giỏ hàng', color: '#F59E0B', badge: cartCount, onPress: () => { onClose(); setTimeout(() => { if (_innerNav) _innerNav.navigate('HomeTab', { screen: 'Cart' }); }, 250); } },
    ...(isSeller
      ? [{ icon: 'bar-chart', label: 'Doanh thu', color: '#10B981', onPress: () => goTo('RevenueTab') }]
      : [{ icon: 'receipt-long', label: 'Đơn mua', color: '#10B981', onPress: () => goTo('OrdersTab') }]
    ),
    { icon: 'person', label: 'Tài khoản', color: '#3B82F6', onPress: () => goTo('ProfileTab') },
  ].filter((item) => !('hide' in item && item.hide));

  const bottomItems = [
    { icon: 'settings', label: 'Cài đặt', color: '#64748B' },
    { icon: 'help-outline', label: 'Hỗ trợ', color: '#64748B' },
  ];

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Animated.View
          style={{
            width: DRAWER_WIDTH,
            backgroundColor: '#fff',
            paddingTop: insets.top,
            transform: [{ translateX: slideAnim }],
            elevation: 20,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 20,
            shadowOffset: { width: 5, height: 0 },
          }}
        >
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View className="px-5 pb-5 pt-3" style={{ backgroundColor: Colors.primary }}>
              <View className="flex-row items-center">
                <View
                  className="rounded-full bg-white/20 items-center justify-center mr-3"
                  style={{ width: 52, height: 52 }}
                >
                  <Text className="text-white text-xl font-bold">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-bold" numberOfLines={1}>
                    {user?.fullName || 'Guest'}
                  </Text>
                  <Text className="text-white/70 text-xs mt-0.5" numberOfLines={1}>
                    {user?.email || ''}
                  </Text>
                  <View className="mt-1.5 px-2 py-0.5 rounded-full bg-white/20 self-start">
                    <Text className="text-white text-[10px] font-semibold">
                      {isSeller ? 'Người bán' : 'Người mua'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} className="p-1">
                  <MaterialIcons name="close" size={22} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Items */}
            <ScrollView className="flex-1 pt-2">
              {mainItems.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={item.onPress}
                  className="flex-row items-center px-5 py-3.5"
                  activeOpacity={0.6}
                >
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: item.color + '15' }}
                  >
                    <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text className="flex-1 text-sm font-medium text-text-primary">
                    {item.label}
                  </Text>
                  {'badge' in item && (item as any).badge > 0 ? (
                    <View className="bg-red-500 rounded-full px-2 py-0.5 min-w-[20px] items-center">
                      <Text className="text-white text-[10px] font-bold">
                        {(item as any).badge > 99 ? '99+' : (item as any).badge}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              ))}

              <View className="border-t border-gray-100 mx-5 my-2" />

              {bottomItems.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  className="flex-row items-center px-5 py-3.5"
                  activeOpacity={0.6}
                >
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: item.color + '15' }}
                  >
                    <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text className="flex-1 text-sm font-medium text-gray-500">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Footer */}
            <View className="px-5 pb-6 pt-3 border-t border-gray-100">
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center justify-center bg-red-50 rounded-xl py-3"
              >
                <MaterialIcons name="logout" size={18} color="#EF4444" />
                <Text className="text-red-500 font-bold text-sm ml-2">Đăng xuất</Text>
              </TouchableOpacity>
              <Text className="text-center text-[10px] text-gray-300 mt-3">Aura Tech v1.0.0</Text>
            </View>
          </View>
        </Animated.View>

        <Pressable style={{ flex: 1 }} onPress={onClose}>
          <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', opacity: overlayAnim }} />
        </Pressable>
      </View>
    </Modal>
  );
};

/* ── Main BottomTabNavigator ── */
export const BottomTabNavigator: React.FC = () => {
  const { isSeller } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [slideAnim, overlayAnim]);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 200, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  }, [slideAnim, overlayAnim]);

  return (
    <DrawerContext.Provider value={{ openDrawer }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
        <AppHeader title="Aura Tech" />

        <Tab.Navigator
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tab.Screen
            name="HomeTab"
            component={HomeStack}
            options={{ tabBarLabel: 'Home' }}
          />
          {!isSeller && (
            <Tab.Screen
              name="ProductsTab"
              component={ProductsStack}
              options={{ tabBarLabel: 'Tìm kiếm' }}
            />
          )}
          {!isSeller && (
            <Tab.Screen
              name="FavoritesTab"
              component={FavoritesStack}
              options={{ tabBarLabel: 'Yêu thích' }}
            />
          )}
          {isSeller ? (
            <Tab.Screen
              name="RevenueTab"
              component={RevenueStack}
              options={{ tabBarLabel: 'Doanh thu' }}
            />
          ) : (
            <Tab.Screen
              name="OrdersTab"
              component={OrdersStack}
              options={{ tabBarLabel: 'Thông báo' }}
            />
          )}
          <Tab.Screen
            name="ProfileTab"
            component={ProfileStack}
            options={{ tabBarLabel: 'Tài khoản' }}
          />
          <Tab.Screen
            name="CartTab"
            component={CartStack}
            options={{ tabBarLabel: 'Giỏ hàng' }}
          />
        </Tab.Navigator>
      </SafeAreaView>

      <DrawerContent
        visible={drawerOpen}
        slideAnim={slideAnim}
        overlayAnim={overlayAnim}
        onClose={closeDrawer}
      />
    </DrawerContext.Provider>
  );
};
