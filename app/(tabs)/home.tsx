import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { MediaCard } from '@/src/components/MediaCard';
import { Logo } from '@/src/components/Logo';
import { getTrendingMovies, getTrendingTv, getTopAnime } from '@/src/api';
import type { MediaItem } from '@/src/api/types';
import Colors from '@/constants/Colors';

export default function HomeScreen() {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [tvShows, setTvShows] = useState<MediaItem[]>([]);
  const [anime, setAnime] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTrendingMovies(),
      getTrendingTv(),
      getTopAnime(),
    ])
      .then(([moviesData, tvData, animeData]) => {
        setMovies(moviesData.items.slice(0, 10));
        setTvShows(tvData.items.slice(0, 10));
        setAnime(animeData.items.slice(0, 10));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePress = (item: MediaItem) => {
    router.push(`/${item.mediaType}/${item.id}`);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.logoSection}>
        <Logo size={40} showSubtitle />
      </View>

      <SectionHeader
        title="Trending Movies"
        onSeeAll={() => router.push('/category/movies')}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {movies.map((item) => (
          <MediaCard key={`movie-${item.id}`} item={item} onPress={handlePress} />
        ))}
      </ScrollView>

      <SectionHeader
        title="Trending TV Shows"
        onSeeAll={() => router.push('/category/tv')}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {tvShows.map((item) => (
          <MediaCard key={`tv-${item.id}`} item={item} onPress={handlePress} />
        ))}
      </ScrollView>

      <SectionHeader
        title="Top Anime"
        onSeeAll={() => router.push('/category/anime')}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {anime.map((item) => (
          <MediaCard key={`anime-${item.id}`} item={item} onPress={handlePress} />
        ))}
      </ScrollView>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Pressable onPress={onSeeAll} style={styles.seeAllBtn}>
        <Text style={{ color: colors.tint, fontWeight: '600', fontSize: 13 }}>See All</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.tint} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  row: {
    paddingLeft: 16,
  },
});
