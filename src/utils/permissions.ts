import { Platform } from 'react-native';
import * as ExpoClipboard from 'expo-clipboard';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await ExpoClipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}

export async function getClipboard(): Promise<string> {
  try {
    return await ExpoClipboard.getStringAsync();
  } catch {
    return '';
  }
}

export function makePhoneCall(phoneNumber: string): void {
  const phone = phoneNumber.replace(/[^\d+]/g, '');
  const url = Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`;
  const { Linking } = require('react-native');
  Linking.openURL(url).catch(() => {});
}
