## Tổng quan React Native & API đã dùng trong dự án

File này giải thích **các thành phần React / React Native / Navigation** mà dự án đang sử dụng, kèm tác dụng và ví dụ đơn giản, để bạn đọc code dễ hiểu hơn.

---

## 1. Thành phần React cơ bản

### `React.FC`, `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`

- **`React.FC<Props>`**
  - Khai báo một component dạng function với kiểu `Props`.
  - Ví dụ:
    ```ts
    export const CartScreen: React.FC = () => { ... }
    ```

- **`useState(initialValue)`**
  - Tạo state bên trong component (giá trị có thể thay đổi, làm component render lại).
  - Ví dụ trong `CartScreen`:
    ```ts
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    ```

- **`useEffect(effect, deps)`**
  - Chạy side-effect sau khi render: gọi API, load data, set timer...
  - `deps` là mảng phụ thuộc; khi giá trị trong mảng đổi, effect chạy lại.
  - Ví dụ load slide banner tự chạy:
    ```ts
    useEffect(() => {
      const timer = setInterval(...);
      return () => clearInterval(timer); // cleanup
    }, []);
    ```

- **`useCallback(fn, deps)`**
  - Gói một hàm để tránh tạo mới mỗi lần render (tối ưu khi truyền xuống props).
  - Được dùng nhiều trong `CartScreen`, `ProductListScreen` cho các handler như `toggleSelect`, `loadMore`.

- **`useMemo(factory, deps)`**
  - Tính toán một giá trị “nặng” (ví dụ lọc + sort danh sách) và chỉ tính lại khi deps đổi.
  - Ví dụ:
    ```ts
    const allFilteredProducts = useMemo(
      () => filterAndSort(activeCategory, activeBrand, activeSort, search),
      [activeCategory, activeBrand, activeSort, search],
    );
    ```

- **`useRef(initial)`**
  - Lưu trữ một giá trị không làm component render lại khi thay đổi, thường dùng với ref UI (ScrollView, FlatList).

---

## 2. Thành phần UI React Native quan trọng

### `View`

- Tương đương `<div>` trong web, dùng để chứa layout, xếp hàng, nền, bo góc...
- Ví dụ:
  ```tsx
  <View className="flex-1 bg-surface">
    <View className="px-4 py-2">...</View>
  </View>
  ```

### `Text`

- Hiển thị chữ.
- Lưu ý trong React Native, chỉ được hiển thị chữ bên trong `Text` (không phải trong `View` trống).

### `Image`

- Hiển thị hình ảnh.
- Trong dự án:
  - `source={{ uri: product.image }}` → ảnh từ URL.
  - Hoặc `require('../../assets/slide/i1.png')` → ảnh local.
  - `resizeMode="contain" | "cover"` để kiểm soát cách ảnh fit khung.

### `ScrollView`

- Cho phép cuộn nội dung theo trục dọc / ngang (vertical/horizontal).
- Dùng nhiều trong:
  - `HomeScreen` (cuộn toàn trang).
  - `AddressListScreen`, `EditProfileScreen`, `ProductFormScreen`.
- Props quan trọng:
  - `horizontal` → cuộn ngang.
  - `showsVerticalScrollIndicator={false}` → ẩn thanh cuộn.
  - `contentContainerStyle` → custom padding bên trong.

### `FlatList`

- Danh sách tối ưu cho nhiều phần tử (virtualized list).
- Quan trọng khi hiển thị nhiều sản phẩm:
  - `ProductListScreen`, `HomeScreen` (`FlatList` cho best sellers).
- Props chính:
  - `data` → mảng dữ liệu.
  - `renderItem={({ item, index }) => (...)}` → render từng dòng.
  - `keyExtractor={(item, index) => string}` → **bắt buộc** trả về key unique.
    - **`key`** là chuỗi duy nhất cho mỗi item, giúp React biết item nào thay đổi/giữ lại, tối ưu render.
  - `numColumns={2}` → hiển thị dạng lưới 2 cột.
  - `onEndReached` + `onEndReachedThreshold` → load thêm khi gần cuối (phân trang).

