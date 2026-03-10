import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';

export const ProfileScreen: React.FC = () => {
  const { user, isSeller, logout } = useAuth();
  const { cartCount } = useCart();
  const { favCount } = useFavorites();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }),
          );
        },
      },
    ]);
  };

  const accountItems = [
    {
      icon: 'person-outline',
      label: 'Chỉnh sửa hồ sơ',
      subtitle: 'Tên, email, mật khẩu',
      color: Colors.primary,
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'location-on',
      label: 'Địa chỉ giao hàng',
      subtitle: 'Quản lý địa chỉ',
      color: '#F59E0B',
      onPress: () => navigation.navigate('AddressList'),
    },
    {
      icon: 'payment',
      label: 'Phương thức thanh toán',
      subtitle: 'Thẻ, ví điện tử',
      color: '#8B5CF6',
      onPress: () => {},
    },
  ];

  const generalItems = [
    { icon: 'notifications-none', label: 'Thông báo', subtitle: 'Cài đặt thông báo', color: '#EF4444', onPress: () => {} },
    { icon: 'language', label: 'Ngôn ngữ', subtitle: 'Tiếng Việt', color: '#3B82F6', onPress: () => {} },
    { icon: 'dark-mode', label: 'Giao diện', subtitle: 'Sáng', color: '#6366F1', onPress: () => {} },
  ];

  const supportItems = [
    { icon: 'help-outline', label: 'Trợ giúp & Hỗ trợ', subtitle: 'FAQ, liên hệ', color: '#10B981', onPress: () => {} },
    { icon: 'security', label: 'Chính sách bảo mật', subtitle: 'Quyền riêng tư', color: '#F97316', onPress: () => {} },
    { icon: 'info-outline', label: 'Về ứng dụng', subtitle: 'Phiên bản 1.0.0', color: '#64748B', onPress: () => {} },
  ];

  const renderMenuItem = (item: typeof accountItems[0], idx: number) => (
    <TouchableOpacity
      key={idx}
      onPress={item.onPress}
      className="flex-row items-center py-3.5"
      activeOpacity={0.6}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: item.color + '15' }}
      >
        <MaterialIcons name={item.icon as any} size={20} color={item.color} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-text-primary">{item.label}</Text>
        <Text className="text-xs text-gray-400 mt-0.5">{item.subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center pt-5 pb-4 px-4">
          <View
            className="rounded-full bg-primary items-center justify-center mb-3"
            style={{ width: 88, height: 88 }}
          >
            <Text className="text-white text-4xl font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text className="text-xl font-bold text-text-primary">{user?.fullName || 'User'}</Text>
          <Text className="text-sm text-gray-400 mt-0.5">{user?.email || ''}</Text>
          <View className={`mt-2 px-3 py-1 rounded-full ${isSeller ? 'bg-amber-50' : 'bg-cyan-50'}`}>
            <View className="flex-row items-center">
              <MaterialIcons
                name={isSeller ? 'store' : 'shopping-bag'}
                size={14}
                color={isSeller ? '#F59E0B' : '#06B6D4'}
              />
              <Text className={`text-xs font-semibold ml-1 ${isSeller ? 'text-amber-600' : 'text-primary'}`}>
                {isSeller ? 'Người bán' : 'Người mua'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row mx-4 mb-5 bg-gray-50 rounded-2xl p-4">
          <TouchableOpacity onPress={() => navigation.navigate('Cart')} className="flex-1 items-center">
            <View className="relative">
              <MaterialIcons name="shopping-cart" size={22} color={Colors.primary} />
              {cartCount > 0 ? (
                <View className="absolute -top-1 -right-2 bg-red-500 rounded-full items-center justify-center" style={{ width: 16, height: 16 }}>
                  <Text className="text-white text-[9px] font-bold">{cartCount > 99 ? '99+' : cartCount}</Text>
                </View>
              ) : null}
            </View>
            <Text className="text-xs text-gray-500 mt-1.5">Giỏ hàng</Text>
          </TouchableOpacity>
          <View className="w-px bg-gray-200" />
          <View className="flex-1 items-center">
            <View className="relative">
              <MaterialIcons name="favorite" size={22} color="#EF4444" />
              {favCount > 0 ? (
                <View className="absolute -top-1 -right-2 bg-red-500 rounded-full items-center justify-center" style={{ width: 16, height: 16 }}>
                  <Text className="text-white text-[9px] font-bold">{favCount > 99 ? '99+' : favCount}</Text>
                </View>
              ) : null}
            </View>
            <Text className="text-xs text-gray-500 mt-1.5">Yêu thích</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="flex-1 items-center">
            <MaterialIcons name="star" size={22} color="#F59E0B" />
            <Text className="text-xs text-gray-500 mt-1.5">Đánh giá</Text>
          </View>
        </View>

        {/* Account Section */}
        <View className="mx-4 mb-4">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Tài khoản</Text>
          <View className="bg-card rounded-2xl px-4 border border-border">
            {accountItems.map((item, idx) => (
              <View key={idx}>
                {renderMenuItem(item, idx)}
                {idx < accountItems.length - 1 ? <View className="border-b border-gray-100" style={{ marginLeft: 52 }} /> : null}
              </View>
            ))}
          </View>
        </View>

        {/* General */}
        <View className="mx-4 mb-4">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Cài đặt chung</Text>
          <View className="bg-card rounded-2xl px-4 border border-border">
            {generalItems.map((item, idx) => (
              <View key={idx}>
                {renderMenuItem(item, idx)}
                {idx < generalItems.length - 1 ? <View className="border-b border-gray-100" style={{ marginLeft: 52 }} /> : null}
              </View>
            ))}
          </View>
        </View>

        {/* Support */}
        <View className="mx-4 mb-4">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Hỗ trợ</Text>
          <View className="bg-card rounded-2xl px-4 border border-border">
            {supportItems.map((item, idx) => (
              <View key={idx}>
                {renderMenuItem(item, idx)}
                {idx < supportItems.length - 1 ? <View className="border-b border-gray-100" style={{ marginLeft: 52 }} /> : null}
              </View>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View className="px-4 mb-8">
          <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center bg-red-50 rounded-2xl py-4">
            <MaterialIcons name="logout" size={20} color="#EF4444" />
            <Text className="text-red-500 font-bold text-sm ml-2">Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
