import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { getCurrentUser, loginUser, logoutUser, registerUser, updateProfile } from '../api/auth';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  role: Role;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (params: { name: string; email: string; password: string; phone?: string; address?: string; city?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  quickLogin: (type: 'admin' | 'customer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const u = await getCurrentUser();
        setUser(u);
      } catch (err) {
        console.error('Lỗi tải phiên người dùng:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    const res = await loginUser(email, pass);
    setIsLoading(false);
    if (res.user) {
      setUser(res.user);
      showToast(`Chào mừng ${res.user.name} đã quay trở lại!`, 'success');
      return true;
    }
    showToast(res.error || 'Đăng nhập không thành công', 'error');
    return false;
  };

  const register = async (params: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    const res = await registerUser(params);
    setIsLoading(false);
    if (res.user) {
      setUser(res.user);
      showToast('Tạo tài khoản thành công! Bạn đã đăng nhập.', 'success');
      return true;
    }
    showToast(res.error || 'Đăng ký không thành công', 'error');
    return false;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    showToast('Đã đăng xuất khỏi tài khoản', 'info');
  };

  const updateUser = async (data: Partial<User>): Promise<boolean> => {
    const res = await updateProfile(data);
    if (res.user) {
      setUser(res.user);
      showToast('Cập nhật thông tin thành công!', 'success');
      return true;
    }
    showToast(res.error || 'Cập nhật thất bại', 'error');
    return false;
  };

  const quickLogin = async (type: 'admin' | 'customer') => {
    if (type === 'admin') {
      await login('admin@homedecor.vn', 'admin123');
    } else {
      await login('khachhang@gmail.com', '123456');
    }
  };

  const role: Role = user ? user.role : 'guest';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
