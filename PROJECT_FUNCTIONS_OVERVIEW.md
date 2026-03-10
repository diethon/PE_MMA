## Tổng quan cấu trúc & hàm chính

File này tóm tắt **các màn React Native, context, service (SQLite) và utils quan trọng** trong dự án, giải thích **hàm dùng để làm gì** để bạn dễ hiểu và bảo trì.

> Lưu ý: Đây không liệt kê từng hàm nhỏ trong mọi file, mà tập trung vào các phần quan trọng nhất: mua hàng, giỏ hàng, profile, địa chỉ, đơn hàng, seller dashboard và CRUD sản phẩm.

---

## 1. Navigation & loại màn hình

### `src/navigation/types.ts`

- **`RootStackParamList`**
  - Khai báo các màn cấp root: `Login`, `Register`, `Main`.
  - Dùng cho `AppNavigator` để điều hướng trước/sau khi đăng nhập.

- **`TabParamList`**
  - Khai báo các tab chính trong bottom tab:  
    - `HomeTab`, `ProductsTab`, `FavoritesTab`, `CartTab`, `RevenueTab`, `OrdersTab`, `ProfileTab`.
  - Giúp TypeScript hiểu route name & params khi `navigate`.

- **`CheckoutItem`**
  - Kiểu dữ liệu một item dùng trong màn thanh toán:
    - `productId`, `name`, `brand`, `image`, `price`, `priceNum`, `quantity`, `category`.

- **`AppStackParamList`**
  - Khai báo các màn bên trong mỗi tab (stack con):
    - `HomeMain`, `ProductListMain`, `FavoritesMain`, `OrdersMain`, `RevenueMain`, `ProfileMain`.
    - `ProductDetail`: xem chi tiết 1 sản phẩm (param `{ productId: string }`).
    - `Cart`: màn giỏ hàng.
    - `EditProfile`: chỉnh sửa hồ sơ.
    - `AddressList`: quản lý địa chỉ giao hàng.
    - `ProductManagement`: màn quản lý danh sách sản phẩm của seller.
    - `ProductForm`: form thêm / sửa sản phẩm  
      - `{ mode: 'create' }` hoặc `{ mode: 'edit'; productId: string }`.
    - `Checkout`: màn thanh toán, nhận `{ items: CheckoutItem[] }`.

### `src/navigation/BottomTabNavigator.tsx`

- **`HomeStack`**
  - Stack con cho tab Home:
    - `HomeMain` → `HomeScreen`.
    - `ProductListMain` → `ProductListScreen`.
    - `ProductDetail`, `Cart`, `EditProfile`, `Checkout`.

- **`ProductsStack`**
  - Stack cho tab tìm kiếm sản phẩm:
    - `ProductListMain`, `ProductDetail`, `Cart`, `Checkout`.

- **`FavoritesStack`**
  - Stack cho tab Yêu thích:
    - `FavoritesMain`, `ProductDetail`, `Cart`, `Checkout`.

- **`CartStack`**
  - Stack cho tab Giỏ hàng:
    - `Cart`, `ProductDetail`, `Checkout`.

- **`RevenueStack` (dành cho seller)**
  - `RevenueMain` → `DashboardScreen` (thống kê).
  - `ProductManagement` → `ProductManagementScreen` (CRUD list sản phẩm).
  - `ProductForm` → `ProductFormScreen` (form thêm/sửa sản phẩm).

- **`OrdersStack` (dành cho buyer)**
  - `OrdersMain` → `OrderHistoryScreen` (đơn mua của người dùng).
  - `ProductDetail`.

- **`ProfileStack`**
  - `ProfileMain` → `ProfileScreen`.
  - `EditProfile` → `EditProfileScreen`.
  - `AddressList` → `AddressListScreen`.

- **`CustomTabBar`**
  - Custom UI cho bottom tab:
    - Ẩn một số tab như `CartTab`, `ProfileTab` khỏi dải pill chính nhưng vẫn tồn tại.
    - Hiển thị nút tròn nổi cho giỏ hàng (icon `shopping-cart` + badge số lượng).

