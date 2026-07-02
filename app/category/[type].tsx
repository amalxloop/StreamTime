import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { MediaCard } from '@/src/components/MediaCard';
import { getTrendingMovies, getTrendingTv, getTopAnime } from '@/src/api';
import type { MediaItem } from '@/src/api/types';
import Colors from '@/constants/Colors';

const CATEGORY_CONFIG = {
  movies: { title: 'Trending Movies', fetcher: getTrendingMovies },
  tv: { title: 'Trending TV Shows', fetcher: getTrendingTv },
  anime: { title: 'Top Anime', fetcher: getTopAnime },
} as const;

type CategoryType = keyof typeof CATEGORY_CONFIG;

export default function CategoryScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const navigation = useNavigation();
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const config = CATEGORY_CONFIG[type as CategoryType];

  useLayoutEffect(() => {
    if (config) {
      navigation.setOptions({ title: config.title });
    }
  }, [type, config]);

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    if (!config) return;
    try {
      const result = await config.fetcher(pageNum);
      setItems((prev) => (append ? [...prev, ...result.items] : result.items));
      setHasMore(result.hasMore);
    } catch (err) {
      console.error(err);
    }
  }, [type]);

  useEffect(() => {
    setPage(1);
    setItems([]);
    setHasMore(true);
    setLoading(true);
    fetchPage(1, false).finally(() => setLoading(false));
  }, [type]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchPage(nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const handlePress = (item: MediaItem) => {
    router.push(`/${item.mediaType}/${item.id}`);
  };

  if (!config) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: '#666', fontSize: 16 }}>Category not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => `${item.source}-${item.mediaType}-${item.id}-${index}`}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <MediaCard item={item} onPress={handlePress} compact />
            </View>
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.tint} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ color: '#666', fontSize: 15 }}>Nothing found</Text>
            </View>
          }
        />
      )}
    </View>
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
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 20,
  },
});
