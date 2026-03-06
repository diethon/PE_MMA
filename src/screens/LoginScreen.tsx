import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenWrapper, Header } from '@/components/layout';
import { Input, Button } from '@/components/ui';
import { Colors } from '@/constants';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <ScreenWrapper>
      <Header
        title="Login"
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="shopping-cart"
        onRightPress={() => navigation.navigate('Cart')}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-8 mb-6">
            <View className="w-16 h-16 bg-primary-light rounded-2xl items-center justify-center mb-5">
              <MaterialIcons name="shopping-cart" size={32} color={Colors.primary} />
            </View>
            <Text className="text-3xl font-bold text-text-primary mb-2">Welcome Back!</Text>
            <Text className="text-base text-text-secondary leading-6">
              Please enter your details to sign in to your account.
            </Text>
          </View>

          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            icon="mail"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            icon="lock"
            secureTextEntry
          />

          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor="#ffffff"
              />
              <Text className="text-sm text-text-secondary ml-2">Remember me</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-sm text-primary font-medium">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Sign In"
            onPress={handleLogin}
            icon="login"
            iconPosition="right"
          />

          <View className="flex-row items-center justify-center mt-6 mb-8">
            <Text className="text-sm text-text-secondary">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-sm text-primary font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};
