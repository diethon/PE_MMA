export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  ProductsTab: undefined;
  FavoritesTab: undefined;
  CartTab: undefined;
  RevenueTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type CheckoutItem = {
  productId: string;
  name: string;
  brand: string;
  image: string;
  price: string;
  priceNum: number;
  quantity: number;
  category: string;
};

export type AppStackParamList = {
  HomeMain: undefined;
  ProductListMain: { category?: string } | undefined;
  FavoritesMain: undefined;
  OrdersMain: undefined;
  RevenueMain: undefined;
  ProfileMain: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  EditProfile: undefined;
  AddressList: undefined;
   ProductManagement: undefined;
   ProductForm: { mode: 'create' } | { mode: 'edit'; productId: string };
  Checkout: { items: CheckoutItem[] };
};
