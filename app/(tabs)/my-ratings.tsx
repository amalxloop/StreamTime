import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useRatingsStore } from '@/src/store/ratings';
import Colors from '@/constants/Colors';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w200';

export default function MyRatingsScreen() {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const ratings = useRatingsStore((s) => s.ratings);
  const removeRating = useRatingsStore((s) => s.removeRating);

  const getImageUrl = (rating: (typeof ratings)[0]) => {
    if (rating.source === 'tmdb' && rating.posterPath) {
      return `${TMDB_IMAGE_BASE}${rating.posterPath}`;
    }
    return rating.posterPath;
  };

  const handlePress = (rating: (typeof ratings)[0]) => {
    router.push(`/${rating.mediaType}/${rating.mediaId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {ratings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
            No ratings yet.{'\n'}Rate some movies, TV shows, or anime!
          </Text>
        </View>
      ) : (
        <FlatList
          data={ratings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => handlePress(item)}
            >
              <View style={styles.posterContainer}>
                {getImageUrl(item) ? (
                  <Image
                    source={getImageUrl(item)!}
                    style={styles.poster}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.posterPlaceholder, { backgroundColor: colors.cardBorder }]}>
                    <Text style={{ color: '#555' }}>?</Text>
                  </View>
                )}
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.rating}>{item.rating}/10</Text>
                  <Text style={styles.mediaType}>{item.mediaType}</Text>
                </View>
                {item.review && (
                  <Text style={styles.review} numberOfLines={2}>
                    "{item.review}"
                  </Text>
                )}
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => removeRating(item.id)}
                >
                  <Text style={styles.deleteText}>Remove</Text>
                </Pressable>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  posterContainer: {
    width: 80,
    height: 120,
  },
  poster: {
    width: 80,
    height: 120,
  },
  posterPlaceholder: {
    width: 80,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff6b35',
  },
  mediaType: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    backgroundColor: '#2a2a3e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  review: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
  deleteBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#3a1a1a',
  },
  deleteText: {
    fontSize: 11,
    color: '#ff4444',
    fontWeight: '600',
  },
});
