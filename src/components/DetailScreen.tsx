import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { RatingInput } from '@/src/components/RatingInput';
import { ReviewModal } from '@/src/components/ReviewModal';
import { ShareCard } from '@/src/components/ShareCard';
import { generateShareCardImage } from '@/src/utils/drawShareCard';
import { useRatingsStore } from '@/src/store/ratings';
import { getMovieDetails, getTvDetails, getAnimeDetails } from '@/src/api';
import type { MediaDetails, MediaType, SourceType } from '@/src/api/types';
import Colors from '@/constants/Colors';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

interface DetailScreenProps {
  mediaType: MediaType;
  source: SourceType;
  fetchDetails: (id: number) => Promise<MediaDetails>;
}

export function DetailScreen({ mediaType, source, fetchDetails }: DetailScreenProps) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [sharing, setSharing] = useState(false);
  const shareRef = useRef<ViewShot>(null);

  const userRating = useRatingsStore((s) =>
    s.getRatingForMedia(Number(id), mediaType),
  );
  const addRating = useRatingsStore((s) => s.addRating);

  useEffect(() => {
    if (!id) return;
    fetchDetails(Number(id))
      .then(setDetails)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (details) {
      navigation.setOptions({ title: details.title });
    }
  }, [details, navigation]);

  const getPosterUrl = () => {
    if (source === 'tmdb' && details?.posterPath) {
      return `${TMDB_IMAGE_BASE}${details.posterPath}`;
    }
    return details?.posterPath;
  };

  const getBackdropUrl = () => {
    if (source === 'tmdb' && details?.backdropPath) {
      return `${TMDB_BACKDROP_BASE}${details.backdropPath}`;
    }
    return details?.backdropPath;
  };

  const handleSaveReview = (rating: number, review: string | null) => {
    if (!details) return;
    addRating(
      details.id,
      mediaType,
      source,
      details.title,
      details.posterPath,
      details.overview,
      rating,
      review,
    );
    setShowReview(false);
  };

  const handleShare = async () => {
    if (!details || !userRating) return;
    setSharing(true);
    try {
      if (Platform.OS === 'web') {
        const blob = await generateShareCardImage({
          title: details.title,
          rating: userRating.rating,
          review: userRating.review,
          posterPath: details.posterPath,
          mediaType,
          source,
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${details.title.replace(/[^a-zA-Z0-9]/g, '_')}_${userRating.rating}_10.png`;
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
          dialogTitle: `Share your ${details.title} rating`,
        });
        return;
      }

      await Share.share({
        message: `I rated ${details.title} ${userRating.rating}/10 on StreamTime!`,
      });
    } catch {
      const fallbackMsg = `I rated ${details.title} ${userRating.rating}/10 on StreamTime!`;
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(fallbackMsg);
        Alert.alert('Copied!', 'Rating text copied to clipboard.');
      } else {
        await Share.share({ message: fallbackMsg });
      }
    } finally {
      setSharing(false);
    }
  };

  if (loading || !details) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  const backdropUrl = getBackdropUrl();
  const ratingColor = details.voteAverage >= 7 ? '#4caf50' : details.voteAverage >= 5 ? '#ff9800' : '#f44336';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {backdropUrl ? (
        <Image source={backdropUrl} style={styles.backdrop} contentFit="cover" />
      ) : (
        <View style={[styles.backdropPlaceholder, { backgroundColor: colors.card }]} />
      )}

      <View style={styles.mainSection}>
        <View style={styles.posterRow}>
          <View style={styles.posterContainer}>
            {getPosterUrl() ? (
              <Image source={getPosterUrl()!} style={styles.poster} contentFit="cover" />
            ) : (
              <View style={[styles.posterPlaceholder, { backgroundColor: colors.cardBorder }]}>
                <Text style={{ color: '#555', fontSize: 24 }}>?</Text>
              </View>
            )}
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.mediaTypeBadge}>{mediaType.toUpperCase()}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{details.title}</Text>
            {details.tagline && (
              <Text style={styles.tagline}>{details.tagline}</Text>
            )}
            <View style={styles.metaRow}>
              {details.releaseDate && (
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>{details.releaseDate.slice(0, 4)}</Text>
                </View>
              )}
              {details.runtime && (
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>{details.runtime}m</Text>
                </View>
              )}
              <View style={[styles.metaChip, { backgroundColor: ratingColor }]}>
                <Text style={styles.metaText}>★ {details.voteAverage.toFixed(1)}</Text>
              </View>
            </View>
            <View style={styles.genresRow}>
              {details.genres.map((g) => (
                <View key={g.id} style={[styles.genreChip, { backgroundColor: colors.cardBorder }]}>
                  <Text style={[styles.genreLabel, { color: '#aaa' }]}>{g.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <Text style={[styles.overview, { color: colors.text }]}>
            {details.overview || 'No synopsis available.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Rating</Text>

          <View style={[styles.ratingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {userRating && (
              <View style={styles.userRatingHeader}>
                <View style={styles.userRatingBadge}>
                  <Text style={styles.userRatingNumber}>{userRating.rating}</Text>
                  <Text style={styles.userRatingSlash}>/10</Text>
                </View>
                {userRating.review && (
                  <Text style={styles.userRatingReview}>"{userRating.review}"</Text>
                )}
              </View>
            )}
            <RatingInput
              value={userRating?.rating ?? 0}
              onChange={() => {}}
              size="small"
            />
            <View style={styles.ratingActions}>
              <Pressable
                style={[styles.rateBtn, { backgroundColor: colors.tint }]}
                onPress={() => setShowReview(true)}
              >
                <Text style={styles.rateBtnText}>
                  {userRating ? 'Edit' : 'Rate & Review'}
                </Text>
              </Pressable>
              {userRating && (
                <Pressable
                  style={[styles.shareBtn, { borderColor: colors.tint }]}
                  onPress={handleShare}
                  disabled={sharing}
                >
                  {sharing ? (
                    <ActivityIndicator size="small" color={colors.tint} />
                  ) : (
                    <Text style={[styles.shareBtnText, { color: colors.tint }]}>Share</Text>
                  )}
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>

      {Platform.OS !== 'web' && (
        <View style={styles.shareCapture}>
          <ViewShot ref={shareRef} options={{ format: 'png', quality: 1 }}>
            <ShareCard
              title={details.title}
              rating={userRating?.rating ?? 0}
              review={userRating?.review ?? null}
              posterPath={details.posterPath}
              mediaType={mediaType}
              source={source}
            />
          </ViewShot>
        </View>
      )}

      <ReviewModal
        visible={showReview}
        onClose={() => setShowReview(false)}
        onSave={handleSaveReview}
        initialRating={userRating?.rating ?? 0}
        initialReview={userRating?.review ?? null}
        title={`Rate ${details.title}`}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    width: '100%',
    height: 220,
  },
  backdropPlaceholder: {
    width: '100%',
    height: 120,
  },
  mainSection: {
    paddingHorizontal: 16,
    marginTop: -40,
  },
  posterRow: {
    flexDirection: 'row',
    gap: 16,
  },
  posterContainer: {
    width: 120,
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  poster: {
    width: 120,
    height: 180,
  },
  posterPlaceholder: {
    width: 120,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
    paddingTop: 8,
    gap: 6,
  },
  mediaTypeBadge: {
    fontSize: 10,
    color: '#ff6b35',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  tagline: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  metaChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#2a2a3e',
  },
  metaText: {
    fontSize: 11,
    color: '#ccc',
    fontWeight: '600',
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  genreChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  genreLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  overview: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.85,
  },
  ratingCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  userRatingHeader: {
    alignItems: 'center',
    gap: 8,
  },
  userRatingBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  userRatingNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ff6b35',
    lineHeight: 44,
    fontVariant: ['tabular-nums'],
  },
  userRatingSlash: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
    marginBottom: 2,
  },
  userRatingReview: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  ratingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rateBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  rateBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  shareBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  shareCapture: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
});
