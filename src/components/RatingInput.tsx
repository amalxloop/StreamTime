import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import Colors from '@/constants/Colors';

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: 'small' | 'large';
}

export function RatingInput({ value, onChange, size = 'large' }: RatingInputProps) {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const isSmall = size === 'small';

  return (
    <View style={styles.container}>
      <View style={styles.sliderRow}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <Pressable
            key={num}
            onPress={() => onChange(num)}
            style={[
              styles.dot,
              isSmall && styles.dotSmall,
              { backgroundColor: colors.cardBorder, borderColor: colors.cardBorder },
              num <= value && { backgroundColor: colors.accent, borderColor: colors.accent },
              num === value && styles.dotSelected,
            ]}
          >
            <Text
              style={[
                styles.dotLabel,
                isSmall && styles.dotLabelSmall,
                num <= value && styles.dotLabelActive,
              ]}
            >
              {num}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.valueLabel, { color: colors.text }, isSmall && styles.valueLabelSmall]}>
        {value > 0 ? `${value}/10` : 'Tap to rate'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  sliderRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dotSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  dotSelected: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  dotLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
  },
  dotLabelSmall: {
    fontSize: 10,
  },
  dotLabelActive: {
    color: '#fff',
  },
  valueLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  valueLabelSmall: {
    fontSize: 13,
  },
});