- **`DrawerContent`**
  - Drawer bên trái, hiển thị thông tin user + menu:
    - Gọi `_innerNav.navigate('HomeTab' | 'ProductsTab' | 'FavoritesTab' | 'OrdersTab' | 'RevenueTab' | 'ProfileTab')`.
    - Nút **Đăng xuất**: gọi `logout()` trong `AuthContext` và reset navigation về `Login`.

---

## 2. Context (trạng thái toàn cục)

### `src/contexts/AuthContext.tsx`

- **`AuthProvider`**
  - Bọc toàn app, cung cấp thông tin đăng nhập.
  - State:
    - `user: UserRow | null`.
    - `isLoggedIn`, `isSeller`, `isBuyer`.
  - Hàm:
    - `login(email, password)` → gọi `dbLogin`, set `user`.
    - `register(email, fullName, password, role)` → đăng ký user mới, set `user`.
    - `logout()` → xóa `user` khỏi state.
    - `updateProfile(fullName, email)` → cập nhật thông tin user trong DB, đồng bộ vào state.
    - `changePassword(oldPassword, newPassword)` → đổi mật khẩu.
    - `updateAddress(phone, address)` → cập nhật SĐT, địa chỉ chính trong bảng user.

- **`useAuth()`**
  - Hook tiện lợi để truy cập các hàm và trạng thái trên.

### (Các context khác – chỉ tóm tắt)

- **`CartContext`** (không liệt kê full code ở đây):
  - Quản lý giỏ hàng:
    - `items`, `cartCount`, `loading`.
    - `addProduct(product, quantity?)`, `updateQuantity(productId, quantity)`, `removeItem(productId)`, `clearCart()`.

- **`FavoritesContext`**:
  - Quản lý danh sách sản phẩm yêu thích:
    - `isFav(productId)`, `toggleFav(productId)`, `favCount`.

---

## 3. Services (SQLite)

Tất cả đều dùng chung DB `cart.db` nhưng bảng khác nhau.

### `src/services/cartDb.ts`

- Bảng **`cart`**: lưu giỏ hàng cho từng `userId`.
- **`getCartItems(userId)`** → trả về danh sách `CartRow` (sản phẩm trong giỏ).
- **`addToCart(userId, productId, name, brand, price, priceNum, image, category, quantity?)`**
  - Nếu đã tồn tại `(userId, productId)` → tăng số lượng.
  - Nếu chưa → thêm dòng mới.
- **`updateQuantity(userId, productId, quantity)`**
  - Nếu `quantity <= 0` → xóa khỏi giỏ.
  - Ngược lại → cập nhật quantity.
- **`removeFromCart(userId, productId)`** → xóa 1 sản phẩm khỏi giỏ.
- **`clearCart(userId)`** → xóa toàn bộ giỏ của user.
- **`getCartCount(userId)`** → tổng số lượng item (dùng hiển thị badge trên icon giỏ hàng).

### `src/services/orderDb.ts`

- Bảng **`orders`**: lưu chi tiết từng dòng sản phẩm trong mỗi đơn (một đơn có nhiều dòng).

- **`checkout(userId, cartItems[])`**
  - Nhận danh sách item từ giỏ/checkout.
  - Tạo mã đơn `ORD-<timestamp>`.
  - Insert từng dòng vào bảng `orders`.

- Hàm dành cho **seller**:
  - `getTotalRevenue()` → tổng doanh thu (giá * số lượng).
  - `getTotalOrders()` → số đơn (đếm distinct `orderId`).
  - `getTotalItemsSold()` → tổng số lượng sản phẩm đã bán.
  - `getDistinctBuyersCount()` → số lượng khách hàng unique.
  - `getRevenueByCategory()` → doanh thu theo `category`.
  - `getTopProducts(limit)` → top sản phẩm bán chạy (doanh thu & tổng số lượng).
  - `getOrderHistory()` → lịch sử tất cả đơn (để show cho seller).

- Hàm dành cho **buyer**:
  - `getBuyerOrders(userId)` → lịch sử đơn mua của user.
  - `getBuyerOrdersByMonth(userId, year, month)` → lọc theo tháng.
  - `getBuyerTotalSpent(userId)` → tổng tiền đã chi.
  - `getBuyerTotalOrders(userId)` → tổng số đơn của user.
  - `getBuyerMonthlySpending(userId)` → chi tiêu theo từng tháng.
  - `getOrderItems(orderId)` → chi tiết từng dòng trong 1 đơn.

