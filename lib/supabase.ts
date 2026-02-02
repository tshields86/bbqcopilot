import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Cookie domain for cross-subdomain auth (bbqcopilot.com and app.bbqcopilot.com)
const COOKIE_DOMAIN = '.bbqcopilot.com';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

// Cookie-based storage adapter for web (enables cross-subdomain auth)
const WebCookieAdapter = {
  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === key) {
        return decodeURIComponent(value);
      }
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof document === 'undefined') return;
    const isProduction =
      typeof window !== 'undefined' && window.location.hostname.endsWith('bbqcopilot.com');
    const domain = isProduction ? `; domain=${COOKIE_DOMAIN}` : '';
    const secure = isProduction ? '; Secure' : '';
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/${domain}; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  },
  removeItem: (key: string): void => {
    if (typeof document === 'undefined') return;
    const isProduction =
      typeof window !== 'undefined' && window.location.hostname.endsWith('bbqcopilot.com');
    const domain = isProduction ? `; domain=${COOKIE_DOMAIN}` : '';
    document.cookie = `${key}=; path=/${domain}; max-age=0`;
  },
};

// SecureStore adapter for native platforms (iOS/Android)
const NativeSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
  },
};

// Use cookies on web for cross-subdomain auth, SecureStore on native
const getStorageAdapter = () => {
  if (Platform.OS === 'web') {
    return WebCookieAdapter;
  }
  return NativeSecureStoreAdapter;
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
