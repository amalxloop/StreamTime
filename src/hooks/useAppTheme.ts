import { useColorScheme } from '@/components/useColorScheme';
import { useThemeStore } from '@/src/store/theme';

export function useAppTheme(): 'light' | 'dark' {
  const storedMode = useThemeStore((s) => s.mode);
  return storedMode;
}
