import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { MediaItem } from '../api/types';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface MediaCardProps {
  item: MediaItem;
  onPress: (item: MediaItem) => void;
  compact?: boolean;
}

export function MediaCard({ item, onPress, compact = false }: MediaCardProps) {
  const imageUrl = item.source === 'tmdb'
    ? item.posterPath ? `${TMDB_IMAGE_BASE}${item.posterPath}` : null
    : item.posterPath;

  const ratingColor = item.voteAverage >= 7 ? '#4caf50' : item.voteAverage >= 5 ? '#ff9800' : '#f44336';

  return (
    <Pressable
      style={[styles.card, compact && styles.cardCompact]}
      onPress={() => onPress(item)}
    >
      <View style={[styles.imageContainer, compact && styles.imageContainerCompact]}>
        {imageUrl ? (
          <Image source={imageUrl} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>?</Text>
          </View>
        )}
        {item.voteAverage > 0 && (
          <View style={[styles.badge, { backgroundColor: ratingColor }]}>
            <Text style={styles.badgeText}>
              ★ {item.voteAverage.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={2}>
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
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
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
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: '#444',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e0e0e0',
    marginTop: 8,
  },
  titleCompact: {
    fontSize: 12,
  },
  year: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
});