### `TouchableOpacity`

- Một “nút” bấm có hiệu ứng mờ (opacity) khi nhấn.
- Dùng cực nhiều trong dự án:
  - Bọc card sản phẩm để bấm mở `ProductDetail`.
  - Nút “Thêm vào giỏ”, “Xóa”, “Lưu”, “Thanh toán”, v.v.
- Props quan trọng:
  - `onPress={() => ...}` → callback khi bấm.
  - `activeOpacity={0.6}` → độ mờ khi nhấn (0 là trong suốt, 1 là không đổi).
  - Có thể dùng thêm `onLongPress`, `disabled`, v.v.

### `Pressable`

- Tương tự `TouchableOpacity` nhưng linh hoạt hơn (onPressIn, onPressOut, style theo trạng thái).
- Dự án chủ yếu dùng `TouchableOpacity`; `Pressable` xuất hiện trong Drawer overlay.

### `Modal`

- Hiển thị một lớp nội dung chồng lên toàn màn hình (bottom sheet, popup).
- Dùng trong:
  - `ProductDetailScreen` (bottom sheet chọn số lượng, mua ngay).
  - `AddressListScreen` (form thêm/sửa địa chỉ).
  - `ProductListScreen` (sort modal).
- Props:
  - `visible` → hiển thị/ẩn.
  - `transparent` → nền trong suốt (cho phép overlay đen).
  - `animationType="slide" | "fade"`.
  - `onRequestClose` → callback khi người dùng cố gắng đóng (Android back).

### `KeyboardAvoidingView`

- Dùng để đẩy nội dung lên trên khi bàn phím mở (tránh che input).
- Props:
  - `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`.
  - Thường bọc quanh `ScrollView` trong các màn form (login, edit profile, product form).

### `ActivityIndicator`

- Vòng tròn loading, dùng khi đang tải dữ liệu.
- Ví dụ:
  - `CartScreen` → khi `loading` giỏ hàng.
  - `DashboardScreen`, `OrderHistoryScreen`, `AddressListScreen`.

### `Alert`

- Hiển thị hộp thoại xác nhận / thông báo.
- Dùng để:
  - Xác nhận xóa sản phẩm khỏi giỏ.
  - Xác nhận xóa địa chỉ.
  - Báo thành công/ thất bại khi lưu profile, đổi mật khẩu, CRUD sản phẩm.
- Cú pháp:
  ```ts
  Alert.alert(
    'Tiêu đề',
    'Nội dung',
    [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => { ... } },
    ],
  );
  ```

### `StyleSheet`

- Trong `DashboardScreen` dùng `StyleSheet.create` để định nghĩa style object.
- Các màn khác chủ yếu dùng `className` (Tailwind).

---

## 3. Tailwind className (react-native-css-interop)

Trong nhiều file, bạn thấy:

```tsx
<View className="flex-1 bg-surface">
  <Text className="text-base font-bold text-text-primary">...</Text>
</View>
```

- Đây là dùng plugin để viết style kiểu Tailwind thay vì `style={{ ... }}`.
- Một số class thường gặp:
  - `flex-1`, `flex-row`, `items-center`, `justify-between`, `mb-4`, `px-4`, `py-2`, ...
  - Màu custom như `bg-surface`, `text-text-primary`, `border-border` được map từ file theme (`Colors`).

---

## 4. React Navigation – hooks & props

### `useNavigation` & `navigation.navigate`

- Lấy đối tượng `navigation` để điều hướng giữa các màn:

```ts
const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

navigation.navigate('ProductDetail', { productId: item.id });
```

- Dự án dùng nhiều trong:
  - `HomeScreen`, `ProductListScreen`, `CartScreen`, `DashboardScreen`, `ProfileScreen`, `EditProfileScreen`, `AddressListScreen`, `ProductFormScreen`, `ProductManagementScreen`.

