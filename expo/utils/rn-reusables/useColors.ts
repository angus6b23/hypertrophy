import { NAV_THEME } from './constants';
import { useColorScheme } from './useColorScheme';

export const useColors = () => {
  const { isDarkColorScheme } = useColorScheme();
  const theme = isDarkColorScheme ? 'dark' : 'light';
  return NAV_THEME[theme];
};
