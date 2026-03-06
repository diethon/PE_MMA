export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  ProductList: undefined;
  ProductDetail: { productId: string };
  ProductForm: { productId?: string };
  Cart: undefined;
  Dashboard: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Categories: undefined;
  CartTab: undefined;
  Profile: undefined;
};
