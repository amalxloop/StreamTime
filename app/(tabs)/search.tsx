import { useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { MediaCard } from '@/src/components/MediaCard';
import { searchMulti, searchMovies, searchTv, searchAnime } from '@/src/api';
import type { MediaItem, MediaType } from '@/src/api/types';
import Colors from '@/constants/Colors';

type TabType = 'all' | 'movies' | 'tv' | 'anime';

const TABS: { key: TabType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'movies', label: 'Movies' },
  { key: 'tv', label: 'TV' },
  { key: 'anime', label: 'Anime' },
];

export default function SearchScreen() {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(async (q: string, tab: TabType) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      let items: MediaItem[] = [];
      switch (tab) {
        case 'all':
          items = await searchMulti(q);
          break;
        case 'movies':
          items = await searchMovies(q);
          break;
        case 'tv':
          items = await searchTv(q);
          break;
        case 'anime':
          items = await searchAnime(q);
          break;
      }
      setResults(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const onQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(text, activeTab);
    }, 400);
  };

  const onTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (query.trim()) {
      handleSearch(query, tab);
    }
  };

  const handlePress = (item: MediaItem) => {
    router.push(`/${item.mediaType}/${item.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Search movies, TV shows, anime..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={onQueryChange}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              { backgroundColor: colors.cardBorder },
              activeTab === tab.key && { backgroundColor: colors.tint },
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.source}-${item.mediaType}-${item.id}`}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <MediaCard item={item} onPress={handlePress} compact />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ color: '#666', fontSize: 15 }}>
                {query.trim() ? 'No results found' : 'Search for something!'}
              </Text>
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
  searchBar: {
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabLabel: {
    color: '#888',
    fontWeight: '600',
    fontSize: 13,
  },
  tabLabelActive: {
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
  },
});
