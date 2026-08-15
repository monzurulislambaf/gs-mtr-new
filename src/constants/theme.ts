import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { useFonts } from 'expo-font';
import { useColorScheme } from 'react-native';
import {
  Oswald_400Regular,
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';
import { useSettingsStore } from '@/store/settingsStore';

const fontConfig = {
  default: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
  displayLarge: {
    fontFamily: 'System',
    fontWeight: '700' as const,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelLarge: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
};

export const appFontAssets = {
  Oswald_400Regular,
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
};

/** Loads the bundled Oswald display font. Never blocks rendering. */
export function useAppFonts(): { loaded: boolean } {
  const [loaded, error] = useFonts(appFontAssets);
  return { loaded: loaded && !error };
}

/** Resolves the light/dark/system theme setting to a concrete mode. */
export function useIsDark(): boolean {
  const themeSetting = useSettingsStore((s) => s.theme);
  const systemScheme = useColorScheme();
  if (themeSetting === 'system') return systemScheme === 'dark';
  return themeSetting === 'dark';
}

/**
 * Oswald config for the auth screens' military-styled headings. Body and
 * input roles stay on the System font for readability.
 */
const oswaldConfig = {
  default: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
  displayLarge: {
    fontFamily: 'Oswald_700Bold',
    fontWeight: '700' as const,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: 'Oswald_700Bold',
    fontWeight: '700' as const,
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: 'Oswald_700Bold',
    fontWeight: '700' as const,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: 'Oswald_600SemiBold',
    fontWeight: '600' as const,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: 'Oswald_600SemiBold',
    fontWeight: '600' as const,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: 'Oswald_600SemiBold',
    fontWeight: '600' as const,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily: 'Oswald_600SemiBold',
    fontWeight: '600' as const,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  titleMedium: {
    fontFamily: 'Oswald_500Medium',
    fontWeight: '500' as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  titleSmall: {
    fontFamily: 'Oswald_500Medium',
    fontWeight: '500' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  labelLarge: {
    fontFamily: 'Oswald_600SemiBold',
    fontWeight: '600' as const,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.8,
  },
  labelMedium: {
    fontFamily: 'Oswald_500Medium',
    fontWeight: '500' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  labelSmall: {
    fontFamily: 'Oswald_500Medium',
    fontWeight: '500' as const,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
};

/** Builds the app theme, swapping display type to Oswald once fonts load. */
export function createAppTheme(isDark: boolean, useOswald: boolean): MD3Theme {
  const base = isDark ? DarkTheme : LightTheme;
  return {
    ...base,
    fonts: configureFonts({ config: useOswald ? oswaldConfig : fontConfig }),
  };
}

export const LightTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#44EBD3',
    onPrimary: '#005D58',
    primaryContainer: '#CFF6EF',
    onPrimaryContainer: '#003F3B',
    secondary: '#F9CBE5',
    onSecondary: '#A0004A',
    secondaryContainer: '#FCDDEF',
    onSecondaryContainer: '#A0004A',
    tertiary: '#FFD6A7',
    onTertiary: '#9F2D00',
    tertiaryContainer: '#FFE9CF',
    onTertiaryContainer: '#9F2D00',
    background: '#FAF7F5',
    onBackground: '#291334',
    surface: '#FFFFFF',
    onSurface: '#291334',
    surfaceVariant: '#EFEAE6',
    onSurfaceVariant: '#5A4A64',
    outline: '#E7E2DF',
    outlineVariant: '#EFEAE6',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#EFEAE6',
      level3: '#E7E2DF',
      level4: '#E0DAD6',
      level5: '#D6CFCB',
    },
    error: '#FE1C55',
    errorContainer: '#FDE2E8',
    onError: '#FFFFFF',
    onErrorContainer: '#4D0218',
    inverseSurface: '#3A2A45',
    inverseOnSurface: '#F3ECF5',
    inversePrimary: '#7FF0E0',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};

export const DarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#7FF0E0',
    onPrimary: '#003B37',
    primaryContainer: '#005D58',
    onPrimaryContainer: '#7FF0E0',
    secondary: '#F9CBE5',
    onSecondary: '#A0004A',
    secondaryContainer: '#5A1D3A',
    onSecondaryContainer: '#F9CBE5',
    tertiary: '#FFD6A7',
    onTertiary: '#7A2200',
    tertiaryContainer: '#9F2D00',
    onTertiaryContainer: '#FFD6A7',
    background: '#1A1519',
    onBackground: '#FAF7F5',
    surface: '#261E22',
    onSurface: '#FAF7F5',
    surfaceVariant: '#362D33',
    onSurfaceVariant: '#C9C0CB',
    outline: '#5A4A64',
    outlineVariant: '#362D33',
    elevation: {
      level0: 'transparent',
      level1: '#261E22',
      level2: '#2D252B',
      level3: '#352C34',
      level4: '#3D333B',
      level5: '#453943',
    },
    error: '#FE5C82',
    errorContainer: '#4D0218',
    onError: '#FFFFFF',
    onErrorContainer: '#FDE2E8',
    inverseSurface: '#FAF7F5',
    inverseOnSurface: '#291334',
    inversePrimary: '#44EBD3',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.7)',
  },
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};