### `src/services/addressDb.ts`

- Bảng **`addresses`**: lưu nhiều địa chỉ giao hàng cho 1 user.
- **`getAddresses(userId)`** → lấy danh sách địa chỉ (địa chỉ mặc định lên trước).
- **`getDefaultAddress(userId)`** → lấy địa chỉ mặc định (nếu chưa có, lấy địa chỉ mới nhất nếu tồn tại).
- **`addAddress(userId, recipientName, phone, address, isDefault)`**
  - Nếu `isDefault === true` → reset các địa chỉ khác về `isDefault = 0`.
  - Thêm địa chỉ mới và trả về dòng vừa thêm.
- **`updateAddressRow(id, recipientName, phone, address)`** → cập nhật nội dung.
- **`setDefaultAddress(userId, addressId)`**
  - Clear mặc định cũ, set mặc định cho địa chỉ mới.
- **`deleteAddress(id)`** → xóa 1 địa chỉ.

### `src/services/productDb.ts`

- Bảng **`products`**: dùng cho **sản phẩm do seller tự thêm** (không phải data đọc từ file JSON).
- **`getAllProducts()`** → danh sách tất cả sản phẩm tự thêm, mới nhất trước.
- **`getProductById(productId)`** → lấy 1 sản phẩm theo `productId`.
- **`addProduct(data)`**
  - Nếu không truyền `productId` → tự tạo `CUS-<timestamp>`.
  - Lưu tên, mô tả, brand, giá (`priceNum`), ảnh (`image`), category.
- **`updateProduct(productId, data)`**
  - Cập nhật name, description, brand, priceNum, image, category cho sản phẩm đó.
- **`deleteProduct(productId)`** → xóa sản phẩm khỏi bảng `products`.

---

## 4. Constants & xử lý dữ liệu sản phẩm

### `src/constants/productData.ts`

- Đọc dữ liệu từ các file JSON:
  - `phone_data.json`, `laptop_data.json`, `tablet_data.json`, `watch_data_kid.json`, `watch_data_youngster.json`, `earphone_data.json`, `powerbank_data.json`, `adapter_data.json`.

- **Kiểu `UnifiedProduct`**
  - Dùng chung cho tất cả loại sản phẩm:
    - `id`, `name`, `brand`, `price`, `priceNum`, `oldPrice`, `discount`, `rating`, `sold`, `soldNum`, `image`, `link`, `specs`, `category`.

- Hàm chuẩn hóa:
  - `normalizePhone`, `normalizeLaptop`, `normalizeTablet`, `normalizeWatch`, `normalizeAccessory`  
    → convert dữ liệu thô từng loại thành `UnifiedProduct`.

- **`allProducts`**
  - Mảng tất cả sản phẩm (ghép tất cả loại, đã chuẩn hóa).

- **`getBrands(category)`**
  - Lọc thương hiệu duy nhất theo category, dùng cho filter brand.

- **`filterAndSort(category, brand, sort, search)`**
  - Lọc theo:
    - `category` (all / theo loại).
    - `brand` (nếu có chọn).
    - `search` (tên sản phẩm hoặc brand, không phân biệt hoa thường).
  - Sắp xếp theo:
    - `price_asc`, `price_desc`, `sold_desc`, `brand_asc`, hoặc mặc định.

---

## 5. Các màn React Native chính

### `src/screens/HomeScreen.tsx`

- Màn trang chủ:
  - Banner slideshow tự động chạy.
  - Section danh mục, hot deals, bán chạy, từng nhóm: điện thoại, laptop, đồng hồ, tai nghe, sạc dự phòng, adapter.
  - Hàm chính:
    - `navigateToProduct(id)` → `navigation.navigate('ProductDetail', { productId: id })`.
  - Dùng `ProductCard` (grid) và `TouchableOpacity` để chuyển qua màn chi tiết.

### `src/screens/ProductListScreen.tsx`

- Màn danh sách sản phẩm có:
  - Search, filter danh mục, filter brand, sort, chuyển view list/grid, phân trang.
