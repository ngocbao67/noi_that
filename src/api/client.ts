/**
 * Dual-Mode API Client:
 * 1. Cloudflare Production Mode: Direct relative calls to `/api/...` serviced by Cloudflare Python Workers + D1.
 * 2. Preview Mode: Client-side reactive persistence adapter mirroring D1 SQLite database rules for live demo inside Google AI Studio.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'homedecor_products_db',
  CATEGORIES: 'homedecor_categories_db',
  USERS: 'homedecor_users_db',
  ORDERS: 'homedecor_orders_db',
  CART: 'homedecor_cart_db',
  SESSION: 'homedecor_auth_session',
  API_MODE: 'homedecor_api_mode', // 'mock' | 'real'
};

// Default to mock in preview unless user or environment explicitly switches
export const isPreviewEnvironment = (): boolean => {
  if (typeof window === 'undefined') return true;
  const forcedMode = localStorage.getItem(STORAGE_KEYS.API_MODE);
  if (forcedMode === 'real') return false;
  if (forcedMode === 'mock') return true;
  // If running inside AI Studio preview or localhost dev without cloudflare worker bound
  return true;
};

export function setApiMode(mode: 'mock' | 'real') {
  localStorage.setItem(STORAGE_KEYS.API_MODE, mode);
  window.dispatchEvent(new Event('homedecor_mode_change'));
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; status: number }> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      credentials: 'same-origin',
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: json?.message || `Lỗi máy chủ (${response.status})`,
        status: response.status,
      };
    }

    return {
      data: json?.data ?? json,
      status: response.status,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ';
    return {
      error: msg,
      status: 503,
    };
  }
}

export { STORAGE_KEYS };
