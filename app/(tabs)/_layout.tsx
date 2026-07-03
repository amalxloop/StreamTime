import { Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useThemeStore } from '@/src/store/theme';
import { Logo } from '@/src/components/Logo';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useAppTheme();
  const toggleTheme = useThemeStore((s) => s.toggle);
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.cardBorder,
        },
        headerShown: useClientOnlyValue(false, true),
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerTitle: () => <Logo size={28} showSubtitle={false} />,
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
          headerRight: () => (
            <Pressable
              onPress={toggleTheme}
              style={{ marginRight: 16 }}
            >
              <Ionicons
                name={colorScheme === 'dark' ? 'sunny' : 'moon'}
                size={22}
                color={colors.text}
              />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-ratings"
        options={{
          title: 'My Ratings',
          tabBarIcon: ({ color }) => (
            <Ionicons name="star" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="import"
        options={{
          title: 'Import',
          tabBarIcon: ({ color }) => (
            <Ionicons name="download" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
