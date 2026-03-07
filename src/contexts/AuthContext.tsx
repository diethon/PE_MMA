import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  login as dbLogin,
  register as dbRegister,
  updateUserProfile as dbUpdateProfile,
  changePassword as dbChangePassword,
  type UserRow,
  type UserRole,
} from '../services/authDb';

interface AuthContextType {
  user: UserRow | null;
  isLoggedIn: boolean;
  isSeller: boolean;
  isBuyer: boolean;
  login: (email: string, password: string) => Promise<UserRow>;
  register: (email: string, fullName: string, password: string, role: UserRole) => Promise<UserRow>;
  logout: () => void;
  updateProfile: (fullName: string, email: string) => Promise<UserRow>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRow | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<UserRow> => {
    const u = await dbLogin(email, password);
    if (!u) throw new Error('Email hoặc mật khẩu không đúng');
    setUser(u);
    return u;
  }, []);

  const register = useCallback(
    async (email: string, fullName: string, password: string, role: UserRole): Promise<UserRow> => {
      const u = await dbRegister(email, fullName, password, role);
      setUser(u);
      return u;
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (fullName: string, email: string): Promise<UserRow> => {
      if (!user) throw new Error('Not logged in');
      const updated = await dbUpdateProfile(user.id, fullName, email);
      setUser(updated);
      return updated;
    },
    [user],
  );

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string): Promise<void> => {
      if (!user) throw new Error('Not logged in');
      await dbChangePassword(user.id, oldPassword, newPassword);
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isSeller: user?.role === 'seller',
        isBuyer: user?.role === 'buyer',
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
