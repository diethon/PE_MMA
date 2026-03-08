import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      Alert.alert('Đăng nhập thành công', `Xin chào ${user.fullName}!\nVai trò: ${user.role === 'seller' ? 'Người bán' : 'Người mua'}`, [
        { text: 'OK', onPress: () => navigation.replace('Main') },
      ]);
    } catch (e: any) {
      Alert.alert('Đăng nhập thất bại', e.message || 'Email hoặc mật khẩu không đúng');
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
        >
          {/* Top Nav */}
          <View className="flex-row items-center justify-end px-5 py-3">
            <View className="flex-row items-center">
              <Text className="text-white/80 text-sm">Chưa có tài khoản?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                className="ml-2 bg-white/20 rounded-md px-3 py-1.5"
              >
                <Text className="text-white text-sm font-semibold">Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Brand */}
          <Text className="text-white text-3xl font-bold text-center my-5 italic">
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
                  Đăng nhập
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-1.5 mb-6">
                  Nhập thông tin tài khoản của bạn
                </Text>

                {/* Demo accounts info */}
                <View className="bg-cyan-50 rounded-xl p-3.5 mb-6">
                  <Text className="text-xs font-bold text-primary mb-2">Tài khoản demo:</Text>
                  <View className="flex-row items-center mb-1">
                    <MaterialIcons name="store" size={14} color="#0891B2" />
                    <Text className="text-xs text-gray-600 ml-1.5">
                      Người bán: seller@aura.com / 123456
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons name="person" size={14} color="#0891B2" />
                    <Text className="text-xs text-gray-600 ml-1.5">
                      Người mua: buyer@aura.com / 123456
                    </Text>
                  </View>
                </View>

                {/* Email Input */}
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

                {/* Password Input */}
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1.5 ml-1">Mật khẩu</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4 py-3.5">
                    <MaterialIcons name="lock" size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-base text-gray-900 ml-2"
                      placeholder="Nhập mật khẩu"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={secureText}
                    />
                    <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                      <MaterialIcons
                        name={secureText ? 'visibility-off' : 'visibility'}
                        size={22}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remember Me */}
                <View className="flex-row items-center justify-between mb-6">
                  <TouchableOpacity
                    onPress={() => setRememberMe(!rememberMe)}
                    activeOpacity={0.7}
                    className="flex-row items-center"
                  >
                    <View
                      className={`w-5 h-5 rounded border items-center justify-center ${
                        rememberMe ? 'bg-[#06B6D4] border-[#06B6D4]' : 'border-gray-300 bg-transparent'
                      }`}
                    >
                      {rememberMe ? (
                        <MaterialIcons name="check" size={14} color="#fff" />
                      ) : null}
                    </View>
                    <Text className="text-sm text-gray-600 ml-2">Ghi nhớ đăng nhập</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text className="text-sm text-[#06B6D4] font-medium">Quên mật khẩu?</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <TouchableOpacity onPress={handleLogin} activeOpacity={0.85} disabled={loading}>
                  <LinearGradient
                    colors={['#0891B2', '#06B6D4', '#22D3EE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 12, paddingVertical: 16, alignItems: 'center', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white text-base font-bold">Đăng nhập</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-7">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="text-xs text-gray-400 mx-4">Hoặc đăng nhập với</Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>

                {/* Social Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity className="flex-1 flex-row items-center justify-center border border-gray-200 rounded-xl py-3.5">
                    <Image
                      source={{ uri: 'https://www.google.com/favicon.ico' }}
                      className="w-5 h-5 mr-2"
                    />
                    <Text className="text-sm font-semibold text-gray-700">Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 flex-row items-center justify-center border border-gray-200 rounded-xl py-3.5">
                    <MaterialIcons name="facebook" size={20} color="#1877F2" />
                    <Text className="text-sm font-semibold text-blue-600 ml-2">Facebook</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};
