import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAddresses,
  addAddress,
  updateAddressRow,
  setDefaultAddress,
  deleteAddress,
  type AddressRow,
} from '@/services/addressDb';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';

export const AddressListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user } = useAuth();
  const userId = user?.id ?? 0;

  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState<AddressRow | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formDefault, setFormDefault] = useState(false);
  const [formSaving, setFormSaving] = useState(false);

  const loadAddresses = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const list = await getAddresses(userId);
    setAddresses(list);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const openAddAddrForm = () => {
    setEditingAddr(null);
    setFormName(user?.fullName ?? '');
    setFormPhone('');
    setFormAddress('');
    setFormDefault(addresses.length === 0);
    setShowAddrForm(true);
  };

  const openEditAddrForm = (addr: AddressRow) => {
    setEditingAddr(addr);
    setFormName(addr.recipientName);
    setFormPhone(addr.phone);
    setFormAddress(addr.address);
    setFormDefault(addr.isDefault === 1);
    setShowAddrForm(true);
  };

  const handleSaveAddr = async () => {
    if (!formName.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập tên người nhận'); return; }
    if (!formPhone.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại'); return; }
    if (!formAddress.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ'); return; }
    setFormSaving(true);
    try {
      if (editingAddr) {
        await updateAddressRow(editingAddr.id, formName, formPhone, formAddress);
        if (formDefault && editingAddr.isDefault !== 1) {
          await setDefaultAddress(userId, editingAddr.id);
        }
      } else {
        await addAddress(userId, formName, formPhone, formAddress, formDefault || addresses.length === 0);
      }
      await loadAddresses();
      setShowAddrForm(false);
      Alert.alert('Thành công', editingAddr ? 'Đã cập nhật địa chỉ!' : 'Đã thêm địa chỉ mới!');
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteAddr = (addr: AddressRow) => {
    Alert.alert('Xóa địa chỉ', `Xóa địa chỉ "${addr.address}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await deleteAddress(addr.id);
          await loadAddresses();
        },
      },
    ]);
  };

  const handleSetDefault = async (addr: AddressRow) => {
    await setDefaultAddress(userId, addr.id);
    await loadAddresses();
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
      <View className="flex-row items-center px-4 py-2 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center mr-3">
          <MaterialIcons name="arrow-back-ios" size={18} color={Colors.primary} />
          <Text className="text-sm text-primary font-medium">Quay lại</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-text-primary flex-1">Địa chỉ giao hàng</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 pt-3" showsVerticalScrollIndicator={false}>
          {addresses.length === 0 ? (
            <View className="items-center justify-center py-16">
              <MaterialIcons name="location-off" size={64} color={Colors.textMuted} />
              <Text className="text-base font-bold text-gray-700 mt-4">Chưa có địa chỉ</Text>
              <Text className="text-sm text-gray-400 mt-1 text-center">
                Hãy thêm địa chỉ giao hàng để thanh toán nhanh hơn.
              </Text>
            </View>
          ) : (
            <View className="mb-4">
              {addresses.map((addr) => (
                <View
                  key={addr.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 mb-2.5"
                >
                  <View className="flex-row items-start">
                    <View className="flex-1">
                      <View className="flex-row items-center flex-wrap">
                        <Text className="text-sm font-bold text-text-primary">
                          {addr.recipientName}
                        </Text>
                        <Text className="text-xs text-gray-400 mx-2">|</Text>
                        <Text className="text-xs text-text-secondary">{addr.phone}</Text>
                      </View>
                      <Text
                        className="text-xs text-text-secondary mt-1.5 leading-4"
                        numberOfLines={2}
                      >
                        {addr.address}
                      </Text>
                      {addr.isDefault === 1 && (
                        <View className="self-start mt-2 px-2 py-0.5 rounded bg-cyan-50">
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: Colors.primaryDark }}
                          >
                            Mặc định
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-row items-center ml-2">
                      <TouchableOpacity
                        onPress={() => openEditAddrForm(addr)}
                        className="p-1.5"
                      >
                        <MaterialIcons name="edit" size={18} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteAddr(addr)}
                        className="p-1.5"
                      >
                        <MaterialIcons
                          name="delete-outline"
                          size={18}
                          color={Colors.danger}
                        />
                      </TouchableOpacity>
                      {addr.isDefault !== 1 && (
                        <TouchableOpacity
                          onPress={() => handleSetDefault(addr)}
                          className="p-1.5"
                        >
                          <MaterialIcons
                            name="check-circle-outline"
                            size={18}
                            color={Colors.textMuted}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={openAddAddrForm}
            className="flex-row items-center justify-center bg-primary py-3.5 rounded-xl mb-6"
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text className="text-white font-bold text-sm ml-1.5">Thêm địa chỉ mới</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Address Form Modal */}
      <Modal
        visible={showAddrForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddrForm(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowAddrForm(false)}
          className="flex-1 bg-black/40 justify-end"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ justifyContent: 'flex-end' }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              className="bg-white rounded-t-2xl p-5"
              style={{ maxHeight: '85%' }}
            >
              <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-3" />
              <Text className="text-base font-bold text-text-primary mb-4">
                {editingAddr ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} keyboardDismissMode="interactive">
                <View className="mb-3.5">
                  <Text className="text-xs text-gray-500 mb-1.5 ml-0.5">
                    Họ tên người nhận
                  </Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-3">
                    <MaterialIcons name="person-outline" size={18} color="#9CA3AF" />
                    <TextInput
                      value={formName}
                      onChangeText={setFormName}
                      className="flex-1 py-3 ml-2.5 text-sm text-text-primary"
                      placeholder="Nhập họ tên"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
                <View className="mb-3.5">
                  <Text className="text-xs text-gray-500 mb-1.5 ml-0.5">Số điện thoại</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-3">
                    <MaterialIcons name="phone" size={18} color="#9CA3AF" />
                    <TextInput
                      value={formPhone}
                      onChangeText={setFormPhone}
                      className="flex-1 py-3 ml-2.5 text-sm text-text-primary"
                      placeholder="Nhập SĐT"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                <View className="mb-3.5">
                  <Text className="text-xs text-gray-500 mb-1.5 ml-0.5">Địa chỉ</Text>
                  <View className="flex-row items-start bg-gray-50 rounded-xl border border-gray-200 px-3">
                    <MaterialIcons
                      name="home"
                      size={18}
                      color="#9CA3AF"
                      style={{ marginTop: 12 }}
                    />
                    <TextInput
                      value={formAddress}
                      onChangeText={setFormAddress}
                      className="flex-1 py-3 ml-2.5 text-sm text-text-primary"
                      placeholder="Số nhà, đường, phường/xã..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                    />
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setFormDefault(!formDefault)}
                  activeOpacity={0.6}
                  className="flex-row items-center mb-4"
                >
                  <MaterialIcons
                    name={formDefault ? 'check-box' : 'check-box-outline-blank'}
                    size={22}
                    color={formDefault ? Colors.primary : '#CBD5E1'}
                  />
                  <Text className="text-sm text-text-primary ml-2">
                    Đặt làm địa chỉ mặc định
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              <View className="flex-row mt-1">
                <TouchableOpacity
                  onPress={() => setShowAddrForm(false)}
                  className="flex-1 bg-gray-100 py-3.5 rounded-xl items-center mr-2.5"
                >
                  <Text className="text-sm font-semibold text-gray-600">Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveAddr}
                  disabled={formSaving}
                  className="flex-1 bg-primary py-3.5 rounded-xl flex-row items-center justify-center"
                  style={{ opacity: formSaving ? 0.7 : 1 }}
                >
                  {formSaving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-sm">Lưu địa chỉ</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

