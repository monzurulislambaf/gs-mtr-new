import { Platform } from 'react-native';

const ExpoSecureStore = (() => {
  try {
    return require('expo-secure-store');
  } catch { return null; }
})();

if (ExpoSecureStore) {
  const mod = ExpoSecureStore;
  const ns = mod.default || mod;
  if (ns && typeof ns.setValueWithKeyAsync !== 'function') {
    if (typeof mod.setItemAsync === 'function') {
      ns.setValueWithKeyAsync = (value: string, key: string, options?: any) =>
        mod.setItemAsync(key, value, options);
      ns.getValueWithKeyAsync = (key: string, options?: any) =>
        mod.getItemAsync(key, options);
      ns.deleteValueWithKeyAsync = (key: string, options?: any) =>
        mod.deleteItemAsync(key, options);
    }
  }
  if (typeof mod.setValueWithKeyAsync !== 'function') {
    mod.setValueWithKeyAsync = ns.setValueWithKeyAsync;
    mod.getValueWithKeyAsync = ns.getValueWithKeyAsync;
  }
}
