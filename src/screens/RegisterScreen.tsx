import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  weak: { label: 'Weak', color: '#EF4444', bars: 1 },
  medium: { label: 'Medium', color: '#F59E0B', bars: 2 },
  strong: { label: 'Strong', color: '#22C55E', bars: 3 },
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const cfg = strengthConfig[strength];

  const handleRegister = () => {
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={['#0891B2', '#06B6D4', '#67E8F9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Top Nav */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Text className="text-white/80 text-sm">Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="ml-2 bg-white/20 rounded-md px-3 py-1.5"
            >
              <Text className="text-white text-sm font-semibold">Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Brand */}
        <Text className="text-white text-3xl font-bold text-center my-5 italic">
          Aura Technology
        </Text>

        {/* White Form Card with rounded top */}
        <View
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View className="px-6 pt-8">
                <Text className="text-2xl font-bold text-gray-900 text-center">
                  Get started free.
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-1.5 mb-8">
                  Free forever. No credit card needed.
                </Text>

                {/* Email Input */}
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1.5 ml-1">Email Address</Text>
                  <View className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3.5">
                    <TextInput
                      className="text-base text-gray-900"
                      placeholder="nicholas@ergemla.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Full Name Input */}
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1.5 ml-1">Your name</Text>
                  <View className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3.5">
                    <TextInput
                      className="text-base text-gray-900"
                      placeholder="Nicholas Ergemla"
                      placeholderTextColor="#9CA3AF"
                      value={fullName}
                      onChangeText={setFullName}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <Text className="text-xs text-gray-500 mb-1.5 ml-1">Password</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4 py-3.5">
                    <TextInput
                      className="flex-1 text-base text-gray-900"
                      placeholder="Create a password"
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
                        <Text
                          className="text-xs font-medium ml-1.5"
                          style={{ color: cfg.color }}
                        >
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

                {/* Sign Up Button */}
                <TouchableOpacity onPress={handleRegister} activeOpacity={0.85}>
                  <LinearGradient
                    colors={['#0891B2', '#06B6D4', '#22D3EE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
                  >
                    <Text className="text-white text-base font-bold">Sign up</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-7">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="text-xs text-gray-400 mx-4">Or sign up with</Text>
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
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};
