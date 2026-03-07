export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  ProductsTab: undefined;
  FavoritesTab: undefined;
  RevenueTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type AppStackParamList = {
  HomeMain: undefined;
  ProductListMain: undefined;
  FavoritesMain: undefined;
  OrdersMain: undefined;
  RevenueMain: undefined;
  ProfileMain: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  EditProfile: undefined;
};
