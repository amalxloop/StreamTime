import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Linking,
} from 'react-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useRatingsStore } from '@/src/store/ratings';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import Colors from '@/constants/Colors';

interface ImportSource {
  id: string;
  name: string;
  icon: string;
  description: string;
  supportedPlatforms: ('letterboxd' | 'tvtime')[];
}

const IMPORT_SOURCES: ImportSource[] = [
  {
    id: 'letterboxd',
    name: 'Letterboxd',
    icon: 'film',
    description: 'Import ratings from Letterboxd',
    supportedPlatforms: ['letterboxd'],
  },
  {
    id: 'tvtime',
    name: 'TV Time',
    icon: 'tv',
    description: 'Import ratings from TV Time',
    supportedPlatforms: ['tvtime'],
  },
];

export default function ImportScreen() {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const navigation = useNavigation();
  const [isImporting, setIsImporting] = useState(false);
  const ratings = useRatingsStore((s) => s.ratings);
  const clearRatings = useRatingsStore((s) => s.clearAll);

  useEffect(() => {
    navigation.setOptions({ title: 'Import Ratings' });
  }, [navigation]);

  const handleImportLetterboxd = async () => {
    setIsImporting(true);
    try {
      // TODO: Implement Letterboxd API integration
      // This would involve:
      // 1. Opening OAuth authentication
      // 2. Fetching user's ratings from Letterboxd API
      // 3. Converting Letterboxd data format to our format
      // 4. Storing in Zustand ratings store
      
      Alert.alert(
        'Letterboxd Import',
        'Letterboxd import integration is planned for a future update. This feature will allow you to seamlessly import your Letterboxd ratings into StreamTime.',
        [
          { text: 'OK', onPress: () => {} },
        ]
      );
    } catch (error) {
      console.error('Error importing from Letterboxd:', error);
      Alert.alert(
        'Import Error',
        'Failed to import ratings from Letterboxd. Please try again later.'
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportTVTime = async () => {
    setIsImporting(true);
    try {
      // TODO: Implement TV Time API integration
      // This would involve:
      // 1. Opening OAuth authentication
      // 2. Fetching user's ratings from TV Time API
      // 3. Converting TV Time data format to our format
      // 4. Storing in Zustand ratings store
      
      Alert.alert(
        'TV Time Import',
        'TV Time import integration is planned for a future update. This feature will allow you to seamlessly import your TV Time ratings into StreamTime.',
        [
          { text: 'OK', onPress: () => {} },
        ]
      );
    } catch (error) {
      console.error('Error importing from TV Time:', error);
      Alert.alert(
        'Import Error',
        'Failed to import ratings from TV Time. Please try again later.'
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportAll = () => {
    Alert.alert(
      'Import All Sources',
      'This will import ratings from all supported platforms (Letterboxd, TV Time) into StreamTime. Do you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import All',
          onPress: () => {
            handleImportLetterboxd();
            handleImportTVTime();
          },
        },
      ]
    );
  };

  const ImportButton = ({ source, onPress, isLoading }: {
    source: ImportSource;
    onPress: () => void;
    isLoading: boolean;
  }) => (
    <Pressable
      style={styles.importButton}
      onPress={onPress}
      disabled={isLoading}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
        <Ionicons
          name={source.icon as any}
          size={24}
          color={colors.tint}
        />
      </View>
      <View style={styles.importInfo}>
        <Text style={[styles.importTitle, { color: colors.text }]}>
          {source.name}
        </Text>
        <Text style={[styles.importDescription, { color: colors.text }]}>
          {source.description}
        </Text>
      </View>
      {isLoading && (
        <ActivityIndicator size="small" color={colors.tint} />
      )}
      {!isLoading && (
        <Ionicons name="chevron-forward" size={20} color={colors.tint} />
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {ratings.length > 0 && (
        <View style={styles.warningSection}>
          <Ionicons name="warning" size={20} color="#ff6b35" />
          <Text style={styles.warningText}>
            You already have ratings. Importing will add to your existing ratings or replace them?
          </Text>
          <Pressable
            style={styles.clearButton}
            onPress={() => {
              Alert.alert(
                'Clear Existing Ratings',
                'This will remove all your current ratings before importing. Are you sure?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear & Import',
                    onPress: () => {
                      clearRatings();
                      handleImportAll();
                    },
                    style: 'destructive',
                  },
                ]
              );
            }}
          >
            <Text style={styles.clearText}>Clear First</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.sectionTitleContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Supported Platforms
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
          Choose which service to import ratings from
        </Text>
      </View>

      <ScrollView style={styles.importList} showsVerticalScrollIndicator={false}>
        {IMPORT_SOURCES.map((source) => (
          <ImportButton
            key={source.id}
            source={source}
            onPress={source.id === 'letterboxd' ? handleImportLetterboxd : handleImportTVTime}
            isLoading={isImporting}
          />
        ))}

        <View style={styles.importAllSection}>
          <Pressable
            style={styles.importAllButton}
            onPress={handleImportAll}
            disabled={isImporting}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="download" size={24} color="#fff" />
            </View>
            <View style={styles.importInfo}>
              <Text style={[styles.importAllTitle, { color: '#fff' }]}>
                Import All Sources
              </Text>
              <Text style={[styles.importAllDescription, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                Import ratings from all supported services at once
              </Text>
            </View>
            {isImporting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            )}
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  sectionTitleContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  importList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3a3a4e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  importInfo: {
    flex: 1,
  },
  importTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  importDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a1a1a',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#ffa94d',
  },
  clearButton: {
    backgroundColor: '#2a2a3e',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 11,
    color: '#ff8e3c',
    fontWeight: '600',
  },
  importAllSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  importAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  importAllTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  importAllDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
