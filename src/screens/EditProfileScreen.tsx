import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user, isSeller, updateProfile, changePassword } = useAuth();
  const userId = user?.id ?? 0;
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) { Alert.alert('Lỗi', 'Họ tên không được để trống'); return; }
    if (!email.trim()) { Alert.alert('Lỗi', 'Email không được để trống'); return; }
    setLoading(true);
    try {
      await updateProfile(fullName, email);
      Alert.alert('Thành công', 'Thông tin đã được cập nhật!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword) { Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu cũ'); return; }
    if (newPassword.length < 4) { Alert.alert('Lỗi', 'Mật khẩu mới phải ít nhất 4 ký tự'); return; }
    if (newPassword !== confirmPassword) { Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp'); return; }
    setPasswordLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Thay đổi mật khẩu thất bại');
    } finally {
      setPasswordLoading(false);
    }
  };


  return (
    <View className="flex-1 bg-surface">
      {/* Inline back row */}
      <View className="flex-row items-center px-4 py-2 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center mr-3">
          <MaterialIcons name="arrow-back-ios" size={18} color={Colors.primary} />
          <Text className="text-sm text-primary font-medium">Quay lại</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-text-primary flex-1">Chỉnh sửa hồ sơ</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View className="items-center pt-5 pb-4">
            <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-3">
              <Text className="text-white text-4xl font-bold">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${isSeller ? 'bg-amber-50' : 'bg-cyan-50'}`}>
              <View className="flex-row items-center">
                <MaterialIcons name={isSeller ? 'store' : 'shopping-bag'} size={14} color={isSeller ? '#F59E0B' : '#06B6D4'} />
                <Text className={`text-xs font-semibold ml-1 ${isSeller ? 'text-amber-600' : 'text-primary'}`}>
                  {isSeller ? 'Người bán' : 'Người mua'}
                </Text>
              </View>
            </View>
          </View>

          {/* Profile Info */}
          <View className="px-4 mb-6">
            <Text className="text-base font-bold text-text-primary mb-4">Thông tin cá nhân</Text>

            <View className="mb-4">
              <Text className="text-xs text-gray-500 mb-1.5 ml-1">Họ và tên</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
                <MaterialIcons name="person" size={18} color="#9CA3AF" />
                <TextInput value={fullName} onChangeText={setFullName} className="flex-1 py-3.5 ml-3 text-sm text-text-primary" placeholder="Nhập họ tên" placeholderTextColor="#9CA3AF" />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-xs text-gray-500 mb-1.5 ml-1">Email</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
                <MaterialIcons name="email" size={18} color="#9CA3AF" />
                <TextInput value={email} onChangeText={setEmail} className="flex-1 py-3.5 ml-3 text-sm text-text-primary" placeholder="Nhập email" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <TouchableOpacity onPress={handleSaveProfile} disabled={loading} className="bg-primary py-3.5 rounded-xl flex-row items-center justify-center mt-2" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                <>
                  <MaterialIcons name="save" size={18} color="#fff" />
                  <Text className="text-white font-bold text-sm ml-2">Lưu thay đổi</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Change Password */}
          <View className="px-4 mb-6">
            <TouchableOpacity onPress={() => setShowPasswordSection(!showPasswordSection)} className="flex-row items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-amber-50 items-center justify-center mr-3">
                  <MaterialIcons name="lock" size={20} color="#F59E0B" />
                </View>
                <Text className="text-sm font-medium text-text-primary">Đổi mật khẩu</Text>
              </View>
              <MaterialIcons name={showPasswordSection ? 'expand-less' : 'expand-more'} size={24} color={Colors.textMuted} />
            </TouchableOpacity>

            {showPasswordSection ? (
              <View className="mt-4 bg-white rounded-xl border border-gray-100 p-4">
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1.5 ml-1">Mật khẩu cũ</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
                    <MaterialIcons name="lock-outline" size={18} color="#9CA3AF" />
                    <TextInput value={oldPassword} onChangeText={setOldPassword} className="flex-1 py-3.5 ml-3 text-sm text-text-primary" placeholder="Nhập mật khẩu cũ" placeholderTextColor="#9CA3AF" secureTextEntry />
                  </View>
                </View>
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1.5 ml-1">Mật khẩu mới</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
                    <MaterialIcons name="lock" size={18} color="#9CA3AF" />
                    <TextInput value={newPassword} onChangeText={setNewPassword} className="flex-1 py-3.5 ml-3 text-sm text-text-primary" placeholder="Nhập mật khẩu mới" placeholderTextColor="#9CA3AF" secureTextEntry />
                  </View>
                </View>
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1.5 ml-1">Xác nhận mật khẩu</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
                    <MaterialIcons name="lock" size={18} color="#9CA3AF" />
                    <TextInput value={confirmPassword} onChangeText={setConfirmPassword} className="flex-1 py-3.5 ml-3 text-sm text-text-primary" placeholder="Nhập lại mật khẩu mới" placeholderTextColor="#9CA3AF" secureTextEntry />
                  </View>
                </View>
                <TouchableOpacity onPress={handleChangePassword} disabled={passwordLoading} className="bg-amber-500 py-3.5 rounded-xl flex-row items-center justify-center" style={{ opacity: passwordLoading ? 0.7 : 1 }}>
                  {passwordLoading ? <ActivityIndicator color="#fff" size="small" /> : (
                    <>
                      <MaterialIcons name="vpn-key" size={18} color="#fff" />
                      <Text className="text-white font-bold text-sm ml-2">Đổi mật khẩu</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          <View className="h-6" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
