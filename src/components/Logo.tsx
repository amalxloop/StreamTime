import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';

interface LogoProps {
  size?: number;
  showSubtitle?: boolean;
}

export function Logo({ size = 36, showSubtitle = true }: LogoProps) {
  const colorScheme = useAppTheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.monogram,
          {
            fontSize: size,
            color: isDark ? '#fff' : '#0f0f1a',
          },
        ]}
      >
        ST
      </Text>
      {showSubtitle && (
        <Text
          style={[
            styles.subtitle,
            {
              fontSize: size * 0.16,
              color: isDark ? '#888' : '#666',
            },
          ]}
        >
          STREAMTIME
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogram: {
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    fontWeight: '700',
    letterSpacing: 6,
    marginTop: 2,
  },
});
