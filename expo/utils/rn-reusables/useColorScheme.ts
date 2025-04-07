import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { useColorScheme as useColorSchemeBase } from 'react-native';

import { useOptionStore } from '../stores/option-store';

type ColorSchemeName = 'dark' | 'light' | 'system';
export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativewindColorScheme();
  let storedTheme: string = useOptionStore((state) => state.theme);
  const systemColorScheme = useColorSchemeBase();
  if (storedTheme === 'system') {
    storedTheme = systemColorScheme as string;
  }

  return {
    colorScheme: (storedTheme ?? colorScheme ?? 'dark') as ColorSchemeName,
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
  };
}
