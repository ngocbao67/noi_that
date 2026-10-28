import { User } from '../types';
import { apiFetch, isPreviewEnvironment, STORAGE_KEYS } from './client';
import { INITIAL_USERS } from './mockData';

function getLocalUsers(): User[] {
  const saved = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_USERS;
  }
}

function saveLocalUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export async function loginUser(email: string, password: string): Promise<{ user?: User; error?: string }> {
  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu.' };
  }

  if (!isPreviewEnvironment()) {
    const res = await apiFetch<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(res.data));
      return { user: res.data };
    }
    return { error: res.error || 'Đăng nhập không thành công' };
  }

  // Preview Mock Authentication
  const users = getLocalUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!found) {
    return { error: 'Tài khoản không tồn tại trong hệ thống.' };
  }

  // For preview convenience, password check
  if (found.role === 'admin' && password !== 'admin123' && password !== '123456') {
    return { error: 'Mật khẩu quản trị viên không chính xác (Thử: admin123).' };
  }

  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(found));
  return { user: found };
}

export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
}): Promise<{ user?: User; error?: string }> {
  if (!params.name || !params.email || !params.password) {
    return { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' };
  }
  if (params.password.length < 6) {
    return { error: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.' };
  }

  if (!isPreviewEnvironment()) {
    const res = await apiFetch<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (res.data) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(res.data));
      return { user: res.data };
    }
    return { error: res.error || 'Đăng ký không thành công' };
  }

  // Preview Mock Registration
  const users = getLocalUsers();
  const exists = users.some((u) => u.email.toLowerCase() === params.email.toLowerCase());
  if (exists) {
    return { error: 'Email này đã được sử dụng bởi một tài khoản khác.' };
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: params.name.trim(),
    email: params.email.trim().toLowerCase(),
    role: 'customer',
    phone: params.phone?.trim() || '',
    address: params.address?.trim() || '',
    city: params.city?.trim() || 'Hà Nội',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveLocalUsers(users);
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newUser));

  return { user: newUser };
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isPreviewEnvironment()) {
    const res = await apiFetch<User>('/api/auth/me');
    if (res.data) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(res.data));
      return res.data;
    }
    return null;
  }

  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  if (!isPreviewEnvironment()) {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  }
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export async function updateProfile(data: Partial<User>): Promise<{ user?: User; error?: string }> {
  const current = await getCurrentUser();
  if (!current) return { error: 'Chưa đăng nhập' };

  if (!isPreviewEnvironment()) {
    const res = await apiFetch<User>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (res.data) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(res.data));
      return { user: res.data };
    }
    return { error: res.error };
  }

  const updated: User = { ...current, ...data };
  const users = getLocalUsers().map((u) => (u.id === current.id ? updated : u));
  saveLocalUsers(users);
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updated));
  return { user: updated };
}
