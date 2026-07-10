import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useRatingsStore } from '@/src/store/ratings';
import { ShareCard } from '@/src/components/ShareCard';
import { generateShareCardImage } from '@/src/utils/drawShareCard';
import Colors from '@/constants/Colors';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w200';

export default function MyRatingsScreen() {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const ratings = useRatingsStore((s) => s.ratings);
  const removeRating = useRatingsStore((s) => s.removeRating);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const shareRef = useRef<ViewShot>(null);

  const getImageUrl = (rating: (typeof ratings)[0]) => {
    if (rating.source === 'tmdb' && rating.posterPath) {
      return `${TMDB_IMAGE_BASE}${rating.posterPath}`;
    }
    return rating.posterPath;
  };

  const handlePress = (rating: (typeof ratings)[0]) => {
    router.push(`/${rating.mediaType}/${rating.mediaId}`);
  };

  const handleShare = async (item: (typeof ratings)[0]) => {
    setSharingId(item.id);
    try {
      if (Platform.OS === 'web') {
        const blob = await generateShareCardImage({
          title: item.title,
          rating: item.rating,
          review: item.review,
          posterPath: item.posterPath,
          mediaType: item.mediaType,
          source: item.source,
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}_${item.rating}_10.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alert.alert('Image Downloaded', 'Share the downloaded image anywhere!');
        return;
      }

      await new Promise((r) => requestAnimationFrame(r));
      const uri = await shareRef.current?.capture();
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Share your ${item.title} rating`,
        });
        return;
      }

      await Share.share({
        message: `I rated ${item.title} ${item.rating}/5 on StreamTime!`,
      });
    } catch {
      const fallbackMsg = `I rated ${item.title} ${item.rating}/5 on StreamTime!`;
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(fallbackMsg);
        Alert.alert('Copied!', 'Rating copied to clipboard.');
      } else {
        await Share.share({ message: fallbackMsg });
      }
    } finally {
      setSharingId(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {ratings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
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
              <View style={styles.cardContent}>
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
                  <Text style={styles.mediaType}>
                    {item.mediaType === 'movie' ? 'MOVIE' : item.mediaType === 'tv' ? 'TV' : 'ANIME'}
                  </Text>
                  <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingNumber}>{item.rating}</Text>
                    <Text style={styles.ratingSlash}>/5</Text>
                  </View>
                  {item.review && (
                    <Text style={styles.review} numberOfLines={2}>
                      "{item.review}"
                    </Text>
                  )}
                  <View style={styles.actions}>
                    <Pressable
                      style={[styles.actionBtn, { backgroundColor: '#3a1a1a' }]}
                      onPress={() => handleShare(item)}
                    >
                      {sharingId === item.id ? (
                        <ActivityIndicator size="small" color="#ff6b35" />
                      ) : (
                        <Text style={styles.shareText}>Share</Text>
                      )}
                    </Pressable>
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() => removeRating(item.id)}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}

      {Platform.OS !== 'web' && sharingId && (() => {
        const item = ratings.find((r) => r.id === sharingId);
        if (!item) return null;
        return (
          <View style={styles.shareCapture}>
            <ViewShot ref={shareRef} options={{ format: 'png', quality: 1 }}>
              <ShareCard
                title={item.title}
                rating={item.rating}
                review={item.review}
                posterPath={item.posterPath}
                mediaType={item.mediaType}
                source={item.source}
              />
            </ViewShot>
          </View>
        );
      })()}
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
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  posterContainer: {
    width: 100,
    height: 150,
  },
  poster: {
    width: 100,
    height: 150,
  },
  posterPlaceholder: {
    width: 100,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  mediaType: {
    fontSize: 9,
    color: '#ff6b35',
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ff6b35',
    lineHeight: 28,
    fontVariant: ['tabular-nums'],
  },
  ratingSlash: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
    marginBottom: 1,
  },
  review: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shareText: {
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: '600',
  },
  removeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeText: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: '600',
  },
  shareCapture: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
});
