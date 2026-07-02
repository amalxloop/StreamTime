import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import type { MediaItem } from '../api/types';
import Colors from '@/constants/Colors';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface MediaCardProps {
  item: MediaItem;
  onPress: (item: MediaItem) => void;
  compact?: boolean;
}

export function MediaCard({ item, onPress, compact = false }: MediaCardProps) {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];

  const imageUrl = item.source === 'tmdb'
    ? item.posterPath ? `${TMDB_IMAGE_BASE}${item.posterPath}` : null
    : item.posterPath;

  return (
    <Pressable
      style={[styles.card, compact && styles.cardCompact]}
      onPress={() => onPress(item)}
    >
      <View style={[styles.imageContainer, compact && styles.imageContainerCompact]}>
        {imageUrl ? (
          <Image source={imageUrl} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.cardBorder }]}>
            <Text style={styles.placeholderText}>?</Text>
          </View>
        )}
        {item.voteAverage > 0 && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              {item.voteAverage.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.title, { color: colors.text }, compact && styles.titleCompact]} numberOfLines={2}>
        {item.title}
      </Text>
      {item.releaseDate && (
        <Text style={styles.year}>{item.releaseDate.slice(0, 4)}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    marginRight: 12,
    marginBottom: 16,
  },
  cardCompact: {
    width: 110,
    marginRight: 8,
  },
  imageContainer: {
    width: 140,
    height: 210,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageContainerCompact: {
    width: 110,
    height: 165,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: '#666',
  },
  ratingBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#ff6b35',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  titleCompact: {
    fontSize: 12,
  },
  year: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
});
