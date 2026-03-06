import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout';
import { Colors, mockTopProducts } from '@/constants';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

const weeklyData = [
  { label: 'W1', value: 4500 },
  { label: 'W2', value: 7500 },
  { label: 'W3', value: 9500 },
  { label: 'W4', value: 6000 },
];

const maxValue = 15000;

type TimePeriod = 'Day' | 'Month' | 'Year';

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('Month');

  const periods: TimePeriod[] = ['Day', 'Month', 'Year'];

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
              <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-text-primary">Revenue Statistics</Text>
          </View>
        </View>

        {/* Period Tabs */}
        <View className="flex-row mx-4 mb-5 bg-background rounded-lg p-1">
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              className={`flex-1 py-2.5 rounded-md items-center ${
                selectedPeriod === period ? 'bg-primary' : ''
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedPeriod === period ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Revenue Card */}
        <View className="mx-4 mb-5 bg-primary rounded-2xl p-5">
          <View className="flex-row items-center mb-2">
            <Text className="text-white/80 text-sm mr-2">Total Revenue</Text>
            <MaterialIcons name="account-balance-wallet" size={18} color="rgba(255,255,255,0.8)" />
          </View>
          <Text className="text-3xl font-bold text-white mb-1">$45,231.89</Text>
          <View className="flex-row items-center">
            <MaterialIcons name="trending-up" size={18} color="#4ade80" />
            <Text className="text-sm text-green-300 ml-1 font-medium">
              +12.5% vs last month
            </Text>
          </View>
        </View>

        {/* Revenue Chart */}
        <View className="mx-4 mb-5 bg-card rounded-xl p-4 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-text-primary">Revenue Breakdown</Text>
            <TouchableOpacity>
              <MaterialIcons name="more-horiz" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Y-axis labels and bars */}
          <View className="flex-row">
            <View className="justify-between mr-2 items-end" style={{ height: 160 }}>
              <Text className="text-xs text-text-muted">$15k</Text>
              <Text className="text-xs text-text-muted">$10k</Text>
              <Text className="text-xs text-text-muted">$5k</Text>
              <Text className="text-xs text-text-muted">$0</Text>
            </View>
            <View className="flex-1 flex-row justify-around items-end" style={{ height: 160 }}>
              {weeklyData.map((item) => (
                <View key={item.label} className="items-center flex-1">
                  <Text className="text-xs text-primary font-semibold mb-1">
                    ${(item.value / 1000).toFixed(1)}k
                  </Text>
                  <View
                    className="bg-primary rounded-t-md w-10"
                    style={{ height: (item.value / maxValue) * 130 }}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* X-axis labels */}
          <View className="flex-row ml-10 mt-2">
            {weeklyData.map((item) => (
              <View key={item.label} className="flex-1 items-center">
                <Text className="text-xs text-text-muted">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Products */}
        <View className="mx-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-text-primary">Top Products</Text>
            <TouchableOpacity>
              <Text className="text-sm text-primary font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          {mockTopProducts.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center bg-card rounded-xl p-3 mb-2.5 border border-border"
            >
              <View className="w-11 h-11 bg-primary-light rounded-xl items-center justify-center mr-3">
                <MaterialIcons
                  name={item.icon as keyof typeof MaterialIcons.glyphMap}
                  size={22}
                  color={Colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-text-primary">
                  {item.name}
                </Text>
                <Text className="text-sm text-text-secondary">{item.category}</Text>
              </View>
              <View className="items-end">
                <Text className="text-base font-bold text-text-primary">
                  ${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
                <Text className="text-xs text-text-secondary">{item.sales} Sales</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="h-4" />
      </ScrollView>
    </ScreenWrapper>
  );
};
