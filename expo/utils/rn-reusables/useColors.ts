import { NAV_THEME } from './constants';
import { useColorScheme } from './useColorScheme';
import convert from 'color-convert';

type Theme = (typeof NAV_THEME)['light'];
export const useColors = (hex = false) => {
  const { isDarkColorScheme } = useColorScheme();
  const theme = isDarkColorScheme ? 'dark' : 'light';
  if (hex) {
    const scheme = NAV_THEME[theme];
    const hexScheme: Theme = {};
    for (const key in scheme) {
      type Key = keyof typeof scheme;
      const hsl: string[] = scheme[key as Key]
        .replace(/^hsl\(/, '')
        .replace(/\)$/, '')
        .replaceAll('%', '')
        .split(' ');
      hexScheme[key as Key] =
        '#' + convert.hsl.hex([Number(hsl[0]), Number(hsl[1]), Number(hsl[2])]);
    }
    return hexScheme as Theme;
  }
  return NAV_THEME[theme];
};
