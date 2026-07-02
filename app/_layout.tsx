import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useThemeStore } from '@/src/store/theme';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const themeMode = useThemeStore((s) => s.mode);

  return (
    <ThemeProvider value={themeMode === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="movie/[id]"
          options={{ headerShown: true, title: 'Movie', presentation: 'card' }}
        />
        <Stack.Screen
          name="tv/[id]"
          options={{ headerShown: true, title: 'TV Show', presentation: 'card' }}
        />
        <Stack.Screen
          name="anime/[id]"
          options={{ headerShown: true, title: 'Anime', presentation: 'card' }}
        />
        <Stack.Screen
          name="category/[type]"
          options={{ headerShown: true, title: 'Browse', presentation: 'card' }}
        />
      </Stack>
    </ThemeProvider>
  );
}
