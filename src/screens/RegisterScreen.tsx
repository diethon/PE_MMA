import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/services/authDb';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

type PasswordStrength = 'weak' | 'medium' | 'strong';

function getPasswordStrength(pwd: string): PasswordStrength {
  if (pwd.length === 0) return 'weak';
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score >= 3) return 'strong';
  if (score >= 2) return 'medium';
  return 'weak';
}

const strengthConfig = {
  weak: { label: 'Yếu', color: '#EF4444', bars: 1 },
  medium: { label: 'Trung bình', color: '#F59E0B', bars: 2 },
  strong: { label: 'Mạnh', color: '#22C55E', bars: 3 },
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [role, setRole] = useState<UserRole>('buyer');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const cfg = strengthConfig[strength];

  const handleRegister = async () => {
    if (!email.trim() || !fullName.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      const user = await register(email, fullName, password, role);
      Alert.alert(
        'Đăng ký thành công!',
        `Chào mừng ${user.fullName}!\nVai trò: ${role === 'seller' ? 'Người bán' : 'Người mua'}`,
        [{ text: 'OK', onPress: () => navigation.replace('Main') }],
      );
    } catch (e: any) {
      Alert.alert('Đăng ký thất bại', e.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0891B2', '#06B6D4', '#67E8F9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Top Nav */}
          <View className="flex-row items-center justify-between px-5 py-3">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={28} color="#fff" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Text className="text-white/80 text-sm">Đã có tài khoản?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                className="ml-2 bg-white/20 rounded-md px-3 py-1.5"
              >
                <Text className="text-white text-sm font-semibold">Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Brand */}
          <Text className="text-white text-3xl font-bold text-center my-4 italic">
            Aura Technology
          </Text>

          {/* White Form Card */}
          <View
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
            }}
          >
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View className="px-6 pt-8">
                <Text className="text-2xl font-bold text-gray-900 text-center">
                  Tạo tài khoản
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-1.5 mb-6">
                  Đăng ký miễn phí, không cần thẻ tín dụng
                </Text>

                {/* Role Selector */}
                <View className="mb-5">
                  <Text className="text-xs text-gray-500 mb-2 ml-1">Bạn là</Text>
                  <View className="flex-row bg-gray-100 rounded-xl p-1">
                    <TouchableOpacity
                      onPress={() => setRole('buyer')}
                      className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
                        role === 'buyer' ? 'bg-white' : ''
                      }`}
                      style={role === 'buyer' ? { elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } } : {}}
                    >
                      <MaterialIcons
                        name="person"
                        size={18}
                        color={role === 'buyer' ? '#06B6D4' : '#9CA3AF'}
                      />
                      <Text
                        className={`ml-1.5 text-sm font-semibold ${
                          role === 'buyer' ? 'text-primary' : 'text-gray-400'
                        }`}
                      >
                        Người mua
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setRole('seller')}
                      className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
                        role === 'seller' ? 'bg-white' : ''
                      }`}
                      style={role === 'seller' ? { elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } } : {}}
                    >
                      <MaterialIcons
                        name="store"
                        size={18}
                        color={role === 'seller' ? '#06B6D4' : '#9CA3AF'}
                      />
                      <Text
                        className={`ml-1.5 text-sm font-semibold ${
                          role === 'seller' ? 'text-primary' : 'text-gray-400'
                        }`}
                      >
                        Người bán
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Full Name */}
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1.5 ml-1">Họ và tên</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4 py-3.5">
                    <MaterialIcons name="person-outline" size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-base text-gray-900 ml-2"
                      placeholder="Nguyễn Văn A"
                      placeholderTextColor="#9CA3AF"
                      value={fullName}
                      onChangeText={setFullName}
                    />
                  </View>
                </View>

                {/* Email */}
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1.5 ml-1">Email</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4 py-3.5">
                    <MaterialIcons name="email" size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-base text-gray-900 ml-2"
                      placeholder="email@example.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Password */}
                <View className="mb-6">
                  <Text className="text-xs text-gray-500 mb-1.5 ml-1">Mật khẩu</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4 py-3.5">
                    <MaterialIcons name="lock" size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-base text-gray-900 ml-2"
                      placeholder="Tối thiểu 6 ký tự"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={secureText}
                    />
                    {password.length > 0 ? (
                      <View className="flex-row items-center ml-2">
                        {[1, 2, 3].map((i) => (
                          <View
                            key={i}
                            className="w-5 h-1.5 rounded-full mx-0.5"
                            style={{
                              backgroundColor: i <= cfg.bars ? cfg.color : '#E5E7EB',
                            }}
                          />
                        ))}
                        <Text className="text-xs font-medium ml-1.5" style={{ color: cfg.color }}>
                          {cfg.label}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                        <MaterialIcons
                          name={secureText ? 'visibility-off' : 'visibility'}
                          size={22}
                          color="#9CA3AF"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Register Button */}
                <TouchableOpacity onPress={handleRegister} activeOpacity={0.85} disabled={loading}>
                  <LinearGradient
                    colors={['#0891B2', '#06B6D4', '#22D3EE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 12, paddingVertical: 16, alignItems: 'center', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white text-base font-bold">Đăng ký</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};
