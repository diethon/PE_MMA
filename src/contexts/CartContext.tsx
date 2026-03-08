import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CartRow,
  getCartItems,
  addToCart as dbAdd,
  updateQuantity as dbUpdate,
  removeFromCart as dbRemove,
  clearCart as dbClear,
  getCartCount as dbCount,
} from '../services/cartDb';
import { checkout as dbCheckout } from '../services/orderDb';
import { useAuth } from './AuthContext';
import type { UnifiedProduct } from '../constants/productData';

interface CartContextType {
  items: CartRow[];
  cartCount: number;
  loading: boolean;
  addProduct: (product: UnifiedProduct, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<string>;
  checkoutSelected: (selectedProductIds: string[]) => Promise<string>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? 0;

  const [items, setItems] = useState<CartRow[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setCartCount(0);
      setLoading(false);
      return;
    }
    try {
      const [rows, count] = await Promise.all([getCartItems(userId), dbCount(userId)]);
      setItems(rows);
      setCartCount(count);
    } catch (e) {
      console.warn('Cart refresh error:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  const addProduct = useCallback(
    async (product: UnifiedProduct, quantity = 1) => {
      if (!userId) return;
      await dbAdd(
        userId,
        product.id,
        product.name,
        product.brand,
        product.price,
        product.priceNum,
        product.image,
        product.category,
        quantity,
      );
      await refresh();
    },
    [userId, refresh],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!userId) return;
      await dbUpdate(userId, productId, quantity);
      await refresh();
    },
    [userId, refresh],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!userId) return;
      await dbRemove(userId, productId);
      await refresh();
    },
    [userId, refresh],
  );

  const clearCart = useCallback(async () => {
    if (!userId) return;
    await dbClear(userId);
    await refresh();
  }, [userId, refresh]);

  const checkout = useCallback(async (): Promise<string> => {
    if (!userId) throw new Error('Not logged in');
    const currentItems = await getCartItems(userId);
    if (currentItems.length === 0) throw new Error('Cart is empty');
    const orderId = await dbCheckout(userId, currentItems);
    await dbClear(userId);
    await refresh();
    return orderId;
  }, [userId, refresh]);

  const checkoutSelected = useCallback(async (selectedProductIds: string[]): Promise<string> => {
    if (!userId) throw new Error('Not logged in');
    if (selectedProductIds.length === 0) throw new Error('No items selected');
    const currentItems = await getCartItems(userId);
    const selectedItems = currentItems.filter((item) => selectedProductIds.includes(item.productId));
    if (selectedItems.length === 0) throw new Error('No matching items');
    const orderId = await dbCheckout(userId, selectedItems);
    for (const item of selectedItems) {
      await dbRemove(userId, item.productId);
    }
    await refresh();
    return orderId;
  }, [userId, refresh]);

  return (
    <CartContext.Provider
      value={{ items, cartCount, loading, addProduct, updateQuantity, removeItem, clearCart, checkout, checkoutSelected, refresh }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
