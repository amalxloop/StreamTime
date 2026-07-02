import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { RatingInput } from '@/src/components/RatingInput';
import { ReviewModal } from '@/src/components/ReviewModal';
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
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

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

  if (loading || !details) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  const backdropUrl = getBackdropUrl();

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
            <Text style={[styles.title, { color: colors.text }]}>{details.title}</Text>
            {details.tagline && (
              <Text style={styles.tagline}>{details.tagline}</Text>
            )}
            <View style={styles.metaRow}>
              {details.releaseDate && (
                <Text style={styles.meta}>{details.releaseDate.slice(0, 4)}</Text>
              )}
              {details.runtime && (
                <Text style={styles.meta}>{details.runtime}m</Text>
              )}
              <Text style={[styles.meta, { color: colors.text }]}>{mediaType}</Text>
            </View>
            <View style={styles.genresRow}>
              {details.genres.map((g) => (
                <View key={g.id} style={[styles.genreChip, { backgroundColor: colors.cardBorder }]}>
                  <Text style={styles.genreLabel}>{g.name}</Text>
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
          <RatingInput
            value={userRating?.rating ?? 0}
            onChange={() => {}}
            size="small"
          />
          <Pressable
            style={[styles.reviewBtn, { backgroundColor: colors.tint }]}
            onPress={() => setShowReview(true)}
          >
            <Text style={styles.reviewBtnText}>
              {userRating ? 'Edit Rating & Review' : 'Rate & Review'}
            </Text>
          </Pressable>
          {userRating?.review && (
            <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={styles.reviewCardLabel}>Your Review</Text>
              <Text style={[styles.reviewCardText, { color: colors.text }]}>
                "{userRating.review}"
              </Text>
            </View>
          )}
        </View>
      </View>

      <ReviewModal
        visible={showReview}
        onClose={() => setShowReview(false)}
        onSave={handleSaveReview}
        initialRating={userRating?.rating ?? 0}
        initialReview={userRating?.review ?? null}
        title={`Rate ${details.title}`}
      />
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
    borderRadius: 8,
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
    gap: 10,
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    color: '#aaa',
    backgroundColor: '#2a2a3e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  genreChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  genreLabel: {
    fontSize: 11,
    color: '#aaa',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  overview: {
    fontSize: 14,
    lineHeight: 22,
  },
  reviewBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  reviewBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  reviewCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  reviewCardLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  reviewCardText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