- Hàm quan trọng:
  - State `activeCategory`, `activeBrand`, `activeSort`, `search`, `viewMode`.
  - Dùng `filterAndSort` để lấy `allFilteredProducts`.
  - `renderProduct({ item })`:
    - Render `ProductCard` với `variant = 'list' | 'grid'`.
    - `onPress` → `navigate('ProductDetail', { productId: item.id })`.

### `src/screens/ProductDetailScreen.tsx`

- Hiển thị chi tiết 1 `UnifiedProduct`:
  - Ảnh lớn, tên, giá, khuyến mãi, rating, sold, thông số.
  - Liên quan:
    - `useCart` → `addProduct(product, quantity)` (Thêm vào giỏ, Mua ngay).
    - `useFavorites` → `isFav`, `toggleFav`.
    - Tìm `relatedProducts` cùng brand.
- Hàm chính:
  - `handleAddToCart()` → thêm vào giỏ (số lượng chọn trong bottom sheet).
  - `handleBuyNow()` → thêm vào giỏ + navigate thẳng đến `Checkout`.

### `src/screens/CartScreen.tsx`

- Màn giỏ hàng:
  - Lấy `items` từ `useCart()`.
  - Tính toán:
    - `selectedIds` (Set productId đã chọn).
    - `selectedSubtotal`, `selectedCount` → tổng tiền & số lượng đã chọn.
  - Hàm:
    - `toggleSelect(productId)` → chọn/bỏ chọn một sản phẩm.
    - `toggleSelectAll()` → chọn tất cả / bỏ chọn tất cả.
    - `handleRemove(productId)` → hỏi confirm, gọi `removeItem`.
    - `handleClear()` → xóa toàn bộ giỏ.
    - `handleCheckout()` → kiểm tra đăng nhập + có chọn sản phẩm → `navigate('Checkout', { items: ... })`.

- `CartItemCard` trong đây được dùng với:
  - `onToggleSelect`, `onQuantityChange`, `onRemove`.
  - **`onPressProduct`** → `navigate('ProductDetail', { productId })` (bấm vào vùng sản phẩm trong giỏ sẽ nhảy sang chi tiết).

### `src/components/products/CartItemCard.tsx`

- Component hiển thị 1 dòng sản phẩm trong giỏ:
  - Checkbox chọn.
  - Ảnh, brand, tên, giá, số lượng.
  - Nút xóa.
  - Props:
    - `item: CartRow`.
    - `selected`, `onToggleSelect(productId)`.
    - `onQuantityChange(productId, quantity)`.
    - `onRemove(productId)`.
    - `onPressProduct(productId)` → dùng để navigate sang `ProductDetail`.

### `src/screens/ProfileScreen.tsx`

- Màn hồ sơ user:
  - Hiển thị avatar chữ cái, tên, email, role (Người bán/Người mua).
  - Quick stats: Giỏ hàng, Yêu thích.
  - Mục:
    - **Chỉnh sửa hồ sơ** → `navigate('EditProfile')`.
    - **Địa chỉ giao hàng** → `navigate('AddressList')`.
    - Một số mục cài đặt khác (chưa triển khai chi tiết).
  - Nút Đăng xuất:
    - Gọi `logout()` từ `AuthContext`.
    - Reset navigation về `Login`.

### `src/screens/EditProfileScreen.tsx`

- Màn chỉnh sửa:
  - Họ tên, email → gọi `updateProfile` trong `AuthContext`.
  - Đổi mật khẩu:
    - Nhập mật khẩu cũ, mật khẩu mới, xác nhận.
    - Gọi `changePassword`.
  - Địa chỉ giao hàng chi tiết đã được tách qua màn `AddressListScreen`.

### `src/screens/AddressListScreen.tsx`

- Quản lý **địa chỉ giao hàng**:
  - Hiển thị danh sách địa chỉ (tên người nhận, số ĐT, địa chỉ, tag Mặc định).
  - Thêm địa chỉ mới (bottom sheet form).
  - Sửa địa chỉ, Xóa, Đặt làm mặc định.
  - Hàm:
    - `loadAddresses()` → gọi `getAddresses(userId)`.
    - `openAddAddrForm()`, `openEditAddrForm(addr)`.
    - `handleSaveAddr()` → `addAddress` hoặc `updateAddressRow` + `setDefaultAddress` nếu cần.
    - `handleDeleteAddr(addr)` → xóa.
    - `handleSetDefault(addr)` → set mặc định.

