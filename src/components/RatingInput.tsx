import { Pressable, StyleSheet, Text, View } from 'react-native';

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: 'small' | 'large';
}

export function RatingInput({ value, onChange, size = 'large' }: RatingInputProps) {
  const isSmall = size === 'small';

  return (
    <View style={styles.container}>
      <View style={[styles.row, isSmall && styles.rowSmall]}>
        {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => {
          const filled = num <= value;
          return (
            <Pressable
              key={num}
              onPress={() => onChange(num)}
              style={[
                styles.dot,
                isSmall && styles.dotSmall,
                filled && styles.dotFilled,
                num === value && styles.dotSelected,
                !filled && styles.dotEmpty,
              ]}
            >
              <Text
                style={[
                  styles.label,
                  isSmall && styles.labelSmall,
                  filled && styles.labelFilled,
                ]}
              >
                {num}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.valueLabel, isSmall && styles.valueLabelSmall]}>
        {value > 0 ? `${value}/5` : 'Tap to rate'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 5,
  },
  rowSmall: {
    gap: 3,
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotSmall: {
    width: 30,
    height: 30,
    borderRadius: 6,
  },
  dotEmpty: {
    backgroundColor: '#2a2a3e',
  },
  dotFilled: {
    backgroundColor: '#ff6b35',
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  dotSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  labelSmall: {
    fontSize: 11,
  },
  labelFilled: {
    color: '#fff',
  },
  valueLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
  },
  valueLabelSmall: {
    fontSize: 13,
  },
});
