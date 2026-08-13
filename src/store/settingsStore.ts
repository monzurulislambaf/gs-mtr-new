import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, APP_VERSION } from '@/utils/constants';

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsStore {
  theme: ThemeMode;
  autoSync: boolean;
  appVersion: string;
  loadSettings: () => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setAutoSync: (enabled: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: 'system',
  autoSync: true,
  appVersion: APP_VERSION,

  loadSettings: async () => {
    try {
      const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const parsed = settings ? JSON.parse(settings) : {};
      set({
        theme: (theme as ThemeMode) || 'system',
        autoSync: parsed.autoSync ?? true,
      });
    } catch {
      // defaults
    }
  },

  setTheme: async (theme) => {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    set({ theme });
  },

  setAutoSync: async (enabled) => {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ autoSync: enabled }));
    set({ autoSync: enabled });
  },
}));
