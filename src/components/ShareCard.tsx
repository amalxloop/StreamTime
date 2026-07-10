import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from './Logo';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface ShareCardProps {
  title: string;
  rating: number;
  review: string | null;
  posterPath: string | null;
  mediaType: string;
  source: string;
}

export function ShareCard({ title, rating, review, posterPath, mediaType, source }: ShareCardProps) {
  const imageUrl = source === 'tmdb' && posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : posterPath;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0f1a', '#1a1a2e']} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.topSection}>
            <Logo size={20} showSubtitle={false} />
            <Text style={styles.streamtimeLabel}>STREAMTIME</Text>
          </View>

          <View style={styles.mainSection}>
            {imageUrl && (
              <Image source={imageUrl} style={styles.poster} contentFit="cover" />
            )}

            <View style={styles.textSection}>
              <Text style={styles.mediaType}>{mediaType.toUpperCase()}</Text>
              <Text style={styles.title} numberOfLines={2}>{title}</Text>

              <View style={styles.ratingSection}>
                <View style={styles.ratingBadge}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const filled = i + 1 <= rating;
                    const isSelected = i + 1 === rating;
                    return (
                      <Text
                        key={i}
                        style={[
                          styles.star,
                          filled && styles.starFilled,
                          isSelected && styles.starBorder,
                        ]}
                      >
                        {i + 1}
                      </Text>
                    );
                  })}
                </View>
                <Text style={styles.ratingText}>{rating}/5</Text>
              </View>

              {review && (
                <Text style={styles.review} numberOfLines={3}>"{review}"</Text>
              )}
            </View>
          </View>

          <Text style={styles.footer}>Shared from StreamTime</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 400,
    height: 500,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streamtimeLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  mainSection: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    flex: 1,
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  textSection: {
    flex: 1,
    gap: 8,
  },
  mediaType: {
    fontSize: 10,
    color: '#ff6b35',
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    backgroundColor: '#2a2a3e',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    overflow: 'hidden',
    textAlignVertical: 'center',
  },
  starFilled: {
    color: '#fff',
    backgroundColor: '#ff6b35',
  },
  starBorder: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#aaa',
    fontVariant: ['tabular-nums'],
  },
  review: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 4,
  },
  footer: {
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    letterSpacing: 1,
  },
});
