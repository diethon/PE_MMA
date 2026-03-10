import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  getAddresses,
  getDefaultAddress,
  addAddress,
  updateAddressRow,
  setDefaultAddress,
  deleteAddress,
  type AddressRow,
} from '@/services/addressDb';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { AppStackParamList } from '../navigation/types';
import { formatVND } from '@/utils/format';

export const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'Checkout'>>();
  const { items: checkoutItems } = route.params;
  const { user } = useAuth();
  const { checkoutSelected, refresh } = useCart();
  const userId = user?.id ?? 0;

  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<AddressRow | null>(null);
  const [showAddrPicker, setShowAddrPicker] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState<AddressRow | null>(null);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formDefault, setFormDefault] = useState(false);
  const [formSaving, setFormSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  const subtotal = useMemo(
    () => checkoutItems.reduce((s, i) => s + i.priceNum * i.quantity, 0),
    [checkoutItems],
  );
  const totalQuantity = useMemo(
    () => checkoutItems.reduce((s, i) => s + i.quantity, 0),
    [checkoutItems],
  );

  const loadAddresses = useCallback(async () => {
    if (!userId) return;
    const list = await getAddresses(userId);
    setAddresses(list);
    if (!selectedAddr) {
      const def = await getDefaultAddress(userId);
      setSelectedAddr(def);
    }
  }, [userId, selectedAddr]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const openAddForm = () => {
    setEditingAddr(null);
    setFormName(user?.fullName ?? '');
    setFormPhone('');
    setFormAddress('');
    setFormDefault(addresses.length === 0);
    setShowAddrForm(true);
  };

  const openEditForm = (addr: AddressRow) => {
    setEditingAddr(addr);
    setFormName(addr.recipientName);
    setFormPhone(addr.phone);
    setFormAddress(addr.address);
    setFormDefault(addr.isDefault === 1);
    setShowAddrForm(true);
  };

  const handleSaveAddr = async () => {
    if (!formName.trim()) { Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên người nhận.'); return; }
    if (!formPhone.trim()) { Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại.'); return; }
    if (!formAddress.trim()) { Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ.'); return; }
    setFormSaving(true);
    try {
      if (editingAddr) {
        const updated = await updateAddressRow(editingAddr.id, formName, formPhone, formAddress);
        if (formDefault && editingAddr.isDefault !== 1) {
          await setDefaultAddress(userId, editingAddr.id);
        }
        if (selectedAddr?.id === editingAddr.id) setSelectedAddr(updated);
      } else {
        const newAddr = await addAddress(userId, formName, formPhone, formAddress, formDefault || addresses.length === 0);
        setSelectedAddr(newAddr);
      }
      const list = await getAddresses(userId);
      setAddresses(list);
      if (!selectedAddr && list.length > 0) {
        const def = await getDefaultAddress(userId);
        setSelectedAddr(def);
      }
      setShowAddrForm(false);
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteAddr = (addr: AddressRow) => {
    Alert.alert('Xóa địa chỉ', `Xóa "${addr.address}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          await deleteAddress(addr.id);
          const list = await getAddresses(userId);
          setAddresses(list);
          if (selectedAddr?.id === addr.id) {
            const def = await getDefaultAddress(userId);
            setSelectedAddr(def);
          }
        },
      },
    ]);
  };

  const selectAddr = async (addr: AddressRow) => {
    setSelectedAddr(addr);
    await setDefaultAddress(userId, addr.id);
    setShowAddrPicker(false);
  };

  const handlePlaceOrder = async () => {
    if (!user) { Alert.alert('Lỗi', 'Vui lòng đăng nhập.'); return; }
    if (!selectedAddr) { Alert.alert('Thiếu địa chỉ', 'Vui lòng thêm địa chỉ nhận hàng.'); return; }

    setProcessing(true);
    try {
      const productIds = checkoutItems.map((i) => i.productId);
      const orderId = await checkoutSelected(productIds);
      await refresh();
      Alert.alert(
        'Đặt hàng thành công!',
        `Mã đơn: ${orderId}\nTổng: ${formatVND(subtotal)}\n\nCảm ơn bạn đã mua hàng!`,
        [{ text: 'OK', onPress: () => navigation.popToTop() }],
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={st.root}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn} activeOpacity={0.6}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Thanh toán</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardDismissMode="interactive">

          {/* ── Address ── */}
          {selectedAddr ? (
            <TouchableOpacity onPress={() => setShowAddrPicker(true)} activeOpacity={0.6} style={st.section}>
              <View style={st.addrRow}>
                <MaterialIcons name="location-on" size={22} color={Colors.primary} style={{ marginTop: 1 }} />
                <View style={st.addrText}>
                  <View style={st.addrNameRow}>
                    <Text style={st.addrName}>{selectedAddr.recipientName}</Text>
                    <Text style={st.addrDivider}>|</Text>
                    <Text style={st.addrPhone}>{selectedAddr.phone}</Text>
                  </View>
                  <Text style={st.addrDetail} numberOfLines={2}>{selectedAddr.address}</Text>
                  {selectedAddr.isDefault === 1 && (
                    <View style={st.defaultBadge}>
                      <Text style={st.defaultBadgeText}>Mặc định</Text>
                    </View>
                  )}
                </View>
                <MaterialIcons name="chevron-right" size={22} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={openAddForm} activeOpacity={0.6} style={st.section}>
              <View style={st.addrRow}>
                <MaterialIcons name="add-location-alt" size={22} color={Colors.primary} />
                <Text style={st.addAddrText}>Thêm địa chỉ nhận hàng</Text>
                <MaterialIcons name="chevron-right" size={22} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>
          )}

          {/* ── Products ── */}
          <View style={st.section}>
            <View style={st.shopRow}>
              <MaterialIcons name="storefront" size={18} color={Colors.primary} />
              <Text style={st.shopName}>Aura Store</Text>
            </View>

            {checkoutItems.map((item, idx) => (
              <View
                key={item.productId}
                style={[st.productRow, idx < checkoutItems.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.borderLight }]}
              >
                <Image source={{ uri: item.image }} style={st.productImg} resizeMode="contain" />
                <View style={st.productInfo}>
                  <Text style={st.productName} numberOfLines={2}>{item.name}</Text>
                  <View style={st.productBottom}>
                    <Text style={st.productPrice}>{formatVND(item.priceNum)}</Text>
                    <Text style={st.productQty}>x{item.quantity}</Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Editable message */}
            <View style={st.messageRow}>
              <Text style={st.messageLabel}>Lời nhắn:</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                style={st.messageInput}
                placeholder="Để lại lời nhắn cho shop..."
                placeholderTextColor={Colors.textMuted}
                maxLength={200}
              />
            </View>
          </View>

          {/* ── Shipping ── */}
          <View style={st.section}>
            <Text style={st.sectionTitle}>Phương thức vận chuyển</Text>
            <View style={st.shippingCard}>
              <View style={st.shippingBadge}><Text style={st.shippingBadgeText}>Nhanh</Text></View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={st.row}>
                  <Text style={st.shippingStrike}>32.700₫</Text>
                  <Text style={st.shippingFree}>Miễn Phí</Text>
                </View>
                <Text style={st.shippingEta}>Nhận hàng trong 2-5 ngày</Text>
              </View>
            </View>
          </View>

          {/* ── Payment Details ── */}
          <View style={st.section}>
            <Text style={st.sectionTitle}>Chi tiết thanh toán</Text>
            <View style={st.detailRow}>
              <Text style={st.detailLabel}>Tổng tiền hàng ({totalQuantity} sp)</Text>
              <Text style={st.detailValue}>{formatVND(subtotal)}</Text>
            </View>
            <View style={st.detailRow}>
              <Text style={st.detailLabel}>Phí vận chuyển</Text>
              <View style={st.row}>
                <Text style={[st.detailValue, { textDecorationLine: 'line-through', color: Colors.textMuted, marginRight: 6 }]}>32.700₫</Text>
                <Text style={[st.detailValue, { color: Colors.success }]}>Miễn phí</Text>
              </View>
            </View>
            <View style={st.totalRow}>
              <Text style={st.totalLabel}>Tổng thanh toán</Text>
              <Text style={st.totalValue}>{formatVND(subtotal)}</Text>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom Bar ── */}
      <View style={st.bottomBar}>
        <View style={st.bottomLeft}>
          <Text style={st.bottomTotalLabel}>Tổng cộng</Text>
          <Text style={st.bottomTotalPrice}>{formatVND(subtotal)}</Text>
        </View>
        <TouchableOpacity onPress={handlePlaceOrder} disabled={processing} style={[st.orderBtn, { opacity: processing ? 0.7 : 1 }]} activeOpacity={0.8}>
          {processing ? <ActivityIndicator color="#fff" size="small" /> : <Text style={st.orderBtnText}>Đặt hàng</Text>}
        </TouchableOpacity>
      </View>

      {/* ═══ Address Picker Modal ═══ */}
      <Modal visible={showAddrPicker} transparent animationType="slide" onRequestClose={() => setShowAddrPicker(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setShowAddrPicker(false)} style={st.modalOverlay}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={st.pickerSheet}>
            <View style={st.sheetHandle} />
            <Text style={st.sheetTitle}>Chọn địa chỉ nhận hàng</Text>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {addresses.map((addr) => {
                const isSelected = selectedAddr?.id === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    onPress={() => selectAddr(addr)}
                    activeOpacity={0.6}
                    style={[st.addrCard, isSelected && { borderColor: Colors.primary, borderWidth: 1.5 }]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={st.addrNameRow}>
                        <Text style={st.addrName}>{addr.recipientName}</Text>
                        <Text style={st.addrDivider}>|</Text>
                        <Text style={st.addrPhone}>{addr.phone}</Text>
                      </View>
                      <Text style={st.addrDetail} numberOfLines={2}>{addr.address}</Text>
                      <View style={st.row}>
                        {addr.isDefault === 1 && (
                          <View style={st.defaultBadge}><Text style={st.defaultBadgeText}>Mặc định</Text></View>
                        )}
                      </View>
                    </View>
                    <View style={st.addrActions}>
                      <TouchableOpacity onPress={() => { setShowAddrPicker(false); openEditForm(addr); }} style={st.iconBtn}>
                        <MaterialIcons name="edit" size={18} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteAddr(addr)} style={st.iconBtn}>
                        <MaterialIcons name="delete-outline" size={18} color={Colors.danger} />
                      </TouchableOpacity>
                      {isSelected && <MaterialIcons name="check-circle" size={22} color={Colors.primary} style={{ marginLeft: 4 }} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity onPress={() => { setShowAddrPicker(false); openAddForm(); }} style={st.addNewBtn}>
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={st.addNewBtnText}>Thêm địa chỉ mới</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ═══ Address Form Modal ═══ */}
      <Modal visible={showAddrForm} transparent animationType="slide" onRequestClose={() => setShowAddrForm(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setShowAddrForm(false)} style={st.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ justifyContent: 'flex-end' }}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={st.formSheet}>
              <View style={st.sheetHandle} />
              <Text style={st.sheetTitle}>{editingAddr ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</Text>

              <ScrollView showsVerticalScrollIndicator={false} keyboardDismissMode="interactive">
                <View style={st.inputGroup}>
                  <Text style={st.inputLabel}>Họ tên người nhận</Text>
                  <View style={st.inputRow}>
                    <MaterialIcons name="person-outline" size={18} color={Colors.textMuted} />
                    <TextInput value={formName} onChangeText={setFormName} style={st.input} placeholder="Nhập họ tên" placeholderTextColor={Colors.textMuted} />
                  </View>
                </View>

                <View style={st.inputGroup}>
                  <Text style={st.inputLabel}>Số điện thoại</Text>
                  <View style={st.inputRow}>
                    <MaterialIcons name="phone" size={18} color={Colors.textMuted} />
                    <TextInput value={formPhone} onChangeText={setFormPhone} style={st.input} placeholder="Nhập số điện thoại" placeholderTextColor={Colors.textMuted} keyboardType="phone-pad" />
                  </View>
                </View>

                <View style={st.inputGroup}>
                  <Text style={st.inputLabel}>Địa chỉ</Text>
                  <View style={[st.inputRow, { alignItems: 'flex-start' }]}>
                    <MaterialIcons name="home" size={18} color={Colors.textMuted} style={{ marginTop: 2 }} />
                    <TextInput value={formAddress} onChangeText={setFormAddress} style={[st.input, { minHeight: 48 }]} placeholder="Số nhà, đường, phường/xã, quận/huyện..." placeholderTextColor={Colors.textMuted} multiline />
                  </View>
                </View>

                <TouchableOpacity onPress={() => setFormDefault(!formDefault)} activeOpacity={0.6} style={st.checkRow}>
                  <MaterialIcons name={formDefault ? 'check-box' : 'check-box-outline-blank'} size={22} color={formDefault ? Colors.primary : Colors.textMuted} />
                  <Text style={st.checkLabel}>Đặt làm địa chỉ mặc định</Text>
                </TouchableOpacity>
              </ScrollView>

              <View style={st.formBtnRow}>
                <TouchableOpacity onPress={() => setShowAddrForm(false)} style={st.cancelBtn}>
                  <Text style={st.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveAddr} disabled={formSaving} style={[st.saveBtn, { opacity: formSaving ? 0.7 : 1 }]}>
                  {formSaving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={st.saveBtnText}>Lưu địa chỉ</Text>}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 13 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },

  section: { backgroundColor: '#fff', padding: 14, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },

  addrRow: { flexDirection: 'row', alignItems: 'flex-start' },
  addrText: { flex: 1, marginLeft: 10, marginRight: 4 },
  addrNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  addrName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  addrDivider: { fontSize: 13, color: Colors.textMuted, marginHorizontal: 8 },
  addrPhone: { fontSize: 13, color: Colors.textSecondary },
  addrDetail: { fontSize: 13, color: Colors.textSecondary, marginTop: 3, lineHeight: 19 },
  addAddrText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.primary, marginLeft: 10 },

  defaultBadge: { backgroundColor: Colors.primaryLight, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 6 },
  defaultBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.primaryDark },

  shopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.borderLight },
  shopName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginLeft: 8 },

  productRow: { flexDirection: 'row', paddingVertical: 10 },
  productImg: { width: 76, height: 76, borderRadius: 8, backgroundColor: Colors.background },
  productInfo: { flex: 1, marginLeft: 10, justifyContent: 'space-between' },
  productName: { fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },
  productBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  productPrice: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  productQty: { fontSize: 13, color: Colors.textMuted },

  messageRow: { paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.borderLight, marginTop: 4 },
  messageLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  messageInput: { fontSize: 13, color: Colors.textPrimary, backgroundColor: Colors.background, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 8, minHeight: 40 },

  shippingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryLight, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#B2F5EA' },
  shippingBadge: { backgroundColor: Colors.primary, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  shippingBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  shippingStrike: { fontSize: 12, color: Colors.textMuted, textDecorationLine: 'line-through', marginRight: 6 },
  shippingFree: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  shippingEta: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  detailLabel: { fontSize: 13, color: Colors.textSecondary },
  detailValue: { fontSize: 13, color: Colors.textPrimary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, paddingTop: 10, marginTop: 4 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  totalValue: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  bottomBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  bottomLeft: { flex: 1, alignItems: 'flex-end', marginRight: 12 },
  bottomTotalLabel: { fontSize: 12, color: Colors.textSecondary },
  bottomTotalPrice: { fontSize: 17, fontWeight: '700', color: Colors.primary },
  orderBtn: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 13, borderRadius: 10 },
  orderBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  /* Modal shared */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },

  /* Address Picker */
  pickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 30 },
  addrCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 10 },
  addrActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  iconBtn: { padding: 6 },
  addNewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 13, marginTop: 6 },
  addNewBtnText: { fontSize: 14, fontWeight: '700', color: '#fff', marginLeft: 6 },

  /* Address Form */
  formSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 30, maxHeight: '85%' },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 6, marginLeft: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12 },
  input: { flex: 1, paddingVertical: 10, marginLeft: 8, fontSize: 14, color: Colors.textPrimary },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  checkLabel: { fontSize: 13, color: Colors.textPrimary, marginLeft: 8 },
  formBtnRow: { flexDirection: 'row', marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center', backgroundColor: Colors.borderLight, marginRight: 10 },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center', backgroundColor: Colors.primary },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
