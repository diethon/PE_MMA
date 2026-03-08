import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SearchBar } from '@/components/ui';
import { ProductCard } from '@/components/products';
import { Colors } from '@/constants';
import {
  categories,
  accessorySubCategories,
  sortOptions,
  filterAndSort,
  getBrands,
} from '@/constants/productData';
import type { CategoryType, SortOption, UnifiedProduct } from '@/constants/productData';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';

export const ProductListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'ProductListMain'>>();
  const initialCategory = (route.params?.category as CategoryType) || 'all';

  const accessoryKeys = useMemo(() => new Set(accessorySubCategories.map((s) => s.key)), []);
  const isAccessoryType = useCallback((cat: CategoryType) => accessoryKeys.has(cat), [accessoryKeys]);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryType>(initialCategory);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<SortOption>('default');
  const [showSortModal, setShowSortModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [accessoryExpanded, setAccessoryExpanded] = useState(() => isAccessoryType(initialCategory));

  useEffect(() => {
    const cat = (route.params?.category as CategoryType) || 'all';
    setActiveCategory(cat);
    setActiveBrand(null);
    if (isAccessoryType(cat)) setAccessoryExpanded(true);
  }, [route.params?.category, isAccessoryType]);

  const brands = useMemo(() => getBrands(activeCategory), [activeCategory]);

  const filteredProducts = useMemo(
    () => filterAndSort(activeCategory, activeBrand, activeSort, search),
    [activeCategory, activeBrand, activeSort, search],
  );

  const handleCategoryChange = useCallback((cat: CategoryType) => {
    setActiveCategory(cat);
    setActiveBrand(null);
  }, []);

  const handleBrandChange = useCallback((brand: string | null) => {
    setActiveBrand((prev) => (prev === brand ? null : brand));
  }, []);

  const activeSortLabel = sortOptions.find((s) => s.key === activeSort)?.label ?? 'Mặc định';

  const renderProduct = useCallback(
    ({ item }: { item: UnifiedProduct }) => (
      <ProductCard
        product={item}
        variant={viewMode}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      />
    ),
    [viewMode, navigation],
  );

  return (
    <View className="flex-1 bg-surface">
      {/* Search */}
      <View className="px-4 pt-2 pb-1">
        <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm kiếm sản phẩm..." />
      </View>

      {/* Category Tabs */}
      <View className="px-3 py-2">
        <View className="flex-row flex-wrap">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => {
                  handleCategoryChange(cat.key);
                  setAccessoryExpanded(false);
                }}
                style={{ width: '33.33%', paddingHorizontal: 3, marginBottom: 6 }}
                activeOpacity={0.7}
              >
                <View
                  className={`flex-row items-center justify-center py-2.5 rounded-full ${
                    isActive ? 'bg-primary' : 'bg-gray-100'
                  }`}
                >
                  <MaterialIcons
                    name={cat.icon as keyof typeof MaterialIcons.glyphMap}
                    size={16}
                    color={isActive ? '#fff' : Colors.textSecondary}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-semibold ${
                      isActive ? 'text-white' : 'text-gray-600'
                    }`}
                    numberOfLines={1}
                  >
                    {cat.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Phụ kiện dropdown toggle */}
          <TouchableOpacity
            onPress={() => setAccessoryExpanded((prev) => !prev)}
            style={{ width: '33.33%', paddingHorizontal: 3, marginBottom: 6 }}
            activeOpacity={0.7}
          >
            <View
              className={`flex-row items-center justify-center py-2.5 rounded-full ${
                isAccessoryType(activeCategory) ? 'bg-primary' : 'bg-gray-100'
              }`}
            >
              <MaterialIcons
                name="widgets"
                size={16}
                color={isAccessoryType(activeCategory) ? '#fff' : Colors.textSecondary}
              />
              <Text
                className={`ml-1.5 text-xs font-semibold ${
                  isAccessoryType(activeCategory) ? 'text-white' : 'text-gray-600'
                }`}
                numberOfLines={1}
              >
                Phụ kiện
              </Text>
              <MaterialIcons
                name={accessoryExpanded ? 'expand-less' : 'expand-more'}
                size={16}
                color={isAccessoryType(activeCategory) ? '#fff' : Colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Accessory sub-categories dropdown */}
        {accessoryExpanded && (
          <View className="flex-row mt-1 mb-1">
            {accessorySubCategories.map((sub) => {
              const isActive = activeCategory === sub.key;
              return (
                <TouchableOpacity
                  key={sub.key}
                  onPress={() => handleCategoryChange(sub.key)}
                  style={{ flex: 1, paddingHorizontal: 3 }}
                  activeOpacity={0.7}
                >
                  <View
                    className={`flex-row items-center justify-center py-2 rounded-lg ${
                      isActive ? 'bg-cyan-50 border border-primary' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <MaterialIcons
                      name={sub.icon as keyof typeof MaterialIcons.glyphMap}
                      size={14}
                      color={isActive ? Colors.primary : Colors.textSecondary}
                    />
                    <Text
                      className={`ml-1 text-xs font-medium ${
                        isActive ? 'text-primary' : 'text-gray-500'
                      }`}
                      numberOfLines={1}
                    >
                      {sub.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Brand Filter Chips */}
      {brands.length > 0 ? (
        <View style={{ flexGrow: 0, flexShrink: 0 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}
          >
            {brands.map((brand) => {
              const isActive = activeBrand === brand;
              return (
                <TouchableOpacity
                  key={brand}
                  onPress={() => handleBrandChange(brand)}
                  className={`mr-2 px-3 py-1.5 rounded-full border ${
                    isActive ? 'bg-cyan-50 border-primary' : 'bg-white border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isActive ? 'text-primary' : 'text-gray-600'
                    }`}
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* Sort & View Toggle Bar */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => setShowSortModal(true)}
          className="flex-row items-center"
        >
          <MaterialIcons name="sort" size={18} color={Colors.primary} />
          <Text className="text-sm text-primary font-medium ml-1">{activeSortLabel}</Text>
          <MaterialIcons name="arrow-drop-down" size={18} color={Colors.primary} />
        </TouchableOpacity>

        <View className="flex-row items-center">
          <Text className="text-xs text-gray-400 mr-3">
            {filteredProducts.length} sản phẩm
          </Text>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary' : 'bg-gray-100'}`}
          >
            <MaterialIcons
              name="view-list"
              size={18}
              color={viewMode === 'list' ? '#fff' : Colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('grid')}
            className={`p-1.5 rounded ml-1 ${viewMode === 'grid' ? 'bg-primary' : 'bg-gray-100'}`}
          >
            <MaterialIcons
              name="grid-view"
              size={18}
              color={viewMode === 'grid' ? '#fff' : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <View className="flex-1 items-center justify-center py-20">
          <MaterialIcons name="search-off" size={56} color={Colors.textMuted} />
          <Text className="text-base text-gray-400 mt-3">Không tìm thấy sản phẩm</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          key={viewMode}
          keyExtractor={(item, idx) => `${item.id}-${item.category}-${idx}`}
          numColumns={viewMode === 'grid' ? 2 : 1}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20, paddingTop: 8 }}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
          className="flex-1 bg-black/40 justify-end"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            className="bg-white rounded-t-2xl"
          >
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>
            <Text className="text-lg font-bold text-center text-gray-900 py-3">
              Sắp xếp theo
            </Text>
            {sortOptions.map((opt) => {
              const isActive = activeSort === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => {
                    setActiveSort(opt.key);
                    setShowSortModal(false);
                  }}
                  className={`flex-row items-center justify-between px-6 py-4 ${
                    isActive ? 'bg-cyan-50' : ''
                  }`}
                >
                  <Text
                    className={`text-base ${
                      isActive ? 'text-primary font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </Text>
                  {isActive ? (
                    <MaterialIcons name="check-circle" size={22} color={Colors.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
            <View className="h-8" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
