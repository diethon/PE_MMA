import phoneData from '../../data/phone/phone_data.json';
import laptopData from '../../data/laptop/laptop_data.json';
import tabletData from '../../data/tablet/tablet_data.json';
import watchKidData from '../../data/watch/watch_data_kid.json';
import watchYoungsterData from '../../data/watch/watch_data_youngster.json';
import earphoneData from '../../data/accessory/earphone_data.json';
import powerbankData from '../../data/accessory/powerbank_data.json';
import adapterData from '../../data/accessory/adapter_data.json';

export type CategoryType = 'all' | 'phone' | 'laptop' | 'tablet' | 'watch' | 'earphone' | 'powerbank' | 'adapter';

export interface UnifiedProduct {
  id: string;
  name: string;
  brand: string;
  price: string | null;
  priceNum: number;
  oldPrice: string | null;
  discount: string | null;
  rating: string | null;
  sold: string | null;
  soldNum: number;
  image: string;
  link: string;
  specs: string[];
  category: CategoryType;
}

function parsePrice(raw: string | null | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

function parseSold(raw: string | null | undefined): number {
  if (!raw) return 0;
  const match = raw.match(/([\d,.]+)(k)?/i);
  if (!match) return 0;
  const num = parseFloat(match[1].replace(',', '.'));
  return match[2] ? num * 1000 : num;
}

function normalizePhone(items: any[]): UnifiedProduct[] {
  return items.map((p) => ({
    id: p.id,
    name: p.name ?? '',
    brand: p.brand ?? '',
    price: p.price ?? null,
    priceNum: parsePrice(p.price),
    oldPrice: p.oldPrice ?? null,
    discount: p.discount ?? null,
    rating: p.rating ?? null,
    sold: p.sold ?? null,
    soldNum: parseSold(p.sold),
    image: p.image ?? '',
    link: p.link ?? '',
    specs: [p.screen, p.size].filter(Boolean) as string[],
    category: 'phone' as CategoryType,
  }));
}

function normalizeLaptop(items: any[]): UnifiedProduct[] {
  return items
    .filter((p) => p.name)
    .map((p) => ({
      id: p.id,
      name: p.name ?? '',
      brand: p.brand ?? '',
      price: p.price ?? null,
      priceNum: parsePrice(p.price),
      oldPrice: p.oldPrice ?? null,
      discount: p.discount ?? null,
      rating: p.rating ?? null,
      sold: p.sold ?? null,
      soldNum: parseSold(p.sold),
      image: p.image ?? '',
      link: p.link ?? '',
      specs: p.specs ?? [],
      category: 'laptop' as CategoryType,
    }));
}

function normalizeTablet(items: any[]): UnifiedProduct[] {
  return items
    .filter((p) => p.name)
    .map((p) => ({
      id: p.id,
      name: p.name ?? '',
      brand: p.brand ?? '',
      price: p.price ?? null,
      priceNum: parsePrice(p.price),
      oldPrice: null,
      discount: null,
      rating: null,
      sold: null,
      soldNum: 0,
      image: p.image ?? '',
      link: p.link ?? '',
      specs: p.specs ?? [],
      category: 'tablet' as CategoryType,
    }));
}

function normalizeWatch(items: any[]): UnifiedProduct[] {
  return items.map((p) => ({
    id: p.id,
    name: p.name ?? '',
    brand: p.brand ?? '',
    price: p.price ?? null,
    priceNum: parsePrice(p.price),
    oldPrice: p.old_price ?? null,
    discount: p.discount ?? null,
    rating: p.rating ?? null,
    sold: p.sold ?? null,
    soldNum: parseSold(p.sold),
    image: p.image ?? '',
    link: p.link ?? '',
    specs: p.specs ?? [],
    category: 'watch' as CategoryType,
  }));
}

function normalizeAccessory(items: any[], cat: CategoryType): UnifiedProduct[] {
  return items
    .filter((p) => p.name)
    .map((p) => ({
      id: p.id,
      name: p.name ?? '',
      brand: p.brand ?? '',
      price: p.price ?? null,
      priceNum: parsePrice(p.price),
      oldPrice: p.old_price ?? null,
      discount: p.discount ?? null,
      rating: p.rating ?? null,
      sold: p.sold ?? null,
      soldNum: parseSold(p.sold),
      image: p.image ?? '',
      link: p.link ?? '',
      specs: [p.category, p.color].filter(Boolean) as string[],
      category: cat,
    }));
}

export const allProducts: UnifiedProduct[] = [
  ...normalizePhone(phoneData),
  ...normalizeLaptop(laptopData),
  ...normalizeTablet(tabletData),
  ...normalizeWatch(watchKidData),
  ...normalizeWatch(watchYoungsterData),
  ...normalizeAccessory(earphoneData, 'earphone'),
  ...normalizeAccessory(powerbankData, 'powerbank'),
  ...normalizeAccessory(adapterData, 'adapter'),
];

export function getBrands(category: CategoryType): string[] {
  const products = category === 'all' ? allProducts : allProducts.filter((p) => p.category === category);
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
  return brands.sort();
}

export const categories: { key: CategoryType; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'phone', label: 'Phone', icon: 'smartphone' },
  { key: 'laptop', label: 'Laptop', icon: 'laptop' },
  { key: 'tablet', label: 'Tablet', icon: 'tablet' },
  { key: 'watch', label: 'Watch', icon: 'watch' },
];

export const accessorySubCategories: { key: CategoryType; label: string; icon: string }[] = [
  { key: 'earphone', label: 'Tai nghe', icon: 'headphones' },
  { key: 'powerbank', label: 'Sạc dự phòng', icon: 'battery-charging-full' },
  { key: 'adapter', label: 'Adapter sạc', icon: 'power' },
];

export type SortOption = 'default' | 'price_asc' | 'price_desc' | 'sold_desc' | 'brand_asc';

export const sortOptions: { key: SortOption; label: string }[] = [
  { key: 'default', label: 'Mặc định' },
  { key: 'price_asc', label: 'Giá tăng dần' },
  { key: 'price_desc', label: 'Giá giảm dần' },
  { key: 'sold_desc', label: 'Bán chạy nhất' },
  { key: 'brand_asc', label: 'Thương hiệu A-Z' },
];

export function filterAndSort(
  category: CategoryType,
  brand: string | null,
  sort: SortOption,
  search: string,
): UnifiedProduct[] {
  let result = category === 'all' ? [...allProducts] : allProducts.filter((p) => p.category === category);

  if (brand) {
    result = result.filter((p) => p.brand === brand);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }

  switch (sort) {
    case 'price_asc':
      result.sort((a, b) => a.priceNum - b.priceNum);
      break;
    case 'price_desc':
      result.sort((a, b) => b.priceNum - a.priceNum);
      break;
    case 'sold_desc':
      result.sort((a, b) => b.soldNum - a.soldNum);
      break;
    case 'brand_asc':
      result.sort((a, b) => a.brand.localeCompare(b.brand));
      break;
  }

  return result;
}