### `src/screens/OrderHistoryScreen.tsx`

- Đơn mua của buyer:
  - Summary: tổng chi, tổng đơn, chi tiêu theo tháng.
  - Filter: tất cả / theo tháng.
  - Danh sách đơn → click mở chi tiết (expand) hiển thị các sản phẩm trong đơn.
  - Hàm:
    - `loadData()` → gọi nhiều hàm trong `orderDb` cho user hiện tại.
    - `toggleOrderDetail(orderId)` → mở/đóng chi tiết đơn, lazy-load items bằng `getOrderItems`.

### `src/screens/DashboardScreen.tsx` (Seller)

- Thống kê seller:
  - Tổng doanh thu, tổng đơn, tổng sản phẩm bán, số khách.
  - Doanh thu theo danh mục, top sản phẩm bán chạy, lịch sử đơn.
  - Nút:
    - Nếu chưa có đơn:
      - **Mua sắm ngay** → `ProductListMain`.
      - **Quản lý sản phẩm** (nếu là seller) → `ProductManagement`.
    - Trong section “Sản phẩm bán chạy”:
      - Nút **Quản lý sản phẩm** → `ProductManagement`.

### `src/screens/ProductManagementScreen.tsx` (CRUD danh sách sản phẩm của seller)

- Dùng dữ liệu từ `productDb`:
  - `getAllProducts()` → load danh sách.
  - `deleteProduct(productId)` → xóa.
  - Khi màn được focus → reload danh sách.
- Giao diện:
  - Header:
    - Nút quay lại.
    - Tiêu đề “Quản lý sản phẩm”.
    - Icon `+` → `navigate('ProductForm', { mode: 'create' })`.
  - Danh sách:
    - Mỗi dòng hiển thị ảnh (URL hoặc icon mặc định), tên, brand, category, giá.
    - Nút **Sửa** → `navigate('ProductForm', { mode: 'edit', productId })`.
    - Nút **Xóa** → confirm rồi gọi `deleteProduct`.

### `src/screens/ProductFormScreen.tsx` (Form thêm/sửa sản phẩm)

- Lấy param từ navigation:
  - `mode: 'create' | 'edit'`.
  - Nếu `mode === 'edit'` → thêm `productId`.
- Khi `mode === 'edit'`:
  - `useEffect` gọi `getProductById(productId)` để pre-fill form.
- Field:
  - `name`, `description`, `brand`, `price` (string), `image`, `category`.
- `handleSave()`:
  - Validate tên sản phẩm.
  - Convert `price` → `priceNum` (number).
  - Nếu `mode === 'edit'`:
    - Gọi `updateProduct(editingId, data)`.
  - Nếu `mode === 'create'`:
    - Gọi `addProduct(data)`.
  - Sau khi thành công → báo `Alert` + `navigation.goBack()`.

---

## 6. Components sản phẩm

### `src/components/products/ProductCard.tsx`

- Component hiển thị card sản phẩm chung (`UnifiedProduct`):
  - **`RealProductCard`** cho dữ liệu thật (từ `productData`).
  - **`LegacyProductCard`** cho loại `Product` cũ (mock).
- Props:
  - `product`, `onPress`, `variant: 'list' | 'grid'`.
- Hành vi:
  - `onPress` → thường được truyền từ màn cha để mở `ProductDetail`.
  - Nút **thêm vào giỏ**:
    - Gọi `useCart().addProduct(product)`.
  - Icon **yêu thích**:
    - Gọi `useFavorites().toggleFav(product.id)`.
  - Ở variant `grid`:
    - Card có chiều cao tối thiểu, layout `flex-1 justify-between` để nút giỏ hàng luôn nằm ở góc dưới bên phải đồng đều giữa các card.

---

Nếu bạn muốn, tôi có thể tạo thêm một file riêng chỉ liệt kê **route → màn hình → hành vi chính** dưới dạng sơ đồ để bạn dễ hình dung luồng điều hướng. 