### `useRoute`

- Lấy `params` truyền vào màn hiện tại.

Ví dụ trong `ProductDetailScreen`:

```ts
const route = useRoute<RouteProp<AppStackParamList, 'ProductDetail'>>();
const { productId } = route.params;
```

### `CommonActions.reset`

- Dùng để reset stack khi đăng xuất (xóa history, quay về `Login`):

```ts
navigation.dispatch(
  CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }),
);
```

---

## 5. Context & hooks tùy chỉnh trong dự án

### `useAuth` (từ `AuthContext`)

- Dùng ở `ProfileScreen`, `DashboardScreen`, `CartScreen`, `ProductDetailScreen`, `EditProfileScreen`:
  - Lấy `user` (thông tin đăng nhập).
  - Biết user là **seller** hay **buyer** (`isSeller`, `isBuyer`).
  - Gọi `updateProfile`, `changePassword`, `logout`, ...

### `useCart` (từ `CartContext`)

- Dùng ở `CartScreen`, `ProductDetailScreen`, `ProfileScreen` (để lấy `cartCount`).
- Hàm:
  - `addProduct(product, qty?)` → thêm vào giỏ.
  - `updateQuantity(productId, qty)` → đổi số lượng.
  - `removeItem(productId)` → xóa 1 item.
  - `clearCart()` → xóa hết.

### `useFavorites` (từ `FavoritesContext`)

- Dùng ở `ProductDetailScreen`, `HomeScreen` (icon tim), `ProfileScreen`.
- Hàm:
  - `isFav(productId)` → kiểm tra xem đang yêu thích không.
  - `toggleFav(productId)` → thêm/bỏ yêu thích.

---

## 6. Các hàm tiện ích quan trọng

### `src/utils/format.ts` – `formatVND`

- Hàm `formatVND(number)`:
  - Định dạng số tiền ra dạng tiền Việt: `1.500.000 ₫`.
  - Dùng trong:
    - `CartScreen`, `ProductDetailScreen`, `DashboardScreen`, `OrderHistoryScreen`, `ProductManagementScreen`, v.v.

---

## 7. Tóm tắt những gì dự án đang làm (theo luồng)

- **Buyer:**
  - Vào `HomeScreen` / `ProductListScreen` → xem & lọc sản phẩm.
  - Bấm 1 sản phẩm → `ProductDetailScreen` (coi chi tiết, đánh giá, specs).
  - Thêm vào giỏ (`useCart`) → `CartScreen`.
  - Trong `CartScreen`:
    - Chọn/bỏ chọn, tăng/giảm số lượng, xóa item.
    - Bấm vào item trong giỏ → nhảy sang `ProductDetail`.
    - Thanh toán → `Checkout` (sử dụng `CheckoutItem[]`).
  - Khi thanh toán xong → `orderDb.checkout` lưu dữ liệu đơn, buyer xem lại ở `OrderHistoryScreen`.
  - Quản lý nhiều địa chỉ giao hàng ở `AddressListScreen`.

- **Seller:**
  - Vào tab **Doanh thu** → `DashboardScreen`:
    - Xem tổng doanh thu, đơn, khách, doanh thu theo danh mục, top sản phẩm.
    - Nút **Quản lý sản phẩm**:
      - Mở `ProductManagementScreen` → xem danh sách sản phẩm do mình thêm (bảng `products`).
      - Thêm sản phẩm mới → `ProductFormScreen` (mode `create`).
      - Sửa / Xóa sản phẩm → `ProductFormScreen` (mode `edit`) + `deleteProduct`.

---

Bạn có thể dùng hai file:

- `PROJECT_FUNCTIONS_OVERVIEW.md` → hiểu **cấu trúc & luồng nghiệp vụ**.
- `REACT_NATIVE_APIS_OVERVIEW.md` (file này) → hiểu **React / React Native / Navigation / Context** đang dùng, từng thành phần để làm gì.

