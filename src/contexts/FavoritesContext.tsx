import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getFavoriteIds,
  toggleFavorite as dbToggle,
  getFavoritesCount,
} from '../services/favoritesDb';

interface FavoritesContextType {
  favoriteIds: string[];
  favCount: number;
  isFav: (productId: string) => boolean;
  toggleFav: (productId: string) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favCount, setFavCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setFavoriteIds([]);
      setFavCount(0);
      setLoading(false);
      return;
    }
    try {
      const [ids, count] = await Promise.all([
        getFavoriteIds(userId),
        getFavoritesCount(userId),
      ]);
      setFavoriteIds(ids);
      setFavCount(count);
    } catch (e) {
      console.warn('Favorites load error:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFav = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  const toggleFav = useCallback(
    async (productId: string) => {
      if (!userId) return;
      await dbToggle(userId, productId);
      await refresh();
    },
    [userId, refresh],
  );

  return (
    <FavoritesContext.Provider value={{ favoriteIds, favCount, isFav, toggleFav, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites(): FavoritesContextType {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
