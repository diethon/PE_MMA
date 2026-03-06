export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  rating?: number;
  reviews?: number;
  category?: string;
  colors?: string[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const mockCategories: Category[] = [
  { id: '1', name: 'Laptops', icon: 'laptop-mac' },
  { id: '2', name: 'Audio', icon: 'headphones' },
  { id: '3', name: 'Phones', icon: 'smartphone' },
  { id: '4', name: 'Smart Home', icon: 'home' },
  { id: '5', name: 'Wearables', icon: 'watch' },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Earbuds',
    description: 'Bluetooth 5.0, active noise cancelling, 24h battery life',
    price: 49.99,
    image: 'https://picsum.photos/seed/earbuds/300/300',
    stock: 15,
    rating: 4.5,
    reviews: 89,
    category: 'Audio',
    colors: ['#1a1a2e', '#ffffff', '#007bff'],
  },
  {
    id: '2',
    name: 'Smart Watch Pro',
    description: 'Heart rate monitor, GPS tracking, water resistant',
    price: 199.99,
    image: 'https://picsum.photos/seed/watch/300/300',
    stock: 8,
    rating: 4.8,
    reviews: 156,
    category: 'Wearables',
    colors: ['#c0c0c0', '#1a1a2e', '#ffd700'],
  },
  {
    id: '3',
    name: 'Mechanical Keyboard',
    description: 'Blue tactile switches, tenkeyless design, RGB',
    price: 89.99,
    image: 'https://picsum.photos/seed/keyboard/300/300',
    stock: 24,
    rating: 4.3,
    reviews: 67,
    category: 'Accessories',
  },
  {
    id: '4',
    name: 'Ergonomic Laptop Stand',
    description: 'Adjustable height, aluminum build, cooling vents',
    price: 34.50,
    image: 'https://picsum.photos/seed/stand/300/300',
    stock: 42,
    rating: 4.6,
    reviews: 210,
    category: 'Accessories',
  },
  {
    id: '5',
    name: 'Pro Gaming Mouse',
    description: '16000 DPI, 7 programmable buttons, wireless',
    price: 59.00,
    image: 'https://picsum.photos/seed/mouse/300/300',
    stock: 3,
    rating: 4.7,
    reviews: 128,
    category: 'Accessories',
  },
];

export const mockDailyDeals: Product[] = [
  {
    id: '10',
    name: 'Ultra Smart Watch Series 9',
    description: 'Latest smart watch with advanced health monitoring',
    price: 399.00,
    image: 'https://picsum.photos/seed/smartwatch9/300/300',
    stock: 12,
    rating: 4.9,
    reviews: 340,
  },
  {
    id: '11',
    name: 'Noise Cancelling Headphones Pro',
    description: 'Premium sound with ANC technology',
    price: 249.00,
    image: 'https://picsum.photos/seed/headphones/300/300',
    stock: 20,
    rating: 4.7,
    reviews: 215,
  },
  {
    id: '12',
    name: 'ProBook Air M2 Chip',
    description: 'Thin, light, and powerful laptop',
    price: 1199.00,
    image: 'https://picsum.photos/seed/laptop/300/300',
    stock: 5,
    rating: 4.8,
    reviews: 420,
  },
  {
    id: '13',
    name: 'HomePod Mini White',
    description: 'Smart speaker with amazing sound',
    price: 99.00,
    image: 'https://picsum.photos/seed/homepod/300/300',
    stock: 30,
    rating: 4.5,
    reviews: 180,
  },
];

export const mockCartItems: CartItem[] = [
  {
    id: 'c1',
    product: {
      id: '20',
      name: 'Wireless Headphones',
      description: 'Premium wireless headphones',
      price: 129.99,
      image: 'https://picsum.photos/seed/cart1/300/300',
      stock: 10,
    },
    quantity: 1,
    selectedColor: 'Midnight Black',
  },
  {
    id: 'c2',
    product: {
      id: '21',
      name: 'Smart Watch Series 7',
      description: 'Advanced smartwatch',
      price: 399.00,
      image: 'https://picsum.photos/seed/cart2/300/300',
      stock: 7,
    },
    quantity: 1,
    selectedColor: 'Silver Aluminum',
  },
];

export const mockTopProducts = [
  {
    id: 't1',
    name: 'iPhone 14 Pro Max',
    category: 'Electronics',
    revenue: 12450.0,
    sales: 120,
    icon: 'smartphone',
  },
  {
    id: 't2',
    name: 'AirPods Pro',
    category: 'Accessories',
    revenue: 8230.5,
    sales: 340,
    icon: 'headphones',
  },
];
